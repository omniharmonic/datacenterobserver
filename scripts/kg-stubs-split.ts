// Pull stub organizations (missing description OR website) and split them into
// batches for the KG enrichment swarm. Each batch also gets the full org slug
// list so agents can reference existing slugs when proposing relationships.

import { config as loadEnv } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const BATCHES = 35;

async function main() {
  // All orgs (for the reference list).
  const { data: allOrgs } = await sb
    .from('organizations')
    .select('slug, name, type')
    .order('name')
    .range(0, 9999);
  console.log(`Total orgs: ${allOrgs?.length}`);

  // Stub orgs: description is null OR website is null.
  const { data: stubs } = await sb
    .from('organizations')
    .select('slug, name, type, description, website, headquarters, ticker')
    .or('description.is.null,website.is.null')
    .range(0, 9999);
  console.log(`Stub orgs: ${stubs?.length}`);

  const orgsReference = (allOrgs ?? []).map((o) => ({ slug: o.slug, name: o.name, type: o.type }));

  const stubsArr = stubs ?? [];
  const batchSize = Math.ceil(stubsArr.length / BATCHES);
  console.log(`Splitting into ${BATCHES} batches of ~${batchSize}`);

  for (let i = 0; i < BATCHES; i++) {
    const slice = stubsArr.slice(i * batchSize, (i + 1) * batchSize);
    if (slice.length === 0) continue;
    const path = `/tmp/kg-stub-batch-${String(i).padStart(2, '0')}.json`;
    writeFileSync(
      path,
      JSON.stringify({ orgs: slice, orgs_reference: orgsReference }, null, 2),
    );
  }
  console.log(`Wrote ${BATCHES} batch files`);
}

main().catch((e) => { console.error(e); process.exit(1); });
