// Applies /tmp/ft-dedupe-plan.json to Supabase:
//   1. For each cluster, merge any non-null fields from siblings into keeper.
//   2. Delete the sibling rows.

import { config as loadEnv } from 'dotenv';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

interface PlanEntry {
  keep_id: string;
  keep_slug: string;
  keep_name: string;
  keep_city: string | null;
  keep_state: string;
  drop_ids: string[];
  merges: Record<string, unknown>;
}

const plan: PlanEntry[] = JSON.parse(readFileSync('/tmp/ft-dedupe-plan.json', 'utf8'));

async function main() {
  console.log(`Dedupe plan: ${plan.length} clusters, ${plan.reduce((a, p) => a + p.drop_ids.length, 0)} rows to drop`);

  let mergesApplied = 0;
  let rowsDeleted = 0;

  for (const cluster of plan) {
    if (Object.keys(cluster.merges).length > 0) {
      const { error } = await sb.from('data_centers').update(cluster.merges).eq('id', cluster.keep_id);
      if (error) {
        console.warn(`  WARN merge ${cluster.keep_id} failed: ${error.message}`);
      } else {
        mergesApplied++;
      }
    }
    if (cluster.drop_ids.length > 0) {
      const { error, count } = await sb
        .from('data_centers')
        .delete({ count: 'exact' })
        .in('id', cluster.drop_ids);
      if (error) {
        console.warn(`  WARN delete cluster of ${cluster.keep_name} failed: ${error.message}`);
      } else {
        rowsDeleted += count ?? 0;
      }
    }
  }

  console.log(`Merges applied:  ${mergesApplied}`);
  console.log(`Rows deleted:    ${rowsDeleted}`);

  // Verify final count.
  const { count: total } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true });
  const { count: ftv } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true })
    .eq('data_source', 'fractracker-verified');
  const { count: ed } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true })
    .eq('data_source', 'editorial');
  console.log(`\nFinal state:`);
  console.log(`  editorial:            ${ed}`);
  console.log(`  fractracker-verified: ${ftv}`);
  console.log(`  TOTAL:                ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
