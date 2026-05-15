# DataCenterWatch — Implementation Plan

**Author:** Benjamin Life (@omniharmonic)
**Version:** 0.1 — MVP Implementation
**Date:** May 14, 2026

---

## Dependency Graph Overview

```
PHASE 0: Infrastructure
  ├── 0.1 Project scaffold ─────────────────────────┐
  ├── 0.2 Supabase setup ──────────────────────────┐│
  ├── 0.3 Mapbox setup                             ││
  └── 0.4 API key provisioning                     ││
                                                    ││
PHASE 1: Data Pipeline                              ││
  ├── 1.1 Schema migration ◄───────────────────────┘│
  ├── 1.2 DC ingestion skill ◄──────────────────────┘
  │     ├── 1.2a FracTracker extraction
  │     ├── 1.2b dctracker.org CSV
  │     └── 1.2c Epoch AI CSV
  ├── 1.3 Merge + dedup + load ◄── 1.2
  ├── 1.4 Official resolution ◄── 1.3
  │     ├── 1.4a Geocodio batch
  │     ├── 1.4b Junction records
  │     └── 1.4c Local official seed
  ├── 1.5 Org + graph seed ◄── 1.1
  ├── 1.6 Event ingestion ◄── 1.3
  └── 1.7 Materialized view refresh ◄── 1.3, 1.4, 1.5, 1.6

PHASE 2: API Layer                                   
  ├── 2.1 Supabase client config ◄── 0.1, 0.2
  ├── 2.2 /api/data-centers ◄── 2.1
  ├── 2.3 /api/graph ◄── 2.1
  ├── 2.4 /api/events ◄── 2.1
  ├── 2.5 /api/officials ◄── 2.1
  ├── 2.6 /api/search ◄── 2.1
  └── 2.7 /api/stats ◄── 2.1

PHASE 3: Map View
  ├── 3.1 Layout + nav ◄── 0.1
  ├── 3.2 Map container ◄── 0.3, 3.1
  ├── 3.3 Marker rendering ◄── 2.2, 3.2
  ├── 3.4 Clustering ◄── 3.3
  ├── 3.5 Detail panel ◄── 2.2, 3.3
  │     ├── 3.5a Project info
  │     ├── 3.5b Officials list
  │     ├── 3.5c Org badges
  │     └── 3.5d Event timeline
  ├── 3.6 Filter bar ◄── 3.3
  └── 3.7 Geolocation ◄── 3.2

PHASE 4: Graph View
  ├── 4.1 Force graph page ◄── 2.3, 3.1
  ├── 4.2 Node/edge rendering ◄── 4.1
  ├── 4.3 Graph info panel ◄── 4.2
  └── 4.4 Graph controls ◄── 4.2

PHASE 5: Events + Education
  ├── 5.1 Events list page ◄── 2.4, 3.1
  ├── 5.2 Learn section (MDX) ◄── 3.1
  └── 5.3 About page ◄── 3.1

PHASE 6: Polish + Deploy
  ├── 6.1 Responsive pass ◄── 3.*, 4.*, 5.*
  ├── 6.2 SEO + meta ◄── 3.1
  ├── 6.3 Vercel cron config ◄── 1.*
  ├── 6.4 README + LICENSE ◄── all
  └── 6.5 Production deploy ◄── all
```

---

## Phase 0: Infrastructure Setup

**Duration:** 30 minutes
**Dependencies:** None
**Parallelizable:** All tasks in this phase can run simultaneously

---

### Task 0.1: Project Scaffold

```bash
# Initialize Next.js 14 with TypeScript + Tailwind + App Router
npx create-next-app@latest datacenter-observer \
  --typescript --tailwind --app --src=false --import-alias "@/*"

cd datacenter-observer

# Core dependencies
npm install @supabase/supabase-js@latest \
  react-map-gl@7 mapbox-gl@3 \
  supercluster @types/supercluster \
  swr \
  framer-motion \
  lucide-react \
  next-mdx-remote

# 3D graph (install separately — large peer deps)
npm install react-force-graph-3d three

# Dev dependencies
npm install -D supabase
```

**Subtask 0.1a:** Create folder structure

```bash
mkdir -p app/{graph,events/{[slug]},learn/{[slug]},about}
mkdir -p app/api/{data-centers/{[slug]},organizations/{[slug]},officials,events/{[slug]},graph,search,stats,cron/{data-centers,events,officials,refresh-views}}
mkdir -p components/{map,graph,events,shared,learn}
mkdir -p lib/{supabase,hooks,context,utils}
mkdir -p content/learn
mkdir -p pipeline/seed
mkdir -p supabase/migrations
```

**Subtask 0.1b:** Configure fonts and base CSS

```typescript
// app/layout.tsx
import { JetBrains_Mono, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  title: 'datacenter.observer — Civic Intelligence for AI Infrastructure',
  description:
    'Track AI data centers being built near you. Find your elected officials. Follow the money. Make your voice heard.',
  openGraph: {
    title: 'datacenter.observer',
    description: 'Track AI data centers. Find officials. Follow the money.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetbrains.variable} ${ibmPlex.variable}`}>
      <body className="bg-[#0A0F1C] text-slate-100 font-body antialiased">
        {children}
      </body>
    </html>
  );
}
```

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary:     #0A0F1C;
    --bg-surface:     #111827;
    --bg-elevated:    #1F2937;
    --accent-cyan:    #22D3EE;
    --accent-cyan-dim:#0E7490;
    --text-primary:   #F1F5F9;
    --text-secondary: #94A3B8;
    --text-muted:     #64748B;
    --border:         #1E293B;
    --panel-width:    420px;
  }

  /* Mapbox overrides for dark theme */
  .mapboxgl-popup-content {
    background: var(--bg-surface) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;
    padding: 12px !important;
  }
  .mapboxgl-popup-tip {
    border-top-color: var(--bg-surface) !important;
  }
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* Status marker pulse animation */
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}
.marker-pulse::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: pulse-ring 2s ease-out infinite;
  background: inherit;
}
```

**Subtask 0.1c:** Tailwind config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-display)', 'monospace'],
      },
      colors: {
        surface: '#111827',
        elevated: '#1F2937',
        accent: {
          cyan: '#22D3EE',
          'cyan-dim': '#0E7490',
        },
        status: {
          proposed: '#8B5CF6',
          announced: '#F59E0B',
          permitting: '#3B82F6',
          approved: '#60A5FA',
          construction: '#EF4444',
          operational: '#10B981',
          paused: '#6B7280',
          cancelled: '#374151',
        },
        node: {
          tech: '#3B82F6',
          investor: '#F59E0B',
          construction: '#EF4444',
          energy: '#10B981',
          lobbying: '#EC4899',
          datacenter: '#22D3EE',
          official: '#94A3B8',
        },
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-up': 'slideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### Task 0.2: Supabase Setup

**Subtask 0.2a:** Create Supabase project at supabase.com — name: `datacenter-observer`

**Subtask 0.2b:** Enable PostGIS extension via SQL editor:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Subtask 0.2c:** Run schema migrations (copy from Technical Architecture §3.1, §3.2, §3.3)

**Subtask 0.2d:** Run RLS policies (copy from Technical Architecture §7.3)

---

### Task 0.3: Mapbox Setup

- Create account at mapbox.com
- Generate public access token
- Create custom dark map style (or use `mapbox://styles/mapbox/dark-v11` as starting point)
- Add token to `.env.local`

---

### Task 0.4: API Key Provisioning

| Service | URL | Action |
|---------|-----|--------|
| Geocodio | geocod.io | Create free account, generate API key |
| OpenStates | open.pluralpolicy.com | Register, get API key |
| OpenSecrets | opensecrets.org/api | Register for API access |
| Congress.gov | api.data.gov | Get API key |

Store all keys in `.env.local` and Vercel dashboard.

---

## Phase 1: Data Pipeline

**Duration:** 2-3 hours
**Dependencies:** Phase 0 complete
**Critical path:** This phase gates Phases 2-5. Prioritize 1.1 → 1.2 → 1.3 → 1.4.

---

### Task 1.1: Schema Migration

**Dependencies:** 0.2
**Effort:** 15 min

Run the full SQL schema from the Technical Architecture document via Supabase SQL editor. Verify tables exist with `\dt` in the SQL editor.

---

### Task 1.2: Data Center Ingestion

**Dependencies:** 1.1
**Effort:** 60 min

This is the most complex pipeline task. We ingest from three sources, merge, and load.

**Subtask 1.2a:** FracTracker ArcGIS extraction

```typescript
// pipeline/ingest-data-centers.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Step 1: Fetch FracTracker data via ArcGIS Feature Service ───
// The ArcGIS dashboard at experience.arcgis.com wraps a Feature Service.
// We need to find the underlying REST endpoint. Common pattern:
// https://services{n}.arcgis.com/{orgId}/arcgis/rest/services/{serviceName}/FeatureServer/0/query

async function fetchFracTracker(): Promise<RawDCRecord[]> {
  const FEATURE_SERVICE_URL =
    // This URL needs to be discovered by inspecting the ArcGIS dashboard
    // network requests. Typical pattern:
    'https://services1.arcgis.com/XXXXX/arcgis/rest/services/Data_Centers/FeatureServer/0/query';

  const records: RawDCRecord[] = [];
  let offset = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      where: '1=1',
      outFields: '*',
      f: 'json',
      resultRecordCount: batchSize.toString(),
      resultOffset: offset.toString(),
      orderByFields: 'OBJECTID ASC',
    });

    const response = await fetch(`${FEATURE_SERVICE_URL}?${params}`);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      hasMore = false;
      break;
    }

    for (const feature of data.features) {
      const attrs = feature.attributes;
      const geom = feature.geometry;

      records.push({
        source: 'fractracker',
        name: attrs.Name || attrs.Facility_Name || attrs.FACILITY,
        latitude: geom?.y ?? attrs.Latitude,
        longitude: geom?.x ?? attrs.Longitude,
        status: mapFracTrackerStatus(attrs.Status),
        operator: attrs.Operator || attrs.Company || attrs.Operating_Company,
        capacity_mw: parseNumeric(attrs.MW || attrs.Energy_Demand_MW),
        footprint_acres: parseNumeric(attrs.Acreage || attrs.Acres),
        footprint_sqft: parseNumeric(attrs.Square_Feet || attrs.Sq_Ft),
        cooling_method: attrs.Cooling_Method || attrs.Cooling_Type,
        energy_source: attrs.Power_Source || attrs.Energy_Source,
        city: attrs.City,
        county: attrs.County,
        state: attrs.State,
        address: attrs.Address,
        source_url: attrs.Source || attrs.URL,
      });
    }

    offset += batchSize;
    console.log(`  FracTracker: fetched ${records.length} records...`);
  }

  return records;
}

// Map FracTracker's status values to our enum
function mapFracTrackerStatus(raw: string | null): string {
  if (!raw) return 'proposed';
  const s = raw.toLowerCase().trim();
  if (s.includes('propos') || s.includes('planned') || s.includes('announc')) return 'announced';
  if (s.includes('permit') || s.includes('review') || s.includes('approv')) return 'permitting';
  if (s.includes('construct') || s.includes('building') || s.includes('site prep')) return 'under_construction';
  if (s.includes('operat') || s.includes('active') || s.includes('online')) return 'operational';
  if (s.includes('paus') || s.includes('halt') || s.includes('cancel') || s.includes('withdraw')) return 'paused';
  return 'proposed';
}

function parseNumeric(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}
```

**Subtask 1.2b:** datacentertracker.org CSV ingestion

```typescript
// Continuation of pipeline/ingest-data-centers.ts

async function fetchDCTracker(): Promise<RawActionRecord[]> {
  // datacentertracker.org exposes CSV/JSON downloads
  // The site has a "Download CSV" and "Download JSON" button
  const response = await fetch('https://datacentertracker.org/data/actions.json');
  const actions = await response.json();

  // This dataset is community ACTIONS, not facilities.
  // We extract: jurisdiction, company, investment amount, action type, status
  return actions.map((a: any) => ({
    date: a.date,
    jurisdiction: a.jurisdiction,
    state: a.state,
    action_type: a.action,
    issue: a.issue,
    status: a.status,
    company: a.company,
    investment: a.investment,
    source_url: a.source,
  }));
}
```

**Subtask 1.2c:** Epoch AI CSV ingestion

```typescript
async function fetchEpochAI(): Promise<RawDCRecord[]> {
  // Epoch AI provides CSV download at epoch.ai/data/data-centers
  // Download the CSV manually or fetch if they have a stable URL
  // Fields: name, owner, users, country, state, city, lat, lng,
  //         power_capacity_mw, compute_capacity, capital_cost_usd,
  //         status, water_usage, cooling_type

  const response = await fetch('https://epoch.ai/data/data-centers/download/csv');
  const csvText = await response.text();

  // Parse CSV (use a lightweight parser)
  const rows = parseCSV(csvText);

  return rows
    .filter((r: any) => r.country === 'United States')
    .map((r: any) => ({
      source: 'epoch_ai',
      name: r.name,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      status: mapEpochStatus(r.status),
      operator: r.owner,
      capacity_mw: parseNumeric(r.power_capacity_mw),
      estimated_cost: parseNumeric(r.capital_cost_usd),
      city: r.city,
      state: r.state,
      cooling_method: r.cooling_type,
      source_url: r.source_url,
    }));
}
```

---

### Task 1.3: Merge, Deduplicate, and Load

**Dependencies:** 1.2a, 1.2b, 1.2c
**Effort:** 30 min

```typescript
// pipeline/ingest-data-centers.ts (continued)

interface MergedDC {
  slug: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  county: string | null;
  state: string;
  operator: string | null;
  developer: string | null;
  capacity_mw: number | null;
  footprint_acres: number | null;
  footprint_sqft: number | null;
  cooling_method: string | null;
  energy_source: string | null;
  estimated_cost: number | null;
  source_urls: string[];
  source_datasets: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// Haversine distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mergeDatasets(
  fractracker: RawDCRecord[],
  epoch: RawDCRecord[],
): MergedDC[] {
  // FracTracker is the primary dataset — start with it
  const merged: MergedDC[] = fractracker.map((ft) => ({
    slug: slugify(`${ft.name}-${ft.city || ''}-${ft.state}`),
    name: ft.name,
    status: ft.status,
    latitude: ft.latitude,
    longitude: ft.longitude,
    address: ft.address || null,
    city: ft.city || null,
    county: ft.county || null,
    state: ft.state,
    operator: ft.operator || null,
    developer: null,
    capacity_mw: ft.capacity_mw,
    footprint_acres: ft.footprint_acres,
    footprint_sqft: ft.footprint_sqft,
    cooling_method: ft.cooling_method || null,
    energy_source: ft.energy_source || null,
    estimated_cost: null,
    source_urls: ft.source_url ? [ft.source_url] : [],
    source_datasets: ['fractracker'],
  }));

  // Enrich with Epoch AI data by proximity matching
  for (const ep of epoch) {
    const match = merged.find(
      (m) =>
        haversineKm(m.latitude, m.longitude, ep.latitude, ep.longitude) < 1.0 &&
        (m.operator?.toLowerCase().includes(ep.operator?.toLowerCase() || '___') ||
         ep.operator?.toLowerCase().includes(m.operator?.toLowerCase() || '___'))
    );

    if (match) {
      // Enrich existing record (don't overwrite with nulls)
      match.capacity_mw = match.capacity_mw ?? ep.capacity_mw;
      match.estimated_cost = match.estimated_cost ?? ep.estimated_cost;
      match.cooling_method = match.cooling_method ?? ep.cooling_method;
      if (ep.source_url) match.source_urls.push(ep.source_url);
      if (!match.source_datasets.includes('epoch_ai')) {
        match.source_datasets.push('epoch_ai');
      }
    } else {
      // New record from Epoch AI not in FracTracker
      merged.push({
        slug: slugify(`${ep.name}-${ep.city || ''}-${ep.state}`),
        name: ep.name,
        status: ep.status,
        latitude: ep.latitude,
        longitude: ep.longitude,
        address: null,
        city: ep.city || null,
        county: null,
        state: ep.state,
        operator: ep.operator || null,
        developer: null,
        capacity_mw: ep.capacity_mw,
        footprint_acres: null,
        footprint_sqft: null,
        cooling_method: ep.cooling_method || null,
        energy_source: null,
        estimated_cost: ep.estimated_cost,
        source_urls: ep.source_url ? [ep.source_url] : [],
        source_datasets: ['epoch_ai'],
      });
    }
  }

  // Deduplicate slugs (append counter if needed)
  const slugCounts = new Map<string, number>();
  for (const dc of merged) {
    const count = slugCounts.get(dc.slug) || 0;
    if (count > 0) dc.slug = `${dc.slug}-${count}`;
    slugCounts.set(dc.slug, count + 1);
  }

  return merged;
}

// ─── Load into Supabase ───
async function loadDataCenters(records: MergedDC[]) {
  console.log(`Loading ${records.length} data centers into Supabase...`);

  // Upsert in batches of 100
  for (let i = 0; i < records.length; i += 100) {
    const batch = records.slice(i, i + 100);

    const { error } = await supabase
      .from('data_centers')
      .upsert(
        batch.map((r) => ({
          ...r,
          last_scraped_at: new Date().toISOString(),
        })),
        { onConflict: 'slug' }
      );

    if (error) {
      console.error(`  Batch ${i / 100 + 1} error:`, error.message);
    } else {
      console.log(`  Loaded batch ${i / 100 + 1} (${Math.min(i + 100, records.length)}/${records.length})`);
    }
  }
}
```

---

### Task 1.4: Official Resolution via Geocodio

**Dependencies:** 1.3
**Effort:** 30 min

```typescript
// pipeline/resolve-officials.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GEOCODIO_KEY = process.env.GEOCODIO_API_KEY!;

interface GeocodioLegislator {
  type: string;        // "representative", "senator"
  bio: {
    last_name: string;
    first_name: string;
    birthday: string;
    gender: string;
    party: string;
    seniority?: number;
  };
  contact: {
    url: string;
    address: string;
    phone: string;
    contact_form?: string;
  };
  social: {
    twitter?: string;
    facebook?: string;
    youtube?: string;
  };
  references: {
    bioguide_id: string;
    govtrack_id: string;
    opensecrets_id: string;
  };
  source: string;
}

// ─── Step 1: Fetch all data centers needing official resolution ───
async function resolveAllOfficials() {
  const { data: dataCenters, error } = await supabase
    .from('data_centers')
    .select('id, slug, latitude, longitude, state')
    .order('state');

  if (error || !dataCenters) {
    console.error('Failed to fetch data centers:', error);
    return;
  }

  console.log(`Resolving officials for ${dataCenters.length} data centers...`);

  // Process in batches to respect Geocodio rate limits
  for (let i = 0; i < dataCenters.length; i++) {
    const dc = dataCenters[i];
    console.log(`  [${i + 1}/${dataCenters.length}] ${dc.slug}`);

    try {
      await resolveOfficialsForDC(dc);
    } catch (err) {
      console.error(`  Error for ${dc.slug}:`, err);
    }

    // Rate limit: ~200/minute for Geocodio free tier
    if (i % 50 === 49) {
      console.log('  Pausing for rate limit...');
      await sleep(15000);
    }
  }
}

// ─── Step 2: Call Geocodio for one data center ───
async function resolveOfficialsForDC(dc: {
  id: string;
  slug: string;
  latitude: number;
  longitude: number;
  state: string;
}) {
  const url = new URL('https://api.geocod.io/v1.7/reverse');
  url.searchParams.set('q', `${dc.latitude},${dc.longitude}`);
  url.searchParams.set('fields', 'cd,stateleg');
  url.searchParams.set('api_key', GEOCODIO_KEY);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    console.log(`    No Geocodio results for ${dc.slug}`);
    return;
  }

  const result = data.results[0];
  const fields = result.fields;

  // Update district info on the data center
  await supabase.from('data_centers').update({
    congressional_district: fields.congressional_districts?.[0]?.name || null,
    state_senate_district: fields.state_legislative_districts?.senate?.[0]?.name || null,
    state_house_district: fields.state_legislative_districts?.house?.[0]?.name || null,
    fips_county: result.address_components?.county_fips || null,
  }).eq('id', dc.id);

  // ─── Step 3: Extract and upsert legislators ───
  const legislators: GeocodioLegislator[] = [
    ...(fields.congressional_districts?.[0]?.current_legislators || []),
    ...(fields.state_legislative_districts?.senate?.[0]?.current_legislators || []),
    ...(fields.state_legislative_districts?.house?.[0]?.current_legislators || []),
  ];

  for (const leg of legislators) {
    const officialRecord = {
      name: `${leg.bio.first_name} ${leg.bio.last_name}`,
      title: mapLegislatorTitle(leg.type, dc.state),
      level: leg.type === 'representative' || leg.type === 'senator' ? 'federal' : 'state',
      body: mapLegislatorBody(leg.type, dc.state),
      chamber: leg.type.includes('senator') || leg.type.includes('senate') ? 'upper' : 'lower',
      district: fields.congressional_districts?.[0]?.name ||
                fields.state_legislative_districts?.house?.[0]?.district_number?.toString(),
      state: dc.state,
      party: leg.bio.party,
      seniority: leg.bio.seniority || null,
      phone: leg.contact?.phone || null,
      email: null, // Geocodio doesn't return email for most
      office_address: leg.contact?.address || null,
      website: leg.contact?.url || null,
      contact_form: leg.contact?.contact_form || null,
      twitter: leg.social?.twitter || null,
      facebook: leg.social?.facebook || null,
      youtube: leg.social?.youtube || null,
      bioguide_id: leg.references?.bioguide_id || null,
      govtrack_id: leg.references?.govtrack_id || null,
      opensecrets_id: leg.references?.opensecrets_id || null,
      source: 'geocodio',
      last_verified_at: new Date().toISOString(),
    };

    // Upsert on bioguide_id (federal) — prevents duplicates
    const uniqueKey = officialRecord.bioguide_id || officialRecord.name + officialRecord.state;

    // Try to find existing official
    let officialId: string;
    const { data: existing } = await supabase
      .from('officials')
      .select('id')
      .or(
        officialRecord.bioguide_id
          ? `bioguide_id.eq.${officialRecord.bioguide_id}`
          : `name.eq.${officialRecord.name},state.eq.${officialRecord.state}`
      )
      .limit(1)
      .single();

    if (existing) {
      officialId = existing.id;
      await supabase.from('officials').update(officialRecord).eq('id', officialId);
    } else {
      const { data: inserted } = await supabase
        .from('officials')
        .insert(officialRecord)
        .select('id')
        .single();
      officialId = inserted!.id;
    }

    // ─── Step 4: Create junction record ───
    const jurisdictionType = mapJurisdictionType(leg.type);

    await supabase.from('dc_officials').upsert({
      data_center_id: dc.id,
      official_id: officialId,
      jurisdiction_type: jurisdictionType,
    }, { onConflict: 'data_center_id,official_id' });
  }
}

function mapLegislatorTitle(type: string, state: string): string {
  switch (type) {
    case 'senator': return 'US Senator';
    case 'representative': return 'US Representative';
    default:
      if (type.includes('senate')) return `${state} State Senator`;
      if (type.includes('house') || type.includes('representative'))
        return `${state} State Representative`;
      return type;
  }
}

function mapLegislatorBody(type: string, state: string): string {
  switch (type) {
    case 'senator': return 'US Senate';
    case 'representative': return 'US House of Representatives';
    default:
      if (type.includes('senate')) return `${state} State Senate`;
      return `${state} State House`;
  }
}

function mapJurisdictionType(type: string): string {
  switch (type) {
    case 'senator': return 'us_senator';
    case 'representative': return 'us_representative';
    default:
      if (type.includes('senate')) return 'state_senator';
      return 'state_representative';
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run
resolveAllOfficials().then(() => console.log('Done.'));
```

---

### Task 1.5: Organization + Graph Seed

**Dependencies:** 1.1
**Effort:** 30 min (can run parallel with 1.2-1.4)

```jsonc
// pipeline/seed/organizations.json (abbreviated — full file would have ~50 entries)
[
  {
    "slug": "microsoft",
    "name": "Microsoft Corporation",
    "type": "tech_company",
    "description": "Leading investor in AI data center infrastructure",
    "website": "https://microsoft.com",
    "headquarters": "Redmond, WA",
    "ticker": "MSFT",
    "opensecrets_id": "D000000115"
  },
  {
    "slug": "meta",
    "name": "Meta Platforms, Inc.",
    "type": "tech_company",
    "website": "https://meta.com",
    "headquarters": "Menlo Park, CA",
    "ticker": "META",
    "opensecrets_id": "D000067402"
  },
  {
    "slug": "openai",
    "name": "OpenAI",
    "type": "tech_company",
    "website": "https://openai.com",
    "headquarters": "San Francisco, CA"
  },
  {
    "slug": "softbank",
    "name": "SoftBank Group Corp.",
    "type": "investor",
    "website": "https://softbank.com",
    "headquarters": "Tokyo, Japan",
    "ticker": "9984.T"
  },
  {
    "slug": "oracle",
    "name": "Oracle Corporation",
    "type": "cloud_provider",
    "website": "https://oracle.com",
    "headquarters": "Austin, TX",
    "ticker": "ORCL",
    "opensecrets_id": "D000000461"
  },
  {
    "slug": "mgx",
    "name": "MGX (Mubadala)",
    "type": "investor",
    "description": "Abu Dhabi-based AI investment vehicle",
    "website": "https://mgx.ae",
    "headquarters": "Abu Dhabi, UAE"
  },
  {
    "slug": "coreweave",
    "name": "CoreWeave",
    "type": "cloud_provider",
    "description": "GPU-specialized cloud infrastructure provider",
    "website": "https://coreweave.com",
    "headquarters": "Roseland, NJ"
  },
  {
    "slug": "blackstone",
    "name": "Blackstone Inc.",
    "type": "pe_firm",
    "website": "https://blackstone.com",
    "headquarters": "New York, NY",
    "ticker": "BX",
    "opensecrets_id": "D000021873"
  }
]
```

```jsonc
// pipeline/seed/relationships.json (abbreviated)
[
  {
    "source": "openai",
    "target": "softbank",
    "relationship": "joint_venture",
    "description": "Project Stargate — $500B AI infrastructure initiative",
    "value": 500000000000,
    "source_url": "https://..."
  },
  {
    "source": "openai",
    "target": "oracle",
    "relationship": "joint_venture",
    "description": "Project Stargate infrastructure partner"
  },
  {
    "source": "openai",
    "target": "mgx",
    "relationship": "joint_venture",
    "description": "Project Stargate investment partner"
  },
  {
    "source": "blackstone",
    "target": "qts-realty",
    "relationship": "owns",
    "description": "Blackstone acquired QTS Realty Trust for $10B in 2021",
    "value": 10000000000
  },
  {
    "source": "nvidia",
    "target": "coreweave",
    "relationship": "invests_in",
    "description": "NVIDIA is a major investor in CoreWeave"
  }
]
```

```typescript
// pipeline/seed-orgs.ts
async function seedOrganizations() {
  const orgs = JSON.parse(
    await Bun.file('pipeline/seed/organizations.json').text()
  );

  const { error } = await supabase.from('organizations').upsert(orgs, {
    onConflict: 'slug',
  });
  if (error) console.error('Org seed error:', error);
  else console.log(`Seeded ${orgs.length} organizations`);

  // Now seed relationships
  const rels = JSON.parse(
    await Bun.file('pipeline/seed/relationships.json').text()
  );

  for (const rel of rels) {
    // Resolve slugs to IDs
    const { data: sourceOrg } = await supabase
      .from('organizations').select('id').eq('slug', rel.source).single();
    const { data: targetOrg } = await supabase
      .from('organizations').select('id').eq('slug', rel.target).single();

    if (!sourceOrg || !targetOrg) {
      console.warn(`  Skipping ${rel.source} -> ${rel.target}: org not found`);
      continue;
    }

    await supabase.from('org_relationships').insert({
      source_org_id: sourceOrg.id,
      target_org_id: targetOrg.id,
      relationship: rel.relationship,
      description: rel.description,
      value: rel.value || null,
      source_url: rel.source_url || null,
    });
  }

  console.log(`Seeded ${rels.length} org relationships`);
}
```

---

### Task 1.6: Event Ingestion

**Dependencies:** 1.3
**Effort:** 20 min

```typescript
// pipeline/ingest-events.ts

async function ingestEvents() {
  // Primary source: datacentertracker.org actions
  const response = await fetch('https://datacentertracker.org/data/actions.json');
  const actions = await response.json();

  for (const action of actions) {
    const slug = slugify(
      `${action.action}-${action.jurisdiction}-${action.date || 'undated'}`
    );

    const event = {
      slug,
      title: `${action.action}: ${action.jurisdiction}, ${action.state}`,
      type: mapActionType(action.action),
      date: action.date ? new Date(action.date).toISOString() : new Date().toISOString(),
      state: action.state,
      jurisdiction: action.jurisdiction,
      description: action.issue ? `Issue: ${action.issue}` : null,
      status: mapActionStatus(action.status),
      issue_category: action.issue || null,
      source_url: action.source || null,
      source_dataset: 'dctracker',
    };

    await supabase.from('events').upsert(event, { onConflict: 'slug' });

    // Try to link event to a data center by company + state match
    if (action.company) {
      const { data: matchingDC } = await supabase
        .from('data_centers')
        .select('id')
        .eq('state', action.state)
        .ilike('operator', `%${action.company}%`)
        .limit(1)
        .single();

      if (matchingDC) {
        const { data: eventRow } = await supabase
          .from('events').select('id').eq('slug', slug).single();
        if (eventRow) {
          await supabase.from('dc_events').upsert({
            data_center_id: matchingDC.id,
            event_id: eventRow.id,
          }, { onConflict: 'data_center_id,event_id' });
        }
      }
    }
  }

  console.log(`Loaded ${actions.length} events from datacentertracker.org`);
}

function mapActionType(action: string): string {
  const a = action?.toLowerCase() || '';
  if (a.includes('morator')) return 'moratorium';
  if (a.includes('zoning')) return 'zoning_vote';
  if (a.includes('legislat')) return 'legislation';
  if (a.includes('public comment')) return 'public_comment';
  if (a.includes('lawsuit')) return 'lawsuit';
  if (a.includes('withdraw')) return 'project_withdrawal';
  if (a.includes('hearing')) return 'hearing';
  return 'other';
}

function mapActionStatus(status: string): string {
  const s = status?.toLowerCase() || '';
  if (s.includes('pending')) return 'upcoming';
  if (s.includes('favorable')) return 'resolved_favorable';
  if (s.includes('unfavorable')) return 'resolved_unfavorable';
  if (s.includes('mixed')) return 'resolved_mixed';
  return 'completed';
}
```

---

### Task 1.7: Refresh Materialized Views

**Dependencies:** 1.3, 1.4, 1.5, 1.6
**Effort:** 5 min

```typescript
// pipeline/refresh-views.ts
async function refreshViews() {
  const views = ['mv_map_markers', 'mv_graph_nodes', 'mv_graph_edges'];

  for (const view of views) {
    const { error } = await supabase.rpc('refresh_materialized_view', { view_name: view });
    if (error) {
      // Fallback: raw SQL
      await supabase.from(view).select('*').limit(0); // no-op to test existence
      console.log(`  View ${view}: refresh via RPC failed, run manually in SQL editor`);
    } else {
      console.log(`  Refreshed ${view}`);
    }
  }
}

// Or just run in SQL editor:
// REFRESH MATERIALIZED VIEW CONCURRENTLY mv_map_markers;
// REFRESH MATERIALIZED VIEW CONCURRENTLY mv_graph_nodes;
// REFRESH MATERIALIZED VIEW CONCURRENTLY mv_graph_edges;
```

---

## Phase 2: API Layer

**Duration:** 45 min
**Dependencies:** Phase 0, Phase 1 (schema only — endpoints can be built before data exists)
**Parallelizable:** All API routes can be built independently

---

### Task 2.1: Supabase Client Configuration

```typescript
// lib/supabase/client.ts — browser client (uses anon key)
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// lib/supabase/server.ts — server client (uses service role for writes)
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

---

### Task 2.2: Data Centers API

```typescript
// app/api/data-centers/route.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const params = request.nextUrl.searchParams;

  const expand = params.get('expand') === 'true';
  const status = params.get('status')?.split(',');
  const states = params.get('state')?.split(',');
  const bounds = params.get('bounds')?.split(',').map(Number);
  const limit = Math.min(Number(params.get('limit') || 500), 2000);
  const offset = Number(params.get('offset') || 0);

  if (!expand) {
    // Compact mode — read from materialized view
    let query = supabase
      .from('mv_map_markers')
      .select('*')
      .range(offset, offset + limit - 1);

    if (status?.length) query = query.in('status', status);
    if (states?.length) query = query.in('state', states);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Expanded mode — full data with relations
  let query = supabase
    .from('data_centers')
    .select(`
      *,
      dc_organizations (
        relationship,
        organizations ( name, slug, type, logo_url )
      ),
      dc_officials (
        jurisdiction_type,
        officials ( name, title, level, party, phone, email, website, photo_url )
      ),
      dc_events (
        events ( title, slug, type, date, status )
      )
    `)
    .range(offset, offset + limit - 1);

  if (status?.length) query = query.in('status', status);
  if (states?.length) query = query.in('state', states);
  if (bounds?.length === 4) {
    query = query
      .gte('latitude', bounds[0])
      .gte('longitude', bounds[1])
      .lte('latitude', bounds[2])
      .lte('longitude', bounds[3]);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

```typescript
// app/api/data-centers/[slug]/route.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('data_centers')
    .select(`
      *,
      dc_organizations (
        relationship,
        organizations ( id, name, slug, type, logo_url, website, description )
      ),
      dc_officials (
        jurisdiction_type,
        officials (
          id, name, title, level, body, party, seniority,
          phone, email, office_address, website, contact_form,
          twitter, facebook, photo_url, opensecrets_id
        )
      ),
      dc_events (
        events ( id, title, slug, type, date, end_date, location, status, url, issue_category )
      )
    `)
    .eq('slug', params.slug)
    .single();

  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Sort officials by level: federal first, then state, then local
  const levelOrder = { federal: 0, state: 1, local: 2 };
  if (data.dc_officials) {
    data.dc_officials.sort((a: any, b: any) =>
      (levelOrder[a.officials.level as keyof typeof levelOrder] || 3) -
      (levelOrder[b.officials.level as keyof typeof levelOrder] || 3)
    );
  }

  // Sort events by date descending
  if (data.dc_events) {
    data.dc_events.sort((a: any, b: any) =>
      new Date(b.events.date).getTime() - new Date(a.events.date).getTime()
    );
  }

  return NextResponse.json(data);
}
```

---

### Task 2.3: Graph API

```typescript
// app/api/graph/route.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();

  const [nodesResult, edgesResult] = await Promise.all([
    supabase.from('mv_graph_nodes').select('*'),
    supabase.from('mv_graph_edges').select('*'),
  ]);

  if (nodesResult.error || edgesResult.error) {
    return NextResponse.json(
      { error: 'Failed to load graph data' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    nodes: nodesResult.data,
    edges: edgesResult.data,
  });
}
```

---

### Tasks 2.4–2.7: Events, Officials, Search, Stats APIs

Follow the same pattern as 2.2. Key implementation notes:

- **Events API** (`/api/events`): filter by type, state, date range, `upcoming` status for deadline highlighting
- **Officials API** (`/api/officials`): filter by state, level; useful for `/learn` pages that show "your officials"
- **Search API** (`/api/search`): Supabase full-text search across `data_centers.name`, `organizations.name`, `officials.name`, `events.title`. Use `to_tsvector` and `to_tsquery`.
- **Stats API** (`/api/stats`): aggregate counts — total DCs, by status, by state, total MW, total officials. Powers a dashboard bar or counter.

---

## Phase 3: Map View

**Duration:** 2 hours
**Dependencies:** Phase 2 (API layer), Task 0.3 (Mapbox), Task 3.1 (layout)

---

### Task 3.1: Root Layout + Navigation

**Dependencies:** 0.1

```typescript
// components/shared/Nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Network, Calendar, BookOpen, Info } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Map', icon: Map },
  { href: '/graph', label: 'Graph', icon: Network },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/about', label: 'About', icon: Info },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0A0F1C]/90 backdrop-blur-md border-b border-[#1E293B] flex items-center px-4 gap-1">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-6 group">
        <div className="w-2 h-2 rounded-full bg-accent-cyan group-hover:shadow-[0_0_8px_#22D3EE] transition-shadow" />
        <span className="font-display text-sm font-bold tracking-tight">
          datacenter<span className="text-accent-cyan">.watch</span>
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                transition-colors duration-150
                ${active
                  ? 'text-accent-cyan bg-accent-cyan/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}
              `}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Right side: counter */}
      <div className="ml-auto text-xs text-slate-500 font-mono hidden md:block">
        <span className="text-accent-cyan font-semibold" id="dc-count">—</span> data centers tracked
      </div>
    </nav>
  );
}
```

---

### Task 3.2: Map Container

**Dependencies:** 0.3, 3.1

```typescript
// components/map/MapContainer.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import MapGL, {
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
  type MapRef,
  type ViewStateChangeEvent,
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import { useDataCenters } from '@/lib/hooks/useDataCenters';
import { DetailPanel } from './DetailPanel';
import { MapControls } from './MapControls';
import { STATUS_COLORS } from '@/lib/constants';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Filters {
  status: string[];
  states: string[];
}

export function MapContainer() {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 4,
  });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ status: [], states: [] });

  const { data: markers } = useDataCenters();

  // ─── Supercluster setup ───
  const supercluster = useRef(new Supercluster({
    radius: 60,
    maxZoom: 12,
  }));

  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(() => {
    if (!markers) return;

    // Apply client-side filters
    const filtered = markers.filter((m: any) => {
      if (filters.status.length && !filters.status.includes(m.status)) return false;
      if (filters.states.length && !filters.states.includes(m.state)) return false;
      return true;
    });

    // Convert to GeoJSON
    const points = filtered.map((m: any) => ({
      type: 'Feature' as const,
      properties: { ...m, cluster: false },
      geometry: { type: 'Point' as const, coordinates: [m.longitude, m.latitude] },
    }));

    supercluster.current.load(points);
    updateClusters();
  }, [markers, filters]);

  const updateClusters = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());

    const newClusters = supercluster.current.getClusters(
      [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
      zoom
    );

    setClusters(newClusters);
  }, []);

  const handleMapMove = useCallback((e: ViewStateChangeEvent) => {
    setViewState(e.viewState);
    updateClusters();
  }, [updateClusters]);

  return (
    <div className="w-full h-[calc(100vh-56px)] relative">
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={handleMapMove}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        style={{ width: '100%', height: '100%' }}
        maxZoom={18}
        minZoom={3}
        onLoad={updateClusters}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" trackUserLocation />

        {/* Render cluster and individual markers */}
        {clusters.map((cluster) => {
          const [lng, lat] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count } = cluster.properties;

          if (isCluster) {
            return (
              <ClusterMarker
                key={`cluster-${cluster.id}`}
                longitude={lng}
                latitude={lat}
                count={point_count}
                onClick={() => {
                  const zoom = supercluster.current.getClusterExpansionZoom(cluster.id);
                  mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 500 });
                }}
              />
            );
          }

          return (
            <DCMarker
              key={cluster.properties.id}
              longitude={lng}
              latitude={lat}
              status={cluster.properties.status}
              name={cluster.properties.name}
              operator={cluster.properties.operator}
              capacity={cluster.properties.capacity_mw}
              onClick={() => setSelectedSlug(cluster.properties.slug)}
              selected={cluster.properties.slug === selectedSlug}
            />
          );
        })}
      </MapGL>

      {/* Filter bar */}
      <MapControls
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={markers?.length || 0}
      />

      {/* Detail panel */}
      {selectedSlug && (
        <DetailPanel
          slug={selectedSlug}
          onClose={() => setSelectedSlug(null)}
        />
      )}
    </div>
  );
}
```

---

### Task 3.5: Detail Panel

**Dependencies:** 2.2, 3.3

```typescript
// components/map/DetailPanel.tsx
'use client';

import { X, ExternalLink, Phone, Mail, Globe, MapPin, Zap, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { StatusBadge } from '@/components/shared/StatusBadge';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  slug: string;
  onClose: () => void;
}

export function DetailPanel({ slug, onClose }: Props) {
  const { data: dc, isLoading } = useSWR(`/api/data-centers/${slug}`, fetcher);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed top-14 right-0 bottom-0
          w-full sm:w-[var(--panel-width)]
          bg-surface border-l border-[#1E293B]
          overflow-y-auto z-40
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-[#1E293B] p-4 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-slate-100 truncate">
              {dc?.name || 'Loading...'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {dc?.city && `${dc.city}, `}{dc?.state}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-elevated rounded animate-pulse" />
            ))}
          </div>
        ) : dc ? (
          <div className="p-4 space-y-6">
            {/* Status + key metrics */}
            <div>
              <StatusBadge status={dc.status} />
              <div className="grid grid-cols-2 gap-3 mt-3">
                {dc.capacity_mw && (
                  <Metric icon={Zap} label="Capacity" value={`${dc.capacity_mw} MW`} />
                )}
                {dc.footprint_acres && (
                  <Metric icon={MapPin} label="Footprint" value={`${dc.footprint_acres} acres`} />
                )}
                {dc.water_usage_gpd && (
                  <Metric icon={Droplets} label="Water" value={`${(dc.water_usage_gpd / 1000000).toFixed(1)}M gal/day`} />
                )}
                {dc.energy_source && (
                  <Metric icon={Zap} label="Energy" value={dc.energy_source} />
                )}
              </div>
            </div>

            {/* Operator */}
            {dc.operator && (
              <Section title="Operator">
                <p className="text-slate-300">{dc.operator}</p>
              </Section>
            )}

            {/* Officials */}
            {dc.dc_officials?.length > 0 && (
              <Section title="Your Elected Officials">
                <div className="space-y-2">
                  {dc.dc_officials.map((link: any, i: number) => (
                    <OfficialCard
                      key={i}
                      official={link.officials}
                      jurisdictionType={link.jurisdiction_type}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Events */}
            {dc.dc_events?.length > 0 && (
              <Section title="Related Events">
                <div className="space-y-2">
                  {dc.dc_events.map((link: any, i: number) => (
                    <EventCard key={i} event={link.events} />
                  ))}
                </div>
              </Section>
            )}

            {/* Sources */}
            {dc.source_urls?.length > 0 && (
              <Section title="Sources">
                <div className="space-y-1">
                  {dc.source_urls.map((url: string, i: number) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-accent-cyan hover:underline truncate"
                    >
                      <ExternalLink size={12} />
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {/* Last verified */}
            <p className="text-xs text-slate-600 pt-2 border-t border-[#1E293B]">
              Last verified: {dc.last_verified_at
                ? new Date(dc.last_verified_at).toLocaleDateString()
                : 'Not yet verified'}
            </p>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Sub-components ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-elevated rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
        <Icon size={12} />
        <span className="text-xs">{label}</span>
      </div>
      <span className="font-display text-sm font-semibold text-slate-200">{value}</span>
    </div>
  );
}

function OfficialCard({ official, jurisdictionType }: { official: any; jurisdictionType: string }) {
  const partyColor = official.party === 'Democrat' ? 'text-blue-400' :
                     official.party === 'Republican' ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="bg-elevated rounded-lg p-3 flex items-start gap-3">
      {official.photo_url && (
        <img
          src={official.photo_url}
          alt={official.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{official.name}</p>
        <p className="text-xs text-slate-400">
          {official.title} <span className={partyColor}>({official.party?.[0]})</span>
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          {official.phone && (
            <a href={`tel:${official.phone}`} className="flex items-center gap-1 text-xs text-accent-cyan hover:underline">
              <Phone size={10} /> {official.phone}
            </a>
          )}
          {official.email && (
            <a href={`mailto:${official.email}`} className="flex items-center gap-1 text-xs text-accent-cyan hover:underline">
              <Mail size={10} /> Email
            </a>
          )}
          {official.website && (
            <a href={official.website} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1 text-xs text-accent-cyan hover:underline">
              <Globe size={10} /> Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 4: Graph View

**Duration:** 1.5 hours
**Dependencies:** Task 2.3 (graph API), Task 3.1 (layout)

---

### Task 4.1–4.4: Force Graph Page

```typescript
// app/graph/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { Search, Filter, RotateCcw, Maximize2 } from 'lucide-react';
import { Nav } from '@/components/shared/Nav';
import { NODE_COLORS } from '@/lib/constants';

// Dynamic import — react-force-graph-3d uses WebGL, can't SSR
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-slate-500">
      Loading graph...
    </div>
  ),
});

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function GraphPage() {
  const { data: graphData } = useSWR('/api/graph', fetcher);
  const fgRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    new Set(['organization', 'data_center', 'official'])
  );
  const [is2D, setIs2D] = useState(false);

  // Filter nodes and edges
  const filteredData = useMemo(() => {
    if (!graphData) return { nodes: [], links: [] };

    let nodes = graphData.nodes.filter((n: any) =>
      visibleCategories.has(n.category)
    );

    if (search) {
      const q = search.toLowerCase();
      const matchIds = new Set(
        nodes.filter((n: any) => n.name.toLowerCase().includes(q)).map((n: any) => n.id)
      );
      // Include neighbors of matched nodes
      for (const edge of graphData.edges) {
        if (matchIds.has(edge.source)) matchIds.add(edge.target);
        if (matchIds.has(edge.target)) matchIds.add(edge.source);
      }
      nodes = nodes.filter((n: any) => matchIds.has(n.id));
    }

    const nodeIds = new Set(nodes.map((n: any) => n.id));
    const links = graphData.edges
      .filter((e: any) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e: any) => ({ ...e, source: e.source, target: e.target }));

    return { nodes, links };
  }, [graphData, visibleCategories, search]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    // Focus camera on node
    fgRef.current?.cameraPosition(
      { x: node.x + 100, y: node.y + 100, z: node.z + 100 },
      { x: node.x, y: node.y, z: node.z },
      1000
    );
  }, []);

  return (
    <>
      <Nav />
      <div className="w-full h-[calc(100vh-56px)] mt-14 relative bg-[#050A14]">
        <ForceGraph3D
          ref={fgRef}
          graphData={filteredData}
          nodeColor={(node: any) => NODE_COLORS[node.node_type] || NODE_COLORS[node.category] || '#64748B'}
          nodeVal={(node: any) => {
            if (node.category === 'data_center') return (node.metric || 100) / 50;
            if (node.metric) return Math.log10(node.metric + 1) * 2;
            return 3;
          }}
          nodeLabel={(node: any) => node.name}
          linkColor={() => 'rgba(148, 163, 184, 0.15)'}
          linkWidth={(link: any) => link.value ? Math.log10(link.value) * 0.3 : 0.5}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          onNodeClick={handleNodeClick}
          backgroundColor="#050A14"
          showNavInfo={false}
          enableNodeDrag={true}
          cooldownTime={3000}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />

        {/* ─── Controls overlay ─── */}
        <div className="absolute top-4 left-4 space-y-2 z-10">
          {/* Search */}
          <div className="flex items-center gap-2 bg-surface/90 backdrop-blur rounded-lg px-3 py-2 border border-[#1E293B]">
            <Search size={14} className="text-slate-500" />
            <input
              type="text"
              placeholder="Search entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none w-48"
            />
          </div>

          {/* Category toggles */}
          <div className="bg-surface/90 backdrop-blur rounded-lg p-2 border border-[#1E293B] space-y-1">
            {[
              { key: 'organization', label: 'Organizations', color: '#3B82F6' },
              { key: 'data_center', label: 'Data Centers', color: '#22D3EE' },
              { key: 'official', label: 'Officials', color: '#94A3B8' },
            ].map(({ key, label, color }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={visibleCategories.has(key)}
                  onChange={() => {
                    const next = new Set(visibleCategories);
                    next.has(key) ? next.delete(key) : next.add(key);
                    setVisibleCategories(next);
                  }}
                  className="accent-accent-cyan"
                />
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* ─── Selected node panel ─── */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-72 bg-surface/95 backdrop-blur rounded-lg border border-[#1E293B] p-4 z-10">
            <h3 className="font-display font-bold text-slate-100">
              {selectedNode.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 capitalize">
              {selectedNode.node_type?.replace(/_/g, ' ')} · {selectedNode.category?.replace(/_/g, ' ')}
            </p>
            {selectedNode.metric && (
              <p className="text-sm text-accent-cyan mt-2 font-mono">
                {selectedNode.category === 'data_center'
                  ? `${selectedNode.metric} MW`
                  : `$${(selectedNode.metric / 1e6).toFixed(1)}M lobbying`}
              </p>
            )}
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-3 text-xs text-slate-500 hover:text-slate-300"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}
```

---

## Phase 5: Events + Education

**Duration:** 1 hour
**Dependencies:** Tasks 2.4 (events API), 3.1 (layout)

Implementation follows standard patterns — filterable list for events, MDX rendering for learn articles. No novel code samples needed; these are straightforward Next.js pages using the same SWR + Supabase patterns from Phases 2-3.

Key pages:
- `/events` — filterable list with `StatusBadge` and date formatting
- `/learn` — index page linking to MDX articles
- `/learn/[slug]` — MDX article with `next-mdx-remote`
- `/about` — static page with methodology, attribution, open source links

---

## Phase 6: Polish + Deploy

**Duration:** 1 hour
**Dependencies:** All previous phases

---

### Task 6.1: Responsive Pass

Key breakpoints:
- **Mobile (< 640px):** Detail panel becomes bottom sheet (50vh), nav icons only, map filters collapse to hamburger
- **Tablet (640–1024px):** Detail panel 360px, full nav
- **Desktop (> 1024px):** Detail panel 420px, full nav, counter visible

### Task 6.2: SEO + Meta

Per-page dynamic metadata via `generateMetadata()` for data center and event pages.

### Task 6.3: Vercel Cron Config

```jsonc
// vercel.json
{
  "crons": [
    { "path": "/api/cron/events",        "schedule": "0 6 * * *" },
    { "path": "/api/cron/data-centers",   "schedule": "0 4 * * 1" },
    { "path": "/api/cron/officials",      "schedule": "0 3 1 * *" },
    { "path": "/api/cron/refresh-views",  "schedule": "0 7 * * *" }
  ]
}
```

Cron route handlers check `CRON_SECRET` header for auth:

```typescript
// app/api/cron/events/route.ts
export async function GET(request: NextRequest) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Run event pipeline...
}
```

### Task 6.4: README + LICENSE + CONTRIBUTING

Standard open source files. LICENSE = AGPL-3.0. README includes project description, setup instructions, attribution.

### Task 6.5: Production Deploy

```bash
vercel --prod
```

---

## Appendix: Constants File

```typescript
// lib/constants.ts
export const STATUS_COLORS: Record<string, string> = {
  proposed:           '#8B5CF6',
  announced:          '#F59E0B',
  permitting:         '#3B82F6',
  approved:           '#60A5FA',
  under_construction: '#EF4444',
  operational:        '#10B981',
  paused:             '#6B7280',
  cancelled:          '#374151',
};

export const STATUS_LABELS: Record<string, string> = {
  proposed:           'Proposed',
  announced:          'Announced',
  permitting:         'In Permitting',
  approved:           'Approved',
  under_construction: 'Under Construction',
  operational:        'Operational',
  paused:             'Paused',
  cancelled:          'Cancelled',
};

export const NODE_COLORS: Record<string, string> = {
  tech_company:    '#3B82F6',
  cloud_provider:  '#6366F1',
  developer:       '#8B5CF6',
  investor:        '#F59E0B',
  pe_firm:         '#F97316',
  construction:    '#EF4444',
  engineering:     '#FB923C',
  energy_utility:  '#10B981',
  lobbying_firm:   '#EC4899',
  consortium:      '#A855F7',
  data_center:     '#22D3EE',
  official:        '#94A3B8',
  organization:    '#3B82F6',
};

export const EDGE_COLORS: Record<string, string> = {
  owns:            '#F59E0B',
  invests_in:      '#F97316',
  joint_venture:   '#A855F7',
  lobbies:         '#EC4899',
  donates_to:      '#EF4444',
  operates:        '#3B82F6',
  constructs:      '#FB923C',
  supplies_energy: '#10B981',
};
```

---

*Built in the open by Benjamin Life (@omniharmonic)*
*datacenter.observer — civic intelligence for the age of AI infrastructure*
