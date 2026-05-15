'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, MapPin, ExternalLink, Search } from 'lucide-react';
import { EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from '@/lib/constants';
import type { Event } from '@/lib/types';

interface Props {
  initial: Event[];
}

const TYPES = Object.keys(EVENT_TYPE_LABELS);

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function timeUntil(d: string): string | null {
  const ms = new Date(d).getTime() - Date.now();
  const days = Math.round(ms / 86_400_000);
  if (days < 0) return null;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 31) return `In ${days} days`;
  if (days < 365) return `In ${Math.round(days / 30)} mo`;
  return null;
}

export function EventsClient({ initial }: Props) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [onlyUpcoming, setOnlyUpcoming] = useState(true);

  const filtered = useMemo(() => {
    let rows = initial.slice();
    if (onlyUpcoming) {
      const now = Date.now();
      rows = rows.filter((e) => new Date(e.date).getTime() >= now - 86_400_000);
    }
    if (type) rows = rows.filter((e) => e.type === type);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.location ?? '').toLowerCase().includes(q) ||
          (e.jurisdiction ?? '').toLowerCase().includes(q),
      );
    }
    return rows.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [initial, onlyUpcoming, type, search]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center gap-2 bg-bg-surface rounded-lg px-3 py-2 border border-border flex-1 min-w-[220px]">
          <Search size={14} className="text-slate-500" />
          <input
            type="search"
            placeholder="Search title, location, jurisdiction…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none w-full"
          />
        </div>
        <select
          value={type ?? ''}
          onChange={(e) => setType(e.target.value || null)}
          className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-accent-cyan"
        >
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {EVENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-300 px-3 py-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyUpcoming}
            onChange={(e) => setOnlyUpcoming(e.target.checked)}
            className="accent-accent-cyan"
          />
          Upcoming only
        </label>
      </div>

      <div className="text-[11px] uppercase tracking-widest text-slate-500 font-display mb-3">
        {filtered.length} event{filtered.length === 1 ? '' : 's'}
      </div>

      <ul className="space-y-2">
        {filtered.map((ev) => (
          <li
            key={ev.slug}
            className="bg-bg-surface border border-border hover:border-slate-700 rounded-lg p-4 transition-colors"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="font-display text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(34, 211, 238, 0.12)',
                      color: '#22D3EE',
                    }}
                  >
                    {EVENT_TYPE_LABELS[ev.type] ?? ev.type}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-display">
                    {EVENT_STATUS_LABELS[ev.status] ?? ev.status}
                  </span>
                  {ev.issue_category && (
                    <span className="text-[10px] text-slate-500">· {ev.issue_category}</span>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-100 leading-tight">
                  {ev.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} />
                    {fmtDate(ev.date)}
                    {ev.end_date && ev.end_date !== ev.date && (
                      <> – {fmtDate(ev.end_date)}</>
                    )}
                  </span>
                  {ev.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {ev.location}
                    </span>
                  )}
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-accent-cyan hover:underline"
                    >
                      <ExternalLink size={12} />
                      Details
                    </a>
                  )}
                </div>
                {ev.description && (
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{ev.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-xs text-accent-cyan">{timeUntil(ev.date)}</p>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">{ev.state}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No events match your filters.
        </div>
      )}
    </>
  );
}
