// Merges /tmp/ft-swarm-result-NN.json (35 files) and applies:
//   - drops: DELETE from data_centers
//   - keeps: UPDATE name/operator/capacity_mw/status/description with the
//            agent's enriched values, only when they look like real
//            improvements over what's already there.

import { config as loadEnv } from 'dotenv';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

interface SwarmVerdict {
  id: string;
  slug: string;
  verdict: 'keep' | 'drop';
  reason?: string;
  canonical_name?: string | null;
  operator?: string | null;
  capacity_mw?: number | null;
  status?: string | null;
  description?: string | null;
  citation?: string | null;
}

const VALID_STATUS = new Set([
  'proposed', 'announced', 'permitting', 'approved',
  'under_construction', 'operational', 'paused', 'cancelled',
]);

const verdicts: SwarmVerdict[] = [];
const parseErrors: string[] = [];

for (let i = 0; i < 35; i++) {
  const path = `/tmp/ft-swarm-result-${String(i).padStart(2, '0')}.json`;
  if (!existsSync(path)) {
    parseErrors.push(`missing: ${path}`);
    continue;
  }
  try {
    const arr = JSON.parse(readFileSync(path, 'utf8')) as SwarmVerdict[];
    for (const v of arr) {
      if (!v?.id || !v?.verdict) continue;
      verdicts.push(v);
    }
  } catch (e) {
    parseErrors.push(`parse error in ${path}: ${(e as Error).message}`);
  }
}

const drops = verdicts.filter((v) => v.verdict === 'drop');
const keeps = verdicts.filter((v) => v.verdict === 'keep');

console.log(`Loaded ${verdicts.length} verdicts (${keeps.length} keep, ${drops.length} drop)`);
if (parseErrors.length) console.warn('Parse issues:', parseErrors);

function clean(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = String(s).trim();
  return t.length === 0 ? null : t;
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

async function fetchCurrent(ids: string[]): Promise<Map<string, { id: string; name: string; operator: string | null; capacity_mw: number | null; status: string; description: string | null }>> {
  const map = new Map();
  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);
    const { data, error } = await sb
      .from('data_centers')
      .select('id, name, operator, capacity_mw, status, description')
      .in('id', slice);
    if (error) throw error;
    for (const r of data ?? []) map.set(r.id, r);
  }
  return map;
}

async function applyEnrichments(rows: SwarmVerdict[]) {
  const ids = rows.map((r) => r.id);
  const current = await fetchCurrent(ids);
  let touched = 0;
  let fieldsUpdated = { name: 0, operator: 0, capacity_mw: 0, status: 0, description: 0 };

  for (const v of rows) {
    const cur = current.get(v.id);
    if (!cur) continue;

    const patch: Record<string, unknown> = {};

    const newName = clean(v.canonical_name);
    if (
      newName &&
      newName.length > 3 &&
      newName.toLowerCase() !== cur.name.toLowerCase()
    ) {
      patch.name = newName;
      fieldsUpdated.name++;
    }

    const newOperator = clean(v.operator);
    if (
      newOperator &&
      newOperator.toLowerCase() !== (cur.operator ?? '').toLowerCase()
    ) {
      patch.operator = newOperator;
      fieldsUpdated.operator++;
    }

    if (
      typeof v.capacity_mw === 'number' &&
      Number.isFinite(v.capacity_mw) &&
      v.capacity_mw > 0 &&
      v.capacity_mw < 50000 &&
      v.capacity_mw !== cur.capacity_mw
    ) {
      patch.capacity_mw = Math.round(v.capacity_mw);
      fieldsUpdated.capacity_mw++;
    }

    const newStatus = clean(v.status)?.toLowerCase();
    if (newStatus && VALID_STATUS.has(newStatus) && newStatus !== cur.status) {
      patch.status = newStatus;
      fieldsUpdated.status++;
    }

    const newDesc = clean(v.description);
    if (newDesc && newDesc.length > 20 && newDesc !== cur.description) {
      // Append citation if present, just a parenthetical at the end.
      const cit = clean(v.citation);
      patch.description = cit ? `${newDesc} (Source: ${cit})` : newDesc;
      fieldsUpdated.description++;
    }

    if (Object.keys(patch).length === 0) continue;

    const { error } = await sb.from('data_centers').update(patch).eq('id', v.id);
    if (error) {
      console.warn(`  WARN ${v.slug}: ${error.message}`);
      continue;
    }
    touched++;
    if (touched % 100 === 0) process.stdout.write(`  enriched ${touched}\r`);
  }
  console.log(`  enriched ${touched} rows`);
  console.log(`  field updates:`, fieldsUpdated);
}

async function main() {
  // Save digest for later review.
  writeFileSync('/tmp/ft-swarm-merged.json', JSON.stringify({ keeps, drops }, null, 2));
  console.log(`Wrote /tmp/ft-swarm-merged.json`);

  console.log(`\n=== Phase 1: Delete ${drops.length} drops ===`);
  await chunkedDelete(drops.map((d) => d.id));

  console.log(`\n=== Phase 2: Apply enrichments to ${keeps.length} keeps ===`);
  await applyEnrichments(keeps);

  console.log(`\n=== Verifying final state ===`);
  const { count: ed } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true })
    .eq('data_source', 'editorial');
  const { count: ftv } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true })
    .eq('data_source', 'fractracker-verified');
  const { count: total } = await sb
    .from('data_centers')
    .select('id', { count: 'exact', head: true });
  console.log(`  editorial:            ${ed}`);
  console.log(`  fractracker-verified: ${ftv}`);
  console.log(`  TOTAL:                ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
