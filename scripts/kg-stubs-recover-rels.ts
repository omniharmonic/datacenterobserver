// Recovery: many agents proposed { target_slug: "berkshire-hathaway-energy" }
// without a target_name. The first apply pass skipped these because we
// couldn't auto-create the org without a name. This pass:
//   1. Collects all un-resolvable target_slugs across the 34 result files.
//   2. Creates organizations rows for them using slug-as-name fallback.
//   3. Re-inserts the previously-skipped org_relationships.

import { config as loadEnv } from 'dotenv';
import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

interface StubResult {
  slug: string;
  relationships?: Array<{
    target_slug?: string | null;
    target_name?: string | null;
    relationship?: string | null;
    description?: string | null;
    value_usd?: number | null;
    source_url?: string | null;
  }>;
}

const VALID_REL = new Set([
  'acquired', 'contracted_by', 'invests_in', 'joint_venture',
  'lobbies_for', 'owns', 'partners_with', 'subsidiary_of', 'supplies',
]);

function clean(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = String(s).trim();
  return t.length === 0 ? null : t;
}
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
}
function titleCaseFromSlug(slug: string): string {
  return slug.split('-').map((w) => w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)).join(' ');
}

function normalize(raw: unknown): StubResult[] {
  if (Array.isArray(raw)) return raw as StubResult[];
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.orgs)) return obj.orgs as StubResult[];
    if (Array.isArray(obj.results)) return obj.results as StubResult[];
  }
  return [];
}

async function main() {
  // Load existing orgs.
  const { data: orgsData } = await sb.from('organizations').select('slug, name').range(0, 9999);
  const orgSlugs = new Set((orgsData ?? []).map((o) => o.slug));
  const orgByNormName = new Map<string, string>();
  for (const o of orgsData ?? []) orgByNormName.set(slugify(o.name), o.slug);
  console.log(`Existing orgs: ${orgSlugs.size}`);

  // Load result files.
  const results: StubResult[] = [];
  for (let i = 0; i < 34; i++) {
    const path = `/tmp/kg-stub-result-${String(i).padStart(2, '0')}.json`;
    if (!existsSync(path)) continue;
    try {
      const raw = JSON.parse(readFileSync(path, 'utf8'));
      for (const r of normalize(raw)) if (r?.slug) results.push(r);
    } catch {}
  }
  console.log(`Loaded ${results.length} stub results`);

  // Collect target slugs that don't yet exist.
  const missingSlugs = new Map<string, string>(); // slug -> name (best-effort)
  for (const r of results) {
    for (const rel of r.relationships ?? []) {
      const ts = clean(rel.target_slug);
      if (!ts) continue;
      if (orgSlugs.has(ts)) continue;
      if (missingSlugs.has(ts)) continue;
      const tn = clean(rel.target_name) ?? titleCaseFromSlug(ts);
      missingSlugs.set(ts, tn);
    }
  }
  console.log(`Missing target orgs to create: ${missingSlugs.size}`);

  // Create them with type='other'.
  if (missingSlugs.size > 0) {
    const rows = [...missingSlugs.entries()].map(([slug, name]) => ({ slug, name, type: 'other' }));
    for (let i = 0; i < rows.length; i += 100) {
      const slice = rows.slice(i, i + 100);
      const { error } = await sb.from('organizations').upsert(slice, { onConflict: 'slug', ignoreDuplicates: true });
      if (error) console.warn(`  WARN orgs slice ${i}: ${error.message}`);
    }
    for (const [slug, name] of missingSlugs) {
      orgSlugs.add(slug);
      orgByNormName.set(slugify(name), slug);
    }
    console.log(`  created ${missingSlugs.size} orgs`);
  }

  // Load existing relationships for dedup.
  const existingRels = new Set<string>();
  {
    const { data } = await sb.from('org_relationships').select('source_slug, target_slug, relationship').range(0, 9999);
    for (const r of data ?? []) existingRels.add(`${r.source_slug}|${r.target_slug}|${r.relationship}`);
  }
  console.log(`Existing relationships: ${existingRels.size}`);

  // Build new relationships using the now-larger org set.
  const newRels: Array<{ source_slug: string; target_slug: string; relationship: string; description: string | null; value_usd: number | null; source_url: string | null }> = [];
  let invalid = 0;
  for (const r of results) {
    if (!orgSlugs.has(r.slug)) continue;
    for (const rel of r.relationships ?? []) {
      // Some agents used "type" instead of "relationship" as the field name.
      const rname = clean(rel.relationship) ?? clean((rel as Record<string, unknown>).type as string | null | undefined);
      if (!rname || !VALID_REL.has(rname)) { invalid++; continue; }
      let target = clean(rel.target_slug);
      if (!target || !orgSlugs.has(target)) {
        const tn = clean(rel.target_name);
        if (tn) target = orgByNormName.get(slugify(tn)) ?? null;
      }
      if (!target || !orgSlugs.has(target)) { invalid++; continue; }
      if (target === r.slug) continue;
      const key = `${r.slug}|${target}|${rname}`;
      if (existingRels.has(key)) continue;
      existingRels.add(key);
      const vu = typeof rel.value_usd === 'number' && Number.isFinite(rel.value_usd) && rel.value_usd > 0 ? Math.round(rel.value_usd) : null;
      newRels.push({
        source_slug: r.slug,
        target_slug: target,
        relationship: rname,
        description: clean(rel.description),
        value_usd: vu,
        source_url: clean(rel.source_url),
      });
    }
  }
  console.log(`New relationships to insert: ${newRels.length} (invalid: ${invalid})`);

  let inserted = 0, failed = 0;
  for (const rel of newRels) {
    const { error } = await sb.from('org_relationships').insert(rel);
    if (error) { failed++; if (failed < 10) console.warn(`  WARN ${rel.source_slug}->${rel.target_slug}: ${error.message}`); }
    else inserted++;
    if ((inserted + failed) % 200 === 0) process.stdout.write(`  ${inserted + failed}/${newRels.length}\r`);
  }
  console.log(`  inserted ${inserted}, failed ${failed}`);

  const { count: totalRels } = await sb.from('org_relationships').select('source_slug', { count: 'exact', head: true });
  const { count: totalOrgs } = await sb.from('organizations').select('slug', { count: 'exact', head: true });
  console.log(`\nFinal: ${totalOrgs} orgs, ${totalRels} org_relationships`);
}

main().catch((e) => { console.error(e); process.exit(1); });
