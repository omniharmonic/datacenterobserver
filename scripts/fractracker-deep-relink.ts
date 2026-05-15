// Recovery: pre-validate dc_slug and org_slug, then insert the missing links
// in small batches (so one bad row doesn't kill the whole slice).

import { config as loadEnv } from 'dotenv';
import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const VALID_RELATIONSHIPS = new Set([
  'constructs', 'develops', 'funds', 'joint_venture', 'lobbies_for',
  'operates', 'owns', 'partners_with', 'permits', 'supplies_energy',
]);

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
}

function clean(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = String(s).trim();
  return t.length === 0 ? null : t;
}

async function main() {
  // Build validation sets.
  const dcSlugs = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data } = await sb.from('data_centers').select('slug').range(from, from + 999);
    if (!data?.length) break;
    for (const r of data) dcSlugs.add(r.slug);
    if (data.length < 1000) break;
  }
  console.log(`Valid dc_slugs: ${dcSlugs.size}`);

  const orgsBySlug = new Map<string, string>();
  const orgByNormName = new Map<string, string>();
  {
    const { data } = await sb.from('organizations').select('slug, name').range(0, 9999);
    for (const o of data ?? []) {
      orgsBySlug.set(o.slug, o.slug);
      orgByNormName.set(slugify(o.name), o.slug);
    }
  }
  console.log(`Valid org_slugs: ${orgsBySlug.size}`);

  const existingLinks = new Set<string>();
  {
    const { data } = await sb.from('dc_organizations').select('dc_slug, org_slug, relationship').range(0, 9999);
    for (const l of data ?? []) existingLinks.add(`${l.dc_slug}|${l.org_slug}|${l.relationship}`);
  }
  console.log(`Existing links: ${existingLinks.size}`);

  // Parse the result files using the same normalizer as the apply script.
  function normalize(raw: unknown): Array<{ slug: string; linked_organizations?: Array<{ slug?: string; name?: string; relationship?: string }> }> {
    let arr: unknown[];
    if (Array.isArray(raw)) arr = raw;
    else if (raw && typeof raw === 'object' && Array.isArray((raw as { rows?: unknown }).rows)) {
      arr = (raw as { rows: unknown[] }).rows;
    } else return [];
    return arr
      .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
      .map((r) => ({
        slug: r.slug as string,
        linked_organizations: r.linked_organizations as Array<{ slug?: string; name?: string; relationship?: string }> | undefined,
      }))
      .filter((r) => r.slug);
  }

  const candidates: Array<{ dc_slug: string; org_slug: string; relationship: string }> = [];
  for (let i = 0; i < 50; i++) {
    const path = `/tmp/ft-deep-result-${String(i).padStart(2, '0')}.json`;
    if (!existsSync(path)) continue;
    const raw = JSON.parse(readFileSync(path, 'utf8'));
    for (const row of normalize(raw)) {
      if (!dcSlugs.has(row.slug)) continue; // dc_slug invalid
      for (const link of row.linked_organizations ?? []) {
        const rel = clean(link.relationship);
        if (!rel || !VALID_RELATIONSHIPS.has(rel)) continue;
        let orgSlug = clean(link.slug);
        if (!orgSlug || !orgsBySlug.has(orgSlug)) {
          const linkName = clean(link.name);
          if (!linkName) continue;
          orgSlug = orgByNormName.get(slugify(linkName)) ?? null;
        }
        if (!orgSlug || !orgsBySlug.has(orgSlug)) continue;
        const key = `${row.slug}|${orgSlug}|${rel}`;
        if (existingLinks.has(key)) continue;
        existingLinks.add(key);
        candidates.push({ dc_slug: row.slug, org_slug: orgSlug, relationship: rel });
      }
    }
  }
  console.log(`Validated new links to insert: ${candidates.length}`);

  // Insert one row at a time so any straggling FK violation only loses one row.
  let inserted = 0;
  let failed = 0;
  for (let i = 0; i < candidates.length; i += 1) {
    const { error } = await sb.from('dc_organizations').insert(candidates[i]);
    if (error) {
      failed++;
      if (failed < 10) console.warn(`  WARN ${candidates[i].dc_slug} -> ${candidates[i].org_slug} (${candidates[i].relationship}): ${error.message}`);
    } else {
      inserted++;
    }
    if ((inserted + failed) % 200 === 0) process.stdout.write(`  ${inserted + failed}/${candidates.length}\r`);
  }
  console.log(`  inserted: ${inserted}, failed: ${failed}`);

  const { count } = await sb.from('dc_organizations').select('dc_slug', { count: 'exact', head: true });
  console.log(`\nFinal dc_organizations link count: ${count}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
