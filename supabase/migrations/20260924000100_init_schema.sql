-- WhereToGo — initial schema
-- gen_random_uuid() is available by default since PostgreSQL 13, no extension needed.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  address text check (char_length(address) <= 500),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  check ((latitude is null) = (longitude is null)),
  google_maps_url text check (char_length(google_maps_url) <= 2000),
  google_place_ref text check (char_length(google_place_ref) <= 300),
  rating smallint check (rating between 1 and 5),
  price_min_vnd integer check (price_min_vnd >= 0),
  price_max_vnd integer check (price_max_vnd >= 0),
  check (price_min_vnd is null or price_max_vnd is null or price_min_vnd <= price_max_vnd),
  notes text check (char_length(notes) <= 5000),
  status text not null default 'not_visited' check (status in ('interested', 'not_visited', 'visited')),
  opening_hours jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index places_user_updated_idx on public.places (user_id, updated_at desc);

create trigger places_set_updated_at
  before update on public.places
  for each row
  execute function public.set_updated_at();

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  created_at timestamptz not null default now()
);

create unique index tags_user_name_uidx on public.tags (user_id, lower(name));

create table public.place_tags (
  place_id uuid not null references public.places(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  primary key (place_id, tag_id)
);

create index place_tags_tag_idx on public.place_tags (tag_id);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  drive_file_id text not null unique check (char_length(drive_file_id) <= 200),
  mime_type text,
  width integer,
  height integer,
  size_bytes bigint,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

create index photos_place_idx on public.photos (place_id, position);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  visited_on date not null,
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

create index visits_place_idx on public.visits (place_id, visited_on desc);

create table public.google_credentials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  refresh_token_encrypted text not null,
  updated_at timestamptz not null default now()
);

create trigger google_credentials_set_updated_at
  before update on public.google_credentials
  for each row
  execute function public.set_updated_at();
