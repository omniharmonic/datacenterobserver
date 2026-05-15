// Applies /tmp/ft-final-decisions.json to Supabase:
//   1. Delete the 280 drop rows.
//   2. Update the 1,219 keep rows: data_source -> 'fractracker-verified',
//      and apply any corrected_name / corrected_operator / corrected_capacity_mw.
//
// Run with: npx tsx scripts/fractracker-apply-decisions.ts

import { config as loadEnv } from 'dotenv';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(url, key, { auth: { persistSession: false } });

interface FinalDecision {
  slug: string;
  id: string;
  source_pile: 'auto-keep' | 'auto-drop' | 'researched';
  verdict: 'keep' | 'drop';
  reason: string;
  corrected_name?: string | null;
  corrected_operator?: string | null;
  corrected_capacity_mw?: number | null;
  citation?: string | null;
  original: {
    id: string;
    slug: string;
    name: string;
    operator: string | null;
    city: string | null;
    state: string;
    data_source: string | null;
  };
}

const decisions: FinalDecision[] = JSON.parse(
  readFileSync('/tmp/ft-final-decisions.json', 'utf8'),
);

const drops = decisions.filter((d) => d.verdict === 'drop');
const keeps = decisions.filter((d) => d.verdict === 'keep');

console.log(`Loaded ${decisions.length} decisions: ${keeps.length} keep, ${drops.length} drop`);

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

async function bulkSetDataSource(ids: string[], size = 200) {
  let updated = 0;
  for (let i = 0; i < ids.length; i += size) {
    const slice = ids.slice(i, i + size);
    const { error, count } = await sb
      .from('data_centers')
      .update({ data_source: 'fractracker-verified' }, { count: 'exact' })
      .in('id', slice);
    if (error) throw error;
    updated += count ?? 0;
    process.stdout.write(`  updated ${updated}/${ids.length}\r`);
  }
  console.log(`  updated ${updated}/${ids.length}`);
  return updated;
}

// Sanitize a corrected value: strip whitespace, treat empty as null.
function clean(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = String(s).trim();
  return t.length === 0 ? null : t;
}

async function applyCorrections(rows: FinalDecision[]) {
  let applied = 0;
  let skipped = 0;
  for (const d of rows) {
    const patch: Record<string, unknown> = {};
    const name = clean(d.corrected_name);
    const op = clean(d.corrected_operator);
    const mw = d.corrected_capacity_mw;
    // Only set fields that look like real improvements.
    if (name && name.toLowerCase() !== d.original.name.toLowerCase()) {
      patch.name = name;
    }
    if (op && op.toLowerCase() !== (d.original.operator ?? '').toLowerCase()) {
      patch.operator = op;
    }
    if (typeof mw === 'number' && mw > 0 && mw < 100000) {
      patch.capacity_mw = mw;
    }
    if (Object.keys(patch).length === 0) {
      skipped++;
      continue;
    }
    const { error } = await sb.from('data_centers').update(patch).eq('id', d.id);
    if (error) {
      console.warn(`  WARN update ${d.slug} failed: ${error.message}`);
      continue;
    }
    applied++;
    if (applied % 50 === 0) process.stdout.write(`  applied ${applied} corrections\r`);
  }
  console.log(`  applied ${applied} corrections (${skipped} had nothing to apply)`);
  return applied;
}

async function main() {
  console.log('\n=== Phase 1: Delete drop rows ===');
  const dropIds = drops.map((d) => d.id);
  await chunkedDelete(dropIds);

  console.log('\n=== Phase 2: Promote keep rows to fractracker-verified ===');
  const keepIds = keeps.map((d) => d.id);
  await bulkSetDataSource(keepIds);

  console.log('\n=== Phase 3: Apply per-row agent corrections ===');
  const withCorrections = keeps.filter(
    (d) => d.corrected_name || d.corrected_operator || d.corrected_capacity_mw,
  );
  console.log(`  ${withCorrections.length} rows have at least one correction to consider`);
  await applyCorrections(withCorrections);

  console.log('\n=== Verifying final state ===');
  const { count: verifiedCount } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true })
    .eq('data_source', 'fractracker-verified');
  const { count: legacyCount } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true })
    .eq('data_source', 'fractracker');
  const { count: editorialCount } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true })
    .eq('data_source', 'editorial');
  console.log(`  editorial:            ${editorialCount}`);
  console.log(`  fractracker-verified: ${verifiedCount}`);
  console.log(`  fractracker (legacy): ${legacyCount}  (expected 0)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
