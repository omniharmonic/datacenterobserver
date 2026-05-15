// Pull all fractracker-verified rows + a reference list of existing orgs, then
// split into 50 batch files for the deep-enrichment swarm. Each batch file
// embeds the org reference list so agents can reuse existing slugs.

import { config as loadEnv } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const BATCHES = 50;

async function loadAll<T>(query: () => Promise<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const { data, error } = await query();
  if (error) throw error;
  return data ?? [];
}

async function main() {
  // Pull DCs (paginated).
  const dcs: Array<Record<string, unknown>> = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from('data_centers')
      .select(
        'id, slug, name, operator, developer, city, county, state, address, zip, status, capacity_mw, footprint_acres, water_usage_gpd, energy_source, estimated_cost_usd, announced_date, expected_completion, description, latitude, longitude, source_urls',
      )
      .eq('data_source', 'fractracker-verified')
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    dcs.push(...data);
    if (data.length < 1000) break;
  }
  console.log(`Loaded ${dcs.length} fractracker-verified rows`);

  // Pull existing orgs so agents can reuse slugs.
  const { data: orgs, error: orgErr } = await sb
    .from('organizations')
    .select('slug, name, type')
    .order('name')
    .range(0, 9999);
  if (orgErr) throw orgErr;
  console.log(`Loaded ${orgs?.length} existing organizations`);

  // Trim the org list to the canonical fields agents need.
  const orgRef = (orgs ?? []).map((o) => ({ slug: o.slug, name: o.name, type: o.type }));

  const batchSize = Math.ceil(dcs.length / BATCHES);
  console.log(`Splitting into ${BATCHES} batches of ~${batchSize}`);

  for (let i = 0; i < BATCHES; i++) {
    const slice = dcs.slice(i * batchSize, (i + 1) * batchSize);
    if (slice.length === 0) continue;
    const path = `/tmp/ft-deep-batch-${String(i).padStart(2, '0')}.json`;
    writeFileSync(
      path,
      JSON.stringify(
        {
          rows: slice,
          // Shared reference: org slugs the agent can link to.
          orgs_reference: orgRef,
        },
        null,
        2,
      ),
    );
  }
  console.log(`Wrote ${BATCHES} batch files`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
