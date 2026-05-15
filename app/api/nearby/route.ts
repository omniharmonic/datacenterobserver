import { NextRequest, NextResponse } from 'next/server';
import { listNearby } from '@/lib/data/source';

// GET /api/nearby?lat=39.5&lng=-119.8&radius=50&limit=20
// Returns data centers within `radius` km of the point, nearest first.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lat = Number(sp.get('lat'));
  const lng = Number(sp.get('lng'));
  const radius = Number(sp.get('radius') ?? '50');
  const limit = sp.get('limit') ? Number(sp.get('limit')) : 100;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: 'lat and lng query params are required and must be finite numbers' },
      { status: 400 },
    );
  }
  if (radius <= 0 || radius > 5000) {
    return NextResponse.json(
      { error: 'radius must be > 0 and <= 5000 km' },
      { status: 400 },
    );
  }

  const rows = await listNearby(lat, lng, radius, limit);
  return NextResponse.json(rows);
}
