// Pulls every fractracker-verified row from Supabase, splits into batches, and
// writes them out for a second, stricter research pass.

import { config as loadEnv } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

interface Row {
  id: string;
  slug: string;
  name: string;
  operator: string | null;
  city: string | null;
  state: string;
  capacity_mw: number | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
}

const BATCHES = 16;

async function loadAll(): Promise<Row[]> {
  const acc: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from('data_centers')
      .select('id, slug, name, operator, city, state, capacity_mw, description, latitude, longitude')
      .eq('data_source', 'fractracker-verified')
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    acc.push(...(data as Row[]));
    if (data.length < 1000) break;
  }
  return acc;
}

async function main() {
  const rows = await loadAll();
  console.log(`Loaded ${rows.length} fractracker-verified rows`);

  const batchSize = Math.ceil(rows.length / BATCHES);
  console.log(`Splitting into ${BATCHES} batches of ~${batchSize}`);

  for (let i = 0; i < BATCHES; i++) {
    const slice = rows.slice(i * batchSize, (i + 1) * batchSize);
    if (slice.length === 0) continue;
    const path = `/tmp/ft-strict-batch-${String(i).padStart(2, '0')}.json`;
    const trimmed = slice.map((r) => ({
      slug: r.slug,
      id: r.id,
      name: r.name,
      operator: r.operator,
      city: r.city,
      state: r.state,
      capacity_mw: r.capacity_mw,
      description: r.description?.slice(0, 200) ?? null,
    }));
    writeFileSync(path, JSON.stringify(trimmed, null, 2));
    console.log(`  ${path}  (${slice.length} rows)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
