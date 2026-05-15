// Merges /tmp/ft-strict-result-NN.json (16 files) and applies the strict-pass
// drops to Supabase. Writes a digest of all drops to /tmp/ft-strict-drops.json
// for review.

import { config as loadEnv } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

interface StrictVerdict {
  id: string;
  slug: string;
  verdict: 'keep' | 'drop';
  confidence?: 'high' | 'medium' | 'low';
  evidence?: string;
  citation?: string | null;
}

const all: StrictVerdict[] = [];
const counts = { keep: 0, drop: 0 };

for (let i = 0; i < 16; i++) {
  const path = `/tmp/ft-strict-result-${String(i).padStart(2, '0')}.json`;
  if (!existsSync(path)) {
    console.warn(`  WARN: ${path} missing`);
    continue;
  }
  const arr = JSON.parse(readFileSync(path, 'utf8')) as StrictVerdict[];
  for (const v of arr) {
    if (!v?.id || !v?.verdict) continue;
    all.push(v);
    counts[v.verdict] = (counts[v.verdict] ?? 0) + 1;
  }
}

console.log(`Loaded ${all.length} verdicts total`);
console.log(`  keep: ${counts.keep}`);
console.log(`  drop: ${counts.drop}`);

const drops = all.filter((v) => v.verdict === 'drop');

// Pull current names for the drops so the digest is human-reviewable.
async function enrichDrops() {
  const ids = drops.map((d) => d.id);
  const rows: Array<{ id: string; name: string; operator: string | null; city: string | null; state: string }> = [];
  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);
    const { data, error } = await sb
      .from('data_centers')
      .select('id, name, operator, city, state')
      .in('id', slice);
    if (error) throw error;
    rows.push(...(data ?? []));
  }
  const byId = new Map(rows.map((r) => [r.id, r]));
  return drops.map((d) => {
    const r = byId.get(d.id);
    return {
      id: d.id,
      slug: d.slug,
      name: r?.name ?? '(missing)',
      operator: r?.operator ?? null,
      city: r?.city ?? null,
      state: r?.state ?? null,
      confidence: d.confidence,
      evidence: d.evidence,
      citation: d.citation,
    };
  });
}

async function chunkedDelete(ids: string[], size = 100) {
  let deleted = 0;
  for (let i = 0; i < ids.length; i += size) {
    const slice = ids.slice(i, i + size);
    const { error, count } = await sb
      .from('data_centers')
      .delete({ count: 'exact' })
      .in('id', slice);
    if (error) throw error;
    deleted += count ?? 0;
    process.stdout.write(`  deleted ${deleted}/${ids.length}\r`);
  }
  console.log(`  deleted ${deleted}/${ids.length}`);
  return deleted;
}

async function main() {
  const digest = await enrichDrops();
  writeFileSync('/tmp/ft-strict-drops.json', JSON.stringify(digest, null, 2));
  console.log(`\nWrote drop digest to /tmp/ft-strict-drops.json`);

  console.log(`\n=== Deleting ${drops.length} rows from data_centers ===`);
  await chunkedDelete(drops.map((d) => d.id));

  const { count: ftv } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true })
    .eq('data_source', 'fractracker-verified');
  const { count: ed } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true })
    .eq('data_source', 'editorial');
  const { count: total } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true });

  console.log(`\nFinal state:`);
  console.log(`  editorial:            ${ed}`);
  console.log(`  fractracker-verified: ${ftv}`);
  console.log(`  TOTAL:                ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
