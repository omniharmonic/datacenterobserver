// Server-side Supabase client. The anon key is enough for read-only access
// because every public table has a `public read` RLS policy.
//
// The URL + key are read from env vars set in Vercel (and .env.local for dev).
// We construct a singleton because the JS client is cheap but allocating one
// per request on Fluid Compute is wasteful.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env var',
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false },
    db: { schema: 'public' },
  });
  return cached;
}
