-- WhereToGo — kiểm tra cho migration 20261016000100 và 20261016000200 (docs/PLAN-UI-1.md mục 2.3)
-- CHỈ ĐỌC. Chạy bằng quyền postgres trong SQL Editor nên KHÔNG dùng auth.uid() (sẽ là NULL).
-- Mỗi phần là MỘT câu select: bôi đen đúng một phần rồi bấm Run, gửi lại toàn bộ bảng kết quả.
-- Cột: muc | user_id | chi_tiet | so_luong


-- ===== PHẦN TRƯỚC: chạy TRƯỚC migration 1 =====
select 'nhan'::text as muc,
       t.user_id,
       t.name || ' | dai=' || length(t.name)
         || ' | khop_anh_xa=' || (lower(t.name) in (lower('Ăn uống'), lower('Vui chơi'), lower('Du lịch')))::text
         as chi_tiet,
       count(pt.place_id) as so_luong
from public.tags t
left join public.place_tags pt on pt.tag_id = t.id
group by t.user_id, t.id, t.name
union all
select 'so_quan'::text, p.user_id, 'tổng số quán', count(*)
from public.places p
group by p.user_id
order by muc, user_id, chi_tiet;


-- ===== PHẦN SAU-1: chạy SAU migration 1 =====
select 'so_nhom (mong đợi 4)'::text as muc, c.user_id, 'số nhóm'::text as chi_tiet, count(*) as so_luong
from public.categories c
group by c.user_id
union all
select 'quan_theo_nhom', c.user_id, c.name, count(pc.place_id)
from public.categories c
left join public.place_categories pc on pc.category_id = c.id
group by c.user_id, c.id, c.name
union all
select 'quan_khong_nhom (mong đợi 0)', p.user_id, 'số quán chưa có nhóm',
       count(*) filter (where not exists (
         select 1 from public.place_categories pc where pc.place_id = p.id
       ))
from public.places p
group by p.user_id
union all
select 'trigger_updated_at (13 cột)', null::uuid, pg_get_triggerdef(tg.oid), null::bigint
from pg_trigger tg
where tg.tgname = 'places_set_updated_at' and tg.tgrelid = 'public.places'::regclass
union all
select 'rls (mong đợi true, 1 policy)', null::uuid,
       cl.relname || ' rowsecurity=' || cl.relrowsecurity::text,
       (select count(*) from pg_policies pol
        where pol.schemaname = 'public' and pol.tablename = cl.relname and pol.policyname = 'owner_all')
from pg_class cl
where cl.oid in ('public.categories'::regclass, 'public.place_categories'::regclass, 'public.swipe_events'::regclass)
union all
select 'quyen', null::uuid,
       r.role_name || ' ' || tb.table_name || ' ' || pr.privilege || '='
         || has_table_privilege(r.role_name, tb.table_name, pr.privilege)::text,
       null::bigint
from (values ('authenticated'), ('anon'), ('service_role')) as r(role_name)
cross join (values ('public.categories'), ('public.place_categories'), ('public.swipe_events')) as tb(table_name)
cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE')) as pr(privilege)
union all
select 'ham (security_definer mong đợi false)', null::uuid,
       pc.proname || ' security_definer=' || pc.prosecdef::text, null::bigint
from pg_proc pc
join pg_namespace ns on ns.oid = pc.pronamespace
where ns.nspname = 'public'
  and pc.proname in ('seed_default_categories', 'apply_swipe_event_to_score', 'seed_default_tags')
union all
select 'lech_user (mong đợi 0)', null::uuid, 'place_categories khác user của quán hoặc nhóm', count(*)
from public.place_categories pc
join public.places p on p.id = pc.place_id
join public.categories c on c.id = pc.category_id
where pc.user_id <> p.user_id or pc.user_id <> c.user_id
union all
select 'lech_diem (mong đợi 0)', null::uuid, 'quán có interest_score khác tổng delta', count(*)
from public.places p
where p.interest_score <> coalesce((select sum(se.delta) from public.swipe_events se where se.place_id = p.id), 0)
order by muc, user_id, chi_tiet;


-- ===== PHẦN SAU-2: chạy SAU migration 2 =====
select 'nhan_cu_con_lai (mong đợi 0)'::text as muc, null::uuid as user_id,
       'nhãn còn tên Ăn uống / Vui chơi / Du lịch'::text as chi_tiet, count(*) as so_luong
from public.tags t
where lower(t.name) in (lower('Ăn uống'), lower('Vui chơi'), lower('Du lịch'))
union all
select 'quan_khong_nhom (mong đợi 0)', p.user_id, 'số quán chưa có nhóm',
       count(*) filter (where not exists (
         select 1 from public.place_categories pc where pc.place_id = p.id
       ))
from public.places p
group by p.user_id
order by muc, user_id;
