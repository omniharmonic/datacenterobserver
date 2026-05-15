import 'dotenv/config';
import { parse } from 'csv-parse/sync';
import { FRACTRACKER_CSV_URL } from '../lib/ingest/fractracker';

async function main() {
  const res = await fetch(FRACTRACKER_CSV_URL);
  const text = await res.text();
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Array<Record<string, string>>;

  // Group by (rounded lat, rounded lng) at 3 decimal places (~110m precision)
  // to detect clusters of multiple "different" sites at the same point.
  const buckets = new Map<string, Array<Record<string, string>>>();
  for (const r of rows) {
    const lat = Number(r.Lat);
    const lng = Number(r.Long);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) continue;
    const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(r);
  }
  const dupes = Array.from(buckets.entries())
    .filter(([, arr]) => arr.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 12);

  console.log(`Total rows with coords: ${[...buckets.values()].reduce((s, a) => s + a.length, 0)}`);
  console.log(`Coordinate buckets (~110m): ${buckets.size}`);
  console.log(`Buckets with ≥3 distinct sites: ${dupes.length}`);
  console.log();
  console.log('Top duplicate-coordinate clusters:');
  for (const [key, arr] of dupes) {
    console.log(`\n  ${key}  (${arr.length} sites)`);
    for (const r of arr.slice(0, 6)) {
      console.log(`    - ${r.Name}  | ${r.City}, ${r.State}  | det=${r['Location determination']} conf=${r['Location confidence']}`);
    }
    if (arr.length > 6) console.log(`    … ${arr.length - 6} more`);
  }

  // Also: a few random samples broken down by status and confidence
  console.log('\n\nSample distribution of (Status × Location confidence):');
  const grid: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const s = (r.Status ?? '').trim() || '(blank)';
    const c = (r['Location confidence'] ?? '').trim() || '(blank)';
    grid[s] = grid[s] ?? {};
    grid[s][c] = (grid[s][c] ?? 0) + 1;
  }
  for (const [status, byConf] of Object.entries(grid).sort()) {
    const parts = Object.entries(byConf).map(([k, v]) => `${k}=${v}`).join(', ');
    console.log(`  ${status.padEnd(25)}  ${parts}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
