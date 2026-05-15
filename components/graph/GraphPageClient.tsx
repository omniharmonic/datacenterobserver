'use client';

import dynamic from 'next/dynamic';

const GraphView = dynamic(() => import('./GraphView').then((m) => m.GraphView), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100dvh-3.5rem)] flex items-center justify-center text-slate-500 font-display text-sm">
      Loading force-directed graph…
    </div>
  ),
});

export function GraphPageClient() {
  return <GraphView />;
}
