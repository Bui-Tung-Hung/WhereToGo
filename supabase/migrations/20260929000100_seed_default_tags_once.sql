-- WhereToGo — seed default tags only for a user who has no tags yet
-- (a deleted or renamed default tag must not come back on the next app launch)

create or replace function public.seed_default_tags()
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.tags (user_id, name)
  select auth.uid(), default_tag.name
  from (values ('Ăn uống'), ('Vui chơi'), ('Du lịch'), ('Hẹn hò')) as default_tag(name)
  where not exists (select 1 from public.tags where user_id = auth.uid())
  on conflict (user_id, lower(name)) do nothing;
$$;

revoke execute on function public.seed_default_tags() from public, anon;
grant execute on function public.seed_default_tags() to authenticated;
