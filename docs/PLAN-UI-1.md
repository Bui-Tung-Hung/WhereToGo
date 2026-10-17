# KẾ HOẠCH GIAO DIỆN MỚI — PHẦN 1 (bản 2)

Ngày: 2026-10-16. Chế độ: **PLAN** (chưa thực hiện cho tới khi user gõ `ENTER EXECUTE MODE`).
Nguồn quyết định: [UI-REDESIGN.md](UI-REDESIGN.md) — U1–U45 (quyết định của user) và M1–M8 (mặc định Claude đặt, user đã giao). Kế hoạch gốc của app: [PLAN.md](PLAN.md).
Quy ước giống PLAN.md: `[USER]` = bước chỉ user làm được; `[GATE]` = dừng, chờ user xác nhận; `P#` = mặc định kỹ thuật do kế hoạch này đặt.
Nguyên tắc code: skill `code-design-principles` (SRP, DRY, KISS, YAGNI, hàm thuần dễ test, tách theo tính năng, JSDoc tiếng Việt như code hiện có, không nuốt lỗi). Quy ước của repo: component là `export function X(props: XProps): React.JSX.Element`, chỉ named export, props có JSDoc; chuỗi giao diện tiếng Việt; Prettier (`singleQuote`, `semi`, `printWidth` 100); test Vitest `globals: false`, tên test tiếng Việt.
Bản 2 sửa theo 3 lượt review (code, độ phủ quyết định, SQL) ngày 2026-10-16.

---

## 0. Phạm vi

**Có trong phần 1**

1. Đổi DB: nhóm (`categories`), quan hệ quán–nhóm, lượt vuốt và điểm hứng thú, Yêu thích, Câu chuyện; gán nhóm cho dữ liệu cũ; sửa hàm tạo nhãn mặc định (migration 1, chỉ THÊM, không phá app cũ). Xoá 3 nhãn cũ đã chuyển thành nhóm ở migration 2, chạy SAU khi bản web mới đã lên và được thử.
2. Trang chủ mới thay 3 tab (U1–U8, U33, U34, M1, M2, M4).
3. Trang vuốt thẻ (U14–U18, U44, M6) và bảng trượt lên dùng chung (M5).
4. Form Thêm/Sửa địa điểm: chọn nhóm (bắt buộc, U42), nhãn, Câu chuyện (U25).
5. Trang Quản lý nhóm (P33).
6. Lối vào tạm: Search, thẻ nhóm, nút tim, thẻ Gần tôi mở danh sách cũ đã lọc sẵn (P9).
7. Gom code trùng lặp (DRY).
8. Giữ app mở được khi offline: tách bundle, kiểm tra kích thước trong CI.
9. Sao lưu có thứ tự ổn định khi bảng lớn hơn 1000 dòng.

**Không có trong phần 1**

| Hạng mục | Lý do hoãn |
|---|---|
| Trang ngẫu nhiên và nút ngẫu nhiên (U19–U21) | Phần 2 theo cách làm C (U38); chưa có thiết kế |
| Trang lưới mới (chọn quán / tìm kiếm / Yêu thích) | Chưa có thiết kế; tạm dùng danh sách cũ (P9) |
| Bản đồ Gần tôi (U11–U13) | Phần 3 |
| Hướng dẫn lấy link có toạ độ trong trang thêm quán (U36) | Toạ độ chỉ cần khi có bản đồ (phần 3) |
| Dòng khoảng cách trên thẻ vuốt | Cả 3 quán hiện chưa có toạ độ (UI-REDESIGN mục 2); thêm cùng phần 3 |
| Làm lại các màn cũ (UI-REDESIGN mục 4C) | User chưa quyết |

---

## 1. Bảng mặc định kỹ thuật của phần 1

| # | Hạng mục | Mặc định |
|---|---|---|
| P1 | Tên bảng | `categories` (nhóm), `place_categories` (quán–nhóm), `swipe_events` (lượt vuốt) |
| P2 | Biểu tượng nhóm | 20 khoá (tên icon ionicons bản `Outline`) kèm nhãn tiếng Việt: `restaurant` Nhà hàng, `fast-food` Đồ ăn nhanh, `pizza` Pizza, `ice-cream` Kem, `cafe` Cà phê, `beer` Bia, `wine` Rượu vang, `game-controller` Trò chơi, `film` Phim, `musical-notes` Âm nhạc, `basketball` Thể thao, `bicycle` Xe đạp, `paw` Thú cưng, `leaf` Thiên nhiên, `airplane` Máy bay, `car` Ô tô, `boat` Thuyền, `map` Bản đồ, `storefront` Cửa hàng, `heart` Trái tim. Mặc định khi để trống: `locationOutline`, nhãn "Mặc định" |
| P3 | Câu gợi ý mặc định khi để trống | "Hôm nay đi đâu?" |
| P4 | 4 nhóm ban đầu, đúng thứ tự này (tên · câu gợi ý · biểu tượng) | Quán ăn · "Chán cơm thì ăn gì?" · `restaurant`; Quán uống · "Chán nước thì uống gì?" · `cafe`; Chỗ chơi · "Chán ở nhà thì đi đâu?" · `game-controller`; Du lịch · "Cuối tuần trốn đi đâu?" · `airplane`. Chèn với `created_at` = `now()` cộng 0/1/2/3 mili giây để giữ đúng thứ tự |
| P5 | Nhãn mặc định cho user mới | Chỉ "Hẹn hò" (U40) |
| P6 | Tiêu đề trang chủ | "WhereToGo" (Playfair Display 800) thay chữ tiếng Anh "Pick ur interest" của Stitch (U29) |
| P7 | Thanh dưới trang chủ | Trái: Search · Giữa: nút ＋ (ẩn khi offline, giữ chỗ trống) · Phải: nút vuốt thẻ (`albumsOutline`). Nút ngẫu nhiên thêm ở phần 2 |
| P8 | Góc phải trên trang chủ | Biểu tượng offline (`cloudOfflineOutline`, chỉ hiện khi offline) · nút tim (`heartOutline`, mở Yêu thích) · nút avatar (mở Cài đặt) |
| P9 | Lối vào tạm | Search → `#/search`; thẻ nhóm → `#/categories/:id`; tim → `#/favorites`; thẻ Gần tôi → `#/nearby`. Cả 4 là `PlaceListPage` với tiêu đề và bộ lọc đặt sẵn |
| P10 | Thẻ "Hôm nay thử quán này" | Bốc 1 quán trong tất cả quán, giữ nguyên trong cùng một phiên chạy JS của app (tắt hẳn app rồi mở lại thì đổi; chỉ xuống nền rồi quay lại thì giữ) |
| P11 | Chữ của trang vuốt thẻ | Tiêu đề "Chọn quán", dòng phụ "VUỐT ĐỂ KHÁM PHÁ"; trên bộ thẻ dòng "Còn {n} địa điểm". Dấu đóng: "HỨNG THÚ" (vuốt phải), "BỎ QUA" (vuốt trái). Toast: "+1 điểm hứng thú", "−1 điểm hứng thú", "Đã thêm vào Yêu thích", "Đã bỏ khỏi Yêu thích", "Đã hoàn tác", "Không còn gì để hoàn tác" |
| P12 | Nút sao | Bật/tắt Yêu thích cho thẻ trên cùng, **không** đẩy thẻ đi |
| P13 | Hoàn tác | Từng lượt từ lượt cuối, chỉ trong lần xem hiện tại; hoàn tác = xoá dòng `swipe_events` của lượt đó |
| P14 | Bộ lọc trang vuốt thẻ | Hàng 1: nhóm, chọn một ("Tất cả" + từng nhóm). Hàng 2: nhãn, chọn nhiều, kiểu HOẶC (như D19). Đổi bộ lọc = bộ thẻ mới |
| P15 | Thứ tự bộ thẻ | Xáo ngẫu nhiên mỗi lần dựng bộ thẻ. Quán thêm sau khi dựng chỉ vào bộ thẻ ở lần dựng sau |
| P16 | Ảnh trên thẻ vuốt | Ảnh đầu tiên theo `position`, cỡ 1600, chỉ dựng tối đa 3 thẻ trên cùng (cộng thẻ đang bay). Không có ảnh: nền `--wtg-surface` + biểu tượng nhóm đầu 48px ở giữa |
| P17 | Bảng trượt lên | `IonModal`, `breakpoints` [0, 0.6, 1], `initialBreakpoint` 0.6, `handle`, nội dung trong `IonContent`. Mốc cuối = 1 (theo cảnh báo của tài liệu Ionic) |
| P18 | Xoá nhóm | Chặn nếu có quán chỉ thuộc riêng nhóm đó (giữ U42); còn lại hỏi xác nhận |
| P19 | Thứ tự nhóm trong form, bộ lọc, Quản lý nhóm, chip | `created_at` tăng dần, rồi tên (`localeCompare` locale `vi`) |
| P20 | Thứ tự thẻ nhóm trên trang chủ (M2) | Số quán giảm dần → `created_at` tăng dần → tên |
| P21 | Cụm ảnh tròn (U3) | Tối đa 5 ảnh mới nhất theo `photos.created_at` trong các quán của nhóm (có thể nhiều ảnh cùng một quán). Nhóm 0 quán: chữ "Chưa có địa điểm". Nhóm có quán nhưng 0 ảnh: vòng tròn 56px nền `--wtg-chip-bg` chứa biểu tượng nhóm 28px, kèm nhãn "+N" |
| P22 | Trọng lượng phông | Be Vietnam Pro 400/500/600 (đã nạp), Playfair Display 600/800, Fraunces và Plus Jakarta Sans dạng biến thiên. Không dùng trọng lượng chưa nạp |
| P23 | Phông mới | Playfair Display 800 (latin + vietnamese), `@fontsource-variable/fraunces` 5.3.0, `@fontsource-variable/plus-jakarta-sans` 5.3.0 (file `wght.css`; gói không có file theo từng subset, chấp nhận phần latin-ext/cyrillic thừa, kiểm bằng `check:size`). DM Sans không dùng (M7) |
| P24 | Màu nhấn trang chủ | `#0071E3` thay `#0A84FF` để chữ trắng trên nút đạt 4.7:1 |
| P25 | Ghi dữ liệu ở trang vuốt thẻ | Mutation mới dùng `networkMode: 'always'`, cập nhật lạc quan, không tải lại cả danh sách sau mỗi lượt. Trong lúc một lượt đang bay hoặc đang ghi, mọi nút và cử chỉ bị khoá |
| P26 | Phiên bản app | 0.1.0 → **0.2.0** (đổi `buster`, bỏ cache cũ thiếu trường mới) |
| P27 | Tách bundle | `manualChunks` theo nhóm thư viện; script kiểm mọi file precache < 2 MiB, chạy trong CI |
| P28 | Cử chỉ vuốt thẻ và vuốt-mép-quay-lại của Ionic | Cử chỉ thẻ dùng Ionic `createGesture`, `gesturePriority` 110 (cao hơn 101 của vuốt-quay-lại), `direction: 'x'`, `threshold` 10, `maxAngle` mặc định 40. Thử trên iPhone ở GATE C |
| P29 | Chiều cao bộ thẻ | `clamp(280px, 44vh, 380px)`. Tổng chiều cao trang vuốt (header 44 + 2 hàng lọc 88 + bộ thẻ + teaser ~76 + hàng nút 68) vừa màn 667pt và 926pt |
| P30 | Ngẫu nhiên mà render vẫn thuần (luật `react-hooks/purity`) | Không gọi `Math.random()`, `crypto.randomUUID()`, `Date.now()` trực tiếp trong thân component. Seed bộ thẻ là số nguyên 32 bit không dấu từ `createRandomSeed()`, tạo trong `useState` initializer khi trang vuốt thẻ được mount, và trong handler "Xem lại từ đầu". Thứ tự thẻ = `shuffle(ids, createSeededRandom(seed))` (hàm thuần) |
| P31 | Độ sâu chồng thẻ | Dịch rồi mới co: thẻ thứ 2 `translate3d(0, 12px, 0) scale(0.95)` opacity 0.92; thẻ thứ 3 `translate3d(0, 24px, 0) scale(0.90)` opacity 0.75 |
| P32 | Hiệu ứng xuất hiện của thẻ trang chủ | `animation-fill-mode: backwards` (không dùng `forwards` như Stitch, vì `forwards` khoá `transform` làm hiệu ứng nhấn không chạy) |
| P33 | Quản lý nhóm | Trang riêng `#/settings/categories` (tạm trả lời câu hỏi mở 12) |
| P34 | Nút trên trang vuốt thẻ | Tim = Hứng thú (+1, như vuốt phải); X = Bỏ qua (−1, như vuốt trái); Sao = Yêu thích (U16) |
| P35 | Một "lần xem" của trang vuốt thẻ (M6) | Bắt đầu khi trang được mở từ trang chủ (component mount) và kết thúc khi quay về trang chủ (component bị gỡ). Mở Chi tiết hay Cài đặt từ trang vuốt thẻ rồi quay lại vẫn là cùng lần xem (giữ vị trí và lịch sử hoàn tác) |
| P36 | Cỡ chữ tối thiểu | 11px cho mọi chữ (Stitch dùng 9–10px ở vài chỗ) |
| P37 | Màu thành phần Ionic trong 2 trang mới | Ghi đè `--ion-color-primary` (+ `-rgb`, `-contrast`, `-contrast-rgb`, `-shade`, `-tint`), `--ion-color-medium` (+ `-rgb`), `--ion-font-family`, `--ion-toolbar-color` theo token của trang |

---

## 2. Cơ sở dữ liệu

### 2.1 Migration 1 — `supabase/migrations/20261016000100_categories_swipes_favorites_story.sql`

Chỉ THÊM (app cũ vẫn chạy). Dòng đầu `-- WhereToGo — categories, swipe events, favourites, story`. Toàn bộ trong `begin;` … `commit;`. Chạy đúng một lần (chạy lại sẽ báo lỗi ở bước A và không đổi gì). Thứ tự:

**A. Cột mới của `places`**

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| `story` | `text` | null được; `check (char_length(story) <= 5000)` |
| `interest_score` | `integer` | `not null default 0` |
| `favorited_at` | `timestamptz` | null được (null = không yêu thích) |

**B. Trigger `updated_at` chỉ chạy khi sửa trường của form** — `drop trigger places_set_updated_at on public.places;` rồi `create trigger places_set_updated_at before update of name, address, latitude, longitude, google_maps_url, google_place_ref, rating, price_min_vnd, price_max_vnd, notes, status, opening_hours, story on public.places for each row execute function public.set_updated_at();`. Trigger chạy khi một trong 13 cột này có mặt trong câu UPDATE; vuốt thẻ (chỉ đổi `interest_score` qua trigger F) và bấm sao (chỉ gửi `favorited_at`) không đẩy quán lên "Mới cập nhật".

**C. Bảng `public.categories`**

| Cột | Kiểu | Ràng buộc |
|---|---|---|
| `id` | `uuid` | khoá chính, `default gen_random_uuid()` |
| `user_id` | `uuid` | `not null default auth.uid() references auth.users(id) on delete cascade` |
| `name` | `text` | `not null`, `check (char_length(name) between 1 and 50)` |
| `prompt` | `text` | null được, `check (char_length(prompt) between 1 and 120)` |
| `icon` | `text` | null được, `check (char_length(icon) between 1 and 40)` |
| `created_at` | `timestamptz` | `not null default now()` |

Chỉ mục duy nhất `categories_user_name_uidx` trên `(user_id, lower(name))`.

**D. Bảng `public.place_categories`** — `place_id uuid not null references public.places(id) on delete cascade`, `category_id uuid not null references public.categories(id) on delete cascade`, `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`, `primary key (place_id, category_id)`; chỉ mục `place_categories_category_idx` trên `(category_id)`.

**E. Bảng `public.swipe_events`** — `id uuid primary key default gen_random_uuid()` (web luôn gửi id tự sinh), `place_id uuid not null references public.places(id) on delete cascade`, `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`, `delta smallint not null check (delta in (-1, 1))`, `created_at timestamptz not null default now()`. Chỉ mục `swipe_events_place_idx` trên `(place_id, created_at desc)`.

**F. Cột tổng tự cập nhật (U37)** — hàm `public.apply_swipe_event_to_score()` `returns trigger`, `language plpgsql`, `security invoker`, `set search_path = public`: `if tg_op = 'INSERT'` thì cộng `new.delta` vào `interest_score` của quán `new.place_id` và `return new`; nếu là `'DELETE'` thì trừ `old.delta` khỏi quán `old.place_id` và `return old`. Không kiểm số dòng bị ảnh hưởng, không `raise` (UPDATE chạm 0 dòng khi quán đang bị xoá do cascade là bình thường). Hai trigger `swipe_events_apply_score_insert` (`after insert … for each row`) và `swipe_events_apply_score_delete` (`after delete … for each row`) cùng gọi hàm này. User `authenticated` đã có quyền UPDATE trên `places` và policy `owner_all` cho phép sửa quán của chính mình.

**G. RLS** — `alter table … enable row level security` cho 3 bảng; policy `owner_all` `for all to authenticated`:
- `categories`: `using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)`.
- `place_categories`: như `place_tags` (`using` kiểm user; `with check` kiểm user + quán thuộc user + nhóm thuộc user qua `public.categories`).
- `swipe_events`: như `visits` (`with check` kiểm user + quán thuộc user).

**H. Quyền** — `revoke all on public.categories, public.place_categories, public.swipe_events from anon, authenticated;` `grant select, insert, update, delete on public.categories, public.place_categories to authenticated;` `grant select, insert, delete on public.swipe_events to authenticated;` `grant select on public.categories, public.place_categories, public.swipe_events to service_role;`.

**I. Hàm `public.seed_default_categories()`** — `returns void`, `language sql`, `security invoker`, `set search_path = public`: chèn 4 nhóm P4 cho `auth.uid()` (cột `name, prompt, icon, created_at`, với `created_at` = `now()` + 0/1/2/3 `* interval '1 millisecond'`) từ một bảng `values (thứ tự, tên, câu, biểu tượng)` **chỉ khi** `not exists (select 1 from public.categories where user_id = auth.uid())`, `on conflict (user_id, lower(name)) do nothing`. Sau đó `revoke execute on function public.seed_default_categories() from public, anon;` và `grant execute … to authenticated;`.

**J. Thay `public.seed_default_tags()`** — `create or replace` cùng `returns void`, `language sql`, `security invoker`, `set search_path = public`, cùng cấu trúc select-from-values-where-not-exists của file `20260929000100`, chỉ còn giá trị `('Hẹn hò')` (P5). Lặp lại `revoke execute … from public, anon;` và `grant execute … to authenticated;`.

**K. Gán nhóm cho dữ liệu cũ** (chạy bằng quyền `postgres` trong SQL Editor: `auth.uid()` là NULL nên mọi INSERT ghi `user_id` tường minh). Bảng ánh xạ dùng chung: `(values ('Ăn uống','Quán ăn'), ('Vui chơi','Chỗ chơi'), ('Du lịch','Du lịch')) as m(old_name, new_name)`; mọi phép so tên dùng `lower(...) = lower(...)`.
1. Với mỗi `user_id` trong (`select user_id from public.places union select user_id from public.tags`) mà chưa có dòng nào trong `categories`: chèn 4 nhóm P4 với `user_id` đó và `created_at` lệch mili giây như mục I.
2. Chèn `place_categories (place_id, category_id, user_id)` từ `place_tags pt` nối `tags t` (`t.id = pt.tag_id`) nối `m` (`lower(t.name) = lower(m.old_name)`) nối `categories c` (`c.user_id = t.user_id and lower(c.name) = lower(m.new_name)`), giá trị `(pt.place_id, c.id, pt.user_id)`, `on conflict do nothing`.
3. Chèn `place_categories` cho mọi quán `p` chưa có dòng nào trong `place_categories`: nhóm `c` có `c.user_id = p.user_id and lower(c.name) = lower('Quán ăn')`, giá trị `(p.id, c.id, p.user_id)`, `on conflict do nothing` (M3).
4. KHÔNG xoá nhãn ở migration này (xem 2.2).

### 2.2 Migration 2 — `supabase/migrations/20261016000200_drop_legacy_tags.sql`

Chạy SAU khi bản web mới đã deploy và GATE C đạt (app cũ cần 3 nhãn đó cho tới lúc thay). Dòng đầu `-- WhereToGo — drop legacy tags now represented as categories`. Trong `begin;` … `commit;`, an toàn khi chạy lại:
1. Lặp lại đúng bước K.3 của migration 1 (quán tạo bằng app cũ trong lúc chờ deploy chưa có nhóm → vào "Quán ăn").
2. Xoá `public.tags` có `lower(name)` thuộc `lower(m.old_name)` của cùng bảng ánh xạ ở 2.1.K (cascade tự xoá `place_tags` liên quan). Giữ "Hẹn hò" và nhãn user tự tạo.

### 2.3 File kiểm tra — `supabase/checks/20261016000100_verify.sql`

Chỉ câu `select`, chạy bằng quyền `postgres` (không dùng `auth.uid()`, luôn `group by user_id`). Có 3 phần, **mỗi phần là MỘT câu select duy nhất** ghép bằng `union all`, cùng 4 cột `(muc text, user_id uuid, chi_tiet text, so_luong bigint)`, để SQL Editor hiện trọn kết quả:
- **TRƯỚC migration 1**: mỗi nhãn của mỗi user (tên, `length(name)`, cờ tên có khớp một `old_name` của bảng ánh xạ) kèm số quán đang gắn; số quán của mỗi user.
- **SAU migration 1**: số nhóm theo user (mong đợi 4); số quán theo từng nhóm; số quán không có nhóm (mong đợi 0); `pg_get_triggerdef` của `places_set_updated_at` (phải liệt kê 13 cột); `rowsecurity` của 3 bảng mới (mong đợi true) và số policy `owner_all` (mong đợi 1 mỗi bảng); `has_table_privilege` của `authenticated` (select/insert/update/delete cho `categories`, `place_categories`; select/insert/delete và KHÔNG update cho `swipe_events`), `anon` (không có quyền nào), `service_role` (select); `prosecdef` của 2 hàm mới (mong đợi false = security invoker); số dòng `place_categories` có `user_id` khác với quán hoặc nhóm (mong đợi 0); số quán có `interest_score` khác `coalesce(sum(delta), 0)` của `swipe_events` (mong đợi 0).
- **SAU migration 2**: số nhãn còn tên khớp bảng ánh xạ (mong đợi 0); số quán không có nhóm (mong đợi 0).

---

## 3. Cấu trúc thư mục

### 3.1 File mới

| Đường dẫn | Vai trò |
|---|---|
| `supabase/migrations/20261016000100_categories_swipes_favorites_story.sql` | Mục 2.1 |
| `supabase/migrations/20261016000200_drop_legacy_tags.sql` | Mục 2.2 |
| `supabase/checks/20261016000100_verify.sql` | Mục 2.3 |
| `jobs/tests/test_supabase_admin.py` | Mục 9 |
| `web/scripts/check-precache-size.mjs` | Mục 8 |
| `web/src/lib/supabaseResult.ts` (+ `.test.ts`) | `unwrap`, `assertNoError` dùng chung |
| `web/src/lib/onlineGuard.ts` | `assertOnline` dùng chung |
| `web/src/shared/random/shuffle.ts` (+ `.test.ts`) | Xáo, bốc, seed |
| `web/src/shared/text/nameValidation.ts` (+ `.test.ts`) | Kiểm tên nhãn/nhóm |
| `web/src/shared/hooks/usePrefersReducedMotion.ts` | Đọc `prefers-reduced-motion` |
| `web/src/shared/components/ToggleChip.tsx` | Chip bật/tắt dùng chung |
| `web/src/shared/components/OfflineIndicator.tsx` | Biểu tượng offline |
| `web/src/theme/themes.css` | Token 2 hệ thiết kế, sáng + tối |
| `web/src/features/auth/avatarInfo.ts` (+ `.test.ts`) | Link ảnh + chữ cái đầu |
| `web/src/features/auth/UserAvatar.tsx`, `AvatarButton.tsx` | Avatar; nút avatar mở Cài đặt |
| `web/src/features/categories/categoryIcons.ts` (+ `.test.ts`) | P2, P3 |
| `web/src/features/categories/categorySchema.ts` (+ `.test.ts`) | Zod form nhóm |
| `web/src/features/categories/categoryRepository.ts`, `categoryQueries.ts` | Đọc/ghi nhóm |
| `web/src/features/categories/categoryRules.ts` (+ `.test.ts`) | Đếm, sắp, ảnh, kiểm xoá, nhóm của quán |
| `web/src/features/categories/CategoryPicker.tsx`, `CategoryFilterBar.tsx` | Chọn nhóm (form), lọc một nhóm |
| `web/src/features/categories/CategoryEditorSheet.tsx`, `CategoryEditorForm.tsx` | Thêm/sửa nhóm |
| `web/src/features/categories/ManageCategoriesPage.tsx`, `CategoryPlacesPage.tsx` | `#/settings/categories`, `#/categories/:id` |
| `web/src/features/places/placeCache.ts` (+ `.test.ts`) | Vá cache `['places']` lạc quan (hàm thuần) |
| `web/src/features/places/placeDisplay.ts` (+ `.test.ts`) | Ảnh bìa, cắt danh sách chip |
| `web/src/features/places/openMapsLink.ts` | Mở Google Maps (dùng chung chi tiết + bảng) |
| `web/src/features/places/usePlaceDistance.ts` | Chuỗi "cách bạn …" (dùng chung) |
| `web/src/features/places/placeSchema.test.ts` | Kiểm `categoryIds`, `story` |
| `web/src/features/places/PlaceInfoSheet.tsx`, `PlaceInfoHeader.tsx`, `PlaceStoryBlock.tsx`, `placeInfoSheet.css` | Bảng trượt lên |
| `web/src/features/home/dailyPick.ts` (+ `.test.ts`) | P10 |
| `web/src/features/home/HomePage.tsx`, `HomeHeader.tsx`, `HomeCardLayout.tsx`, `DailyPickCard.tsx`, `CategoryCard.tsx`, `PhotoCluster.tsx`, `NearbyCard.tsx`, `HomeDock.tsx`, `home.css` | Trang chủ |
| `web/src/features/swipe/swipeMotion.ts` (+ `.test.ts`), `swipeDeck.ts` (+ `.test.ts`) | Hàm thuần |
| `web/src/features/swipe/swipeRepository.ts`, `swipeQueries.ts`, `useSwipeGesture.ts`, `useSwipeDeckController.ts` | Ghi lượt vuốt, cử chỉ, điều phối |
| `web/src/features/swipe/SwipePage.tsx`, `SwipeDeckView.tsx`, `SwipeCard.tsx`, `SwipeTeaser.tsx`, `SwipeActions.tsx`, `SwipeEmptyState.tsx`, `swipe.css` | Trang vuốt thẻ |

### 3.2 File sửa

`jobs/wheretogo_jobs/backup.py`, `jobs/wheretogo_jobs/supabase_admin.py`, `jobs/tests/test_backup.py`, `.github/workflows/ci.yml`, `docs/SETUP.md`, `docs/UI-REDESIGN.md`, `docs/PLAN.md`, `web/package.json` (+ `package-lock.json`), `web/vite.config.ts`, `web/src/main.tsx`, `web/src/theme/fonts.css`, `web/src/theme/global.css`, `web/src/app/App.tsx`, `web/src/features/auth/AuthProvider.tsx`, `web/src/features/opening-hours/{openingHours.ts, OpeningHoursView.tsx}`, `web/src/features/places/{types.ts, placeSchema.ts, placeRepository.ts, placeService.ts, placeQueries.ts, placeFilters.ts, placeFilters.test.ts, PlaceListPage.tsx, PlaceDetailPage.tsx, PlaceFormPage.tsx}`, `web/src/features/photos/{photoRepository.ts, photoService.ts}`, `web/src/features/visits/{visitRepository.ts, visitService.ts}`, `web/src/features/tags/{tagRepository.ts, TagPicker.tsx, TagFilterBar.tsx, ManageTagsPage.tsx}`, `web/src/features/settings/SettingsPage.tsx`.

### 3.3 File xoá

`web/src/app/Tabs.tsx`.

---

## 4. Lớp dữ liệu web

### 4.1 Gom code trùng (DRY)

- **`lib/supabaseResult.ts`**: chuyển nguyên văn `unwrap<T>` và `assertNoError` (chép giống hệt ở 4 repository) kèm JSDoc, export.
- **`lib/onlineGuard.ts`**: chuyển nguyên văn `assertOnline()` (ném `OfflineError` khi `!navigator.onLine`), export.
- **Import sau khi gom** (để không còn import thừa làm lint đỏ):
  - `placeRepository.ts`, `photoRepository.ts`, `visitRepository.ts`: xoá hàm riêng `unwrap`, `assertNoError`; xoá `import type { PostgrestError }` và import `mapPostgrestError`; thêm `import { assertNoError, unwrap } from '../../lib/supabaseResult'`.
  - `tagRepository.ts`: xoá `unwrap`, `assertNoError`, `assertOnline` riêng và JSDoc "không có tagService riêng…"; import giữ `mapPostgrestError` (vẫn dùng ở `seedDefaultTags`), bỏ `PostgrestError` và `OfflineError`; thêm import từ `supabaseResult` và `onlineGuard`.
  - `placeService.ts`, `photoService.ts`, `visitService.ts`: xoá `assertOnline` riêng; bỏ `OfflineError` khỏi import (các import khác giữ nguyên); thêm `import { assertOnline } from '../../lib/onlineGuard'`. JSDoc `@throws {OfflineError}` giữ nguyên.
- **`shared/text/nameValidation.ts`**: kiểu `NameValidation = { kind: 'ok'; name: string } | { kind: 'empty' } | { kind: 'too_long' } | { kind: 'duplicate' }`; `validateName(rawName: string, existingNames: readonly string[], options: { maxLength: number; excludeName?: string }): NameValidation` (trim; rỗng → `empty`; dài hơn `maxLength` → `too_long`; trùng một tên trong `existingNames` khác `excludeName` theo `normalizeVi` → `duplicate`); `nameErrorMessage(kind: Exclude<NameValidation['kind'], 'ok'>, noun: string, maxLength: number): string` → `empty`/`too_long`: "Tên {noun} phải từ 1 đến {maxLength} ký tự."; `duplicate`: "{Noun viết hoa chữ đầu} này đã tồn tại.". Dùng ở `TagPicker` (tạo), `ManageTagsPage` (đổi tên; tên rỗng vẫn im lặng bỏ qua như cũ), `CategoryPicker`, `CategoryEditorForm`.
- **`shared/components/ToggleChip.tsx`**: props `label: string`, `selected: boolean`, `onToggle: () => void`, `icon?: string`. Vẽ đúng chip đang có ở `TagPicker`/`TagFilterBar` (`IonChip` lớp `wtg-tap-target`, `color` = `primary` khi chọn, `outline` khi không, `role="button"`, `tabIndex={0}`, `aria-pressed`, Enter/Space gọi `onToggle`), thêm `IonIcon` `aria-hidden="true"` khi có `icon`. `TagPicker`, `TagFilterBar` đổi sang dùng nó (chip "Nhãn mới" giữ nguyên).
- **`shared/random/shuffle.ts`**: `shuffle<T>(items: readonly T[], random = Math.random): T[]` (Fisher–Yates trên bản sao); `pickRandom<T>(items: readonly T[], random = Math.random): T | undefined`; `createRandomSeed(random = Math.random): number` = `Math.floor(random() * 4294967296)`; `createSeededRandom(seed: number): () => number` (mulberry32, bắt đầu bằng `seed >>> 0`, trả số trong [0, 1)). JSDoc ghi rõ seed phải là số nguyên 32 bit, không truyền số thực trong [0, 1).
- **`shared/hooks/usePrefersReducedMotion.ts`**: `usePrefersReducedMotion(): boolean` dùng `useSyncExternalStore` với `window.matchMedia('(prefers-reduced-motion: reduce)')` (đăng ký sự kiện `change`).
- **`features/opening-hours/openingHours.ts`**: nhận kiểu `OpenStatus` và bảng nhãn từ `OpeningHoursView.tsx`, export thành `OpenStatus` và `OPEN_STATUS_LABELS` ("Đang mở" / "Đã đóng" / "Chưa rõ giờ"); `OpeningHoursView.tsx` import lại (giữ `STATUS_COLOR` của nó).

### 4.2 Kiểu và schema của địa điểm

- `types.ts`: `Place` thêm `story: string | null`, `interestScore: number`, `favoritedAt: string | null`; `PhotoRef` thêm `createdAt: string`; `PlaceWithRelations` thêm `categoryIds: string[]`. Cập nhật JSDoc.
- `placeSchema.ts`: thêm `story: z.string().max(5000, 'Câu chuyện tối đa 5000 ký tự').nullable()` và `categoryIds: z.array(z.string().uuid()).min(1, 'Chọn ít nhất một nhóm')`. JSDoc: danh sách trường text tuỳ chọn thêm `story`.

### 4.3 `placeRepository.ts`

- `PlaceColumnsRow` thêm `story`, `interest_score`, `favorited_at`; `PlaceRelationsRow` thêm `place_categories: { category_id: string }[]`, phần tử `photos` thêm `created_at`.
- `PLACE_COLUMNS` thêm `story, interest_score, favorited_at`; `PLACE_WITH_RELATIONS_COLUMNS` thêm `place_categories(category_id)` và `created_at` trong `photos(...)`.
- `mapPlaceColumns` thêm 3 trường; `mapPlaceRow` thêm `categoryIds` và `createdAt` của ảnh.
- `toColumns`: thêm `story`; kiểu trả về `Omit<PlaceColumnsRow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'interest_score' | 'favorited_at'>` (form không bao giờ ghi 2 cột này).
- Hàm riêng `replaceJoinRows(table: 'place_tags' | 'place_categories', column: 'tag_id' | 'category_id', placeId: string, ids: readonly string[]): Promise<void>`: thuật toán của `replacePlaceTags` hiện tại; đọc dòng có sẵn bằng `unwrap<Record<string, string>[]>(supabase.from(table).select(column).eq('place_id', placeId))`, lấy id bằng `row[column]`, chèn `{ place_id: placeId, [column]: id }`. `replacePlaceTags(placeId, tagIds)` và hàm mới `replacePlaceCategories(placeId, categoryIds)` chỉ gọi nó.
- Hàm mới `updatePlaceFavorite(id: string, favoritedAt: string | null): Promise<string | null>`: `update({ favorited_at })` đúng một cột, `select('favorited_at').single()`, trả giá trị server lưu.

`photoRepository.ts`: `PhotoRow`, `PHOTO_COLUMNS` thêm `created_at`; `mapPhotoRow` thêm `createdAt`.

### 4.4 `placeService.ts`

- `createPlace`, `updatePlace`: gọi `replacePlaceCategories(id, input.categoryIds)` ngay sau `replacePlaceTags`. Cập nhật JSDoc.
- Hàm mới `setFavorite(id: string, favorited: boolean): Promise<string | null>`: `assertOnline()` rồi `updatePlaceFavorite(id, favorited ? new Date().toISOString() : null)`.

### 4.5 Cache và hook của địa điểm

- **`placeCache.ts`** (hàm thuần): `patchPlace(places: readonly PlaceWithRelations[] | undefined, id: string, patch: (place) => PlaceWithRelations): PlaceWithRelations[] | undefined` (trả mảng mới, chỉ đổi phần tử có `id`); `withInterestDelta(place, delta)`; `withFavoritedAt(place, favoritedAt)`. Hàm có tác dụng phụ duy nhất `applyPlacePatch(queryClient, id, patch)`: `setQueryData` cho `['places']` (qua `patchPlace`) và `['places', id]` (nếu có).
- **`placeQueries.ts`**: `QUERY_KEYS` thêm `categories: ['categories'] as const`. Hook mới `useSetFavorite()`: biến `{ id: string; favorited: boolean }`; `networkMode: 'always'`; `onMutate`: `cancelQueries(['places'])`, lưu bản cũ của `['places']` và `['places', id]`, `applyPlacePatch` với `withFavoritedAt(…, favorited ? ISO hiện tại : null)`, trả bản cũ làm context; `onError`: ghi lại bản cũ; `onSuccess`: `applyPlacePatch` với giá trị server.

### 4.6 `placeFilters.ts`

- `PlaceFilterCriteria` thêm 2 trường tuỳ chọn (không truyền = không lọc, hành vi cũ giữ nguyên): `categoryIds?: string[]` (quán thuộc ÍT NHẤT MỘT nhóm) và `favoritesOnly?: boolean` (chỉ quán có `favoritedAt` khác null).
- `buildSearchableText` thêm `story`. Cập nhật JSDoc.

### 4.7 Hiển thị địa điểm dùng chung

- **`placeDisplay.ts`** (hàm thuần): `getCoverPhoto(place): PhotoRef | null` (ảnh `position` nhỏ nhất); `limitChips(names: readonly string[], max: number): { visible: string[]; extraCount: number }`.
- **`openMapsLink.ts`**: `openMapsLink(link: string): void` gọi `window.open(link, '_blank', 'noopener,noreferrer')` (đúng cách `PlaceDetailPage` đang làm). `PlaceDetailPage` đổi sang dùng hàm này.
- **`usePlaceDistance.ts`**: `usePlaceDistance(place: Pick<Place, 'latitude' | 'longitude'> | null, enabled: boolean): string | null` — `useCurrentPosition({ enabled, onlyIfPermissionGranted: true })` + `haversineMeters` + `formatDistance`; null khi thiếu vị trí hoặc toạ độ. `PlaceDetailPage` đổi phần "Cách bạn …" sang dùng hook này với `enabled` = true.

### 4.8 Nhóm (`features/categories/`)

- **`categoryIcons.ts`**: `CATEGORY_ICON_KEYS` (20 khoá P2, đúng thứ tự), `CategoryIconKey`, `CATEGORY_ICONS: Record<CategoryIconKey, string>` (icon `…Outline` từ `ionicons/icons`), `CATEGORY_ICON_LABELS: Record<CategoryIconKey, string>` (nhãn tiếng Việt P2), `DEFAULT_CATEGORY_ICON = locationOutline`, `DEFAULT_CATEGORY_PROMPT = 'Hôm nay đi đâu?'`, `resolveCategoryIcon(key: string | null): string`, `resolveCategoryPrompt(prompt: string | null): string`.
- **`categorySchema.ts`**: `categoryFormSchema` = `name` (trim; rỗng → `nameErrorMessage('empty', 'nhóm', 50)`; > 50 → `nameErrorMessage('too_long', 'nhóm', 50)`), `prompt` (`z.string().nullable()` + `.transform` trim, chuỗi rỗng → `null`, rồi kiểm ≤ 120 với câu "Câu gợi ý tối đa 120 ký tự"), `icon` (`z.enum(CATEGORY_ICON_KEYS).nullable()`). Kiểu `CategoryInput` = kết quả đã parse. Trùng tên kiểm riêng bằng `validateName`.
- **`categoryRepository.ts`**: `Category { id; name; prompt: string | null; icon: string | null; createdAt }`; `listCategories(): Promise<Category[]>` (`order('created_at')` rồi `order('name')`); `createCategory(input: CategoryInput): Promise<Category>`; `updateCategory(id: string, input: CategoryInput): Promise<Category>`; `deleteCategory(id: string): Promise<void>`; `seedDefaultCategories(): Promise<void>` (RPC `seed_default_categories`). Hàm ghi gọi `assertOnline()`.
- **`categoryQueries.ts`**: `useCategories()`, `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()`; thành công làm mới `['categories']` và `['places']` (mẫu `tagQueries.ts`).
- **`categoryRules.ts`** (hàm thuần): `countPlacesByCategory(places)`; `sortCategoriesByCreation(categories)` (P19); `sortCategoriesForHome(categories, counts)` (P20); `recentPhotosForCategory(places, categoryId, limit)` (P21; hoà `createdAt` thì so `id`); `findPlacesOnlyInCategory(places, categoryId)`; `resolvePlaceCategories(place, categories): Category[]` (các nhóm của quán theo P19, bỏ id không còn tồn tại — mọi chỗ "nhóm đầu" lấy phần tử 0).

### 4.9 Lượt vuốt (`features/swipe/`)

- **`swipeRepository.ts`**: `insertSwipeEvent(input: { id: string; placeId: string; delta: 1 | -1 }): Promise<void>` và `deleteSwipeEvent(id: string): Promise<void>`, cả hai `assertOnline()`.
- **`swipeQueries.ts`**: `useRecordSwipe()` (biến `{ eventId, placeId, delta }`, `networkMode: 'always'`, lạc quan `applyPlacePatch(…, withInterestDelta(…, delta))`, lỗi thì vá ngược −delta) và `useUndoSwipe()` (cùng biến, gọi `deleteSwipeEvent`, lạc quan −delta, lỗi thì +delta). Không làm mới cả danh sách.
- **`swipeMotion.ts`** (hằng + hàm thuần): `SWIPE_THRESHOLD_PX = 95`, `ROTATION_DEG_PER_PX = 0.08`, `STAMP_FULL_OPACITY_PX = 100`, `FLY_OUT_MS = 450`, `FLY_OUT_FALLBACK_MS = FLY_OUT_MS + 100`, `SNAP_BACK_MS = 350`, `SWIPE_GESTURE_PRIORITY = 110`; `cardDragTransform(dx, dy): string` = `translate3d({dx}px, {dy}px, 0) rotate({dx × 0.08}deg)`; `stampOpacities(dx): { like: number; skip: number }` (bên đúng hướng `min(|dx| / 100, 1)`, bên kia 0); `releaseOutcome(dx): 'like' | 'skip' | 'cancel'` (> 95 like, < −95 skip); `deltaForDirection(direction): 1 | -1`.
- **`swipeDeck.ts`** (hàm thuần): `SwipeDirection = 'like' | 'skip'`; `DeckEntry { placeId; direction; eventId }`; `DeckState { order: string[]; position: number; history: DeckEntry[] }`; `createDeck(placeIds, seed)` (sắp `placeIds` tăng dần rồi `shuffle` với `createSeededRandom(seed)`); `upcomingIds(state, available: ReadonlySet<string>, count)`; `remainingCount(state, available)`; `applySwipe(state, placeId, direction, eventId)` (bỏ qua nếu `history` đã có `eventId` hoặc `placeId` không có trong `order`; `position = max(position, vị trí + 1)`; thêm vào `history`); `revertEntry(state, eventId)` (nếu mục cuối của `history` có `eventId` đó: bỏ nó và đặt `position` về vị trí của quán; còn lại trả nguyên `state`); `lastEntry(state): DeckEntry | null`.
- **`useSwipeGesture.ts`**: `useSwipeGesture(elementRef: RefObject<HTMLElement | null>, options: { enabled: boolean; onMove: (dx: number, dy: number) => void; onRelease: (dx: number) => void }): void`. `handlersRef` cập nhật trong `useEffect` không mảng phụ thuộc (không gán trong lúc render). Effect 1 (phụ thuộc `[elementRef]`): `createGesture({ el, gestureName: 'wtg-swipe-card', gesturePriority: SWIPE_GESTURE_PRIORITY, direction: 'x', threshold: 10, onMove: (d) => handlersRef.current.onMove(d.deltaX, d.deltaY), onEnd: (d) => handlersRef.current.onRelease(d.deltaX) })`, lưu vào `gestureRef`, cleanup `destroy()`. Effect 2 khai báo sau, phụ thuộc `[enabled]`: `gestureRef.current?.enable(enabled)`.
- **`useSwipeDeckController.ts`**: `useSwipeDeckController({ initialPlaceIds, seed, placesById, isOnline })` giữ:
  - `deck` = `useState(() => createDeck(initialPlaceIds, seed))`;
  - `flying: { placeId; direction } | null` (thẻ đang bay); `pendingEventId: string | null` (lượt đang ghi);
  - `busy` = `flying !== null || pendingEventId !== null || undo.isPending || favorite.isPending`;
  - dùng `useRecordSwipe`, `useUndoSwipe`, `useSetFavorite`, `useIonToast`, `usePrefersReducedMotion`.
  - `swipe(direction)`: bỏ qua khi `busy`, offline hoặc không có thẻ trên cùng. `eventId = crypto.randomUUID()`; `setDeck(applySwipe(...))` NGAY; `setFlying` (trừ khi giảm chuyển động); `setPendingEventId(eventId)`; `record.mutate(…, { onSuccess: toast "+1 điểm hứng thú" / "−1 điểm hứng thú", onError: (e) => { setDeck((s) => revertEntry(s, eventId)); toast toUserMessage(e) }, onSettled: () => setPendingEventId(null) })`.
  - `onFlyOutEnd()`: `setFlying(null)`.
  - `undo()`: bỏ qua khi `busy` hoặc offline; `entry = lastEntry(deck)`; không có → toast "Không còn gì để hoàn tác"; có → `undoMutation.mutate({ eventId, placeId, delta: deltaForDirection(direction) }, { onSuccess: () => { setDeck((s) => revertEntry(s, entry.eventId)); toast "Đã hoàn tác" }, onError: toast toUserMessage })`.
  - `toggleFavorite()`: bỏ qua khi `busy` hoặc offline; `favorite.mutate({ id, favorited: favoritedAt === null }, { onSuccess: toast "Đã thêm vào Yêu thích" / "Đã bỏ khỏi Yêu thích", onError: toast toUserMessage })`.
  - Trả: `upcoming` (tối đa 3 quán), `flyingPlace`, `remaining`, `canUndo` (`lastEntry` khác null), `busy`, và các handler trên.
  - Toast: `position: 'top'`, thành công 1500ms, lỗi 2500ms `color: 'danger'`.

### 4.10 Đăng nhập, seed, avatar

- **`AuthProvider.tsx`**: ref đổi tên `hasSeededDefaultsRef`; effect seed gọi `seedDefaultTags()` → làm mới `['tags']` (như cũ) và `seedDefaultCategories()` → làm mới `['categories']`; mỗi lời gọi có `catch` ghi log riêng (`seed_default_tags_failed`, `seed_default_categories_failed`). JSDoc sửa thành nhãn và nhóm mặc định.
- **`tagRepository.ts`**: JSDoc `seedDefaultTags` → "Tạo nhãn mặc định 'Hẹn hò' khi user chưa có nhãn nào…".
- **`avatarInfo.ts`**: `getAvatarInfo(user: { email?: string; user_metadata?: Record<string, unknown> } | null): { imageUrl: string | null; initial: string }` — ảnh = `avatar_url` nếu là chuỗi khác rỗng, không thì `picture`, không thì null; chữ cái đầu = ký tự đầu viết hoa của `full_name` → `name` → `email`, không có thì "?".
- **`UserAvatar.tsx`**: props `size: number`; `useAuth()` + `getAvatarInfo`; `img` tròn (`referrerPolicy="no-referrer"`, `alt=""`), hoặc khi không có ảnh / ảnh lỗi (`onError` đặt state lỗi) thì vòng tròn chữ cái đầu trên nền `--wtg-chip-bg`, chữ `--wtg-chip-text`, cỡ chữ `size × 0.45`.
- **`AvatarButton.tsx`**: nút vùng 44×44 chứa `UserAvatar` 28px viền 1px `--wtg-border`, `aria-label="Cài đặt"`, bấm → `/settings`.

---

## 5. Điều hướng

`App.tsx`:
- Hàm nội bộ `authed(element)` bọc `<RequireAuth>`; mọi route trừ `/login` dùng nó.
- Route theo thứ tự: `/login`; `/home` (HomePage); `/swipe` (SwipePage); `/search` (`PlaceListPage` mode `explore`, tiêu đề "Tìm kiếm"); `/favorites` (mode `explore`, tiêu đề "Yêu thích", `favoritesOnly`, `emptyTitle` "Chưa có địa điểm yêu thích", `emptyMessage` "Bấm ngôi sao ở trang vuốt thẻ hoặc trang chi tiết."); `/nearby` (mode `nearby`, tiêu đề "Gần tôi"); `/categories/:id` (CategoryPlacesPage); `/settings`; `/settings/tags`; `/settings/categories`; `/places/new`; `/places/:id`; `/places/:id/edit`; `/tabs/*` → `<Navigate to="/home" replace />`; `/` → `/home`; `*` → `/`.
- Xoá import `Tabs`, xoá `Tabs.tsx`. Cập nhật JSDoc danh sách route.

Chỗ trỏ route cũ: `PlaceDetailPage.tsx` (3 `defaultHref="/tabs/explore"` → `/home`), `PlaceFormPage.tsx` (sau khi xoá: `navigate('/home', { replace: true })`), `ManageTagsPage.tsx` (`defaultHref="/settings"`), `theme/global.css` (xoá 2 dòng comment cuối nhắc `Tabs.tsx`).

`PlaceListPage.tsx`: props thêm `title: string` (bắt buộc, thay biến tự tính), `presetCategoryId?: string`, `favoritesOnly?: boolean`, `emptyTitle?: string`, `emptyMessage?: string`. Truyền `categoryIds: presetCategoryId ? [presetCategoryId] : []` và `favoritesOnly` vào `filterPlaces` (đọc thẳng từ props mỗi lần render, không đưa vào state). Header thêm `IonButtons slot="start"` + `IonBackButton defaultHref="/home" text=""`. Nhánh "Không tìm thấy địa điểm": khi `query` rỗng, chưa chọn nhãn, trạng thái `all` và có `emptyTitle` thì dùng `emptyTitle`/`emptyMessage`; còn lại giữ câu cũ.

`CategoryPlacesPage.tsx`: đọc `:id`; tên nhóm từ `useCategories()` (chưa có thì tiêu đề "Nhóm"); vẽ `PlaceListPage` mode `explore`, `presetCategoryId`, `emptyTitle` "Nhóm này chưa có địa điểm", `emptyMessage` "Thêm địa điểm và chọn nhóm này.".

`SettingsPage.tsx`: header thêm `IonButtons slot="start"` + `IonBackButton defaultHref="/home" text=""`; bỏ cặp `IonHeader collapse="condense"`; nhóm "Dữ liệu" thêm mục "Quản lý nhóm" (→ `/settings/categories`, cùng kiểu mục "Quản lý nhãn") đặt trên "Quản lý nhãn".

---

## 6. Giao diện

### 6.1 Token (`theme/themes.css`)

Hai lớp `.wtg-theme-home` và `.wtg-theme-swipe` khai báo cùng tên biến; giá trị sáng mặc định, giá trị tối trong `@media (prefers-color-scheme: dark)`. Lớp đặt trên `IonPage` của trang và trên `IonModal` (vì modal được đưa ra ngoài trang).

| Biến | Home sáng | Home tối | Swipe sáng | Swipe tối |
|---|---|---|---|---|
| `--wtg-bg` | `#F5F2E9` | `#141311` | `#F2ECE1` | `#141413` |
| `--wtg-surface` | `#FBF9F4` | `#1E1C19` | `#FFFFFF` | `#1C1917` |
| `--wtg-surface-2` | `#F5F2E9` | `#26231F` | `#F7F3EA` | `#201F1B` |
| `--wtg-border` | `#EAE5D9` | `#3A3631` | `#E7E5E4` | `#292524` |
| `--wtg-text` | `#1C1917` | `#F5F2E9` | `#1C1917` | `#FAF7EE` |
| `--wtg-text-muted` | `#57534E` | `#A8A29E` | `#57534E` | `#A8A29E` |
| `--wtg-accent` | `#0071E3` | `#0071E3` | `#E8A359` | `#E8A359` |
| `--wtg-on-accent` | `#FFFFFF` | `#FFFFFF` | `#0C0A09` | `#0C0A09` |
| `--wtg-accent-text` | `#0066CC` | `#4DA3FF` | `#9A5B13` | `#F5AB61` |
| `--wtg-chip-accent-bg` | `rgba(0,113,227,0.10)` | `rgba(77,163,255,0.15)` | `rgba(232,163,89,0.18)` | `rgba(232,163,89,0.20)` |
| `--wtg-chip-accent-border` | `rgba(0,113,227,0.25)` | `rgba(77,163,255,0.30)` | `rgba(154,91,19,0.30)` | `rgba(232,163,89,0.30)` |
| `--wtg-chip-bg` | `#EDE8DC` | `#2A2723` | `#F5F5F4` | `rgba(41,37,36,0.8)` |
| `--wtg-chip-border` | `#E2DCCE` | `#3A3631` | `#E7E5E4` | `rgba(68,64,60,0.6)` |
| `--wtg-chip-text` | `#44403C` | `#E7E5E4` | `#44403C` | `#D6D3D1` |
| `--wtg-ring` | `#FFFFFF` | `#1E1C19` | `#FFFFFF` | `#1C1917` |
| `--wtg-pill-bg` | `rgba(229,229,229,0.9)` | `rgba(68,64,60,0.9)` | `rgba(255,255,255,0.85)` | `rgba(36,34,30,0.75)` |
| `--wtg-pill-text` | `#404040` | `#E7E5E4` | `#1C1917` | `#FAF7EE` |
| `--wtg-dock-bg` | `rgba(245,242,233,0.95)` | `rgba(20,19,17,0.95)` | (không dùng) | (không dùng) |
| `--wtg-sheet-bg` | `#FBF9F4` | `#1E1C19` | `#FFFFFF` | `#171614` |
| `--wtg-handle` | `#A8A29E` | `#78716C` | `#A8A29E` | `#78716C` |
| `--wtg-shadow-card` | `0 1px 2px rgba(0,0,0,0.05)` | `none` | `0 16px 36px -14px rgba(28,25,23,0.35)` | `0 16px 36px -10px rgba(0,0,0,0.65)` |
| `--wtg-success-bg` / `--wtg-success-text` | `#DCFCE7` / `#15803D` | `rgba(22,101,52,0.35)` / `#4ADE80` | `#DCFCE7` / `#15803D` | `#052E16` / `#34D399` |
| `--wtg-danger-text` | `#B91C1C` | `#F87171` | `#B91C1C` | `#FB7185` |
| `--wtg-font-body` | `'Be Vietnam Pro', system-ui, sans-serif` | (như sáng) | `'Plus Jakarta Sans Variable', system-ui, sans-serif` | (như sáng) |
| `--wtg-font-display` | `'Playfair Display', Georgia, serif` | (như sáng) | `'Fraunces Variable', Georgia, serif` | (như sáng) |

Riêng swipe: `--wtg-pass` (`#BE123C` sáng / `#FB7185` tối), `--wtg-pass-border` (`rgba(190,18,60,0.30)` / `rgba(244,63,94,0.30)`), `--wtg-star` (`#0E7490` / `#22D3EE`), `--wtg-star-border` (`rgba(14,116,144,0.30)` / `rgba(6,182,212,0.30)`), `--wtg-like-from` `#E8A359`, `--wtg-like-to` `#F58853`. Chữ trên ảnh của thẻ vuốt luôn `#FAF7EE` trên lớp phủ gradient cố định của Stitch (`rgba(20,20,19,0.02)` 0% → `rgba(20,20,19,0.2)` 50% → `rgba(20,20,19,0.85)` 80% → `#141413` 98%) ở cả hai chế độ.

Trong mỗi lớp còn đặt (P37): `font-family` và `--ion-font-family` = `var(--wtg-font-body)`; `--ion-background-color` = `--wtg-bg`; `--ion-text-color` = `--wtg-text`; `--ion-toolbar-background` = `--wtg-bg`; `--ion-toolbar-color` = `--wtg-text`; `--ion-color-medium` = `--wtg-text-muted` (+ `-rgb`: home sáng `87,83,78`, home tối `168,162,158`, swipe như home); `--ion-color-primary` = `--wtg-accent` với `-rgb`/`-contrast`/`-contrast-rgb`/`-shade`/`-tint` = home `0,113,227` / `#FFFFFF` / `255,255,255` / `#0063C8` / `#1A7FE6`, swipe `232,163,89` / `#0C0A09` / `12,10,9` / `#CC8F4E` / `#EAAC6A`; `ion-content { --background: var(--wtg-bg) }`; `ion-toolbar { --background: var(--wtg-bg); --border-width: 0 }`; `.wtg-heading, .wtg-display { font-family: var(--wtg-font-display) }`. Mọi cặp chữ/nền trong bảng đã đo ≥ 4.5:1; tay nắm của bảng là trang trí.

### 6.2 Phông (`theme/fonts.css`, `main.tsx`)

`fonts.css` thêm `@import '@fontsource/playfair-display/latin-800.css'`, `'@fontsource/playfair-display/vietnamese-800.css'`, `'@fontsource-variable/fraunces/wght.css'`, `'@fontsource-variable/plus-jakarta-sans/wght.css'` (P23). `main.tsx` import `./theme/themes.css` ngay sau `./theme/global.css`.

### 6.3 Trang chủ (`features/home/`, route `/home`)

**`HomePage.tsx`**: `IonPage` lớp `wtg-theme-home`. Dữ liệu: `usePlaces()`, `useCategories()`, `useOnlineStatus()`. `IonRefresher` gọi `queryClient.invalidateQueries` cho `['places']`, `['categories']`, `['tags']` rồi `complete()` (giữ D-8). Cấu trúc: `HomeHeader` → `IonContent` (danh sách, đệm `0 16px 24px`, khoảng cách 14px) → `HomeDock` → `PlaceInfoSheet` `theme="home"`. Trạng thái nội dung theo thứ tự ưu tiên:
1. Chưa có dữ liệu quán (`data === undefined`) và offline → `EmptyState` icon `cloudOfflineOutline`, "Đang offline", "Chưa có dữ liệu đã lưu trên máy này.".
2. Chưa có dữ liệu và đang tải → `IonSpinner` giữa trang, `aria-label="Đang tải"`.
3. Chưa có dữ liệu và lỗi → `EmptyState` icon `alertCircleOutline`, "Không tải được dữ liệu", `toUserMessage(error)`, nút "Thử lại" (`refetch`).
4. 0 quán → `EmptyState` "Chưa có địa điểm nào" / "Bắt đầu lưu lại những nơi bạn muốn nhớ." + nút "Thêm địa điểm đầu tiên" khi online (giống `PlaceListPage`).
5. Có quán → `DailyPickCard` (quán từ `getSessionDailyPick`, gọi trong `useMemo` theo `places`) → `CategoryCard` theo `sortCategoriesForHome` (nếu 0 nhóm: một thẻ `HomeCardLayout` "Chưa có nhóm nào" / "Tạo nhóm để sắp xếp địa điểm" → `/settings/categories`) → `NearbyCard`.

Hiệu ứng: mỗi thẻ lớp `wtg-cascade` (`fadeInUp`: opacity 0 → 1, `translateY(16px)` → 0, 0.55s, `cubic-bezier(0.16, 1, 0.3, 1)`, `animation-fill-mode: backwards` — P32), `animation-delay` = 0.05s + chỉ số × 0.08s qua `style` inline. Nút ＋ lớp `wtg-fab-glow`: `fabBreathing` 3s `ease-in-out` vô hạn giữa `box-shadow: 0 10px 25px -3px rgba(0,113,227,0.38), 0 0 0 0 rgba(0,113,227,0.25)` và `0 14px 28px -3px rgba(0,113,227,0.48), 0 0 0 8px rgba(0,113,227,0.08)`. `@media (prefers-reduced-motion: reduce)`: `animation: none` cho cả hai. Không có equalizer, vòng sóng avatar, vệt sáng nút, nhãn LIVE.

- **`HomeHeader`**: `IonHeader` lớp `ion-no-border` > `IonToolbar` (nhận safe area trên). Trong toolbar: `IonTitle` chứa "WhereToGo" (`--wtg-font-display`, 800, 20px, `letter-spacing: -0.04em`, căn trái bằng `className` riêng); `IonButtons slot="end"` gồm `OfflineIndicator`, nút tim (`IonButton` vùng 44×44, `heartOutline` 22px, `aria-label="Yêu thích"`, → `/favorites`), `AvatarButton`.
- **`HomeCardLayout`** (khung thẻ dùng chung): props `icon: string`, `label: string`, `prompt: string`, `aside: React.ReactNode`, `ariaLabel: string`, `onOpen: () => void`, `cascadeIndex: number`. Thẻ lớp `wtg-home-card wtg-cascade`: nền `--wtg-surface`, viền 1px `--wtg-border`, bo 24px, đệm 16px, bóng `--wtg-shadow-card`, `:active` → `scale(0.98)` 200ms; `role="button"`, `tabIndex={0}`, Enter/Space như bấm, `aria-label`. Cột trái rộng 7/12 (đệm phải 8px): hàng nhãn = icon 16px `--wtg-text-muted` + `label` (12px, 600, `--wtg-text-muted`, 1 dòng, cắt "…") cách nhau 6px, dưới cách 4px; `prompt` (15px, 600, `line-height` 1.375, `--wtg-text`, tối đa 3 dòng). Cột phải 5/12 căn phải: `aside`.
- **`CategoryCard`** (props `category`, `count`, `photos`, `cascadeIndex`): dùng `HomeCardLayout` với `resolveCategoryIcon`, tên nhóm, `resolveCategoryPrompt`, `aside` = `PhotoCluster` (hoặc chữ "Chưa có địa điểm" 12px `--wtg-text-muted` khi `count` = 0), `ariaLabel` "{tên nhóm}, {count} địa điểm", mở `/categories/{id}`.
- **`PhotoCluster`** (props `photos` ≤ 5, `count`, `fallbackIcon`): khung 112×96 `position: relative; isolation: isolate`. Ảnh theo Stitch: ảnh 1 → 44px (top 28px, left 28px, z 3); ảnh 2 → 40px (top 0, left 24px, z 2); ảnh 3 → 36px (top 16px, left 0, z 1); ảnh 4 → 36px (top 20px, right 0, z 1); ảnh 5 → 32px (bottom 0, left 8px, z 2). Mỗi ảnh là `AuthedImage` cỡ 400, `alt=""`, `className="wtg-cluster-photo"`; CSS cho lớp bọc: kích thước theo ô, `border-radius: 50%`, `overflow: hidden`, viền 2px `--wtg-ring`; `.wtg-cluster-photo img { display: block; width: 100%; height: 100%; object-fit: cover }`. 0 ảnh: vòng 56px giữa khung, nền `--wtg-chip-bg`, `fallbackIcon` 28px (P21). Nhãn "+{count}" ở `bottom 4px; right 8px`, z 4, 11px 600, đệm 2px 8px, bo tròn, nền `--wtg-pill-bg`, chữ `--wtg-pill-text`, viền 1px `--wtg-ring`.
- **`DailyPickCard`** (props `place`, `categories`, `onOpen`): thẻ cùng kiểu `wtg-home-card` nhưng KHÔNG có `role`/`tabIndex` (bấm thẻ bằng chuột/chạm gọi `onOpen`); phần tử tương tác duy nhất là nút "Xem". Hàng 1: ô 16×16 bo 4px nền `--wtg-text` chứa `sparklesOutline` 11px màu `--wtg-bg` + "Hôm nay thử quán này" (12px, 600, `--wtg-text-muted`). Hàng 2: tên quán (16px, 600, tối đa 2 dòng). Hàng 3 (hai đầu): trái = ảnh tròn 32px (`getCoverPhoto`, `AuthedImage` 400, `alt=""`, viền 2px `--wtg-ring`; không có ảnh thì vòng `--wtg-chip-bg` với biểu tượng nhóm đầu 16px) + địa chỉ (12px, `--wtg-text-muted`, 1 dòng, bỏ nếu null); phải = nút "Xem" (`IonButton` nền `--wtg-accent`, chữ `--wtg-on-accent` 13px 600, bo tròn, cao ≥ 44px, `aria-label="Xem {tên quán}"`; `onClick` gọi `event.stopPropagation()` rồi `onOpen`).
- **`NearbyCard`** (props `cascadeIndex`): `HomeCardLayout` với `locationOutline`, "Gần tôi", "Quanh đây có gì?", `aside` = vòng 56px nền `--wtg-chip-accent-bg` chứa `navigateOutline` 24px màu `--wtg-accent-text`; mở `/nearby`.
- **`HomeDock`**: `IonFooter` (không thêm lớp) > `div.wtg-home-dock` (KHÔNG bọc `IonToolbar`): nền `--wtg-dock-bg`, `border-top: 1px solid var(--wtg-border)`, `padding: 10px 24px calc(10px + var(--ion-safe-area-bottom, 0px))`, `display: flex; align-items: center; justify-content: space-between`. Trái: nút Search (vùng 44×44, `searchOutline` 24px, `aria-label="Tìm kiếm"`, → `/search`). Giữa: nút ＋ 56×56 tròn nền `--wtg-accent`, `addOutline` 28px màu `--wtg-on-accent`, `margin-top: -28px`, lớp `wtg-fab-glow`, `aria-label="Thêm địa điểm"`, → `/places/new`; offline thì thay bằng `div` trống 56×56. Phải: nút vuốt thẻ (vùng 44×44, `albumsOutline` 24px, `aria-label="Vuốt chọn quán"`, → `/swipe`).
- **`OfflineIndicator`**: `useOnlineStatus()`; online → `null`; offline → `IonIcon` `cloudOfflineOutline` 20px màu `--wtg-text-muted`, `role="img"`, `aria-label="Đang offline"`.
- **`dailyPick.ts`**: `createDailyPickStore()` trả `{ pick(places, random = Math.random): PlaceWithRelations | null }` — nhớ id đã bốc trong closure; id còn trong `places` thì trả quán đó; không thì `pickRandom` và nhớ; `places` rỗng → null. Export `getSessionDailyPick(places)` dùng một store cấp module (P10). Test tạo store riêng.

### 6.4 Bảng trượt lên (`features/places/`)

**`PlaceInfoSheet.tsx`**: props `place: PlaceWithRelations | null`, `onDidDismiss: () => void`, `theme: 'home' | 'swipe'`. `isOpen` = `place !== null`. `IonModal` lớp `wtg-theme-{theme} wtg-info-sheet`, P17, `ref` để gọi `dismiss()`; `onDidDismiss` → prop `onDidDismiss`. Nơi gọi giữ id quán đang mở và chỉ đặt về null trong `onDidDismiss` (nội dung không biến mất giữa lúc đóng). Kiểu: `--background: var(--wtg-sheet-bg)`, bo trên 36px (swipe) / 24px (home), viền trên 1px `--wtg-border`, tay nắm `--wtg-handle`. Tự gọi `useCategories()`, `useTags()`, `resolvePlaceCategories`, `usePlaceDistance(place, isOpen)`. Nội dung trong `IonContent` (đệm 16px 20px, khoảng cách 16px):
1. Hàng đầu: "Thông tin nhanh" (12px, 600, `--wtg-accent-text`, kèm `starOutline` 14px `aria-hidden`); nút đóng (vùng 44×44, vòng 28px `--wtg-chip-bg`, `closeOutline` 16px, `aria-label="Đóng"`, gọi `modalRef.current?.dismiss()`).
2. `PlaceInfoHeader` (props `place`, `categories`, `tagNames`, `distanceText`): ảnh 80×80 bo 16px (`getCoverPhoto`, `AuthedImage` 400, `alt="Ảnh {tên quán}"`; không có thì ô `--wtg-chip-bg` với biểu tượng nhóm đầu 32px) + cột: chip (`limitChips([...tên nhóm, ...tên nhãn theo thứ tự useTags()], 3)`; nhóm = chip nhấn, nhãn = chip thường, dư thành "+N"; 11px, đệm 2px 8px, bo tròn, `nowrap`); tên quán (`--wtg-font-display`, 20px, home 800 / swipe 700, `--wtg-text`); dòng giá (`formatVndRange`, 12px, 600, `--wtg-accent-text`) nối " · cách bạn {distanceText}" khi có; hàng dưới: `locationOutline` 14px + địa chỉ (13px, `--wtg-text-muted`) và huy hiệu giờ mở cửa (`isOpenAt(place.openingHours, new Date())`, chữ `OPEN_STATUS_LABELS`; `open` nền `--wtg-success-bg` chữ `--wtg-success-text`; `closed` chữ `--wtg-danger-text` nền `--wtg-chip-bg`; `unknown` chữ `--wtg-text-muted` nền `--wtg-chip-bg`; 11px 600, bo tròn).
3. Hai nút ngang nhau, cao 44px, bo 22px: "Chỉ đường" (`navigateOutline`, nền `--wtg-accent`, chữ `--wtg-on-accent`; ẩn khi `buildGoogleMapsLink(place)` null; `openMapsLink`) và "Xem đầy đủ" (viền `--wtg-border`, chữ `--wtg-text`; `await modalRef.current?.dismiss()` rồi `navigate('/places/{id}')`).
4. `PlaceStoryBlock` (props `story`): nền `--wtg-surface-2`, viền 1px `--wtg-border`, bo 16px, đệm 14px; tiêu đề "CÂU CHUYỆN" (12px, 600, hoa, `letter-spacing: 0.08em`, `--wtg-accent-text`); nội dung 14px `line-height` 1.6 `--wtg-text`, `white-space: pre-line`; trống → "Chưa có câu chuyện." (`--wtg-text-muted`).

### 6.5 Trang vuốt thẻ (`features/swipe/`, route `/swipe`)

**`SwipePage.tsx`**: `IonPage` lớp `wtg-theme-swipe`; `IonContent` `scrollY={false}`. State: `seed` = `useState(() => createRandomSeed())` (P30, P35); bộ lọc nhóm (`string | null`) và nhãn (`string[]`); `infoPlaceId: string | null`. Dữ liệu: `usePlaces()`, `useOnlineStatus()`.
- **Header**: `IonHeader` `ion-no-border` > `IonToolbar`: `IonButtons slot="start"` > `IonBackButton defaultHref="/home" text=""` (vòng 44px nền `--wtg-pill-bg`, viền 1px `--wtg-border`); `IonTitle` 2 dòng căn giữa: chấm 8px `--wtg-accent` (`aria-hidden`) + "Chọn quán" (`--wtg-font-display`, 18px, 600) / "VUỐT ĐỂ KHÁM PHÁ" (11px, 500, hoa, `--wtg-text-muted`); `IonButtons slot="end"` > `AvatarButton`. Không có thanh dưới (U17).
- **Bộ lọc** (đệm 0 16px): `OfflineBanner` khi offline; `CategoryFilterBar`; `TagFilterBar` (tự ẩn khi không có nhãn). Đổi bộ lọc = bộ thẻ mới (khoá đổi).
- **Trạng thái trước bộ thẻ**: cùng 3 trạng thái 1–3 của trang chủ (offline chưa có dữ liệu / đang tải / lỗi).
- **Có dữ liệu**: `initialPlaceIds` = id của `filterPlaces(places, { query: '', tagIds, status: 'all', categoryIds: nhóm ? [nhóm] : [] }, new Map())` (không loại "Đã đi", U15); vẽ `SwipeDeckView` với `key = "{seed}|{nhóm hoặc 'all'}|{tagIds sắp tăng dần, nối bằng ','}"`, props `initialPlaceIds`, `seed`, `placesById` (Map từ `places`), `hasAnyPlace` (`places.length > 0`), `isOnline`, `onRestart` (đặt `seed = createRandomSeed()`), `onOpenInfo(placeId)`.
- **Bảng trượt lên**: `PlaceInfoSheet` `theme="swipe"`, `place = placesById.get(infoPlaceId) ?? null`, `onDidDismiss` đặt `infoPlaceId` null.

**`CategoryFilterBar`** (`features/categories`): props `selected: string | null`, `onChange: (id: string | null) => void`; hàng cuộn ngang (`overflow-x: auto`, đệm dọc 8px, khoảng cách 8px); chip "Tất cả" (chọn khi null) + chip từng nhóm (P19, icon nhóm) bằng `ToggleChip`; bấm chip đang chọn thì không đổi.

**`SwipeDeckView`**: gọi `useSwipeDeckController`, `useCategories()`. Vẽ theo thứ tự dọc (cột flex, khoảng cách 8px, đệm `0 16px calc(8px + var(--ion-safe-area-bottom, 0px))`):
1. Dòng "Còn {remaining} địa điểm" (11px, 500, `--wtg-text-muted`, căn giữa, `aria-live="polite"`).
2. Vùng bộ thẻ cao P29, `position: relative`: các thẻ `upcoming` (thẻ dưới vẽ trước) và, nếu có, `flyingPlace` vẽ cuối; tất cả trong cùng danh sách với `key` = id quán (thẻ đang kéo trở thành thẻ bay mà không đổi phần tử DOM).
3. `SwipeTeaser` cho thẻ trên cùng (ẩn khi không có thẻ).
4. `SwipeActions`.
- Trạng thái rỗng (`SwipeEmptyState`, props `kind: 'no-places' | 'no-match' | 'finished'`, `isOnline`, `onRestart`): `no-places` (khi `!hasAnyPlace`) → "Chưa có địa điểm nào" + "Thêm địa điểm" (online) → `/places/new`; `no-match` (khi `initialPlaceIds` rỗng) → "Không có địa điểm nào khớp bộ lọc" / "Thử chọn nhóm hoặc nhãn khác."; `finished` (khi không còn thẻ và không có thẻ bay) → "Đã xem hết" / "Bạn đã xem hết các địa điểm trong bộ lọc này." + "Xem lại từ đầu" (`onRestart`). Ở `finished`, hàng nút vẫn hiện để Hoàn tác được.

**`SwipeCard`**: props `place`, `categories` (đã `resolvePlaceCategories`), `role: 'top' | 'second' | 'third' | 'flying'`, `flyDirection: SwipeDirection | null`, `interactive: boolean`, `onRelease: (outcome: 'like' | 'skip' | 'cancel') => void`, `onFlyOutEnd: () => void`.
- Khung tuyệt đối phủ vùng bộ thẻ, bo 28px, `overflow: hidden`, viền 1px `--wtg-border`, bóng `--wtg-shadow-card`; `second`/`third` theo P31, z-index top/flying 50, second 40, third 30; `pointer-events: none` và `aria-hidden="true"` khi không phải `top`. Thẻ `top` có `touch-action: pan-y`.
- Kéo (chỉ khi `role === 'top' && interactive`): `useSwipeGesture`; `onMove` ghi THẲNG vào DOM qua ref (không qua state): `style.transition = 'none'`, `style.transform = cardDragTransform(dx, dy)`, độ mờ 2 dấu theo `stampOpacities(dx)`. `onRelease`: tính `releaseOutcome(dx)`; `cancel` → `style.transition` = `transform ${SNAP_BACK_MS}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`, `style.transform = ''`, dấu về 0; còn lại gọi `onRelease(outcome)`.
- Khi `role === 'flying'`: xoá `style.transform` inline, thêm lớp `wtg-swipe-card--fly-like` hoặc `--fly-skip` (`transform: translate3d(±150%, 40px, 0) rotate(±28deg); opacity: 0; transition: transform 450ms ease-out, opacity 400ms ease-out`), dấu đúng hướng opacity 1. `onTransitionEnd` chỉ xử lý khi `event.target === event.currentTarget && event.propertyName === 'transform'`; thêm `setTimeout(FLY_OUT_FALLBACK_MS)` dự phòng (dọn trong cleanup); cờ ref bảo đảm `onFlyOutEnd` chỉ gọi một lần.
- Nội dung: ảnh bìa (P16; `AuthedImage` 1600 lớp `wtg-swipe-card__photo` phủ kín, `.wtg-swipe-card__photo img` `object-fit: cover`, `alt="Ảnh {tên quán}"` cho `top`, `alt=""` cho thẻ khác); lớp gradient 6.1; dấu "HỨNG THÚ" (trên-trái, xoay −12deg, viền 2px `#34D399`, chữ `#6EE7B7`) và "BỎ QUA" (trên-phải, xoay 12deg, viền 2px `#F43F5E`, chữ `#FB7185`), nền `rgba(12,10,9,0.85)`, 12px 800 hoa, đệm 4px 12px, bo 12px, `aria-hidden="true"`; đáy (đệm 16px): tối đa 2 chip nhóm (chip đầu kiểu nhấn, chip sau thường; 11px, `nowrap`), tên quán (`--wtg-font-display`, 22px, 600, `#FAF7EE`, tối đa 2 dòng), dòng giá (`pricetagOutline` 14px + `formatVndRange`, 12px, 600, `#E8A359`) nếu có, dòng địa chỉ (`locationOutline` 14px + địa chỉ, 12px, `#D6D3D1`, 1 dòng) nếu có.

**`SwipeTeaser`** (props `place`, `categories`, `disabled`, `onOpen`): nút rộng đủ, nền `--wtg-surface`, viền 1px `--wtg-border`, bo 16px, đệm 12px, vạch 2px ở mép trên (gradient trong suốt → `--wtg-accent` 60% → trong suốt). Trái: hàng chip (chip nhấn "★ {rating} · {nhóm đầu}" nếu có rating, không thì "{nhóm đầu}"; `nowrap`, `flex-shrink: 0`) + giá (11px, `--wtg-text-muted`, 1 dòng, "…"); tên (`--wtg-font-display`, 16px, 600, 1 dòng); 1 dòng nghiêng: câu chuyện, không có thì địa chỉ, không có nữa thì bỏ (12px, `--wtg-text-muted`). Phải: vòng 28px viền `--wtg-border` chứa `chevronUpOutline` 14px `--wtg-accent-text` + "THÔNG TIN" (11px, hoa, `--wtg-text-muted`). `aria-label="Xem thông tin nhanh {tên quán}"`. Bấm → `onOpen`. `disabled` khi `busy`.

**`SwipeActions`** (props `canUndo`, `isFavorite`, `busy`, `isOnline`, `hasCard`, `onUndo`, `onSkip`, `onToggleFavorite`, `onLike`, `onInfo`): hàng rộng tối đa 340px căn giữa, `justify-content: space-between`, `gap` ≥ 8px, đệm `6px 16px`; mọi nút `flex-shrink: 0`, tròn, nền `--wtg-surface`. Hoàn tác 44px (`arrowUndoOutline` 22px, viền `--wtg-border`, `aria-label="Hoàn tác"`); Bỏ qua 56px (`closeOutline` 26px `--wtg-pass`, viền `--wtg-pass-border`, `aria-label="Bỏ qua, trừ 1 điểm hứng thú"`); Sao 44px (`star` khi yêu thích, `starOutline` khi không, 22px `--wtg-star`, viền `--wtg-star-border`, `aria-label` "Bỏ khỏi Yêu thích" / "Thêm vào Yêu thích"); Hứng thú 56px (nền gradient `--wtg-like-from` → `--wtg-like-to`, `heart` 26px `#0C0A09`, `aria-label="Hứng thú, cộng 1 điểm"`); Thông tin 44px (`informationCircleOutline` 22px, viền `--wtg-border`, `aria-label="Xem thông tin nhanh"`). Tắt (`disabled`, opacity 0.4): Hoàn tác khi `busy || !isOnline || !canUndo`; Bỏ qua, Sao, Hứng thú khi `busy || !isOnline || !hasCard`; Thông tin khi `!hasCard`. Nhấn: `scale(0.9)`.

`swipe.css` có `@media (prefers-reduced-motion: reduce)` tắt mọi transition/animation của thẻ (bộ điều phối không đặt `flying` khi giảm chuyển động).

### 6.6 Form Thêm/Sửa (`PlaceFormPage.tsx`)

- `buildCreateDefaults` thêm `story: null`, `categoryIds: []`; `buildEditDefaults` thêm `story: place.story`, `categoryIds: place.categoryIds`.
- Nhóm mới "Nhóm *" ngay TRƯỚC nhóm hiện là "Loại": `Controller name="categoryIds"` → `CategoryPicker`; dưới là dòng lỗi cùng kiểu dòng lỗi của Ghi chú khi `formState.errors.categoryIds`.
- Đổi tiêu đề "Loại" thành "Nhãn".
- Nhóm mới "Câu chuyện" ngay SAU nhóm "Ghi chú": cùng cấu trúc với Ghi chú (`IonTextarea autoGrow`, hằng `STORY_MAX_LENGTH = 5000`, `counter`, rỗng → null, dòng lỗi).
- Sau khi xoá: `navigate('/home', { replace: true })`.
- File đã dài (673 dòng); phần 1 chỉ thêm 2 nhóm trường (~40 dòng), chấp nhận và ghi ở mục 11 là nợ cần tách ở phần sau.

**`CategoryPicker`** (props `value: string[]`, `onChange: (ids: string[]) => void`): `ToggleChip` cho từng nhóm (P19, icon nhóm) + chip hành động "＋ Nhóm mới" (giống chip "Nhãn mới": không ẩn khi offline) mở `useIonAlert` một ô tên (maxlength 50, placeholder "Tên nhóm"); `validateName(tên, tên các nhóm, { maxLength: 50 })`; hợp lệ → `useCreateCategory().mutateAsync({ name, prompt: null, icon: null })` → thêm id vào `value`; lỗi → alert "Không thể tạo nhóm" với `nameErrorMessage(kind, 'nhóm', 50)` (lỗi kiểm tên) hoặc `toUserMessage(error)` (lỗi ghi, kể cả `OfflineError`).

### 6.7 Trang chi tiết (`PlaceDetailPage.tsx`)

- `defaultHref` → `/home` (3 chỗ); nút "Mở Google Maps" dùng `openMapsLink`; "Cách bạn …" dùng `usePlaceDistance(place, true)` (bỏ phần tính tại chỗ và import không còn dùng).
- Header: `IonButtons slot="end"` nút sao (vùng 44px, `star`/`starOutline` 24px, `aria-label` "Bỏ khỏi Yêu thích" / "Thêm vào Yêu thích", ẩn khi offline) → `useSetFavorite`; thành công toast "Đã thêm vào Yêu thích" / "Đã bỏ khỏi Yêu thích" (1500ms), lỗi toast `toUserMessage` (2500ms, `danger`).
- Ngay trên hàng nhãn hiện có: hàng tên nhóm (`useCategories()` + `resolvePlaceCategories`) bằng `IonBadge color="primary"`.
- Nhóm mới "Câu chuyện" ngay trước nhóm "Ghi chú": tiêu đề `wtg-group-title`, nội dung `wtg-caption` với `white-space: pre-line`, hoặc "Chưa có câu chuyện.".

### 6.8 Quản lý nhóm

**`ManageCategoriesPage.tsx`** (`/settings/categories`): header `IonBackButton defaultHref="/settings" text="Cài đặt"`, tiêu đề "Quản lý nhóm", `IonButtons slot="end"` nút "Thêm" (`addOutline`, `aria-label="Thêm nhóm"`, ẩn khi offline) mở sheet tạo. Danh sách `IonItemSliding` theo P19: biểu tượng nhóm, tên, dòng phụ "{n} địa điểm · {câu gợi ý, hoặc 'Câu gợi ý mặc định'}". Bấm mục → sheet sửa (offline: `button={false}`, không mở). Tuỳ chọn trượt "Xoá" (danger, ẩn khi offline) theo P18: còn quán chỉ thuộc nhóm → alert "Không xoá được nhóm" / "{n} địa điểm chỉ thuộc nhóm này. Hãy chuyển chúng sang nhóm khác trước." / ["Đóng"]; không thì alert "Xoá nhóm" / "Nhóm sẽ bị gỡ khỏi {n} địa điểm." / ["Huỷ", "Xoá" (destructive)] → `useDeleteCategory`, lỗi → alert "Lỗi" + `toUserMessage`. Rỗng: "Chưa có nhóm nào.".

**`CategoryEditorSheet.tsx`** (props `isOpen`, `category: Category | null` (null = tạo), `categories: Category[]`, `onDidDismiss`): `IonModal` `breakpoints` [0, 1], `initialBreakpoint` 1, `ref` để gọi `dismiss()`; chỉ mount `CategoryEditorForm` khi `isOpen`, với `key={category?.id ?? 'new'}` (form mới mỗi lần mở, không dùng effect để reset); `onDone` của form gọi `dismiss()`.

**`CategoryEditorForm.tsx`** (props `category`, `categories`, `onDone`): `react-hook-form` + `zodResolver(categoryFormSchema)`, `defaultValues` từ `category` (tạo: tên rỗng, prompt null, icon null). Toolbar trên cùng: trái "Huỷ" (`onDone`), giữa "Nhóm mới" / "Sửa nhóm", phải "Lưu" (đậm, `disabled={!isOnline || isSubmitting}`). Trường: `IonInput label="Tên" labelPlacement="stacked"` (maxlength 50); `IonInput label="Câu gợi ý" labelPlacement="stacked"` (maxlength 120, placeholder P3); "Biểu tượng": tiêu đề `wtg-group-title` + lưới 5 cột: ô "Mặc định" (giá trị null, `DEFAULT_CATEGORY_ICON`, `aria-label="Mặc định"`) + 20 ô P2 (`aria-label` = `CATEGORY_ICON_LABELS`), mỗi ô 44×44, `aria-pressed`, ô đang chọn viền 2px `--ion-color-primary`. Lỗi ngay dưới trường (kiểu repo). Trùng tên: `validateName` với tên các nhóm khác (`excludeName` = tên hiện tại khi sửa) → lỗi dưới ô tên bằng `nameErrorMessage('duplicate', 'nhóm', 50)`. Lưu → `useCreateCategory`/`useUpdateCategory` → `onDone`; lỗi → alert "Lỗi" + `toUserMessage`.

### 6.9 Truy cập (a11y)

Theo PLAN.md 6.8: vùng bấm ≥ 44px; cỡ chữ ≥ 11px (P36); tương phản theo bảng 6.1; mọi nút chỉ có icon có `aria-label` tiếng Việt; icon trang trí `aria-hidden="true"`; ảnh trang trí `alt=""`; giảm chuyển động theo `prefers-reduced-motion`.

---

## 7. Offline (giữ D13)

- **Ẩn khi offline**: nút ＋ (trang chủ, danh sách), nút sao (chi tiết), nút Thêm và tuỳ chọn Xoá (Quản lý nhóm).
- **Tắt khi offline**: nút Lưu của form nhóm; mục nhóm (không mở sheet sửa); trên trang vuốt thẻ: cử chỉ kéo và các nút Hoàn tác/Bỏ qua/Sao/Hứng thú (nút Thông tin vẫn dùng được); hiện `OfflineBanner`.
- **Không ẩn nhưng báo lỗi** (giữ hành vi cũ của "Nhãn mới"): chip "＋ Nhóm mới" → `OfflineError` → alert "Không thể tạo nhóm".
- Mọi hàm ghi mới gọi `assertOnline()`.

---

## 8. Build và PWA

1. `package.json`: `version` "0.2.0"; `dependencies` thêm `"@fontsource-variable/fraunces": "^5.3.0"`, `"@fontsource-variable/plus-jakarta-sans": "^5.3.0"`; script `"check:size": "node scripts/check-precache-size.mjs"`. Chạy `npm install` để cập nhật `package-lock.json`.
2. `vite.config.ts`: `build.rollupOptions.output.manualChunks(id)` (so sau khi đổi `\` thành `/`) trả `'ionic'` khi đường dẫn chứa `/node_modules/@ionic/`, `/node_modules/@stencil/` hoặc `/node_modules/ionicons/`; `'react'` cho `/node_modules/react/`, `/node_modules/react-dom/`, `/node_modules/react-router/`, `/node_modules/react-router-dom/`, `/node_modules/@remix-run/`, `/node_modules/scheduler/`; `'supabase'` cho `/node_modules/@supabase/`; `'query'` cho `/node_modules/@tanstack/` và `/node_modules/idb-keyval/`; `'forms'` cho `/node_modules/zod/`, `/node_modules/react-hook-form/`, `/node_modules/@hookform/`; còn lại `undefined`. `workbox.maximumFileSizeToCacheInBytes: 2 * 1024 * 1024`. Cập nhật JSDoc đầu file.
3. `scripts/check-precache-size.mjs` (chỉ thư viện có sẵn của Node, chạy trong thư mục `web/`): duyệt đệ quy `dist/`, xét file đuôi `js, css, html, svg, png, ico, woff2`, in 5 file lớn nhất kèm kích thước; có file > 2 097 152 byte → in tên và thoát mã 1; không thì 0. Kiểm bằng cách chạy tay một lần.
4. `.github/workflows/ci.yml` job `web`: thêm bước `- run: npm run check:size` sau `npm run build`.

---

## 9. Jobs

- `supabase_admin.py`: `select_all(self, table: str, columns: str = "*", order: str | None = None)` — khi có `order`, thêm `"order": order` vào `params` (phân trang ổn định). Cập nhật docstring.
- `backup.py`: `_TABLES` thêm `"categories", "place_categories", "swipe_events"` (sau `"visits"`); thêm `_TABLE_ORDER: dict[str, str]` = `places: "id"`, `tags: "id"`, `place_tags: "place_id,tag_id"`, `photos: "id"`, `visits: "id"`, `categories: "id"`, `place_categories: "place_id,category_id"`, `swipe_events: "id"`; `_export_tables` gọi `admin.select_all(table, order=_TABLE_ORDER[table])`.
- `jobs/tests/test_backup.py`: `_TABLES` giống `backup.py`.
- `jobs/tests/test_supabase_admin.py` (mới, respx): `select_all` gửi tham số `order` khi có, không gửi khi không có; phân trang 2 trang (1000 + 1 dòng) gửi `Range: 0-999` rồi `1000-1999`.

---

## 10. Kiểm thử

| File | Nội dung chính |
|---|---|
| `lib/supabaseResult.test.ts` | `unwrap` trả data; lỗi → `ApiError`; `assertNoError` tương tự |
| `shared/random/shuffle.test.ts` | Đủ phần tử, không đổi mảng gốc; `pickRandom` rỗng → undefined; `createRandomSeed(() => 0.5) === 2147483648`; `createSeededRandom`: cùng seed cùng dãy, seed 1 và 2 khác dãy, seed 3000000000 và 3000000001 khác dãy, giá trị trong [0, 1) |
| `shared/text/nameValidation.test.ts` | ok (đã trim), empty, too_long, duplicate (khác dấu/hoa vẫn trùng), `excludeName`; câu lỗi cho "nhãn" giống hệt câu cũ |
| `features/places/placeSchema.test.ts` | `categoryIds` rỗng → "Chọn ít nhất một nhóm"; `story` > 5000 → lỗi; hợp lệ qua (UUID sinh bằng `crypto.randomUUID()`) |
| `features/places/placeFilters.test.ts` | Fixture `makePlace` thêm trường mới; lọc `categoryIds` (HOẶC), `favoritesOnly`, tìm theo `story`; không truyền 2 trường mới thì như cũ |
| `features/places/placeCache.test.ts` | `patchPlace` chỉ đổi đúng id, trả mảng mới, `undefined` giữ nguyên; `withInterestDelta`, `withFavoritedAt` |
| `features/places/placeDisplay.test.ts` | `getCoverPhoto` (rỗng → null, chọn position nhỏ nhất); `limitChips` |
| `features/categories/categoryIcons.test.ts` | Mỗi khoá có icon và nhãn; khoá lạ/null → mặc định; prompt null → mặc định |
| `features/categories/categorySchema.test.ts` | Tên rỗng/quá dài (câu lỗi từ `nameErrorMessage`); prompt toàn khoảng trắng → null; prompt > 120; icon ngoài danh sách |
| `features/categories/categoryRules.test.ts` | Đếm; sắp P19 và P20 (kể cả hoà); 5 ảnh mới nhất; quán chỉ thuộc một nhóm; `resolvePlaceCategories` (thứ tự, bỏ id lạ) |
| `features/home/dailyPick.test.ts` | Rỗng → null; cùng store giữ cùng quán; quán bị xoá → bốc lại |
| `features/swipe/swipeMotion.test.ts` | 95 → cancel, 96 → like, −96 → skip; độ mờ dấu; chuỗi transform; delta |
| `features/swipe/swipeDeck.test.ts` | Cùng ids + cùng seed → cùng thứ tự bất kể thứ tự đầu vào; 2 seed nguyên khác nhau → thứ tự khác (≥ 6 id); `applySwipe` bỏ qua eventId trùng và placeId lạ; `revertEntry` chỉ khi là mục cuối; `upcomingIds` bỏ id không còn; `remainingCount` |
| `features/auth/avatarInfo.test.ts` | `avatar_url` → `picture` → null; chữ cái đầu theo thứ tự; user null |

Python: `pytest -q jobs/tests` (test backup cập nhật + `test_supabase_admin.py`).

---

## 11. Rủi ro

| Rủi ro | Cách xử lý |
|---|---|
| Vuốt thẻ từ mép trái vẫn kích hoạt vuốt-quay-lại | GATE C. Lỗi thì quay lại PLAN (dự phòng: tắt `swipeGesture` của outlet khi ở `/swipe`) |
| Tên nhãn cũ trong DB khác bảng ánh xạ | Phần TRƯỚC của file kiểm tra; khác thì dừng ở GATE A |
| Migration làm hỏng dữ liệu | Sao lưu tay trước (GATE A); migration 1 chỉ thêm; xoá nhãn để ở migration 2 |
| `insertSwipeEvent` thành công ở server nhưng mất phản hồi | Chấp nhận: điểm trên máy lệch tới lần tải lại kế tiếp |
| Lỗi chia chunk chỉ lộ ở bản production | Bước kiểm `npm run preview`; build in cảnh báo "Circular chunk" thì quay lại PLAN |
| File JS vẫn > 2 MiB | `npm run build` hoặc `check:size` báo; quay lại PLAN |
| `PlaceFormPage.tsx` dài 700+ dòng | Nợ kỹ thuật, tách ở phần sau |
| `theme-color` của app lệch nhẹ với nền mới | Chấp nhận ở phần 1 |

---

## IMPLEMENTATION CHECKLIST

**A. Cơ sở dữ liệu** (chạy TRƯỚC khi push code web lên `main`)
1. Tạo `supabase/migrations/20261016000100_categories_swipes_favorites_story.sql` theo mục 2.1.
2. Tạo `supabase/migrations/20261016000200_drop_legacy_tags.sql` theo mục 2.2.
3. Tạo `supabase/checks/20261016000100_verify.sql` theo mục 2.3.
4. `docs/SETUP.md`: Bước 5 thêm dòng 5 (migration 1) và dòng 6 (migration 2, ghi "chỉ chạy sau khi bản web mới đã lên"); thêm mục "Nâng cấp giao diện phần 1 (dữ liệu đã có)": (a) chạy tay workflow `backup` trên GitHub Actions và xác nhận có file sao lưu hôm nay trên Drive; (b) chạy phần TRƯỚC của file kiểm tra; (c) chạy migration 1 đúng một lần (nếu SQL Editor cảnh báo thao tác xoá trigger thì chọn chạy); (d) chạy phần SAU-1; (e) sau khi bản web mới đã lên và thử xong: chạy migration 2 rồi phần SAU-2; kèm kết quả mong đợi từng phần.
5. `[USER][GATE A]` Làm (a)–(d), gửi kết quả; Claude đối chiếu với mong đợi.

**B. Gom code dùng chung**
6. Tạo `lib/supabaseResult.ts` + test; `lib/onlineGuard.ts`.
7. Sửa 4 repository và 3 service theo mục 4.1 (xoá bản riêng, sửa import đúng danh sách); xoá JSDoc lỗi thời ở `tagRepository.ts` và sửa JSDoc `seedDefaultTags` (mục 4.10).
8. Tạo `shared/random/shuffle.ts` + test.
9. Tạo `shared/text/nameValidation.ts` + test.
10. Tạo `shared/hooks/usePrefersReducedMotion.ts`.
11. Tạo `shared/components/ToggleChip.tsx`.
12. Sửa `TagPicker.tsx`, `TagFilterBar.tsx` (dùng `ToggleChip`); `TagPicker.tsx` và `ManageTagsPage.tsx` (dùng `nameValidation`, giữ câu lỗi và hành vi); `ManageTagsPage.tsx` (`defaultHref="/settings"`).
13. Chuyển `OpenStatus`, `OPEN_STATUS_LABELS` sang `openingHours.ts`; sửa `OpeningHoursView.tsx`.

**C. Dữ liệu địa điểm**
14. Sửa `types.ts` (mục 4.2).
15. Sửa `placeSchema.ts`; tạo `placeSchema.test.ts`.
16. Sửa `photoRepository.ts` (thêm `created_at`).
17. Sửa `placeRepository.ts` (mục 4.3).
18. Sửa `placeService.ts` (mục 4.4).
19. Tạo `placeCache.ts` + test; sửa `placeQueries.ts` (mục 4.5).
20. Sửa `placeFilters.ts` + `placeFilters.test.ts` (mục 4.6).
21. Tạo `placeDisplay.ts` + test, `openMapsLink.ts`, `usePlaceDistance.ts` (mục 4.7).

**D. Nhóm (dữ liệu)**
22. Tạo `categoryIcons.ts` + test.
23. Tạo `categorySchema.ts` + test.
24. Tạo `categoryRepository.ts`, `categoryQueries.ts`.
25. Tạo `categoryRules.ts` + test.

**E. Đăng nhập, seed, avatar**
26. Sửa `AuthProvider.tsx` (mục 4.10).
27. Tạo `avatarInfo.ts` + test, `UserAvatar.tsx`, `AvatarButton.tsx`.
28. Tạo `shared/components/OfflineIndicator.tsx`.

**F. Theme, phông, build**
29. Sửa `web/package.json` (mục 8.1); chạy `npm install` trong `web/`.
30. Sửa `theme/fonts.css`; tạo `theme/themes.css` (mục 6.1, 6.2); sửa `main.tsx`.
31. Sửa `vite.config.ts` (mục 8.2); tạo `scripts/check-precache-size.mjs` (mục 8.3); sửa `ci.yml` (mục 8.4).

**G. Danh sách tạm và nhóm (giao diện)**
32. Sửa `PlaceListPage.tsx` (mục 5).
33. Tạo `CategoryPlacesPage.tsx` (mục 5).
34. Tạo `CategoryPicker.tsx` (mục 6.6), `CategoryFilterBar.tsx` (mục 6.5).
35. Tạo `CategoryEditorForm.tsx`, `CategoryEditorSheet.tsx`, `ManageCategoriesPage.tsx` (mục 6.8).

**H. Bảng trượt lên**
36. Tạo `placeInfoSheet.css`, `PlaceStoryBlock.tsx`, `PlaceInfoHeader.tsx`, `PlaceInfoSheet.tsx` (mục 6.4).

**I. Trang chủ**
37. Tạo `home/dailyPick.ts` + test.
38. Tạo `home/home.css` (mục 6.3).
39. Tạo `PhotoCluster.tsx`, `HomeCardLayout.tsx`, `CategoryCard.tsx`, `NearbyCard.tsx`, `DailyPickCard.tsx`.
40. Tạo `HomeHeader.tsx`, `HomeDock.tsx`, `HomePage.tsx`.

**J. Trang vuốt thẻ**
41. Tạo `swipe/swipeMotion.ts` + test, `swipe/swipeDeck.ts` + test.
42. Tạo `swipe/swipeRepository.ts`, `swipe/swipeQueries.ts`.
43. Tạo `swipe/useSwipeGesture.ts`, `swipe/useSwipeDeckController.ts` (mục 4.9).
44. Tạo `swipe/swipe.css` (mục 6.5).
45. Tạo `SwipeCard.tsx`, `SwipeTeaser.tsx`, `SwipeActions.tsx`, `SwipeEmptyState.tsx`.
46. Tạo `SwipeDeckView.tsx`, `SwipePage.tsx`.

**K. Trang cũ và điều hướng**
47. Sửa `PlaceDetailPage.tsx` (mục 6.7).
48. Sửa `PlaceFormPage.tsx` (mục 6.6).
49. Sửa `SettingsPage.tsx` (mục 5).
50. Sửa `App.tsx` (mục 5); xoá `Tabs.tsx`; sửa comment cuối `theme/global.css`.

**L. Jobs**
51. Sửa `supabase_admin.py`, `backup.py`, `test_backup.py`; tạo `test_supabase_admin.py` (mục 9).

**M. Kiểm tra và bàn giao**
52. Trong `web/`: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` (không có cảnh báo "Circular chunk"), `npm run check:size` đều đạt; ở gốc repo: `pytest -q jobs/tests` xanh.
53. `npm run preview` trong `web/`: mở bằng Browser pane, trang đăng nhập hiện đúng, console không lỗi, phông tải được.
54. `[USER][GATE B]` Claude chạy dev server `web-dev` (cổng 5173) và mở trong Browser pane; user tự đăng nhập Google trong cửa sổ đó (Claude không nhập thông tin đăng nhập). Claude kiểm ở cỡ di động, sáng và tối: trang chủ, Search/thẻ nhóm/tim/Gần tôi, trang vuốt thẻ (kéo bằng chuột, các nút, bảng trượt lên, hết thẻ), form (bắt buộc nhóm, câu chuyện), chi tiết (sao, nhóm, câu chuyện), Quản lý nhóm (thêm/sửa, xoá bị chặn); chụp ảnh màn hình. Vì dev server dùng DB thật: mỗi lượt vuốt thử phải Hoàn tác ngay, sao bật rồi tắt lại, nhóm tạo thử phải xoá đi, không sửa/xoá quán thật.
55. Cập nhật `docs/UI-REDESIGN.md` (mục 4: phần 1 đã làm, link tới file này) và `docs/PLAN.md` (dòng D14, D15 ghi "đã thay bằng UI-REDESIGN.md, 2026-10"; mục 7 ghi "Đọc 8 bảng: places, tags, place_tags, photos, visits, categories, place_categories, swipe_events").
56. Quét bí mật trong mọi file đã đổi, rồi `git add` đúng các đường dẫn ở mục 3 (không gồm `stitch_web_page_builder.zip`, `img/`, `.claude/`); báo danh sách file và gợi ý message commit. User tự commit và push.
57. `[USER][GATE C]` Sau khi CI và deploy xanh, thử trên iPhone (app đã cài): trang chủ sáng/tối, avatar Google, "Hôm nay thử quán này" + bảng trượt lên + "Chỉ đường"; trang vuốt thẻ: kéo từ giữa và **từ sát mép trái** (không được quay về trang chủ), bấm nhanh liên tiếp không ghi hai lần, Hứng thú/Bỏ qua/Sao/Hoàn tác, mở "Xem đầy đủ" rồi quay lại vẫn giữ vị trí, về trang chủ rồi vào lại thì bộ thẻ xáo lại, offline thì bị khoá; form bắt buộc chọn nhóm; Quản lý nhóm; danh sách tạm. Báo kết quả từng mục.
58. `[USER][GATE D]` Chạy migration 2 rồi phần SAU-2 của file kiểm tra (SETUP.md bước (e)), gửi kết quả; Claude đối chiếu.

---

## 12. Điều chỉnh sau REVIEW (2026-10-17)

REVIEW ngày 2026-10-17 đối chiếu code của commit `ff25e89` với kế hoạch này và ghi nhận 40 lệch (#1–#40). Mục này **thay thế hoặc bổ sung** các câu tương ứng ở các mục trên; chỗ nào khác nhau thì theo mục 12.

### 12.1 Chấp nhận theo code

| # | Mục plan | Code làm gì | Lý do |
|---|---|---|---|
| 1 | 2.1.F | `apply_swipe_event_to_score` có thêm `return null;` ở cuối hàm | Lối thoát an toàn của plpgsql; migration đã chạy nên không sửa |
| 2 | 2.3 | Phần quyền in đủ 4 quyền cho cả `service_role` | File đã dùng ở GATE A, kết quả đã đối chiếu |
| 3 | 2.3 | Kiểm `prosecdef` của 3 hàm (thêm `seed_default_tags`) | Chặt hơn plan, vô hại |
| 4 | 2.3 | `lech_user`, `lech_diem`, `nhan_cu_con_lai` đếm toàn bảng, không `group by user_id` | Kiểm toàn vẹn, mong đợi 0; tách theo user không thêm thông tin |
| 8 | 4.3 | `replaceJoinRows` lọc `id !== undefined` sau `row[column]` | Bắt buộc do `noUncheckedIndexedAccess` |
| 10 | 4.10 | `getAvatarInfo` cắt khoảng trắng trước khi xét rỗng | Tên toàn khoảng trắng hiện "?" |
| 12 | 4.9 | `busy` dùng `flyingCard` (thẻ đang bay mà quán còn tồn tại); trả `flying: { place, direction } \| null` thay cho `flyingPlace` | Không kẹt trạng thái bận khi quán bị xoá lúc thẻ đang bay; `SwipeDeckView` cần biết hướng bay |
| 13 | 4.9 | `upcoming` lấy 4 id, bỏ id của thẻ đang bay, cắt còn 3 | Không trùng `key` khi ghi lỗi lúc thẻ đang bay |
| 14 | 6.5 SwipeCard | Khi bắt đầu bay, xoá cả `transition` inline | Thiếu thì sau khi kéo, lớp `--fly-*` không chạy hiệu ứng |
| 15 | 6.5, P31 | `.wtg-swipe-card` có `transition: transform 300ms ease, opacity 300ms ease` | Thẻ 2 lên thay thẻ 1 mượt; đã qua GATE C |
| 16 | 6.5 | Khối giảm chuyển động tắt cả transition của `.wtg-swipe-action` | Theo mục 6.9 |
| 19 | 6.5 Header | `.wtg-swipe-title__sub` có `letter-spacing: 0.08em`; nút quay lại có `margin-left: 8px` | Plan không quy định; đã qua GATE C |
| 20 | 6.5 SwipeCard | Dấu HỨNG THÚ/BỎ QUA cách mép 20px, `letter-spacing: 0.06em` | Như #19 |
| 21 | 6.5 SwipeEmptyState | Icon `mapOutline` / `searchOutline` / `albumsOutline`; `no-places` có câu phụ "Bắt đầu lưu lại những nơi bạn muốn nhớ." | `EmptyState` bắt buộc `icon` và `message` |
| 23 | 6.4 | Không có giá mà có khoảng cách thì dòng giá chỉ là "cách bạn X" | Plan không nói trường hợp thiếu giá |
| 24 | 6.4 | Hàng địa chỉ và huy hiệu giờ mở cửa nằm dưới cả cụm ảnh + cột, rộng hết bảng | Câu plan mơ hồ; đã qua GATE B/C |
| 27 | 6.3 | Keyframes tên `wtg-fade-in-up`, `wtg-fab-breathing` | Theo quy ước tiền tố `wtg-`, tránh trùng tên toàn cục |
| 28 | 6.1 | `themes.css` có luật dùng chung `.wtg-avatar-button`, `.wtg-chip`, `.wtg-chip--accent` | Dùng ở 3 nơi (DRY) |
| 30 | 6.3 HomeHeader | `.wtg-home-header-end` có gap 14px, `padding-right: 8px`; nút tim `margin: 0` | Plan không quy định |
| 31 | 6.3 HomePage | Thẻ "Chưa có nhóm nào": icon `addCircleOutline`, `aside={null}`, `ariaLabel` "Chưa có nhóm nào. Tạo nhóm để sắp xếp địa điểm", `cascadeIndex={1}` | `HomeCardLayout` bắt buộc các prop này |
| 32 | 6.3 NearbyCard | `ariaLabel="Gần tôi"` | Như #31 |
| 33 | 5 PlaceListPage | Có `emptyTitle` mà thiếu `emptyMessage` thì dùng `''` | `EmptyState` bắt buộc `message` |
| 34 | 6.7 | Hàng tên nhóm ẩn khi quán không có nhóm | Giống cách hàng nhãn đang làm |
| 36 | 3 | Commit `ff25e89` có thêm `docs/PLAN-UI-1.md` | User yêu cầu |
| 37 | Bước 50 | Việc xoá `Tabs.tsx` được stage ngay bằng `git rm --cached` | Đã commit, không còn gì để làm |
| 38 | Bước 53 | `.claude/launch.json` có thêm cấu hình `web-preview` (cổng 4173) | Dùng để kiểm bản production; không commit |

### 12.2 Đã sửa code

| # | Mục plan | Đã sửa |
|---|---|---|
| 5, 6 | Bước 4 | SETUP.md mục (d) ghi đủ cách gán nhóm của K.1–K.3 và liệt kê đủ 13 cột của trigger |
| 7 | 4.5 | Tạo `places/queryKeys.ts` giữ `QUERY_KEYS`; `placeCache.ts` và mọi nơi khác import từ đây, hết import vòng |
| 9 | 4.8, 7 | `seedDefaultCategories` gọi `assertOnline()` |
| 11 | 4.10 | Viền avatar là `border` 1px nằm trong khung 28px (`box-sizing: border-box`) |
| 17 | 6.1, 6.5 | Chip trên ảnh thẻ vuốt có màu cố định ở cả hai chế độ: chip thường nền `rgba(20, 20, 19, 0.7)`, chữ `#FAF7EE`; chip nhấn nền `#E8A359`, chữ `#0C0A09` |
| 18 | P29 | Hàng lọc trên trang vuốt thẻ bỏ đệm dọc, mỗi hàng 52px |
| 22 | 6.4 | Ảnh bìa trong bảng trượt lên phủ kín ô 80×80 (`.wtg-info-photo__media`) |
| 25, 40 | 6.9 | Icon tim (`HomeHeader`) và icon sao (`PlaceDetailPage`) có `aria-hidden="true"` |
| 26 | 6.3, 6.5 | Thứ tự trạng thái khi chưa có dữ liệu: offline → đang tải → lỗi (`HomePage`, `SwipePage`) |
| 29 | 6.1, P37 | `--ion-color-primary` = `var(--wtg-accent)`, `--ion-color-medium` = `var(--wtg-text-muted)` |
| 35 | Quy ước Prettier | Đã chạy Prettier trên các file web của phần 1 |
| 39 | Bước 54 | Claude kiểm ở cỡ di động, sáng và tối, có ảnh chụp (GATE sau REVIEW) |
| 41 | 4.1, P29 | Chip trong `.wtg-chip-row` không co (`flex-shrink: 0`), chữ không còn xuống 2 dòng; phát hiện ở GATE sau REVIEW |

### 12.3 Thay cho các câu ở trên

- **P29:** bộ thẻ `clamp(280px, 44vh, 380px)`. Tổng chiều cao trang vuốt = header 44 + 2 hàng lọc 104 (mỗi hàng 52 = chip 44 + lề trên/dưới 4) + dòng "Còn N" ~14 + 3 khoảng cách 8 + teaser ~88 + hàng nút 68 + đệm đáy 8. Số đo thật (Chromium giả lập, 2026-10-17): header 50, hai hàng lọc 52 + 52, dòng "Còn N" 16,5, teaser 92,6, hàng nút 68; bộ thẻ 293,6px ở 375×667 (bằng `44vh`) và 380px ở 428×926.
- **Mục 3.1 và 4.5:** thêm file `web/src/features/places/queryKeys.ts` (`QUERY_KEYS`); `placeQueries.ts`, `placeCache.ts`, `tagQueries.ts`, `categoryQueries.ts`, `visitQueries.ts`, `AuthProvider.tsx`, `HomePage.tsx`, `PlaceFormPage.tsx` import từ file này.
- **Mục 4.1:** lớp `.wtg-chip-row` (`theme/global.css`: flex, gap 8px, cuộn ngang, đệm `8px 0`) dùng cho `TagFilterBar` và `CategoryFilterBar`; trang vuốt thẻ bỏ đệm dọc của lớp này (`.wtg-swipe-filters .wtg-chip-row`). Chip trong hàng không co (`flex-shrink: 0`).
