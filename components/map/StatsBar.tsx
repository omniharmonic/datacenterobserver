'use client';

import { useFetch } from '@/lib/hooks/useFetch';

interface Stats {
  totalDcs: number;
  totalMw: number;
  totalCapex: number;
  totalOfficials: number;
  upcomingEvents: number;
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n}`;
}

export function StatsBar() {
  const { data } = useFetch<Stats>('/api/stats');
  if (!data) return null;

  const items = [
    { label: 'Projects', value: data.totalDcs.toString() },
    { label: 'Gigawatts', value: (data.totalMw / 1000).toFixed(1) },
    { label: 'Capex', value: fmt(data.totalCapex) },
    { label: 'Officials', value: data.totalOfficials.toString() },
    { label: 'Upcoming events', value: data.upcomingEvents.toString() },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-30 hidden md:flex items-stretch gap-px rounded-lg overflow-hidden border border-border bg-bg-surface/90 backdrop-blur-md font-display">
      {items.map((it) => (
        <div key={it.label} className="px-3 py-2 flex flex-col items-start min-w-[80px]">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">{it.label}</span>
          <span className="text-sm text-accent-cyan font-semibold">{it.value}</span>
        </div>
      ))}
    </div>
  );
}
