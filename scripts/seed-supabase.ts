// One-shot seed: copies data/seed/*.ts into the Supabase Postgres tables.
// Run with: pnpm tsx scripts/seed-supabase.ts
//
// Idempotent: uses upsert() so re-running won't duplicate rows.
// Uses the service-role key, so this must NEVER ship to the client bundle —
// it lives under scripts/ and is only invoked from the CLI.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { DATA_CENTERS } from '../data/seed/data-centers';
import { ORGANIZATIONS } from '../data/seed/organizations';
import { OFFICIALS } from '../data/seed/officials';
import { EVENTS } from '../data/seed/events';
import { ORG_RELATIONSHIPS } from '../data/seed/relationships';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function seed() {
  console.log('→ organizations:', ORGANIZATIONS.length);
  const orgRows = ORGANIZATIONS.map((o) => ({
    slug: o.slug,
    name: o.name,
    type: o.type,
    description: o.description ?? null,
    website: o.website ?? null,
    headquarters: o.headquarters ?? null,
    ticker: o.ticker ?? null,
    estimated_lobbying_usd: o.estimated_lobbying_usd ?? null,
  }));
  let r = await sb.from('organizations').upsert(orgRows, { onConflict: 'slug' });
  if (r.error) throw r.error;

  console.log('→ data_centers:', DATA_CENTERS.length);
  const dcRows = DATA_CENTERS.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    status: d.status,
    latitude: d.latitude,
    longitude: d.longitude,
    address: d.address ?? null,
    city: d.city ?? null,
    county: d.county ?? null,
    state: d.state,
    zip: d.zip ?? null,
    operator: d.operator ?? null,
    developer: d.developer ?? null,
    capacity_mw: d.capacity_mw ?? null,
    footprint_acres: d.footprint_acres ?? null,
    water_usage_gpd: d.water_usage_gpd ?? null,
    energy_source: d.energy_source ?? null,
    estimated_cost_usd: d.estimated_cost_usd ?? null,
    announced_date: d.announced_date ?? null,
    expected_completion: d.expected_completion ?? null,
    description: d.description ?? null,
    source_urls: d.source_urls ?? [],
    house_district: d.house_district ?? null,
    last_verified_at: d.last_verified_at ?? null,
  }));
  r = await sb.from('data_centers').upsert(dcRows, { onConflict: 'slug' });
  if (r.error) throw r.error;

  console.log('→ officials:', OFFICIALS.length);
  const offRows = OFFICIALS.map((o) => ({
    id: o.id,
    name: o.name,
    title: o.title,
    level: o.level,
    body: o.body ?? null,
    district: o.district ?? null,
    state: o.state ?? null,
    party: o.party ?? null,
    phone: o.phone ?? null,
    email: o.email ?? null,
    office_address: o.office_address ?? null,
    website: o.website ?? null,
    photo_url: o.photo_url ?? null,
    source: o.source ?? null,
    last_verified_at: o.last_verified_at ?? null,
  }));
  r = await sb.from('officials').upsert(offRows, { onConflict: 'id' });
  if (r.error) throw r.error;

  console.log('→ events:', EVENTS.length);
  const evRows = EVENTS.map((e) => ({
    slug: e.slug,
    title: e.title,
    type: e.type,
    status: e.status,
    date: e.date,
    end_date: e.end_date ?? null,
    location: e.location ?? null,
    state: e.state ?? null,
    jurisdiction: e.jurisdiction ?? null,
    description: e.description ?? null,
    issue_category: e.issue_category ?? null,
    url: e.url ?? null,
    source_url: e.source_url ?? null,
    data_center_slug: e.data_center_slug ?? null,
  }));
  r = await sb.from('events').upsert(evRows, { onConflict: 'slug' });
  if (r.error) throw r.error;

  // dc_organizations junction: flatten organization_slugs[] from each DC
  const dcOrgRows: { dc_slug: string; org_slug: string; relationship: string }[] = [];
  for (const d of DATA_CENTERS) {
    for (const link of d.organization_slugs ?? []) {
      dcOrgRows.push({ dc_slug: d.slug, org_slug: link.slug, relationship: link.relationship });
    }
  }
  console.log('→ dc_organizations:', dcOrgRows.length);
  // Clear-then-insert to avoid stale rows; cascade FK keeps it safe.
  await sb.from('dc_organizations').delete().neq('dc_slug', '__never__');
  r = await sb.from('dc_organizations').insert(dcOrgRows);
  if (r.error) throw r.error;

  console.log('→ org_relationships:', ORG_RELATIONSHIPS.length);
  const relRows = ORG_RELATIONSHIPS.map((e) => ({
    source_slug: e.source,
    target_slug: e.target,
    relationship: e.relationship,
    description: e.description ?? null,
    value_usd: e.value_usd ?? null,
    source_url: (e as { source_url?: string }).source_url ?? null,
  }));
  // Clear-then-insert (bigserial PK makes upsert inconvenient)
  await sb.from('org_relationships').delete().neq('id', -1);
  r = await sb.from('org_relationships').insert(relRows);
  if (r.error) throw r.error;

  console.log('✓ seed complete');
}

seed().catch((e) => {
  console.error('✗ seed failed:', e);
  process.exit(1);
});
