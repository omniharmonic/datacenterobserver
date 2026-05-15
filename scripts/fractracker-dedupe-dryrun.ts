// Conservative dedupe dry-run. Identifies pure duplicates among the
// fractracker-verified pile: same normalized name + same city + same state,
// AND located within ~500m of each other.
//
// Reports what WOULD be collapsed. Does NOT touch Supabase.

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
  latitude: number;
  longitude: number;
  capacity_mw: number | null;
  description: string | null;
  status: string;
}

function normName(s: string | null): string {
  if (!s) return '';
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Haversine in km.
function distKm(a: Row, b: Row): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function loadAll(): Promise<Row[]> {
  const acc: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from('data_centers')
      .select(
        'id, slug, name, operator, city, state, latitude, longitude, capacity_mw, description, status',
      )
      .eq('data_source', 'fractracker-verified')
      .not('latitude', 'is', null)
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    acc.push(...(data as Row[]));
    if (data.length < 1000) break;
  }
  return acc;
}

// "Completeness" score so we can pick the row to keep when collapsing.
function completeness(r: Row): number {
  let s = 0;
  if (r.operator) s += 2;
  if (r.capacity_mw != null) s += 3;
  if (r.description) s += Math.min(3, r.description.length / 100);
  if (r.status !== 'unknown') s += 1;
  // Longer, more specific names beat generic "Data Center".
  if (r.name.length > 20) s += 1;
  if (!/^(data center|data hall|amazon data center|aws data center)$/i.test(r.name.trim())) s += 1;
  return s;
}

async function main() {
  const rows = await loadAll();
  console.log(`Loaded ${rows.length} fractracker-verified rows with coords`);

  // Group by (normName, city, state).
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const key = `${normName(r.name)}|${(r.city ?? '').toLowerCase()}|${r.state.toLowerCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  // For each group with 2+ rows, find spatial clusters within 500m.
  const clusters: Row[][] = [];
  for (const [, gRows] of groups) {
    if (gRows.length < 2) continue;
    // Simple union-find by proximity.
    const parent: number[] = gRows.map((_, i) => i);
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const union = (a: number, b: number) => {
      const ra = find(a), rb = find(b);
      if (ra !== rb) parent[ra] = rb;
    };
    for (let i = 0; i < gRows.length; i++) {
      for (let j = i + 1; j < gRows.length; j++) {
        if (distKm(gRows[i], gRows[j]) < 0.5) union(i, j);
      }
    }
    const buckets = new Map<number, Row[]>();
    for (let i = 0; i < gRows.length; i++) {
      const root = find(i);
      if (!buckets.has(root)) buckets.set(root, []);
      buckets.get(root)!.push(gRows[i]);
    }
    for (const b of buckets.values()) if (b.length >= 2) clusters.push(b);
  }

  console.log(`\nFound ${clusters.length} duplicate clusters covering ${clusters.reduce((a, c) => a + c.length, 0)} rows`);
  console.log(`Would collapse to ${clusters.length} rows → ${clusters.reduce((a, c) => a + c.length - 1, 0)} rows removed\n`);

  // Sort clusters by size (biggest first) so the user can eyeball the loudest ones.
  clusters.sort((a, b) => b.length - a.length);

  // Sample top 15 clusters.
  console.log('Top 15 clusters:');
  for (const c of clusters.slice(0, 15)) {
    c.sort((a, b) => completeness(b) - completeness(a));
    const keep = c[0];
    console.log(`\n  [${c.length} rows] "${keep.name}" — ${keep.city}, ${keep.state}`);
    for (const r of c) {
      const marker = r.id === keep.id ? 'KEEP' : 'drop';
      console.log(
        `    ${marker}  ${r.id.slice(0, 8)}  (${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)})  op=${(r.operator ?? '-').slice(0, 25)}  mw=${r.capacity_mw ?? '-'}`,
      );
    }
  }

  // Build a JSON plan: keep_id + drop_ids per cluster, plus any field-merging
  // hints from siblings (e.g. if keeper has null capacity but a sibling had a value).
  const plan = clusters.map((c) => {
    c.sort((a, b) => completeness(b) - completeness(a));
    const keeper = c[0];
    const siblings = c.slice(1);
    const merges: Record<string, unknown> = {};
    if (keeper.capacity_mw == null) {
      const fromSibling = siblings.find((r) => r.capacity_mw != null);
      if (fromSibling) merges.capacity_mw = fromSibling.capacity_mw;
    }
    if (!keeper.operator) {
      const fromSibling = siblings.find((r) => r.operator);
      if (fromSibling) merges.operator = fromSibling.operator;
    }
    if (!keeper.description) {
      const fromSibling = siblings.find((r) => r.description);
      if (fromSibling) merges.description = fromSibling.description;
    }
    return {
      keep_id: keeper.id,
      keep_slug: keeper.slug,
      keep_name: keeper.name,
      keep_city: keeper.city,
      keep_state: keeper.state,
      drop_ids: siblings.map((r) => r.id),
      drop_count: siblings.length,
      merges,
    };
  });

  writeFileSync('/tmp/ft-dedupe-plan.json', JSON.stringify(plan, null, 2));
  console.log(`\nWrote /tmp/ft-dedupe-plan.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
