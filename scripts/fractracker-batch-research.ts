// Splits the "research" pile from the prefilter output into N batch files,
// each written to /tmp/ft-research-batch-NN.json, for parallel agent dispatch.

import { readFileSync, writeFileSync } from 'node:fs';

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

const BATCHES = 13;
const raw = JSON.parse(readFileSync('/tmp/ft-quality-prefilter.json', 'utf8'));
const research: DcRow[] = raw.research;

const batchSize = Math.ceil(research.length / BATCHES);
console.log(`Splitting ${research.length} research entries into ${BATCHES} batches of ~${batchSize}`);

for (let i = 0; i < BATCHES; i++) {
  const slice = research.slice(i * batchSize, (i + 1) * batchSize);
  if (slice.length === 0) continue;
  const path = `/tmp/ft-research-batch-${String(i).padStart(2, '0')}.json`;
  // Trim to the fields an agent actually needs to do its lookup.
  const trimmed = slice.map((r) => ({
    slug: r.slug,
    name: r.name,
    operator: r.operator,
    city: r.city,
    state: r.state,
    capacity_mw: r.capacity_mw,
    location_confidence: r.location_confidence,
  }));
  writeFileSync(path, JSON.stringify(trimmed, null, 2));
  console.log(`  ${path}  (${slice.length} rows)`);
}
