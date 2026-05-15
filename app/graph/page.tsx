import dynamic from 'next/dynamic';

const GraphPage = dynamic(() => import('@/components/graph/GraphPageClient').then((m) => m.GraphPageClient));

export const metadata = {
  title: 'Graph — datacenter.observer',
  description: 'Force-directed graph of companies, investors, officials, and data center projects.',
};

export default function Page() {
  return <GraphPage />;
}
