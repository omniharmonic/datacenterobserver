'use client';

import {
  X,
  ExternalLink,
  Phone,
  Globe,
  MapPin,
  Zap,
  Droplets,
  Building2,
  CalendarDays,
  Users,
  Banknote,
  Ruler,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetch } from '@/lib/hooks/useFetch';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from '@/lib/constants';
import type { DcDetail } from '@/lib/data/source';

interface Props {
  slug: string;
  onClose: () => void;
}

function fmtMoney(n?: number) {
  if (!n) return null;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function partyColor(party?: string) {
  if (!party) return 'text-slate-400';
  const p = party.toLowerCase();
  if (p.startsWith('d')) return 'text-blue-400';
  if (p.startsWith('r')) return 'text-red-400';
  return 'text-slate-400';
}

export function DetailPanel({ slug, onClose }: Props) {
  const { data: dc, isLoading } = useFetch<DcDetail>(`/api/data-centers/${slug}`);

  return (
    <AnimatePresence>
      <motion.div
        key={slug}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="fixed top-14 right-0 bottom-0 w-full sm:w-[440px] bg-bg-surface border-l border-border overflow-y-auto z-40 panel-shadow"
      >
        <header className="sticky top-0 z-10 bg-bg-surface/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {dc && <StatusBadge status={dc.status} size="sm" />}
            <h2 className="font-display text-lg font-bold text-slate-100 mt-1.5 leading-tight">
              {dc?.name ?? 'Loading…'}
            </h2>
            {dc && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin size={11} />
                {dc.city ? `${dc.city}, ` : ''}
                {dc.county ? `${dc.county} County, ` : ''}
                {dc.state}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-slate-100"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </header>

        {isLoading || !dc ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-bg-elevated rounded animate-pulse" style={{ width: `${60 + Math.random() * 35}%` }} />
            ))}
          </div>
        ) : (
          <div className="p-5 space-y-7">
            {dc.description && (
              <p className="text-sm text-slate-300 leading-relaxed">{dc.description}</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              {dc.capacity_mw != null && (
                <Metric icon={Zap} label="Capacity" value={`${dc.capacity_mw.toLocaleString()} MW`} />
              )}
              {dc.footprint_acres != null && (
                <Metric icon={Ruler} label="Footprint" value={`${dc.footprint_acres.toLocaleString()} acres`} />
              )}
              {dc.water_usage_gpd != null && (
                <Metric
                  icon={Droplets}
                  label="Water"
                  value={`${(dc.water_usage_gpd / 1_000_000).toFixed(1)}M gal/day`}
                />
              )}
              {dc.energy_source && <Metric icon={Zap} label="Energy" value={dc.energy_source} />}
              {dc.estimated_cost_usd != null && (
                <Metric icon={Banknote} label="Estimated cost" value={fmtMoney(dc.estimated_cost_usd) ?? '—'} />
              )}
              {(dc.announced_date || dc.expected_completion) && (
                <Metric
                  icon={CalendarDays}
                  label="Timeline"
                  value={[fmtDate(dc.announced_date), fmtDate(dc.expected_completion)].filter(Boolean).join(' → ')}
                />
              )}
            </div>

            {dc.organizations.length > 0 && (
              <Section title="Companies involved" icon={Building2}>
                <ul className="space-y-1.5">
                  {dc.organizations.map(({ relationship, organization }) => (
                    <li
                      key={`${organization.slug}-${relationship}`}
                      className="flex items-center justify-between bg-bg-elevated rounded-md px-3 py-2"
                    >
                      <div>
                        <Link
                          href={`/organizations/${organization.slug}`}
                          className="text-sm text-slate-100 hover:text-accent-cyan"
                        >
                          {organization.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 capitalize">
                          {relationship.replace(/_/g, ' ')} · {organization.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                      {organization.website && (
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-accent-cyan"
                          aria-label={`${organization.name} website`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {dc.officials.length > 0 && (
              <Section title="Your elected officials" icon={Users}>
                <div className="space-y-2">
                  {dc.officials.map(({ official, level }) => (
                    <OfficialCard key={official.id} official={official} level={level} />
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-2 italic">
                  Federal + state officials by US state. Local officials shown where seeded; coverage expands as the dataset grows.
                </p>
              </Section>
            )}

            {dc.events.length > 0 && (
              <Section title="Upcoming events" icon={CalendarDays}>
                <ul className="space-y-2">
                  {dc.events.map((ev) => {
                    const href = ev.url ?? ev.source_url;
                    const body = (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-slate-100 leading-snug">{ev.title}</p>
                          <span className="text-[10px] text-accent-cyan font-display whitespace-nowrap">
                            {fmtDate(ev.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span>{EVENT_TYPE_LABELS[ev.type] ?? ev.type}</span>
                          <span>·</span>
                          <span>{EVENT_STATUS_LABELS[ev.status] ?? ev.status}</span>
                          {ev.location && (
                            <>
                              <span>·</span>
                              <span className="truncate">{ev.location}</span>
                            </>
                          )}
                        </div>
                      </>
                    );
                    return (
                      <li key={ev.slug}>
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-bg-elevated hover:bg-white/5 rounded-md px-3 py-2.5 transition-colors"
                          >
                            {body}
                          </a>
                        ) : (
                          <div className="block bg-bg-elevated rounded-md px-3 py-2.5">{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <Link
                  href="/events"
                  className="block text-[11px] text-accent-cyan hover:underline mt-2 font-display"
                >
                  View all events →
                </Link>
              </Section>
            )}

            {dc.source_urls && dc.source_urls.length > 0 && (
              <Section title="Sources">
                <ul className="space-y-1">
                  {dc.source_urls.map((url) => {
                    let host = url;
                    try {
                      host = new URL(url).hostname.replace(/^www\./, '');
                    } catch {
                      /* ignore */
                    }
                    return (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-accent-cyan hover:underline"
                        >
                          <ExternalLink size={11} />
                          {host}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </Section>
            )}

            <div className="pt-4 border-t border-border text-[10px] text-slate-600 leading-relaxed">
              Data is compiled from public reporting and the FracTracker, datacentertracker.org,
              and Epoch AI datasets. Every claim should be cross-checked with the linked sources.
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        {Icon && <Icon size={11} className="text-slate-600" />}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-bg-elevated rounded-md px-3 py-2">
      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] uppercase tracking-wider">
        <Icon size={10} />
        <span>{label}</span>
      </div>
      <span className="font-display text-sm font-semibold text-slate-100 leading-tight">{value}</span>
    </div>
  );
}

function OfficialCard({
  official,
  level,
}: {
  official: DcDetail['officials'][number]['official'];
  level: string;
}) {
  return (
    <div className="bg-bg-elevated rounded-md px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-slate-100">{official.name}</p>
          <p className="text-[11px] text-slate-500">
            {official.title}
            {official.party && (
              <>
                {' · '}
                <span className={partyColor(official.party)}>{official.party.charAt(0).toUpperCase()}</span>
              </>
            )}
          </p>
        </div>
        <span className="text-[9px] text-slate-600 uppercase tracking-widest font-display">
          {level}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-1.5">
        {official.phone && (
          <a
            href={`tel:${official.phone.replace(/[^0-9+]/g, '')}`}
            className="flex items-center gap-1 text-[11px] text-accent-cyan hover:underline"
          >
            <Phone size={10} /> {official.phone}
          </a>
        )}
        {official.website && (
          <a
            href={official.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-accent-cyan hover:underline"
          >
            <Globe size={10} /> Website
          </a>
        )}
      </div>
    </div>
  );
}
