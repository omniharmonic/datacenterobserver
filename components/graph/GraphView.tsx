'use client';

import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { Search, X, Layers3, Box, RotateCcw, ArrowRight } from 'lucide-react';
import { useFetch } from '@/lib/hooks/useFetch';
import { NODE_COLORS } from '@/lib/constants';
import type { GraphNode, GraphEdge } from '@/lib/types';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-slate-500 font-display text-sm">
      Loading force-directed graph…
    </div>
  ),
});

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

interface GraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface FGNode extends GraphNode {
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
}

interface FGLink {
  source: string | FGNode;
  target: string | FGNode;
  relationship: string;
  value?: number;
}

const CATEGORIES = [
  { key: 'organization', label: 'Organizations', color: NODE_COLORS.tech_company },
  { key: 'data_center', label: 'Data Centers', color: NODE_COLORS.data_center },
  { key: 'official', label: 'Officials', color: NODE_COLORS.official },
] as const;

export function GraphView() {
  const { data, isLoading } = useFetch<GraphPayload>('/api/graph');
  const fgRef = useRef<{
    cameraPosition?: (
      pos: { x?: number; y?: number; z?: number },
      lookAt?: { x: number; y: number; z: number },
      ms?: number,
    ) => void;
    zoomToFit?: (ms: number, padding: number) => void;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const [selected, setSelected] = useState<FGNode | null>(null);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState<Set<string>>(
    new Set(['organization', 'data_center', 'official']),
  );
  const [is2D, setIs2D] = useState(false);

  useEffect(() => {
    function resize() {
      if (containerRef.current) {
        setDims({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        });
      }
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const filtered = useMemo<GraphPayload>(() => {
    if (!data) return { nodes: [], edges: [] };

    // Filter by category visibility
    let nodes = data.nodes.filter((n) => visible.has(n.category));

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matches = new Set(
        nodes.filter((n) => n.name.toLowerCase().includes(q)).map((n) => n.id),
      );
      // Include 1-hop neighbors of matched nodes
      for (const e of data.edges) {
        if (matches.has(e.source)) matches.add(e.target);
        if (matches.has(e.target)) matches.add(e.source);
      }
      nodes = nodes.filter((n) => matches.has(n.id));
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = data.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
    );
    return { nodes, edges };
  }, [data, visible, search]);

  // react-force-graph expects { nodes, links }
  const graphData = useMemo(
    () => ({ nodes: filtered.nodes as FGNode[], links: filtered.edges as unknown as FGLink[] }),
    [filtered],
  );

  const handleNodeClick = useCallback((node: FGNode) => {
    setSelected(node);
    // Focus camera on node (3D only)
    if (!is2D && fgRef.current?.cameraPosition && node.x != null) {
      const distance = 120;
      const dist = Math.hypot(node.x, node.y ?? 0, node.z ?? 0) || 1;
      const ratio = 1 + distance / dist;
      fgRef.current.cameraPosition(
        { x: (node.x ?? 0) * ratio, y: (node.y ?? 0) * ratio, z: (node.z ?? 0) * ratio },
        { x: node.x ?? 0, y: node.y ?? 0, z: node.z ?? 0 },
        900,
      );
    }
  }, [is2D]);

  const resetView = useCallback(() => {
    setSearch('');
    setSelected(null);
    fgRef.current?.zoomToFit?.(800, 80);
  }, []);

  const toggleCategory = (k: string) => {
    const next = new Set(visible);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setVisible(next);
  };

  const nodeColor = useCallback((n: FGNode) => {
    return NODE_COLORS[n.node_type] ?? NODE_COLORS[n.category] ?? '#64748B';
  }, []);

  const nodeVal = useCallback((n: FGNode) => {
    if (n.category === 'data_center') {
      return Math.max(2, ((n.metric ?? 100) / 200));
    }
    if (n.category === 'organization' && n.metric) {
      return Math.max(2.5, Math.log10(n.metric) * 1.2);
    }
    return 2.5;
  }, []);

  // Color links by what they represent so capital flow stands out from
  // power supply, contracts, etc. Values tuned for the dark background.
  const linkColor = useCallback((l: FGLink) => {
    switch (l.relationship) {
      case 'owns':
      case 'acquired':
      case 'subsidiary_of':
      case 'invests_in':
        return 'rgba(245, 158, 11, 0.75)'; // amber — capital / control
      case 'joint_venture':
        return 'rgba(168, 85, 247, 0.75)'; // purple — JVs
      case 'supplies':
      case 'supplies_energy':
        return 'rgba(16, 185, 129, 0.65)'; // green — power / GPU supply
      case 'contracted_by':
      case 'constructs':
        return 'rgba(239, 68, 68, 0.6)';   // red — construction / EPC
      case 'lobbies_for':
        return 'rgba(236, 72, 153, 0.7)';  // pink — lobbying
      case 'represents':
        return 'rgba(148, 163, 184, 0.4)'; // muted — official ↔ DC links
      case 'operates':
      case 'develops':
      case 'funds':
        return 'rgba(34, 211, 238, 0.7)';  // cyan — operator / developer
      default:
        return 'rgba(148, 163, 184, 0.55)';
    }
  }, []);

  const linkWidth = useCallback((l: FGLink) => {
    if (l.value && l.value > 0) {
      // log scale: $100M → 1px, $1B → 1.5px, $10B → 2px, $100B → 2.5px
      return Math.min(3, Math.max(0.8, (Math.log10(l.value) - 7) * 0.5));
    }
    // Officials → DC are the most common but least informative; downweight.
    if (l.relationship === 'represents') return 0.4;
    return 1.0;
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[calc(100dvh-3.5rem)] relative bg-[#050913]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-display text-sm">
          Loading graph…
        </div>
      )}

      {!isLoading && graphData.nodes.length > 0 && (() => {
        // The force-graph type defs are too strict for our extra fields; pass through.
        const FG2 = ForceGraph2D as unknown as React.ComponentType<Record<string, unknown>>;
        const FG3 = ForceGraph3D as unknown as React.ComponentType<Record<string, unknown>>;
        const commonProps = {
          graphData,
          width: dims.w,
          height: dims.h,
          nodeColor,
          nodeVal,
          nodeLabel: (n: FGNode) => n.name,
          linkColor,
          linkWidth,
          linkDirectionalArrowLength: 3,
          linkDirectionalArrowRelPos: 1,
          onNodeClick: handleNodeClick,
          backgroundColor: '#050913',
        };
        return is2D ? (
          <FG2
            {...commonProps}
            cooldownTicks={120}
            warmupTicks={50}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.32}
          />
        ) : (
          <FG3
            {...commonProps}
            ref={(r: unknown) => {
              fgRef.current = r as typeof fgRef.current;
            }}
            nodeOpacity={0.95}
            nodeResolution={16}
            linkOpacity={1}
            showNavInfo={false}
            enableNodeDrag={true}
            cooldownTime={4500}
            d3AlphaDecay={0.015}
            d3VelocityDecay={0.28}
          />
        );
      })()}

      {/* ─── Controls overlay ─── */}
      <div className="absolute top-4 left-4 space-y-2 z-30 max-w-[280px]">
        <div className="flex items-center gap-2 bg-bg-surface/90 backdrop-blur-md rounded-lg px-3 py-2 border border-border">
          <Search size={14} className="text-slate-500" />
          <input
            type="search"
            placeholder="Search entities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={14} className="text-slate-500 hover:text-slate-200" />
            </button>
          )}
        </div>

        <div className="bg-bg-surface/90 backdrop-blur-md rounded-lg p-2 border border-border space-y-1">
          {CATEGORIES.map(({ key, label, color }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-xs px-1 py-0.5 hover:bg-white/5 rounded">
              <input
                type="checkbox"
                checked={visible.has(key)}
                onChange={() => toggleCategory(key)}
                className="accent-accent-cyan"
              />
              <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
              <span className="text-slate-200">{label}</span>
            </label>
          ))}
        </div>

        <div className="bg-bg-surface/90 backdrop-blur-md rounded-lg p-1 border border-border flex items-stretch text-xs">
          <button
            onClick={() => setIs2D(false)}
            className={[
              'flex-1 px-2 py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors',
              !is2D ? 'bg-accent-cyan/15 text-accent-cyan' : 'text-slate-400 hover:text-slate-200',
            ].join(' ')}
          >
            <Box size={12} /> 3D
          </button>
          <button
            onClick={() => setIs2D(true)}
            className={[
              'flex-1 px-2 py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors',
              is2D ? 'bg-accent-cyan/15 text-accent-cyan' : 'text-slate-400 hover:text-slate-200',
            ].join(' ')}
          >
            <Layers3 size={12} /> 2D
          </button>
          <button
            onClick={resetView}
            className="px-2 py-1.5 rounded text-slate-400 hover:text-slate-200"
            title="Reset"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        <p className="text-[10px] text-slate-600 leading-relaxed px-1">
          Drag nodes to rearrange. Click any node to inspect.
        </p>
      </div>

      {/* ─── Selected node panel ─── */}
      {selected && <NodePanel node={selected} edges={data?.edges ?? []} allNodes={data?.nodes ?? []} onClose={() => setSelected(null)} />}

      {/* ─── Counter ─── */}
      <div className="absolute bottom-4 right-4 z-30 bg-bg-surface/90 backdrop-blur-md rounded-lg border border-border px-3 py-2 text-[11px] font-display text-slate-400">
        <span className="text-accent-cyan font-semibold">{graphData.nodes.length}</span>
        {' nodes · '}
        <span className="text-accent-cyan font-semibold">{graphData.links.length}</span>
        {' edges'}
      </div>
    </div>
  );
}

function NodePanel({
  node,
  edges,
  allNodes,
  onClose,
}: {
  node: FGNode;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
}) {
  const nodeById = useMemo(() => new Map(allNodes.map((n) => [n.id, n])), [allNodes]);

  // react-force-graph mutates links in place, replacing string IDs with node-object
  // refs. So `e.source` may be either a string or `{ id, ... }` by the time we read it.
  const edgeEndpointId = (e: GraphEdge, side: 'source' | 'target'): string => {
    const v = e[side] as unknown;
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object' && 'id' in v) return String((v as { id: unknown }).id);
    return '';
  };

  const connections = edges.filter((e) => {
    const s = edgeEndpointId(e, 'source');
    const t = edgeEndpointId(e, 'target');
    return s === node.id || t === node.id;
  });

  return (
    <div className="absolute top-4 right-4 w-80 max-h-[80%] overflow-y-auto bg-bg-surface/95 backdrop-blur-md rounded-lg border border-border z-30 panel-shadow">
      <div className="sticky top-0 bg-bg-surface/95 backdrop-blur-sm border-b border-border p-3 flex items-start justify-between">
        <div>
          <h3 className="font-display font-bold text-slate-100 leading-tight">{node.name}</h3>
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">
            {node.category.replace(/_/g, ' ')} · {node.node_type.replace(/_/g, ' ')}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-100">
          <X size={16} />
        </button>
      </div>

      <div className="p-3 space-y-3 text-sm">
        {node.category === 'organization' && (
          <Link
            href={`/organizations/${node.id.replace(/^org:/, '')}`}
            className="inline-flex items-center gap-1 text-[11px] font-display uppercase tracking-widest text-accent-cyan hover:underline"
          >
            View full profile <ArrowRight size={11} />
          </Link>
        )}
        {node.metric != null && (
          <div className="bg-bg-elevated rounded px-2 py-1.5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              {node.category === 'data_center' ? 'Capacity' : 'Lobbying spend'}
            </p>
            <p className="font-display text-accent-cyan">
              {node.category === 'data_center'
                ? `${node.metric.toLocaleString()} MW`
                : `$${(node.metric / 1_000_000).toFixed(1)}M / yr`}
            </p>
          </div>
        )}
        {node.state && <p className="text-xs text-slate-400">State: {node.state}</p>}

        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
            Connections ({connections.length})
          </p>
          <ul className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {connections.map((e, i) => {
              const sId = edgeEndpointId(e, 'source');
              const tId = edgeEndpointId(e, 'target');
              const otherId = sId === node.id ? tId : sId;
              const other = nodeById.get(otherId);
              if (!other) return null;
              const orgSlug = other.category === 'organization' ? other.id.replace(/^org:/, '') : null;
              const body = (
                <>
                  <div className="min-w-0">
                    <p className="text-slate-100 leading-tight truncate">{other.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {e.relationship.replace(/_/g, ' ')}
                      {e.value ? ` · $${formatLinkValue(e.value)}` : ''}
                    </p>
                  </div>
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ background: NODE_COLORS[other.node_type] ?? NODE_COLORS[other.category] ?? '#64748B' }}
                  />
                </>
              );
              return (
                <li key={`${sId}-${tId}-${e.relationship}-${i}`}>
                  {orgSlug ? (
                    <Link
                      href={`/organizations/${orgSlug}`}
                      className="flex items-center justify-between gap-2 bg-bg-elevated hover:bg-white/5 rounded px-2 py-1.5 text-xs"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between gap-2 bg-bg-elevated rounded px-2 py-1.5 text-xs">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function formatLinkValue(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  return `${(v / 1_000).toFixed(0)}K`;
}
