# Hướng dẫn thiết lập WhereToGo

Tài liệu này dành cho **bạn** (chủ app) làm một lần. Thực hiện **đúng thứ tự** từ bước 1 đến bước 9, vì bước sau cần thông tin từ bước trước. Bước 10 làm sau khi đăng nhập thành công lần đầu.

> **Quy ước:**
> - `<github-user>` là tên tài khoản GitHub của bạn.
> - `<project-ref>` là mã project Supabase (phần đứng trước `.supabase.co` trong Project URL).
> - `<vercel-url>` là URL production của API trên Vercel, ví dụ `https://wheretogo-api.vercel.app`.
>
> **Bảo mật:** các giá trị có chữ "secret", "Client secret" và khoá mã hoá là **bí mật**. Chỉ dán chúng vào đúng chỗ ghi trong hướng dẫn. Không gửi cho ai, không commit vào git. Nên lưu chúng trong trình quản lý mật khẩu.

---

## Bước 1 — GitHub

1. Vào https://github.com/new và tạo repository:
   - **Repository name:** `WhereToGo` (đúng chữ hoa/thường).
   - **Visibility:** Public.
   - **KHÔNG** tích "Add a README", không thêm .gitignore hay license.
2. Mở repo → **Settings → Pages** → mục *Build and deployment* → **Source: GitHub Actions**.

## Bước 2 — Supabase: tạo project

1. Vào https://supabase.com/dashboard, đăng nhập (có thể dùng GitHub) → **New project**:
   - **Name:** `wheretogo`
   - **Database password:** bấm Generate rồi lưu vào trình quản lý mật khẩu.
   - **Region:** Southeast Asia (Singapore).
2. Chờ project tạo xong, vào **Project Settings → API Keys**:
   - Ghi lại **Project URL** (`https://<project-ref>.supabase.co`) và **publishable key** (bắt đầu bằng `sb_publishable_`).
   - Tạo **2 secret key** (bắt đầu bằng `sb_secret_`): đặt tên `vercel-backend` và `github-actions`. Lưu cả hai vào trình quản lý mật khẩu.
3. Vào **Project Settings → Data API**: kiểm tra Data API đang **bật** và schema `public` nằm trong danh sách *Exposed schemas*.

## Bước 3 — Google Cloud: OAuth + Drive API

1. Vào https://console.cloud.google.com → tạo project mới tên `WhereToGo`. Không cần bật billing.
2. **APIs & Services → Library** → tìm "Google Drive API" → **Enable**.
3. **Google Auth Platform** (hoặc "OAuth consent screen"):
   - **Branding:** App name `WhereToGo`; User support email và Developer contact là email của bạn.
   - **Audience:** User type **External** → bấm **Publish app** để chuyển sang **In production**. Đây là điều kiện để refresh token không hết hạn sau 7 ngày. Quyền `drive.file` không cần Google xét duyệt.
   - **Data Access → Add or remove scopes:** chọn
     - `openid`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/drive.file`
4. **Clients → Create client** → Application type **Web application**, tên `WhereToGo Web`:
   - **Authorized JavaScript origins:** `https://<github-user>.github.io` và `http://localhost:5173`
   - **Authorized redirect URIs:** `https://<project-ref>.supabase.co/auth/v1/callback`
   - Bấm **Create**. Lưu **Client ID** và **Client secret**.

## Bước 4 — Supabase Auth

1. **Authentication → Sign In / Providers → Google**: bật **Enable**, dán **Client ID** và **Client Secret** từ bước 3. Để **Skip nonce check** ở trạng thái **TẮT**. Bấm Save.
2. **Authentication → Sign In / Providers → Email**: **TẮT** provider Email.
3. **Authentication → URL Configuration**:
   - **Site URL:** `https://<github-user>.github.io/WhereToGo/`
   - **Redirect URLs** (thêm cả 3):
     - `https://<github-user>.github.io/WhereToGo/**`
     - `http://localhost:5173/**`
     - `https://*.trycloudflare.com/**`

## Bước 5 — Supabase: tạo bảng

Vào **SQL Editor → New query**. Chạy lần lượt từng file dưới đây: dán toàn bộ nội dung một file → **Run** → kiểm tra không có lỗi rồi mới sang file tiếp theo.

1. `supabase/migrations/20260924000100_init_schema.sql`
2. `supabase/migrations/20260924000200_rls_and_grants.sql`
3. `supabase/migrations/20260924000300_functions.sql`

## Bước 6 — Khoá mã hoá refresh token

Chạy lệnh sau trong thư mục gốc của repo, dùng Python trong venv của server (đã có thư viện `cryptography`):

```bash
server/.venv/Scripts/python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Chuỗi in ra chính là `TOKEN_ENCRYPTION_KEY`. Hãy lưu vào trình quản lý mật khẩu. **Nếu làm mất khoá này, bạn sẽ phải đăng nhập lại Google để cấp quyền Drive.**

## Bước 7 — Vercel (API Python)

1. Vào https://vercel.com/signup → đăng ký bằng GitHub (gói **Hobby**, không cần thẻ).
2. Repo phải đã có code trên GitHub. Nếu chưa có, cho phép tôi push trước (xem bước 48 của kế hoạch), rồi mới làm tiếp.
3. **Add New → Project** → Import repo `WhereToGo`:
   - **Project Name:** `wheretogo-api`
   - **Root Directory:** `server`
   - **Environment Variables** (môi trường Production):

     | Tên | Giá trị |
     |---|---|
     | `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
     | `SUPABASE_SECRET_KEY` | secret key `vercel-backend` |
     | `GOOGLE_CLIENT_ID` | Client ID ở bước 3 |
     | `GOOGLE_CLIENT_SECRET` | Client secret ở bước 3 |
     | `TOKEN_ENCRYPTION_KEY` | khoá ở bước 6 |
     | `ALLOWED_ORIGINS` | `https://<github-user>.github.io,http://localhost:5173` |
     | `LOG_LEVEL` | `INFO` |

   - Bấm **Deploy**.
4. **Settings → Functions → Function Region:** kiểm tra là `Singapore (sin1)`. File `server/vercel.json` đã khai báo sẵn giá trị này.
5. **Settings → Git → Ignored Build Step:** chọn Custom, nhập `git diff HEAD^ HEAD --quiet -- .`
6. Ghi lại URL production (`<vercel-url>`). Mở `<vercel-url>/api/health` phải thấy `{"status":"ok"}`.

## Bước 8 — GitHub Actions: biến & bí mật

Vào repo → **Settings → Secrets and variables → Actions**.

**Tab Variables** (không bí mật; sẽ được nhúng vào web app):

| Tên | Giá trị |
|---|---|
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | publishable key |
| `VITE_API_BASE_URL` | `<vercel-url>` (không có dấu `/` ở cuối) |

**Tab Secrets:**

| Tên | Giá trị |
|---|---|
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_SECRET_KEY` | secret key `github-actions` |
| `GOOGLE_CLIENT_ID` | Client ID |
| `GOOGLE_CLIENT_SECRET` | Client secret |
| `TOKEN_ENCRYPTION_KEY` | khoá ở bước 6 |

## Bước 9 — Môi trường trên máy bạn

1. Tạo `web/.env.local` từ `web/.env.example` và điền `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_BASE_URL`.
   - Khi chạy API local, đặt `VITE_API_BASE_URL=http://localhost:8000`.
   - Khi test trên iPhone qua tunnel, API phải dùng bản trên Vercel (`<vercel-url>`).
2. Tạo `server/.env` từ `server/.env.example` và điền cùng các giá trị như trên Vercel (dùng secret key `vercel-backend`).
3. Cài cloudflared để test trên iPhone:

   ```bash
   winget install --id Cloudflare.cloudflared
   ```

### Chạy local

- **Web:** trong `web/` chạy `npm run dev`, rồi mở `http://localhost:5173` trên máy tính.
- **API:** trong `server/`, dùng venv, chạy `uvicorn app:app --reload --port 8000`.
- **Test trên iPhone (cần HTTPS):**
  1. Chạy `npm run dev`.
  2. Ở cửa sổ khác, chạy `cloudflared tunnel --url http://localhost:5173`.
  3. Mở URL `https://....trycloudflare.com` hiện ra trên iPhone.
  4. Lúc này `VITE_API_BASE_URL` phải trỏ tới `<vercel-url>`.

## Bước 10 — Khoá đăng ký (sau lần đăng nhập đầu tiên)

1. Đăng nhập app bằng tài khoản Google của bạn ít nhất một lần.
2. Supabase → **Authentication → Settings** (hoặc Sign In / Providers → User Signups) → **TẮT** "Allow new users to sign up".
3. **Kiểm tra:** mở app ở cửa sổ ẩn danh, đăng nhập bằng **một tài khoản Google khác**. Phải bị từ chối, thường kèm thông báo kiểu "Signups not allowed". Tài khoản của bạn vẫn đăng nhập bình thường.

---

## Việc định kỳ (GitHub Actions)

- `keepalive` chạy hằng ngày để Supabase không bị tạm dừng.
- `backup` chạy Chủ nhật hằng tuần: lưu file JSON vào thư mục "WhereToGo Backups" trên Drive, giữ 8 bản gần nhất.
- Muốn chạy ngay: repo → **Actions** → chọn workflow → **Run workflow**.
- **Lịch bị tự tắt:** GitHub tự tắt lịch chạy nếu repo public **60 ngày không có commit**. Khi đó vào **Actions** → chọn `keepalive` hoặc `backup` → bấm **Enable workflow**. Supabase cũng gửi email cảnh báo khoảng 1 tuần trước khi tạm dừng project.
