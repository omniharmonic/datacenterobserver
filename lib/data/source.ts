// Data-access layer. Currently backed by the local seed files; designed so
// that future Supabase / Postgres implementations can be swapped in by
// replacing this module without touching the API routes or components.

import { DATA_CENTERS } from '@/data/seed/data-centers';
import { ORGANIZATIONS } from '@/data/seed/organizations';
import { OFFICIALS } from '@/data/seed/officials';
import { EVENTS } from '@/data/seed/events';
import { ORG_RELATIONSHIPS } from '@/data/seed/relationships';
import type {
  DataCenter,
  Organization,
  Official,
  Event,
  GraphNode,
  GraphEdge,
} from '@/lib/types';

// ─── Indexes built once at module load ─────────────────────────────────

const dcBySlug = new Map(DATA_CENTERS.map((d) => [d.slug, d]));
const orgBySlug = new Map(ORGANIZATIONS.map((o) => [o.slug, o]));
const officialById = new Map(OFFICIALS.map((o) => [o.id, o]));
const eventBySlug = new Map(EVENTS.map((e) => [e.slug, e]));

const dcByState = new Map<string, DataCenter[]>();
for (const dc of DATA_CENTERS) {
  if (!dcByState.has(dc.state)) dcByState.set(dc.state, []);
  dcByState.get(dc.state)!.push(dc);
}

const eventsByDcSlug = new Map<string, Event[]>();
for (const ev of EVENTS) {
  if (ev.data_center_slug) {
    if (!eventsByDcSlug.has(ev.data_center_slug)) {
      eventsByDcSlug.set(ev.data_center_slug, []);
    }
    eventsByDcSlug.get(ev.data_center_slug)!.push(ev);
  }
}

// Fallback county → US House district lookup. Populated from public 2023 redistricted
// maps. Used when dc.house_district isn't set explicitly. Keep keys lowercase.
const COUNTY_TO_HOUSE_DISTRICT: Record<string, string> = {
  // TX
  'tx:taylor': 'TX-19',
  'tx:milam': 'TX-17',
  'tx:shackelford': 'TX-19',
  'tx:ellis': 'TX-06',
  'tx:bell': 'TX-31',
  'tx:collin': 'TX-03',
  // TN
  'tn:shelby': 'TN-09',
  // VA
  'va:loudoun': 'VA-10',
  'va:prince william': 'VA-07',
  // WI
  'wi:racine': 'WI-01',
  'wi:ozaukee': 'WI-06',
  'wi:dodge': 'WI-06',
  // LA
  'la:richland parish': 'LA-05',
  // IN
  'in:clark': 'IN-09',
  'in:st. joseph': 'IN-02',
  'in:boone': 'IN-04',
  // WA
  'wa:grant': 'WA-04',
  // OH
  'oh:trumbull': 'OH-06',
  'oh:franklin': 'OH-03',
  // AZ
  'az:maricopa': 'AZ-05',
  'az:pinal': 'AZ-06',
  // MS
  'ms:madison': 'MS-02',
  // GA
  'ga:newton': 'GA-10',
  'ga:fayette': 'GA-03',
  // IA
  'ia:pottawattamie': 'IA-03',
  'ia:linn': 'IA-02',
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
  'nv:storey': 'NV-02',
  'nv:clark': 'NV-01',
  'nv:washoe': 'NV-02',
  // NM
  'nm:doña ana': 'NM-02',
  'nm:dona ana': 'NM-02',
  // PA
  'pa:luzerne': 'PA-08',
  'pa:dauphin': 'PA-10',
  'pa:lancaster': 'PA-11',
  'pa:bucks': 'PA-01',
  'pa:indiana': 'PA-14',
  // MI
  'mi:washtenaw': 'MI-06',
  // NY
  'ny:niagara': 'NY-26',
  // AR
  'ar:crittenden': 'AR-01',
  // NC
  'nc:catawba': 'NC-10',
  'nc:richmond': 'NC-09',
  'nc:rutherford': 'NC-11',
  'nc:henrico': 'NC-04',
  // AL
  'al:montgomery': 'AL-02',
  'al:madison': 'AL-05',
  // MN
  'mn:dakota': 'MN-02',
  // MO
  'mo:clay': 'MO-06',
  'mo:jackson': 'MO-05',
  'mo:st. louis': 'MO-01',
  // KS
  'ks:shawnee': 'KS-02',
  // NE
  'ne:sarpy': 'NE-02',
  // ND
  'nd:dickey': 'ND-AL',
  // MS (Southaven is in DeSoto County)
  'ms:desoto': 'MS-01',
  // OH (more counties for new DCs)
  'oh:licking': 'OH-12',
  'oh:delaware': 'OH-15',
  'oh:monroe': 'OH-06',
  // TX (more counties)
  'tx:el paso': 'TX-16',
  'tx:potter': 'TX-13',
  'tx:hale': 'TX-19',
  'tx:childress': 'TX-13',
  'tx:mitchell': 'TX-11',
  'tx:navarro': 'TX-06',
  // VA
  'va:chesterfield': 'VA-04',
  'va:warren': 'VA-06',
  // SC
  'sc:berkeley': 'SC-01',
  'sc:dorchester': 'SC-06',
  // IL
  'il:kane': 'IL-11',
  'il:dupage': 'IL-08',
  // LA
  'la:west feliciana': 'LA-06',
  // GA additional
  'ga:walton': 'GA-10',
  // MD
  'md:montgomery': 'MD-08',
  'md:charles': 'MD-05',
};

// Officials shown on a DC detail panel:
//   - Both US senators for the state (always state-relevant)
//   - State governor (always state-relevant)
//   - The ONE US House rep whose district matches dc.house_district (or the
//     COUNTY_TO_HOUSE_DISTRICT fallback). If neither resolves, no House rep
//     is shown — better silent than wrong.
//   - Local officials whose body/title actually references the DC's county or city
//     (so a Memphis DC card stays Memphis-relevant, not all of Tennessee).
function resolveOfficialsForDc(dc: DataCenter): { official: Official; level: string }[] {
  const result: { official: Official; level: string }[] = [];
  const stateCode = dc.state;
  const county = dc.county?.toLowerCase() ?? '';
  const city = dc.city?.toLowerCase() ?? '';
  const district =
    dc.house_district ?? COUNTY_TO_HOUSE_DISTRICT[`${stateCode.toLowerCase()}:${county}`];

  for (const o of OFFICIALS) {
    if (o.state !== stateCode) continue;

    // Federal
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

    // State
    if (o.level === 'state') {
      result.push({ official: o, level: o.level });
      continue;
    }

    // Local — only if the body/title intersects the DC's county or city
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

// ─── Compact marker shape used by the map view ──────────────────────────

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

// ─── Public API ─────────────────────────────────────────────────────────

export function listDataCenters(filters: {
  status?: string[];
  states?: string[];
  search?: string;
  limit?: number;
} = {}): DcMarker[] {
  let rows: DataCenter[] = DATA_CENTERS;
  if (filters.status?.length) {
    rows = rows.filter((r) => filters.status!.includes(r.status));
  }
  if (filters.states?.length) {
    rows = rows.filter((r) => filters.states!.includes(r.state));
  }
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

export function getDataCenter(slug: string): DcDetail | null {
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

export function listOrganizations(): Organization[] {
  return ORGANIZATIONS;
}

export function getOrganization(slug: string): Organization | null {
  return orgBySlug.get(slug) ?? null;
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
  ownedBy: OrgRelation[];    // edges where this org is target of owns/acquired/subsidiary_of/invests_in
  controls: OrgRelation[];   // edges where this org is source of owns/acquired/subsidiary_of/invests_in
  supplies: OrgRelation[];   // outbound supplies / contracted_by / lobbies_for / partners_with / joint_venture
  suppliedBy: OrgRelation[]; // inbound versions of the above
  dataCenters: OrgDcLink[];  // DCs that reference this org in organization_slugs
}

const CONTROL_RELS = new Set(['owns', 'acquired', 'subsidiary_of', 'invests_in', 'joint_venture']);

export function getOrganizationDetail(slug: string): OrgDetail | null {
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

export function listOfficials(filters: { state?: string; level?: string } = {}): Official[] {
  let rows = OFFICIALS;
  if (filters.state) rows = rows.filter((o) => o.state === filters.state);
  if (filters.level) rows = rows.filter((o) => o.level === filters.level);
  return rows;
}

export function listEvents(filters: {
  state?: string;
  type?: string;
  status?: string;
  upcoming?: boolean;
  data_center?: string;
} = {}): Event[] {
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

export function getEvent(slug: string): Event | null {
  return eventBySlug.get(slug) ?? null;
}

// ─── Graph data ─────────────────────────────────────────────────────────

export function getGraphData(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const org of ORGANIZATIONS) {
    nodes.push({
      id: `org:${org.slug}`,
      name: org.name,
      category: 'organization',
      node_type: org.type,
      metric: org.estimated_lobbying_usd,
    });
  }

  for (const dc of DATA_CENTERS) {
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

  // Officials: limit to a representative subset (governors + senators) to keep graph readable
  const officialSubset = OFFICIALS.filter((o) =>
    o.title.includes('Governor') || o.title === 'US Senator',
  );
  for (const off of officialSubset) {
    nodes.push({
      id: `off:${off.id}`,
      name: off.name,
      category: 'official',
      node_type: off.level,
      state: off.state,
    });
    // Connect officials to data centers in their state
    const stateDcs = dcByState.get(off.state ?? '') ?? [];
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

// ─── Stats for nav-bar counter ──────────────────────────────────────────

export function getStats() {
  const totalDcs = DATA_CENTERS.length;
  const byStatus = DATA_CENTERS.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const byState = DATA_CENTERS.reduce((acc, d) => {
    acc[d.state] = (acc[d.state] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalMw = DATA_CENTERS.reduce((s, d) => s + (d.capacity_mw ?? 0), 0);
  const totalCapex = DATA_CENTERS.reduce((s, d) => s + (d.estimated_cost_usd ?? 0), 0);
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
  };
}
