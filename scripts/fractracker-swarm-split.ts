// Pull all fractracker-verified rows and split into batches for the swarm.

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
  const acc: Array<Record<string, unknown>> = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from('data_centers')
      .select(
        'id, slug, name, operator, city, state, status, capacity_mw, description, latitude, longitude',
      )
      .eq('data_source', 'fractracker-verified')
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    acc.push(...data);
    if (data.length < 1000) break;
  }

  console.log(`Loaded ${acc.length} fractracker-verified rows`);
  const batchSize = Math.ceil(acc.length / BATCHES);

  for (let i = 0; i < BATCHES; i++) {
    const slice = acc.slice(i * batchSize, (i + 1) * batchSize);
    if (slice.length === 0) continue;
    const path = `/tmp/ft-swarm-batch-${String(i).padStart(2, '0')}.json`;
    writeFileSync(path, JSON.stringify(slice, null, 2));
  }
  console.log(`Wrote ${BATCHES} batch files of ~${batchSize} rows each`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
