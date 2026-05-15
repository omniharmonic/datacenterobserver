'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(
  () => import('@/components/map/MapView').then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100dvh-3.5rem)] flex items-center justify-center text-slate-500 font-display text-sm">
        Loading map…
      </div>
    ),
  },
);

export function MapPage() {
  return <MapView />;
}
