import { NextRequest, NextResponse } from 'next/server';
import { listDataCenters, listOrganizations, listOfficials, listEvents } from '@/lib/data/source';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.toLowerCase().trim();
  if (!q) return NextResponse.json({ data_centers: [], organizations: [], officials: [], events: [] });

  const [dcs, allOrgs, allOfficials, allEvents] = await Promise.all([
    listDataCenters({ search: q, limit: 12 }),
    listOrganizations(),
    listOfficials(),
    listEvents(),
  ]);
  const orgs = allOrgs
    .filter((o) => o.name.toLowerCase().includes(q) || o.slug.includes(q))
    .slice(0, 8);
  const officials = allOfficials
    .filter((o) => o.name.toLowerCase().includes(q))
    .slice(0, 8);
  const events = allEvents
    .filter((e) => e.title.toLowerCase().includes(q))
    .slice(0, 8);

  return NextResponse.json({ data_centers: dcs, organizations: orgs, officials, events });
}
