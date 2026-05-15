// Data-access layer. Backed by Supabase (v0.2+).
// Strategy: on the first call into this module per serverless instance,
// hydrate all six tables into module-scoped Maps. Every subsequent call is
// O(1) in-memory lookup. Vercel Fluid Compute keeps instances warm, so the
// per-request cost is effectively one shared cold-start fetch.
//
// Public function signatures match the v0.1 seed-backed version 1:1 except
// they are now async. Callers (server components + API routes) await them.

import { getSupabase } from '@/lib/supabase';
import type {
  DataCenter,
  Organization,
  Official,
  Event,
  OrgRelationshipEdge,
  GraphNode,
  GraphEdge,
} from '@/lib/types';

// ─── Module-scoped cache (hydrated on first access) ────────────────────

let _hydrated = false;
let _hydratingPromise: Promise<void> | null = null;

let DATA_CENTERS: DataCenter[] = [];
let ORGANIZATIONS: Organization[] = [];
let OFFICIALS: Official[] = [];
let EVENTS: Event[] = [];
let ORG_RELATIONSHIPS: OrgRelationshipEdge[] = [];

let dcBySlug = new Map<string, DataCenter>();
let orgBySlug = new Map<string, Organization>();
let eventBySlug = new Map<string, Event>();
let dcByState = new Map<string, DataCenter[]>();
let eventsByDcSlug = new Map<string, Event[]>();

async function hydrate(): Promise<void> {
  if (_hydrated) return;
  if (_hydratingPromise) return _hydratingPromise;

  _hydratingPromise = (async () => {
    const sb = getSupabase();
    // Supabase caps a single .select() at db-max-rows (default 1000), so we
    // paginate in chunks. A 1.6k DC table = 2 round-trips; small tables stop
    // on the first one.
    const PAGE = 1000;
    async function selectAll<T>(table: string): Promise<T[]> {
      const acc: T[] = [];
      for (let from = 0; ; from += PAGE) {
        const to = from + PAGE - 1;
        const { data, error } = await sb.from(table).select('*').range(from, to);
        if (error) throw new Error(`Supabase fetch ${table} failed: ${error.message}`);
        const batch = (data ?? []) as T[];
        acc.push(...batch);
        if (batch.length < PAGE) break;
      }
      return acc;
    }

    const [dcsData, orgsData, offsData, evsData, dcOrgsData, orgRelsData] = await Promise.all([
      selectAll<DataCenter>('data_centers'),
      selectAll<Organization>('organizations'),
      selectAll<Official>('officials'),
      selectAll<Event>('events'),
      selectAll<{ dc_slug: string; org_slug: string; relationship: string }>(
        'dc_organizations',
      ),
      selectAll<{
        source_slug: string;
        target_slug: string;
        relationship: string;
        description: string | null;
        value_usd: number | null;
        source_url: string | null;
      }>('org_relationships'),
    ]);
    // Wrap into the same {data} shape downstream code expects. (selectAll
    // throws on error, so no error field needed.)
    const dcsR = { data: dcsData };
    const orgsR = { data: orgsData };
    const offsR = { data: offsData };
    const evsR = { data: evsData };
    const dcOrgsR = { data: dcOrgsData };
    const orgRelsR = { data: orgRelsData };

    // Attach organization_slugs to each DC by joining the dc_organizations rows.
    const dcOrgsByDc = new Map<string, Array<{ slug: string; relationship: string }>>();
    for (const link of dcOrgsR.data) {
      if (!dcOrgsByDc.has(link.dc_slug)) dcOrgsByDc.set(link.dc_slug, []);
      dcOrgsByDc.get(link.dc_slug)!.push({ slug: link.org_slug, relationship: link.relationship });
    }

    DATA_CENTERS = ((dcsR.data ?? []) as DataCenter[]).map((d) => ({
      ...d,
      organization_slugs: dcOrgsByDc.get(d.slug) as DataCenter['organization_slugs'],
    }));
    ORGANIZATIONS = (orgsR.data ?? []) as Organization[];
    OFFICIALS = (offsR.data ?? []) as Official[];
    EVENTS = (evsR.data ?? []) as Event[];
    ORG_RELATIONSHIPS = ((orgRelsR.data ?? []) as Array<{
      source_slug: string;
      target_slug: string;
      relationship: string;
      description: string | null;
      value_usd: number | null;
      source_url: string | null;
    }>).map((r) => ({
      source: r.source_slug,
      target: r.target_slug,
      relationship: r.relationship as OrgRelationshipEdge['relationship'],
      description: r.description ?? undefined,
      value_usd: r.value_usd ?? undefined,
      source_url: r.source_url ?? undefined,
    }));

    dcBySlug = new Map(DATA_CENTERS.map((d) => [d.slug, d]));
    orgBySlug = new Map(ORGANIZATIONS.map((o) => [o.slug, o]));
    eventBySlug = new Map(EVENTS.map((e) => [e.slug, e]));

    dcByState = new Map<string, DataCenter[]>();
    for (const dc of DATA_CENTERS) {
      if (!dcByState.has(dc.state)) dcByState.set(dc.state, []);
      dcByState.get(dc.state)!.push(dc);
    }

    eventsByDcSlug = new Map<string, Event[]>();
    for (const ev of EVENTS) {
      if (ev.data_center_slug) {
        if (!eventsByDcSlug.has(ev.data_center_slug)) {
          eventsByDcSlug.set(ev.data_center_slug, []);
        }
        eventsByDcSlug.get(ev.data_center_slug)!.push(ev);
      }
    }

    _hydrated = true;
  })();

  return _hydratingPromise;
}

// ─── Officials filter logic (unchanged from v0.1) ──────────────────────

const COUNTY_TO_HOUSE_DISTRICT: Record<string, string> = {
  // TX
  'tx:taylor': 'TX-19', 'tx:milam': 'TX-17', 'tx:shackelford': 'TX-19',
  'tx:ellis': 'TX-06', 'tx:bell': 'TX-31', 'tx:collin': 'TX-03',
  'tx:el paso': 'TX-16', 'tx:potter': 'TX-13', 'tx:hale': 'TX-19',
  'tx:childress': 'TX-13', 'tx:mitchell': 'TX-11', 'tx:navarro': 'TX-06',
  // TN
  'tn:shelby': 'TN-09',
  // VA
  'va:loudoun': 'VA-10', 'va:prince william': 'VA-07',
  'va:chesterfield': 'VA-04', 'va:warren': 'VA-06',
  // WI
  'wi:racine': 'WI-01', 'wi:ozaukee': 'WI-06', 'wi:dodge': 'WI-06',
  // LA
  'la:richland parish': 'LA-05', 'la:west feliciana': 'LA-06',
  // IN
  'in:clark': 'IN-09', 'in:st. joseph': 'IN-02', 'in:boone': 'IN-04',
  // WA
  'wa:grant': 'WA-04',
  // OH
  'oh:trumbull': 'OH-06', 'oh:franklin': 'OH-03',
  'oh:licking': 'OH-12', 'oh:delaware': 'OH-15', 'oh:monroe': 'OH-06',
  // AZ
  'az:maricopa': 'AZ-05', 'az:pinal': 'AZ-06',
  // MS
  'ms:madison': 'MS-02', 'ms:desoto': 'MS-01',
  // GA
  'ga:newton': 'GA-10', 'ga:fayette': 'GA-03', 'ga:walton': 'GA-10',
  // IA
  'ia:pottawattamie': 'IA-03', 'ia:linn': 'IA-02',
  // OR
  'or:umatilla': 'OR-02',
  // WY
  'wy:laramie': 'WY-AL',
  // ID
  'id:ada': 'ID-02',
  // OK
  'ok:mayes': 'OK-02',
  // UT
  'ut:utah': 'UT-03',
  // CA
  'ca:santa clara': 'CA-17',
  // NV
  'nv:storey': 'NV-02', 'nv:clark': 'NV-01', 'nv:washoe': 'NV-02',
  // NM
  'nm:doña ana': 'NM-02', 'nm:dona ana': 'NM-02',
  // PA
  'pa:luzerne': 'PA-08', 'pa:dauphin': 'PA-10', 'pa:lancaster': 'PA-11',
  'pa:bucks': 'PA-01', 'pa:indiana': 'PA-14',
  // MI
  'mi:washtenaw': 'MI-06',
  // NY
  'ny:niagara': 'NY-26',
  // AR
  'ar:crittenden': 'AR-01',
  // NC
  'nc:catawba': 'NC-10', 'nc:richmond': 'NC-09',
  'nc:rutherford': 'NC-11', 'nc:henrico': 'NC-04',
  // AL
  'al:montgomery': 'AL-02', 'al:madison': 'AL-05',
  // MN
  'mn:dakota': 'MN-02',
  // MO
  'mo:clay': 'MO-06', 'mo:jackson': 'MO-05', 'mo:st. louis': 'MO-01',
  // KS
  'ks:shawnee': 'KS-02',
  // NE
  'ne:sarpy': 'NE-02',
  // ND
  'nd:dickey': 'ND-AL',
  // SC
  'sc:berkeley': 'SC-01', 'sc:dorchester': 'SC-06',
  // IL
  'il:kane': 'IL-11', 'il:dupage': 'IL-08',
  // MD
  'md:montgomery': 'MD-08', 'md:charles': 'MD-05',
};

function resolveOfficialsForDc(dc: DataCenter): { official: Official; level: string }[] {
  const result: { official: Official; level: string }[] = [];
  const stateCode = dc.state;
  const county = dc.county?.toLowerCase() ?? '';
  const city = dc.city?.toLowerCase() ?? '';
  const district =
    dc.house_district ?? COUNTY_TO_HOUSE_DISTRICT[`${stateCode.toLowerCase()}:${county}`];

  for (const o of OFFICIALS) {
    if (o.state !== stateCode) continue;

    if (o.level === 'federal' && o.body === 'US Senate') {
      result.push({ official: o, level: o.level });
      continue;
    }
    if (o.level === 'federal' && o.body === 'US House') {
      if (district && o.district === district) {
        result.push({ official: o, level: o.level });
      }
      continue;
    }
    if (o.level === 'state') {
      result.push({ official: o, level: o.level });
      continue;
    }
    if (o.level === 'local') {
      const hay = `${o.body ?? ''} ${o.title ?? ''}`.toLowerCase();
      const countyMatch = county && (hay.includes(county) || hay.includes(`${county} county`));
      const cityMatch = city && hay.includes(city);
      if (countyMatch || cityMatch) {
        result.push({ official: o, level: o.level });
      }
    }
  }
  return result;
}

// ─── Public types ──────────────────────────────────────────────────────

export interface DcMarker {
  id: string;
  slug: string;
  name: string;
  status: DataCenter['status'];
  latitude: number;
  longitude: number;
  state: string;
  city?: string;
  operator?: string;
  capacity_mw?: number;
}

export interface DcDetail extends DataCenter {
  organizations: Array<{ relationship: string; organization: Organization }>;
  officials: Array<{ level: string; official: Official }>;
  events: Event[];
}

export interface OrgRelation {
  relationship: string;
  description?: string;
  value_usd?: number;
  organization: Organization;
}

export interface OrgDcLink {
  relationship: string;
  data_center: DataCenter;
}

export interface OrgDetail extends Organization {
  ownedBy: OrgRelation[];
  controls: OrgRelation[];
  supplies: OrgRelation[];
  suppliedBy: OrgRelation[];
  dataCenters: OrgDcLink[];
}

const CONTROL_RELS = new Set(['owns', 'acquired', 'subsidiary_of', 'invests_in', 'joint_venture']);

// ─── Public API (all async) ────────────────────────────────────────────

// ── PostGIS radius query ───────────────────────────────────────────────
// Calls the `data_centers_within(lat, lng, radius_km)` RPC. Returns nearest
// first with a `distance_km` field. Does NOT use the in-memory cache —
// PostGIS does the heavy lifting in Postgres and returns a small result set.

export interface NearbyDc extends DcMarker {
  distance_km: number;
}

export async function listNearby(
  lat: number,
  lng: number,
  radiusKm: number,
  limit = 100,
): Promise<NearbyDc[]> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('data_centers_within', {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: radiusKm,
  });
  if (error) throw new Error(`listNearby failed: ${error.message}`);
  return ((data ?? []) as NearbyDc[]).slice(0, limit);
}

export async function listDataCenters(filters: {
  status?: string[];
  states?: string[];
  search?: string;
  limit?: number;
  /** Which data sources to include. Default: ['editorial'] only — the 100
   * hand-curated sites are the primary product. FracTracker (~1,500 row dump
   * with many unnamed address-only entries) is opt-in research mode. */
  sources?: string[];
  /** Minimum location confidence within the included sources. */
  minConfidence?: 'low' | 'medium' | 'high';
} = {}): Promise<DcMarker[]> {
  await hydrate();
  let rows: DataCenter[] = DATA_CENTERS;

  // Source filter (default: editorial only).
  const sources = filters.sources ?? ['editorial'];
  rows = rows.filter((r) => sources.includes(r.data_source ?? 'editorial'));

  // Confidence filter — editorial rows have confidence='high', so they always
  // pass any threshold.
  const minConf = filters.minConfidence ?? 'medium';
  const rank = { low: 1, medium: 2, high: 3 } as const;
  const threshold = rank[minConf];
  rows = rows.filter((r) => {
    const c = r.location_confidence;
    if (c == null) return true; // null = unknown, keep
    return rank[c] >= threshold;
  });

  if (filters.status?.length) rows = rows.filter((r) => filters.status!.includes(r.status));
  if (filters.states?.length) rows = rows.filter((r) => filters.states!.includes(r.state));
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.operator?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q),
    );
  }
  if (filters.limit) rows = rows.slice(0, filters.limit);

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    status: r.status,
    latitude: r.latitude,
    longitude: r.longitude,
    state: r.state,
    city: r.city,
    operator: r.operator,
    capacity_mw: r.capacity_mw,
  }));
}

export async function getDataCenter(slug: string): Promise<DcDetail | null> {
  await hydrate();
  const dc = dcBySlug.get(slug);
  if (!dc) return null;

  const organizations: Array<{ relationship: string; organization: Organization }> = [];
  for (const link of dc.organization_slugs ?? []) {
    const org = orgBySlug.get(link.slug);
    if (org) organizations.push({ relationship: link.relationship, organization: org });
  }

  const officials = resolveOfficialsForDc(dc).sort((a, b) => {
    const order = { federal: 0, state: 1, local: 2 } as const;
    return (order[a.level as keyof typeof order] ?? 3) - (order[b.level as keyof typeof order] ?? 3);
  });

  const events = (eventsByDcSlug.get(dc.slug) ?? []).slice().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return { ...dc, organizations, officials, events };
}

export async function listOrganizations(): Promise<Organization[]> {
  await hydrate();
  return ORGANIZATIONS;
}

export async function getOrganization(slug: string): Promise<Organization | null> {
  await hydrate();
  return orgBySlug.get(slug) ?? null;
}

export async function getOrganizationDetail(slug: string): Promise<OrgDetail | null> {
  await hydrate();
  const org = orgBySlug.get(slug);
  if (!org) return null;

  const ownedBy: OrgRelation[] = [];
  const controls: OrgRelation[] = [];
  const supplies: OrgRelation[] = [];
  const suppliedBy: OrgRelation[] = [];

  for (const edge of ORG_RELATIONSHIPS) {
    const isControl = CONTROL_RELS.has(edge.relationship);
    if (edge.source === slug) {
      const target = orgBySlug.get(edge.target);
      if (!target) continue;
      const rel: OrgRelation = {
        relationship: edge.relationship,
        description: edge.description,
        value_usd: edge.value_usd,
        organization: target,
      };
      (isControl ? controls : supplies).push(rel);
    } else if (edge.target === slug) {
      const source = orgBySlug.get(edge.source);
      if (!source) continue;
      const rel: OrgRelation = {
        relationship: edge.relationship,
        description: edge.description,
        value_usd: edge.value_usd,
        organization: source,
      };
      (isControl ? ownedBy : suppliedBy).push(rel);
    }
  }

  const dataCenters: OrgDcLink[] = [];
  for (const dc of DATA_CENTERS) {
    const link = dc.organization_slugs?.find((o) => o.slug === slug);
    if (link) dataCenters.push({ relationship: link.relationship, data_center: dc });
  }

  return { ...org, ownedBy, controls, supplies, suppliedBy, dataCenters };
}

export async function listOfficials(
  filters: { state?: string; level?: string } = {},
): Promise<Official[]> {
  await hydrate();
  let rows = OFFICIALS;
  if (filters.state) rows = rows.filter((o) => o.state === filters.state);
  if (filters.level) rows = rows.filter((o) => o.level === filters.level);
  return rows;
}

export async function listEvents(filters: {
  state?: string;
  type?: string;
  status?: string;
  upcoming?: boolean;
  data_center?: string;
} = {}): Promise<Event[]> {
  await hydrate();
  let rows = EVENTS.slice();
  if (filters.state) rows = rows.filter((e) => e.state === filters.state);
  if (filters.type) rows = rows.filter((e) => e.type === filters.type);
  if (filters.status) rows = rows.filter((e) => e.status === filters.status);
  if (filters.data_center) rows = rows.filter((e) => e.data_center_slug === filters.data_center);
  if (filters.upcoming) {
    const now = Date.now();
    rows = rows.filter((e) => new Date(e.date).getTime() >= now);
  }
  return rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getEvent(slug: string): Promise<Event | null> {
  await hydrate();
  return eventBySlug.get(slug) ?? null;
}

export async function getGraphData(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  await hydrate();
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Graph is editorial-only — including the 1.5k FracTracker imports
  // would make the force-directed layout unreadable.
  const graphDcs = DATA_CENTERS.filter((d) => (d.data_source ?? 'editorial') === 'editorial');

  for (const org of ORGANIZATIONS) {
    nodes.push({
      id: `org:${org.slug}`,
      name: org.name,
      category: 'organization',
      node_type: org.type,
      metric: org.estimated_lobbying_usd,
    });
  }

  for (const dc of graphDcs) {
    nodes.push({
      id: `dc:${dc.slug}`,
      name: dc.name,
      category: 'data_center',
      node_type: 'data_center',
      metric: dc.capacity_mw,
      state: dc.state,
      status: dc.status,
    });
    for (const link of dc.organization_slugs ?? []) {
      if (orgBySlug.has(link.slug)) {
        edges.push({
          source: `org:${link.slug}`,
          target: `dc:${dc.slug}`,
          relationship: link.relationship,
        });
      }
    }
  }

  for (const rel of ORG_RELATIONSHIPS) {
    if (orgBySlug.has(rel.source) && orgBySlug.has(rel.target)) {
      edges.push({
        source: `org:${rel.source}`,
        target: `org:${rel.target}`,
        relationship: rel.relationship,
        value: rel.value_usd,
      });
    }
  }

  // Officials: limit to governors + senators to keep the graph readable
  const officialSubset = OFFICIALS.filter(
    (o) => o.title.includes('Governor') || o.title === 'US Senator',
  );
  for (const off of officialSubset) {
    nodes.push({
      id: `off:${off.id}`,
      name: off.name,
      category: 'official',
      node_type: off.level,
      state: off.state,
    });
    const stateDcs = (dcByState.get(off.state ?? '') ?? []).filter(
      (d) => (d.data_source ?? 'editorial') === 'editorial',
    );
    for (const dc of stateDcs) {
      edges.push({
        source: `off:${off.id}`,
        target: `dc:${dc.slug}`,
        relationship: 'represents',
      });
    }
  }

  return { nodes, edges };
}

export async function getStats() {
  await hydrate();
  // Headline stats reflect the curated editorial dataset — the FracTracker
  // imports are research-mode and shouldn't inflate the public counters.
  const curated = DATA_CENTERS.filter((d) => (d.data_source ?? 'editorial') === 'editorial');
  const totalDcs = curated.length;
  const byStatus = curated.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const byState = curated.reduce(
    (acc, d) => {
      acc[d.state] = (acc[d.state] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const totalMw = curated.reduce((s, d) => s + (d.capacity_mw ?? 0), 0);
  const totalCapex = curated.reduce((s, d) => s + (d.estimated_cost_usd ?? 0), 0);
  return {
    totalDcs,
    byStatus,
    byState,
    totalMw,
    totalCapex,
    totalOfficials: OFFICIALS.length,
    totalOrgs: ORGANIZATIONS.length,
    totalEvents: EVENTS.length,
    upcomingEvents: EVENTS.filter((e) => new Date(e.date).getTime() > Date.now()).length,
    // Surface FracTracker count separately so the About page can mention it.
    additionalTrackedSites: DATA_CENTERS.length - totalDcs,
  };
}
