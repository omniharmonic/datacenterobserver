# DataCenterWatch — Data Source Survey & Technical Assessment

**Author:** Benjamin Life (@omniharmonic)
**Date:** May 14, 2026

---

## Executive Summary

The good news: the data ecosystem for this project is far richer than I initially expected. There are multiple open-access, well-maintained databases of AI data center locations with CC-licensed downloadable datasets. The elected officials situation is more complex — Google shut down its Representatives API in April 2025, fragmenting the ecosystem — but Geocodio has emerged as a strong single-source solution for federal and state officials with a generous free tier. Local officials remain the hardest problem, with no free comprehensive source.

This document grades each source on reliability, coverage, licensing, and our ability to automate ingestion.

---

## 1. AI Data Center Locations

This is the foundation of the entire platform. We need: location (lat/lng), operator, status, capacity (MW), footprint, and source citations.

### 1A. FracTracker Alliance — Open U.S. Data Centers Tracker ⭐ PRIMARY

**URL:** fractracker.org/data-centers
**Format:** ArcGIS dashboard with downloadable dataset
**Coverage:** 1,400+ US facilities, 803 in pre-development/construction
**License:** Open access, non-commercial use with credit to FracTracker
**Update cadence:** Daily updates, crowdsourced contributions accepted

**Fields available:**
- Address and geographic coordinates (lat/lng)
- Operating company and/or tenant
- Status (Proposed, Approved/Permitted/Under Construction, Operational)
- Energy demand in MW
- Estimated square footage and acreage
- Power sourcing (dedicated power plants, grid-connected)
- Cooling method and type (air, water, closed loop, open loop)
- Advocacy tab with community resistance data, petitions, grassroots campaigns

**Assessment:** This is our primary seed dataset. It's the most comprehensive open-access facility-level tracker available, with exactly the civic engagement angle we need. The advocacy data is a bonus — we can cross-reference their community response data with our events index. The non-commercial license is compatible with our AGPL open-source release, but we should confirm with FracTracker and provide clear attribution.

**Ingestion strategy:** Their data lives in ArcGIS. We can either access the ArcGIS REST API directly (the experience app has an underlying feature layer) or contact them for a CSV export. Claude skill can scrape the ArcGIS feature service endpoint for structured JSON.

---

### 1B. datacentertracker.org ⭐ PRIMARY COMPLEMENT

**URL:** datacentertracker.org
**Format:** CSV and JSON download (built with MapLibre)
**Coverage:** US-focused, community responses and legislative actions
**License:** CC BY 4.0 (data), MIT (code) — ideal for our use
**Maintainers:** Cam Acosta and George Ingebretsen (Berkeley-affiliated)

**Unique value:** This dataset specifically tracks the civic/community response dimension:
- Community actions: zoning restrictions, moratoriums, lawsuits, public comments, project withdrawals
- Legislation tracker: state and local bills related to data centers
- Filters by action type, status (pending/resolved), issue category (water, zoning, noise, farmland, etc.)
- Investment amounts
- County political lean (R/D)

**Assessment:** This is a perfect complement to FracTracker. Where FracTracker focuses on the facilities themselves, datacentertracker.org focuses on what communities are doing about them. The CC BY 4.0 license is fully permissive. We should use this as our primary source for the events/actions index and legislation tracking.

**Ingestion strategy:** Direct CSV/JSON download from the site. They expose their full dataset openly.

---

### 1C. Epoch AI — Frontier Data Centers

**URL:** epoch.ai/data/data-centers
**Format:** CSV download
**Coverage:** Largest existing or planned data centers globally (~15% of global AI compute coverage)
**License:** CC BY (Creative Commons Attribution) — fully open
**Update cadence:** Actively maintained, satellite imagery verified

**Unique value:**
- Satellite/aerial imagery tracking construction progress over time
- Detailed timeline data: power capacity, compute capacity, capital cost per facility over time
- Water usage data (expanding)
- Building area measurements
- Networking relationships between data centers (distributed training runs)
- Cooling infrastructure data (chillers, cooling towers as separate CSVs)

**Assessment:** Best source for the deep technical metrics — MW capacity, cost, water usage, construction timeline. The satellite imagery verification makes their data highly reliable. CC BY license is ideal. Smaller dataset than FracTracker (focused on frontier/hyperscale only) but much deeper data per facility.

**Ingestion strategy:** Direct CSV download. They explicitly encourage citation and reuse.

---

### 1D. AI Data Center Index (aidatacenterindex.com)

**URL:** aidatacenterindex.com
**Format:** CSV/JSON bulk exports (paid), free browsing per-facility
**Coverage:** 344 facilities across 64 countries, 84 in US
**License:** Free to browse; bulk CSV/JSON exports through data access page (pricing unclear)

**Unique value:**
- International coverage (64 countries) for our future expansion
- Operator-level aggregation: Microsoft (56), AWS (44), Google (42), NVIDIA (21)
- Energy sourcing breakdown: 54% renewable/nuclear, remainder mixed/fossil
- Pipeline stage breakdown
- Capacity ranking by IT load

**Assessment:** Useful for international expansion (v0.4) and for cross-referencing operator-level data. However, bulk export may have costs. Lower priority for MVP.

---

### 1E. Additional / Cross-Reference Sources

| Source | Use | Notes |
|--------|-----|-------|
| **Aterio** | Commercial data on US data centers | Used by Visual Capitalist; likely paid |
| **usdatamap.com** | 800+ US facilities map | Good for cross-referencing |
| **Baxtel** | Global data center directory | Commercial focus, colocation |
| **cleanview.co** | US data center project tracker | Format/licensing unclear |
| **State energy commission filings** | Permit-level data | Per-state, high effort to aggregate |

---

## 2. Elected Officials

This is the most complex data layer. We need officials at three levels per data center location: federal, state, and local — with contact info (phone, email, office, website, party).

### The Google Civic API Problem

**Critical context:** Google shut down the Representatives API endpoint in April 2025. This was the single most-used free API for elected official lookups, and its closure fragmented the entire civic data ecosystem. The remaining Google Civic Info API only covers elections and polling places — not officials.

The community has scattered to multiple alternatives. Here's what's available:

---

### 2A. Geocodio ⭐ PRIMARY (Federal + State Officials)

**URL:** geocod.io
**API:** RESTful, v1.9+
**Free tier:** 2,500 lookups/day (no credit card required)
**Coverage:** Federal (Congress) + State legislators + Congressional/state legislative district matching
**Data source:** unitedstates/congress-legislators project + state-level sources

**What it returns per address/coordinate:**
- Congressional district (number, name, OCD-ID)
- State House district
- State Senate district
- For each district, current legislators with:
  - Full name, party, seniority
  - Office phone, address, website, contact form URL
  - Social media (Twitter, Facebook, YouTube)
  - Bioguide ID, GovTrack ID, OpenSecrets ID (cross-reference keys)
  - Photo source

**How we'd use it:**
For each data center in our database, send its lat/lng to Geocodio with `fields=cd,stateleg`. One API call returns all federal and state officials for that location. At 2,500 free lookups/day and ~200 data centers for MVP, we can resolve all officials in a single batch run with headroom to spare.

**Assessment:** This is the clear winner for federal/state. Single API call returns geocoding + districts + official contact info. The free tier is generous. Also supports Canadian ridings for international expansion. The legislator data is sourced from the well-maintained unitedstates project (CC0 public domain). Cost-effective to scale: even at paid tiers, batching is cheap.

---

### 2B. unitedstates/congress-legislators ⭐ BACKUP / ENRICHMENT

**URL:** github.com/unitedstates/congress-legislators
**Format:** YAML/JSON/CSV
**Coverage:** All current and historical members of Congress, 1789–present
**License:** CC0 (public domain) — completely unrestricted
**Update cadence:** Actively maintained (last updated April 2026)

**What it includes:**
- legislators-current.yaml: all sitting members of Congress
- Contact info: office addresses, phone, website, contact form
- Social media: Twitter, Facebook, YouTube
- Cross-reference IDs: Bioguide, GovTrack, OpenSecrets, ICPSR, Ballotpedia, Wikipedia
- Committee assignments

**Also available:**
- unitedstates/contact-congress: reverse-engineered contact form specs for House/Senate
- unitedstates/images: public domain headshots of all members

**Assessment:** Perfect as a backup/enrichment layer and for building our own officials database. Since Geocodio sources from this same project, the data is consistent. We can pull this directly into Supabase as our canonical federal officials table and cross-reference with Geocodio results.

---

### 2C. OpenStates / Plural Policy (State Legislators)

**URL:** v3.openstates.org (API) / open.pluralpolicy.com
**Format:** JSON REST API (v3)
**Coverage:** All 50 states + DC + Puerto Rico — state legislators, legislation, committees
**License:** Open data, free API key required
**Maintained by:** Plural Policy (adopted from Sunlight Foundation project)

**What it provides:**
- State legislator lookup by lat/lng or district
- Full contact info, party, chamber, district
- Legislation tracking (bills, votes, committees)
- Hearing schedules (useful for events index)

**Assessment:** Overlaps with Geocodio for state legislator lookups, but adds unique value through legislation and hearing data. We should use OpenStates specifically for tracking data center-related state bills and committee hearings — feeding directly into our events index. The hearing schedule data is exactly what we need for the "public comment periods" feature.

**GraphQL API being sunset December 2026 in favor of v3 REST API.** Make sure we build on v3.

---

### 2D. The Local Officials Gap ⚠️ BIGGEST CHALLENGE

No free, comprehensive API exists for local elected officials (mayors, city council, county commissioners, planning commission).

**Available paid options:**
| Source | Coverage | Cost |
|--------|----------|------|
| **Cicero** (cicerodata.com) | Most comprehensive — federal through local, international | Free trial (1,000 credits/90 days), paid tiers after. Covers US, UK, Canada, Australia, NZ |
| **BallotReady** | 200,000+ officeholders including local, school board | Paid API, pricing on inquiry |
| **Ballotpedia** | Comprehensive federal + state, some local | Paid for bulk/API access |

**Free strategies for local officials:**

1. **Geocodio for county:** Geocodio returns county FIPS codes with every geocode. We can use this to look up county-level government websites.

2. **City/county website scraping:** For the ~50–100 jurisdictions that matter most (where active data center projects exist), we build Claude scraping skills that can parse:
   - City council pages (usually have member names, contact info)
   - County commissioner pages
   - Planning commission pages
   This is manual but targeted — we don't need every city in America, just the ones with data centers.

3. **Cicero free trial for seeding:** Use the 1,000 free credits to pull local officials for our highest-priority jurisdictions, then maintain via scraping.

**Recommendation:** Use Geocodio as our primary official resolver. Supplement with targeted local scraping for priority jurisdictions. Evaluate Cicero free trial for initial seed. Budget for BallotReady or Cicero paid tier if the project gets traction and needs comprehensive local coverage.

---

## 3. Corporate Relationships & Financial Data

This powers the 3D force graph — the "who's behind this" visualization.

### 3A. OpenCorporates

**URL:** api.opencorporates.com
**Coverage:** 170+ jurisdictions worldwide, company registrations, officers, subsidiaries
**License:** Free for open data projects (share-alike attribution); paid for commercial use
**API limits:** 500 calls/month (free tier), 200/day

**What it provides:**
- Company registration details (name, number, status, jurisdiction)
- Officers/directors
- Subsidiary/parent relationships via Relationships File
- Filing history
- Cross-border corporate structure mapping

**Assessment:** Essential for mapping corporate ownership chains. The share-alike license is compatible with our AGPL release. The API limits are tight (500/month) but we're building a relatively small graph — maybe 200–500 entities — so we can build the initial graph with manual research + spot API checks. For deeper corporate structure mapping, their Relationships File (paid) would be ideal.

**Strategy:** Manually research and seed the major corporate relationships (Microsoft↔Stargate, Meta↔QTS, etc.) and use OpenCorporates API for verification and filling gaps.

---

### 3B. OpenSecrets ⭐ PRIMARY (Lobbying + Campaign Finance)

**URL:** opensecrets.org/open-data
**Format:** Bulk CSV download + REST API
**Coverage:** Federal lobbying, campaign contributions, PAC spending, dark money
**License:** CC BY-NC-SA 3.0 (except Revolving Door data)
**Source data:** FEC filings, Senate Office of Public Records

**What it provides:**
- **Lobbying:** Which companies lobby Congress, how much they spend, which bills they lobby on, which firms they hire
- **Campaign contributions:** Who donates to which officials, by organization
- **Organization profiles:** Compilations of all political spending by company
- **Industry analysis:** Tech industry lobbying totals, trends

**How we'd use it:**
For each organization in our graph (Microsoft, Google, Meta, etc.), pull their OpenSecrets org profile to show: total lobbying spend, top recipients in Congress, lobbying firms hired, specific bills lobbied on. This creates the lobbying edges in our graph.

**Assessment:** This is the gold standard for money-in-politics data. The bulk download is comprehensive and well-documented. The CC BY-NC-SA license is compatible with our use (we're a non-commercial open-source project). Must credit OpenSecrets in attribution.

---

### 3C. Senate LDA (Lobbying Disclosure Act) — lda.gov

**URL:** lda.gov/api
**Format:** REST API (JSON)
**Coverage:** All federal lobbying registrations and quarterly reports
**License:** Public domain (US government data)

**What it provides:**
- LD-1 registrations: who is lobbying for whom
- LD-2 quarterly reports: specific issues, bills lobbied on, spending
- LD-203 contribution reports: political contributions by lobbyists

**Note:** The old lda.senate.gov will sunset June 30, 2026. Use lda.gov going forward.

**Assessment:** The authoritative primary source for lobbying data. OpenSecrets processes this into more usable formats, so for most purposes we should use OpenSecrets. But for verifiable primary source citations on specific lobbying relationships, link directly to LDA filings.

---

### 3D. SEC EDGAR

**URL:** efts.sec.gov/LATEST/search-index?q=...
**Format:** REST API, XBRL
**Coverage:** All public company filings (10-K, 10-Q, 8-K, proxy statements)
**License:** Public domain

**Use case:** For verifying major corporate transactions — mergers, acquisitions, joint ventures (like Project Stargate). Not for bulk data ingestion, but for source citation links in the corporate graph.

---

### 3E. FEC (Federal Election Commission)

**URL:** api.open.fec.gov
**Format:** REST API + bulk download
**Coverage:** All federal campaign finance — candidates, committees, contributions, spending
**License:** Public domain
**API key:** Free, required

**Use case:** Cross-reference with OpenSecrets data. If an official in our database is receiving significant tech industry contributions, we can show that in their profile.

---

## 4. Events & Civic Actions

### 4A. datacentertracker.org (Community Actions) ⭐ PRIMARY

Already covered in 1B above. Their dataset includes:
- Community actions with dates, jurisdictions, status
- Action types: zoning restrictions, moratoriums, lawsuits, public comments, project withdrawals
- Issue categories: water, environmental, zoning, noise, farmland, tax/incentive
- Resolution status: pending, favorable, unfavorable, mixed

This is our primary events seed dataset.

### 4B. OpenStates — State Legislative Hearings

Hearing schedules for state legislatures can surface public comment opportunities on data center legislation. Use OpenStates v3 API to monitor for hearings related to data center keywords.

### 4C. News Scraping (Automated)

For ongoing event discovery, we need a Claude scraping skill that monitors:

**Target sources:**
| Source | What to find |
|--------|-------------|
| Local government meeting agendas (city/county) | Planning commission hearings, zoning votes |
| State PUC/energy commission calendars | Utility rate hearings, interconnection proceedings |
| Google News alerts | Protests, community meetings, press conferences |
| Eventbrite / local event platforms | Community organizing events |
| Change.org / Action Network | Petitions related to data centers |
| Local newspaper websites | Coverage of public hearings and community response |

**Keywords to monitor:** "data center" + [hearing OR protest OR moratorium OR public comment OR town hall OR community meeting OR zoning OR permit OR opposition OR rally]

---

## 5. Geocoding & District Matching

### 5A. Geocodio ⭐ (Already covered in 2A)

Geocodio is our single solution for:
- Address → coordinates (forward geocoding)
- Coordinates → address (reverse geocoding)
- Coordinates → Congressional district
- Coordinates → State legislative districts
- Coordinates → County FIPS code
- All with legislator contact info appended

2,500 free lookups/day. Canadian ridings also supported for international expansion.

### 5B. US Census TIGER/LINE Shapefiles (Backup)

**URL:** census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html
**Format:** Shapefiles / GeoJSON
**License:** Public domain

Provides Congressional district, state legislative district, and county boundary polygons. We could do our own point-in-polygon matching if needed, but Geocodio handles this for us.

---

## 6. Recommended Data Stack Summary

### MVP (Day 1) Priority Order

| Priority | Data Layer | Primary Source | Backup/Enrichment |
|----------|-----------|----------------|-------------------|
| 🔴 P0 | Data center locations | FracTracker (1,400+ sites) | datacentertracker.org, Epoch AI |
| 🔴 P0 | Federal officials | Geocodio API | unitedstates/congress-legislators |
| 🔴 P0 | State officials | Geocodio API | OpenStates v3 |
| 🟡 P1 | Civic events/actions | datacentertracker.org | News scraping |
| 🟡 P1 | Corporate relationships | Manual research + OpenCorporates | SEC EDGAR for citations |
| 🟡 P1 | Lobbying data | OpenSecrets bulk download | lda.gov API |
| 🟢 P2 | Local officials | Targeted city website scraping | Cicero free trial |
| 🟢 P2 | Campaign finance | OpenSecrets / FEC | — |
| 🟢 P2 | Legislation tracker | datacentertracker.org + OpenStates | — |

### API Keys Needed for MVP

| Service | Cost | Key Required |
|---------|------|-------------|
| Geocodio | Free (2,500/day) | Yes — geocod.io |
| OpenStates / Plural | Free | Yes — open.pluralpolicy.com |
| Mapbox | Free (50k loads/mo) | Yes — mapbox.com |
| OpenSecrets | Free for non-commercial | Yes — opensecrets.org/api |
| Congress.gov | Free (5,000 req/hr) | Yes — api.data.gov |
| OpenCorporates | Free for open data | Yes — opencorporates.com |

### License Compatibility Matrix

| Source | License | Compatible with AGPL? | Attribution Required? |
|--------|---------|----------------------|----------------------|
| FracTracker | Non-commercial with credit | Yes (we're non-commercial/open source) | Yes — "Data from FracTracker Alliance" |
| datacentertracker.org | CC BY 4.0 | Yes | Yes — credit Cam Acosta & George Ingebretsen |
| Epoch AI | CC BY | Yes | Yes — "Epoch AI, Frontier Data Centers" |
| unitedstates project | CC0 (public domain) | Yes | No (but encouraged) |
| OpenSecrets | CC BY-NC-SA 3.0 | Yes (non-commercial) | Yes — "Data from OpenSecrets" |
| LDA / FEC / EDGAR | Public domain | Yes | No |
| OpenCorporates | Share-alike attribution | Yes (share-alike ≈ AGPL compatible) | Yes |
| Geocodio | Commercial API, results storable | Yes (explicitly allows storing results) | Encouraged |

---

## 7. Key Risks & Mitigations

### Risk 1: FracTracker non-commercial license interpretation
**Risk:** Our AGPL code is open source, but is the project "non-commercial"?
**Mitigation:** We're an individual open-source project with no revenue model. Contact FracTracker proactively — they're advocacy-oriented and likely enthusiastic about this use case. Worst case, we scrape the same public sources they do and build our own dataset.

### Risk 2: Local officials data gap
**Risk:** No free comprehensive source for mayors, city councils, planning commissions.
**Mitigation:** Phased approach — start with federal/state (Geocodio handles this perfectly), then manually seed local officials for the 30–50 highest-priority jurisdictions via city website scraping. This is a Claude Code skill that can be run incrementally.

### Risk 3: ArcGIS data extraction from FracTracker
**Risk:** FracTracker's data lives in an ArcGIS dashboard — not a simple CSV download.
**Mitigation:** ArcGIS Feature Services expose a REST API. We can query the underlying feature layer for JSON data. Alternatively, contact FracTracker directly for a data export — they encourage data sharing.

### Risk 4: Geocodio rate limits for scaling
**Risk:** 2,500 free lookups/day could be a bottleneck if we scale to 1,400+ data centers with frequent refreshes.
**Mitigation:** Officials don't change often — we only need to re-resolve after elections (every 2 years for federal, varying for state). One-time batch of 1,400 lookups is under a single day's free limit. Pay-as-you-go pricing is also affordable.

### Risk 5: Data staleness
**Risk:** Contact info changes, officials leave office, data centers change status.
**Mitigation:** Every record gets a `last_verified_at` timestamp displayed to users. Automated refresh cadences: officials monthly, data centers weekly, events daily. FracTracker and datacentertracker.org are actively maintained, so we benefit from their ongoing updates.

---

*Research compiled by Benjamin Life (@omniharmonic)*
*datacenter.observer — civic intelligence for the age of AI infrastructure*
