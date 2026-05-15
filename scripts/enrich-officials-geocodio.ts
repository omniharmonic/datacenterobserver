// CLI runner for the Geocodio official-district enrichment.
//   pnpm tsx -r dotenv/config scripts/enrich-officials-geocodio.ts dotenv_config_path=.env.local
//   pnpm tsx -r dotenv/config scripts/enrich-officials-geocodio.ts --all dotenv_config_path=.env.local

import 'dotenv/config';
import { enrichOfficials } from '../lib/ingest/geocodio';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = process.env.GEOCODIO_API_KEY;
if (!url || !key || !apiKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or GEOCODIO_API_KEY');
  process.exit(1);
}

const all = process.argv.includes('--all');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : undefined;

enrichOfficials({
  supabaseUrl: url,
  supabaseServiceKey: key,
  apiKey,
  onlyMissing: !all,
  limit,
})
  .then((r) => console.log(JSON.stringify(r, null, 2)))
  .catch((e) => {
    console.error('enrich failed:', e);
    process.exit(1);
  });
