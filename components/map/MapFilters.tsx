'use client';

import { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS, STATUS_LIST } from '@/lib/constants';

export interface Filters {
  status: string[];
  states: string[];
  search: string;
}

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  total: number;
  visible: number;
}

export function MapFilters({ filters, setFilters, total, visible }: Props) {
  const [showStatus, setShowStatus] = useState(false);

  const toggleStatus = (s: string) => {
    setFilters({
      ...filters,
      status: filters.status.includes(s)
        ? filters.status.filter((x) => x !== s)
        : [...filters.status, s],
    });
  };

  const clear = () =>
    setFilters({ status: [], states: [], search: '' });

  const isFiltered = filters.status.length > 0 || filters.states.length > 0 || filters.search !== '';

  return (
    <div className="absolute top-4 left-4 right-4 sm:right-auto z-30 flex flex-wrap items-start gap-2 max-w-[680px]">
      {/* Search */}
      <div className="flex items-center gap-2 bg-bg-surface/90 backdrop-blur-md rounded-lg px-3 py-2 border border-border min-w-[220px] flex-1 sm:flex-initial">
        <Search size={14} className="text-slate-500" />
        <input
          type="search"
          placeholder="Search projects, operators, cities…"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none w-full"
        />
        {filters.search && (
          <button onClick={() => setFilters({ ...filters, search: '' })} aria-label="Clear search">
            <X size={14} className="text-slate-500 hover:text-slate-200" />
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="relative">
        <button
          onClick={() => setShowStatus((v) => !v)}
          className={[
            'flex items-center gap-1.5 bg-bg-surface/90 backdrop-blur-md rounded-lg px-3 py-2 border text-sm transition-colors',
            filters.status.length
              ? 'border-accent-cyan/60 text-accent-cyan'
              : 'border-border text-slate-300 hover:text-slate-100',
          ].join(' ')}
        >
          <Filter size={14} />
          Status
          {filters.status.length > 0 && (
            <span className="font-display text-[10px] bg-accent-cyan/20 text-accent-cyan rounded-full px-1.5">
              {filters.status.length}
            </span>
          )}
        </button>
        {showStatus && (
          <div className="absolute top-full mt-1 left-0 w-56 bg-bg-surface/95 backdrop-blur-md rounded-lg border border-border p-2 shadow-lg z-40">
            {STATUS_LIST.map((s) => {
              const checked = filters.status.includes(s);
              const color = STATUS_COLORS[s];
              return (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 text-left text-sm"
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={checked}
                    className="accent-accent-cyan pointer-events-none"
                  />
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span className="text-slate-200">{STATUS_LABELS[s]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Count + Clear */}
      <div className="flex items-center gap-2 bg-bg-surface/90 backdrop-blur-md rounded-lg px-3 py-2 border border-border text-xs font-display text-slate-400">
        <span>
          <span className="text-accent-cyan font-semibold">{visible}</span>
          {' / '}
          {total} sites
        </span>
        {isFiltered && (
          <button onClick={clear} className="text-slate-500 hover:text-slate-200" title="Clear filters">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
