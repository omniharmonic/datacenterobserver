import Link from 'next/link';
import { Github, ExternalLink, Heart } from 'lucide-react';
import { getStats } from '@/lib/data/source';

export const metadata = {
  title: 'About — datacenter.observer',
  description:
    'Mission, methodology, attribution, and open-source roadmap for datacenter.observer.',
};

export default async function AboutPage() {
  const s = await getStats();
  return (
    <div className="max-w-3xl mx-auto px-5 py-10 space-y-10">
      <header>
        <p className="font-display text-[11px] uppercase tracking-widest text-accent-cyan">
          About
        </p>
        <h1 className="font-display text-3xl font-bold mt-1 text-slate-100">
          Civic intelligence for AI infrastructure.
        </h1>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-2xl">
          AI data centers are being built across the United States faster than communities,
          regulators, or journalists can track them. <strong className="text-slate-200">datacenter.observer</strong> is
          a single, open-source platform that answers four questions citizens deserve clean answers to:
          <em>where</em> are they being built, <em>who</em> is building them,
          <em> when</em> can the public weigh in, and <em>how</em> are the companies and officials
          involved connected.
        </p>
      </header>

      <section>
        <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">
          What's tracked today
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label="Projects" value={s.totalDcs} />
          <Stat label="Gigawatts" value={(s.totalMw / 1000).toFixed(1)} />
          <Stat label="Companies" value={s.totalOrgs} />
          <Stat label="Officials" value={s.totalOfficials} />
          <Stat label="Events" value={s.totalEvents} />
          <Stat label="Upcoming" value={s.upcomingEvents} />
          <Stat
            label="Capex"
            value={`$${(s.totalCapex / 1_000_000_000).toFixed(0)}B`}
          />
          <Stat label="States covered" value={Object.keys(s.byState).length} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">Methodology</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          The current dataset is editorial — assembled from public reporting (Reuters, Bloomberg,
          WSJ, local press), company press releases, and the FracTracker Alliance,
          datacentertracker.org, and Epoch AI open datasets. Every project links back to the
          public sources that informed it; if you find an error or have a missing project, the
          repo welcomes pull requests.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed mt-3">
          The data layer (
          <code className="bg-bg-elevated px-1.5 py-0.5 rounded text-[12px] text-slate-200">
            lib/data/source.ts
          </code>
          ) is now backed by Supabase Postgres with public-read row-level security. Each
          serverless instance hydrates the full dataset on cold start and serves O(1) lookups
          thereafter. Migrations live in{' '}
          <code className="bg-bg-elevated px-1.5 py-0.5 rounded text-[12px] text-slate-200">
            supabase/migrations/
          </code>
          ; the seed pipeline in{' '}
          <code className="bg-bg-elevated px-1.5 py-0.5 rounded text-[12px] text-slate-200">
            scripts/seed-supabase.ts
          </code>{' '}
          is idempotent and re-runnable from typed seed files.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed mt-3">
          Still on the roadmap: PostGIS geospatial indexes for radius queries, automated
          ingestion from FracTracker's ArcGIS feature service, and Geocodio-resolved
          federal/state/local official lookups keyed off each site's parcel address.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">Open data sources</h2>
        <ul className="space-y-2 text-sm">
          {[
            { name: 'FracTracker Alliance', url: 'https://fractracker.org/data-centers/', note: '1,400+ US sites, daily updates' },
            { name: 'datacentertracker.org', url: 'https://datacentertracker.org', note: 'CC BY 4.0 — community actions & legislation' },
            { name: 'Epoch AI Frontier Data Centers', url: 'https://epoch.ai/data/data-centers', note: 'Satellite-verified hyperscale tracking' },
            { name: 'Geocodio', url: 'https://www.geocod.io', note: 'Federal + state officials by address' },
            { name: 'OpenStates / Plural Policy', url: 'https://open.pluralpolicy.com', note: 'State legislators, bills, hearings' },
            { name: 'unitedstates/congress-legislators', url: 'https://github.com/unitedstates/congress-legislators', note: 'CC0 federal officials, photos, contact' },
          ].map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-accent-cyan hover:underline"
              >
                <ExternalLink size={12} />
                {s.name}
                <span className="text-slate-500 text-xs ml-1">· {s.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">License & ethics</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Code: <strong className="text-slate-200">AGPL-3.0</strong> — derivative works remain
          open. Data: <strong className="text-slate-200">CC BY-SA 4.0</strong>. Source citations
          accompany every datapoint. Where the source is community-maintained (e.g., FracTracker,
          datacentertracker.org), we follow upstream licensing and link to attribution.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed mt-3">
          This project is informational, not adversarial. The goal is to make public processes
          visible to the public who has the right to participate in them.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-slate-100 mb-3">Get involved</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/omniharmonic/datacenterobserver"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-bg-surface border border-border hover:border-accent-cyan/40 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            <Github size={14} /> Contribute on GitHub
          </a>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 bg-bg-surface border border-border hover:border-accent-cyan/40 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Read the primers
          </Link>
        </div>
        <p className="text-xs text-slate-600 mt-4 flex items-center gap-1.5">
          <Heart size={11} />
          Built in the open by Benjamin Life (
          <a href="https://github.com/omniharmonic" className="hover:text-accent-cyan">
            @omniharmonic
          </a>
          ). Suggestions, corrections, and additions welcome — especially missing projects and
          local-official seeds.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-bg-surface border border-border rounded-md px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-display">{label}</p>
      <p className="font-display text-lg font-semibold text-accent-cyan">{value}</p>
    </div>
  );
}
