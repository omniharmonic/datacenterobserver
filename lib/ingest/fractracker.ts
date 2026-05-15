// FracTracker data-center CSV ingester.
// FracTracker publishes their tracker as a public Google Sheet CSV — not an
// ArcGIS FeatureServer despite the map UI looking like one. Sheet contains
// ~1,500 US data centers with rich community-action metadata.
//
// We import FracTracker rows with slugs prefixed `ft-` so they never collide
// with our editorial-seed slugs. Editorial entries remain authoritative.

import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';
import type { DataCenter, DataCenterStatus } from '@/lib/types';

export const FRACTRACKER_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZgBssB4WNmXOSNxewk5-X514gV-hfpouEVp9K-F5ozlImxOWF-BlrfqAy-4YfeJCpl8l7IIAlxPFt/pub?output=csv';

// FracTracker status strings → our DataCenterStatus enum.
const STATUS_MAP: Record<string, DataCenterStatus> = {
  proposed: 'proposed',
  announced: 'announced',
  permitting: 'permitting',
  approved: 'approved',
  'under construction': 'under_construction',
  'under_construction': 'under_construction',
  operational: 'operational',
  online: 'operational',
  paused: 'paused',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  withdrawn: 'cancelled',
};

function toStatus(s: string): DataCenterStatus {
  const k = (s ?? '').trim().toLowerCase();
  return STATUS_MAP[k] ?? 'announced';
}

function normSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function num(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const n = Number(String(s).replace(/[,$\s]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

interface Row {
  'Facility ID'?: string;
  Name?: string;
  Address?: string;
  City?: string;
  State?: string;
  Zip?: string;
  County?: string;
  Lat?: string;
  Long?: string;
  Status?: string;
  'Location confidence'?: string;
  'Location determination'?: string;
  Operator?: string;
  Tenant?: string;
  MW?: string;
  'Power source'?: string;
  'Facility size (sq ft)'?: string;
  'Property size (acres)'?: string;
  'Project cost'?: string;
  'Expected date online'?: string;
  'Community push-back'?: string;
  'Advocacy Information'?: string;
  'Resistance Status'?: string;
  'Petition_URL'?: string;
  Source?: string;
  'Date updated'?: string;
}

function toConfidence(s: string | undefined): 'low' | 'medium' | 'high' | null {
  const k = (s ?? '').trim().toLowerCase();
  if (k === 'high') return 'high';
  if (k === 'medium') return 'medium';
  if (k === 'low') return 'low';
  return null;
}

export interface IngestReport {
  fetched_rows: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  reasons: Record<string, number>;
  duration_ms: number;
}

export async function ingestFracTracker(opts: {
  supabaseUrl: string;
  supabaseServiceKey: string;
  dryRun?: boolean;
}): Promise<IngestReport> {
  const t0 = Date.now();
  const sb = createClient(opts.supabaseUrl, opts.supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Fetch CSV
  const res = await fetch(FRACTRACKER_CSV_URL, { redirect: 'follow' });
  if (!res.ok) throw new Error(`FracTracker CSV fetch failed: ${res.status}`);
  const text = await res.text();

  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as Row[];

  const report: IngestReport = {
    fetched_rows: rows.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    reasons: {},
    duration_ms: 0,
  };

  // Existing slugs — anything starting with something other than `ft-` is
  // editorial; we don't overwrite those by name match.
  const { data: existingDcs, error: listErr } = await sb
    .from('data_centers')
    .select('slug');
  if (listErr) throw new Error(`list existing failed: ${listErr.message}`);
  const editorialSlugs = new Set(
    (existingDcs ?? []).filter((d) => !d.slug.startsWith('ft-')).map((d) => d.slug),
  );

  const upserts: Partial<DataCenter>[] = [];

  for (const r of rows) {
    const name = (r.Name ?? '').trim();
    const lat = num(r.Lat);
    const lng = num(r.Long);
    const state = (r.State ?? '').trim().toUpperCase();
    const fid = (r['Facility ID'] ?? '').trim();

    if (!name || !fid) {
      report.skipped++;
      report.reasons['missing-name-or-id'] = (report.reasons['missing-name-or-id'] ?? 0) + 1;
      continue;
    }
    if (lat == null || lng == null || lat === 0 || lng === 0) {
      report.skipped++;
      report.reasons['missing-coords'] = (report.reasons['missing-coords'] ?? 0) + 1;
      continue;
    }
    if (!/^[A-Z]{2}$/.test(state)) {
      report.skipped++;
      report.reasons['bad-state'] = (report.reasons['bad-state'] ?? 0) + 1;
      continue;
    }

    const slug = `ft-${normSlug(name)}-${normSlug(state)}-${normSlug(fid).slice(-8)}`;

    // Skip if an editorial entry with the SAME normalized name already exists.
    // Cheap heuristic — better than nothing for v0.2 dedupe.
    const candidate = normSlug(name);
    let dupe = false;
    for (const ed of editorialSlugs) {
      if (ed.includes(candidate) && candidate.length > 12) {
        dupe = true;
        break;
      }
    }
    if (dupe) {
      report.skipped++;
      report.reasons['editorial-conflict'] = (report.reasons['editorial-conflict'] ?? 0) + 1;
      continue;
    }

    // Build description folding in the action-relevant fields.
    const desc: string[] = [];
    if (r.Tenant && r.Tenant.trim()) desc.push(`Tenant: ${r.Tenant.trim()}.`);
    if (r['Power source'] && r['Power source'].trim()) desc.push(`Power: ${r['Power source'].trim()}.`);
    if (r['Community push-back']?.toLowerCase() === 'yes') {
      desc.push('Community push-back: organized opposition reported.');
    }
    if (r['Resistance Status'] && r['Resistance Status'].trim()) {
      desc.push(`Resistance: ${r['Resistance Status'].trim()}.`);
    }
    if (r['Advocacy Information']) desc.push(r['Advocacy Information'].trim());

    const sourceUrls: string[] = [];
    if (r.Source) sourceUrls.push(r.Source.trim());
    if (r['Petition_URL']) sourceUrls.push(r['Petition_URL'].trim());
    const seen = new Set<string>();
    const filteredSources = sourceUrls.filter((u) => {
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return /^https?:\/\//.test(u);
    });

    const row: Partial<DataCenter> & {
      data_source?: string;
      location_confidence?: 'low' | 'medium' | 'high' | null;
    } = {
      id: `ft-${fid}`,
      slug,
      name,
      status: toStatus(r.Status ?? ''),
      latitude: lat,
      longitude: lng,
      address: r.Address?.trim() || undefined,
      city: r.City?.trim() || undefined,
      county: r.County?.trim() || undefined,
      state,
      zip: r.Zip?.trim() || undefined,
      operator: r.Operator?.trim() || undefined,
      capacity_mw: num(r.MW) !== undefined ? Math.round(num(r.MW) as number) : undefined,
      footprint_acres:
        num(r['Property size (acres)']) !== undefined
          ? Math.round(num(r['Property size (acres)']) as number)
          : undefined,
      estimated_cost_usd: undefined, // FracTracker 'Project cost' is freeform; skip parsing for now
      energy_source: r['Power source']?.trim() || undefined,
      expected_completion: r['Expected date online']?.trim() || undefined,
      description: desc.length ? desc.join(' ') : undefined,
      source_urls: filteredSources,
      last_verified_at: new Date().toISOString().slice(0, 10),
      data_source: 'fractracker',
      location_confidence: toConfidence(r['Location confidence']),
    };

    upserts.push(row);
  }

  if (opts.dryRun) {
    report.inserted = upserts.length;
    report.duration_ms = Date.now() - t0;
    return report;
  }

  // Dedupe by id (a CSV with two rows sharing a Facility ID would otherwise
  // explode the bulk upsert with a duplicate-key error on the PK).
  const byId = new Map<string, Partial<DataCenter>>();
  for (const r of upserts) {
    if (!r.id) continue;
    byId.set(r.id, r); // last-write-wins
  }
  const deduped = Array.from(byId.values());

  // Chunked upserts (Supabase request body limit ~1MB).
  const CHUNK = 200;
  for (let i = 0; i < deduped.length; i += CHUNK) {
    const slice = deduped.slice(i, i + CHUNK);
    const { error } = await sb
      .from('data_centers')
      .upsert(slice, { onConflict: 'id', count: 'exact' });
    if (error) {
      report.errors += slice.length;
      report.reasons['upsert-error'] = (report.reasons['upsert-error'] ?? 0) + slice.length;
      console.error(`upsert chunk ${i / CHUNK} failed:`, error.message);
    } else {
      report.inserted += slice.length;
    }
  }

  report.duration_ms = Date.now() - t0;
  return report;
}
