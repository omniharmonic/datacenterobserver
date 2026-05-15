-- Enable PostGIS, add geography column with auto-maintained value,
-- backfill from lat/lng, build a GIST index, and expose a SQL helper
-- `data_centers_within(p_lat, p_lng, p_radius_km)` for nearby queries.

create extension if not exists postgis schema extensions;

-- Geography column — geography(Point,4326) keeps WGS84 spherical math.
alter table data_centers
  add column if not exists geom extensions.geography(Point, 4326);

-- Backfill from existing lat/lng. ST_MakePoint takes (lng, lat).
update data_centers
set geom = extensions.ST_SetSRID(extensions.ST_MakePoint(longitude, latitude), 4326)::extensions.geography
where geom is null;

-- Keep geom in sync on insert/update via trigger so seed/ingest scripts
-- don't need to manage it.
create or replace function set_dc_geom() returns trigger
language plpgsql as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.geom := extensions.ST_SetSRID(extensions.ST_MakePoint(new.longitude, new.latitude), 4326)::extensions.geography;
  end if;
  return new;
end; $$;

drop trigger if exists trg_set_dc_geom on data_centers;
create trigger trg_set_dc_geom
  before insert or update of latitude, longitude on data_centers
  for each row execute function set_dc_geom();

-- GIST index for radius queries.
create index if not exists data_centers_geom_idx
  on data_centers using gist (geom);

-- Helper: returns DCs within `p_radius_km` of (p_lat, p_lng), ordered by
-- distance ascending, with a `distance_km` column.
create or replace function data_centers_within(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision
) returns table (
  id text,
  slug text,
  name text,
  status dc_status,
  latitude double precision,
  longitude double precision,
  state text,
  city text,
  operator text,
  capacity_mw integer,
  distance_km double precision
)
language sql stable as $$
  select
    d.id, d.slug, d.name, d.status, d.latitude, d.longitude, d.state, d.city,
    d.operator, d.capacity_mw,
    extensions.ST_Distance(
      d.geom,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography
    ) / 1000.0 as distance_km
  from data_centers d
  where d.geom is not null
    and extensions.ST_DWithin(
      d.geom,
      extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography,
      p_radius_km * 1000.0
    )
  order by distance_km asc;
$$;

-- Allow anon role to call the RPC (RLS already allows read on the table).
grant execute on function data_centers_within(double precision, double precision, double precision) to anon, authenticated;
