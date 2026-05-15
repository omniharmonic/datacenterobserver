-- Track where each data center entry came from and how confident we are
-- in its lat/lng. Lets the map filter out approximate / city-centroid pins
-- by default.

create type location_confidence as enum ('low', 'medium', 'high');

alter table data_centers
  add column if not exists data_source text default 'editorial',
  add column if not exists location_confidence location_confidence;

-- Backfill: editorial entries already in the table = high confidence by
-- default (we hand-curated them).
update data_centers
set data_source = 'editorial',
    location_confidence = 'high'
where id not like 'ft-%';

-- FracTracker rows: mark them as ft for now; the ingester populates a
-- per-row confidence value going forward.
update data_centers
set data_source = 'fractracker'
where id like 'ft-%';

create index if not exists data_centers_data_source_idx on data_centers(data_source);
create index if not exists data_centers_confidence_idx on data_centers(location_confidence);
