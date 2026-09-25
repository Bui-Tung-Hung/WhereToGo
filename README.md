# WhereToGo

Kho địa điểm cá nhân: nơi ăn uống, vui chơi, du lịch, hẹn hò mà bạn muốn nhớ. Mỗi địa điểm có ảnh gốc, địa chỉ, đánh giá của riêng bạn, khoảng giá, giờ mở cửa, link Google Maps và nhật ký các lần đi. App chạy trên iPhone dưới dạng web app ("Thêm vào Màn hình chính") và trên trình duyệt máy tính, dữ liệu đồng bộ hai chiều.

## Kiến trúc

| Thành phần | Công nghệ | Nơi chạy |
|---|---|---|
| Web app (`web/`) | React 19 + TypeScript + Ionic React 9 (PWA) | GitHub Pages |
| API (`server/`) | Python + FastAPI | Vercel (region Singapore) |
| Dữ liệu & đăng nhập | Supabase (Postgres + Auth Google + RLS) | Supabase (Singapore) |
| Ảnh gốc & bản sao lưu | Google Drive của bạn (quyền `drive.file`) | Google Drive |
| Việc định kỳ (`jobs/`) | Python | GitHub Actions |

## Cấu trúc thư mục

```
WhereToGo/
├─ docs/            PLAN.md (kế hoạch), SETUP.md (hướng dẫn tạo tài khoản & khoá)
├─ supabase/        migrations SQL
├─ server/          API FastAPI (Vercel)
├─ jobs/            job giữ Supabase hoạt động & sao lưu (GitHub Actions)
├─ web/             web app React + Ionic
└─ .github/         CI/CD workflows
```

## Lệnh thường dùng

Web (`web/`):

- `npm install` — cài thư viện
- `npm run dev` — chạy dev server tại `http://localhost:5173`
- `npm run lint` / `npm run typecheck` / `npm run test` / `npm run build`

Server (`server/`, trong venv):

- `pip install -e . --group dev` — cài thư viện (cần pip ≥ 25.1)
- `uvicorn app:app --reload --port 8000` — chạy API local
- `ruff check .` / `pytest -q`

Jobs: `pytest -q jobs/tests` (cài `./server` và `jobs/requirements-dev.txt` trước).

## Tài liệu

- [docs/SETUP.md](docs/SETUP.md) — tạo tài khoản, khoá, biến môi trường, chạy local
- [docs/PLAN.md](docs/PLAN.md) — kế hoạch triển khai đã duyệt
