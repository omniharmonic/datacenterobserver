import { NextResponse } from 'next/server';
import { getStats } from '@/lib/data/source';

export async function GET() {
  return NextResponse.json(await getStats());
}
