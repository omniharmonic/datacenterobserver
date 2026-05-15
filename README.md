# datacenter.observer

> Civic intelligence for the age of AI infrastructure.

A single, open-source platform that lets any citizen, journalist, or local organizer answer four questions about AI data centers in the United States:

- **Where** are they being built or planned?
- **Who** is building, funding, and approving them?
- **When** can the public weigh in?
- **How** are the companies, investors, utilities, and officials connected?

The current build ships with editorial seed data covering ~30 of the largest US AI data center projects and the federal + state officials representing them.

---

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 (or whichever port Next picks).

No API keys are required for the MVP. The map uses free CartoDB dark-matter tiles via MapLibre GL by default; if you want Mapbox styling, set `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Full-viewport map. Click any marker to open the project detail panel. |
| `/graph` | 3D / 2D force-directed graph of companies, officials, and projects. |
| `/events` | Filterable index of public-comment windows, hearings, votes, and protests. |
| `/learn` | Four primers: what AI data centers are, how to participate, follow the money, glossary. |
| `/about` | Mission, methodology, attribution, license, contributing. |

## API

All routes serve JSON; the same shape will be served whether the data layer is local seed files (today) or Supabase (soon).

```
GET /api/data-centers              ?status=&state=&q=&limit=
GET /api/data-centers/[slug]       full record with companies, officials, events
GET /api/graph                     { nodes, edges } for /graph
GET /api/events                    ?state=&type=&status=&upcoming=true
GET /api/officials                 ?state=&level=
GET /api/organizations/[slug]
GET /api/stats
GET /api/search                    ?q=
```

## Project layout

```
app/                 Next.js App Router pages + API routes
components/          Map, Graph, Events, Shared components
content/learn/       Markdown primers (rendered via remark)
data/seed/           Typed seed datasets (DCs, orgs, officials, events, relationships)
lib/
  data/source.ts     Data-access layer. Single point of swap to Supabase.
  types.ts           Shared TypeScript types
  constants.ts       Status colors, node colors, labels
  hooks/             SWR fetch helper
```

The data-access layer (`lib/data/source.ts`) is the single point at which seed JSON can be swapped for a Supabase/Postgres client. The Next.js routes, hooks, and React components consume the same exported functions either way.

## Tech stack

- **Next.js 16** App Router · React 19 · TypeScript · Turbopack
- **Tailwind CSS** with custom dark-mode design tokens
- **MapLibre GL** (via `react-map-gl/maplibre`) — free, no key required; falls back to Mapbox if a token is set
- **Supercluster** for client-side marker clustering
- **react-force-graph-3d / 2d** (Three.js + WebGL) for the force-directed graph
- **SWR** for client data fetching
- **gray-matter + remark** for markdown rendering

## Roadmap

### v0.1 (current — MVP)
- ✅ Map view with clustering, filters, detail panel
- ✅ Force-graph view (3D + 2D) with category filters
- ✅ Events index
- ✅ Learn section + About + methodology
- ✅ Local JSON data layer (~30 projects, 60 officials, 23 orgs, 19 events)

### v0.2 — automated pipeline
- Supabase + Postgres + PostGIS migration of the seed
- Automated ingestion from FracTracker, datacentertracker.org, Epoch AI
- Geocodio batch resolution of federal + state officials for every site
- Vercel Cron jobs for daily refresh
- "Last verified" timestamps surfaced everywhere

### v0.3 — deep enrichment
- Senate LDA lobbying data
- OpenSecrets FEC campaign contributions
- SEC EDGAR filing links per company
- Utility PSC docket links
- Local officials seeded for ~30 highest-controversy jurisdictions

### v0.4 — international
- UK, Canada, Australia data centers
- Localized officials lookup per country

See `.claude/PRD-datacenter-observer.md` for the full product spec and `.claude/implementation-plan-datacenter-observer.md` for the task graph.

## Data attribution

The seed dataset draws from public reporting and from these openly-licensed sources:

- [FracTracker Alliance](https://fractracker.org/data-centers/) — primary facility-level data
- [datacentertracker.org](https://datacentertracker.org) — community actions & legislation (CC BY 4.0)
- [Epoch AI](https://epoch.ai/data/data-centers) — hyperscale + technical metrics (CC BY)
- [unitedstates/congress-legislators](https://github.com/unitedstates/congress-legislators) — federal officials (CC0)
- [Geocodio](https://www.geocod.io) — federal + state officials by address (paid tier when deployed)

All editorial datapoints carry source URLs. Where the source is community-maintained, we follow upstream attribution.

## License

- **Code:** AGPL-3.0-or-later
- **Data:** CC BY-SA 4.0
- **Editorial content (`content/learn/`):** CC BY-SA 4.0

Built in the open by Benjamin Life ([@omniharmonic](https://github.com/omniharmonic)). Suggestions, corrections, and additions welcome — especially missing projects, local-official seeds, and lobbying disclosures.
