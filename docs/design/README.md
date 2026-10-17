# Thiết kế "Sổ tay": bộ tài liệu cho người và agent

Trạng thái: **PLAN**. Chưa dòng code nào được làm theo bộ tài liệu này. Tài liệu viết ngày 2026-10-17, dựa trên code ở commit `ff25e89`. Chỉ bắt đầu sửa code khi chủ repo gõ `ENTER EXECUTE MODE` (quy ước của [PLAN-UI-1.md](../PLAN-UI-1.md)).

Mục tiêu của thiết kế:
- WhereToGo mở cho mọi người dùng, không còn là app của riêng chủ repo. Quyết định D24 cũ bị thay.
- Toàn bộ app dùng một phong cách chung, gọi là **"Sổ tay"**, có cả bản sáng và bản tối. Quyết định U28 cũ bị thay.
- App có đủ các trang cần thiết: landing page, trang đăng nhập, các bước bắt đầu, các trang chính, tài khoản và dữ liệu, trợ giúp.

---

## 1. Đọc theo thứ tự này

| # | File | Là gì | Khi nào dùng |
|---|---|---|---|
| 1 | [../PLAN-UI-2.md](../PLAN-UI-2.md) | **Kế hoạch chính, tiếng Việt.** Gồm quyết định V1–V37, sơ đồ trang, hệ thiết kế, câu chữ giao diện đã chốt, đặc tả từng trang, việc bắt buộc trước khi mở đăng ký, giai đoạn P0–P7 và câu hỏi còn mở Q1–Q14 | Luôn đọc trước. Mục 0 tóm tắt toàn bộ |
| 2 | [SPEC.md](SPEC.md) | Bản đặc tả gốc bằng tiếng Anh, cùng nội dung với PLAN-UI-2.md (câu chữ giao diện vẫn bằng tiếng Việt) | Tra nhanh số liệu: mã màu, tỉ lệ tương phản, cỡ chữ, route |
| 3 | [mockups/](mockups/) | Mã nguồn 34 bản vẽ mẫu (`.dc.html`) và bố cục canvas (`canvas.json`) | Xem bố cục, khoảng cách, thứ tự khối của từng màn |
| 4 | [MOCKUP-KIT.md](MOCKUP-KIT.md) | Khối CSS token và các đoạn HTML linh kiện đã dùng để vẽ bản mẫu. Giá trị khớp SPEC §4 | Khi dựng `tokens.css` và các linh kiện dùng chung |
| 5 | [research/](research/) | Tài liệu làm căn cứ cho thiết kế | Khi cần biết vì sao có một quyết định, hoặc code hiện tại nằm ở đâu |

Năm file trong `research/`:
- `screens.md`: mọi màn hình và trạng thái hiện có, các lỗi trải nghiệm, lý do app trông như "chỉ có 2 trang".
- `tokens.md`: rà soát hệ màu, phông và tương phản hiện tại.
- `multiuser.md`: những gì phải đổi để mở cho nhiều người dùng, gồm cả bảo mật (A1–A14).
- `compliance.md`: yêu cầu xác minh thương hiệu của Google OAuth, Luật 91/2025 và Nghị định 356, cách cài PWA trên iOS 26, vấn đề trình duyệt trong ứng dụng chat.
- `benchmark.md`: danh sách trang của các app tương tự.

**Khi các tài liệu nói khác nhau, thứ tự ưu tiên là:** PLAN-UI-2.md > SPEC.md > bản vẽ > MOCKUP-KIT.md.
- PLAN-UI-2.md đã qua hai lượt rà soát nên có vài chỗ sửa mà SPEC.md chưa có. Ví dụ: thứ tự các bước xoá tài khoản (A13), câu hỏi thường gặp về xoá tài khoản, dòng "nhật ký đăng nhập" ở bước đồng ý.
- Quyết định cũ vẫn còn hiệu lực, trừ khi bảng V ở PLAN-UI-2 §3 ghi rõ là thay. Các quyết định cũ gồm D# trong [PLAN.md](../PLAN.md), U#/M# trong [UI-REDESIGN.md](../UI-REDESIGN.md) và P# trong [PLAN-UI-1.md](../PLAN-UI-1.md).

---

## 2. Bảng tra: màn ↔ file bản vẽ ↔ mục đặc tả

Cột "Số" theo danh sách màn ở PLAN-UI-2 §14 và SPEC §11. Chữ **D** nghĩa là bản vẽ mặc định ở chế độ tối.

| Số | File bản vẽ | Màn | PLAN-UI-2 | SPEC |
|---|---|---|---|---|
| — | `Main.dc.html` | Hệ thiết kế: màu, chữ, linh kiện, icon | §6, §7 | §4, §5 |
| — | `SoDoTrang.dc.html` | Sơ đồ trang, có link tới từng bản vẽ | §4, §5 | §2, §3 |
| L1 | `LandingDesktop.dc.html` | Landing page trên máy tính (trang co giãn theo chiều rộng) | §8 | §6 |
| L2 D | `LandingPhoneDark.dc.html` | Landing page trên điện thoại | §8 | §6 |
| 1 | `InAppGate.dc.html` | Lớp chặn khi mở trong trình duyệt của Zalo | §9.7 | §7.7 |
| 2 | `DangNhap.dc.html` | Đăng nhập | §9.1 | §7.1 |
| 3 | `BatDau1DongY.dc.html` | Bước 1/4: đồng ý từng mục (bấm thử được) | §9.2 | §7.2 |
| 4 D | `BatDau2DriveDark.dc.html` | Bước 2/4: Google chưa cho phép lưu ảnh | §9.3 | §7.3 |
| 5 | `BatDau3Nhom.dc.html` | Bước 3/4: chọn nhóm | §9.4 | §7.4 |
| 6 | `HomeMoi.dc.html` | Trang chủ của người mới | §10.1 | §8.1 |
| 7 | `Home.dc.html` | Trang chủ khi đã có dữ liệu | §10.1 | §8.1 |
| 8 D | `HomeDark.dc.html` | Trang chủ (tối) | §10.1 | §8.1 |
| 9 | `InfoSheet.dc.html` | Bảng thông tin nhanh | §7, §10.1 | §5 (Info sheet) |
| 10 | `NhomQuanUong.dc.html` | Trang chọn quán của một nhóm | §10.2 | §8.2 |
| 11 | `TimKiem.dc.html` | Tìm kiếm | §10.3 | §8.3 |
| 12 | `BoLoc.dc.html` | Bảng lọc | §10.3 | §8.3 |
| 13 D | `YeuThichDark.dc.html` | Yêu thích | §10.4 | §8.4 |
| 14 | `GanToiHoi.dc.html` | Gần tôi: trang hỏi | §10.5 | §8.5 |
| 15 | `GanToiDanhSach.dc.html` | Gần tôi: danh sách kết quả | §10.5 | §8.5 |
| 16 D | `GanToiBanDoDark.dc.html` | Gần tôi: bản đồ và bảng thông tin | §10.5 | §8.5 |
| 17 | `BocTham.dc.html` | Bốc thăm, đã chốt một quán | §10.6 | §8.6 |
| 18 | `Vuot.dc.html` | Vuốt chọn quán, đang kéo thẻ | §10.7 | §8.7 |
| 19 | `ChiTiet.dc.html` | Trang chi tiết, phần đầu | §10.8 | §8.8 |
| 20 D | `ChiTietDuoiDark.dc.html` | Trang chi tiết, đã cuộn xuống | §10.8 | §8.8 |
| 21 | `ThemDiaDiem.dc.html` | Form thêm địa điểm (vẽ cả form) | §10.9 | §8.9 |
| 22 | `TaiKhoan.dc.html` | Tài khoản | §10.10 | §8.10 |
| 23 | `QuyenRiengTu.dc.html` | Quyền riêng tư & dữ liệu | §10.11 | §8.11 |
| 24 D | `XoaTaiKhoanDark.dc.html` | Xoá tài khoản | §10.11 | §8.11 |
| 25 | `QuanLyNhom.dc.html` | Quản lý nhóm, đang mở bảng sửa nhóm | §10.12 | §8.12 |
| 26 | `CaiApp.dc.html` | Hướng dẫn cài lên màn hình chính (iOS 26) | §10.14 | §8.14 |
| — | `HomeDesktop.dc.html` | Trang chủ trên máy tính, có cột bên | §4, §10.1 | §2 |
| — | `HuongA/B/C.dc.html` | So sánh ba hướng thiết kế. **Không phải màn để làm** | §2 | §0 |

Các màn có đặc tả nhưng **chưa có bản vẽ**:
- trang Quyền riêng tư, Điều khoản, Trợ giúp ở dạng trang tĩnh;
- trang 404;
- trang báo chuyển nhà và màn chờ lúc mở app;
- bước 4/4 và trang đồng ý lại khi chính sách đổi;
- trình xem ảnh;
- Quản lý nhãn;
- Giới thiệu.

Khi làm các màn này, theo câu chữ và bố cục trong PLAN-UI-2 §8–§10.

---

## 3. Cách đọc file bản vẽ `.dc.html`

- Đây là định dạng của canvas Design trên claude.ai. Mở thẳng bằng trình duyệt sẽ không chạy được, vì thiếu runtime `support.js` của canvas. Hãy đọc như HTML: mọi bố cục là inline style dùng biến CSS `var(--…)`.
- Mỗi file có một khối `WTG TOKENS v1` trong `<helmet><style>`, giống hệt nhau ở mọi file:
  - `.wtg` là bản sáng, `.wtg.dark` là bản tối;
  - giá trị lấy từ SPEC §4.1, cỡ chữ (`.t-h1`, `.t-name`, `.t-caption`…) lấy từ SPEC §4.3.
- `{{mode}}` trên thẻ gốc nhận giá trị `light` hoặc `dark`, điều khiển bằng prop `dark` trong `data-props`.
- Kích thước khung (`w`, `h`) và nhóm trang của từng bản vẽ nằm trong `mockups/canvas.json`.
- Màn điện thoại rộng 390 px:
  - 47 px trên cùng và 34 px dưới cùng cố ý để trống, vì đó là chỗ của thanh trạng thái và thanh home của máy thật;
  - vài màn vẽ dài hơn 844 px để thấy trọn nội dung.
- **Ảnh chỉ là ô màu giữ chỗ** (`--ph-1`…`--ph-6`), không phải thiết kế ảnh. Ảnh thật xử lý theo SPEC §4.7.
- **Icon** là SVG Ionicons 8 nhúng sẵn. Trong app dùng `ionicons/icons`, gói này đã là dependency. Mỗi icon chỉ mang một nghĩa, xem SPEC §4.6.
- **Mẫu Google:** "Roboto" chỉ dùng cho nút đăng nhập Google. Phông giao diện là Be Vietnam Pro 400/600 cho chữ thường và Newsreader 400/600 cho tiêu đề, tên quán, câu chuyện.
- **Dữ liệu là minh hoạ:** "Nguyễn Minh Anh", tên quán, giá. Khi làm thật, lấy dữ liệu từ DB.
- **Bản vẽ chỉ để tham khảo hình.** Chỗ nào khác đặc tả thì theo PLAN-UI-2.md. Vài khác biệt đã biết, cần làm theo đặc tả:
  - Bảng thông tin trong bản vẽ cao khoảng 70% màn hình vì không đủ chỗ. Trong app dùng các mốc 0 / 0,6 / 1 (SPEC §5).
  - Bản đồ trong bản vẽ luôn tối. Trong app, bản đồ theo giao diện sáng/tối.
  - Số phiên bản "0.3.0" là ví dụ; trong app đọc từ `package.json`.
- **Canvas gốc:** https://claude.ai/artifact/KGhAgZzQq1ZEp3huRjWz9K. Canvas này là riêng tư của chủ repo nên agent không mở được; hãy dùng các file trong `mockups/`.

---

## 4. Hướng dẫn cho agent sẽ implement

1. **Không làm gì khi chưa được giao.** Chỉ bắt đầu sửa code khi chủ repo gõ `ENTER EXECUTE MODE` và nói rõ làm giai đoạn nào. Các chế độ khác (RESEARCH, INNOVATE, PLAN) chỉ được viết tài liệu.
2. **Làm theo giai đoạn** P1 → P7 ở PLAN-UI-2 §12. Mỗi giai đoạn phải ship được độc lập.
   - Không bật đăng ký cho người mới trước điểm dừng `[GATE]` ở P6.
   - Các việc bảo mật A1–A10 và A13 (PLAN-UI-2 §11) phải xong trước khi mở đăng ký. Riêng A1 (redirect wildcard `*.trycloudflare.com`) là lỗ hổng có thể bị lợi dụng ngay.
3. **Bước có `[USER]` thì phải hỏi chủ repo, không tự làm:**
   - mua tên miền, tạo email hỗ trợ, nhờ luật sư xem nội dung pháp lý;
   - chỉnh Google Cloud Console, Supabase Dashboard, Search Console;
   - trả lời các câu hỏi Q1–Q14.

   Câu hỏi nào chưa có câu trả lời thì dùng "mặc định đề xuất" ở PLAN-UI-2 §13, và ghi rõ là đang dùng mặc định.
4. **Mục có `[KIỂM TRA]`** (tên menu iOS 26, câu chữ trên màn hình Google, hiển thị dấu tiếng Việt trên iPhone thật…) phải kiểm chứng trước khi coi là xong.
5. **Câu chữ giao diện** trong ngoặc kép ở PLAN-UI-2 là bản chốt, chép nguyên văn. Không đặt từ khác cho cùng một thứ: nhóm, nhãn, Yêu thích, Độ hot, Bốc thăm, Vuốt chọn quán, Tài khoản.
6. **Quy ước code của repo** (theo PLAN-UI-1.md):
   - Component viết dạng `export function X(props: XProps): React.JSX.Element`, chỉ dùng named export, props có JSDoc.
   - JSDoc và chuỗi giao diện bằng tiếng Việt.
   - Prettier dùng `singleQuote`, `semi`, `printWidth` 100.
   - Vitest đặt `globals: false`, tên test viết bằng tiếng Việt.
   - Lệnh kiểm tra: xem [README](../../README.md). Web dùng `npm run lint`, `typecheck`, `test`, `build`, `check:size`; server và jobs dùng `ruff check .`, `pytest -q`.
7. **Database:**
   - Migration chạy tay trong SQL Editor (xem [SETUP.md](../SETUP.md)).
   - Từ 2026-10-30, Supabase không tự mở Data API cho bảng mới. Bảng mới (ví dụ `consents`) phải có `GRANT` trong migration.
8. **Vị trí trong code** (`file:line`) ở `research/` ứng với commit `ff25e89`. Code có thể đã đổi, nên mở lại file để kiểm trước khi sửa.

---

## 5. Những gì không có trong repo

- Ba bản đề xuất hướng A, B, C đầy đủ và ba báo cáo chấm điểm. Bản tóm tắt nằm ở PLAN-UI-2 §2; bản vẽ so sánh là `mockups/HuongA/B/C.dc.html`.
- Các script đo tương phản và kích thước phông dùng trong buổi thiết kế. Có thể đo lại từ mã màu ở SPEC §4.1.
- Font Roboto subset cho nút Google. Tạo lại bằng lệnh `pyftsubset` ở SPEC §4.2.
