// Merges /tmp/kg-stub-result-NN.json (34 files) and applies:
//   1. UPDATE organizations: description, website, headquarters, ticker,
//      estimated_lobbying_usd (only fill-in — never overwrite existing values).
//   2. INSERT org_relationships: source_slug=this org, target_slug (resolve from
//      name if needed; create new org row if no match), relationship, etc.
//      Skips duplicate (source, target, relationship) triples.

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
  description?: string | null;
  website?: string | null;
  headquarters?: string | null;
  ticker?: string | null;
  estimated_lobbying_usd?: number | null;
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

// Normalize a few common shapes used by agents — sometimes the file root is
// { orgs: [...] } or { orgs_reference: [...] } (the input shape), so dig.
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
  // Load all 34 result files.
  const results: StubResult[] = [];
  let parseErrors = 0;
  for (let i = 0; i < 34; i++) {
    const path = `/tmp/kg-stub-result-${String(i).padStart(2, '0')}.json`;
    if (!existsSync(path)) { console.warn(`  missing ${path}`); continue; }
    try {
      const raw = JSON.parse(readFileSync(path, 'utf8'));
      const rows = normalize(raw);
      if (rows.length === 0) { parseErrors++; console.warn(`  WARN ${path}: 0 rows`); continue; }
      for (const r of rows) if (r?.slug) results.push(r);
    } catch (e) {
      parseErrors++;
      console.warn(`  WARN ${path}: ${(e as Error).message}`);
    }
  }
  console.log(`Loaded ${results.length} stub results (parse errors: ${parseErrors})`);

  // ─── Step 1: pull current orgs (for "only fill in nulls" semantics) ───
  const { data: existingOrgsData } = await sb
    .from('organizations')
    .select('slug, name, type, description, website, headquarters, ticker, estimated_lobbying_usd')
    .range(0, 9999);
  const existingOrgs = new Map((existingOrgsData ?? []).map((o) => [o.slug, o]));
  const orgByNormName = new Map<string, string>();
  for (const o of existingOrgsData ?? []) orgByNormName.set(slugify(o.name), o.slug);
  console.log(`Existing orgs: ${existingOrgs.size}`);

  // ─── Step 2: update org fields (only fill nulls) ──────────────────────
  console.log('\n=== Updating organization fields ===');
  let updated = 0;
  const fieldCounts = { description: 0, website: 0, headquarters: 0, ticker: 0, estimated_lobbying_usd: 0 };
  for (const r of results) {
    const cur = existingOrgs.get(r.slug);
    if (!cur) continue;
    const patch: Record<string, unknown> = {};
    const desc = clean(r.description);
    if (desc && !cur.description) { patch.description = desc; fieldCounts.description++; }
    const web = clean(r.website);
    if (web && /^https?:\/\//.test(web) && !cur.website) { patch.website = web; fieldCounts.website++; }
    const hq = clean(r.headquarters);
    if (hq && !cur.headquarters) { patch.headquarters = hq; fieldCounts.headquarters++; }
    const tick = clean(r.ticker);
    if (tick && !cur.ticker) { patch.ticker = tick; fieldCounts.ticker++; }
    const lob = r.estimated_lobbying_usd;
    if (typeof lob === 'number' && Number.isFinite(lob) && lob > 0 && lob < 1e9 && !cur.estimated_lobbying_usd) {
      patch.estimated_lobbying_usd = Math.round(lob); fieldCounts.estimated_lobbying_usd++;
    }
    if (Object.keys(patch).length === 0) continue;
    const { error } = await sb.from('organizations').update(patch).eq('slug', r.slug);
    if (error) { console.warn(`  WARN ${r.slug}: ${error.message}`); continue; }
    updated++;
    if (updated % 100 === 0) process.stdout.write(`  ${updated} orgs updated\r`);
  }
  console.log(`  ${updated} orgs updated`);
  console.log(`  fields filled:`, fieldCounts);

  // ─── Step 3: collect new orgs proposed via target_name ────────────────
  const newOrgs = new Map<string, { slug: string; name: string; type: string }>();
  for (const r of results) {
    for (const rel of r.relationships ?? []) {
      const ts = clean(rel.target_slug);
      if (ts && existingOrgs.has(ts)) continue;
      const tn = clean(rel.target_name);
      if (!tn) continue;
      const norm = slugify(tn);
      if (orgByNormName.has(norm)) continue;
      if (newOrgs.has(norm)) continue;
      newOrgs.set(norm, { slug: norm, name: tn, type: 'other' });
    }
  }
  console.log(`\nNew target orgs to create: ${newOrgs.size}`);
  if (newOrgs.size) {
    const rows = [...newOrgs.values()];
    for (let i = 0; i < rows.length; i += 100) {
      const slice = rows.slice(i, i + 100);
      const { error } = await sb.from('organizations').upsert(slice, { onConflict: 'slug', ignoreDuplicates: true });
      if (error) console.warn(`  WARN inserting orgs slice ${i}: ${error.message}`);
    }
    for (const o of newOrgs.values()) {
      orgByNormName.set(o.slug, o.slug);
      existingOrgs.set(o.slug, { slug: o.slug, name: o.name, type: o.type, description: null, website: null, headquarters: null, ticker: null, estimated_lobbying_usd: null });
    }
  }

  // ─── Step 4: existing relationships for dedup ─────────────────────────
  const existingRels = new Set<string>();
  {
    const { data } = await sb.from('org_relationships').select('source_slug, target_slug, relationship').range(0, 9999);
    for (const r of data ?? []) existingRels.add(`${r.source_slug}|${r.target_slug}|${r.relationship}`);
  }
  console.log(`Existing org_relationships: ${existingRels.size}`);

  // ─── Step 5: build + insert new relationships ─────────────────────────
  const newRels: Array<{ source_slug: string; target_slug: string; relationship: string; description: string | null; value_usd: number | null; source_url: string | null }> = [];
  let invalidRels = 0;
  for (const r of results) {
    const sourceSlug = r.slug;
    if (!existingOrgs.has(sourceSlug)) continue;
    for (const rel of r.relationships ?? []) {
      const rname = clean(rel.relationship);
      if (!rname || !VALID_REL.has(rname)) { invalidRels++; continue; }
      let targetSlug = clean(rel.target_slug);
      if (!targetSlug || !existingOrgs.has(targetSlug)) {
        const tn = clean(rel.target_name);
        if (!tn) { invalidRels++; continue; }
        targetSlug = orgByNormName.get(slugify(tn)) ?? null;
      }
      if (!targetSlug || !existingOrgs.has(targetSlug)) { invalidRels++; continue; }
      if (sourceSlug === targetSlug) continue; // skip self-loops
      const key = `${sourceSlug}|${targetSlug}|${rname}`;
      if (existingRels.has(key)) continue;
      existingRels.add(key);
      const vu = typeof rel.value_usd === 'number' && Number.isFinite(rel.value_usd) && rel.value_usd > 0 ? Math.round(rel.value_usd) : null;
      newRels.push({
        source_slug: sourceSlug,
        target_slug: targetSlug,
        relationship: rname,
        description: clean(rel.description),
        value_usd: vu,
        source_url: clean(rel.source_url),
      });
    }
  }
  console.log(`\nNew org_relationships to insert: ${newRels.length} (invalid skipped: ${invalidRels})`);
  // Insert one at a time so a single FK error doesn't blow a whole batch.
  let inserted = 0;
  let failed = 0;
  for (const rel of newRels) {
    const { error } = await sb.from('org_relationships').insert(rel);
    if (error) {
      failed++;
      if (failed < 10) console.warn(`  WARN ${rel.source_slug} -> ${rel.target_slug}: ${error.message}`);
    } else {
      inserted++;
    }
    if ((inserted + failed) % 200 === 0) process.stdout.write(`  ${inserted + failed}/${newRels.length}\r`);
  }
  console.log(`  inserted ${inserted}, failed ${failed}`);

  // ─── Step 6: verify ───────────────────────────────────────────────────
  const { count: totalOrgs } = await sb.from('organizations').select('slug', { count: 'exact', head: true });
  const { count: totalRels } = await sb.from('org_relationships').select('source_slug', { count: 'exact', head: true });
  const { data: fully } = await sb.from('organizations').select('slug').not('description', 'is', null).not('website', 'is', null).range(0, 9999);
  console.log(`\nFinal state:`);
  console.log(`  organizations: ${totalOrgs}`);
  console.log(`  orgs with description+website: ${fully?.length}`);
  console.log(`  org_relationships: ${totalRels}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
