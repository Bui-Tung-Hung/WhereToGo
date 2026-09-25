-- WhereToGo — row level security & grants

alter table public.places enable row level security;
alter table public.tags enable row level security;
alter table public.place_tags enable row level security;
alter table public.photos enable row level security;
alter table public.visits enable row level security;
alter table public.google_credentials enable row level security;

create policy owner_all on public.places
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy owner_all on public.tags
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy owner_all on public.photos
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.places p
      where p.id = place_id and p.user_id = (select auth.uid())
    )
  );

create policy owner_all on public.visits
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.places p
      where p.id = place_id and p.user_id = (select auth.uid())
    )
  );

create policy owner_all on public.place_tags
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.places p
      where p.id = place_id and p.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.tags t
      where t.id = tag_id and t.user_id = (select auth.uid())
    )
  );

-- google_credentials has no policy: only service_role (which bypasses RLS) may touch it.

revoke all on public.places, public.tags, public.place_tags, public.photos, public.visits, public.google_credentials
  from anon, authenticated;

grant select, insert, update, delete on public.places, public.tags, public.place_tags, public.photos, public.visits
  to authenticated;

grant select on public.places, public.tags, public.place_tags, public.photos, public.visits
  to service_role;

grant select, insert, update, delete on public.google_credentials to service_role;
