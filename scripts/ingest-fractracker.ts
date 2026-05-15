// CLI runner for the FracTracker ingest. Usage:
//   pnpm tsx -r dotenv/config scripts/ingest-fractracker.ts dotenv_config_path=.env.local
//   pnpm tsx -r dotenv/config scripts/ingest-fractracker.ts --dry-run

import 'dotenv/config';
import { ingestFracTracker } from '../lib/ingest/fractracker';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');

ingestFracTracker({ supabaseUrl: url, supabaseServiceKey: key, dryRun })
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
  })
  .catch((e) => {
    console.error('ingest failed:', e);
    process.exit(1);
  });
