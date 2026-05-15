import { NextRequest, NextResponse } from 'next/server';
import { listEvents } from '@/lib/data/source';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const events = await listEvents({
    state: sp.get('state') ?? undefined,
    type: sp.get('type') ?? undefined,
    status: sp.get('status') ?? undefined,
    upcoming: sp.get('upcoming') === 'true' ? true : undefined,
    data_center: sp.get('data_center') ?? undefined,
  });
  return NextResponse.json(events);
}
