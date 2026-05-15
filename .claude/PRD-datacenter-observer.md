# DataCenterWatch — Product Requirements Document

**Author:** Benjamin Life (@omniharmonic)
**Version:** 0.1 — MVP Sprint
**Date:** May 14, 2026
**License:** Open Source (AGPL-3.0)

---

## Naming Options

| Candidate | Domain | Notes |
|-----------|--------|-------|
| **DataCenterWatch** | datacenterwatch.org | Clear, direct, journalistic tone |
| **Bright Sites** | brightsites.org | Double meaning — illumination + construction sites |
| **The Grid** | civicgrid.org | Evocative — energy grid, power grid, information grid |
| **PowerMap** | powermap.us | Maps power structures literally and figuratively |
| **datacenter.observer** | datacenter.observer | Clean TLD, memorable, action-oriented |

**Recommendation:** `datacenter.observer` — the `.watch` TLD reinforces the watchdog mission, it's short, and the domain is likely available. Fallback: `datacenterwatch.org`.

---

## 1. Problem Statement

AI data centers are proliferating across the United States at unprecedented speed. These facilities consume massive amounts of energy, water, and land — yet the decision-making process around their siting, permitting, and construction is opaque to most citizens. Information about who is building them, who is funding them, which officials are approving them, and how the public can participate in the process is scattered, incomplete, and difficult to access.

Citizens deserve a single, clear, well-maintained platform that answers:

- **Where** are AI data centers being built or planned near me?
- **Who** is building them, funding them, and approving them?
- **How** can I participate in public processes related to them?
- **What** are the relationships between the corporations, investors, and government officials involved?

## 2. Product Vision

A civic intelligence platform that starts with a map and unfolds into a full transparency toolkit — showing citizens not just where data centers are, but who is behind them, how they're connected, and how to make their voice heard.

### Design Philosophy

- **Spatial first:** The map is the entry point. People think geographically about what affects them.
- **Follow the thread:** Every data center connects to companies, officials, funding, and events. Let users pull any thread.
- **Empower, don't alarm:** Informational and empowering, not alarmist. Clean, authoritative, trustworthy design.
- **Radically transparent:** Open source, open data, open methodology.

## 3. Target Users

| Persona | Needs |
|---------|-------|
| **Concerned Resident** | "Is there a data center being built near me? Who do I contact?" |
| **Local Activist** | "When's the next public comment period? Who else is organizing?" |
| **Journalist** | "Show me the money trail. Who's funding this project?" |
| **Policy Researcher** | "What's the national pattern? Which states are fast-tracking?" |
| **Elected Official** | "What's happening in my district that I should know about?" |

## 4. Core Features — MVP (v0.1)

### 4.1 Interactive Data Center Map

**The primary interface.** A full-viewport map of the US showing all known AI data center projects.

**Markers color-coded by status:**

| Status | Color | Description |
|--------|-------|-------------|
| Announced | `#F59E0B` amber | Publicly announced, no permits yet |
| Permitting | `#3B82F6` blue | In permitting/review process |
| Under Construction | `#EF4444` red | Active construction |
| Operational | `#10B981` green | Built and running |
| Proposed | `#8B5CF6` purple | Rumored or in early feasibility |
| Paused/Cancelled | `#6B7280` gray | Halted or abandoned |

**Map interactions:**

- Cluster markers at low zoom, expand at higher zoom
- Click marker → slide-in detail panel (no page navigation)
- "Near me" geolocation button
- Filter by status, company, state, megawatt capacity
- Search by location or project name

### 4.2 Data Center Detail Panel

Slide-in panel (right side on desktop, bottom sheet on mobile) showing:

**Project Info:**
- Project name and operating company
- Status + timeline (announced date, expected completion)
- Location (address, county, state)
- Estimated capacity (MW) and footprint (acres/sq ft)
- Estimated water usage (if available)
- Estimated energy source
- Brief description / notes
- Source links (news articles, permit filings)

**Elected Officials (jurisdictional):**
- **Federal:** US Senators (2), US House Representative (1)
- **State:** Governor, State Senator, State House Representative
- **Local:** Mayor / County Executive, City/County Council members
- Phone, email, office address, website for each
- Party affiliation

**Events:**
- Linked public comment periods, hearings, protests, community meetings
- Date, type, location, link to details

### 4.3 Events Index

A filterable list/calendar of civic events related to data center projects:

- Public comment periods (with deadlines highlighted)
- City council / planning commission hearings
- Protests and community organizing events
- Public dialogues and town halls
- Press conferences

**Filters:** By data center project, by state, by event type, by date range

### 4.4 Corporate Relationship Graph

A 3D force-directed graph visualization showing the network of actors:

**Node types:**
- 🏢 Corporations (tech companies, developers, contractors)
- 💰 Investors (PE firms, sovereign wealth funds, banks)
- 🏛️ Government officials (with jurisdictional role)
- 📍 Data center projects
- 🏗️ Construction / engineering firms
- ⚡ Energy / utility companies

**Edge types:**
- Owns / Operates
- Funds / Invests
- Lobbies
- Approves / Permits
- Constructs
- Supplies energy to
- Joint venture / Partnership (e.g., Project Stargate)

**Interactions:**
- Click any node to see details and highlight connections
- Filter by node type, edge type
- Search for specific entities
- Zoom, rotate, pan in 3D space
- Toggle 2D/3D view

### 4.5 Educational Content

Static pages (can be markdown-driven for v0.1):

- **What is an AI data center?** — basics of scale, energy, water, land use
- **How are they approved?** — typical permitting process, public comment explainer
- **How to participate** — guide to showing up at hearings, writing public comments, contacting officials
- **Follow the money** — explainer on corporate structures, PE funding, lobbying
- **Glossary** — MW, PUE, hyperscale, colocation, etc.

---

## 5. Information Architecture

```
datacenter.observer
├── / (Map view — primary landing)
│   └── /project/[slug] (deep-linkable detail view, opens panel)
├── /graph (Corporate relationship graph)
│   └── /graph/[entity-slug] (deep-linkable entity focus)
├── /events (Events index)
│   └── /events/[slug] (Event detail)
├── /learn (Educational content hub)
│   ├── /learn/what-are-data-centers
│   ├── /learn/how-to-participate
│   ├── /learn/follow-the-money
│   └── /learn/glossary
└── /about (Mission, methodology, open source info)
```

## 6. Technical Architecture

### 6.1 Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14 (App Router) | SSR, API routes, Vercel-native |
| Hosting | Vercel | Zero-config deploys, edge functions |
| Database | Supabase (Postgres) | Relational + PostGIS for geo queries, free tier |
| Map | Mapbox GL JS via react-map-gl | Best performance, clustering, styling |
| Graph Viz | react-force-graph-3d | WebGL 3D force-directed graphs, lightweight |
| Styling | Tailwind CSS | Rapid iteration, consistent design system |
| Data Pipeline | Claude Code skill (local) | Scraping + enrichment, run manually or on cron |
| Officials API | Google Civic Info + OpenStates | Federal/state elected officials by address |

### 6.2 Database Schema (Supabase/Postgres)

```sql
-- Core tables

CREATE TABLE data_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'announced','permitting','under_construction','operational','proposed','paused','cancelled'
  )),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  address TEXT,
  city TEXT,
  county TEXT,
  state TEXT NOT NULL,
  zip TEXT,
  congressional_district TEXT,
  state_legislative_district TEXT,
  
  -- Project details
  operator_company TEXT,
  developer_company TEXT,
  capacity_mw NUMERIC,
  footprint_acres NUMERIC,
  water_usage_gallons_per_day NUMERIC,
  energy_source TEXT,
  estimated_cost_usd BIGINT,
  announced_date DATE,
  expected_completion DATE,
  description TEXT,
  
  -- Metadata
  source_urls TEXT[], -- news articles, filings
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dc_geo ON data_centers (latitude, longitude);
CREATE INDEX idx_dc_state ON data_centers (state);
CREATE INDEX idx_dc_status ON data_centers (status);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'tech_company','developer','investor','pe_firm','construction',
    'engineering','energy_utility','lobbying_firm','government_body','other'
  )),
  description TEXT,
  website TEXT,
  logo_url TEXT,
  headquarters TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE officials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL, -- "US Senator", "Mayor", "City Council Member"
  level TEXT NOT NULL CHECK (level IN ('federal','state','local')),
  body TEXT, -- "US Senate", "CO State House", "Boulder City Council"
  district TEXT,
  state TEXT,
  party TEXT,
  phone TEXT,
  email TEXT,
  office_address TEXT,
  website TEXT,
  photo_url TEXT,
  source TEXT, -- which API or scrape provided this
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'public_comment','hearing','protest','town_hall','press_conference',
    'community_meeting','filing','other'
  )),
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ, -- for comment periods
  location TEXT,
  description TEXT,
  url TEXT, -- link to official notice or event page
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction tables

CREATE TABLE data_center_organizations (
  data_center_id UUID REFERENCES data_centers(id),
  organization_id UUID REFERENCES organizations(id),
  relationship TEXT NOT NULL CHECK (relationship IN (
    'operates','develops','funds','constructs','supplies_energy',
    'owns','joint_venture','permits','lobbies_for'
  )),
  PRIMARY KEY (data_center_id, organization_id, relationship)
);

CREATE TABLE data_center_officials (
  data_center_id UUID REFERENCES data_centers(id),
  official_id UUID REFERENCES officials(id),
  jurisdiction_type TEXT NOT NULL, -- 'federal','state','local'
  PRIMARY KEY (data_center_id, official_id)
);

CREATE TABLE data_center_events (
  data_center_id UUID REFERENCES data_centers(id),
  event_id UUID REFERENCES events(id),
  PRIMARY KEY (data_center_id, event_id)
);

CREATE TABLE organization_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_org_id UUID REFERENCES organizations(id),
  target_org_id UUID REFERENCES organizations(id),
  relationship TEXT NOT NULL CHECK (relationship IN (
    'owns','subsidiary_of','invests_in','joint_venture','lobbies_for',
    'contracted_by','partners_with','supplies','acquired'
  )),
  description TEXT,
  source_url TEXT
);

CREATE TABLE organization_officials (
  organization_id UUID REFERENCES organizations(id),
  official_id UUID REFERENCES officials(id),
  relationship TEXT NOT NULL CHECK (relationship IN (
    'lobbies','donates_to','formerly_employed','advocates_for','regulates'
  )),
  description TEXT,
  source_url TEXT,
  PRIMARY KEY (organization_id, official_id, relationship)
);
```

### 6.3 API Routes (Next.js)

```
/api/data-centers          GET — list all (with filters)
/api/data-centers/[slug]   GET — single project + related orgs, officials, events
/api/organizations         GET — list all (with type filter)
/api/organizations/[slug]  GET — single org + relationships
/api/officials             GET — list by district/state/level
/api/events                GET — list (filterable by date, type, project)
/api/graph                 GET — full graph data (nodes + edges) for viz
/api/search                GET — full-text search across all entities
```

### 6.4 Data Pipeline Architecture

```
┌─────────────────────────────────────────────────┐
│  Claude Code Skill (local or Vercel cron)       │
│                                                  │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ DC Scraper   │  │ News articles, permits,   │ │
│  │              │──│ planning docs, state       │ │
│  │              │  │ energy commission filings  │ │
│  └──────────────┘  └──────────────────────────┘ │
│                                                  │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Official     │  │ Google Civic Info API     │ │
│  │ Resolver     │──│ OpenStates API            │ │
│  │              │  │ ProPublica Congress API   │ │
│  └──────────────┘  └──────────────────────────┘ │
│                                                  │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Event        │  │ Government meeting sites, │ │
│  │ Scanner      │──│ Eventbrite, news articles │ │
│  │              │  │ activist org calendars    │ │
│  └──────────────┘  └──────────────────────────┘ │
│                                                  │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Corp Graph   │  │ SEC filings, OpenCorp,    │ │
│  │ Enricher     │──│ lobbying disclosures,     │ │
│  │              │  │ news / press releases     │ │
│  └──────────────┘  └──────────────────────────┘ │
│                                                  │
│            ▼  All write to Supabase              │
└─────────────────────────────────────────────────┘
```

**Scraping cadence:**
- Data center projects: weekly full scan + daily delta check
- Events: daily scan
- Officials: monthly refresh (elections change things)
- Corporate relationships: weekly scan for news/filings

**Data sources for seed scrape:**

| Data | Primary Sources |
|------|----------------|
| Data center locations | Data Center Map (datacentermap.com), Baxtel, news aggregation, state energy commission filings, BLS construction permits |
| Federal officials | Google Civic Information API (free, address-based) |
| State officials | OpenStates API (free, district-based) |
| Local officials | Google Civic Info (partial), manual seed for gaps, city government websites |
| Events | Government meeting scrapers, news keyword monitoring, activist org calendars |
| Corporate relationships | SEC EDGAR, OpenCorporates, lobbying disclosure databases (senate.gov/lda), OpenSecrets |

### 6.5 Known Gaps — Local Officials

Google Civic Info API coverage for local government is inconsistent. Strategy:

1. **Use the API first** — it covers many cities and counties
2. **Flag gaps** — if a data center's local jurisdiction returns no local officials, flag it in the DB
3. **Scrape city websites** — Claude skill can parse city council pages for contact info
4. **Prioritize** — seed local officials for the 20-30 jurisdictions with the most active/controversial projects first

---

## 7. Design Direction

### Aesthetic: "Civic Intelligence"

Modern, authoritative, clean. Think: The Markup meets Felt (felt.com) meets Bloomberg Terminal for citizens. Not flashy — trustworthy. The data speaks.

**Typography:**
- Headlines: JetBrains Mono or IBM Plex Mono (signals data, transparency, code-is-law)
- Body: IBM Plex Sans (clean, institutional, readable)

**Color Palette:**
- Background: `#0A0F1C` (deep navy-black)
- Surface: `#111827` (card backgrounds)
- Primary accent: `#22D3EE` (cyan — data/tech signal)
- Status colors as defined in 4.1
- Text: `#F1F5F9` primary, `#94A3B8` secondary

**Layout:**
- Map is full-viewport on landing — no hero, no fold, immediate utility
- Persistent top nav: logo | Map | Graph | Events | Learn | About
- Detail panels slide in from the right (desktop) or bottom (mobile)
- Graph view is also full-viewport with floating controls

**Animations:**
- Markers pulse gently on the map (especially "under construction" and "permitting")
- Graph nodes have subtle orbital motion when idle
- Panel transitions: smooth slide + fade
- Status badge colors glow subtly

---

## 8. MVP Build Plan — 1-Day Sprint

### Phase 1: Foundation (2 hours)

- [ ] Initialize Next.js 14 project with Tailwind
- [ ] Set up Supabase project, run schema migration
- [ ] Configure Mapbox account and token
- [ ] Set up project on Vercel, connect repo
- [ ] Create basic layout: nav + full-viewport map container

### Phase 2: Seed Data (2 hours)

- [ ] Run Claude scraping skill to compile initial dataset of ~50 major US AI data center projects
- [ ] Populate `data_centers` table with seed data
- [ ] Populate `organizations` table with major players (Microsoft, Google, Meta, Amazon, Oracle, xAI, CoreWeave, QTS, Vantage, etc.)
- [ ] Create `organization_relationships` for known connections (Project Stargate, joint ventures, PE backing)
- [ ] Pull federal + state officials via Google Civic Info / OpenStates for each data center location
- [ ] Seed 10-20 upcoming events from recent news

### Phase 3: Map View (2 hours)

- [ ] Implement interactive map with clustered markers
- [ ] Color-code markers by status
- [ ] Click-to-open detail panel
- [ ] Detail panel: project info + officials list + events
- [ ] "Near me" geolocation
- [ ] Basic filters (status, state)

### Phase 4: Graph View (2 hours)

- [ ] Build `/graph` page with react-force-graph-3d
- [ ] Load graph data from Supabase (orgs + relationships + officials + projects)
- [ ] Color nodes by type, label edges by relationship
- [ ] Click node → info panel
- [ ] Search/filter controls
- [ ] 2D/3D toggle

### Phase 5: Events + Education (1 hour)

- [ ] Build `/events` page with filterable list
- [ ] Build `/learn` pages from markdown content
- [ ] Build `/about` page

### Phase 6: Polish + Deploy (1 hour)

- [ ] Responsive design pass (mobile map, mobile panels)
- [ ] SEO: meta tags, OpenGraph, page titles
- [ ] README and LICENSE in repo
- [ ] Final Vercel deploy
- [ ] Smoke test all routes

---

## 9. Post-MVP Roadmap

### v0.2 — Data Pipeline Automation (Week 2)
- Claude Code scraping skill formalized and documented
- Vercel cron jobs for daily event scanning
- Automated official refresh on schedule
- Gap detection and flagging for local officials

### v0.3 — Deep Enrichment (Week 3-4)
- Lobbying disclosure integration (Senate LDA, OpenSecrets)
- SEC EDGAR filing links for corporate entities
- Campaign contribution data for officials (FEC)
- Energy and water usage data from utility filings

### v0.4 — International Expansion (Month 2)
- UK data centers + UK Parliament/Council officials
- Canada data centers + MP/MLA/municipal officials
- Australia data centers + Parliament/Council officials
- Localized educational content per country

### v0.5 — Advanced Features (Month 3)
- Timeline view: history of each project from announcement to operation
- Comparative analysis: side-by-side project comparison
- Email/SMS alerts: "notify me about projects near me"
- Embeddable widgets for journalists and orgs
- API access for researchers
- PDF export of project dossiers

### v1.0 — Platform Maturity (Month 4-6)
- Full automated scraping pipeline (Vercel Agent SDK)
- Comprehensive local official coverage
- Historical data and trend analysis
- Mobile-optimized PWA
- Accessibility audit (WCAG AA)
- Multi-language support

---

## 10. Success Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Data center projects indexed | 200+ US |
| Official contact records | 1,000+ |
| Events indexed | 100+ |
| Monthly unique visitors | 5,000 |
| Avg. session duration | > 3 min |
| Civic actions taken (clicks to official contact) | Track via analytics |

---

## 11. Open Source Strategy

- **Repository:** Public GitHub from day one
- **License:** AGPL-3.0 (ensures derivative works remain open)
- **Data license:** CC BY-SA 4.0 for all scraped/compiled datasets
- **Contributing:** CONTRIBUTING.md with clear guidelines
- **Methodology:** All scraping logic and data sources documented transparently

---

## 12. Risk Register

| Risk | Severity | Mitigation |
|------|----------|------------|
| Local official data gaps | High | API-first + manual seed for priority jurisdictions |
| Scraped data accuracy | High | Source URLs for every claim, "last verified" timestamps |
| Mapbox costs at scale | Medium | Free tier generous (50k loads/mo), fallback to Maplibre |
| Data staleness | Medium | Automated refresh cadence, visible "last updated" dates |
| Supabase free tier limits | Low | 500MB DB, 2GB storage sufficient for v0.1, upgrade path clear |
| Legal (scraping) | Low | Public data only, government records, news articles |

---

*Built in the open by Benjamin Life (@omniharmonic)*
*datacenter.observer — civic intelligence for the age of AI infrastructure*
