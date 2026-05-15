import { NextRequest, NextResponse } from 'next/server';
import { listDataCenters, listOrganizations, listOfficials, listEvents } from '@/lib/data/source';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.toLowerCase().trim();
  if (!q) return NextResponse.json({ data_centers: [], organizations: [], officials: [], events: [] });

  const dcs = listDataCenters({ search: q, limit: 12 });
  const orgs = listOrganizations()
    .filter((o) => o.name.toLowerCase().includes(q) || o.slug.includes(q))
    .slice(0, 8);
  const officials = listOfficials()
    .filter((o) => o.name.toLowerCase().includes(q))
    .slice(0, 8);
  const events = listEvents()
    .filter((e) => e.title.toLowerCase().includes(q))
    .slice(0, 8);

  return NextResponse.json({ data_centers: dcs, organizations: orgs, officials, events });
}
