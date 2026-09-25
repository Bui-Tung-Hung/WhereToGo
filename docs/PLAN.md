# KẾ HOẠCH TRIỂN KHAI WHERETOGO — v1

Ngày: 2026-09-24. Thư mục gốc: `D:\Projects\WhereToGo` (đang trống, chưa là git repo).
Quy ước: `[USER]` = bước chỉ người dùng làm được (tài khoản, khoá bí mật, thao tác trên iPhone). `[GATE]` = điểm dừng, chờ người dùng xác nhận mới làm tiếp. Mọi mục ghi `MẶC ĐỊNH` là giá trị tôi tự đặt thay cho các câu user trả lời "sửa sau"; đổi được mà không ảnh hưởng kiến trúc.

---

## 0. Bảng quyết định

| # | Hạng mục | Quyết định |
|---|---|---|
| D1 | Kiểu app | PWA cài qua Safari "Thêm vào MH chính"; chạy cả trên trình duyệt PC |
| D2 | Frontend | React 19 + TypeScript 6.0.x + Vite 7.x + Ionic React 9 (mode `ios` cho mọi nền tảng) |
| D3 | Router | `IonReactHashRouter` (URL dạng `/WhereToGo/#/...`) — tránh lỗi basename của Ionic và không cần mẹo 404.html trên GitHub Pages |
| D4 | Dữ liệu | Supabase (Postgres + Auth Google + RLS), region Singapore |
| D5 | Luồng đăng nhập | supabase-js `flowType: 'pkce'`, `redirectTo` = gốc app; xin thêm scope `drive.file`, `access_type=offline`, `prompt=consent` |
| D6 | Ảnh gốc | Upload thẳng từ trình duyệt lên Google Drive của user (resumable upload qua XHR), thư mục "WhereToGo Photos" |
| D6b | Ảnh HEIC | Nếu file được chọn là HEIC/HEIF (iOS không tự đổi), app tự chuyển sang JPEG chất lượng 0.92 ở ĐỦ độ phân giải trước khi upload (Drive không tạo ảnh xem trước cho HEIC). Trình duyệt không đọc được HEIC (ví dụ Chrome trên Windows) → báo lỗi, không upload. Chỉ nhận JPEG/PNG/WebP/HEIC/HEIF |
| D7 | Ảnh hiển thị | MẶC ĐỊNH: server Python lấy ảnh thu nhỏ của Drive (`=s400` cho danh sách, `=s1600` cho chi tiết) rồi trả về; app lưu tạm vào Cache Storage để lần sau nhanh và xem được offline. Ảnh gốc mở bằng nút "Mở trong Google Drive" |
| D8 | Server nhỏ | Python 3.12 + FastAPI trên Vercel Hobby, region `sin1`, dự án Vercel đặt Root Directory = `server` |
| D9 | Token Google | Refresh token Google mã hoá Fernet, lưu bảng `google_credentials` (chỉ secret key đọc được); server tự gia hạn access token |
| D10 | Link rút gọn | Server Python đi theo redirect thủ công, chỉ cho phép domain Google |
| D11 | Hosting web | GitHub Pages (repo public `WhereToGo`), deploy bằng GitHub Actions |
| D12 | Việc định kỳ | GitHub Actions + Python: giữ Supabase hoạt động (hằng ngày), sao lưu JSON lên Drive (hằng tuần, giữ 8 bản) |
| D13 | Offline | Chỉ xem: TanStack Query lưu cache vào IndexedDB (7 ngày). Khi offline: ẨN nút ＋, "Sửa", "Thêm lần đi", thao tác vuốt để xoá; nút "Lưu" trong form bị khoá |
| D14 | Giao diện | "Đơn giản mà sang trọng": trắng ngà/đen than/vàng đồng, tiêu đề Playfair Display, nội dung Be Vietnam Pro, không đổ bóng, viền mảnh |
| D15 | Điều hướng | 3 tab: Khám phá · Gần tôi · Cài đặt; nút tròn ＋ để thêm địa điểm |
| D16 | Trạng thái | MẶC ĐỊNH: 3 trạng thái loại trừ nhau: Hứng thú / Chưa đi / Đã đi; mặc định khi tạo = Chưa đi; thêm một lần đi → tự chuyển "Đã đi"; xoá lần đi KHÔNG tự đổi trạng thái (chỉ đổi thủ công trong form) |
| D17 | Lần đi | MẶC ĐỊNH: mỗi lần đi gồm ngày + ghi chú (≤500 ký tự) |
| D18 | Giờ mở cửa | MẶC ĐỊNH: bảng tuần T2–CN, mỗi ngày tối đa 3 khung giờ, chọn giờ bằng bánh xe (bước 5 phút), có "Mở 24h", "Áp dụng cho cả tuần", "Chưa rõ giờ"; đóng cửa sau nửa đêm được hiểu là qua ngày hôm sau |
| D19 | Lọc theo loại | MẶC ĐỊNH: chọn nhiều nhãn = hiện địa điểm có ÍT NHẤT MỘT nhãn đã chọn |
| D20 | Giá | 2 số nguyên VNĐ (từ/đến), hiển thị `150.000 ₫ – 300.000 ₫` |
| D21 | Dán link Maps | Chỉ điền tên nếu ô tên đang trống; luôn điền toạ độ, link, mã địa điểm |
| D22 | Địa chỉ | Nhập tay (không tự suy từ GPS — dữ liệu OSM ở VN không ổn định) |
| D23 | Ảnh / địa điểm | MẶC ĐỊNH: tối đa 20 ảnh, mỗi file ≤ 25 MB. Chọn vượt số chỗ còn lại → chỉ upload đủ số ảnh còn chỗ (theo thứ tự chọn), phần dư báo lỗi "Chỉ thêm được N ảnh (giới hạn 20 ảnh/địa điểm)" |
| D25 | Nút "Dùng vị trí hiện tại" | Luôn ghi đè toạ độ đang có, không hỏi lại |
| D26 | Python trên máy bạn | Code server/jobs viết tương thích Python ≥ 3.10 (máy bạn đang có 3.10); Vercel và CI chạy 3.12 |
| D24 | Khoá đăng ký | Sau khi user đăng nhập lần đầu thành công, tắt "Allow new users to sign up" trong Supabase để chỉ mình user dùng được |

---

## 1. Kiến trúc & luồng dữ liệu

Thành phần:
1. **Web app** (`web/`) — GitHub Pages: `https://<github-user>.github.io/WhereToGo/`.
2. **API** (`server/`) — Vercel: `https://<vercel-project>.vercel.app/api/...`.
3. **Supabase** — Postgres + Auth + PostgREST.
4. **Google Drive** của user — ảnh gốc + file sao lưu.
5. **Jobs** (`jobs/`) — GitHub Actions theo lịch.

Luồng chính:
- **Đăng nhập:** App → `supabase.auth.signInWithOAuth(google, scopes drive.file, offline, consent, redirectTo gốc app)` → Google → Supabase callback → quay về app với `?code=` → supabase-js tự đổi code lấy session. Ngay khi có session chứa `provider_refresh_token`, app gửi `POST /api/google/credentials` (kèm JWT Supabase) → server mã hoá rồi upsert vào `google_credentials`.
- **Lấy access token Drive:** App → `POST /api/google/access-token` → server giải mã refresh token → gọi `https://oauth2.googleapis.com/token` → trả `{access_token, expires_at}`; app giữ trong bộ nhớ tới `expires_at − 60s`.
- **Upload ảnh:** App → `POST /api/drive/photo-folder` (lấy id thư mục) → app mở phiên resumable `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,mimeType,size,imageMediaMetadata(width,height)` bằng XHR, đọc header `Location`, `PUT` toàn bộ file → nhận metadata → insert dòng `photos` qua Supabase. Nếu insert lỗi → gọi `DELETE /api/photos/{fileId}` để tránh ảnh mồ côi.
- **Hiển thị ảnh:** `AuthedImage` → tra Cache Storage → nếu thiếu, `GET /api/photos/{fileId}/thumbnail?size=400|1600` (kèm JWT) → server `files.get(fields=thumbnailLink)` → tải `thumbnailLink` đã đổi hậu tố `=s{size}` → trả bytes → app lưu cache, tạo object URL.
- **Link Maps:** App parse link đầy đủ ngay trên máy; link `maps.app.goo.gl` → `POST /api/maps/resolve` → server trả URL đầy đủ → app parse.
- **Dữ liệu địa điểm:** App ↔ Supabase PostgREST trực tiếp (RLS theo `auth.uid()`).
- **Sao lưu:** GitHub Actions (tuần) → đọc toàn bộ bảng bằng secret key → lấy access token Drive từ refresh token → upload JSON vào thư mục "WhereToGo Backups" → xoá bản cũ hơn 8 bản gần nhất.

---

## 2. Cấu trúc thư mục (đường dẫn chính xác)

```
WhereToGo/
├─ .gitignore
├─ .editorconfig
├─ README.md
├─ docs/
│  ├─ PLAN.md                  (bản kế hoạch đã duyệt)
│  └─ SETUP.md                 (hướng dẫn [USER] tạo tài khoản & khoá)
├─ supabase/migrations/
│  ├─ 20260924000100_init_schema.sql
│  ├─ 20260924000200_rls_and_grants.sql
│  └─ 20260924000300_functions.sql
├─ server/
│  ├─ pyproject.toml
│  ├─ .python-version
│  ├─ vercel.json
│  ├─ .env.example
│  ├─ app.py                   (entry Vercel: biến `app`)
│  ├─ wheretogo_api/
│  │  ├─ __init__.py
│  │  ├─ main.py               (create_app)
│  │  ├─ config.py             (Settings)
│  │  ├─ logging_setup.py
│  │  ├─ errors.py
│  │  ├─ auth.py               (SupabaseJwtVerifier, get_current_user)
│  │  ├─ crypto.py             (TokenCipher)
│  │  ├─ credentials_repository.py (SupabaseCredentialRepository)
│  │  ├─ google_oauth.py       (GoogleTokenService)
│  │  ├─ drive.py              (DriveService)
│  │  ├─ maps_links.py         (resolve_short_link)
│  │  ├─ deps.py               (dependency wiring)
│  │  └─ routes/
│  │     ├─ __init__.py
│  │     ├─ health.py
│  │     ├─ google.py
│  │     ├─ drive.py
│  │     ├─ photos.py
│  │     └─ maps.py
│  └─ tests/
│     ├─ conftest.py
│     ├─ test_crypto.py
│     ├─ test_auth.py
│     ├─ test_google_oauth.py
│     ├─ test_drive.py
│     ├─ test_maps_links.py
│     └─ test_routes.py
├─ jobs/
│  ├─ requirements-dev.txt
│  ├─ wheretogo_jobs/
│  │  ├─ __init__.py
│  │  ├─ config.py
│  │  ├─ supabase_admin.py
│  │  ├─ keepalive.py
│  │  └─ backup.py
│  └─ tests/
│     ├─ test_keepalive.py
│     └─ test_backup.py
├─ .github/workflows/
│  ├─ ci.yml
│  ├─ deploy-web.yml
│  ├─ keepalive.yml
│  └─ backup.yml
└─ web/
   ├─ package.json
   ├─ tsconfig.json
   ├─ tsconfig.node.json
   ├─ vite.config.ts
   ├─ vitest.setup.ts
   ├─ eslint.config.js
   ├─ .prettierrc.json
   ├─ index.html
   ├─ .env.example
   ├─ public/
   │  ├─ logo.svg
   │  └─ (icon PNG do pwa-assets-generator sinh ra)
   └─ src/
      ├─ main.tsx
      ├─ vite-env.d.ts
      ├─ app/
      │  ├─ App.tsx
      │  ├─ Tabs.tsx
      │  └─ queryClient.ts
      ├─ config/env.ts
      ├─ theme/
      │  ├─ fonts.css
      │  ├─ variables.css
      │  └─ global.css
      ├─ lib/
      │  ├─ supabaseClient.ts
      │  ├─ apiClient.ts
      │  ├─ errors.ts
      │  └─ logger.ts
      ├─ shared/
      │  ├─ text/viNormalize.ts (+ .test.ts)
      │  ├─ geo/distance.ts (+ .test.ts)
      │  ├─ money/vnd.ts (+ .test.ts)
      │  ├─ hooks/useOnlineStatus.ts
      │  └─ components/
      │     ├─ StarRatingInput.tsx (+ .test.tsx)
      │     ├─ StarRatingView.tsx
      │     ├─ StatusChip.tsx
      │     ├─ OfflineBanner.tsx
      │     ├─ EmptyState.tsx
      │     └─ PriceRangeInput.tsx
      └─ features/
         ├─ auth/ (authService.ts, AuthProvider.tsx, useAuth.ts, RequireAuth.tsx, LoginPage.tsx)
         ├─ google/ (googleTokenService.ts (+ .test.ts), driveUpload.ts, driveFolderApi.ts)
         ├─ photos/ (photoRepository.ts, photoService.ts, imageConversion.ts, thumbnailCache.ts, AuthedImage.tsx, PhotoPicker.tsx, PhotoGallery.tsx)
         ├─ places/ (types.ts, placeSchema.ts, placeRepository.ts, placeService.ts, placeQueries.ts, placeFilters.ts (+ .test.ts), buildGoogleMapsLink.ts (+ .test.ts), PlaceListPage.tsx, PlaceCard.tsx, PlaceDetailPage.tsx, PlaceFormPage.tsx)
         ├─ tags/ (tagRepository.ts, tagQueries.ts, TagPicker.tsx, TagFilterBar.tsx, ManageTagsPage.tsx)
         ├─ maps-link/ (parseGoogleMapsUrl.ts (+ .test.ts), mapsLinkService.ts, PasteMapsLinkButton.tsx)
         ├─ location/ (geolocation.ts, useCurrentPosition.ts)
         ├─ opening-hours/ (openingHours.ts (+ .test.ts), OpeningHoursEditor.tsx, TimeWheelSheet.tsx, OpeningHoursView.tsx)
         ├─ visits/ (visitRepository.ts, visitService.ts, visitQueries.ts, VisitLog.tsx, AddVisitSheet.tsx)
         ├─ settings/ (SettingsPage.tsx)
         └─ spike/ (SpikePage.tsx — chỉ dùng ở Giai đoạn B, xoá ở Giai đoạn C)
```

---

## 3. Phiên bản & thư viện

Quy tắc chung: cài bằng `npm install <pkg>@<range>`; ghi range dạng `^` trong package.json; commit `package-lock.json`.

**web — dependencies:** `react@^19.3`, `react-dom@^19.3`, `@ionic/react@^9.0.5`, `@ionic/react-router@^9.0.5`, `ionicons@^8.1`, `react-router@^6.4 <7` và `react-router-dom@^6.4 <7` (BẮT BUỘC nhánh 6.x — Ionic 9 không hỗ trợ 7), `@supabase/supabase-js@^2`, `@tanstack/react-query@^5`, `@tanstack/react-query-persist-client@^5`, `@tanstack/query-async-storage-persister@^5`, `idb-keyval@^6`, `react-hook-form@^7.55`, `@hookform/resolvers@^5`, `zod@^4`, `@fontsource/be-vietnam-pro@^5`, `@fontsource/playfair-display@^5`.

**web — devDependencies:** `vite@^7` (KHÔNG dùng 8 — rủi ro Rolldown với Ionic/Stencil), `@vitejs/plugin-react@^5.2`, `typescript@~6.0` (KHÔNG dùng 7 — typescript-eslint chưa hỗ trợ), `vite-plugin-pwa@^1.3`, `@vite-pwa/assets-generator@^1`, `vitest` (major mới nhất có peerDependency chấp nhận vite 7 — kiểm bằng `npm view vitest@<major> peerDependencies`), `@testing-library/react@^16`, `@testing-library/dom@^10`, `@testing-library/jest-dom@^6`, `jsdom` (bản mới nhất), `eslint` (major mới nhất mà `typescript-eslint@^8` chấp nhận), `typescript-eslint@^8`, `eslint-plugin-react-hooks` (mới nhất), `prettier@^3`, `@types/react@^19`, `@types/react-dom@^19`.

**server (pyproject, Python ≥ 3.10; Vercel/CI chạy 3.12):** dependencies `fastapi`, `httpx`, `pyjwt[crypto]`, `cryptography`, `pydantic-settings`; `[dependency-groups] dev` = `pytest`, `respx`, `ruff`, `uvicorn`. Không có `requirements.txt` trong `server/` (Vercel ưu tiên pyproject).

**jobs:** cài `./server` (tái sử dụng `TokenCipher`, `SupabaseCredentialRepository`, `GoogleTokenService`) + `jobs/requirements-dev.txt` (`pytest`, `respx`).

---

## 4. Supabase — schema, RLS, quyền

### 4.1 `20260924000100_init_schema.sql`
- Không cần extension: `gen_random_uuid()` có sẵn từ Postgres 13.
- Hàm `public.set_updated_at()` trả về trigger: gán `new.updated_at = now()`.
- Bảng `public.places`:
  - `id uuid primary key default gen_random_uuid()`
  - `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`
  - `name text not null check (char_length(name) between 1 and 200)`
  - `address text check (char_length(address) <= 500)`
  - `latitude double precision check (latitude between -90 and 90)`
  - `longitude double precision check (longitude between -180 and 180)`
  - ràng buộc bảng: `check ((latitude is null) = (longitude is null))`
  - `google_maps_url text check (char_length(google_maps_url) <= 2000)`
  - `google_place_ref text check (char_length(google_place_ref) <= 300)`
  - `rating smallint check (rating between 1 and 5)`
  - `price_min_vnd integer check (price_min_vnd >= 0)`
  - `price_max_vnd integer check (price_max_vnd >= 0)`
  - ràng buộc bảng: `check (price_min_vnd is null or price_max_vnd is null or price_min_vnd <= price_max_vnd)`
  - `notes text check (char_length(notes) <= 5000)`
  - `status text not null default 'not_visited' check (status in ('interested','not_visited','visited'))`
  - `opening_hours jsonb` (NULL = chưa rõ giờ)
  - `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`
  - index `places_user_updated_idx on (user_id, updated_at desc)`
  - trigger `places_set_updated_at before update` gọi `set_updated_at()`
- Bảng `public.tags`: `id uuid pk default gen_random_uuid()`, `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`, `name text not null check (char_length(name) between 1 and 50)`, `created_at timestamptz not null default now()`; unique index `tags_user_name_uidx on (user_id, lower(name))`.
- Bảng `public.place_tags`: `place_id uuid not null references public.places(id) on delete cascade`, `tag_id uuid not null references public.tags(id) on delete cascade`, `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`, `primary key (place_id, tag_id)`; index `place_tags_tag_idx on (tag_id)`.
- Bảng `public.photos`: `id uuid pk default gen_random_uuid()`, `place_id uuid not null references public.places(id) on delete cascade`, `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`, `drive_file_id text not null unique check (char_length(drive_file_id) <= 200)`, `mime_type text`, `width integer`, `height integer`, `size_bytes bigint`, `position smallint not null default 0`, `created_at timestamptz not null default now()`; index `photos_place_idx on (place_id, position)`.
- Bảng `public.visits`: `id uuid pk default gen_random_uuid()`, `place_id uuid not null references public.places(id) on delete cascade`, `user_id uuid not null default auth.uid() references auth.users(id) on delete cascade`, `visited_on date not null`, `note text check (char_length(note) <= 500)`, `created_at timestamptz not null default now()`; index `visits_place_idx on (place_id, visited_on desc)`.
- Bảng `public.google_credentials`: `user_id uuid primary key references auth.users(id) on delete cascade`, `refresh_token_encrypted text not null`, `updated_at timestamptz not null default now()`; trigger `google_credentials_set_updated_at`.

### 4.2 `20260924000200_rls_and_grants.sql`
- `enable row level security` cho cả 6 bảng.
- Chính sách `owner_all` (for all, to authenticated) cho `places`, `tags`: using `((select auth.uid()) = user_id)`, with check giống hệt.
- `photos`, `visits`: using `((select auth.uid()) = user_id)`; with check `((select auth.uid()) = user_id and exists (select 1 from public.places p where p.id = place_id and p.user_id = (select auth.uid())))`.
- `place_tags`: using `((select auth.uid()) = user_id)`; with check thêm điều kiện place thuộc user VÀ `exists (select 1 from public.tags t where t.id = tag_id and t.user_id = (select auth.uid()))`.
- `google_credentials`: KHÔNG có policy nào.
- Quyền (do dự án Supabase mới không tự expose bảng):
  - `revoke all on` 6 bảng `from anon, authenticated`.
  - `grant select, insert, update, delete on public.places, public.tags, public.place_tags, public.photos, public.visits to authenticated`.
  - `grant select on public.places, public.tags, public.place_tags, public.photos, public.visits to service_role`.
  - `grant select, insert, update, delete on public.google_credentials to service_role`.

### 4.3 `20260924000300_functions.sql`
- Hàm `public.seed_default_tags()` returns void, `language sql`, `security invoker`, `set search_path = public`: insert 4 dòng (`Ăn uống`, `Vui chơi`, `Du lịch`, `Hẹn hò`) với `user_id = auth.uid()`, `on conflict (user_id, lower(name)) do nothing`.
- `revoke execute on function public.seed_default_tags() from public, anon`; `grant execute ... to authenticated`.

Cách áp dụng: `[USER]` dán lần lượt 3 file vào Supabase Dashboard → SQL Editor → Run. File trong repo là nguồn chuẩn.

---

## 5. Server API (FastAPI trên Vercel)

### 5.1 Cấu hình
- `server/app.py`: import `create_app` từ `wheretogo_api.main`, gán `app = create_app()` (Vercel tự nhận biến `app` trong `app.py`).
- `server/vercel.json`: CHỈ có `regions: ["sin1"]` (thời gian chạy tối đa để mặc định). KHÔNG có `rewrites`, KHÔNG có `functions`.
- `server/.python-version`: `3.12`. `pyproject.toml`: `requires-python = ">=3.10"`, tên project `wheretogo-api`, package `wheretogo_api`, build backend `hatchling` với `packages = ["wheretogo_api"]`. Code không dùng tính năng chỉ có từ Python 3.11 trở lên.
- `config.Settings` (pydantic-settings, đọc env và `server/.env` khi chạy local): `supabase_url: str`, `supabase_secret_key: SecretStr`, `google_client_id: str`, `google_client_secret: SecretStr`, `token_encryption_key: SecretStr`, `allowed_origins: list[str]` (env dạng chuỗi phân cách dấu phẩy), `allowed_origin_regex: str = r"^https://[a-z0-9-]+\.trycloudflare\.com$"`, `log_level: str = "INFO"`. Hàm `get_settings()` có `lru_cache`.
- `logging_setup.configure_logging(level)`: logger gốc xuất JSON một dòng (`ts`, `level`, `event`, `request_id`, các trường `extra`). Bộ lọc xoá mọi khoá chứa `token`, `secret`, `authorization`, `key`.
- `main.create_app()`: tạo FastAPI với `docs_url=None, redoc_url=None, openapi_url=None`; lifespan tạo một `httpx.AsyncClient(timeout=10.0)` lưu ở `app.state.http` và đóng khi tắt; thêm `CORSMiddleware` ĐẦU TIÊN (allow_origins = settings.allowed_origins, allow_origin_regex, allow_methods GET/POST/DELETE/OPTIONS, allow_headers Authorization/Content-Type, expose_headers X-Request-ID, max_age 600); middleware request-id (sinh UUID4, gắn header `X-Request-ID`, log `request_completed` với method/path/status/duration_ms); đăng ký exception handler; include các router với prefix `/api`.

### 5.2 Lỗi (`errors.py`)
- `AppError(Exception)` có `status_code`, `code`, `message`. Lớp con: `UnauthorizedError` (401, `unauthorized`), `GoogleReauthRequiredError` (409, `google_reauth_required`), `InvalidRequestError` (400, `invalid_request`), `UnsupportedLinkError` (422, `unsupported_link`), `NotFoundError` (404, `not_found`), `UpstreamError` (502, `upstream_error`).
- Handler trả JSON `{"code": ..., "message": ...}`; lỗi không mong đợi → 500 `internal_error`, log `unhandled_error` kèm stack trace (không kèm body request).

### 5.3 Xác thực (`auth.py`)
- `AuthenticatedUser` (dataclass frozen: `id: str`, `email: str | None`).
- `SupabaseJwtVerifier(jwks_url, issuer)`: dùng `PyJWKClient(jwks_url, cache_keys=True, lifespan=600)`; `verify(token) -> AuthenticatedUser` decode với `algorithms=["RS256","ES256"]`, `audience="authenticated"`, `issuer=f"{supabase_url}/auth/v1"`, `leeway=30`; yêu cầu claim `role == "authenticated"`; lỗi bất kỳ → `UnauthorizedError`.
- `get_current_user` là hàm `def` đồng bộ (để FastAPI chạy trong threadpool vì PyJWKClient gọi mạng đồng bộ): đọc header `Authorization: Bearer <jwt>`, thiếu → 401.
- JWKS URL = `{supabase_url}/auth/v1/.well-known/jwks.json`.

### 5.4 Mã hoá (`crypto.py`)
- `TokenCipher(key: str)`: bọc `cryptography.fernet.Fernet`; `encrypt(plaintext) -> str`, `decrypt(ciphertext) -> str`; token hỏng → `GoogleReauthRequiredError`.

### 5.5 Kho refresh token (`credentials_repository.py`)
- Protocol `CredentialRepository`: `get(user_id) -> str | None` (trả chuỗi đã mã hoá), `upsert(user_id, encrypted)`, `delete(user_id)`.
- `SupabaseCredentialRepository(http, supabase_url, secret_key)`: gọi PostgREST `/rest/v1/google_credentials` với CHỈ header `apikey: <secret>` (không gửi Authorization) ; upsert dùng `Prefer: resolution=merge-duplicates` và `on_conflict=user_id`; lỗi HTTP → `UpstreamError`.
- Có thêm `list_user_ids() -> list[str]` (dùng cho job sao lưu).

### 5.6 Google OAuth (`google_oauth.py`)
- `AccessToken` (dataclass: `value: str`, `expires_at: int` epoch giây).
- `GoogleTokenService(http, client_id, client_secret, repo, cipher)`:
  - `store_refresh_token(user_id, refresh_token)`: mã hoá rồi `repo.upsert`; xoá cache access token của user.
  - `get_access_token(user_id) -> AccessToken`: trả từ cache bộ nhớ (dict module-level theo user_id) nếu còn ≥ 60s; nếu không: lấy refresh token (không có → `GoogleReauthRequiredError`), `POST https://oauth2.googleapis.com/token` form `grant_type=refresh_token, client_id, client_secret, refresh_token`; lỗi `invalid_grant` → `repo.delete(user_id)` rồi `GoogleReauthRequiredError`; lỗi khác → `UpstreamError`; thành công → `expires_at = now + expires_in`, lưu cache.

### 5.7 Drive (`drive.py`)
- Hằng: `PHOTO_FOLDER_NAME = "WhereToGo Photos"`, `BACKUP_FOLDER_NAME = "WhereToGo Backups"`, `ALLOWED_THUMB_SIZES = {400, 1600}`, regex id file `^[A-Za-z0-9_-]{10,200}$`.
- `DriveService(http)`:
  - `ensure_folder(access_token, name) -> str`: `GET https://www.googleapis.com/drive/v3/files` với `q = mimeType='application/vnd.google-apps.folder' and name='<name>' and trashed=false`, `fields=files(id)`, `orderBy=createdTime`, `pageSize=1`, `spaces=drive`; có → trả id (nếu lỡ có nhiều thì lấy thư mục tạo sớm nhất); không → `POST .../drive/v3/files` body `{name, mimeType: folder}` `fields=id`. Luôn tra trước rồi mới tạo (idempotent). Tầng route có cache theo (user_id, name), nhưng đó CHỈ là tối ưu trong một instance Vercel đang ấm, không đảm bảo dùng chung giữa các lần gọi.
  - `get_thumbnail(access_token, file_id, size) -> tuple[bytes, str]`: `GET .../files/{id}?fields=thumbnailLink,mimeType`; 404 → `NotFoundError`; không có `thumbnailLink` → `NotFoundError(code="thumbnail_not_ready")`; thay hậu tố `=s<số>` cuối URL bằng `=s{size}` (không có thì nối thêm); tải URL đó với header `Authorization: Bearer`; trả bytes + content-type.
  - `delete_file(access_token, file_id)`: `DELETE .../files/{id}`; 404 coi như thành công.
  - `upload_json(access_token, folder_id, filename, data: bytes) -> str` (multipart, cho job sao lưu).
  - `list_files(access_token, folder_id) -> list[dict]` (`fields=files(id,name,createdTime)`, `orderBy=createdTime desc`, `pageSize=100`) (cho job sao lưu).

### 5.8 Link rút gọn (`maps_links.py`)
- `SHORT_LINK_HOSTS = {"maps.app.goo.gl", "goo.gl"}`; `GOOGLE_MAPS_HOST_PATTERN` = host `google.<tld>` / `www.google.<tld>` / `maps.google.<tld>` (tld gồm `com`, `com.vn`, …).
- `is_allowed_short_link(url) -> bool`: https + host thuộc `SHORT_LINK_HOSTS` + (với `goo.gl` path phải bắt đầu `/maps`).
- `async resolve_short_link(http, url) -> str`: lặp tối đa 5 lần `GET` với `follow_redirects=False`, header `User-Agent: Mozilla/5.0 (compatible; WhereToGo/1.0)`; nếu 3xx → lấy `Location` (ghép tương đối nếu cần); mỗi đích phải là https và host thuộc short-link hosts hoặc Google Maps hosts, nếu không → `UnsupportedLinkError`; dừng khi host là Google Maps → trả URL; hết 5 lần hoặc không phải 3xx → `UpstreamError`.

### 5.9 Endpoint (tất cả trừ health yêu cầu JWT Supabase)
| Method & path | Body/Query | Trả về | Lỗi |
|---|---|---|---|
| `GET /api/health` | — | `{"status":"ok"}` | — |
| `POST /api/google/credentials` | `{"refresh_token": str (1..2048)}` | 204 | 401, 400 |
| `POST /api/google/access-token` | — | `{"access_token": str, "expires_at": int}` | 401, 409, 502 |
| `POST /api/drive/photo-folder` | — | `{"folder_id": str}` | 401, 409, 502 |
| `GET /api/photos/{file_id}/thumbnail` | `size` ∈ {400,1600}, mặc định 400 | bytes ảnh, `Cache-Control: private, max-age=86400` | 400, 401, 404 (`not_found`/`thumbnail_not_ready`), 409, 502 |
| `DELETE /api/photos/{file_id}` | — | 204 | 400, 401, 409, 502 |
| `POST /api/maps/resolve` | `{"url": str (≤2048)}` | `{"resolved_url": str}` | 400, 401, 422, 502 |

`deps.py` cung cấp: `get_settings`, `get_http(request)`, `get_verifier()` (singleton), `get_cipher()`, `get_credential_repo()`, `get_google_token_service()`, `get_drive_service()`, cache thư mục `folder_cache: dict[tuple[str,str], str]` (chỉ tối ưu trong một instance, xem 5.7).

---

## 6. Web app

### 6.1 Khởi động (`main.tsx`) — thứ tự
1. Import CSS Ionic: `core.css`, `normalize.css`, `structure.css`, `typography.css`, `padding.css`, `flex-utils.css`, `display.css`, `palettes/dark.system.css`; rồi `theme/fonts.css`, `theme/variables.css`, `theme/global.css`.
2. `setupIonicReact({ mode: 'ios', animated: !window.matchMedia('(prefers-reduced-motion: reduce)').matches })`.
3. `await initializeAuth()` (xử lý `?code=` trong URL TRƯỚC khi router render).
4. Render `<App />` vào `#root`.

### 6.2 Cấu hình
- `config/env.ts`: `loadEnv()` kiểm `import.meta.env` bằng zod: `VITE_SUPABASE_URL` (url), `VITE_SUPABASE_PUBLISHABLE_KEY` (chuỗi bắt đầu `sb_publishable_`), `VITE_API_BASE_URL` (url, không có `/` cuối); export `env` (camelCase). Sai → ném lỗi rõ ràng.
- `web/.env.example` liệt kê 3 biến. `.env.local` bị gitignore.
- `vite.config.ts`: `base` = `'/WhereToGo/'` khi `mode === 'production'`, ngược lại `'/'`; plugin `react()`, `VitePWA(...)`; `optimizeDeps.exclude = ['@ionic/core']`; `server.host = true`, `server.allowedHosts = ['.trycloudflare.com']`; `test` (Vitest): `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, `globals: false`.
- VitePWA: `registerType: 'autoUpdate'`, `injectRegister: 'auto'`, manifest `{ name: 'WhereToGo', short_name: 'WhereToGo', description: 'Kho địa điểm của riêng bạn', lang: 'vi', display: 'standalone', start_url và scope cùng giá trị với `base` (`'/WhereToGo/'` khi production, `'/'` khi dev), background_color: '#FAFAF9', theme_color: '#FAFAF9', icons: pwa-192x192.png, pwa-512x512.png, maskable-icon-512x512.png (purpose maskable) }`; workbox `globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']`, `navigateFallback: 'index.html'`, `cleanupOutdatedCaches: true`. Sau khi build, kiểm `dist/manifest.webmanifest` nằm cạnh `index.html` và `start_url`/`scope` là `/WhereToGo/`.
- `index.html`: `lang="vi"`; viewport `width=device-width, initial-scale=1, viewport-fit=cover`; `theme-color` sáng `#FAFAF9` / tối `#0C0A09` theo media; `apple-touch-icon` → `apple-touch-icon-180x180.png`; `favicon.ico`; title `WhereToGo`.
- `public/logo.svg`: 512×512, nền phẳng `#1C1917` phủ kín; ghim bản đồ màu `#CA8A04` gồm hình tròn tâm (256, 220) bán kính 110 nối với đỉnh nhọn tại (256, 400); lõi tròn `#FAFAF9` tâm (256, 220) bán kính 45; không chữ. Sinh icon bằng `npx pwa-assets-generator --preset minimal-2023 public/logo.svg`.

### 6.3 Giao diện (theme)
- `fonts.css`: import `@fontsource/be-vietnam-pro` các file `latin-400.css`, `vietnamese-400.css`, `latin-500.css`, `vietnamese-500.css`, `latin-600.css`, `vietnamese-600.css`; `@fontsource/playfair-display` `latin-600.css`, `vietnamese-600.css`.
- `variables.css` (sáng, trên `:root`): `--ion-font-family: 'Be Vietnam Pro', system-ui, sans-serif`; `--ion-background-color #FAFAF9`; `--ion-text-color #0C0A09`; `--ion-card-background #FFFFFF`; `--ion-item-background #FFFFFF`; `--ion-border-color #E7E5E4`; màu Ionic (mỗi màu đủ `-rgb`, `-contrast`, `-contrast-rgb`, `-shade` = trộn 12% đen, `-tint` = trộn 10% trắng):
  - `primary #1C1917` / contrast `#FFFFFF`
  - `secondary #44403C` / `#FFFFFF`
  - `tertiary` (vàng đồng) `#A16207` / `#FFFFFF`
  - `success #15803D` / `#FFFFFF`
  - `danger #DC2626` / `#FFFFFF`
  - `medium #57534E` / `#FFFFFF`
  - `light #F5F5F4` / `#0C0A09`
- Tối (`@media (prefers-color-scheme: dark)` trên `:root`): nền `#0C0A09`; chữ `#FAFAF9`; card/item `#1C1917`; viền `#44403C`; `primary #FAFAF9` / contrast `#0C0A09`; `tertiary #EAB308` / `#0C0A09`; `success #4ADE80` / `#0C0A09`; `danger #F87171` / `#0C0A09`; `medium #A8A29E` / `#0C0A09`.
- Đã đo tương phản: chữ chính 16.7–18.9:1; chữ phụ 6.9–7.6:1; vàng đồng 4.7–4.9:1 (sáng) / 9.1:1 (tối); success 5.0:1; danger 4.8:1 — đều ≥ 4.5:1.
- `global.css`:
  - `.wtg-display` (tiêu đề lớn): Playfair Display 600, 28px, line-height 1.2.
  - `.wtg-heading`: Playfair Display 600, 20px.
  - Chữ thân 16px, line-height 1.5; chú thích 13px (không dưới 12px).
  - Tiêu đề nhóm: 12px, in hoa, `letter-spacing: 0.08em`, màu `medium`.
  - Card: nền card, viền 1px `--ion-border-color`, bo góc 16px, KHÔNG box-shadow; khoảng cách trang 16px, giữa các nhóm 24px.
  - Ảnh nhỏ trong danh sách 88×88, bo 12px, `object-fit: cover`.
  - Mọi vùng bấm ≥ 44×44 px.
  - `IonTitle` lớn dùng `.wtg-display` qua `::part` / biến CSS của Ionic.
- Icon: chỉ dùng `ionicons`; tab không chọn = kiểu outline, tab đang chọn = kiểu filled; không dùng emoji làm icon.

### 6.4 Điều hướng (hash)
- `#/login` → `LoginPage`
- `#/tabs/explore` → `PlaceListPage mode="explore"` (mặc định sau đăng nhập)
- `#/tabs/nearby` → `PlaceListPage mode="nearby"`
- `#/tabs/settings` → `SettingsPage`
- `#/settings/tags` → `ManageTagsPage`
- `#/places/new` → `PlaceFormPage` (tạo)
- `#/places/:id` → `PlaceDetailPage`
- `#/places/:id/edit` → `PlaceFormPage` (sửa)
- `#/spike` → `SpikePage` (chỉ Giai đoạn B)
- `/` → chuyển `#/tabs/explore`
- Mọi route trừ `#/login` bọc `RequireAuth` (chưa đăng nhập → `#/login`).
- `Tabs.tsx`: `IonTabs` + `IonRouterOutlet` + `IonTabBar slot="bottom"` với 3 nút: Khám phá (`compassOutline`/`compass`), Gần tôi (`locationOutline`/`location`), Cài đặt (`settingsOutline`/`settings`).
- Cú pháp route theo tài liệu chính thức "Ionic React Navigation" cho React Router v6 của Ionic 9.

### 6.5 Module dùng chung (`lib/`, `shared/`)
- `lib/logger.ts`: `logger.debug|info|warn|error(event: string, data?: Record<string, unknown>)`; chỉ in `debug` khi `import.meta.env.DEV`; tự che các khoá khớp `/token|secret|key|authorization/i`.
- `lib/errors.ts`:
  - Lớp `AppError(code, message, cause?)` và các lớp con: `AuthRequiredError`, `GoogleReauthRequiredError`, `NetworkError`, `ApiError(status, code)`, `ValidationError`, `DriveUploadError`, `LocationError(reason: 'denied'|'unavailable'|'timeout')`, `InvalidMapsLinkError`, `OfflineError`.
  - Hàm `toUserMessage(error: unknown): string` trả câu tiếng Việt cho từng loại.
- `lib/supabaseClient.ts`: `supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true } })`.
- `lib/apiClient.ts`:
  - `createApiClient({ baseUrl, getAccessToken, fetchImpl = fetch })` trả về `{ getJson<T>(path), postJson<T>(path, body?), getBlob(path), delete(path) }`.
  - Mỗi request gắn `Authorization: Bearer <supabase access token>`.
  - Ánh xạ lỗi: lỗi mạng → `NetworkError`; 401 → `AuthRequiredError`; 409 với `code === 'google_reauth_required'` → `GoogleReauthRequiredError`; 4xx/5xx khác → `ApiError`.
  - Export `apiClient` đã nối với `getSupabaseAccessToken`.
- `shared/text/viNormalize.ts`: `normalizeVi(text: string): string` — chữ thường → NFD → xoá U+0300–U+036F → `đ`→`d` → gộp khoảng trắng → trim.
- `shared/geo/distance.ts`:
  - `haversineMeters(a: LatLng, b: LatLng): number` (bán kính Trái Đất 6.371.008,8 m).
  - `formatDistance(m: number): string`: dưới 1000 → làm tròn 10 m, dạng `"350 m"`; từ 1000 trở lên → 1 chữ số thập phân với dấu phẩy, dạng `"1,2 km"`.
- `shared/money/vnd.ts`:
  - `formatVnd(n)`: `Intl.NumberFormat('vi-VN')` rồi nối `" ₫"`, ví dụ `"150.000 ₫"`.
  - `formatVndRange(min, max)`: đủ cả hai → `"150.000 ₫ – 300.000 ₫"`; chỉ min → `"Từ 150.000 ₫"`; chỉ max → `"Đến 300.000 ₫"`; không có → `null`.
  - `parseVndInput(text): number | null`: giữ lại chữ số; rỗng → `null`; quá 2.000.000.000 → `null`.
  - `formatVndInput(text): string`: định dạng dấu chấm ngăn cách hàng nghìn khi đang gõ.
- `shared/hooks/useOnlineStatus.ts`: `useOnlineStatus(): boolean` từ `navigator.onLine` + sự kiện `online`/`offline`.
- `shared/components/`:
  - `StarRatingInput({ value, onChange })`: 5 nút sao ≥44px, `aria-label` "N sao"; chạm lại đúng sao đang chọn → xoá (`null`).
  - `StarRatingView({ value, size })`.
  - `StatusChip({ status })`:

    | Status | Nhãn | Màu |
    |---|---|---|
    | `interested` | "Hứng thú" | tertiary |
    | `not_visited` | "Chưa đi" | medium |
    | `visited` | "Đã đi" | success |

  - `OfflineBanner` (thanh mảnh: "Đang offline — chỉ xem được").
  - `EmptyState({ icon, title, message, action? })`.
  - `PriceRangeInput({ min, max, onChange })`: 2 ô `inputmode="numeric"`, hậu tố "₫".

### 6.6 Tính năng (`features/`)
**auth**
- `authService.ts`:
  - `initializeAuth(): Promise<Session|null>`: đăng ký `supabase.auth.onAuthStateChange` TRƯỚC; handler gọi `forwardProviderRefreshToken(session)` với mọi event có session; sau đó `await supabase.auth.getSession()`, gọi `forwardProviderRefreshToken` lần nữa với kết quả, rồi trả session.
  - `signInWithGoogle(): Promise<void>`: gọi `signInWithOAuth` với `provider: 'google'`, `options.redirectTo = window.location.origin + import.meta.env.BASE_URL`, `options.scopes = 'https://www.googleapis.com/auth/drive.file'`, `options.queryParams = { access_type: 'offline', prompt: 'consent' }`.
  - `signOut(): Promise<void>`: `supabase.auth.signOut()`, xoá query cache, `clearThumbnails()`, `clearDriveAccessToken()`, xoá persister IndexedDB.
  - `getSupabaseAccessToken(): Promise<string>`: không có session → `AuthRequiredError`.
  - `forwardProviderRefreshToken(session)` (nội bộ): nếu `session.provider_refresh_token` tồn tại và chưa gửi trong phiên này (Set trong module) → `storeRefreshToken()`; lỗi → `logger.error('refresh_token_forward_failed')` và giữ trạng thái để UI báo "cần kết nối lại Drive".
- `AuthProvider.tsx`: context `{ session, user, status: 'loading'|'signed_in'|'signed_out', driveLinked: boolean|null }`; khi chuyển sang `signed_in` thì gọi `seedDefaultTags()` một lần mỗi lần mở app rồi invalidate `['tags']`.
- `useAuth.ts`, `RequireAuth.tsx`.
- `LoginPage.tsx`: logo, chữ "WhereToGo" (`.wtg-display`), dòng phụ "Kho địa điểm của riêng bạn", nút "Tiếp tục với Google" (primary, rộng hết), chú thích "App sẽ xin quyền lưu ảnh vào một thư mục riêng trên Google Drive của bạn."

**google**
- `googleTokenService.ts`: `storeRefreshToken(token)` → `POST /api/google/credentials`; `getDriveAccessToken(): Promise<string>` (cache trong bộ nhớ tới `expires_at − 60s`, gộp các lời gọi đồng thời vào một promise); `clearDriveAccessToken()`.
- `driveFolderApi.ts`: `getPhotoFolderId(): Promise<string>` → `POST /api/drive/photo-folder`, cache trong bộ nhớ cho cả phiên.
- `driveUpload.ts`:
  - `uploadFileToDrive({ file, folderId, accessToken, fileName, onProgress }): Promise<DriveFileInfo>`, gồm 2 bước:
    1. XHR `POST` mở phiên resumable, header `Authorization`, `Content-Type: application/json; charset=UTF-8`, `X-Upload-Content-Type`, `X-Upload-Content-Length`; body `{ name: fileName, parents: [folderId] }`. Đọc `getResponseHeader('Location')`; không có → `DriveUploadError('no_session_uri')`.
    2. XHR `PUT` toàn bộ file tới Location, báo tiến độ qua `upload.onprogress`.
  - Trả `{ id, mimeType, size, width, height }`.
  - `DriveFileInfo` là kiểu export.
  - Tên file: `wtg_<placeId>_<yyyyMMddHHmmss>_<chỉ số>.<ext>`; ext theo mime: `image/jpeg`→`jpg`, `image/png`→`png`, `image/webp`→`webp`. File đã qua `prepareImageForUpload` nên chỉ còn 3 loại này.
- `features/photos/imageConversion.ts`: `prepareImageForUpload(file): Promise<File>`:
  - HEIC/HEIF (theo `type` hoặc đuôi `.heic`/`.heif`) → `createImageBitmap(file)` → vẽ lên canvas cùng kích thước → `toBlob('image/jpeg', 0.92)` → `File` mới đuôi `.jpg`.
    - Tổng điểm ảnh > 67.108.864 → `DriveUploadError('image_too_large')`.
    - Giải mã lỗi → `DriveUploadError('heic_unsupported')`, thông báo "Trình duyệt này không đọc được ảnh HEIC, hãy chọn ảnh JPEG".
  - JPEG/PNG/WebP → trả nguyên file.
  - Loại khác → `DriveUploadError('unsupported_type')`.

**photos**
- `photoRepository.ts`: `listPhotos(placeId)`, `insertPhoto({ placeId, driveFileId, mimeType, width, height, sizeBytes, position })`, `deletePhotoRow(id)`.
- `photoService.ts`:
  - `addPhotos(placeId, files, existingPhotos: PhotoRef[], onProgress(fileIndex, fraction))`:
    - Vị trí bắt đầu = (`position` lớn nhất trong `existingPhotos`, không có thì −1) + 1; mỗi ảnh tiếp theo +1.
    - Kiểm tra: mỗi file ≤ 25 MB; chỉ nhận `20 − existingPhotos.length` file đầu tiên, phần dư ghi vào danh sách lỗi (D23).
    - Mỗi file đi qua `prepareImageForUpload` trước khi upload.
    - Chạy tuần tự: lấy folder → lấy token → upload → insert dòng.
    - Insert lỗi → `DELETE /api/photos/{id}` rồi ném lỗi.
    - Trả số ảnh thành công và danh sách lỗi.
  - `removePhoto(photo)`: `DELETE /api/photos/{driveFileId}` rồi `deletePhotoRow`.
- `thumbnailCache.ts`: cache name `wtg-thumbnails-v1`; key là URL giả `https://thumb.local/<fileId>/<size>`; các hàm `getCachedThumbnail`, `putThumbnail`, `clearThumbnails`. Mọi thao tác bọc try/catch (Cache Storage lỗi → bỏ qua).
- `AuthedImage.tsx`:
  - Props: `{ driveFileId, size: 400|1600, alt, className }`.
  - Chỉ tải khi phần tử lọt vào màn hình (IntersectionObserver). Tra cache trước; thiếu thì `apiClient.getBlob` rồi `putThumbnail`; tạo object URL và revoke khi unmount.
  - Trạng thái: skeleton → ảnh → lỗi (icon `imageOutline`).
  - Lỗi `thumbnail_not_ready` → thử lại sau 5 giây, tối đa 3 lần. Vẫn không có → trạng thái "Chưa có ảnh xem trước" (icon `imageOutline` + chữ nhỏ); chạm vào mở ảnh trên Google Drive.
- `PhotoPicker.tsx`: nút "Thêm ảnh" mở `<input type="file" accept="image/*" multiple>` ẩn (không đặt `capture`, để iOS cho chọn chụp mới hoặc thư viện); trả `File[]` qua `onPick`.
- `PhotoGallery.tsx`:
  - Hàng ảnh vuốt ngang (CSS scroll-snap) dùng `AuthedImage size=1600`, tỉ lệ 4:3.
  - Nút "Mở trong Google Drive" → `https://drive.google.com/file/d/<id>/view` (mở tab mới).
  - Ở chế độ sửa: mỗi ảnh có nút xoá.

**places**
- `types.ts`:
  - `PlaceStatus = 'interested'|'not_visited'|'visited'`.
  - `Place`: các cột, đổi sang camelCase.
  - `PlaceWithRelations = Place & { tagIds: string[]; photos: PhotoRef[]; visitDates: string[] }`.
  - `PlaceInput`: các trường form; `PhotoRef`.
- `placeSchema.ts`: zod `placeFormSchema`:
  - `name`: trim, 1–200 ký tự.
  - `address`: ≤500.
  - `latitude`/`longitude`: phải cùng có hoặc cùng trống.
  - `googleMapsUrl`: ≤2000; hợp lệ khi rỗng hoặc được `isSupportedMapsUrl` chấp nhận.
  - `googlePlaceRef`: ≤300.
  - `rating`: 1–5 hoặc null.
  - `priceMinVnd`/`priceMaxVnd`: ≥0 hoặc null, và min ≤ max.
  - `notes`: ≤5000.
  - `status`: một trong 3 giá trị.
  - `openingHours`: `OpeningHours|null`, kiểm bằng `validateWeek`.
  - `tagIds`: mảng uuid.
- `placeRepository.ts`:
  - `listPlaces()`: select `*, place_tags(tag_id), photos(id, drive_file_id, position), visits(visited_on)`, sắp `updated_at desc`, ánh xạ sang `PlaceWithRelations` bằng hàm `mapPlaceRow(row)`. `mapPlaceRow` LUÔN tự sắp `photos` theo `position` tăng dần và `visitDates` giảm dần, không dựa vào thứ tự server trả về.
  - `getPlace(id)` cùng select.
  - `insertPlace(input): Place`, `updatePlace(id, input)`, `deletePlaceRow(id)`.
  - `replacePlaceTags(placeId, tagIds)`: xoá dòng thừa, chèn dòng thiếu.
- `placeService.ts`:
  - `createPlace(input, photos: File[], onProgress)`: `insertPlace` → `replacePlaceTags` → `addPhotos`.
  - `updatePlace(id, input, newPhotos, removedPhotos, onProgress)`: `updatePlace` → `replacePlaceTags` → `removePhoto` từng ảnh bị xoá → `addPhotos`.
  - `deletePlace(place)`: `removePhoto` từng ảnh → `deletePlaceRow`.
  - Khi offline, mọi hàm ném `OfflineError`.
- `placeQueries.ts`:
  - Query keys: `['places']`, `['places', id]`, `['tags']`, `['visits', placeId]`.
  - Hooks: `usePlaces()`, `usePlace(id)` (lấy từ dữ liệu `['places']` nếu có), `useCreatePlace()`, `useUpdatePlace()`, `useDeletePlace()`. Các mutation invalidate `['places']`.
- `placeFilters.ts` (hàm thuần):
  - `filterPlaces(places, { query, tagIds, status }, tagNameById)`:
    - `query`: chuẩn hoá, tách token; mọi token phải xuất hiện trong chuỗi chuẩn hoá của tên + địa chỉ + ghi chú + tên nhãn.
    - `tagIds`: rỗng → bỏ qua; có → địa điểm phải có ít nhất 1 nhãn.
    - `status`: `'all'` hoặc 1 giá trị.
  - `sortPlaces(places, mode: 'recent'|'rating'|'distance', origin?)`:
    - `rating`: giảm dần, null xuống cuối, hoà thì xếp theo `recent`.
    - `distance`: cần `origin`, địa điểm không có toạ độ bị loại.
  - Trả `{ sorted, withoutCoordsCount }`.
- `buildGoogleMapsLink(place): string | null`, theo thứ tự ưu tiên:
  1. `googleMapsUrl`.
  2. Có toạ độ → `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`.
  3. Có tên → `...query=<encodeURIComponent(tên + ', ' + địa chỉ)>`.
  4. Không có gì → null.
- `PlaceListPage.tsx`:
  - Header lớn thu gọn (`collapse="condense"`), tiêu đề "Khám phá" / "Gần tôi"; `OfflineBanner` khi offline.
  - `IonSearchbar` (placeholder "Tìm tên, địa chỉ, ghi chú…", debounce 200 ms); `TagFilterBar`; `IonSegment` trạng thái (Tất cả / Hứng thú / Chưa đi / Đã đi).
  - Tab Khám phá có thêm nút sắp xếp (IonSelect, giao diện action sheet): "Mới cập nhật" / "Đánh giá cao".
  - Tab Gần tôi:
    - Gọi `useCurrentPosition()`, sắp theo khoảng cách, hiện dòng "N địa điểm chưa có vị trí".
    - Lỗi quyền vị trí → `EmptyState` hướng dẫn "Cài đặt → Quyền riêng tư & Bảo mật → Dịch vụ định vị → Trang web Safari → Khi dùng", kèm nút "Thử lại".
  - `IonRefresher` kéo để làm mới.
  - `IonFab` góc dưới phải, nút ＋ mở `#/places/new`; ẩn khi offline.
  - Danh sách rỗng → `EmptyState` "Chưa có địa điểm nào" kèm nút "Thêm địa điểm đầu tiên".
- `PlaceCard.tsx`: chia 2 cột.
  - Trái: `AuthedImage size=400` 88×88 (ảnh đầu tiên theo `position`); không có ảnh → ô nền `light` với icon `imageOutline`.
  - Phải:
    - Dòng 1: tên (600, 17px, tối đa 2 dòng).
    - Dòng 2: nhãn (tối đa 3, "+N"), sau đó là khoảng giá, ngăn cách bằng " · ".
    - Dòng 3: `StarRatingView`, `StatusChip`, khoảng cách (nếu có).
  - Chạm vào thẻ → `#/places/:id`.
- `PlaceDetailPage.tsx` gồm, theo thứ tự:
  1. `PhotoGallery`.
  2. Tên (`.wtg-display`).
  3. `StatusChip` + sao.
  4. Nhãn.
  5. Nhóm "Thông tin": địa chỉ, giá, khoảng cách.
  6. Nhóm "Giờ mở cửa": `OpeningHoursView`.
  7. Nhóm "Ghi chú".
  8. Nhóm "Các lần đi": `VisitLog` + nút "Thêm lần đi" (mở `AddVisitSheet`).
  9. Thanh dưới cố định (có chừa safe area) gồm 2 nút: "Mở Google Maps" (tertiary; ẩn nếu `buildGoogleMapsLink` null) và "Sửa" (ẩn khi offline).
- `PlaceFormPage.tsx`: `react-hook-form` + `zodResolver(placeFormSchema)`.
  - Toolbar: "Huỷ" / tiêu đề ("Địa điểm mới" hoặc "Sửa địa điểm") / "Lưu". Nút "Lưu" bị khoá khi offline hoặc đang lưu.
  - Các nhóm theo thứ tự:
    1. "Google Maps": `PasteMapsLinkButton` + ô URL; blur ô URL thì cũng parse.
    2. "Tên" *.
    3. "Địa chỉ".
    4. "Vị trí": nút "Dùng vị trí hiện tại" (luôn ghi đè toạ độ đang có — D25), hiển thị toạ độ dạng `21.01694, 105.85228`, nút "Xoá vị trí".
    5. "Ảnh": ảnh đã có + ảnh chờ upload (xem trước qua `URL.createObjectURL`), `PhotoPicker`.
    6. "Loại": `TagPicker`.
    7. "Trạng thái": `IonSegment` 3 lựa chọn.
    8. "Đánh giá của bạn": `StarRatingInput`.
    9. "Khoảng giá": `PriceRangeInput`.
    10. "Giờ mở cửa": `OpeningHoursEditor`.
    11. "Ghi chú": `IonTextarea` tự giãn, đếm ký tự.
  - Lỗi hiển thị ngay dưới từng trường.
  - Khi lưu: `IonLoading` "Đang lưu…", kèm "Đang tải ảnh i/n" khi đang upload. Thành công → `#/places/:id`. Một phần ảnh lỗi → toast báo số ảnh lỗi (địa điểm vẫn được lưu).
  - Chế độ sửa có nút "Xoá địa điểm" (danger) ở cuối; bấm → `IonAlert` xác nhận → `deletePlace` → `#/tabs/explore`.
  - Rời trang khi có thay đổi chưa lưu → `IonAlert` hỏi "Bỏ thay đổi?".

**tags**
- `tagRepository.ts`: `listTags()` (sắp theo tên, collation mặc định), `createTag(name)`, `renameTag(id, name)`, `deleteTag(id)`, `seedDefaultTags()` (rpc).
- `tagQueries.ts`: `useTags()`, `useCreateTag()`, `useRenameTag()`, `useDeleteTag()`. Mọi mutation invalidate `['tags']` và `['places']`.
- `TagPicker({ value, onChange })`:
  - Chip bật/tắt cho từng nhãn, và chip "＋ Nhãn mới".
  - Chip "＋ Nhãn mới" mở `IonAlert` có ô nhập: trim, 1–50 ký tự, không trùng (so sánh bằng `normalizeVi`).
  - Tạo xong → tự chọn nhãn mới.
- `TagFilterBar({ selected, onChange })`: hàng chip cuộn ngang, chọn nhiều.
- `ManageTagsPage.tsx`: danh sách nhãn + số địa điểm dùng nhãn đó.
  - Vuốt trái (`IonItemSliding`) để "Đổi tên" (IonAlert) hoặc "Xoá".
  - "Xoá" mở `IonAlert` xác nhận: "Nhãn sẽ bị gỡ khỏi N địa điểm".

**maps-link**
- `parseGoogleMapsUrl.ts` (hàm thuần):
  - `isShortMapsLink(url)`: host `maps.app.goo.gl`, hoặc `goo.gl` với path `/maps…`.
  - `isSupportedMapsUrl(url)`: short link, hoặc host Google (`google.<tld>`, `www.google.<tld>`, `maps.google.<tld>`) với path `/maps…` hoặc có query `q`/`cid`.
  - `parseGoogleMapsUrl(url): ParsedMapsLink { name?, latitude?, longitude?, placeRef?, url }`:
    - `url` không hỗ trợ → `InvalidMapsLinkError`; short link → `InvalidMapsLinkError('needs_resolve')`.
    - `name`: đoạn path sau `/place/` (đổi `+` thành khoảng trắng, `decodeURIComponent`); nếu không có thì lấy query `query`/`q` khi giá trị không phải toạ độ.
    - Toạ độ, lấy nguồn đầu tiên có theo thứ tự: cặp `!3d<lat>!4d<lng>`; `@<lat>,<lng>`; query `q`/`query`/`ll` dạng `lat,lng`. Chỉ nhận toạ độ hợp lệ.
    - `placeRef`, lấy nguồn đầu tiên có theo thứ tự:
      1. ftid `0x…:0x…` từ `!1s` hoặc query `ftid`.
      2. `query_place_id` / `place_id:`.
      3. `cid` → dạng `cid:<số>`.
- `mapsLinkService.ts`: `extractFromMapsLink(raw): Promise<ParsedMapsLink>`: trim, lấy URL http(s) đầu tiên trong chuỗi (người dùng có thể dán cả câu); short link → `POST /api/maps/resolve` rồi parse URL kết quả.
- `PasteMapsLinkButton({ onParsed })`:
  - Chạm → `navigator.clipboard.readText()` (trong cùng cử chỉ chạm).
  - Clipboard lỗi hoặc rỗng → `IonAlert` có ô dán tay.
  - Có nội dung → `extractFromMapsLink`; thành công → `onParsed`, toast "Đã lấy tên và vị trí"; lỗi → toast bằng `toUserMessage`.

**location**
- `geolocation.ts`: `getCurrentPosition(): Promise<LatLng & { accuracy }>` với `enableHighAccuracy: true`, `timeout: 15000`, `maximumAge: 60000`. Ánh xạ lỗi `PERMISSION_DENIED`→`LocationError('denied')`, `POSITION_UNAVAILABLE`→`'unavailable'`, `TIMEOUT`→`'timeout'`.
- `useCurrentPosition({ enabled })`: `{ position, error, status, refresh }`.

**opening-hours**
- `openingHours.ts` (hàm thuần):
  - Kiểu:
    - `Weekday = 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'`.
    - `TimeRange = { open: 'HH:MM', close: 'HH:MM' }`; `close` có thể là `'24:00'`.
    - `OpeningHours = Record<Weekday, TimeRange[]>`.
  - Hằng: `WEEKDAYS` theo thứ tự T2→CN, nhãn `T2, T3, T4, T5, T6, T7, CN`; `MAX_RANGES_PER_DAY = 3`.
  - Hàm:
    - `createDefaultWeek()`: mọi ngày 1 khung `08:00–22:00`.
    - `validateWeek(week)`: định dạng HH:MM, phút chia hết cho 5, không trùng lặp trong cùng ngày, tối đa 3 khung.
    - `isOpenAt(hours|null, date): 'open'|'closed'|'unknown'`:
      - `hours` null → `'unknown'`.
      - Đóng cửa ≤ mở cửa nghĩa là khung qua đêm, kéo sang sáng hôm sau.
      - Giờ đóng cửa là mốc loại trừ.
      - Xét cả khung qua đêm của ngày hôm trước.
    - `formatRanges(ranges)`: `"08:00–22:00, 17:00–23:00"`, rỗng → `"Nghỉ"`, `00:00–24:00` → `"Mở 24h"`.
    - `copyDayToAll(week, day)`.
    - `weekdayOf(date): Weekday`.
- `TimeWheelSheet({ isOpen, value, allowEndOfDay, onConfirm, onDismiss })`:
  - `IonModal` dạng sheet, `breakpoints=[0, 0.5]`, `initialBreakpoint=0.5`.
  - Bên trong là `IonDatetime` với `presentation="time"`, `hourCycle="h23"`, `minuteValues="0,5,10,15,20,25,30,35,40,45,50,55"`, `locale="vi-VN"`. KHÔNG dùng `IonDatetimeButton`.
  - Nút "Xong".
  - Khi `allowEndOfDay` bật: thêm nút "Hết ngày (24:00)".
- `OpeningHoursEditor({ value, onChange })`:
  - Công tắc "Chưa rõ giờ" (bật → `null`).
  - Nút "Mở 24h cả tuần".
  - 7 dòng, mỗi dòng gồm:
    - Nhãn ngày + `IonToggle` "Mở cửa" (tắt → mảng rỗng).
    - Các khung giờ: nút giờ mở, nút giờ đóng, nút xoá khung.
    - Nút "+ khung giờ" (tối đa 3), nút "Mở 24h".
  - Dòng T2 có thêm nút "Áp dụng cho cả tuần".
  - Chạm vào nút giờ → mở `TimeWheelSheet`.
- `OpeningHoursView({ hours })`:
  - Badge "Đang mở" (success) / "Đã đóng" (danger) / "Chưa rõ giờ" (medium).
  - Bảng T2–CN, ngày hôm nay in đậm.

**visits**
- `visitRepository.ts`: `listVisits(placeId)` (sắp `visited_on desc`), `insertVisit({ placeId, visitedOn, note })`, `deleteVisit(id)`.
- `visitService.ts`: `addVisit(input, currentStatus)`: insert lần đi; nếu `currentStatus !== 'visited'` thì cập nhật status của place thành `'visited'`.
- `visitQueries.ts`: `useVisits(placeId)`, `useAddVisit()` (invalidate `['visits', placeId]` và `['places']`), `useDeleteVisit()` (chỉ xoá lần đi rồi invalidate 2 key trên; KHÔNG đổi status — D16).
- `VisitLog({ placeId })`:
  - Mỗi dòng: ngày `dd/MM/yyyy` (`Intl.DateTimeFormat('vi-VN')`) + ghi chú.
  - Vuốt để xoá, có xác nhận.
  - Chưa có lần đi → chữ "Chưa có lần đi nào".
- `AddVisitSheet({ placeId, currentStatus, isOpen, onDismiss })`:
  - `IonModal` sheet chứa:
    - `IonDatetime` `presentation="date"` `preferWheel`, `locale="vi-VN"`; `max` = hôm nay; mặc định là hôm nay.
    - `IonTextarea` ghi chú (≤500).
    - Nút "Lưu".
  - Khi offline, nút "Lưu" bị khoá.

**settings**
- `SettingsPage.tsx` gồm các nhóm:
  - "Tài khoản": email; nút "Kết nối lại Google Drive" (gọi `signInWithGoogle`).
  - "Dữ liệu":
    - "Quản lý nhãn" → `#/settings/tags`.
    - "Xoá ảnh đã lưu tạm" → `clearThumbnails()` + toast.
  - "Ứng dụng": phiên bản (từ `package.json` qua `define`), dòng chữ "Dữ liệu offline: chỉ xem".
  - Nút "Đăng xuất" (danger), có xác nhận.
- Khi `driveLinked === false` hoặc API trả `GoogleReauthRequiredError`: hiện banner "Cần kết nối lại Google Drive" kèm nút.

**spike (Giai đoạn B)**
- `SpikePage.tsx` gồm:
  1. Chế độ hiển thị: `matchMedia('(display-mode: standalone)')` hoặc `navigator.standalone`.
  2. Nút đăng nhập / đăng xuất và email.
  3. Nút "Lấy access token": hiện `expires_at` và thời gian phản hồi.
  4. Nút "Chọn ảnh & upload": upload vào thư mục ảnh, hiện `fileId`, kích thước, thời gian; sau đó hiện `AuthedImage` 400 và 1600.
  5. Ô "Dán link Maps" + nút "Phân tích": hiện kết quả parse.
  6. Nút "Xoá file vừa upload".
  7. Khung log: 20 sự kiện gần nhất, đã che token.

### 6.7 Offline & cache
- `app/queryClient.ts`:
  - `createQueryClient()` với các tuỳ chọn:
    - `gcTime` 7 ngày, `staleTime` 30 s, `networkMode: 'offlineFirst'`.
    - `retry`: tối đa 2 lần, KHÔNG retry với lỗi 4xx / `AuthRequiredError` / `GoogleReauthRequiredError`.
    - `refetchOnWindowFocus: true`.
  - `createPersister()`: `createAsyncStoragePersister` với storage bọc `idb-keyval` (`get`/`set`/`del`), key `wtg-query-cache`.
- `App.tsx`: `PersistQueryClientProvider` với `maxAge` 7 ngày, `buster` = phiên bản app.
- Khi offline:
  - `OfflineBanner` hiển thị.
  - Nút ＋, "Lưu", "Thêm lần đi", "Xoá" bị ẩn hoặc khoá.
  - Ảnh chỉ hiện nếu đã có trong Cache Storage.

### 6.8 Quy tắc UI/UX bắt buộc (từ skill ui-ux-pro-max)
- Vùng chạm ≥ 44×44 px, các vùng chạm cách nhau ≥ 8 px.
- Chừa safe area cho thanh tab và thanh nút dưới cùng (Ionic tự lo; thanh riêng dùng `env(safe-area-inset-bottom)`).
- Tab dưới đáy ≤ 5; nút quay lại hoạt động đúng như trình duyệt.
- Mọi ô nhập đều có nhãn hiển thị (không chỉ dùng placeholder); lỗi hiển thị ngay dưới trường.
- Ô giá dùng `inputmode="numeric"`.
- Icon: SVG ionicons, không dùng emoji; mọi nút chỉ có icon phải có `aria-label`.
- Tương phản ≥ 4.5:1 ở cả hai chế độ sáng và tối.
- Tôn trọng `prefers-reduced-motion`.
- Nhãn hiển thị bằng tiếng Việt.

---

## 7. Jobs (GitHub Actions)
- `jobs/wheretogo_jobs/config.py`: `JobSettings` (pydantic-settings) gồm `supabase_url`, `supabase_secret_key`, `google_client_id`, `google_client_secret`, `token_encryption_key`.
- `supabase_admin.py`: `SupabaseAdmin(http, url, secret_key)`.
  - `select_all(table, columns='*') -> list[dict]`: phân trang bằng header `Range` mỗi lần 1000 dòng; chỉ gửi header `apikey`.
  - `ping()`: `GET /rest/v1/places?select=id&limit=1`.
- `keepalive.py`: `main()` → `ping()`. Lỗi HTTP → log `keepalive_failed` rồi thoát mã 1. Thành công → log `keepalive_ok` (không in dữ liệu).
- `backup.py`: `main()` chạy lần lượt:
  1. Đọc 5 bảng `places`, `tags`, `place_tags`, `photos`, `visits`.
  2. Dựng JSON `{ "format": "wheretogo-backup", "version": 1, "exported_at": ISO-UTC, "tables": {...} }`.
  3. Với mỗi `user_id` trong `google_credentials` (thực tế chỉ 1):
     - Lọc dòng theo user.
     - Lấy access token qua `GoogleTokenService` (tái dùng module của server).
     - `ensure_folder(BACKUP_FOLDER_NAME)`.
     - `upload_json` với tên `wheretogo-backup-YYYY-MM-DD.json`.
     - `list_files` rồi xoá các file cũ hơn 8 bản mới nhất.
  4. Log số dòng từng bảng và số file đã xoá; tuyệt đối không log nội dung.
  5. Có lỗi → thoát mã 1.
- Tests: `test_keepalive.py` và `test_backup.py`, mock HTTP bằng `respx`. Riêng backup kiểm: đúng tên file, xoá đúng file cũ, không upload khi đọc DB lỗi.

---

## 8. CI/CD
- `ci.yml`: chạy khi push hoặc pull_request lên mọi nhánh. Gồm 3 job:
  - `web` (working-directory `web`, Node 24, cache npm): `npm ci` → `npm run lint` → `npm run typecheck` → `npm run test` → `npm run build` (env giả: `VITE_SUPABASE_URL=https://example.supabase.co`, `VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ci`, `VITE_API_BASE_URL=https://example.invalid`).
  - `server` (Python 3.12, `cd server`): `python -m pip install --upgrade "pip>=25.1"` (cờ `--group` cần pip ≥ 25.1) → `pip install -e . --group dev` → `ruff check .` → `ruff format --check .` → `pytest -q`.
  - `jobs` (Python 3.12): `pip install ./server -r jobs/requirements-dev.txt` → `pytest -q jobs/tests`.
- `deploy-web.yml`:
  - Kích hoạt khi push lên `main` có thay đổi trong `web/**` hoặc chính file workflow này, và `workflow_dispatch`.
  - `permissions`: `contents: read`, `pages: write`, `id-token: write`; `concurrency: pages`.
  - Job `build`: checkout → setup-node 24 → `npm ci` → `npm run build`, env lấy từ `vars.VITE_SUPABASE_URL`, `vars.VITE_SUPABASE_PUBLISHABLE_KEY`, `vars.VITE_API_BASE_URL` → `configure-pages` → `upload-pages-artifact` (path `web/dist`).
  - Job `deploy`: `deploy-pages`.
  - Phiên bản các action: dùng major mới nhất được hướng dẫn trong tài liệu GitHub "Using custom workflows with GitHub Pages" tại thời điểm thực hiện.
- `keepalive.yml`: `schedule: cron '23 1 * * *'` (08:23 giờ VN) + `workflow_dispatch`; Python 3.12; `pip install ./server`; `python -m wheretogo_jobs.keepalive` (working-directory `jobs`, `PYTHONPATH=.`); env lấy từ secrets.
- `backup.yml`: `schedule: cron '41 2 * * 0'` (09:41 Chủ nhật giờ VN) + `workflow_dispatch`; tương tự, chạy `python -m wheretogo_jobs.backup`.
- Lưu ý đã biết: GitHub tự tắt lịch chạy của repo public nếu 60 ngày không có commit. `docs/SETUP.md` ghi cách bật lại (Actions → workflow → Enable).

---

## 9. Việc `[USER]` làm (sẽ có hướng dẫn từng bước trong `docs/SETUP.md`)
1. **GitHub:**
   - Tạo repo PUBLIC tên chính xác `WhereToGo`, không tạo README.
   - Settings → Pages → Source: "GitHub Actions".
2. **Supabase:**
   - Tạo project `wheretogo`, region Southeast Asia (Singapore), lưu mật khẩu DB vào trình quản lý mật khẩu.
   - Settings → API Keys: lấy Project URL, publishable key, và tạo 2 secret key: `vercel-backend`, `github-actions`.
   - Kiểm tra Data API đang bật, schema `public` được expose.
3. **Google Cloud:**
   - Tạo project `WhereToGo` (không cần billing), bật "Google Drive API".
   - Google Auth Platform → Branding: tên app `WhereToGo`, email hỗ trợ.
   - Audience: External, bấm Publish → In production.
   - Data Access: thêm các scope `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `.../auth/drive.file`.
   - Clients → Create → Web application `WhereToGo Web`:
     - JavaScript origins: `https://<github-user>.github.io`, `http://localhost:5173`.
     - Redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
   - Lưu Client ID và Client secret.
4. **Supabase Auth:**
   - Providers → Google: bật, dán Client ID/secret, để "Skip nonce check" TẮT.
   - Providers → Email: TẮT.
   - URL Configuration:
     - Site URL: `https://<github-user>.github.io/WhereToGo/`.
     - Redirect URLs: `https://<github-user>.github.io/WhereToGo/**`, `http://localhost:5173/**`, `https://*.trycloudflare.com/**`.
5. **Supabase SQL Editor:** chạy lần lượt 3 file migration.
6. **Khoá mã hoá:** chạy lệnh tôi đưa để sinh `TOKEN_ENCRYPTION_KEY` (Fernet), lưu vào trình quản lý mật khẩu.
7. **Vercel:**
   - Đăng ký bằng GitHub (gói Hobby), import repo `WhereToGo`.
   - Project name `wheretogo-api`; Root Directory `server`.
   - Env (Production): `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (key `vercel-backend`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`, `ALLOWED_ORIGINS=https://<github-user>.github.io,http://localhost:5173`, `LOG_LEVEL=INFO`.
   - Kiểm tra Settings → Functions → Region = `sin1`.
   - Settings → Git → Ignored Build Step: `git diff HEAD^ HEAD --quiet -- .`
   - Ghi lại URL production.
8. **GitHub Actions:**
   - Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_BASE_URL` (= URL Vercel).
   - Secrets: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (key `github-actions`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`.
9. **Máy local:**
   - Tạo `web/.env.local` và `server/.env` từ các file `.example`.
   - Cài cloudflared: `winget install --id Cloudflare.cloudflared`.
10. **Sau lần đăng nhập đầu thành công:** Supabase → Authentication → Settings → TẮT "Allow new users to sign up"; rồi thử đăng nhập bằng MỘT tài khoản Google khác để xác nhận bị từ chối.

---

## 10. Kiểm thử
**Unit test (Vitest):**
- `viNormalize.test.ts`: `"Phở Đặc Biệt"` → `"pho dac biet"`; `"  Cà   phê "` → `"ca phe"`; `"ĐÀ LẠT"` → `"da lat"`.
- `vnd.test.ts`:
  - `formatVnd(150000)` → `"150.000 ₫"`.
  - Đủ 4 trường hợp của `formatVndRange`.
  - `parseVndInput("150.000đ")` → 150000; rỗng → null; quá giới hạn → null.
- `distance.test.ts`:
  - Hà Nội (21.0285, 105.8542) → TP.HCM (10.8231, 106.6297) ≈ 1.137 km (sai số ±1%).
  - `formatDistance(349)` → `"350 m"`; `formatDistance(1234)` → `"1,2 km"`.
- `openingHours.test.ts`:
  - 10:00 trong khung 08:00–22:00 → open.
  - 22:00 → closed (mốc đóng cửa loại trừ).
  - Khung 18:00–02:00 của Thứ 6, xét lúc 01:00 Thứ 7 → open.
  - 00:00–24:00 → open.
  - `hours` null → unknown; mảng rỗng → closed.
  - `validateWeek` bắt lỗi: phút 07, khung chồng nhau, 4 khung trong 1 ngày.
  - `formatRanges`: đủ 3 trường hợp.
- `parseGoogleMapsUrl.test.ts` với 8 URL:
  1. `https://www.google.com/maps/place/Ph%E1%BB%9F+Th%C3%ACn/@21.0169,105.8497,17z/data=!3m1!4b1!4m6!3m5!1s0x3135ab8e0a0f0e8b:0x5e7c6b1d5d5f0b0!8m2!3d21.016943!4d105.852277!16s%2Fg%2F11b6` → tên "Phở Thìn", lat 21.016943, lng 105.852277, placeRef `0x3135ab8e0a0f0e8b:0x5e7c6b1d5d5f0b0`.
  2. `https://www.google.com/maps/@10.7769,106.7009,15z` → không có tên, có toạ độ.
  3. `https://maps.google.com/?q=10.7769,106.7009` → toạ độ.
  4. `https://www.google.com/maps?cid=1234567890123456789` → placeRef `cid:1234567890123456789`.
  5. `https://www.google.com/maps/search/?api=1&query=Cafe+Gi%E1%BA%A3ng&query_place_id=ChIJabc123` → tên "Cafe Giảng", placeRef `ChIJabc123`.
  6. `https://maps.app.goo.gl/AbCd123` → `isShortMapsLink` true, `parse` ném lỗi `needs_resolve`.
  7. `https://example.com/maps/place/x` → ném `InvalidMapsLinkError`.
  8. `https://www.google.com.vn/maps/place/Ch%E1%BB%A3+B%E1%BA%BFn+Th%C3%A0nh/@10.772,106.698,17z` → tên "Chợ Bến Thành", toạ độ lấy từ `@`.
- `placeFilters.test.ts`:
  - Tìm "pho" khớp "Phở Thìn".
  - Lọc nhiều nhãn theo kiểu HOẶC.
  - Lọc theo status.
  - Sắp theo rating: null xuống cuối.
  - Sắp theo khoảng cách: loại địa điểm không có toạ độ và đếm đúng số lượng bị loại.
- `buildGoogleMapsLink.test.ts`: đủ 4 nhánh.
- `googleTokenService.test.ts`: dùng cache khi còn hạn; gọi lại khi còn dưới 60 giây; 2 lời gọi đồng thời chỉ phát 1 request.
- `apiClient.test.ts`: ánh xạ đúng 401, 409 `google_reauth_required`, 500, lỗi mạng.
- `StarRatingInput.test.tsx`: chọn 3 sao; chạm lại → xoá; đủ `aria-label`.

**pytest (server):**
- `test_crypto`: mã hoá rồi giải mã ra đúng giá trị; token hỏng → lỗi.
- `test_auth`: dùng JWKS giả (khoá RSA sinh trong test):
  - Token hợp lệ → OK.
  - Sai audience, hết hạn, sai issuer, role khác `authenticated`, thiếu header → 401.
- `test_google_oauth`: dùng cache khi còn hạn; `invalid_grant` → xoá credential và trả 409; không có credential → 409.
- `test_drive`: đổi đúng hậu tố `=s220` → `=s400`; không có thumbnailLink → `thumbnail_not_ready`; delete trả 404 → coi là thành công; ensure_folder cả nhánh đã có và nhánh tạo mới.
- `test_maps_links`:
  - Chuỗi redirect hợp lệ (2 bước) → OK.
  - Host lạ → 422.
  - Quá 5 bước → 502.
  - URL không phải https → 422.
  - `goo.gl` không có `/maps` → không cho phép.
- `test_routes`: dùng TestClient + dependency override: từng endpoint với trường hợp OK và lỗi chính; preflight CORS từ origin cho phép trả 200; origin lạ không nhận được header CORS.

**Nghiệm thu Spike (iPhone, chế độ standalone, trên URL GitHub Pages) — [GATE B]:**
- S1: Đăng nhập Google xong quay về đúng app (không bị bật sang Safari), hiện email. Kiểm thêm trên PC: thanh địa chỉ không còn `?code=`; tải lại trang ngay sau đó không báo lỗi; app đứng đúng route hash.
- S2: Server ghi nhận refresh token (bước "Lấy access token" chạy được).
- S3: Upload thành công 1 ảnh dưới 5 MB và 1 ảnh trên 5 MB.
- S4: Ảnh thu nhỏ 400 và 1600 hiển thị được.
- S5: Tắt hẳn app rồi mở lại vẫn còn đăng nhập.
- S6: Sau hơn 1 giờ, "Lấy access token" vẫn chạy mà không phải đăng nhập lại.
- S7: Link "Chia sẻ" từ app Google Maps parse ra tên và toạ độ.
- S8: Làm lại S1–S4 và S7 trên Chrome ở Windows.

Có mục nào hỏng → quay lại PLAN để chọn phương án thay thế. Các phương án đã chuẩn bị:
- Đăng nhập lỗi: chuyển sang implicit flow, hoặc đăng nhập bằng OTP email.
- Upload resumable lỗi CORS: dùng multipart cho ảnh ≤ 5 MB, ảnh lớn hơn thì server xin session rồi trả session URI.

**Nghiệm thu MVP — [GATE D]:** danh sách D-1…D-13 ở mục 12.

---

## 11. Rủi ro còn lại
| Rủi ro | Xử lý |
|---|---|
| Lỗi đăng nhập ở chế độ standalone | Kiểm ở Spike trước khi làm tính năng |
| CORS với `Location` khi upload resumable | Kiểm ở Spike |
| IonDatetime lịch bị trắng trên iOS 26.2 (bug #30933, đã sửa ở nightly) | Chỉ dùng dạng bánh xe (`presentation="time"`, `preferWheel`) |
| Vercel khởi động nguội làm ảnh hiện chậm | Có cache ảnh; app vẫn dùng được |
| Supabase bị tạm dừng | Job ping hằng ngày; Supabase có email cảnh báo |
| Lịch GitHub bị tắt sau 60 ngày không commit | Ghi cách bật lại trong SETUP.md |
| Người lạ đăng ký dùng app | Tắt đăng ký sau lần đăng nhập đầu (D24); API luôn yêu cầu JWT |
| Tag "latest" của npm là bản mới (TS 7, Vite 8, React Router 7) | Ghim phiên bản như mục 3 |

---

## 12. Giai đoạn thực hiện

| Giai đoạn | Ai làm | Nội dung | Kết thúc bằng |
|---|---|---|---|
| **A. Nền móng & code nền** | Tôi | Git, migrations SQL, toàn bộ server + test, jobs + test, khung web + đăng nhập + upload + ảnh + parse link + trang Spike, CI/CD, `docs/SETUP.md`. Chạy lint/test/build trên máy | **GATE A**: bạn tạo tài khoản & khoá theo `docs/SETUP.md` (mục 9, bước 1–9) và cho phép push |
| **B. Deploy & Spike** | Tôi + bạn | Push, kiểm CI, GitHub Pages, Vercel `/api/health`; bạn thử S1–S8 trên iPhone | **GATE B**: S1–S8 đạt (hỏng → quay lại PLAN) |
| **C. Tính năng MVP** | Tôi | Toàn bộ mục 6.6 còn lại, offline, xoá Spike, test, build, push | Deploy thành công |
| **D. Nghiệm thu** | Bạn | Danh sách nghiệm thu D-1…D-13 trên iPhone + PC, khoá đăng ký (D24), chạy tay 2 job | **GATE D**: bạn xác nhận |

Nghiệm thu Giai đoạn D:
- **D-1:** Dán link "Chia sẻ" từ Google Maps → tên và toạ độ tự điền.
  - Thêm 2 ảnh: 1 chụp mới, 1 từ thư viện.
  - Chọn 2 nhãn, trạng thái, số sao, giá, giờ mở cửa (bằng bánh xe), ghi chú → Lưu.
  - Địa điểm hiện trong danh sách kèm ảnh nhỏ.
- **D-2:** Sửa địa điểm: đổi giờ mở cửa, thêm ảnh thứ 3, xoá 1 ảnh → dữ liệu đúng, và ảnh bị xoá cũng mất khỏi thư mục "WhereToGo Photos" trên Drive.
- **D-3:** Thêm lần đi → trạng thái tự thành "Đã đi". Xoá lần đi → trạng thái giữ nguyên.
- **D-4:** Tìm kiếm và lọc:
  - Gõ "pho" ra "Phở…".
  - Lọc 2 nhãn cùng lúc (kiểu HOẶC).
  - Lọc theo trạng thái.
  - Sắp xếp "Đánh giá cao".
- **D-5:** Tab "Gần tôi": có hỏi quyền vị trí, sắp đúng theo khoảng cách, báo số địa điểm chưa có vị trí.
- **D-6:** Nút "Mở Google Maps" mở đúng app Google Maps (hoặc trang web Google Maps).
- **D-7:** Bật chế độ máy bay:
  - Danh sách và chi tiết vẫn xem được.
  - Ảnh đã xem trước đó vẫn hiện.
  - Các nút ＋, "Sửa", "Thêm lần đi" bị ẩn.
- **D-8:** Sửa trên Chrome PC → iPhone kéo để làm mới thì thấy thay đổi, và làm ngược lại.
- **D-9:** Quản lý nhãn: đổi tên, xoá (nhãn biến mất khỏi các địa điểm).
- **D-10:** Chế độ tối hiển thị đúng; chữ tiếng Việt có dấu hiển thị đúng font; không có chỗ nào bị tai thỏ hoặc thanh vuốt che.
- **D-11:** Xoá địa điểm → mọi ảnh của nó biến mất khỏi Drive.
- **D-12:** Chạy tay workflow "backup" → có file `wheretogo-backup-YYYY-MM-DD.json` trong thư mục "WhereToGo Backups". Chạy tay "keepalive" → thành công.
- **D-13:** Sau khi tắt đăng ký (D24), đăng nhập bằng tài khoản Google khác → bị từ chối.

---

IMPLEMENTATION CHECKLIST:

**Giai đoạn A — Nền móng & code nền (tôi làm)**

1. Tạo `docs/PLAN.md` với toàn văn kế hoạch đã duyệt này.
2. Chạy `git init -b main` ở `D:\Projects\WhereToGo`.
3. Tạo `.gitignore`: `node_modules/`, `dist/`, `dev-dist/`, `coverage/`, `.env`, `.env.*`, `!.env.example`, `__pycache__/`, `*.pyc`, `.venv/`, `.pytest_cache/`, `.ruff_cache/`, `.vercel/`, `*.log`.
4. Tạo `.editorconfig`: UTF-8, LF, thụt 2 dấu cách, riêng `*.py` 4 dấu cách, có dòng trống cuối file.
5. Tạo `README.md` bằng tiếng Việt: mô tả app, 5 thành phần (mục 1), cây thư mục, lệnh dev/test, liên kết `docs/SETUP.md` và `docs/PLAN.md`.
6. Tạo `supabase/migrations/20260924000100_init_schema.sql` đúng mục 4.1.
7. Tạo `supabase/migrations/20260924000200_rls_and_grants.sql` đúng mục 4.2.
8. Tạo `supabase/migrations/20260924000300_functions.sql` đúng mục 4.3.
9. Tạo cấu hình server theo mục 3 và 5.1:
   - `server/pyproject.toml`: dependencies, `[dependency-groups] dev`, hatchling, cấu hình ruff (line-length 100, target py310).
   - `server/.python-version`, `server/vercel.json`.
   - `server/.env.example`: đủ các khoá của `Settings`, giá trị mẫu.
10. Tạo `server/wheretogo_api/__init__.py`, `config.py` (5.1) và `logging_setup.py` (5.1).
11. Tạo `server/wheretogo_api/errors.py` (5.2).
12. Tạo `server/wheretogo_api/crypto.py` (5.4).
13. Tạo `server/wheretogo_api/auth.py` (5.3).
14. Tạo `server/wheretogo_api/credentials_repository.py` (5.5).
15. Tạo `server/wheretogo_api/google_oauth.py` (5.6).
16. Tạo `server/wheretogo_api/drive.py` (5.7).
17. Tạo `server/wheretogo_api/maps_links.py` (5.8).
18. Tạo `server/wheretogo_api/deps.py` (5.9).
19. Tạo `server/wheretogo_api/routes/__init__.py`, `health.py`, `google.py`, `drive.py`, `photos.py`, `maps.py` theo bảng endpoint 5.9.
20. Tạo `server/wheretogo_api/main.py` (`create_app`, 5.1) và `server/app.py`.
21. Tạo `server/tests/conftest.py` (fixtures: settings giả, JWKS/RSA giả, `respx`, `TestClient` có dependency override) và 6 file test theo mục 10.
22. Tạo venv `server/.venv` bằng Python 3.10 có sẵn trên máy, nâng pip lên ≥ 25.1, rồi `pip install -e . --group dev`.
23. Chạy `ruff check .`, `ruff format --check .`, `pytest -q` trong `server/`. Tất cả phải đạt, không thì sửa code (không sửa spec).
24. Tạo `jobs/requirements-dev.txt` và `jobs/wheretogo_jobs/__init__.py`, `config.py`, `supabase_admin.py`, `keepalive.py`, `backup.py` (mục 7).
25. Tạo `jobs/tests/test_keepalive.py` và `jobs/tests/test_backup.py` (mục 7).
26. Cài `./server` và `jobs/requirements-dev.txt` vào cùng venv; chạy `pytest -q jobs/tests` → đạt.
27. Tạo `web/package.json`:
    - `name` `wheretogo-web`, `version` `0.1.0`, `private`, `type: module`.
    - scripts: `dev`=`vite`, `build`=`tsc --noEmit && vite build`, `preview`=`vite preview`, `lint`=`eslint .`, `typecheck`=`tsc --noEmit`, `test`=`vitest run`, `format`=`prettier --write .`, `icons`=`pwa-assets-generator --preset minimal-2023 public/logo.svg`.
28. Cài dependencies và devDependencies của web đúng các range ở mục 3. Với `vitest` và `eslint`, xác định major bằng `npm view` theo quy tắc mục 3.
29. Tạo các file cấu hình web:
    - `web/tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `jsx: react-jsx`, `moduleResolution: bundler`, `target: ES2022`, `lib: [DOM, DOM.Iterable, ES2022]`, `types: [vite/client]`, `include: [src, vitest.setup.ts]`.
    - `web/tsconfig.node.json`: cho `vite.config.ts`.
    - `web/vitest.setup.ts`: nạp `@testing-library/jest-dom/vitest`.
    - `web/eslint.config.js`: flat config gồm `typescript-eslint` recommended + `eslint-plugin-react-hooks` recommended; bỏ qua `dist`, `dev-dist`.
    - `web/.prettierrc.json`: `singleQuote: true`, `semi: true`, `printWidth: 100`.
30. Tạo `web/vite.config.ts` đúng mục 6.2. Thêm `define: { __APP_VERSION__ }` lấy từ `package.json`; khai báo biến này trong `src/vite-env.d.ts`.
31. Tạo `web/index.html` (mục 6.2) và `web/.env.example` (3 biến).
32. Tạo `web/public/logo.svg` (mục 6.2); chạy `npm run icons` để sinh icon PNG và favicon vào `public/`.
33. Tạo `web/src/theme/fonts.css`, `variables.css`, `global.css` (mục 6.3). Các giá trị shade/tint tính theo công thức ở 6.3 và ghi sẵn thành hằng số.
34. Tạo `web/src/config/env.ts` (6.2).
35. Tạo `web/src/lib/logger.ts`, `errors.ts`, `supabaseClient.ts`, `apiClient.ts` (6.5).
36. Tạo `web/src/lib/apiClient.test.ts` (mục 10).
37. Tạo `web/src/features/auth/authService.ts`, `AuthProvider.tsx` (chưa có seed nhãn — thêm ở bước 67), `useAuth.ts`, `RequireAuth.tsx`, `LoginPage.tsx` (6.6).
38. Tạo `web/src/features/google/googleTokenService.ts` (+ `.test.ts`), `driveFolderApi.ts`, `driveUpload.ts` (6.6).
39. Tạo `web/src/features/photos/imageConversion.ts`, `thumbnailCache.ts`, `AuthedImage.tsx` (6.6).
40. Tạo `web/src/features/maps-link/parseGoogleMapsUrl.ts` (+ `.test.ts` 8 ca), `mapsLinkService.ts` (6.6).
41. Tạo `web/src/features/spike/SpikePage.tsx` (6.6, mục spike).
42. Tạo `web/src/app/App.tsx` bản Giai đoạn A:
    - `IonApp` → `AuthProvider` → `IonReactHashRouter` → `IonRouterOutlet`.
    - Route `#/login` và `#/spike` (bọc `RequireAuth`).
    - `/` chuyển về `#/spike`.
43. Tạo `web/src/main.tsx` đúng thứ tự mục 6.1.
44. Chạy `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` trong `web/` (dùng env giả như CI) → tất cả đạt; kiểm `dist/manifest.webmanifest` như 6.2.
45. Tạo `.github/workflows/ci.yml`, `deploy-web.yml`, `keepalive.yml`, `backup.yml` (mục 8).
46. Tạo `docs/SETUP.md`, gồm:
    - Hướng dẫn từng bước mục 9, đúng thứ tự: GitHub → Supabase project → Google Cloud → Supabase Auth → SQL → khoá Fernet → Vercel → GitHub Variables/Secrets → file env local.
    - Lệnh sinh khoá Fernet bằng Python.
    - Cách chạy local: `npm run dev`; `uvicorn app:app --reload --port 8000`; `cloudflared tunnel --url http://localhost:5173`. Lưu ý: khi test qua tunnel phải dùng API trên Vercel.
    - Cách bật lại workflow có lịch chạy bị tự tắt.
    - Bước kiểm D24.
47. `git add -A` các file của Giai đoạn A. Bạn tự commit và push (tôi không chạy `git commit`/`git push`).
48. **[GATE A]** Dừng. Báo bạn làm `docs/SETUP.md` bước 1–9, rồi gửi lại cho tôi 3 giá trị KHÔNG bí mật: GitHub username, URL Vercel, project ref Supabase. Chờ bạn cho phép push.

**Giai đoạn B — Deploy & Spike**

49. Bạn tự tạo remote `origin` và `git push -u origin main` (đã làm: repo `Bui-Tung-Hung/WhereToGo`).
50. Kiểm tra trên GitHub Actions: `ci` xanh và `deploy-web` xanh. Lỗi → sửa rồi commit/push lại (vẫn trong phạm vi spec).
51. Gọi `GET https://<vercel-url>/api/health` → `{"status":"ok"}`. Mở `https://<username>.github.io/WhereToGo/` → thấy trang đăng nhập.
52. **[USER]** Trên iPhone: mở URL bằng Safari → Chia sẻ → Thêm vào MH chính → mở từ icon → chạy S1–S7. Trên Chrome PC → chạy S8. Báo kết quả.
53. **[GATE B]** Tất cả đạt → sang Giai đoạn C. Có mục hỏng → quay về PLAN với các phương án dự phòng ở mục 10.

**Giai đoạn C — Tính năng MVP (tôi làm)**

54. Tạo `web/src/shared/text/viNormalize.ts`, `geo/distance.ts`, `money/vnd.ts`, mỗi file kèm `.test.ts` (6.5, mục 10).
55. Tạo `web/src/shared/hooks/useOnlineStatus.ts` và các component dùng chung: `StarRatingInput.tsx` (+ `.test.tsx`), `StarRatingView.tsx`, `StatusChip.tsx`, `OfflineBanner.tsx`, `EmptyState.tsx`, `PriceRangeInput.tsx` (6.5).
56. Tạo `web/src/app/queryClient.ts` (6.7).
57. Tạo `web/src/features/tags/tagRepository.ts`, `tagQueries.ts`, `TagPicker.tsx`, `TagFilterBar.tsx`, `ManageTagsPage.tsx` (6.6).
58. Tạo `web/src/features/places/types.ts`, `placeSchema.ts`, `placeRepository.ts`, `placeService.ts`, `placeQueries.ts` (6.6).
59. Tạo `web/src/features/places/placeFilters.ts` (+ `.test.ts`) và `buildGoogleMapsLink.ts` (+ `.test.ts`).
60. Tạo `web/src/features/photos/photoRepository.ts`, `photoService.ts`, `PhotoPicker.tsx`, `PhotoGallery.tsx` (6.6).
61. Tạo `web/src/features/maps-link/PasteMapsLinkButton.tsx` (6.6).
62. Tạo `web/src/features/location/geolocation.ts` và `useCurrentPosition.ts` (6.6).
63. Tạo `web/src/features/opening-hours/openingHours.ts` (+ `.test.ts`), `TimeWheelSheet.tsx`, `OpeningHoursEditor.tsx`, `OpeningHoursView.tsx` (6.6).
64. Tạo `web/src/features/visits/visitRepository.ts`, `visitService.ts`, `visitQueries.ts`, `VisitLog.tsx`, `AddVisitSheet.tsx` (6.6).
65. Tạo `web/src/features/places/PlaceCard.tsx`, `PlaceListPage.tsx`, `PlaceDetailPage.tsx`, `PlaceFormPage.tsx` (6.6).
66. Tạo `web/src/features/settings/SettingsPage.tsx` (6.6).
67. Cập nhật `AuthProvider.tsx`: gọi `seedDefaultTags` khi chuyển sang `signed_in`, thêm trạng thái `driveLinked`, và banner "Cần kết nối lại Google Drive" (6.6).
68. Tạo `web/src/app/Tabs.tsx`. Cập nhật `App.tsx`:
    - Bọc thêm `PersistQueryClientProvider` (6.7).
    - Khai báo đủ các route ở 6.4.
    - `/` chuyển về `#/tabs/explore`.
    - Bỏ route `#/spike`.
69. Xoá thư mục `web/src/features/spike/`.
70. Chạy `npm run lint`, `typecheck`, `test`, `build` trong `web/`; chạy lại `pytest` cho server và jobs → tất cả đạt.
71. Tôi `git add` các file của Giai đoạn C; bạn tự commit "Giai đoạn C: tính năng MVP" và push.
72. Kiểm `ci` và `deploy-web` xanh; mở URL Pages trên PC để kiểm nhanh luồng đăng nhập và danh sách.

**Giai đoạn D — Nghiệm thu (bạn làm)**

73. **[USER]** Làm `docs/SETUP.md` bước 10: tắt "Allow new users to sign up" rồi kiểm bằng một tài khoản Google khác (D-13).
74. **[USER]** GitHub → Actions → chạy tay `keepalive` và `backup` (D-12).
75. **[USER]** Chạy nghiệm thu D-1 đến D-11 trên iPhone (app ở màn hình chính) và Chrome PC; báo kết quả.
76. **[GATE D]** Tất cả đạt → xong MVP. Có lỗi → tôi ghi lại và quay về PLAN nếu cách sửa vượt ngoài spec.
