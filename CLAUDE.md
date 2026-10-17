# WhereToGo: hướng dẫn cho agent

WhereToGo là PWA tiếng Việt, dùng để lưu những nơi muốn đến: quán ăn, quán uống, chỗ chơi, du lịch. Mỗi nơi lưu kèm ảnh trong Google Drive của chính người dùng, giá, giờ mở cửa, nhóm, nhãn và lần đi.

Kiến trúc chính (chi tiết ở [README.md](README.md)):
- `web/`: React 19, Ionic React 9, Vite, chạy trên GitHub Pages.
- `server/`: FastAPI, chạy trên Vercel.
- `supabase/`: Postgres, đăng nhập Google, RLS.
- `jobs/`: GitHub Actions.

## Cách làm việc với chủ repo

- Chủ repo làm theo các chế độ RESEARCH → INNOVATE → PLAN → EXECUTE. **Chỉ sửa code khi chủ repo gõ `ENTER EXECUTE MODE`** hoặc yêu cầu rõ ràng. Ở các chế độ khác chỉ đọc code và viết tài liệu trong `docs/`.
- Bước có `[USER]` (tài khoản, khoá bí mật, tên miền, dashboard, việc làm trên iPhone) thì hỏi chủ repo, không tự làm. `[GATE]` là điểm dừng, phải chờ chủ repo xác nhận.
- Giao diện, tài liệu và JSDoc viết bằng tiếng Việt, có đủ dấu.

## Tài liệu (đọc trước khi làm)

| File | Nội dung |
|---|---|
| [docs/PLAN.md](docs/PLAN.md) | Kế hoạch gốc, quyết định D1–D26 |
| [docs/SETUP.md](docs/SETUP.md) | Tạo tài khoản, khoá, biến môi trường, chạy local, chạy migration bằng tay |
| [docs/UI-REDESIGN.md](docs/UI-REDESIGN.md) | Research giao diện mới từ Stitch, quyết định U1–U45 và M1–M8 |
| [docs/PLAN-UI-1.md](docs/PLAN-UI-1.md) | Giao diện mới phần 1, **đã làm** ở commit `ff25e89` |
| [docs/PLAN-UI-2.md](docs/PLAN-UI-2.md) | Giao diện mới phần 2: một phong cách "Sổ tay", đủ trang, mở công khai. **Đang ở chế độ PLAN, chưa làm** |
| [docs/design/README.md](docs/design/README.md) | **Điểm bắt đầu cho thiết kế phần 2.** Thứ tự đọc, bảng tra màn ↔ bản vẽ ↔ mục đặc tả, cách đọc file bản vẽ, hướng dẫn implement |

Khi các tài liệu thiết kế nói khác nhau, ưu tiên theo thứ tự: PLAN-UI-2.md > docs/design/SPEC.md > docs/design/mockups/ > docs/design/MOCKUP-KIT.md.

## Quy ước code

- **Component:** viết dạng `export function X(props: XProps): React.JSX.Element`, chỉ dùng named export, props có JSDoc tiếng Việt.
- **Tổ chức file:** chia theo tính năng trong `web/src/features/<tên>/`; phần dùng chung đặt ở `web/src/shared/` và `web/src/lib/`.
- **Định dạng:** Prettier dùng `singleQuote`, `semi`, `printWidth` 100.
- **Test:** Vitest với `globals: false`, tên test viết bằng tiếng Việt.
- **Kiểm tra trước khi commit:**
  - web: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run check:size`;
  - server: `ruff check .` và `pytest -q`;
  - jobs: `pytest -q jobs/tests`.
- **Migration:** file SQL trong `supabase/migrations/`, chạy tay trong SQL Editor. Bảng mới phải có `GRANT` trong migration (Supabase đổi mặc định từ 2026-10-30).
