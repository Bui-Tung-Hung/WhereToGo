-- WhereToGo — helper functions

create or replace function public.seed_default_tags()
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.tags (user_id, name)
  values
    (auth.uid(), 'Ăn uống'),
    (auth.uid(), 'Vui chơi'),
    (auth.uid(), 'Du lịch'),
    (auth.uid(), 'Hẹn hò')
  on conflict (user_id, lower(name)) do nothing;
$$;

revoke execute on function public.seed_default_tags() from public, anon;
grant execute on function public.seed_default_tags() to authenticated;
