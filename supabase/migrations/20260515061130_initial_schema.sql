-- datacenter.observer initial schema (v0.2 — Supabase migration of seed data)
-- Mirrors lib/types.ts. All public-read; service-role writes only.

-- ─── Enums ──────────────────────────────────────────────────────────
create type dc_status as enum (
  'proposed', 'announced', 'permitting', 'approved',
  'under_construction', 'operational', 'paused', 'cancelled'
);

create type org_type as enum (
  'tech_company', 'cloud_provider', 'developer', 'investor', 'pe_firm',
  'sovereign_wealth', 'construction', 'engineering', 'energy_utility',
  'lobbying_firm', 'consortium', 'government_body', 'other'
);

create type official_level as enum ('federal', 'state', 'local');

create type event_type as enum (
  'public_comment', 'hearing', 'protest', 'town_hall', 'press_conference',
  'community_meeting', 'moratorium', 'zoning_vote', 'legislation',
  'lawsuit', 'project_withdrawal', 'other'
);

create type event_status as enum (
  'upcoming', 'completed', 'resolved_favorable', 'resolved_unfavorable',
  'resolved_mixed', 'pending'
);

-- ─── Tables ─────────────────────────────────────────────────────────

create table organizations (
  slug text primary key,
  name text not null,
  type org_type not null,
  description text,
  website text,
  headquarters text,
  ticker text,
  estimated_lobbying_usd bigint,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index organizations_type_idx on organizations(type);

create table data_centers (
  id text primary key,
  slug text unique not null,
  name text not null,
  status dc_status not null,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  city text,
  county text,
  state text not null,
  zip text,
  operator text,
  developer text,
  capacity_mw integer,
  footprint_acres integer,
  water_usage_gpd bigint,
  energy_source text,
  estimated_cost_usd bigint,
  announced_date text,
  expected_completion text,
  description text,
  source_urls jsonb default '[]'::jsonb,
  house_district text,
  last_verified_at date,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index data_centers_state_idx on data_centers(state);
create index data_centers_status_idx on data_centers(status);
create index data_centers_lat_lng_idx on data_centers(latitude, longitude);

create table officials (
  id text primary key,
  name text not null,
  title text not null,
  level official_level not null,
  body text,
  district text,
  state text,
  party text,
  phone text,
  email text,
  office_address text,
  website text,
  photo_url text,
  source text,
  last_verified_at date,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index officials_state_idx on officials(state);
create index officials_level_idx on officials(level);
create index officials_district_idx on officials(district);

create table events (
  slug text primary key,
  title text not null,
  type event_type not null,
  status event_status not null,
  date text not null,
  end_date text,
  location text,
  state text,
  jurisdiction text,
  description text,
  issue_category text,
  url text,
  source_url text,
  data_center_slug text references data_centers(slug) on delete set null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_state_idx on events(state);
create index events_status_idx on events(status);
create index events_dc_slug_idx on events(data_center_slug);
create index events_date_idx on events(date);

-- Junction: DC ↔ organization with relationship semantics
create table dc_organizations (
  dc_slug text not null references data_centers(slug) on delete cascade,
  org_slug text not null references organizations(slug) on delete cascade,
  relationship text not null,
  primary key (dc_slug, org_slug, relationship)
);
create index dc_organizations_org_idx on dc_organizations(org_slug);

-- Organization → organization relationships
create table org_relationships (
  id bigserial primary key,
  source_slug text not null references organizations(slug) on delete cascade,
  target_slug text not null references organizations(slug) on delete cascade,
  relationship text not null,
  description text,
  value_usd bigint,
  source_url text,
  inserted_at timestamptz not null default now()
);
create index org_relationships_source_idx on org_relationships(source_slug);
create index org_relationships_target_idx on org_relationships(target_slug);

-- ─── RLS: public-read, service-role-write ───────────────────────────
alter table organizations enable row level security;
alter table data_centers enable row level security;
alter table officials enable row level security;
alter table events enable row level security;
alter table dc_organizations enable row level security;
alter table org_relationships enable row level security;

create policy "public read organizations" on organizations for select using (true);
create policy "public read data_centers" on data_centers for select using (true);
create policy "public read officials" on officials for select using (true);
create policy "public read events" on events for select using (true);
create policy "public read dc_organizations" on dc_organizations for select using (true);
create policy "public read org_relationships" on org_relationships for select using (true);

-- ─── updated_at trigger ─────────────────────────────────────────────
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger set_updated_at_organizations before update on organizations
  for each row execute function set_updated_at();
create trigger set_updated_at_data_centers before update on data_centers
  for each row execute function set_updated_at();
create trigger set_updated_at_officials before update on officials
  for each row execute function set_updated_at();
create trigger set_updated_at_events before update on events
  for each row execute function set_updated_at();
