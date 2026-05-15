// Vercel cron: daily FracTracker re-ingest. Configured in vercel.json.
// Protected via Authorization: Bearer ${CRON_SECRET} — Vercel automatically
// sets this header for cron-triggered requests.

import { NextRequest, NextResponse } from 'next/server';
import { ingestFracTracker } from '@/lib/ingest/fractracker';

export const maxDuration = 300; // seconds; Fluid Compute default is 300

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'missing supabase env vars' },
      { status: 500 },
    );
  }

  try {
    const report = await ingestFracTracker({
      supabaseUrl,
      supabaseServiceKey: serviceKey,
    });
    return NextResponse.json({ ok: true, report });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
