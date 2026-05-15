// Geocodio enrichment: for each data center with a street address (or
// city/state fallback), call Geocodio with `fields=cd,stateleg` and use the
// result to populate `house_district` (e.g. 'TX-19') on the DC row.
//
// Geocodio also returns the sitting member of Congress and state legislators
// for the location — we use the federal House rep to derive the district
// string. State legislators get logged but not yet persisted (would require
// a schema for state-rep linkage).
//
// API docs: https://www.geocod.io/docs/

import { createClient } from '@supabase/supabase-js';

interface GeocodioCD {
  name: string; // "Congressional District 19"
  district_number: number;
  congress_number: number;
  current_legislators?: Array<{
    type: string;
    bio: { first_name: string; last_name: string };
    contact: { phone?: string; url?: string };
    references: { bioguide_id?: string };
  }>;
}

interface GeocodioStateLeg {
  house?: { name: string; district_number: string };
  senate?: { name: string; district_number: string };
}

interface GeocodioFields {
  congressional_districts?: GeocodioCD[];
  state_legislative_districts?: GeocodioStateLeg;
}

interface GeocodioResult {
  address_components?: { state: string; county?: string };
  formatted_address?: string;
  location: { lat: number; lng: number };
  accuracy?: number;
  fields?: GeocodioFields;
}

interface GeocodioResponse {
  results?: GeocodioResult[];
  error?: string;
}

const FED_STATE_TO_USPS: Record<string, string> = {}; // populated lazily if needed

export interface GeocodioReport {
  total: number;
  enriched: number;
  unchanged: number;
  no_result: number;
  errors: number;
  duration_ms: number;
}

async function geocode(
  query: string,
  apiKey: string,
): Promise<GeocodioResult | null> {
  const url = new URL('https://api.geocod.io/v1.9/geocode');
  url.searchParams.set('q', query);
  url.searchParams.set('fields', 'cd,stateleg');
  url.searchParams.set('api_key', apiKey);
  const res = await fetch(url.toString());
  if (!res.ok) {
    if (res.status === 422) return null; // bad address; skip
    throw new Error(`Geocodio ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as GeocodioResponse;
  if (json.error || !json.results || json.results.length === 0) return null;
  return json.results[0];
}

export async function enrichOfficials(opts: {
  supabaseUrl: string;
  supabaseServiceKey: string;
  apiKey: string;
  /** Only enrich DCs that don't already have house_district. Default true. */
  onlyMissing?: boolean;
  /** Hard cap on rows processed per run, to control Geocodio cost. */
  limit?: number;
}): Promise<GeocodioReport> {
  const t0 = Date.now();
  const sb = createClient(opts.supabaseUrl, opts.supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const onlyMissing = opts.onlyMissing ?? true;
  const limit = opts.limit ?? 2000;

  let q = sb
    .from('data_centers')
    .select('id, slug, address, city, county, state, latitude, longitude, house_district')
    .range(0, limit - 1);
  if (onlyMissing) q = q.is('house_district', null);
  const { data: rows, error } = await q;
  if (error) throw new Error(`fetch failed: ${error.message}`);

  const report: GeocodioReport = {
    total: rows?.length ?? 0,
    enriched: 0,
    unchanged: 0,
    no_result: 0,
    errors: 0,
    duration_ms: 0,
  };

  for (const r of rows ?? []) {
    const query =
      r.address && r.state
        ? `${r.address}, ${r.city ?? ''} ${r.state} ${''}`.trim()
        : r.city && r.state
        ? `${r.city}, ${r.state}`
        : null;
    if (!query) {
      report.no_result++;
      continue;
    }
    try {
      const result = await geocode(query, opts.apiKey);
      if (!result || !result.fields?.congressional_districts?.length) {
        report.no_result++;
        continue;
      }
      const cd = result.fields.congressional_districts[0];
      const stateAbbr = result.address_components?.state ?? r.state;
      // Two-digit zero-padded district, except at-large which uses 'AL'
      const districtNum = cd.district_number;
      const district =
        districtNum === 0
          ? `${stateAbbr}-AL`
          : `${stateAbbr}-${String(districtNum).padStart(2, '0')}`;

      if (r.house_district === district) {
        report.unchanged++;
        continue;
      }
      const { error: updErr } = await sb
        .from('data_centers')
        .update({ house_district: district })
        .eq('id', r.id);
      if (updErr) {
        report.errors++;
        console.error(`update ${r.slug} failed:`, updErr.message);
      } else {
        report.enriched++;
      }
    } catch (e) {
      report.errors++;
      console.error(`geocode failed for ${r.slug}:`, e instanceof Error ? e.message : String(e));
    }
  }

  report.duration_ms = Date.now() - t0;
  return report;
}
