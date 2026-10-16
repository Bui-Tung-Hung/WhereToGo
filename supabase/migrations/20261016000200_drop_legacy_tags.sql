-- WhereToGo — drop legacy tags now represented as categories
-- Giao diện mới phần 1 (docs/PLAN-UI-1.md mục 2.2). CHỈ chạy sau khi bản web mới đã lên và đã thử
-- trên iPhone: app cũ còn cần 3 nhãn này. An toàn khi chạy lại.

begin;

-- 1. Lặp lại bước K.3 của migration 1: quán tạo bằng app cũ trong lúc chờ deploy -> "Quán ăn"
insert into public.place_categories (place_id, category_id, user_id)
select p.id, c.id, p.user_id
from public.places p
join public.categories c on c.user_id = p.user_id and lower(c.name) = lower('Quán ăn')
where not exists (select 1 from public.place_categories pc where pc.place_id = p.id)
on conflict do nothing;

-- 2. Xoá 3 nhãn cũ đã thành nhóm (on delete cascade tự xoá place_tags liên quan).
-- Giữ "Hẹn hò" và nhãn user tự tạo.
delete from public.tags t
using (values
  ('Ăn uống', 'Quán ăn'),
  ('Vui chơi', 'Chỗ chơi'),
  ('Du lịch', 'Du lịch')
) as m(old_name, new_name)
where lower(t.name) = lower(m.old_name);

commit;
