import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Building2, Globe } from 'lucide-react';
import {
  getOrganizationDetail,
  listOrganizations,
  type OrgRelation,
  type OrgDcLink,
} from '@/lib/data/source';
import { NODE_COLORS, STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';

export async function generateStaticParams() {
  const orgs = await listOrganizations();
  return orgs.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganizationDetail(slug);
  if (!org) return { title: 'Organization — datacenter.observer' };
  return {
    title: `${org.name} — datacenter.observer`,
    description:
      org.description ??
      `Ownership, lobbying, and data-center ties for ${org.name}.`,
  };
}

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getOrganizationDetail(slug);
  if (!org) notFound();

  const color = NODE_COLORS[org.type] ?? '#94A3B8';

  return (
    <div className="max-w-4xl mx-auto px-5 py-10 space-y-10">
      <Link
        href="/graph"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-accent-cyan font-display"
      >
        <ArrowLeft size={12} /> Back to graph
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <span className="font-display text-[11px] uppercase tracking-widest text-slate-500">
            {org.type.replace(/_/g, ' ')}
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-100 leading-tight">
          {org.name}
        </h1>
        {org.description && (
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl">
            {org.description}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-1">
          {org.headquarters && (
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={12} /> {org.headquarters}
            </span>
          )}
          {org.ticker && (
            <span className="font-mono text-accent-cyan">${org.ticker}</span>
          )}
          {org.website && (
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-accent-cyan hover:underline"
            >
              <Globe size={12} /> {new URL(org.website).hostname}
            </a>
          )}
          {org.estimated_lobbying_usd != null && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-slate-500">Federal lobbying:</span>
              <span className="text-slate-200 font-mono">
                ${(org.estimated_lobbying_usd / 1_000_000).toFixed(1)}M / yr
              </span>
            </span>
          )}
        </div>
      </header>

      {org.ownedBy.length > 0 && (
        <Section title="Owned / funded by" subtitle="Capital and control flowing in">
          <RelationList rows={org.ownedBy} />
        </Section>
      )}

      {org.controls.length > 0 && (
        <Section title="Owns / has invested in" subtitle="Capital and control flowing out">
          <RelationList rows={org.controls} />
        </Section>
      )}

      {org.dataCenters.length > 0 && (
        <Section
          title="Data centers"
          subtitle={`${org.dataCenters.length} project${org.dataCenters.length === 1 ? '' : 's'} in the dataset`}
        >
          <DcList rows={org.dataCenters} />
        </Section>
      )}

      {org.supplies.length > 0 && (
        <Section title="Supplies / contracts / lobbies for" subtitle="Outbound services and contracts">
          <RelationList rows={org.supplies} />
        </Section>
      )}

      {org.suppliedBy.length > 0 && (
        <Section title="Supplied / contracted / lobbied by" subtitle="Inbound services and contracts">
          <RelationList rows={org.suppliedBy} />
        </Section>
      )}

      <div className="text-xs text-slate-600 pt-6 border-t border-border">
        Data is editorial seed at this stage; relationships reflect public reporting and filings.
        Suggestions and corrections via{' '}
        <a
          href="https://github.com/omniharmonic/datacenterobserver"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-cyan hover:underline"
        >
          GitHub
        </a>
        .
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="font-display text-base font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function relLabel(rel: string) {
  return rel.replace(/_/g, ' ');
}

function RelationList({ rows }: { rows: OrgRelation[] }) {
  return (
    <ul className="space-y-1.5">
      {rows.map((r, i) => (
        <li
          key={`${r.organization.slug}-${i}`}
          className="bg-bg-surface border border-border rounded-md px-4 py-3 flex items-start gap-3"
        >
          <span
            className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: NODE_COLORS[r.organization.type] ?? '#94A3B8' }}
            aria-hidden
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <Link
                href={`/organizations/${r.organization.slug}`}
                className="font-display text-sm font-semibold text-slate-100 hover:text-accent-cyan"
              >
                {r.organization.name}
              </Link>
              <span className="font-display text-[10px] uppercase tracking-widest text-slate-500">
                · {relLabel(r.relationship)}
              </span>
              {r.value_usd != null && (
                <span className="font-mono text-[11px] text-accent-cyan ml-auto shrink-0">
                  ${formatUsd(r.value_usd)}
                </span>
              )}
            </div>
            {r.description && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.description}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function DcList({ rows }: { rows: OrgDcLink[] }) {
  return (
    <ul className="space-y-1.5">
      {rows.map(({ relationship, data_center: dc }) => (
        <li
          key={dc.slug}
          className="bg-bg-surface border border-border rounded-md px-4 py-3 flex items-start gap-3"
        >
          <span
            className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: STATUS_COLORS[dc.status] ?? '#94A3B8' }}
            aria-hidden
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <Link
                href={`/?dc=${dc.slug}`}
                className="font-display text-sm font-semibold text-slate-100 hover:text-accent-cyan"
              >
                {dc.name}
              </Link>
              <span className="font-display text-[10px] uppercase tracking-widest text-slate-500">
                · {relLabel(relationship)}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3">
              <span>{[dc.city, dc.county, dc.state].filter(Boolean).join(', ')}</span>
              <span>{STATUS_LABELS[dc.status]}</span>
              {dc.capacity_mw != null && <span>{dc.capacity_mw} MW</span>}
            </div>
          </div>
          <ExternalLink size={12} className="text-slate-600 mt-1.5 shrink-0" />
        </li>
      ))}
    </ul>
  );
}

function formatUsd(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000).toFixed(0)}K`;
}
