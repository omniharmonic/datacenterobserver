// Vercel cron: weekly Geocodio enrichment pass over DCs missing house_district.
import { NextRequest, NextResponse } from 'next/server';
import { enrichOfficials } from '@/lib/ingest/geocodio';

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.GEOCODIO_API_KEY;
  if (!supabaseUrl || !serviceKey || !apiKey) {
    return NextResponse.json(
      { error: 'missing supabase or geocodio env vars' },
      { status: 500 },
    );
  }

  try {
    const report = await enrichOfficials({
      supabaseUrl,
      supabaseServiceKey: serviceKey,
      apiKey,
      onlyMissing: true,
      // Cap per-run to ~500 requests to leave headroom on Geocodio free tier
      // and stay under the 300s cron limit.
      limit: 500,
    });
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
