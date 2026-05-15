// Merges /tmp/ft-deep-result-NN.json (50 files) and applies:
//   1. Update data_centers fields where agents found new evidence.
//   2. Create new organizations rows for any operator/dev/etc. not already in the
//      orgs catalog (using fuzzy name match to avoid duplicates).
//   3. Insert dc_organizations links (idempotent — skip existing pairs).

import { config as loadEnv } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

interface AgentResult {
  id: string;
  slug: string;
  fields?: {
    developer?: string | null;
    address?: string | null;
    county?: string | null;
    zip?: string | null;
    footprint_acres?: number | null;
    water_usage_gpd?: number | null;
    energy_source?: string | null;
    estimated_cost_usd?: number | null;
    announced_date?: string | null;
    expected_completion?: string | null;
  };
  source_urls?: string[];
  linked_organizations?: Array<{
    slug?: string;
    name?: string;
    type?: string;
    relationship?: string;
  }>;
}

const VALID_ORG_TYPES = new Set([
  'tech_company', 'cloud_provider', 'developer', 'investor', 'pe_firm',
  'sovereign_wealth', 'construction', 'engineering', 'energy_utility',
  'lobbying_firm', 'consortium', 'government_body', 'federal', 'state',
  'local', 'other',
]);

const VALID_RELATIONSHIPS = new Set([
  'constructs', 'develops', 'funds', 'joint_venture', 'lobbies_for',
  'operates', 'owns', 'partners_with', 'permits', 'supplies_energy',
]);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function clean(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = String(s).trim();
  return t.length === 0 ? null : t;
}

function isReasonableNumber(n: unknown, max: number): number | null {
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0 || n > max) return null;
  return n;
}

// Some agents wrote `[{...}, ...]`, others wrote `{ rows: [{...}, ...] }`.
// And some flattened the field updates to the top of each row instead of
// nesting them under `fields`. Normalize both into AgentResult shape.
function normalize(raw: unknown): AgentResult[] {
  let arr: unknown[];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (raw && typeof raw === 'object' && Array.isArray((raw as { rows?: unknown }).rows)) {
    arr = (raw as { rows: unknown[] }).rows;
  } else {
    return [];
  }
  return arr
    .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
    .map((r) => {
      const out: AgentResult = {
        id: r.id as string,
        slug: r.slug as string,
        source_urls: Array.isArray(r.source_urls) ? (r.source_urls as string[]) : undefined,
        linked_organizations: Array.isArray(r.linked_organizations)
          ? (r.linked_organizations as AgentResult['linked_organizations'])
          : undefined,
      };
      if (r.fields && typeof r.fields === 'object') {
        out.fields = r.fields as AgentResult['fields'];
      } else {
        // Pick the fields off the top of the row.
        out.fields = {
          developer: r.developer as string | null | undefined,
          address: r.address as string | null | undefined,
          county: r.county as string | null | undefined,
          zip: r.zip as string | null | undefined,
          footprint_acres: r.footprint_acres as number | null | undefined,
          water_usage_gpd: r.water_usage_gpd as number | null | undefined,
          energy_source: r.energy_source as string | null | undefined,
          estimated_cost_usd: r.estimated_cost_usd as number | null | undefined,
          announced_date: r.announced_date as string | null | undefined,
          expected_completion: r.expected_completion as string | null | undefined,
        };
      }
      return out;
    })
    .filter((r) => r.id && r.slug);
}

const results: AgentResult[] = [];
let parseErrors = 0;
for (let i = 0; i < 50; i++) {
  const path = `/tmp/ft-deep-result-${String(i).padStart(2, '0')}.json`;
  if (!existsSync(path)) {
    console.warn(`  WARN missing: ${path}`);
    continue;
  }
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8'));
    const rows = normalize(raw);
    if (rows.length === 0) {
      console.warn(`  WARN ${path}: 0 rows after normalize`);
      parseErrors++;
      continue;
    }
    results.push(...rows);
  } catch (e) {
    parseErrors++;
    console.warn(`  WARN parse error ${path}: ${(e as Error).message}`);
  }
}
console.log(`Loaded ${results.length} agent results (${parseErrors} parse errors)`);

async function main() {
  // ─── Step 1: load existing orgs and build name→slug map ────────────────
  const { data: orgs } = await sb
    .from('organizations')
    .select('slug, name, type')
    .range(0, 9999);
  const orgsBySlug = new Map((orgs ?? []).map((o) => [o.slug, o]));
  const orgByNormName = new Map<string, string>(); // normalized name → slug
  for (const o of orgs ?? []) {
    orgByNormName.set(slugify(o.name), o.slug);
  }
  console.log(`Existing orgs: ${orgs?.length}`);

  // ─── Step 2: collect proposed new orgs, dedupe, create them ────────────
  const proposedNewOrgs = new Map<string, { name: string; type: string }>(); // slug → {name,type}
  for (const r of results) {
    for (const link of r.linked_organizations ?? []) {
      const linkSlug = clean(link.slug);
      if (linkSlug && orgsBySlug.has(linkSlug)) continue; // already exists
      const linkName = clean(link.name);
      if (!linkName) continue;
      const norm = slugify(linkName);
      if (orgByNormName.has(norm)) continue; // matches existing org by name
      if (proposedNewOrgs.has(norm)) continue; // already proposed
      const type = clean(link.type);
      if (!type || !VALID_ORG_TYPES.has(type)) continue;
      proposedNewOrgs.set(norm, { name: linkName, type });
    }
  }
  console.log(`New orgs to create: ${proposedNewOrgs.size}`);

  // Insert in chunks.
  if (proposedNewOrgs.size) {
    const newOrgRows = [...proposedNewOrgs.entries()].map(([slug, v]) => ({
      slug,
      name: v.name,
      type: v.type,
    }));
    for (let i = 0; i < newOrgRows.length; i += 100) {
      const slice = newOrgRows.slice(i, i + 100);
      // upsert ignores conflicts on the slug primary key (existing rows untouched).
      const { error } = await sb
        .from('organizations')
        .upsert(slice, { onConflict: 'slug', ignoreDuplicates: true });
      if (error) {
        console.warn(`  WARN upserting orgs (slice ${i}): ${error.message}`);
      }
    }
    // Reload so orgByNormName includes new ones.
    for (const [slug, v] of proposedNewOrgs) {
      orgByNormName.set(slug, slug);
      orgsBySlug.set(slug, { slug, name: v.name, type: v.type });
    }
  }

  // ─── Step 3: load existing dc_organizations links to avoid duplicates ──
  const existingLinks = new Set<string>(); // `${dc_slug}|${org_slug}|${rel}`
  {
    const { data } = await sb.from('dc_organizations').select('dc_slug, org_slug, relationship').range(0, 9999);
    for (const l of data ?? []) existingLinks.add(`${l.dc_slug}|${l.org_slug}|${l.relationship}`);
  }
  console.log(`Existing dc_organizations links: ${existingLinks.size}`);

  // ─── Step 4: apply DC field updates ────────────────────────────────────
  console.log('\n=== Updating data_centers fields ===');
  let updatedRows = 0;
  const fieldCounts = { developer: 0, address: 0, county: 0, zip: 0, footprint_acres: 0, water_usage_gpd: 0, energy_source: 0, estimated_cost_usd: 0, announced_date: 0, expected_completion: 0, source_urls: 0 };

  // Pull current rows to compare against (avoid no-op updates).
  const currentRows = new Map<string, { id: string; developer: string | null; address: string | null; county: string | null; zip: string | null; footprint_acres: number | null; water_usage_gpd: number | null; energy_source: string | null; estimated_cost_usd: number | null; announced_date: string | null; expected_completion: string | null; source_urls: string[] | null }>();
  const ids = results.map((r) => r.id);
  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);
    const { data, error } = await sb
      .from('data_centers')
      .select('id, developer, address, county, zip, footprint_acres, water_usage_gpd, energy_source, estimated_cost_usd, announced_date, expected_completion, source_urls')
      .in('id', slice);
    if (error) throw error;
    for (const r of data ?? []) currentRows.set(r.id, r);
  }

  for (const r of results) {
    const cur = currentRows.get(r.id);
    if (!cur) continue;
    const f = r.fields ?? {};
    const patch: Record<string, unknown> = {};

    const dev = clean(f.developer);
    if (dev && dev.toLowerCase() !== (cur.developer ?? '').toLowerCase()) {
      patch.developer = dev; fieldCounts.developer++;
    }
    const addr = clean(f.address);
    if (addr && addr.length > 5 && addr.toLowerCase() !== (cur.address ?? '').toLowerCase()) {
      patch.address = addr; fieldCounts.address++;
    }
    const county = clean(f.county);
    if (county && county.toLowerCase() !== (cur.county ?? '').toLowerCase()) {
      patch.county = county; fieldCounts.county++;
    }
    const zip = clean(f.zip);
    if (zip && /^\d{5}(-\d{4})?$/.test(zip) && zip !== cur.zip) {
      patch.zip = zip; fieldCounts.zip++;
    }
    const footprint = isReasonableNumber(f.footprint_acres, 100000);
    if (footprint && Math.round(footprint) !== cur.footprint_acres) {
      // Column is integer in the schema — round to nearest acre.
      patch.footprint_acres = Math.round(footprint); fieldCounts.footprint_acres++;
    }
    const water = isReasonableNumber(f.water_usage_gpd, 100_000_000);
    if (water != null && water !== cur.water_usage_gpd) {
      patch.water_usage_gpd = Math.round(water); fieldCounts.water_usage_gpd++;
    } else if (f.water_usage_gpd === 0 && cur.water_usage_gpd !== 0) {
      // Explicit zero = waterless cooling, store it.
      patch.water_usage_gpd = 0; fieldCounts.water_usage_gpd++;
    }
    const energy = clean(f.energy_source);
    if (energy && energy.length < 300 && energy !== cur.energy_source) {
      patch.energy_source = energy; fieldCounts.energy_source++;
    }
    const cost = isReasonableNumber(f.estimated_cost_usd, 500_000_000_000);
    if (cost && cost !== cur.estimated_cost_usd) {
      patch.estimated_cost_usd = Math.round(cost); fieldCounts.estimated_cost_usd++;
    }
    const announced = clean(f.announced_date);
    if (announced && /^\d{4}(-\d{2})?$/.test(announced) && announced !== cur.announced_date) {
      patch.announced_date = announced; fieldCounts.announced_date++;
    }
    const completion = clean(f.expected_completion);
    if (completion && /^\d{4}(-\d{2})?$/.test(completion) && completion !== cur.expected_completion) {
      patch.expected_completion = completion; fieldCounts.expected_completion++;
    }

    // Source URLs: merge new with any existing, dedupe, validate URLs, cap at 8.
    const urls = (r.source_urls ?? [])
      .filter((u) => typeof u === 'string')
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\/\S+$/.test(u));
    if (urls.length > 0) {
      const merged = [...new Set([...(cur.source_urls ?? []), ...urls])].slice(0, 8);
      if (JSON.stringify(merged) !== JSON.stringify(cur.source_urls ?? [])) {
        patch.source_urls = merged; fieldCounts.source_urls++;
      }
    }

    if (Object.keys(patch).length === 0) continue;
    const { error } = await sb.from('data_centers').update(patch).eq('id', r.id);
    if (error) {
      console.warn(`  WARN update ${r.slug}: ${error.message}`);
      continue;
    }
    updatedRows++;
    if (updatedRows % 100 === 0) process.stdout.write(`  ${updatedRows} rows updated\r`);
  }
  console.log(`  ${updatedRows} rows updated`);
  console.log(`  field counts:`, fieldCounts);

  // ─── Step 5: insert dc_organizations links ────────────────────────────
  console.log('\n=== Inserting dc_organizations links ===');
  const newLinks: Array<{ dc_slug: string; org_slug: string; relationship: string }> = [];
  let skippedLinks = 0;
  let invalidLinks = 0;
  for (const r of results) {
    for (const link of r.linked_organizations ?? []) {
      const rel = clean(link.relationship);
      if (!rel || !VALID_RELATIONSHIPS.has(rel)) { invalidLinks++; continue; }
      let orgSlug = clean(link.slug);
      if (!orgSlug || !orgsBySlug.has(orgSlug)) {
        const linkName = clean(link.name);
        if (!linkName) { invalidLinks++; continue; }
        orgSlug = orgByNormName.get(slugify(linkName)) ?? null;
      }
      if (!orgSlug || !orgsBySlug.has(orgSlug)) { invalidLinks++; continue; }
      const key = `${r.slug}|${orgSlug}|${rel}`;
      if (existingLinks.has(key)) { skippedLinks++; continue; }
      existingLinks.add(key);
      newLinks.push({ dc_slug: r.slug, org_slug: orgSlug, relationship: rel });
    }
  }
  console.log(`  ${newLinks.length} new links to insert (${skippedLinks} duplicates skipped, ${invalidLinks} invalid)`);
  for (let i = 0; i < newLinks.length; i += 200) {
    const slice = newLinks.slice(i, i + 200);
    const { error } = await sb.from('dc_organizations').insert(slice);
    if (error) {
      console.warn(`  WARN inserting links (slice ${i}): ${error.message}`);
    }
  }
  console.log(`  inserted ${newLinks.length} links`);

  // ─── Step 6: verify final state ────────────────────────────────────────
  console.log('\n=== Final verification ===');
  const { count: totalOrgs } = await sb.from('organizations').select('slug', { count: 'exact', head: true });
  const { count: totalLinks } = await sb.from('dc_organizations').select('dc_slug', { count: 'exact', head: true });
  console.log(`  organizations: ${totalOrgs}`);
  console.log(`  dc_organizations links: ${totalLinks}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
