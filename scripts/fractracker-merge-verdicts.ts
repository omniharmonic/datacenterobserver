// Aggregates the prefilter output + the 13 agent result files into one
// decision table. Writes /tmp/ft-final-decisions.json. Does NOT touch Supabase
// — that's a separate apply script that runs after human review.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

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

interface AgentVerdict {
  slug: string;
  verdict: 'keep' | 'drop' | 'uncertain';
  reason?: string;
  corrected_name?: string | null;
  corrected_operator?: string | null;
  corrected_capacity_mw?: number | null;
  citation?: string | null;
}

interface FinalDecision {
  slug: string;
  id: string;
  source_pile: 'auto-keep' | 'auto-drop' | 'researched';
  verdict: 'keep' | 'drop';
  reason: string;
  // Corrections to apply on keep.
  corrected_name?: string | null;
  corrected_operator?: string | null;
  corrected_capacity_mw?: number | null;
  citation?: string | null;
  // Original row for reference.
  original: DcRow;
}

const prefilter = JSON.parse(readFileSync('/tmp/ft-quality-prefilter.json', 'utf8')) as {
  keep: DcRow[];
  research: DcRow[];
  dropped: DcRow[];
};

console.log('Prefilter input:');
console.log(`  auto-keep:    ${prefilter.keep.length}`);
console.log(`  auto-drop:    ${prefilter.dropped.length}`);
console.log(`  researched:   ${prefilter.research.length}`);

// Build a slug → row map for the researched pile so we can recover the full row.
const researchedBySlug = new Map<string, DcRow>(
  prefilter.research.map((r) => [r.slug, r]),
);

// Load all 13 agent result files and merge into a slug → verdict map.
const verdictBySlug = new Map<string, AgentVerdict>();
const verdictCounts = { keep: 0, drop: 0, uncertain: 0 };
let totalVerdicts = 0;
let parseErrors = 0;
let missingRows = 0;

for (let i = 0; i < 13; i++) {
  const path = `/tmp/ft-research-result-${String(i).padStart(2, '0')}.json`;
  if (!existsSync(path)) {
    console.warn(`  WARN: ${path} missing`);
    continue;
  }
  let arr: AgentVerdict[];
  try {
    arr = JSON.parse(readFileSync(path, 'utf8')) as AgentVerdict[];
  } catch (e) {
    console.error(`  ERROR parsing ${path}: ${(e as Error).message}`);
    parseErrors++;
    continue;
  }
  for (const v of arr) {
    if (!v?.slug || !v?.verdict) {
      parseErrors++;
      continue;
    }
    if (verdictBySlug.has(v.slug)) {
      // Duplicate slug across batches shouldn't happen — log and keep first.
      console.warn(`  dup slug across batches: ${v.slug}`);
      continue;
    }
    verdictBySlug.set(v.slug, v);
    totalVerdicts++;
    verdictCounts[v.verdict] = (verdictCounts[v.verdict] ?? 0) + 1;
  }
}

console.log(`\nAgent verdicts loaded: ${totalVerdicts}`);
console.log(`  keep:       ${verdictCounts.keep}`);
console.log(`  drop:       ${verdictCounts.drop}`);
console.log(`  uncertain:  ${verdictCounts.uncertain}`);
if (parseErrors) console.warn(`  parse errors: ${parseErrors}`);

// Check coverage of the research pile.
const uncovered: DcRow[] = [];
for (const r of prefilter.research) {
  if (!verdictBySlug.has(r.slug)) uncovered.push(r);
}
if (uncovered.length) {
  console.warn(`\nWARN: ${uncovered.length} researched rows have no agent verdict — defaulting to keep`);
}

// Build the final decision table.
const decisions: FinalDecision[] = [];

// Auto-keeps: prefilter said keep, no agent involved.
for (const r of prefilter.keep) {
  decisions.push({
    slug: r.slug,
    id: r.id,
    source_pile: 'auto-keep',
    verdict: 'keep',
    reason: 'prefilter:named-operator-high-conf',
    original: r,
  });
}

// Auto-drops: prefilter classified as junk.
for (const r of prefilter.dropped) {
  decisions.push({
    slug: r.slug,
    id: r.id,
    source_pile: 'auto-drop',
    verdict: 'drop',
    reason: 'prefilter:heuristic',
    original: r,
  });
}

// Researched: use agent verdict. Uncertain → keep (with flag in reason).
for (const r of prefilter.research) {
  const v = verdictBySlug.get(r.slug);
  if (!v) {
    missingRows++;
    decisions.push({
      slug: r.slug,
      id: r.id,
      source_pile: 'researched',
      verdict: 'keep',
      reason: 'no-agent-verdict-default-keep',
      original: r,
    });
    continue;
  }
  const finalVerdict: 'keep' | 'drop' = v.verdict === 'drop' ? 'drop' : 'keep';
  decisions.push({
    slug: r.slug,
    id: r.id,
    source_pile: 'researched',
    verdict: finalVerdict,
    reason: `agent:${v.verdict}${v.reason ? ` — ${v.reason}` : ''}`,
    corrected_name: v.corrected_name ?? null,
    corrected_operator: v.corrected_operator ?? null,
    corrected_capacity_mw: v.corrected_capacity_mw ?? null,
    citation: v.citation ?? null,
    original: r,
  });
}

// Final tallies.
const finalKeep = decisions.filter((d) => d.verdict === 'keep');
const finalDrop = decisions.filter((d) => d.verdict === 'drop');

console.log(`\n=== FINAL DECISIONS ===`);
console.log(`Total rows:    ${decisions.length}`);
console.log(`  keep:        ${finalKeep.length}`);
console.log(`  drop:        ${finalDrop.length}`);
console.log(`  (missing agent verdicts, defaulted to keep: ${missingRows})`);

// Breakdown of kept rows by source pile.
const keepPileCounts: Record<string, number> = {};
for (const d of finalKeep) keepPileCounts[d.source_pile] = (keepPileCounts[d.source_pile] ?? 0) + 1;
console.log(`\nKeep by source:`);
for (const [k, v] of Object.entries(keepPileCounts)) console.log(`  ${k.padEnd(15)} ${v}`);

const dropPileCounts: Record<string, number> = {};
for (const d of finalDrop) dropPileCounts[d.source_pile] = (dropPileCounts[d.source_pile] ?? 0) + 1;
console.log(`\nDrop by source:`);
for (const [k, v] of Object.entries(dropPileCounts)) console.log(`  ${k.padEnd(15)} ${v}`);

// Corrections summary.
const withCorrections = finalKeep.filter(
  (d) => d.corrected_name || d.corrected_operator || d.corrected_capacity_mw,
);
console.log(`\nKept rows with agent corrections: ${withCorrections.length}`);

writeFileSync('/tmp/ft-final-decisions.json', JSON.stringify(decisions, null, 2));
console.log(`\nWrote /tmp/ft-final-decisions.json`);

// Sample of agent drops so user can sanity-check before apply.
console.log(`\nSample of 20 agent-dropped rows (sanity check):`);
const agentDrops = finalDrop.filter((d) => d.source_pile === 'researched').slice(0, 20);
for (const d of agentDrops) {
  console.log(
    `  ${d.original.name.slice(0, 40).padEnd(40)} | ${(d.original.operator ?? '').slice(0, 20).padEnd(20)} | ${d.original.city}, ${d.original.state} | ${d.reason.slice(0, 60)}`,
  );
}
