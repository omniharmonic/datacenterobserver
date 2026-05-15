import { NextResponse } from 'next/server';
import { getGraphData } from '@/lib/data/source';

export async function GET() {
  return NextResponse.json(getGraphData());
}
