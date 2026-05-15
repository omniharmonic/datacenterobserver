import { NextRequest, NextResponse } from 'next/server';
import { listDataCenters } from '@/lib/data/source';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const status = sp.get('status')?.split(',').filter(Boolean);
  const states = sp.get('state')?.split(',').filter(Boolean);
  const search = sp.get('q') ?? undefined;
  const limit = sp.get('limit') ? Number(sp.get('limit')) : undefined;
  // ?sources=editorial,fractracker — defaults to editorial-only.
  const sources = sp.get('sources')?.split(',').filter(Boolean);

  const data = await listDataCenters({ status, states, search, limit, sources });
  return NextResponse.json(data);
}
