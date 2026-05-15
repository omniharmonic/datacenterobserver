'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Map, Marker, NavigationControl, GeolocateControl, type MapRef } from 'react-map-gl/maplibre';
import Supercluster from 'supercluster';
import 'maplibre-gl/dist/maplibre-gl.css';
import { STATUS_COLORS, MAPLIBRE_DEMO_STYLE } from '@/lib/constants';
import { useFetch } from '@/lib/hooks/useFetch';
import type { DcMarker } from '@/lib/data/source';
import { DetailPanel } from './DetailPanel';
import { MapFilters, type Filters } from './MapFilters';
import { StatsBar } from './StatsBar';

interface ClusterPoint {
  type: 'Feature';
  properties: {
    cluster: false;
    slug: string;
    name: string;
    status: string;
    operator?: string;
    capacity_mw?: number;
    state: string;
  };
  geometry: { type: 'Point'; coordinates: [number, number] };
}

type ClusterFeature = ClusterPoint | {
  type: 'Feature';
  id: number;
  properties: { cluster: true; cluster_id: number; point_count: number; point_count_abbreviated: number };
  geometry: { type: 'Point'; coordinates: [number, number] };
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const MAP_STYLE = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${MAPBOX_TOKEN}`
  : MAPLIBRE_DEMO_STYLE;

export function MapView() {
  const mapRef = useRef<MapRef | null>(null);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const [zoom, setZoom] = useState(4);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ status: [], states: [], search: '' });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dcParam = searchParams.get('dc');

  // Server defaults to editorial + fractracker-verified (the research-validated
  // pile). The unverified FracTracker rows have been deleted from the table.
  const { data: markers, isLoading } = useFetch<DcMarker[]>('/api/data-centers');

  // Deep-link: ?dc=<slug> on first arrival → open the DC's panel and fly to it
  // once both the map and the markers are loaded.
  const handledDeepLinkRef = useRef<string | null>(null);
  useEffect(() => {
    if (!dcParam) return;
    if (handledDeepLinkRef.current === dcParam) return;
    if (!markers) return;
    const dc = markers.find((m) => m.slug === dcParam);
    if (!dc) return;

    handledDeepLinkRef.current = dcParam;
    setSelectedSlug(dc.slug);
    // Defer flyTo so the map is mounted
    const tryFly = () => {
      const m = mapRef.current?.getMap();
      if (m) {
        m.flyTo({ center: [dc.longitude, dc.latitude], zoom: 10, duration: 1200 });
      } else {
        setTimeout(tryFly, 100);
      }
    };
    tryFly();
  }, [dcParam, markers]);

  // Strip ?dc= from the URL when the panel is closed so refreshing doesn't re-open it.
  const closePanel = useCallback(() => {
    setSelectedSlug(null);
    if (searchParams.has('dc')) {
      const next = new URLSearchParams(searchParams.toString());
      next.delete('dc');
      router.replace(`${pathname}${next.toString() ? `?${next.toString()}` : ''}`, { scroll: false });
    }
  }, [router, pathname, searchParams]);

  const filtered: DcMarker[] = useMemo(() => {
    if (!markers) return [];
    return markers.filter((m) => {
      if (filters.status.length && !filters.status.includes(m.status)) return false;
      if (filters.states.length && !filters.states.includes(m.state)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !(m.operator ?? '').toLowerCase().includes(q) &&
          !(m.city ?? '').toLowerCase().includes(q) &&
          !m.state.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [markers, filters]);

  const supercluster = useMemo(() => {
    const sc = new Supercluster<ClusterPoint['properties']>({
      radius: 64,
      maxZoom: 12,
      minPoints: 2,
    });
    sc.load(
      filtered.map(
        (m): ClusterPoint => ({
          type: 'Feature',
          properties: {
            cluster: false,
            slug: m.slug,
            name: m.name,
            status: m.status,
            operator: m.operator,
            capacity_mw: m.capacity_mw,
            state: m.state,
          },
          geometry: { type: 'Point', coordinates: [m.longitude, m.latitude] },
        }),
      ),
    );
    return sc;
  }, [filtered]);

  const clusters: ClusterFeature[] = useMemo(() => {
    if (!bounds) return [];
    return supercluster.getClusters(bounds, Math.floor(zoom)) as ClusterFeature[];
  }, [supercluster, bounds, zoom]);

  const onMoveOrLoad = useCallback(() => {
    const m = mapRef.current?.getMap();
    if (!m) return;
    const b = m.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    setZoom(m.getZoom());
  }, []);

  // Initial bounds once map is ready
  useEffect(() => {
    if (mapRef.current) onMoveOrLoad();
  }, [onMoveOrLoad]);

  return (
    <div className="w-full h-[calc(100dvh-3.5rem)] relative">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -96.5, latitude: 38.5, zoom: 4 }}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        maxZoom={16}
        minZoom={3}
        onLoad={onMoveOrLoad}
        onMoveEnd={onMoveOrLoad}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl position="bottom-right" trackUserLocation />

        {clusters.map((c) => {
          const [lng, lat] = c.geometry.coordinates;
          if (c.properties.cluster) {
            const count = c.properties.point_count;
            const clusterId = (c as { id: number }).id;
            const size = 32 + Math.min(28, Math.log2(count + 1) * 8);
            return (
              <Marker
                key={`cluster-${clusterId}`}
                longitude={lng}
                latitude={lat}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  const target = Math.min(supercluster.getClusterExpansionZoom(clusterId), 14);
                  mapRef.current?.flyTo({ center: [lng, lat], zoom: target, duration: 600 });
                }}
              >
                <div
                  className="cluster-marker"
                  style={{ width: size, height: size, fontSize: count > 99 ? 11 : 12 }}
                >
                  {count}
                </div>
              </Marker>
            );
          }

          const props = c.properties;
          const color = STATUS_COLORS[props.status] ?? '#64748B';
          const isSelected = props.slug === selectedSlug;
          const isUrgent = props.status === 'permitting' || props.status === 'under_construction';
          return (
            <Marker
              key={props.slug}
              longitude={lng}
              latitude={lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedSlug(props.slug);
              }}
            >
              <div
                className={[
                  'dc-marker',
                  isUrgent ? '' : 'is-static',
                  isSelected ? 'is-selected' : '',
                ].join(' ')}
                style={{ background: color, color }}
                title={`${props.name} — ${props.status.replace(/_/g, ' ')}`}
              />
            </Marker>
          );
        })}
      </Map>

      <MapFilters
        filters={filters}
        setFilters={setFilters}
        total={markers?.length ?? 0}
        visible={filtered.length}
      />
      <StatsBar />

      {isLoading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md bg-bg-surface/80 backdrop-blur border border-border text-xs text-slate-400 font-display">
          Loading data centers…
        </div>
      )}

      {selectedSlug && (
        <DetailPanel slug={selectedSlug} onClose={closePanel} />
      )}
    </div>
  );
}
