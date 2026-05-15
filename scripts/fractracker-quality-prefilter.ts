// Pre-filter the FracTracker imports. Tags each row as:
//   keep      — looks like a real, named site worth keeping (or researching)
//   drop      — clearly junk (address-as-name, no operator, etc.)
//   research  — uncertain; needs an agent to look it up
//
// The classification heuristics are conservative — when in doubt, mark for
// research rather than dropping data we might want.

import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(url, key, { auth: { persistSession: false } });

interface DcRow {
  id: string;
  slug: string;
  name: string;
  operator: string | null;
  city: string | null;
  state: string;
  status: string;
  capacity_mw: number | null;
  data_source: string | null;
  location_confidence: string | null;
  description: string | null;
}

// Pull all FracTracker rows (paginated past the 1k cap).
async function loadAll(): Promise<DcRow[]> {
  const acc: DcRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from('data_centers')
      .select('id, slug, name, operator, city, state, status, capacity_mw, data_source, location_confidence, description')
      .eq('data_source', 'fractracker')
      .range(from, from + 999);
    if (error) throw error;
    if (!data?.length) break;
    acc.push(...(data as DcRow[]));
    if (data.length < 1000) break;
  }
  return acc;
}

// Heuristics for "this name looks like a street address, not a site name."
const STREET_SUFFIXES = [
  'road', 'rd', 'street', 'st', 'avenue', 'ave', 'boulevard', 'blvd',
  'drive', 'dr', 'lane', 'ln', 'way', 'highway', 'hwy', 'parkway', 'pkwy',
  'court', 'ct', 'circle', 'cir', 'place', 'pl', 'terrace', 'ter',
  'trail', 'trl', 'pike', 'route', 'rte',
];

function looksLikeAddress(name: string): boolean {
  const lower = name.toLowerCase().trim();
  // Starts with digits followed by space + word
  if (/^\d+\s+[a-z]/i.test(name)) return true;
  // Contains street-suffix words and not many other identifying tokens
  const words = lower.split(/\s+/);
  const hasStreetSuffix = words.some((w) => STREET_SUFFIXES.includes(w.replace(/[^a-z]/g, '')));
  if (hasStreetSuffix && words.length <= 4) return true;
  return false;
}

function isGeneric(name: string): boolean {
  const lower = name.toLowerCase().trim();
  // Pure generic
  if (['data center', 'datacenter', 'data hall', 'hyperscale', 'colocation', 'campus', 'site'].includes(lower)) return true;
  // Single token < 3 chars
  if (lower.length < 4) return true;
  return false;
}

function nameLooksLikeOperator(name: string): boolean {
  // Common operator words/brands that signal a named DC
  const operatorMarkers = [
    'equinix', 'digital realty', 'coresite', 'aws', 'amazon', 'microsoft', 'azure',
    'google', 'meta', 'facebook', 'apple', 'oracle', 'crusoe', 'iren', 'hut',
    'coreweave', 'lambda', 'qts', 'vantage', 'cyrusone', 'aligned', 'stack',
    'compass', 'switch', 'edged', 'cologix', 'centra', 'oppidan', 'tract',
    'fluidstack', 'flexential', 'terawulf', 'cipher', 'applied digital',
    'bitdeer', 'core scientific', 'riot', 'fermi', 'powerhouse', 'cleanarc',
    'potentia', 'coatue', 'prologis', 'beale', 'lakeland', 'green data',
    'prado', 'global ai', 'prometheus', 'wyoming hyperscale', 'fleet',
    'humain', 'cologix', 'lumen', 'savvis', 'sungard', 'lightedge', 'tierpoint',
    'iron mountain', 'evoque', 'centersquare', 'netrality', 'h5', 'aligned',
    'colohub', 'pinnaclehd', 'cyxtera', 'centersquare', 'databank',
  ];
  const lower = name.toLowerCase();
  return operatorMarkers.some((m) => lower.includes(m));
}

async function main() {
const rows = await loadAll();
console.log(`Loaded ${rows.length} FracTracker rows`);

type Verdict = 'keep' | 'drop' | 'research';
const reasons: Record<string, number> = {};
const dropped: DcRow[] = [];
const kept: DcRow[] = [];
const research: DcRow[] = [];

for (const r of rows) {
  let verdict: Verdict = 'research';
  let reason = '';

  if (!r.name || r.name.trim().length === 0) {
    verdict = 'drop'; reason = 'no-name';
  } else if (looksLikeAddress(r.name)) {
    verdict = 'drop'; reason = 'name-is-address';
  } else if (isGeneric(r.name)) {
    verdict = 'drop'; reason = 'generic-name';
  } else if (r.location_confidence === 'low') {
    verdict = 'drop'; reason = 'low-confidence';
  } else if (nameLooksLikeOperator(r.name)) {
    // Has a recognizable operator brand in the name AND high confidence → keep
    if (r.location_confidence === 'high') {
      verdict = 'keep'; reason = 'named-operator-high-conf';
    } else {
      verdict = 'research'; reason = 'named-operator-medium-conf';
    }
  } else if (r.operator && r.operator.trim().length > 0) {
    // Has an operator field → at least research
    verdict = 'research'; reason = 'has-operator';
  } else {
    verdict = 'research'; reason = 'name-only-no-operator';
  }

  reasons[`${verdict}:${reason}`] = (reasons[`${verdict}:${reason}`] ?? 0) + 1;
  if (verdict === 'keep') kept.push(r);
  else if (verdict === 'drop') dropped.push(r);
  else research.push(r);
}

console.log('\nVerdict breakdown:');
for (const [k, v] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(40)} ${v}`);
}

console.log(`\nTotal: ${rows.length}`);
console.log(`  keep:     ${kept.length}`);
console.log(`  research: ${research.length}`);
console.log(`  drop:     ${dropped.length}`);

console.log('\n\nSample of 10 KEEP rows:');
for (const r of kept.slice(0, 10)) {
  console.log(`  ${r.name.padEnd(45)} | ${(r.operator ?? '').padEnd(25)} | ${r.city}, ${r.state} | ${r.capacity_mw ?? '?'} MW | conf=${r.location_confidence}`);
}

console.log('\n\nSample of 15 DROP rows:');
for (const r of dropped.slice(0, 15)) {
  console.log(`  ${r.name.padEnd(45)} | ${(r.operator ?? '').padEnd(25)} | ${r.city}, ${r.state}`);
}

console.log('\n\nSample of 10 RESEARCH rows:');
for (const r of research.slice(0, 10)) {
  console.log(`  ${r.name.padEnd(45)} | ${(r.operator ?? '').padEnd(25)} | ${r.city}, ${r.state} | ${r.capacity_mw ?? '?'} MW`);
}

// Write the lists to JSON for the next stage.
writeFileSync(
  '/tmp/ft-quality-prefilter.json',
  JSON.stringify({ keep: kept, research, dropped }, null, 2),
);
console.log('\nWrote /tmp/ft-quality-prefilter.json');
}
main().catch(e => { console.error(e); process.exit(1); });
