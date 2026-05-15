import Link from 'next/link';
import { listOrganizations } from '@/lib/data/source';
import { NODE_COLORS } from '@/lib/constants';
import type { Organization, OrganizationType } from '@/lib/types';

export const metadata = {
  title: 'Organizations — datacenter.observer',
  description:
    'Companies, investors, utilities, contractors, and lobbying firms behind US AI data center buildouts.',
};

const GROUP_ORDER: { key: OrganizationType; label: string }[] = [
  { key: 'tech_company', label: 'Hyperscalers & AI labs' },
  { key: 'cloud_provider', label: 'Cloud & GPU providers' },
  { key: 'consortium', label: 'Consortia' },
  { key: 'developer', label: 'Data-center developers & REITs' },
  { key: 'pe_firm', label: 'Private equity & infra investors' },
  { key: 'investor', label: 'Other investors' },
  { key: 'sovereign_wealth', label: 'Sovereign wealth' },
  { key: 'energy_utility', label: 'Energy utilities & generators' },
  { key: 'construction', label: 'Construction' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'lobbying_firm', label: 'Lobbying & law firms' },
  { key: 'government_body', label: 'Grid operators & regulators' },
  { key: 'other', label: 'Other' },
];

export default function OrganizationsPage() {
  const orgs = listOrganizations();
  const byType = new Map<OrganizationType, Organization[]>();
  for (const o of orgs) {
    if (!byType.has(o.type)) byType.set(o.type, []);
    byType.get(o.type)!.push(o);
  }
  for (const list of byType.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10 space-y-10">
      <header>
        <p className="font-display text-[11px] uppercase tracking-widest text-accent-cyan">
          Directory
        </p>
        <h1 className="font-display text-3xl font-bold mt-1 text-slate-100">
          Organizations
        </h1>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-2xl">
          {orgs.length} companies, investors, utilities, contractors, and lobbying firms
          tracked across the seed dataset. Click any entity to see ownership, capital flow,
          and the data centers it touches.
        </p>
      </header>

      {GROUP_ORDER.map(({ key, label }) => {
        const list = byType.get(key);
        if (!list || list.length === 0) return null;
        return (
          <section key={key}>
            <div className="flex items-baseline gap-3 mb-3">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: NODE_COLORS[key] ?? '#94A3B8' }}
                aria-hidden
              />
              <h2 className="font-display text-base font-semibold text-slate-100">
                {label}
              </h2>
              <span className="text-xs text-slate-500 font-mono">{list.length}</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {list.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/organizations/${o.slug}`}
                    className="block bg-bg-surface border border-border hover:border-accent-cyan/40 rounded-md px-3 py-2.5 transition-colors"
                  >
                    <p className="font-display text-sm text-slate-100">{o.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {o.headquarters ?? o.description?.split('.')[0] ?? '—'}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
