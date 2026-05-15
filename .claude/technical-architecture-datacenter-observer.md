# DataCenterWatch — Technical Architecture

**Author:** Benjamin Life (@omniharmonic)
**Version:** 0.1 — MVP Architecture
**Date:** May 14, 2026

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                          │
│                                                                     │
│  Next.js 14 (App Router) on Vercel                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │
│  │ Map View │ │ Graph    │ │ Events   │ │ Learn  │ │ About     │  │
│  │ (Mapbox) │ │ (Force3D)│ │ (List)   │ │ (MDX)  │ │           │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬───┘ └───────────┘  │
│       │             │            │             │                     │
│  ┌────┴─────────────┴────────────┴─────────────┴──────────────────┐ │
│  │              Shared State (React Context + SWR)                │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                          HTTPS/REST
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                          API LAYER                                  │
│                                                                     │
│  Next.js Route Handlers (/app/api/*)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │/api/dc   │ │/api/orgs │ │/api/      │ │/api/     │              │
│  │          │ │          │ │officials  │ │events    │              │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘              │
│       │             │            │             │                     │
│  ┌────┴─────────────┴────────────┴─────────────┴──────────────────┐ │
│  │              Supabase Client (server-side)                     │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                           TCP/5432
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                        DATA LAYER                                   │
│                                                                     │
│  Supabase (Postgres + PostGIS + Row Level Security)                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │data_centers│ │organizations│ │ officials  │ │  events    │      │
│  │            │ │             │ │            │ │            │      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                     │
│  │ dc_orgs    │ │ org_rels   │ │ dc_officials│                     │
│  │ (junction) │ │ (junction) │ │ (junction)  │                     │
│  └────────────┘ └────────────┘ └────────────┘                     │
└─────────────────────────────────────────────────────────────────────┘

                    ▲  Populated by  ▲

┌─────────────────────────────────────────────────────────────────────┐
│                     DATA PIPELINE LAYER                             │
│                                                                     │
│  Claude Code Skills (run locally or via Vercel Cron)               │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐            │
│  │ DC Ingestion  │ │ Official      │ │ Event Scanner │            │
│  │ Skill         │ │ Resolver Skill│ │ Skill         │            │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘            │
│          │                 │                  │                     │
│  ┌───────┴───┐    ┌───────┴───────┐  ┌──────┴──────────┐         │
│  │FracTracker│    │Geocodio API   │  │datacentertracker│         │
│  │ArcGIS API │    │OpenStates v3  │  │News scraping    │         │
│  │Epoch AI   │    │congress-      │  │State PUC sites  │         │
│  │dctracker  │    │legislators    │  │                 │         │
│  └───────────┘    └───────────────┘  └─────────────────┘         │
│                                                                     │
│  ┌───────────────┐ ┌───────────────┐                               │
│  │ Corp Graph    │ │ Local Official│                               │
│  │ Enricher      │ │ Scraper       │                               │
│  └───────┬───────┘ └───────┬───────┘                               │
│  ┌───────┴───────┐ ┌───────┴───────┐                               │
│  │OpenSecrets    │ │City/county    │                               │
│  │OpenCorporates │ │gov websites   │                               │
│  │Senate LDA     │ │Cicero trial   │                               │
│  └───────────────┘ └───────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Core Stack

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | Next.js (App Router) | 14.x | SSR, API routes, Vercel-native, RSC support |
| **Language** | TypeScript | 5.x | Type safety across full stack |
| **Hosting** | Vercel | — | Zero-config, edge functions, cron jobs |
| **Database** | Supabase | — | Managed Postgres, PostGIS, auth, real-time |
| **Map** | Mapbox GL JS | 3.x | Best perf for large marker sets, clustering |
| **Map React wrapper** | react-map-gl | 7.x | Uber's React bindings for Mapbox GL |
| **3D Graph** | react-force-graph-3d | 1.x | WebGL force-directed graphs, lightweight |
| **Styling** | Tailwind CSS | 3.x | Rapid iteration, JIT |
| **Data fetching** | SWR | 2.x | Stale-while-revalidate, caching, dedup |
| **Icons** | Lucide React | 0.3x | Clean, consistent, tree-shakeable |
| **Markdown** | next-mdx-remote | 5.x | Static educational content from MDX |
| **Animation** | Framer Motion | 11.x | Panel transitions, micro-interactions |

### 2.2 Data Pipeline

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Scraping orchestrator** | Claude Code skill | Intelligent extraction, adaptable to varied page structures |
| **Geocoding** | Geocodio API | Districts + officials in one call, 2,500 free/day |
| **State legislature** | OpenStates v3 API | Hearings, bills, committee data |
| **Federal officials** | unitedstates/congress-legislators | CC0 YAML, canonical source |
| **Lobbying** | OpenSecrets bulk CSV | CC BY-NC-SA, comprehensive |
| **Corporate** | OpenCorporates API | Company registration, officers, subsidiaries |
| **Scheduled tasks** | Vercel Cron | Daily/weekly pipeline triggers |

### 2.3 External API Keys Required

| Service | Endpoint | Free Tier | Needed For |
|---------|----------|-----------|------------|
| Mapbox | mapbox.com | 50k map loads/mo | Map rendering |
| Geocodio | api.geocod.io/v1.7 | 2,500 lookups/day | Officials resolution |
| OpenStates | v3.openstates.org | Free w/ key | State bills, hearings |
| OpenSecrets | opensecrets.org/api | Free for NC | Lobbying data |
| Supabase | [project].supabase.co | 500MB DB, 2GB storage | Everything |

---

## 3. Database Schema

### 3.1 Core Entity Tables

```sql
-- Enable PostGIS for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- DATA CENTERS
-- ============================================================
CREATE TABLE data_centers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,

  -- Status lifecycle
  status        TEXT NOT NULL CHECK (status IN (
    'proposed', 'announced', 'permitting', 'approved',
    'under_construction', 'operational', 'paused', 'cancelled'
  )),

  -- Geography
  latitude      NUMERIC(10,7) NOT NULL,
  longitude     NUMERIC(10,7) NOT NULL,
  geom          GEOGRAPHY(Point, 4326), -- PostGIS point, auto-populated via trigger
  address       TEXT,
  city          TEXT,
  county        TEXT,
  state         TEXT NOT NULL,
  zip           TEXT,
  fips_county   TEXT, -- from Geocodio

  -- District mapping (populated by Geocodio)
  congressional_district    TEXT, -- e.g. "VA-10"
  state_senate_district     TEXT,
  state_house_district      TEXT,

  -- Project details
  operator         TEXT,  -- primary operator company name
  developer        TEXT,  -- developer if different from operator
  capacity_mw      NUMERIC,
  footprint_acres  NUMERIC,
  footprint_sqft   NUMERIC,
  water_usage_gpd  NUMERIC,  -- gallons per day
  cooling_method   TEXT,      -- air, water, closed loop, open loop, hybrid
  energy_source    TEXT,      -- grid, renewable, nuclear, gas, mixed
  estimated_cost   BIGINT,    -- USD
  announced_date   DATE,
  construction_start DATE,
  expected_completion DATE,
  description      TEXT,

  -- Provenance
  source_urls      TEXT[],    -- news articles, permit filings, primary sources
  source_datasets  TEXT[],    -- e.g. ['fractracker', 'epoch_ai', 'dctracker']
  last_scraped_at  TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,

  -- Timestamps
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-populate PostGIS geometry from lat/lng
CREATE OR REPLACE FUNCTION update_dc_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dc_geom
  BEFORE INSERT OR UPDATE OF latitude, longitude ON data_centers
  FOR EACH ROW EXECUTE FUNCTION update_dc_geom();

-- Indexes
CREATE INDEX idx_dc_geom ON data_centers USING GIST(geom);
CREATE INDEX idx_dc_state ON data_centers(state);
CREATE INDEX idx_dc_status ON data_centers(status);
CREATE INDEX idx_dc_operator ON data_centers(operator);
CREATE INDEX idx_dc_slug ON data_centers(slug);


-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN (
    'tech_company', 'cloud_provider', 'developer', 'investor',
    'pe_firm', 'construction', 'engineering', 'energy_utility',
    'lobbying_firm', 'government_body', 'consortium', 'other'
  )),
  description   TEXT,
  website       TEXT,
  logo_url      TEXT,
  headquarters  TEXT,
  ticker        TEXT,          -- stock ticker if public
  opencorporates_url TEXT,     -- link to OpenCorporates
  opensecrets_id     TEXT,     -- OpenSecrets org ID for lobbying data
  lobbying_total     BIGINT,   -- total lobbying spend (from OpenSecrets)
  lobbying_year      INT,      -- year of lobbying data

  source_urls   TEXT[],
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_type ON organizations(type);
CREATE INDEX idx_org_slug ON organizations(slug);


-- ============================================================
-- OFFICIALS
-- ============================================================
CREATE TABLE officials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  title           TEXT NOT NULL,  -- "US Senator", "State Representative", "Mayor"
  level           TEXT NOT NULL CHECK (level IN ('federal', 'state', 'local')),
  body            TEXT,           -- "US Senate", "CO State House", "Boulder City Council"
  chamber         TEXT,           -- "upper", "lower", null for local
  district        TEXT,           -- "CO-2", "HD-33", "Ward 3"
  state           TEXT,
  party           TEXT,
  seniority       INT,

  -- Contact info
  phone           TEXT,
  email           TEXT,
  office_address  TEXT,
  website         TEXT,
  contact_form    TEXT,

  -- Social media
  twitter         TEXT,
  facebook        TEXT,
  youtube         TEXT,

  -- Photos and cross-references
  photo_url       TEXT,
  bioguide_id     TEXT,          -- for Congress members
  govtrack_id     TEXT,
  opensecrets_id  TEXT,          -- cross-ref with lobbying data
  ocd_id          TEXT,          -- Open Civic Data identifier

  -- Provenance
  source          TEXT,          -- 'geocodio', 'openstates', 'congress-legislators', 'manual'
  last_verified_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_official_state ON officials(state);
CREATE INDEX idx_official_level ON officials(level);
CREATE INDEX idx_official_district ON officials(district);
CREATE UNIQUE INDEX idx_official_ocd ON officials(ocd_id) WHERE ocd_id IS NOT NULL;
CREATE UNIQUE INDEX idx_official_bioguide ON officials(bioguide_id) WHERE bioguide_id IS NOT NULL;


-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN (
    'public_comment', 'hearing', 'zoning_vote', 'protest', 'town_hall',
    'press_conference', 'community_meeting', 'moratorium', 'lawsuit',
    'legislation', 'project_withdrawal', 'petition', 'other'
  )),
  date            TIMESTAMPTZ NOT NULL,
  end_date        TIMESTAMPTZ,     -- for comment periods
  location        TEXT,
  state           TEXT,
  jurisdiction    TEXT,            -- city/county name
  description     TEXT,
  url             TEXT,            -- link to official notice or event page
  status          TEXT CHECK (status IN (
    'upcoming', 'in_progress', 'completed',
    'resolved_favorable', 'resolved_unfavorable', 'resolved_mixed'
  )),
  issue_category  TEXT,            -- water, zoning, environmental, noise, farmland, etc.

  source_url      TEXT,
  source_dataset  TEXT,            -- 'dctracker', 'openstates', 'scraped'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_date ON events(date);
CREATE INDEX idx_event_type ON events(type);
CREATE INDEX idx_event_state ON events(state);
```

### 3.2 Junction / Relationship Tables

```sql
-- ============================================================
-- DATA CENTER <-> ORGANIZATION relationships
-- ============================================================
CREATE TABLE dc_organizations (
  data_center_id    UUID REFERENCES data_centers(id) ON DELETE CASCADE,
  organization_id   UUID REFERENCES organizations(id) ON DELETE CASCADE,
  relationship      TEXT NOT NULL CHECK (relationship IN (
    'operates', 'develops', 'funds', 'constructs', 'supplies_energy',
    'owns', 'co_locates', 'joint_venture', 'permits', 'lobbies_for'
  )),
  description       TEXT,
  source_url        TEXT,
  PRIMARY KEY (data_center_id, organization_id, relationship)
);


-- ============================================================
-- DATA CENTER <-> OFFICIAL jurisdictional mapping
-- ============================================================
CREATE TABLE dc_officials (
  data_center_id    UUID REFERENCES data_centers(id) ON DELETE CASCADE,
  official_id       UUID REFERENCES officials(id) ON DELETE CASCADE,
  jurisdiction_type TEXT NOT NULL CHECK (jurisdiction_type IN (
    'us_senator', 'us_representative',
    'governor', 'state_senator', 'state_representative',
    'mayor', 'county_executive', 'council_member',
    'planning_commissioner', 'other'
  )),
  PRIMARY KEY (data_center_id, official_id)
);

CREATE INDEX idx_dc_officials_dc ON dc_officials(data_center_id);


-- ============================================================
-- DATA CENTER <-> EVENT links
-- ============================================================
CREATE TABLE dc_events (
  data_center_id    UUID REFERENCES data_centers(id) ON DELETE CASCADE,
  event_id          UUID REFERENCES events(id) ON DELETE CASCADE,
  PRIMARY KEY (data_center_id, event_id)
);


-- ============================================================
-- ORGANIZATION <-> ORGANIZATION relationships (powers the graph)
-- ============================================================
CREATE TABLE org_relationships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
  target_org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
  relationship      TEXT NOT NULL CHECK (relationship IN (
    'owns', 'subsidiary_of', 'invests_in', 'joint_venture',
    'lobbies_for', 'contracted_by', 'partners_with', 'supplies',
    'acquired', 'spun_off_from', 'funds'
  )),
  description       TEXT,  -- e.g. "Project Stargate joint venture"
  value             BIGINT, -- investment amount if applicable
  source_url        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orgrel_source ON org_relationships(source_org_id);
CREATE INDEX idx_orgrel_target ON org_relationships(target_org_id);


-- ============================================================
-- ORGANIZATION <-> OFFICIAL relationships (lobbying, donations)
-- ============================================================
CREATE TABLE org_officials (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID REFERENCES organizations(id) ON DELETE CASCADE,
  official_id       UUID REFERENCES officials(id) ON DELETE CASCADE,
  relationship      TEXT NOT NULL CHECK (relationship IN (
    'lobbies', 'donates_to', 'formerly_employed', 'advocates_for',
    'regulates', 'revolving_door'
  )),
  amount            BIGINT,       -- dollar amount if applicable
  cycle             TEXT,         -- e.g. "2024", "2025-2026"
  description       TEXT,
  source_url        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Materialized Views for Performance

```sql
-- ============================================================
-- MAP MARKERS: lightweight view for initial map load
-- Returns minimal data for all markers (fast)
-- ============================================================
CREATE MATERIALIZED VIEW mv_map_markers AS
SELECT
  dc.id,
  dc.slug,
  dc.name,
  dc.status,
  dc.latitude,
  dc.longitude,
  dc.state,
  dc.operator,
  dc.capacity_mw
FROM data_centers dc
ORDER BY dc.state, dc.name;

CREATE UNIQUE INDEX idx_mv_markers_id ON mv_map_markers(id);

-- Refresh nightly or after data pipeline runs
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_map_markers;


-- ============================================================
-- GRAPH DATA: pre-computed nodes and edges for force graph
-- ============================================================
CREATE MATERIALIZED VIEW mv_graph_nodes AS
  -- Organization nodes
  SELECT
    id,
    slug,
    name,
    type AS node_type,
    'organization' AS category,
    logo_url AS image,
    lobbying_total AS metric
  FROM organizations
UNION ALL
  -- Data center nodes
  SELECT
    id,
    slug,
    name,
    status AS node_type,
    'data_center' AS category,
    NULL AS image,
    capacity_mw AS metric
  FROM data_centers
UNION ALL
  -- Official nodes (federal only for graph, to keep it manageable)
  SELECT
    id,
    bioguide_id AS slug,
    name,
    party AS node_type,
    'official' AS category,
    photo_url AS image,
    NULL AS metric
  FROM officials
  WHERE level = 'federal' AND bioguide_id IS NOT NULL;

CREATE UNIQUE INDEX idx_mv_nodes_id ON mv_graph_nodes(id);

CREATE MATERIALIZED VIEW mv_graph_edges AS
  -- Org <-> Org
  SELECT source_org_id AS source, target_org_id AS target,
         relationship AS edge_type, value, description
  FROM org_relationships
UNION ALL
  -- Org <-> DC
  SELECT organization_id AS source, data_center_id AS target,
         relationship AS edge_type, NULL AS value, description
  FROM dc_organizations
UNION ALL
  -- Org <-> Official (lobbying/donations)
  SELECT organization_id AS source, official_id AS target,
         relationship AS edge_type, amount AS value, description
  FROM org_officials;
```

---

## 4. API Design

### 4.1 Route Structure

```
/app/api/
├── data-centers/
│   ├── route.ts              GET  — list all (supports filters)
│   └── [slug]/
│       └── route.ts          GET  — single DC with orgs, officials, events
├── organizations/
│   ├── route.ts              GET  — list all (supports type filter)
│   └── [slug]/
│       └── route.ts          GET  — single org with relationships
├── officials/
│   └── route.ts              GET  — list by state, level, district
├── events/
│   ├── route.ts              GET  — list (filterable)
│   └── [slug]/
│       └── route.ts          GET  — single event with linked DCs
├── graph/
│   └── route.ts              GET  — full node/edge data for visualization
├── search/
│   └── route.ts              GET  — full-text search across all entities
└── stats/
    └── route.ts              GET  — aggregate counts for dashboard
```

### 4.2 Key Endpoint Specifications

#### GET /api/data-centers

Returns markers for the map. Lightweight by default, full detail with `?expand=true`.

```typescript
// Query parameters
interface DCListParams {
  status?:   string;    // comma-separated: "announced,permitting,under_construction"
  state?:    string;    // two-letter: "VA,TX,OH"
  operator?: string;    // company name substring
  min_mw?:   number;    // minimum capacity
  max_mw?:   number;    // maximum capacity
  bounds?:   string;    // "sw_lat,sw_lng,ne_lat,ne_lng" — map viewport filter
  expand?:   boolean;   // include orgs, officials, events
  limit?:    number;    // default 500, max 2000
  offset?:   number;
}

// Response (compact mode, default)
interface DCMarker {
  id:          string;
  slug:        string;
  name:        string;
  status:      string;
  latitude:    number;
  longitude:   number;
  state:       string;
  operator:    string | null;
  capacity_mw: number | null;
}

// Response (expanded mode)
interface DCDetail extends DCMarker {
  // ... all data_center fields
  organizations: { name: string; type: string; relationship: string }[];
  officials:     { name: string; title: string; level: string; phone: string; email: string }[];
  events:        { title: string; type: string; date: string; status: string }[];
}
```

#### GET /api/graph

Returns pre-computed graph data for the 3D force visualization.

```typescript
interface GraphResponse {
  nodes: {
    id:        string;
    slug:      string;
    name:      string;
    node_type: string;   // org type, dc status, or party
    category:  'organization' | 'data_center' | 'official';
    image?:    string;
    metric?:   number;   // lobbying spend, MW capacity, etc.
  }[];
  edges: {
    source:    string;   // node id
    target:    string;   // node id
    edge_type: string;   // relationship name
    value?:    number;   // dollar amount
    label?:    string;   // description
  }[];
}
```

Implementation reads from materialized views for speed:

```typescript
// /app/api/graph/route.ts
export async function GET() {
  const supabase = createClient();

  const [{ data: nodes }, { data: edges }] = await Promise.all([
    supabase.from('mv_graph_nodes').select('*'),
    supabase.from('mv_graph_edges').select('*'),
  ]);

  return Response.json({ nodes, edges });
}
```

---

## 5. Frontend Architecture

### 5.1 App Router Layout

```
/app/
├── layout.tsx                 Root layout: nav, fonts, theme
├── page.tsx                   Map view (default landing)
├── graph/
│   └── page.tsx               3D force graph view
├── events/
│   ├── page.tsx               Events list with filters
│   └── [slug]/
│       └── page.tsx           Event detail
├── learn/
│   ├── page.tsx               Education hub
│   └── [slug]/
│       └── page.tsx           Individual article (MDX)
├── about/
│   └── page.tsx               Mission, methodology, open source
└── api/
    └── (route handlers as specified above)
```

### 5.2 Component Architecture

```
/components/
├── map/
│   ├── MapContainer.tsx       Full-viewport Mapbox wrapper
│   ├── DataCenterMarker.tsx   Custom marker with status color
│   ├── MarkerCluster.tsx      Supercluster integration
│   ├── MapControls.tsx        Filters, search, locate me
│   └── DetailPanel.tsx        Slide-in panel for selected DC
│       ├── ProjectInfo.tsx    Name, status, specs, sources
│       ├── OfficialsList.tsx  Grouped by level (fed/state/local)
│       ├── EventsList.tsx     Linked events for this DC
│       └── OrgsList.tsx       Related organizations
├── graph/
│   ├── ForceGraph.tsx         react-force-graph-3d wrapper
│   ├── GraphControls.tsx      Filter by node/edge type, search
│   ├── NodeTooltip.tsx        Hover info card
│   └── GraphInfoPanel.tsx     Click-to-expand detail
├── events/
│   ├── EventList.tsx          Filterable list
│   ├── EventCard.tsx          Individual event card
│   └── EventFilters.tsx       Type, state, date range
├── shared/
│   ├── Nav.tsx                Top navigation bar
│   ├── StatusBadge.tsx        Color-coded status pill
│   ├── ContactCard.tsx        Official contact info card
│   ├── SearchBar.tsx          Global search
│   ├── FilterChips.tsx        Reusable filter chip row
│   └── SourceCitation.tsx     Linked source attribution
└── learn/
    └── ArticleLayout.tsx      MDX article wrapper
```

### 5.3 State Management

Lightweight — no Redux. Use SWR for server data + React Context for UI state.

```typescript
// /lib/hooks/useDataCenters.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useDataCenters(filters?: DCListParams) {
  const params = new URLSearchParams(filters as Record<string, string>);
  return useSWR(`/api/data-centers?${params}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 min cache
  });
}

export function useDataCenter(slug: string) {
  return useSWR(`/api/data-centers/${slug}?expand=true`, fetcher);
}

export function useGraphData() {
  return useSWR('/api/graph', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 min cache — graph changes rarely
  });
}
```

```typescript
// /lib/context/MapContext.tsx
interface MapState {
  selectedDC: string | null;        // slug of selected data center
  filters: {
    status: string[];
    states: string[];
    minMW: number | null;
  };
  panelOpen: boolean;
}
```

### 5.4 Map Implementation

```typescript
// /components/map/MapContainer.tsx (key implementation details)
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import Supercluster from 'supercluster';

// Marker colors by status
const STATUS_COLORS: Record<string, string> = {
  proposed:           '#8B5CF6', // purple
  announced:          '#F59E0B', // amber
  permitting:         '#3B82F6', // blue
  approved:           '#60A5FA', // lighter blue
  under_construction: '#EF4444', // red
  operational:        '#10B981', // green
  paused:             '#6B7280', // gray
  cancelled:          '#374151', // dark gray
};

// Use Supercluster for marker clustering
// Feed GeoJSON points from /api/data-centers
// On click: set selectedDC in context, open DetailPanel
// On viewport change: re-query with bounds filter for performance
```

### 5.5 Graph Implementation

```typescript
// /components/graph/ForceGraph.tsx (key implementation details)
import ForceGraph3D from 'react-force-graph-3d';

// Node colors by category
const NODE_COLORS: Record<string, string> = {
  tech_company:    '#3B82F6',
  cloud_provider:  '#6366F1',
  developer:       '#8B5CF6',
  investor:        '#F59E0B',
  pe_firm:         '#F97316',
  construction:    '#EF4444',
  energy_utility:  '#10B981',
  lobbying_firm:   '#EC4899',
  data_center:     '#22D3EE',
  official:        '#94A3B8',
};

// Node size: proportional to metric (lobbying spend, MW, etc.)
// Edge width: proportional to value (investment amount)
// Edge color: by relationship type
// Click node: open info panel
// Hover node: highlight connected edges
// Camera: auto-orbit when idle, stop on interaction
```

---

## 6. Data Pipeline Architecture

### 6.1 Pipeline Overview

Each pipeline is a standalone Claude Code skill (or Node.js script) that:
1. Fetches from external sources
2. Transforms to our schema
3. Upserts into Supabase
4. Logs provenance (source, timestamp)

### 6.2 Data Center Ingestion Pipeline

```
STEP 1: Fetch FracTracker ArcGIS Feature Layer
─────────────────────────────────────────────
- Query: ArcGIS REST API endpoint for the data center feature service
- URL pattern: https://services[x].arcgis.com/.../FeatureServer/0/query
  ?where=1=1&outFields=*&f=json&resultRecordCount=2000
- Returns: JSON array of features with geometry + attributes
- Parse: Extract lat, lng, status, operator, MW, acreage, cooling, source URLs

STEP 2: Fetch datacentertracker.org CSV
─────────────────────────────────────────
- Download: CSV/JSON from datacentertracker.org
- Contains: community actions, legislation, investments, company, jurisdiction
- Parse: Cross-reference with FracTracker by location/company name

STEP 3: Fetch Epoch AI CSV
──────────────────────────
- Download: CSV from epoch.ai/data/data-centers
- Contains: capacity_mw, capital_cost, water_usage, build timeline
- Parse: Enrich existing records with deeper technical data

STEP 4: Deduplicate & Merge
────────────────────────────
- Match across datasets by: lat/lng proximity (< 1km) + operator name
- FracTracker = primary record (broadest coverage)
- Epoch AI = enrichment for capacity, cost, water
- dctracker = enrichment for community actions, investments
- Generate slug from: slugify(name + city + state)

STEP 5: Upsert to Supabase
───────────────────────────
- Upsert on slug (unique constraint)
- Preserve manually-added data (don't overwrite with nulls)
- Set source_datasets array: ['fractracker', 'epoch_ai', 'dctracker']
- Set last_scraped_at: now()
```

### 6.3 Official Resolution Pipeline

```
STEP 1: For each data_center, call Geocodio
────────────────────────────────────────────
- Endpoint: GET https://api.geocod.io/v1.7/reverse
  ?q={lat},{lng}&fields=cd,stateleg&api_key={KEY}
- Returns: congressional district, state legislative districts,
  and full legislator objects for each

STEP 2: Parse Geocodio response
───────────────────────────────
- Extract from response.results[0].fields:
  - cd.current_legislators[] → federal officials
  - stateleg.house[].current_legislators[] → state house reps
  - stateleg.senate[].current_legislators[] → state senators

STEP 3: Upsert officials
─────────────────────────
- Upsert into officials table, keyed on bioguide_id (federal)
  or ocd_id (state)
- Prevents duplicates when multiple data centers share an official

STEP 4: Create dc_officials junction records
─────────────────────────────────────────────
- Link data_center → official with jurisdiction_type
- One data center typically gets: 2 senators, 1 rep, 1 governor,
  1 state senator, 1 state rep = ~6 officials

STEP 5: Local officials (separate, targeted skill)
───────────────────────────────────────────────────
- For top-priority jurisdictions only
- Scrape city/county government website
- Parse council member pages for: name, title, phone, email
- Insert with source = 'manual' and jurisdiction_type
```

### 6.4 Event Ingestion Pipeline

```
STEP 1: Ingest datacentertracker.org actions
────────────────────────────────────────────
- Parse the community actions CSV/JSON
- Map action types → our event types
- Cross-reference jurisdiction + company → data_center_id

STEP 2: Query OpenStates for hearings
──────────────────────────────────────
- Endpoint: GET https://v3.openstates.org/bills
  ?q=data+center&updated_since={last_run}&include=votes
- Also check committee hearing schedules
- Filter for bills related to data centers, zoning, energy

STEP 3: News scraping (daily)
─────────────────────────────
- Google News search: "data center" + (hearing OR protest
  OR moratorium OR public comment)
- Claude skill extracts: title, date, location, type, URL
- Deduplicates against existing events

STEP 4: Upsert events + link to data centers
─────────────────────────────────────────────
```

### 6.5 Corporate Graph Enrichment Pipeline

```
STEP 1: Seed major organizations manually
──────────────────────────────────────────
- The ~50 key players are well-known enough to seed by hand:
  Microsoft, Google/Alphabet, Meta, Amazon/AWS, Oracle, xAI,
  CoreWeave, QTS, Vantage, Equinix, Digital Realty, CyrusOne,
  Blackstone, KKR, Brookfield, SoftBank, MGX, etc.

STEP 2: Seed major relationships manually
──────────────────────────────────────────
- Project Stargate: OpenAI + SoftBank + Oracle + MGX
- Meta → QTS (partnership)
- Blackstone → QTS (acquisition)
- Microsoft → AI data center buildout
- CoreWeave → NVIDIA (investor relationship)

STEP 3: Enrich with OpenSecrets
───────────────────────────────
- For each org with an opensecrets_id:
  GET https://www.opensecrets.org/api/?method=orgSummary&id={ID}
- Pull: total lobbying spend, top recipients
- For officials: check if they receive from tech/data center orgs

STEP 4: Verify with OpenCorporates (spot-check)
────────────────────────────────────────────────
- For corporate ownership claims, verify via:
  GET https://api.opencorporates.com/v0.4/companies/search?q={name}
- Confirm subsidiary relationships

STEP 5: Refresh materialized views
───────────────────────────────────
- After any graph data changes:
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_graph_nodes;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_graph_edges;
```

### 6.6 Pipeline Schedule

| Pipeline | Trigger | Cadence | Est. Duration |
|----------|---------|---------|---------------|
| DC Ingestion | Vercel Cron | Weekly (full), Daily (delta) | 5-10 min |
| Official Resolution | Vercel Cron | Monthly + after elections | 2-3 min |
| Event Scanner | Vercel Cron | Daily | 5 min |
| Corp Graph Enrichment | Manual + Vercel Cron | Weekly | 3-5 min |
| Materialized View Refresh | Post-pipeline hook | After each pipeline | < 30 sec |

---

## 7. Deployment Architecture

### 7.1 Vercel Configuration

```jsonc
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],  // US East (close to most data center clusters)
  "crons": [
    {
      "path": "/api/cron/events",
      "schedule": "0 6 * * *"        // daily at 6am UTC
    },
    {
      "path": "/api/cron/data-centers",
      "schedule": "0 4 * * 1"        // weekly Monday 4am UTC
    },
    {
      "path": "/api/cron/officials",
      "schedule": "0 3 1 * *"        // monthly 1st at 3am UTC
    },
    {
      "path": "/api/cron/refresh-views",
      "schedule": "0 7 * * *"        // daily after pipelines
    }
  ]
}
```

### 7.2 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx

SUPABASE_SERVICE_ROLE_KEY=eyJxxx   # server-side only
GEOCODIO_API_KEY=xxx
OPENSTATES_API_KEY=xxx
OPENSECRETS_API_KEY=xxx
CRON_SECRET=xxx                     # protect cron endpoints
```

### 7.3 Supabase Configuration

```sql
-- Row Level Security: all tables readable by anon
ALTER TABLE data_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON data_centers FOR SELECT USING (true);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON organizations FOR SELECT USING (true);

ALTER TABLE officials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON officials FOR SELECT USING (true);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON events FOR SELECT USING (true);

-- Junction tables
ALTER TABLE dc_organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON dc_organizations FOR SELECT USING (true);

ALTER TABLE dc_officials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON dc_officials FOR SELECT USING (true);

ALTER TABLE dc_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON dc_events FOR SELECT USING (true);

ALTER TABLE org_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON org_relationships FOR SELECT USING (true);

ALTER TABLE org_officials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON org_officials FOR SELECT USING (true);

-- Write access: service role only (pipeline uses service key)
```

---

## 8. Performance Strategy

### 8.1 Initial Map Load

The map needs to render 1,400+ markers fast. Strategy:

1. **Materialized view** (`mv_map_markers`) returns only 6 fields per marker — ~200 bytes each
2. **Single fetch** on mount: `/api/data-centers` returns all markers (~280KB for 1,400 records)
3. **Supercluster** (client-side): clusters markers at low zoom, expands at zoom 8+
4. **Viewport filtering**: at high zoom, API accepts `bounds` parameter to return only visible markers
5. **SWR cache**: markers cached for 60 seconds, background revalidation

Expected: initial map render < 1 second on broadband.

### 8.2 Graph Performance

3D force graph with ~500 nodes and ~1,000 edges.

1. **Materialized views** for pre-computed node/edge data
2. **Single fetch** on mount: `/api/graph` returns complete graph (~500KB)
3. **WebGL rendering** via three.js (inside react-force-graph-3d) handles thousands of elements
4. **Level-of-detail**: show labels only on hover/click, not all at once
5. **Filter state**: toggling node/edge types re-filters client-side, no refetch

### 8.3 Detail Panel

When clicking a data center marker:

1. **Optimistic render**: show marker info immediately from cached list data
2. **Fetch detail**: `/api/data-centers/[slug]?expand=true` loads officials, orgs, events
3. **Stale-while-revalidate**: show cached detail if available, refetch in background

---

## 9. Design System Tokens

```css
/* /app/globals.css — design tokens */
:root {
  /* Colors */
  --bg-primary:     #0A0F1C;     /* deep navy */
  --bg-surface:     #111827;     /* card backgrounds */
  --bg-elevated:    #1F2937;     /* hover states, panels */
  --accent-cyan:    #22D3EE;     /* primary interactive */
  --accent-cyan-dim:#0E7490;     /* secondary interactive */
  --text-primary:   #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted:     #64748B;
  --border:         #1E293B;

  /* Status colors */
  --status-proposed:       #8B5CF6;
  --status-announced:      #F59E0B;
  --status-permitting:     #3B82F6;
  --status-approved:       #60A5FA;
  --status-construction:   #EF4444;
  --status-operational:    #10B981;
  --status-paused:         #6B7280;
  --status-cancelled:      #374151;

  /* Graph node colors */
  --node-tech:         #3B82F6;
  --node-investor:     #F59E0B;
  --node-construction: #EF4444;
  --node-energy:       #10B981;
  --node-lobbying:     #EC4899;
  --node-datacenter:   #22D3EE;
  --node-official:     #94A3B8;

  /* Typography */
  --font-display: 'JetBrains Mono', monospace;
  --font-body:    'IBM Plex Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Spacing scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Panel width */
  --panel-width: 420px;
}
```

---

## 10. File/Folder Structure

```
datacenter-observer/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Map view
│   ├── graph/page.tsx                # 3D graph
│   ├── events/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── learn/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── about/page.tsx
│   ├── api/
│   │   ├── data-centers/
│   │   │   ├── route.ts
│   │   │   └── [slug]/route.ts
│   │   ├── organizations/
│   │   │   ├── route.ts
│   │   │   └── [slug]/route.ts
│   │   ├── officials/route.ts
│   │   ├── events/
│   │   │   ├── route.ts
│   │   │   └── [slug]/route.ts
│   │   ├── graph/route.ts
│   │   ├── search/route.ts
│   │   ├── stats/route.ts
│   │   └── cron/
│   │       ├── data-centers/route.ts
│   │       ├── events/route.ts
│   │       ├── officials/route.ts
│   │       └── refresh-views/route.ts
│   └── globals.css
├── components/
│   ├── map/
│   ├── graph/
│   ├── events/
│   ├── shared/
│   └── learn/
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client (service role)
│   │   └── types.ts                # Generated types from schema
│   ├── hooks/
│   │   ├── useDataCenters.ts
│   │   ├── useGraphData.ts
│   │   ├── useEvents.ts
│   │   └── useOfficials.ts
│   ├── context/
│   │   └── MapContext.tsx
│   ├── utils/
│   │   ├── slugify.ts
│   │   ├── formatters.ts
│   │   └── geo.ts
│   └── constants.ts                 # Status colors, node colors, etc.
├── content/
│   └── learn/                       # MDX articles
│       ├── what-are-data-centers.mdx
│       ├── how-to-participate.mdx
│       ├── follow-the-money.mdx
│       └── glossary.mdx
├── pipeline/
│   ├── ingest-data-centers.ts       # FracTracker + Epoch + dctracker
│   ├── resolve-officials.ts         # Geocodio batch
│   ├── scan-events.ts               # dctracker + OpenStates + news
│   ├── enrich-graph.ts              # OpenSecrets + OpenCorporates
│   └── seed/
│       ├── organizations.json       # Manual seed: major orgs
│       ├── relationships.json       # Manual seed: org-org edges
│       └── local-officials.json     # Manual seed: priority jurisdictions
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql           # Core tables
│       ├── 002_junctions.sql        # Junction tables
│       ├── 003_views.sql            # Materialized views
│       └── 004_rls.sql              # Row level security
├── public/
│   └── images/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
├── package.json
├── LICENSE                           # AGPL-3.0
├── CONTRIBUTING.md
└── README.md
```

---

## 11. MVP Build Sequence (1-Day Sprint)

### Hour 0-1: Scaffold & Infrastructure

```bash
npx create-next-app@latest datacenter-observer --typescript --tailwind --app --src=false
cd datacenter-observer
npm install @supabase/supabase-js react-map-gl mapbox-gl supercluster
npm install react-force-graph-3d three swr framer-motion
npm install @next/mdx next-mdx-remote lucide-react
npm install -D @types/supercluster supabase
```

- Create Supabase project, run migration SQL
- Set up Mapbox account, get token
- Connect repo to Vercel
- Configure env vars in Vercel dashboard

### Hour 1-3: Data Pipeline + Seeding

- Run Claude scraping skill against FracTracker ArcGIS endpoint
- Download datacentertracker.org CSV
- Download Epoch AI CSV
- Merge/dedup into Supabase `data_centers` table
- Batch Geocodio calls for all data centers → populate `officials` + `dc_officials`
- Manually seed `organizations` and `org_relationships` from prepared JSON

### Hour 3-5: Map View

- Implement MapContainer with react-map-gl
- Load markers from `/api/data-centers`
- Color-code by status, cluster with Supercluster
- Build DetailPanel with slide-in animation
- Wire up official list, org list, event list in panel
- GeolocateControl ("near me" button)
- Filter bar: status chips, state dropdown

### Hour 5-7: Graph View + Events

- Implement ForceGraph page with react-force-graph-3d
- Load from `/api/graph`, render nodes/edges with proper colors
- Node click → info panel
- Search/filter controls
- Build Events list page with filters
- Event cards with status badges and countdown for deadlines

### Hour 7-9: Education + Polish + Deploy

- Create MDX articles for /learn section
- About page with methodology, attribution, open source links
- Responsive pass (mobile bottom sheet for detail panel)
- SEO meta tags
- Final Vercel deploy
- README, LICENSE, CONTRIBUTING

---

## 12. Attribution Requirements

All displayed on the About page and in a footer attribution bar:

```
Data Sources:
• Data center locations: FracTracker Alliance, datacentertracker.org (CC BY 4.0),
  Epoch AI (CC BY)
• Elected officials: Geocodio, unitedstates project (CC0)
• State legislative data: OpenStates / Plural Policy
• Lobbying & campaign finance: OpenSecrets (CC BY-NC-SA 3.0)
• Corporate data: OpenCorporates
• Lobbying disclosures: U.S. Senate Office of Public Records (LDA.gov)
• Map tiles: Mapbox / OpenStreetMap contributors
```

---

*Built in the open by Benjamin Life (@omniharmonic)*
*datacenter.observer — civic intelligence for the age of AI infrastructure*
