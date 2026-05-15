import { NextResponse } from 'next/server';
import { getDataCenter } from '@/lib/data/source';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const dc = await getDataCenter(slug);
  if (!dc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(dc);
}
