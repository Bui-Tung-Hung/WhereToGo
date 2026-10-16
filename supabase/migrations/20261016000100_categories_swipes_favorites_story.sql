-- WhereToGo — categories, swipe events, favourites, story
-- Giao diện mới phần 1 (docs/PLAN-UI-1.md mục 2.1). Chỉ THÊM, app cũ vẫn chạy được.
-- Chạy đúng một lần trong SQL Editor: chạy lại sẽ báo lỗi ở bước A và không đổi gì.

begin;

-- A. Cột mới của places
alter table public.places
  add column story text check (char_length(story) <= 5000),
  add column interest_score integer not null default 0,
  add column favorited_at timestamptz;

-- B. updated_at chỉ đổi khi sửa các trường của form (vuốt thẻ và bấm sao không đổi thứ tự "Mới cập nhật")
drop trigger places_set_updated_at on public.places;

create trigger places_set_updated_at
  before update of name, address, latitude, longitude, google_maps_url, google_place_ref,
    rating, price_min_vnd, price_max_vnd, notes, status, opening_hours, story
  on public.places
  for each row
  execute function public.set_updated_at();

-- C. Nhóm
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  prompt text check (char_length(prompt) between 1 and 120),
  icon text check (char_length(icon) between 1 and 40),
  created_at timestamptz not null default now()
);

create unique index categories_user_name_uidx on public.categories (user_id, lower(name));

-- D. Quán – nhóm
create table public.place_categories (
  place_id uuid not null references public.places(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  primary key (place_id, category_id)
);

create index place_categories_category_idx on public.place_categories (category_id);

-- E. Lượt vuốt (id do web tự sinh để hoàn tác được)
create table public.swipe_events (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  delta smallint not null check (delta in (-1, 1)),
  created_at timestamptz not null default now()
);

create index swipe_events_place_idx on public.swipe_events (place_id, created_at desc);

-- F. Cột tổng interest_score tự cập nhật theo swipe_events.
-- Không kiểm số dòng bị ảnh hưởng: khi quán đang bị xoá (cascade), UPDATE chạm 0 dòng là bình thường.
create or replace function public.apply_swipe_event_to_score()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.places set interest_score = interest_score + new.delta where id = new.place_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.places set interest_score = interest_score - old.delta where id = old.place_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger swipe_events_apply_score_insert
  after insert on public.swipe_events
  for each row
  execute function public.apply_swipe_event_to_score();

create trigger swipe_events_apply_score_delete
  after delete on public.swipe_events
  for each row
  execute function public.apply_swipe_event_to_score();

-- G. RLS
alter table public.categories enable row level security;
alter table public.place_categories enable row level security;
alter table public.swipe_events enable row level security;

create policy owner_all on public.categories
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy owner_all on public.place_categories
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
      select 1 from public.categories c
      where c.id = category_id and c.user_id = (select auth.uid())
    )
  );

create policy owner_all on public.swipe_events
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

-- H. Quyền
revoke all on public.categories, public.place_categories, public.swipe_events
  from anon, authenticated;

grant select, insert, update, delete on public.categories, public.place_categories
  to authenticated;

grant select, insert, delete on public.swipe_events
  to authenticated;

grant select on public.categories, public.place_categories, public.swipe_events
  to service_role;

-- I. Tạo 4 nhóm mặc định khi user chưa có nhóm nào (created_at lệch 1 ms để giữ đúng thứ tự)
create or replace function public.seed_default_categories()
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.categories (user_id, name, prompt, icon, created_at)
  select auth.uid(), d.name, d.prompt, d.icon, now() + d.ord * interval '1 millisecond'
  from (values
    (0, 'Quán ăn', 'Chán cơm thì ăn gì?', 'restaurant'),
    (1, 'Quán uống', 'Chán nước thì uống gì?', 'cafe'),
    (2, 'Chỗ chơi', 'Chán ở nhà thì đi đâu?', 'game-controller'),
    (3, 'Du lịch', 'Cuối tuần trốn đi đâu?', 'airplane')
  ) as d(ord, name, prompt, icon)
  where not exists (select 1 from public.categories where user_id = auth.uid())
  on conflict (user_id, lower(name)) do nothing;
$$;

revoke execute on function public.seed_default_categories() from public, anon;
grant execute on function public.seed_default_categories() to authenticated;

-- J. Nhãn mặc định giờ chỉ còn "Hẹn hò" (3 nhãn cũ đã thành nhóm)
create or replace function public.seed_default_tags()
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.tags (user_id, name)
  select auth.uid(), default_tag.name
  from (values ('Hẹn hò')) as default_tag(name)
  where not exists (select 1 from public.tags where user_id = auth.uid())
  on conflict (user_id, lower(name)) do nothing;
$$;

revoke execute on function public.seed_default_tags() from public, anon;
grant execute on function public.seed_default_tags() to authenticated;

-- K. Gán nhóm cho dữ liệu cũ. Chạy bằng quyền postgres (auth.uid() là NULL) nên ghi user_id tường minh.
-- K.1 4 nhóm mặc định cho mỗi user đã có dữ liệu mà chưa có nhóm
insert into public.categories (user_id, name, prompt, icon, created_at)
select u.user_id, d.name, d.prompt, d.icon, now() + d.ord * interval '1 millisecond'
from (
  select user_id from public.places
  union
  select user_id from public.tags
) as u
cross join (values
  (0, 'Quán ăn', 'Chán cơm thì ăn gì?', 'restaurant'),
  (1, 'Quán uống', 'Chán nước thì uống gì?', 'cafe'),
  (2, 'Chỗ chơi', 'Chán ở nhà thì đi đâu?', 'game-controller'),
  (3, 'Du lịch', 'Cuối tuần trốn đi đâu?', 'airplane')
) as d(ord, name, prompt, icon)
where not exists (select 1 from public.categories c where c.user_id = u.user_id);

-- K.2 Nhãn cũ -> nhóm mới, cùng user
insert into public.place_categories (place_id, category_id, user_id)
select pt.place_id, c.id, pt.user_id
from public.place_tags pt
join public.tags t on t.id = pt.tag_id
join (values
  ('Ăn uống', 'Quán ăn'),
  ('Vui chơi', 'Chỗ chơi'),
  ('Du lịch', 'Du lịch')
) as m(old_name, new_name) on lower(t.name) = lower(m.old_name)
join public.categories c on c.user_id = t.user_id and lower(c.name) = lower(m.new_name)
on conflict do nothing;

-- K.3 Quán chưa có nhóm nào -> "Quán ăn" của chính user đó (M3)
insert into public.place_categories (place_id, category_id, user_id)
select p.id, c.id, p.user_id
from public.places p
join public.categories c on c.user_id = p.user_id and lower(c.name) = lower('Quán ăn')
where not exists (select 1 from public.place_categories pc where pc.place_id = p.id)
on conflict do nothing;

-- K.4 KHÔNG xoá nhãn ở đây: xem 20261016000200_drop_legacy_tags.sql

commit;
