import { NextRequest, NextResponse } from 'next/server';
import { listOfficials } from '@/lib/data/source';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return NextResponse.json(
    await listOfficials({
      state: sp.get('state') ?? undefined,
      level: sp.get('level') ?? undefined,
    }),
  );
}
