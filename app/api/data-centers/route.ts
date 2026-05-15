import { NextRequest, NextResponse } from 'next/server';
import { listDataCenters } from '@/lib/data/source';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const status = sp.get('status')?.split(',').filter(Boolean);
  const states = sp.get('state')?.split(',').filter(Boolean);
  const search = sp.get('q') ?? undefined;
  const limit = sp.get('limit') ? Number(sp.get('limit')) : undefined;

  const data = listDataCenters({ status, states, search, limit });
  return NextResponse.json(data);
}
