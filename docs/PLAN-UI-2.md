# KẾ HOẠCH GIAO DIỆN MỚI — PHẦN 2: MỘT PHONG CÁCH, ĐỦ TRANG, MỞ CÔNG KHAI

Ngày: 2026-10-17. Chế độ: **PLAN** (chưa thực hiện cho tới khi user gõ `ENTER EXECUTE MODE`).
Nguồn quyết định: [UI-REDESIGN.md](UI-REDESIGN.md) (U1–U45 của user, M1–M8 mặc định), [PLAN-UI-1.md](PLAN-UI-1.md) (P1–P37 mặc định kỹ thuật của phần 1), [PLAN.md](PLAN.md) (D1–D26), và 3 câu trả lời của user ngày 2026-10-17: (1) mở app cho mọi người (công khai, nhiều người dùng); (2) MỘT phong cách chung cho mọi trang, có cả sáng và tối; (3) cần kế hoạch kèm bản vẽ mẫu.

Quy ước giống PLAN.md:

- `[USER]` = bước chỉ user làm được; `[GATE]` = dừng, chờ user xác nhận; `[KIỂM TRA]` = phải thử trên máy thật hoặc trang Google trước khi làm; `[CẦN CHỐT CÂU CHỮ]` = chỗ bản vẽ chưa có câu chữ cuối cùng, phải chốt trước khi làm.
- `V#` = quyết định của kế hoạch này (mục 3); `Q#` = câu hỏi còn mở (mục 13); `A#` = mục bảo mật khi mở công khai (mục 11).
- `P0`–`P7` = **giai đoạn** làm việc (mục 12). Đừng nhầm với `P1`–`P37` của PLAN-UI-1 (mặc định kỹ thuật): khi nhắc loại đó, tài liệu ghi "(PLAN-UI-1)"; riêng cột "Thay/Đổi" của bảng V luôn nói về mặc định của PLAN-UI-1.
- "bạn" và "user" đều là chủ app; "người dùng" là người sẽ dùng app sau khi mở công khai.
- Chỗ trống bạn tự điền: `[TÊN MIỀN]`, `[EMAIL HỖ TRỢ]`, `[MÃ DỰ ÁN]` (mã dự án Supabase), `[TÊN NGƯỜI VẬN HÀNH]`, `[SỐ NGÀY]`, `[LINK GITHUB]`.

Cách viết số: tỉ lệ tương phản giữ dấu chấm thập phân như bản đo (5.44:1); mọi số thập phân khác trong câu chữ (em, dòng cao, px lẻ, MB) viết kiểu Việt Nam, dấu phẩy là dấu thập phân và dấu chấm tách hàng nghìn (57,6 px; 0,982 em; 2,5 MB; "50.000 ₫"; "1,2 km"); giá trị trong khối code giữ dấu chấm (`line-height: 1.65`); số byte đầy đủ tách hàng nghìn bằng dấu cách (145 336 B). KiB và MiB là cách đo của máy tính, hơi lớn hơn KB và MB (1 MiB = 1 048 576 B).
Câu chữ giao diện trong ngoặc kép là bản chốt, chép nguyên văn khi làm; riêng tên, số và ngày mẫu ("Nguyễn Minh Anh", "Bún chả Hương Liên", "28 địa điểm", "14 thẻ", "17/10/2026"…) là dữ liệu minh hoạ, khi làm thay bằng dữ liệu thật.

---

## 0. Tóm tắt cho bạn

**Vì sao app trông như "chỉ có 2 trang"**
- Phần 1 mới vẽ lại đúng 2 trang: Trang chủ và Vuốt thẻ (cộng bảng thông tin trượt lên). 7 trang còn lại vẫn mang giao diện mặc định cũ của Ionic (bộ linh kiện dựng sẵn mà app đang dùng): trông như màn cài đặt của điện thoại, chưa giống một sản phẩm có nét riêng.
- 4 lối vào trên Trang chủ (nút tìm, nút tim, mọi thẻ nhóm, thẻ Gần tôi) cùng mở **một** trang danh sách cũ, chỉ khác tiêu đề.
- Các trang đã hẹn trong UI-REDESIGN chưa được làm: Trang chọn quán, Tìm kiếm mới, Gần tôi, Ngẫu nhiên, Yêu thích.
- Không có trang giới thiệu (landing page — trang đầu tiên người lạ thấy, nói app làm gì) và không có bước làm quen lúc mới dùng (onboarding).

**Kế hoạch này đổi gì.** App mở cho mọi người có tài khoản Google, bắt đầu bằng một đợt thử chỉ dành cho người được mời. Cụ thể:
- Mỗi lối vào ở Trang chủ có một trang riêng thật sự.
- Thêm các trang công khai: giới thiệu, quyền riêng tư, điều khoản, trợ giúp, hướng dẫn cài app.
- Thêm luồng đăng nhập và xin đồng ý từng việc một, theo Luật 91 (Luật Bảo vệ dữ liệu cá nhân của Việt Nam, có hiệu lực từ 01/01/2026).
- Thêm trang Tài khoản để người dùng tự tải dữ liệu về, ngắt kết nối Google Drive hoặc xoá tài khoản.
- Thêm bố cục cho màn hình máy tính.
- Làm các việc bảo mật bắt buộc trước khi cho người lạ đăng ký.
- Mọi trang theo một phong cách chung, có cả sáng và tối.

**Phong cách đã chọn: "Sổ tay".** App trông như một cuốn sổ tay in: nền giấy kem, chữ màu mực, một màu nhấn (màu dành cho nút chính và chỗ cần chú ý) là đỏ gạch, như nét bút đỏ chấm bài. Tiêu đề và tên quán dùng Newsreader, một phông có chân (serif — chữ có nét chân nhỏ ở đầu nét, kiểu sách báo); chữ thường dùng Be Vietnam Pro, phông đang có sẵn trong app. Dấu ấn riêng là "vòng bút đỏ", một nét khoanh tay chỉ hiện ở vài chỗ then chốt: gạch chân gợi ý hôm nay, con dấu khi vuốt thẻ, vòng khoanh quán bạn chốt. Phong cách này phát triển tiếp từ Trang chủ nền kem bạn đã duyệt, nên người dùng sẽ có cảm giác "phần còn lại của app đã bắt kịp", chứ không phải đang dùng một app khác.

**Thứ tự làm.** Việc chia thành 8 giai đoạn P0–P7 (chi tiết ở mục 12), tổng khoảng 36 ngày làm việc, tức 7–8 tuần cho một người, chưa tính thời gian chờ DNS, luật sư, Google và 2 tuần thử chỉ mời:
- P0 — Việc của riêng bạn (mua tên miền, nhờ luật sư…), làm song song từ ngày 1.
- P1 — Một giao diện chung · P2 — Mỗi lối vào một trang thật · P3 — Form thêm/sửa, các trang quản lý, bố cục máy tính.
- P4 — Nhà mới (tên miền riêng và trang công khai) · P5 — Đăng nhập và quyền dữ liệu.
- P6 — Mở cửa: tới đây kế hoạch dừng lại chờ bạn xác nhận (**[GATE]**) rồi mới bật đăng ký cho mọi người · P7 — Bản đồ.

**Bạn cần làm gì ngay** `[USER]`
1. Mua một tên miền riêng, tức địa chỉ web của app (ví dụ `tenban.vn`); chỗ nào trong tài liệu ghi [TÊN MIỀN] thì điền tên này vào.
2. Tạo email hỗ trợ [EMAIL HỖ TRỢ].
3. Hẹn luật sư đọc: các ô đồng ý (những ô tick xin phép người dùng), Chính sách quyền riêng tư, Điều khoản sử dụng, và việc có phải nộp hồ sơ chuyển dữ liệu ra nước ngoài hay không (vì dữ liệu nằm trên máy chủ ở Singapore).
4. Trả lời 5 câu hỏi Q1–Q5 ở mục 13 (Q1 chính là việc chọn tên miền).

**Cách đọc.** Tài liệu gồm mục 0 đến mục 15. Bạn chỉ cần đọc mục 0 này và trả lời mục 13; các mục còn lại là bản đặc tả chi tiết để tra khi cần.

**Không làm trong phần 2** (đã cân nhắc rồi để sau hoặc bỏ)
- Chia sẻ danh sách cho bạn bè, link chia sẻ công khai (lý do ở mục 11.5).
- Trang "chọn cho hai người" và thanh tab chung (mục 2).
- Nhập dữ liệu từ Google Takeout; đăng nhập bằng nút Google tự dựng (mục 12, dòng cuối của bảng).

**Bản vẽ mẫu:** https://claude.ai/artifact/KGhAgZzQq1ZEp3huRjWz9K — đang để riêng tư, chỉ bạn mở được cho tới khi bạn tự chia sẻ. Danh sách màn ở mục 14.

**Từ ngữ hay gặp** (mỗi từ giải thích một lần ở đây)

| Từ | Nghĩa dễ hiểu |
|---|---|
| route | Địa chỉ của một trang trong app, phần đứng sau dấu `#` trên thanh địa chỉ. Ví dụ `#/home` là Trang chủ của app. |
| component | Một khối giao diện viết sẵn trong code: một nút, một thẻ hoặc cả một trang. |
| offline · online | Không có mạng · có mạng. |
| header | Đầu trang: thanh trên cùng của mỗi màn hình, có nút quay lại và tên trang. |
| nút Back | Nút "quay lại" của trình duyệt hoặc điện thoại; khác với nút quay lại vẽ trong app. |
| Trang chủ · trang chủ website | "Trang chủ" viết hoa là màn hình đầu tiên trong app (`#/home`). "Trang chủ website" là trang giới thiệu ở `/`, trang mà Google đòi phải có. |
| Trang chọn quán · Vuốt chọn quán | Trang chọn quán là trang lưới các quán của một nhóm (`#/categories/:id`). Vuốt chọn quán là trang vuốt thẻ (`#/swipe`). |
| chip | Nút nhỏ hình viên thuốc để chọn hoặc lọc, ví dụ "Quán ăn", "Hẹn hò". |
| banner | Dải thông báo nằm trong nội dung trang. |
| toast | Thông báo nhỏ tự tắt ở đáy màn hình. |
| dock | Thanh 5 nút ở đáy Trang chủ: Tìm · Yêu thích · ＋ Thêm · Vuốt · Bốc thăm. |
| thanh dính | Thanh luôn nằm sát đáy màn hình khi cuộn trang. |
| khung xương | Các ô xám giữ chỗ trong lúc nội dung đang tải. |
| avatar | Ảnh đại diện tròn của tài khoản Google. |
| nút chọn một | Dãy nút liền nhau, mỗi lần chỉ chọn được một nút (segmented). |
| bảng trượt | Bảng trượt từ đáy màn hình lên (sheet); trên máy tính hiện thành hộp thoại. |
| bảng thông tin | Bảng trượt tóm tắt một quán: ảnh, giá, giờ, câu chuyện, nút Chỉ đường và Xem đầy đủ. |
| token | Có hai nghĩa. (1) Token thiết kế: tên đặt cho một giá trị như màu hay cỡ chữ (mục 6). (2) Khoá truy cập: chuỗi do Google hoặc Supabase cấp để app làm việc thay bạn; "khoá làm mới" (refresh token) là loại dùng được lâu dài. |
| tải lười | Chỉ tải một phần của app khi thật sự cần (ví dụ bản đồ), để app mở nhanh hơn. |
| ngân sách dung lượng | Mức dung lượng tối đa cho phép; vượt mức thì bước kiểm tra tự động báo lỗi. |
| service worker | Phần mềm nền của trình duyệt giúp app mở được khi không có mạng và tự cập nhật. |
| manifest · scope | Manifest là tệp khai báo để trình duyệt cài website thành app. `scope` (phạm vi) trong đó là các địa chỉ thuộc app đã cài; ở đây là mọi địa chỉ bắt đầu bằng `/app/`. |
| tunnel | Đường hầm tạm (như Cloudflare Tunnel) đưa máy đang phát triển ra internet. |
| regex | Mẫu chữ để khớp nhiều địa chỉ cùng lúc, ví dụ mọi địa chỉ có đuôi `.trycloudflare.com`. |
| DB | Cơ sở dữ liệu trên Supabase, nơi lưu địa điểm, nhóm, nhãn… |
| URL | Địa chỉ trang web. |
| OAuth | Cách đăng nhập bằng tài khoản Google mà không đưa mật khẩu cho app. |
| WAF | Tường lửa web của Vercel: chặn hoặc giới hạn những lời gọi bất thường. |
| JSON · CSV | JSON: tệp dữ liệu đầy đủ cho người kỹ thuật. CSV: bảng tính mở được bằng Excel. |
| SVG | Ảnh vẽ bằng nét (vector), phóng to không vỡ; dùng cho logo và vòng bút đỏ. |
| 404 | Trang báo "không tìm thấy trang". |
| px · ms | px: điểm ảnh, đơn vị đo trên màn hình. ms: mili giây (1/1000 giây). |

---

## 1. Hiện trạng

Theo commit `ff25e89`.

**Số liệu**
- 13 route thật và 3 route chỉ để chuyển hướng: `/tabs/*` và `/` đều chuyển về `/home`; địa chỉ lạ (`*`) chuyển về `/` rồi mới về `/home`. App chưa có trang 404 (trang báo "không tìm thấy").
- 9 component trang. `PlaceListPage` phục vụ 4 route (`/search`, `/favorites`, `/nearby`, `/categories/:id`); `PlaceFormPage` phục vụ 2 (`/places/new`, `/places/:id/edit`). Thực tế chỉ có khoảng 6 bố cục khác nhau (Đăng nhập, Trang chủ, Vuốt, Danh sách, Chi tiết, Form) cộng 3 trang kiểu danh sách cài đặt.
- Đã vẽ lại ở phần 1: `HomePage`, `SwipePage` và bảng `PlaceInfoSheet` dùng chung. 7 component trang còn lại và 3 bảng trượt (AddVisit, TimeWheel, CategoryEditor) vẫn giao diện cũ.
- Lớp phủ: 4 bảng trượt (IonModal), khoảng 20 hộp thoại IonAlert, 1 IonLoading, 1 IonSelect dạng action-sheet (chọn sắp xếp), khoảng 12 loại toast (thông báo nhỏ tự tắt), 3 banner/biểu tượng trạng thái. 1 trang tĩnh `public/privacy.html`, không được link từ đâu.

**3 hệ giao diện không khớp nhau**

| Hệ | Màu | Phông | Dùng ở |
|---|---|---|---|
| Mặc định cũ (`variables.css`) | trắng ngà `#fafaf9`, nút đen, vàng đồng `#a16207` | Playfair Display + Be Vietnam Pro | Đăng nhập, 4 trang danh sách, Chi tiết, Form, Cài đặt, 2 trang Quản lý, 3 bảng trượt cũ, mọi alert, toast, banner |
| `.wtg-theme-home` | kem `#f5f2e9`, xanh Apple `#0071e3` | Playfair 800 + Be Vietnam Pro | Trang chủ, và bảng thông tin khi mở từ Trang chủ |
| `.wtg-theme-swipe` | be `#f2ece1`, cam `#e8a359` | Fraunces + Plus Jakarta Sans | Vuốt thẻ, và bảng thông tin khi mở từ Vuốt |

Thêm nữa:
- Chế độ tối của các trang mặc định thật ra hiện đen tuyền `#000` và trắng `#fff`, vì file `dark.system.css` của Ionic đè lên bảng màu đã thiết kế.
- 4 bộ phông, tổng 298 036 B; 7 chỗ dùng chữ cỡ 11 px (nhỏ hơn mức tối thiểu mới 12 px của V8).
- Vài cặp màu quá nhạt để đọc rõ (chữ thường cần từ 4.5:1, xem mục 6.1): chip lọc đang chọn ở trang Vuốt chỉ đạt 2.24:1, chữ trên ảnh thẻ vuốt chỉ đạt 1.4–3.3:1.
- Không có bố cục cho máy tính: mọi trang kéo giãn hết chiều ngang.

**Vấn đề trải nghiệm chính**
1. Người mới chỉ thấy một màn trống và thanh dưới; 4 nhóm đã tạo sẵn bị ẩn cho tới khi có quán đầu tiên. Không có bước làm quen.
2. Thanh dưới Trang chủ có 3 icon không có chữ; icon "albums" của Vuốt không tự nói nó làm gì.
3. Thẻ nhóm trông như một điểm đến riêng (ảnh, câu gợi ý) nhưng mở ra danh sách chung không còn chút gì của nhóm.
4. Một icon bị dùng cho hai nghĩa: tim là Yêu thích ở Trang chủ nhưng là +1 ở Vuốt; sao là Yêu thích ở Vuốt nhưng là đánh giá ở chỗ khác.
5. Điểm hứng thú (+1/−1 khi vuốt) không hiện ở đâu, và dễ nhầm với trạng thái "Hứng thú".
6. Trang danh sách không phân biệt được đang tải, bị lỗi hay thật sự trống: lần đầu tải hoặc khi mất mạng, nó vẫn hiện "Chưa có địa điểm nào".
7. Gần tôi bật hộp xin vị trí ngay khi mở, không giải thích trước; hướng dẫn cấp quyền chỉ đúng cho Safari trên iPhone.
8. Trang Vuốt khoá cuộn với chiều cao cố định: trên iPhone SE hoặc khi xoay ngang, hàng nút có thể bị đẩy khuất.
9. Chi tiết: tên hiện 2 lần; sao Yêu thích nằm ngay trên sao đánh giá; "Mở Google Maps" và "Chỉ đường" là cùng một việc mang hai tên; không xem ảnh toàn màn hình được; xoá lần đi chỉ bằng vuốt trái.
10. Form là một trang dài 13 mục, nút "Lưu" chỉ ở trên cùng, lỗi có thể nằm khuất; giờ mở cửa mặc định 08:00–22:00 nên "Đang mở" có thể sai; hiện nguyên số toạ độ khó hiểu; vuốt từ mép trái hay bấm nút Back của trình duyệt thì thoát luôn mà không hỏi "Bỏ thay đổi?".
11. Cài đặt chỉ vào được qua avatar; thiếu link quyền riêng tư, xoá tài khoản, tải dữ liệu, đổi sáng/tối, trợ giúp.
12. Quản lý nhãn không tạo được nhãn; mọi thao tác chỉ bằng vuốt, khó dùng trên máy tính.
13. Đăng nhập: không giới thiệu app, không link quyền riêng tư hay điều khoản; `prompt=consent` bắt Google hỏi lại quyền mỗi lần đăng nhập; mở một link trỏ thẳng vào trang bên trong app (deep link) khi chưa đăng nhập thì đăng nhập xong bị đưa về Trang chủ, không vào đúng trang đó; câu lỗi `signup_disabled` chỉ đúng với chủ app.
14. Lúc mở app là màn trắng (không có màn chờ), rồi nháy trắng thêm lần nữa khi kiểm phiên đăng nhập.
15. Toast lúc ở trên (Vuốt) lúc ở dưới; có hai kiểu nút ＋ (tròn xanh giữa đáy và tròn đen ở góc).

**Ngõ cụt (không có lối đi tiếp hay thử lại)**
- Vuốt "Không có địa điểm nào khớp bộ lọc" và danh sách "Không tìm thấy địa điểm": không có nút xoá bộ lọc.
- Chi tiết "Không tìm thấy địa điểm": hiện cả khi lỗi mạng hay offline, không có "Thử lại".
- Form sửa "Không tải được địa điểm": không có "Thử lại"; nút Huỷ có thể không chạy khi mở thẳng từ link.
- Ảnh lỗi: không có nút tải lại.
- Trang đăng nhập: không có lối nào khác ngoài nút Google.
- `#/categories/<id lạ>` hiện danh sách rỗng tên "Nhóm"; xoá quán xong bấm Back có thể về trang "Không tìm thấy".
- Không vào được `privacy.html` từ app; điểm hứng thú không hiện ở đâu; nhãn chỉ tạo được trong form.

---

## 2. Ba hướng thiết kế đã cân nhắc và vì sao chọn "Sổ tay"

Ba hướng được vẽ song song rồi chấm bởi 3 lượt đánh giá độc lập (gọi là "giám khảo"), mỗi lượt nhìn một góc: **Dựng & bảo trì** (một người làm, Ionic React 9, GitHub Pages, chạy offline), **Người dùng mới & tuân thủ** (lòng tin, Luật 91, Google), **Thẩm mỹ & dễ tiếp cận** (nét riêng, độ tương phản, dấu tiếng Việt). Các tỉ lệ tương phản các hướng đưa ra đều được tính lại và khớp, trừ token trang trí `line` của hướng B (đo được 1.31 / 1.50, không phải 1.42 / 1.38; không ảnh hưởng vì chỉ để trang trí).

| Hướng | Người dùng mới & tuân thủ | Thẩm mỹ & dễ tiếp cận | Dựng & bảo trì | Tổng |
|---|---|---|---|---|
| **A — "Sổ tay"** | 8 | 8 | 7 | **23** |
| C — "Bản đồ của riêng bạn" | 7 | 6 | 8 | 21 |
| B — "Chốt!" | 6 | 6 | 4 | 16 |

**A — "Sổ tay" (cuốn sổ ấm).** Giữ Trang chủ nền kem và biến nó thành một giao diện chung như một cuốn nhật ký in: giấy kem, chữ mực, một màu đỏ gạch `#A8482A`, tiêu đề Newsreader. Trang chủ vẫn là trung tâm với thanh dưới 5 ô có chữ, không có thanh tab chung; máy tính có cột bên 248 px.

- *Điểm mạnh:* mọc ra từ màn bạn đã duyệt; phần tuân thủ đầy đủ nhất (mỗi mục đích một ô, ô sao lưu phụ thuộc ô ảnh, tải được bản ghi đồng ý, từ chối thì xoá tài khoản); câu chữ về lòng tin trung thực; dùng lại nhiều code nhất (`HomePage`, `HomeDock`, `DailyPickCard`, `CategoryCard`, `IonRouterOutlet` phẳng) nên ít rủi ro về điều hướng nhất.
- *Điểm yếu:* dock 5 ô chật ở màn 360 px; dấu chồng (Ấ, Ổ) bị cắt trong tiêu đề Ionic; vài cặp màu nhấn sát ngưỡng (chữ nhấn trên nền nhấn nhạt 4.58:1, màu nút trong toast chưa định nên có thể chỉ 3.02:1); giống kiểu "biên tập ấm" mà AI hay tạo; chưa đóng gói phông Roboto cho nút Google; phông 171 KB; câu "vị trí không lưu lên máy chủ" sai sự thật; trang đăng nhập có câu "bằng việc tiếp tục, bạn đồng ý" (kiểu đồng ý ngầm, trái với ô tick phía sau).

**B — "Chốt!" (Hôm nay đi đâu?).** Biến app thành trò chơi ra quyết định: biển hiệu đường phố, ghế nhựa, màu cam đậm `#C2410C`, phông tiêu đề to tròn Paytone One, thẻ như nhãn dán có bóng cứng, và con dấu "Chốt!" mỗi lần chọn. Có thanh tab dưới Hôm nay · Tìm · ＋ · Bản đồ · Tôi và thêm trang "Chọn cho hai người".

- *Điểm mạnh:* đáng nhớ và "Việt" nhất; "Độ hot" với icon ngọn lửa tách hẳn điểm vuốt khỏi trạng thái "Hứng thú"; nút Google đúng chuẩn nhất (tập con Roboto Medium); khung thông tin đặc dưới ảnh thẻ vuốt thay lớp mờ chuyển màu; ghi rõ phạm vi `/app/`; phông rẻ nhất 132,3 KB.
- *Điểm yếu:* Paytone làm dấu tiếng Việt chồng lên dòng trên (cần dòng cao ≥ 1,45); kiểu nhãn dán biến mất ở chế độ tối (viền 2.30:1, bóng 1.12:1); quá nhiều màu, màu nhóm gán theo hàm băm nên 4 nhóm mặc định có 72% khả năng trùng màu; nhiều CSS tự viết nhất; trang "hai người" là phạm vi bạn không yêu cầu; 9–11 tuần; thiếu ô 16+, ô ảnh không nói về khoá truy cập lưu trên máy chủ, nói sai về vị trí mạnh nhất; tiếng lóng làm giảm lòng tin.

**C — "Bản đồ của riêng bạn" (tiện ích, bản đồ là chính).** Trang xám yên tĩnh, một màu xanh mực `#2F44C8`, chỉ một phông Be Vietnam Pro, thanh tab 5 ô có tab Bản đồ, dùng linh kiện Ionic gốc nhiều nhất.

- *Điểm mạnh:* hệ nhỏ nhất, một phông 136 KB; tương phản cẩn thận nhất; token đặt ở `:root, :root.ios` (đúng chỗ gây lỗi chế độ tối hiện nay); mật độ tốt nhất cho 300+ quán; đặc tả ghim bản đồ tốt nhất; câu chữ dữ liệu chính xác nhất; trang xoá tài khoản riêng; 5–6 tuần.
- *Điểm yếu:* trông chung chung như phần mềm văn phòng, bỏ Trang chủ ấm và phông có chân bạn đã duyệt; lưới tụt còn 1 cột trên điện thoại; thanh tab nằm trong từng trang nên trượt theo mỗi lần chuyển trang; bản đồ là tab chính nên MapLibre nằm trên đường tải chính và gửi vùng của mọi quán đã lưu cho OpenFreeMap; `color-mix()` hỏng trên iOS 16.0–16.1; "Không đồng ý" chỉ đăng xuất, tài khoản và quyền Google vẫn còn; giá "40k–70k ₫" trộn hai kiểu viết.

Giám khảo "Dựng & bảo trì" chọn C, nhưng ghi rằng nếu thanh tab không ổn thì quay về dock có chữ của A. Hai giám khảo còn lại chọn A. Tổng điểm A cao nhất.

**Vì sao chọn A**
1. A mọc ra từ Trang chủ nền kem bạn đã duyệt, nên bản làm lại đọc như "phần còn lại của app đã theo kịp", không như một app mới.
2. A tuân thủ đầy đủ nhất khi ra mắt công khai: mỗi mục đích một ô, ô phụ thuộc nhau, tải được bản ghi đồng ý, từ chối thì tài khoản bị xoá. Câu chữ về lòng tin cũng trung thực.
3. A dùng lại nhiều code nhất, nên ít rủi ro điều hướng nhất cho một người làm.
4. Mọi điểm yếu của A sửa được, và đã sửa trong kế hoạch này: dock chật ở 360 px, dấu bị cắt trong tiêu đề, biên tương phản mỏng, vẻ "mẫu biên tập ấm" chung chung, chưa đóng gói Roboto.

**Lấy từ C**
- hàng danh sách gọn có phân trang và `content-visibility`;
- bộ lọc tìm kiếm lưu trong URL;
- ghim bản đồ gom cụm bằng GeoJSON, vùng bấm nới rộng và chấm vị trí người dùng rỗng ruột;
- bộ chọn token `:root, :root.ios` và tắt hiệu ứng Ionic khi máy bật giảm chuyển động, ngay lúc khởi động;
- trang xoá tài khoản riêng, mời tải dữ liệu trước;
- cách giải thích dễ hiểu nhóm khác nhãn;
- danh sách đầy đủ các loại dữ liệu trong ô đồng ý 1;
- cách nói "quyền hẹp nhất (drive.file)";
- chú thích "Dữ liệu minh hoạ" dưới ảnh chụp màn hình;
- câu hỏi đáp "Dịch vụ không cam kết chạy mãi";
- trạng thái đăng nhập khi offline riêng.

**Lấy từ B**
- "Độ hot" với icon ngọn lửa;
- tập con Roboto Medium đóng gói sẵn cho nút Google;
- phạm vi `/app/` và `start_url` ghi rõ;
- bảng phím tắt cho trang Vuốt;
- bảng đăng xuất "máy này" hay "mọi thiết bị";
- câu "Ô nào không chọn, app không làm việc đó.";
- link intent mở bằng Chrome trên Android, và hiện URL chọn được khi sao chép lỗi;
- khung thông tin đặc dưới ảnh thẻ vuốt;
- một khoảnh khắc mừng lúc chốt quyết định, vẽ lại theo phong cách của A thành vòng bút đỏ và "Chốt quán này".

**Đã loại**
- Từ B: trang "hai người" (phạm vi bạn không yêu cầu); màu nhóm gán theo hàm băm (hay trùng); phông Paytone (cắt dấu tiếng Việt); kiểu nhãn dán (mất ở chế độ tối).
- Từ C: bản đồ là tab chính (đưa MapLibre vào đường tải chính và gửi mọi vùng đã lưu cho OpenFreeMap); thanh tab đặt trong từng trang; hệ một phông (trông chung chung); kiểu giá "40k".
- Thanh tab chung nói chung (xem V4).

**Các lỗi giám khảo chỉ ra và chỗ đã sửa**

| Lỗi | Cách sửa |
|---|---|
| Địa chỉ github.io cũ chỉ còn trả về mã 301 (chuyển hướng vĩnh viễn), và các bản app đã cài không bao giờ cập nhật được nữa | Ra một bản "chuyển nhà" với service worker tự huỷ *trước khi* đặt tên miền (mục 8, giai đoạn P4) |
| Danh sách địa chỉ được phép gọi máy chủ (`ALLOWED_ORIGINS`), quy tắc regex cho tunnel và địa chỉ chuyển hướng dùng ký tự đại diện `*` (A1, mục 11) | P4 |
| Các phần tải lười (như bản đồ) vẫn bị lưu sẵn khi cài (precache); chưa có giới hạn dung lượng tổng cho phần lưu sẵn | `globIgnores` (loại khỏi danh sách lưu sẵn), bộ nhớ đệm lúc chạy, và giới hạn tổng 2,5 MB (mục 8) |
| Nút "Cài ngay" trên trang tĩnh | Chỉ cài từ bên trong `/app/` (V33) |
| Việc bắt đồng ý trước khi vào app làm hỏng chế độ offline; mất khoá truy cập Drive (token) khi tải lại trang | Xin Drive bổ sung sau khi đồng ý; trạng thái đồng ý lưu đệm trên máy (V26, V27, mục 9.6) |
| Bảng trượt không thể thành hộp thoại chỉ bằng CSS | Lớp bọc `WtgSheet` (mục 7) |
| Đổi sáng/tối bằng tay cần `color-scheme` và viết lại thẻ `theme-color` | Mục 6.9 |
| Manifest cần `id` | Mục 8 |
| Dock 5 ô tràn ở 360 px | Đã đo chữ (dài nhất 57,6 px) và cố định 12 px (mục 7) |
| Cỡ quang học của Newsreader và dung lượng phông | Chấp nhận; tổng phông 145 KB (mục 6.2) |
| Bảng đối chiếu màu sang Ionic còn thiếu; cột bên (split pane) của Ionic mặc định rộng 270 px; cử chỉ vuốt mở menu đụng cử chỉ vuốt quay lại | Mục 6.9, mục 4 |
| `color-mix()` hỏng trên iOS 16.0–16.1 | Viết thẳng giá trị các màu bậc (mục 6.9) |
| Lưới tụt còn 1 cột trên điện thoại | Cố định 2 cột dưới 600 px (mục 7) |
| Lời hứa về vị trí sai; không nhắc OpenFreeMap | V37, mục 8, mục 9 |
| Chưa quyết về tên miền supabase.co Google hiện | V29 và Q2 |
| Google Drive được cấp trước khi đồng ý theo Luật 91 | V26 |
| Bắt gõ chữ "XOÁ" có thể chặn việc xoá | Dùng ô tick xác nhận (mục 10.11) |
| Chưa tính các trường hợp: chính sách thay đổi, dùng offline, và tài khoản đã đăng ký từ trước | Mục 9.5, 9.6 |
| Rút đồng ý xuất hiện hai lần; rút mục bắt buộc thì sao | Gộp lại; "Rút lại = xoá tài khoản" (mục 10.11) |
| Hồ sơ chuyển dữ liệu ra nước ngoài | P6 và Q10 |
| Câu "chưa tạo gì" trước khi đồng ý là sai; trang đăng nhập dùng câu đồng ý ngầm | Mục 9.1 |
| "Bắt đầu miễn phí", chữ "drive.file" viết nguyên văn kỹ thuật, không giải thích, một lần bấm thừa ở bước 2 | Mục 8, 9.3 |
| Form không có trạng thái "thiếu Drive"; bản tải về người đọc không hiểu | Mục 10.9, 10.11 |
| Dấu bị cắt trong tiêu đề Ionic | Không dùng tiêu đề lớn; `ion-title` dòng cao 1,65; thêm đệm phía trên cho các hộp chữ có cắt bớt dòng (mục 6.3) |
| Trông giống mặc định của AI | Vòng bút đỏ, dòng ngày, chữ số có chân (V14) |
| Màu nút trong toast; chữ nhấn trên nền nhấn nhạt | Định ở mục 6.1 (5.44:1) |
| Nhầm điểm vuốt (+1/−1) với trạng thái "Hứng thú" | V11, V12 |
| Mật độ hàng cho 300+ quán; đặc tả ghim bản đồ | Mục 7 |

---

## 3. Bảng quyết định V1–V37

Cột "Thay/Đổi" ghi quyết định cũ bị thay hoặc sửa (U#, M# của UI-REDESIGN; D# của PLAN; P# của PLAN-UI-1).

| # | Quyết định | Thay/Đổi |
|---|---|---|
| V1 | Một phong cách "Sổ tay" cho mọi trang app, mọi bảng trượt và mọi trang công khai, cả sáng và tối: nền giấy kem, chữ màu mực, màu nhấn đỏ gạch "bút đỏ", tiêu đề có chân | thay U28, M7, M8, P24, P37 |
| V2 | Mở đăng ký cho bất kỳ ai có tài khoản Google, bắt đầu bằng đợt thử chỉ dành cho người được mời (Q4) | thay D24 (kèm sửa bước 10 của SETUP.md và mục nghiệm thu D-13) |
| V3 | Tên miền riêng [TÊN MIỀN]. Trang công khai tĩnh ở `/`, app ở `/app/` (trong manifest: `id` và `scope` đều là `/app/`, nghĩa là chỉ địa chỉ bắt đầu bằng `/app/` thuộc app đã cài; `start_url`, trang mở đầu, là `/app/#/home`). Vẫn đặt trên GitHub Pages | sửa D1, D11, base trong D3 |
| V4 | Trên điện thoại, Trang chủ vẫn là trung tâm. Thanh dưới (dock) có 5 ô có chữ: `Tìm · Yêu thích · (＋ Thêm) · Vuốt · Bốc thăm`. Các trang khác không có thanh tab | giữ U5, U8; sửa U6 (nút Vuốt và Bốc thăm vào dock thay vì góc dưới phải) và U34 (nút tim rời khỏi header) |
| V5 | Từ 1024 px trở lên: `IonSplitPane` với cột bên rộng 248 px. Từ 768 đến 1023 px: bố cục điện thoại, căn giữa, rộng 720 px | thêm vào U8 (chỉ máy tính) |
| V6 | Một kiểu header (đầu trang) duy nhất: nút quay lại 44 px; tiêu đề trên thanh công cụ chỉ hiện khi tiêu đề chính (h1) trong nội dung đã cuộn khuất khỏi màn hình; tối đa 2 icon cộng menu ⋯. Không dùng kiểu tiêu đề cỡ lớn (large title) của iOS/Ionic | thay quy tắc large title trong `global.css` |
| V7 | Phông: Be Vietnam Pro 400/600 và Newsreader Variable, cộng một tập con Roboto Medium 8 KB chỉ dùng cho nút Google. Bỏ Playfair, Fraunces, Plus Jakarta Sans và Be Vietnam Pro 500 | thay M7, P6, P22, P23 |
| V8 | Chữ không bao giờ nhỏ hơn 12 px. Không bao giờ viết tiếng Việt toàn chữ in hoa | thay P36 |
| V9 | Mục Giao diện trong Tài khoản: Theo máy (mặc định), Sáng, Tối | sửa U27 |
| V10 | Mỗi icon chỉ một nghĩa. Yêu thích luôn là trái tim, kể cả ở trang Vuốt | sửa U16 (icon), P34 |
| V11 | Điểm vuốt hiện thành **Độ hot** với icon ngọn lửa. Nút vuốt phải là "Hot", con dấu trên thẻ ghi "+1 hot", toast ghi "+1 độ hot", lựa chọn sắp xếp là "Hot nhất" | sửa chữ của U16/U23, P11 |
| V12 | Trạng thái giữ tên Hứng thú · Chưa đi · Đã đi. "Hứng thú" dùng icon `flag` (lá cờ). Khi thêm một lần đi làm trạng thái tự chuyển sang Đã đi thì app hiện thông báo nhỏ (toast) cho bạn biết (`[CẦN CHỐT CÂU CHỮ]` đề xuất: "Đã thêm lần đi. Trạng thái chuyển sang Đã đi.") | giữ D16 |
| V13 | Thẻ nhóm hiện 3 ảnh vuông cộng ô "+N", chọn theo quy tắc "ảnh mới nhất" của P21 (PLAN-UI-1) | sửa U3 (hình dạng) và P21 (5 → 3) |
| V14 | Dấu ấn "vòng bút đỏ": nét SVG (ảnh vẽ bằng nét) vẽ tay màu đỏ, khoanh tròn hoặc gạch chân, chỉ dùng ở 3 chỗ: gạch chân nhãn "Hôm nay thử quán này", con dấu khi kéo thẻ ở Vuốt, và vòng khoanh quanh "Chốt quán này" | mới |
| V15 | Yêu thích là trang riêng, `#/favorites` | chốt U22 |
| V16 | Trang chọn quán thành trang lưới thật cho từng nhóm, có "Vuốt nhóm này" và "Bốc thăm" | làm U9; thay P9 |
| V17 | Tìm kiếm với ô trống liệt kê mọi địa điểm. Bộ lọc và cách sắp xếp lưu ngay trong địa chỉ trang (URL), nên gửi link là giữ nguyên kết quả. Khi tìm, gõ không dấu vẫn ra kết quả có dấu | làm U10 và U44; đảo một phần U8 ("bỏ Khám phá") |
| V18 | Trang ngẫu nhiên tên "Bốc thăm": tối đa 3 kết quả, bốc lại, bắt buộc chọn nhóm. "Chốt quán này" không ghi gì vào DB | giữ U19–U21 |
| V19 | Gần tôi: trang hỏi dẫn tới trang kết quả. Kết quả ra trước dạng danh sách xếp theo khoảng cách; bản đồ làm sau (vẽ bằng MapLibre, dữ liệu bản đồ miễn phí của OpenFreeMap). Nút chuyển "Danh sách" vẫn giữ sau khi có bản đồ | giữ U11–U13, U35 |
| V20 | Vuốt vẫn là chế độ toàn màn hình có nút quay lại + avatar, không có dock. Trang được phép cuộn, và tỉ lệ ảnh đổi theo chiều cao màn hình | giữ U17; thay P29 |
| V21 | Một bảng thông tin trông giống hệt nhau dù mở từ đâu, có nút tim bật/tắt | sửa M5; bỏ prop `theme` |
| V22 | "Chỉ đường" là nhãn duy nhất cho việc mở Google Maps tại quán | làm U13 nhất quán |
| V23 | Xem ảnh là một route (`#/places/:id/photos/:n`), nên bấm Back là đóng | mới |
| V24 | Form Thêm/Sửa có 4 phần, nút "Lưu địa điểm" dính ở đáy, giờ mở cửa nằm trong một bảng trượt. Quán mới mặc định "Chưa rõ giờ". Câu hỏi "Bỏ thay đổi?" hiện cả khi bạn vuốt từ mép trái hoặc bấm nút Back của trình duyệt | thay mặc định 08:00–22:00 của D18 (`PlaceFormPage.tsx:75`) |
| V25 | Khi offline, nút ＋ trên dock vẫn hiện, trông như bị tắt, và bấm vào thì giải thích. Các nút thêm, sửa, xoá dữ liệu khác vẫn ẩn như cũ | sửa D13 (chỉ nút ＋) |
| V26 | Đăng nhập chỉ xin các quyền cơ bản. Quyền lưu ảnh vào Drive (`drive.file`) được xin riêng ở bước 2 của làm quen (onboarding): lúc đó Google hỏi lại (`prompt=consent`) và cho phép app giữ khoá làm mới lâu dài (`access_type=offline`). Đăng nhập thường dùng `prompt=select_account`. Máy chủ kiểm lại rằng quyền đó đã thật sự được cấp | thay D5 |
| V27 | Xin đồng ý riêng cho từng mục đích, đúng Luật 91: 4 ô tick, đều để trống lúc đầu. Mỗi lần đồng ý được ghi vào bảng `consents` kèm phiên bản chính sách, thời gian và user agent (chuỗi nhận dạng trình duyệt); người dùng tải bản ghi này về được. Khi chính sách đổi, một màn riêng hỏi lại. Trạng thái đồng ý được lưu đệm trên máy | mới |
| V28 | Người dùng tự thực hiện quyền với dữ liệu của mình ngay trong app: tải về (CSV + JSON), ngắt kết nối Drive (đồng thời rút đồng ý lưu ảnh và tắt sao lưu hằng tuần, vì ô 3 phụ thuộc ô 2), công tắc sao lưu hằng tuần, xoá tài khoản (bằng ô tick, không gõ chữ), đăng xuất trên máy này hoặc trên mọi thiết bị | mới |
| V29 | Ra mắt khi chưa xác minh thương hiệu với Google (cách a). Không tải logo lên. Trang đăng nhập giải thích dòng "…supabase.co" mà Google hiện | mới (Q2) |
| V30 | Hạn mức trong DB: 1.000 địa điểm mỗi người, 20 ảnh mỗi địa điểm, 50 nhóm, 200 nhãn, 300 lần đi mỗi địa điểm. Một quy tắc giới hạn tần suất gọi (rate limit) trên Vercel WAF | chuyển D23 vào DB |
| V31 | Sao lưu hằng tuần thành tự chọn (ô đồng ý 3), chạy tách riêng từng người, ghi nhật ký (log) ít hơn | sửa D12 |
| V32 | Lớp chặn trình duyệt nhúng của ứng dụng chat (in-app browser) ở `/`, `/cai-ung-dung/` và `/app/` | mới |
| V33 | Hướng dẫn cài nằm trong app (`#/install` và một bảng trượt). App mời cài sau khi bạn lưu địa điểm thứ 1 và thứ 3; nếu lời mời bị bỏ qua 2 lần thì không mời nữa | mới |
| V34 | Giá ở Chi tiết: "50.000 ₫ – 90.000 ₫". Ở hàng và thẻ: "50.000–90.000 ₫", "Từ 50.000 ₫", "Đến 90.000 ₫", "Miễn phí" | thêm vào D20 |
| V35 | Mọi thao tác trên một hàng đều có menu ⋯, không có gì chỉ làm được bằng vuốt. Trang Quản lý nhãn có nút tạo nhãn mới | mới |
| V36 | Trang 404 thật (bản tĩnh và bản trong app) và màn chờ khởi động (boot splash) viết thẳng trong HTML | thay chuyển hướng `*` → `/` |
| V37 | Câu chữ về vị trí phải đúng: vị trí dùng trên máy; chỉ được lưu qua nút "Dùng vị trí hiện tại"; OpenFreeMap thấy địa chỉ IP và vùng bản đồ đang xem | mới |

---

## 4. Điều hướng

**Điện thoại (dưới 768 px)**
- **Trang chủ là trung tâm.** Chỉ Trang chủ có dock (V4).
- **Mọi trang khác** dùng header V6 có nút quay lại. Bấm quay lại khi không có lịch sử thì chuyển thẳng về `#/home` (không giữ trang hiện tại trong lịch sử).
- **Chế độ toàn màn hình**, không có dock: Vuốt, bản đồ Gần tôi, xem ảnh và onboarding.
- **Không có ngõ cụt.** Mọi trạng thái trống đều có một hành động. Chip nhóm và chip nhãn là link. Trang nhóm có link sang Vuốt và Bốc thăm.
- **Avatar → Tài khoản.** Avatar hiện ở Trang chủ và Vuốt (U2, U17).

**Máy tính bảng (768–1023 px)**
- Bố cục điện thoại, căn giữa rộng 720 px. Dock cũng căn giữa rộng 720 px.
- Bảng trượt thành hộp thoại rộng 520 px.

**Máy tính (từ 1024 px)**
- Cấu hình split pane (chia màn thành cột bên và vùng nội dung): `IonSplitPane when="(min-width:1024px)" contentId="main"`.
- Cột bên: `IonMenu` với `--side-min-width:248px; --side-max-width:248px`. Đặt `disabled` dưới 1024 px và `swipeGesture={false}`, để nó không bao giờ tranh với cử chỉ vuốt quay lại của iOS.
- Dock ẩn. Vuốt, Bốc thăm và bản đồ mở trong vùng nội dung, cột bên vẫn hiện.
- **Cột bên, từ trên xuống:**
  - chữ "WhereToGo" (wordmark);
  - **[＋ Thêm địa điểm]** (nút chính);
  - Trang chủ · Tìm kiếm · Yêu thích · Vuốt chọn quán · Bốc thăm · Gần tôi;
  - mục "Nhóm" liệt kê mọi nhóm kèm số quán;
  - dưới cùng: dòng báo offline, "Trợ giúp ↗", và avatar kèm tên người dùng, bấm mở "Tài khoản".
- **Độ rộng nội dung:** trang đọc 680 px, form 560 px, lưới 1120 px.
- **Bàn phím:** `/` mở Tìm kiếm, `n` mở Thêm, `Esc` đóng bảng trượt, ←/→ đổi ảnh. Phím của trang Vuốt ở mục 10.7.

**Sơ đồ**

```
CÔNG KHAI  https://[TÊN MIỀN]/   (HTML tĩnh, nằm ngoài service worker)
/  Trang giới thiệu ──[Bắt đầu lưu quán] / [Đăng nhập]──────► /app/#/login
 ├ /quyen-rieng-tu/  /dieu-khoan/  /tro-giup/  /404.html
 ├ /cai-ung-dung/ ──[Mở WhereToGo]──────────────────────────► /app/#/install
 └ webview Zalo/Messenger/FB/IG/TikTok ► Lớp chặn (Sao chép link · Mở bằng Chrome · Vẫn xem trang)

APP  https://[TÊN MIỀN]/app/#/…
#/login ─Google─► tài khoản mới ► #/welcome/1 Đồng ý ► 2 Ảnh & Drive* ► 3 Nhóm ► 4 Nơi đầu tiên
        │                        ► #/places/new?link=… ► #/places/:id + [Bảng Cài app]   (*chỉ khi tick ô 2)
        └ đã có tài khoản ► ?next hoặc #/home        chính sách đổi ► #/welcome/policy

#/home (TRUNG TÂM)
 ├ avatar ─────────────────► #/settings
 ├ Hôm nay thử quán này ───► [Bảng thông tin] ─ Chỉ đường ↗ │ Xem đầy đủ ► #/places/:id
 ├ Bắt đầu (danh sách việc) ► #/places/new · #/swipe · [Bảng Cài app]
 ├ Thẻ nhóm ───────────────► #/categories/:id ─ Vuốt nhóm này ► #/swipe?nhom=:id
 │   "Sửa" ► #/settings/categories              ├ Bốc thăm ► #/random?nhom=:id
 │                                              ├ ＋ ► #/places/new?nhom=:id
 │                                              └ thẻ quán ► #/places/:id
 ├ Thẻ Gần tôi ────────────► #/nearby ► #/nearby/results?…  [Danh sách | Bản đồ] ─ ghim ► [Bảng thông tin]
 └ DOCK  Tìm ► #/search · Yêu thích ► #/favorites · ＋ ► #/places/new · Vuốt ► #/swipe · Bốc thăm ► #/random

#/places/:id ─ ảnh ► #/places/:id/photos/:n │ Sửa ► #/places/:id/edit │ nhãn ► #/search?nhan=
             └ nhóm ► #/categories/:id │ Thêm lần đi ► [AddVisit] │ ⋯ Xoá ► [xác nhận] ► #/home (replace)
#/settings ─ #/settings/categories │ #/settings/tags │ #/settings/privacy ► #/settings/privacy/delete
           └ #/settings/about │ #/install │ Trợ giúp ↗ /tro-giup/ │ Đăng xuất ► [bảng trượt]
#/* lạ, hoặc :id không tồn tại ► 404 ─ Về Trang chủ
```

---

## 5. Danh sách trang

Mã trạng thái: L = khung xương lúc đang tải · E = trống · Er = lỗi kèm "Thử lại" · Off = banner offline, chỉ xem · P = cần quyền (vị trí) · Q = đã chạm hạn mức.

| Trang | Route / file | Ai thấy | Mục đích | Các khối, từ trên xuống | Hành động chính | Trạng thái |
|---|---|---|---|---|---|---|
| Trang giới thiệu (landing) | `/` · `web/site/index.html` | Chưa đăng nhập; đã đăng nhập thấy "Mở WhereToGo" | Giới thiệu app; đáp ứng yêu cầu trang chủ của Google | Mục 8 | Bắt đầu lưu quán | Chạy được không cần JS; lớp chặn trình duyệt chat; banner `?da-xoa=1`; app đã cài thì chuyển sang `/app/` |
| Quyền riêng tư | `/quyen-rieng-tu/` (`/privacy.html` chuyển sang bằng meta refresh) | Mọi người | Công bố theo Luật 91 và Google | Phiên bản và ngày · tóm tắt · ai kiểm soát dữ liệu và cách liên hệ · bảng các loại dữ liệu · mục đích sử dụng · bên xử lý dữ liệu và nơi đặt máy chủ (Supabase Singapore, Vercel Singapore, GitHub Pages, GitHub Actions, Google, OpenFreeMap, bộ đọc link Google Maps) · chuyển dữ liệu ra nước ngoài · thời gian lưu · quyền của người dùng kèm thời hạn (xác nhận trong 2 ngày làm việc; xử lý trong 10–30 ngày tuỳ loại yêu cầu; số liệu theo mục 11.5, luật sư xác nhận) · cách tải về, rút đồng ý và xoá · cam kết Sử dụng giới hạn (Limited Use) của Google · giới hạn tuổi 16+ · cách xử lý vi phạm dữ liệu (nguồn ghi báo trong 72 giờ; chỉ nêu con số sau khi luật sư xác nhận `[KIỂM TRA]`) · dữ liệu lưu trên máy (localStorage, IndexedDB 7 ngày, Cache Storage; xoá khi đăng xuất) · ai có quyền truy cập kỹ thuật và dùng vào việc gì · nhật ký của Vercel và GitHub hết hạn theo chính sách riêng của họ · khi chính sách thay đổi · tóm tắt tiếng Anh | — | Có kiểu in (print stylesheet) |
| Điều khoản | `/dieu-khoan/` | Mọi người | Quy định sử dụng | Miễn phí và phi thương mại, không bảo đảm, có thể ngừng với báo trước [SỐ NGÀY] ngày · nội dung và Drive vẫn là của bạn · sử dụng hợp lệ · hạn mức · 16+ · tạm khoá tài khoản · luật Việt Nam · liên hệ | — | — |
| Trợ giúp | `/tro-giup/` | Mọi người | Tự tìm câu trả lời | Các nhóm `<details>` (mục 10.13) | Gửi email hỗ trợ | — |
| Hướng dẫn cài | `/cai-ung-dung/` | Mọi người | Giải thích cách cài | Tab theo nền tảng · các bước có ảnh chụp | Mở WhereToGo → `/app/#/install` | — |
| 404 (tĩnh) | `/404.html` | Mọi người | Thoát khỏi link hỏng | Mục 10.15 | Về trang chủ | — |
| Thông báo chuyển nhà | Địa chỉ cũ `…github.io/WhereToGo/`, tạm thời | Mọi người | Chuyển các bản app đã cài của chủ app | "WhereToGo đã chuyển nhà" · link mới | Mở địa chỉ mới | Service worker tự huỷ |
| Lớp chặn trình duyệt chat | Lớp phủ từ `inapp.js`, không có URL | Mọi người | Google chặn đăng nhập trong webview | Mục 9.7 | Sao chép link | Đã chép / chép lỗi; Vẫn xem trang (chỉ trang tĩnh) |
| Màn chờ khởi động | Viết thẳng trong `/app/index.html` | Mọi người | Không để màn trắng lúc tải | Logo · "WhereToGo" · vòng xoay sau 600 ms · `<noscript>` "WhereToGo cần JavaScript để chạy." | — | Theo chế độ tối của máy |
| Đăng nhập | `#/login?next=` · `features/auth/LoginPage.tsx` | Chưa đăng nhập | Bắt đầu đăng nhập Google | Mục 9.1 | Tiếp tục với Google | Đang mở Google… · lỗi · offline · đã đăng nhập → `next` |
| Onboarding | `#/welcome/1…4` · `features/onboarding/WelcomePage.tsx` | Đã đăng nhập, chưa có đồng ý hiện hành | Đồng ý, Drive, nhóm, nơi đầu tiên | Thanh bước · mỗi bước một việc | Theo từng bước | Mục 9 |
| Đồng ý lại | `#/welcome/policy` · `PolicyUpdatePage.tsx` | Đã đăng nhập, phiên bản đồng ý đã cũ | Hỏi lại sau khi chính sách đổi | Mục 9.5 | Đồng ý và tiếp tục | Offline: banner chỉ xem |
| Trang chủ | `#/home` · `features/home/HomePage.tsx` | Đã đăng nhập | Trung tâm | Mục 10.1 | ＋ trên dock | L, Er, E (0 quán), 0 nhóm, Off, Drive, Q |
| Trang chọn quán | `#/categories/:id?q=&nhan=&gia=&tt=&sx=` · `features/categories/CategoryPage.tsx` | Đã đăng nhập | Xem một nhóm (U9) | Mục 10.2 | Thẻ → Chi tiết | L, E, không có kết quả, id lạ → 404, Off |
| Tìm kiếm | `#/search?q=&nhom=&gia=&km=&nhan=&tt=&yt=&vitri=&sx=` · `features/search/SearchPage.tsx` | Đã đăng nhập | Tìm bất kỳ quán nào | Mục 10.3 | Hàng → Chi tiết | L, E, không có kết quả, P (khoảng cách), Off (tìm trong dữ liệu đệm) |
| Yêu thích | `#/favorites?nhom=` · `features/favorites/FavoritesPage.tsx` | Đã đăng nhập | Danh sách chọn lọc | Mục 10.4 | Thẻ → Chi tiết | L, E, Off |
| Gần tôi: hỏi | `#/nearby` · `features/nearby/NearbyAskPage.tsx` | Đã đăng nhập | Giải thích về vị trí; chọn tiêu chí | Mục 10.5 | Tìm quanh đây | P bị từ chối, không có toạ độ, đang định vị, quá thời gian |
| Gần tôi: kết quả | `#/nearby/results?nhom=&gia=&km=&xem=ds\|bando` · `NearbyResultsPage.tsx` (tải lười `NearbyMap.tsx`) | Đã đăng nhập | Kết quả dạng danh sách, sau này thêm bản đồ | Mục 10.5 | Hàng hoặc ghim → bảng thông tin | 0 kết quả, Off (chỉ danh sách), không có WebGL, lỗi tải ô bản đồ |
| Bốc thăm | `#/random?nhom=` · `features/random/RandomPage.tsx` | Đã đăng nhập | App chọn giúp tối đa 3 nơi | Mục 10.6 | Bốc 3 quán / Bốc lại | Chưa chọn nhóm, 0 quán (U20), 1–2 quán; chạy được offline |
| Vuốt chọn quán | `#/swipe?nhom=&nhan=` · `features/swipe/SwipePage.tsx` | Đã đăng nhập | Tạo điểm Độ hot | Mục 10.7 | Hot (+1) | Không có quán, không khớp, đã xem hết, Off khoá thao tác, đang bận |
| Chi tiết địa điểm | `#/places/:id` · `PlaceDetailPage.tsx` | Đã đăng nhập | Trang sổ tay của một quán | Mục 10.8 | Chỉ đường | L, đã xoá (biến thể 404), Er + thử lại, Off |
| Xem ảnh | `#/places/:id/photos/:n` · `PhotoViewerPage.tsx` | Đã đăng nhập | Ảnh toàn màn hình | Mục 10.8 | Vuốt hoặc phím mũi tên | L, "Tải lại ảnh", Off và ảnh chưa có trong đệm |
| Thêm / Sửa | `#/places/new?nhom=&link=`, `#/places/:id/edit` · `PlaceFormPage.tsx` | Đã đăng nhập | Lưu một quán | Mục 10.9 | Lưu địa điểm | Tiến độ tải ảnh, kiểm lỗi, Off, thiếu Drive, Q, chặn mất thay đổi |
| Tài khoản | `#/settings` · `SettingsPage.tsx` | Đã đăng nhập | Trung tâm cài đặt | Mục 10.10 | — | Các trạng thái Drive, Off |
| Quản lý nhóm | `#/settings/categories` | Đã đăng nhập | Tạo, sửa, xoá nhóm | Mục 10.12 | ＋ Nhóm mới | L, chặn xoá, Q, Off chỉ đọc |
| Quản lý nhãn | `#/settings/tags` | Đã đăng nhập | Tạo, đổi tên, xoá nhãn | Mục 10.12 | ＋ Nhãn mới | L, E, Q, Off |
| Quyền riêng tư & dữ liệu | `#/settings/privacy` · `PrivacyDataPage.tsx` | Đã đăng nhập | Quyền dữ liệu | Mục 10.11 | Tải dữ liệu | Đang xuất, Off khoá các thao tác |
| Xoá tài khoản | `#/settings/privacy/delete` · `DeleteAccountPage.tsx` | Đã đăng nhập | Xoá vĩnh viễn | Mục 10.11 | Xoá vĩnh viễn tài khoản | Đang xoá, Er + thử lại, xong → `/?da-xoa=1`, Off |
| Giới thiệu | `#/settings/about` · `AboutPage.tsx` | Đã đăng nhập | Lòng tin và ghi công | Phiên bản · "Dự án cá nhân, miễn phí, không quảng cáo của [TÊN NGƯỜI VẬN HÀNH]" · Có gì mới · Mã nguồn [LINK GITHUB] · ghi công (Be Vietnam Pro và Newsreader theo giấy phép SIL OFL, Ionicons, MapLibre, © OpenFreeMap © OpenStreetMap) | — | — |
| Cài ứng dụng | `#/install` · `features/install/InstallPage.tsx` (cùng nội dung với InstallSheet) | Đã hoặc chưa đăng nhập | Cài PWA (app web cài lên màn hình chính) | Mục 10.14 | Cài ngay (chỉ Android) | Đã cài; `RequireAuth` phải cho phép `#/install`, `#/login` và trang 404 khi chưa đăng nhập (thêm vào P5) |
| 404 (trong app) | `#/*` · `app/NotFoundPage.tsx` | Mọi người | Thay cho chuyển hướng im lặng | Mục 10.15 | Về Trang chủ | Biến thể quán đã xoá |

**Bảng trượt** (không phải trang; tất cả dựng trên `WtgSheet`):
- Bảng thông tin, Lọc, AddVisit, Giờ mở cửa (OpeningHoursEditor cộng TimeWheel), sửa Nhóm, sửa Nhãn;
- Cài app, Đăng xuất, Kết nối / Ngắt kết nối Drive;
- Vị trí (hỏi vị trí ở trang Tìm kiếm);
- Bảng xác nhận: xoá quán, bỏ thay đổi, xoá nhóm, nhãn hoặc lần đi, từ chối đồng ý;
- Hạn mức.

**Bỏ đi**
- `PlaceListPage` tách thành `PlaceRow` + `PlaceGrid` và 4 trang ở bảng trên.
- Danh sách Gần tôi cũ.
- Tạo nhóm và nhãn trong IonAlert; thay bằng bảng trượt sửa nhóm/nhãn.
- Quy tắc large title trong `global.css`.

---

## 6. Hệ thiết kế

Mục này là "bảng quy chuẩn" của phong cách Sổ tay: mọi màu, phông chữ, cỡ chữ, khoảng cách đều được đặt tên một lần, rồi cả app lẫn các trang công khai dùng chung. Mỗi giá trị được đặt một tên riêng, gọi là **token** (token thiết kế: tên đặt cho một giá trị như màu hay cỡ chữ, để code gọi theo tên chứ không gõ lại con số). Tên token, tên file, route và tên thuộc tính CSS giữ nguyên tiếng Anh vì code dùng đúng các tên đó. Toàn bộ token nằm trong một file `web/src/theme/tokens.css`, sinh tự động từ một nguồn JSON (mục 6.9).

### 6.1 Màu sắc

Mọi tỉ lệ dưới đây tính theo WCAG 2.x (bộ chuẩn quốc tế để web dễ dùng với mọi người, kể cả người mắt yếu) và đã được tính riêng cho kế hoạch này. **Tỉ lệ tương phản** đo độ tách giữa hai màu, từ 1:1 (không khác gì nhau) đến 21:1 (đen trên trắng); chữ thường cần từ 4.5:1, hình khối và viền cần từ 3:1 để người mắt yếu vẫn thấy rõ. Mã `#F5F2E9` là mã màu hex (hệ 16: hai chữ số cho mỗi màu đỏ, lục, lam). Trong bảng, hai số cách nhau bằng dấu "/" là **sáng / tối**; mọi số là tỉ lệ :1.

| Token | Sáng | Tối | Dùng cho | Tương phản (sáng / tối) |
|---|---|---|---|---|
| bg | `#F5F2E9` | `#141311` | Nền trang, thanh công cụ (toolbar) | chữ 15.62 / 15.91 |
| surface | `#FBF9F4` | `#1E1C19` | Thẻ, bảng trượt, dock, ô nhập | chữ 16.62 / 14.57 |
| surface-2 | `#EDE8DC` | `#2A2723` | Chip đang tắt, chữ gợi ý trong ô (placeholder), điều khiển bị khoá, hộp thông tin | chữ 14.30 / 12.74 · chữ muted 6.01 / 6.53 |
| border | `#E2DBCC` | `#3A3631` | Chỉ là đường kẻ mảnh để trang trí; không bao giờ là dấu hiệu duy nhất | so với bg 1.23 / 1.55 |
| border-strong | `#8A8072` | `#7D7466` | Ô nhập, viền chip, nút phụ, sao rỗng, tay nắm của bảng trượt | so với bg 3.47 / 4.03 · surface 3.69 / 3.69 · surface-2 3.17 / 3.23 |
| text | `#1C1917` | `#F2EDE3` | Mọi chữ | tối thiểu 12.02 trên mọi bề mặt, kể cả accent-soft (13.82 / 12.02) |
| text-muted | `#5C554B` | `#B3AB9C` | Dòng phụ, chú thích, chữ gợi ý trong ô, nhãn dock | bg 6.57 / 8.15 · surface 6.99 / 7.47 · surface-2 6.01 / 6.53 |
| accent | `#A8482A` | `#E58A66` | **Chỉ để tô nền (fill):** nút chính, ＋, ghim, tim hoặc ngọn lửa khi bật, nét bút đỏ | làm hình khối so với bg 5.17 / 7.21 · surface 5.51 / 6.60 · surface-2 4.74 / 5.77 |
| accent-pressed | `#8F3D23` | `#CF7652` | Màu tô khi đang nhấn (Ionic gọi là shade) | chữ on-accent trên nó 7.34 / 5.57 |
| on-accent | `#FFFFFF` | `#1C1210` | Chữ và icon đặt trên accent | 5.79 / 7.14 |
| accent-text | **`#96401F`** | `#F09D7B` | **Mọi chữ mang màu nhấn:** link, nút ghost, chip đang chọn, hàng đang chọn ở cột bên | bg 6.15 / 8.68 · surface 6.54 / 7.94 · surface-2 5.63 / 6.95 · accent-soft 5.44 / 6.56 |
| accent-soft | `#F4E1D7` | `#3B2720` | Chip đang chọn, hàng ở cột bên, chip "Hứng thú" | viền accent trên nó 4.58 / 5.45 |
| success / success-bg | `#2D6E45` / `#E2EEE2` | `#86CB9A` / `#1F3326` | Đang mở, Đã đi | bg 5.47 / 9.75 · trên nền success-bg của chính nó 5.12 / 7.07 |
| warning / warning-bg | `#8A5600` / `#F5E6C8` | `#E9B65E` / `#3A2E17` | Sắp đóng, lỗi Drive, hạn mức | bg 5.50 / 10.01 · trên nền warning-bg của chính nó 4.99 / 7.15 · chữ text trên warning-bg 14.19 / 11.37 |
| danger / danger-bg | `#B3261E` / `#F8E0DA` | `#F49283` / `#3E211D` | Lỗi, xoá | bg 5.84 / 8.21 · trên nền danger-bg của chính nó 5.19 / 6.45 |
| on-danger | `#FFFFFF` | `#1C1210` | Chữ trên nút xoá ở bước xác nhận cuối | 6.54 / 8.12 |
| focus | `#2F5DA8` | `#93B6F2` | Vòng tiêu điểm (focus ring: khung hiện quanh nút khi dùng bàn phím) dày 2 px, chừa khe 2 px; chấm vị trí người dùng | bg 5.77 / 9.03 · surface 6.14 / 8.27 · surface-2 5.28 / 7.23 |
| inverse-bg / inverse-text | `#1C1917` / `#F5F2E9` | `#F2EDE3` / `#1C1917` | Toast (thông báo nhỏ tự tắt) | 15.62 / 14.99 |
| inverse-action | `#F09D7B` | `#96401F` | Nút trong toast ("Hoàn tác") | 8.17 / 5.90 |
| scrim | `rgba(28,25,23,.45)` | `rgba(0,0,0,.60)` | Lớp phủ mờ phía sau bảng trượt; không bao giờ có chữ nằm trên | — |
| photo-edge | `rgba(28,25,23,.08)` | `rgba(255,255,255,.06)` | Viền trong 1 px của ảnh | — |
| viewer-bg | `#0C0A09` | `#0C0A09` | Nền trình xem ảnh | chữ trắng 19.76 |

Cách nhớ hai màu nhấn: **accent chỉ để tô nền; chữ nào mang màu nhấn đều dùng accent-text** (tối hơn ở chế độ sáng, sáng hơn ở chế độ tối để đủ tương phản).

**Kiểm tra gộp (trường hợp xấu nhất):**
- **Nhãn bo tròn hình viên thuốc (pill) có chữ nằm trên ảnh** (surface độ đục 92% đặt trên ảnh đen, trắng và xám trung bình): chữ text tối thiểu 13.89 (sáng) / 11.60 (tối); chữ accent-text tối thiểu 5.47 / 6.33.
- **Dock nằm trên nội dung đang cuộn** (surface độ đục 96%): nhãn muted tối thiểu 6.46 / 6.80.
- **Ghim bản đồ** luôn có vòng surface dày 2 px bao quanh, nên đạt dù màu bản đồ thế nào: accent so với vòng 5.51 / 6.60; chấm focus so với vòng 6.14 / 8.27.
- **Nút Google:** chế độ sáng, chữ 16.48 và viền 4.53 so với màu nền nút; chế độ tối, chữ 14.47 và viền 5.83.

**Logo và màu hệ thống:**
- Đổi màu chấm ghim của logo từ `#CA8A04` sang màu accent, giữ ô nền mực `#1C1917`, rồi chạy `npm run icons` để sinh lại các kích cỡ icon.
- Thẻ meta `theme-color` (màu thanh trạng thái hoặc thanh địa chỉ của trình duyệt trên điện thoại): `#F5F2E9` (sáng) / `#141311` (tối).
- Manifest (tệp khai báo app web cài được) đặt `background_color` và `theme_color` là `#F5F2E9`.

### 6.2 Phông chữ

Tất cả là woff2 (định dạng phông web đã nén), chỉ lấy tập con (subset: chỉ giữ các ký tự cần dùng) latin và vietnamese. Kích thước là số đo thật.

| Bộ phông | File (latin + vietnamese), byte | Tổng byte | Vai trò |
|---|---|---|---|
| Be Vietnam Pro 400 (đã đóng gói sẵn) | 21 168 + 11 532 | 32 700 | Chữ thường |
| Be Vietnam Pro 600 (đã đóng gói sẵn) | 22 032 + 12 176 | 34 208 | Nút, nhãn, chữ nhấn mạnh |
| Newsreader Variable, wght 200–800 (mới: `@fontsource-variable/newsreader@5.2.10`) | 58 084 + 11 932 | 70 016 | Tiêu đề, tên quán, Câu chuyện, chữ số |
| Tập con Roboto Medium cho "Tiếp tục với Google" | 4 476 + 3 936 | 8 412 | Chỉ dùng cho nút Google |
| **Tổng** | | **145 336 B (khoảng 142 KiB)** | Trước đây 298 036 B |

- **Gói cần gỡ:** `@fontsource/playfair-display`, `@fontsource-variable/fraunces` và `@fontsource-variable/plus-jakarta-sans`.
- **Be Vietnam Pro:** bỏ độ đậm 500; chỗ nào Ionic yêu cầu độ đậm 500 thì dùng 400 thay thế. Đặt `strong, b { font-weight: 600 }`.
- **Quy tắc `@font-face`:** viết tay, chỉ woff2, có `unicode-range` (khai báo ký tự nào thì tải file nào). Không dùng file `.woff`, không dùng latin-ext. Dùng `font-display: swap` (hiện tạm chữ hệ thống rồi đổi sang phông khi tải xong) và `font-synthesis: none` (cấm trình duyệt tự làm giả chữ đậm hay nghiêng).
- **Tập con Roboto:** tạo một lần bằng `pyftsubset --text="Tiếp tục với Google"` (công cụ cắt phông của fontTools) từ các file Roboto 500 của `@fontsource/roboto`, rồi commit vào `web/src/theme/fonts/`. Tập con này được lưu sẵn khi cài app (precache) vì chỉ 8 KB. Phải tạo lại nếu nhãn nút đổi.
- **Độ phủ chữ, đã kiểm bằng fontTools:** đủ 134 chữ cái tiếng Việt cùng ₫ – — … “ ” ’ · trong từng bộ phông.
- **Cỡ quang học của Newsreader (optical size, trục `opsz`: nét chữ tự chỉnh theo cỡ chữ):** file wght (bản có một trục độ đậm) không có trục `opsz`, nên cỡ chữ lớn dùng kiểu dành cho chữ thường. Cách này ổn định hơn và vẫn rõ nét ở chế độ tối. Các file có `opsz` nặng khoảng 159 KB (so với 70 KB của file đang dùng), không đáng.
- **Không dùng chữ nghiêng ở bất kỳ đâu.**

### 6.3 Thang chữ

Trong code, mọi cỡ chữ tính bằng rem (1 rem = 16 px; đơn vị này tự to lên khi người dùng tăng cỡ chữ trong máy). Bảng dưới đây ghi quy ra px cho dễ đọc, theo dạng "cỡ chữ / dòng cao" (dòng cao là chiều cao của mỗi dòng chữ). `body { font-size: 1rem }` để Dynamic Type của iOS (cỡ chữ người dùng chỉnh trong Cài đặt iPhone) vẫn hoạt động. Riêng nhãn dock cố định 12 px và không xuống dòng (`nowrap`), giống thanh tab gốc của điện thoại.

| Kiểu | Phông | Cỡ / dòng cao (px) | Độ đậm | Dùng cho |
|---|---|---|---|---|
| display | Newsreader | 36/46; 52/66 từ 768 px trở lên | 600 | Dòng chính của trang giới thiệu, tiêu đề onboarding |
| h1 | Newsreader | 28/36 | 600 | Tiêu đề trang nằm trong nội dung, tên quán |
| h2 | Newsreader | 22/30 | 600 | Các mục, câu hỏi của nhóm, tiêu đề bảng trượt và trạng thái trống |
| name | Newsreader | 17/22 ở hàng và lưới; 24/32 ở Vuốt và bảng thông tin | 600 | Tên quán |
| numeral | Newsreader | 28/36 (ô "+N": 22/30) | 600 | Số 1–3 của Bốc thăm |
| story | Newsreader | 18/28 | 400 | Câu chuyện, câu hỏi của nhóm ở trang nhóm |
| title | Be Vietnam Pro | 17/24 (toolbar: dòng cao 1,65) | 600 | Toolbar, hàng cài đặt |
| body / button | Be Vietnam Pro | 16/24 | 400 / 600 | Chữ thường và ô nhập (16 px để iOS không tự phóng to khi chạm vào ô) / nút bấm |
| body-sm | Be Vietnam Pro | 15/22 | 400 | Chữ trong bảng trượt, đoạn dẫn |
| label | Be Vietnam Pro | 14/20 | 600 | Nhãn ô nhập, chip |
| caption | Be Vietnam Pro | 13/18 | 400 | Dòng phụ, chú thích, lỗi |
| micro | Be Vietnam Pro | 12/16 | 600 | Nhãn dock, chip hiển thị nhỏ; luôn một dòng |

**An toàn cho dấu tiếng Việt (đã đo).** Chữ Ổ (hai dấu chồng nhau) vươn lên 1,168 em phía trên đường chân chữ ở Be Vietnam Pro, trong khi phông chỉ chừa cho hộp chữ 1,0 em (thông số kỹ thuật tên hhea ascent). Ở Newsreader, chữ Ổ vươn lên 0,982 em còn hộp chừa 0,735 em. (1 em = đúng cỡ chữ đang dùng.) Hộp nào cắt phần tràn sẽ làm cụt dấu, nên:
1. **Hộp có `overflow:hidden`** (cắt phần tràn: giới hạn số dòng, cắt bằng dấu …) được thêm `padding-top: .14em`. Trường hợp xấu nhất cần 0,134 em (Be Vietnam Pro cỡ 12/16).
2. **Tiêu đề trên toolbar:** đặt `ion-title { line-height: 1.65 }`. Be Vietnam Pro cần tối thiểu 1,60 bên trong `.toolbar-title` có `overflow:hidden` của Ionic.
   - `ion-title` của Ionic 9.0.5 không có `::part` nào để tuỳ biến, nên quy tắc `ion-title.title-large::part(native)` hiện có trong `global.css` không áp dụng cho phần tử nào. Xoá quy tắc đó.
3. **Dòng cao cho văn bản nhiều dòng:** Be Vietnam Pro tối thiểu 1,38, Newsreader tối thiểu 1,25. Mọi kiểu trong bảng trên đều đạt.
4. **Câu chữ để thử** `[KIỂM TRA]`: "Ẩm thực", "Quán Ốc Đào" và "ỔI DẺO SÀI GÒN" (dán từ Google Maps ở dạng chữ in hoa) ở cỡ 17, 22 và 28 px, trên iPhone thật.

### 6.4 Khoảng cách, bố cục, bo góc, độ nổi

- **Thang khoảng cách (px):** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
- **Lề hai bên (gutter):** 16 px trên điện thoại, 24 px từ 768 px, 32 px từ 1024 px.
- **Độ rộng nội dung:** trang đọc 680, form 560, đăng nhập 420, lưới và trang giới thiệu 1120 (px).
- **Bo góc (radii, px):** sm 8 (ảnh thu nhỏ) · md 12 (nút, ô nhập, ảnh) · lg 16 (thẻ) · xl 24 (mép trên của bảng trượt, hộp thoại) · full (bo tròn hẳn: chip, avatar, ＋, ghim).
- **Độ nổi (elevation: mức "nổi" của một lớp so với nền, thể hiện bằng viền và bóng đổ):**
  - e0: chỉ có viền.
  - e1 (thẻ): viền, cộng `0 1px 2px rgba(28,25,23,.06)` ở chế độ sáng; chỉ có viền ở chế độ tối.
  - e2 (dock, bảng trượt, thẻ vuốt, nút nổi trên bản đồ): `0 8px 24px -8px rgba(28,25,23,.20)` ở chế độ sáng; `0 8px 24px -8px rgba(0,0,0,.70)` cộng viền ở chế độ tối.

### 6.5 Chuyển động

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--dur-1` | 100 ms | Nhấn: thẻ thu còn 0,98 lần, nút icon còn 0,94 lần |
| `--dur-2` | 180 ms | Công tắc, chip |
| `--dur-3` | 280 ms | Bảng trượt, chuyển trang, thẻ xuất hiện |
| `--dur-4` | 420 ms | Thẻ bay đi khi vuốt, nét bút đỏ (`stroke-dashoffset`: kỹ thuật làm nét SVG "tự vẽ ra") |
| `--ease-standard` | `cubic-bezier(.2,0,0,1)` | Mặc định |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` | Thứ đang rời đi |
| `--ease-spring` | `cubic-bezier(.175,.885,.32,1.275)` | Chỉ cho thẻ vuốt bật lại chỗ cũ |

(`ease` là đường cong tốc độ: nhanh hay chậm ở đầu và cuối chuyển động.)

- Thẻ ở Trang chủ trượt lên 8 px và hiện dần, cách nhau 40 ms, tối đa 5 thẻ, và chỉ một lần.
- **Bỏ** hiệu ứng "thở" phát sáng của nút ＋. Không hoạt ảnh trang trí nào chạy lặp mãi. Hai ngoại lệ chỉ chạy lúc chờ tải: nhịp sáng tối của khung xương (mục 6.7) và vòng xoay của màn chờ khởi động (mục 5).
- **Khi máy bật "giảm chuyển động"** (`prefers-reduced-motion`):
  - chỉ còn hiệu ứng mờ dần với thời lượng từ 100 ms trở xuống;
  - thẻ cũ mờ dần và thẻ mới hiện dần thay vì bay đi, còn lúc kéo vẫn bám theo ngón tay;
  - nét bút đỏ hiện ngay tức thì;
  - bản đồ dùng `jumpTo` (nhảy thẳng tới nơi) thay cho `flyTo` (bay tới);
  - lúc khởi động gọi `setupIonicReact({ mode:'ios', animated: !matchMedia('(prefers-reduced-motion: reduce)').matches })` để tắt hoạt ảnh của Ionic.

### 6.6 Biểu tượng

Dùng Ionicons (bộ icon của Ionic), kiểu nét viền (outline). Kiểu đặc (filled) chỉ dùng cho trạng thái "bật". Cỡ: 24 px mặc định, 20 px trong nút và chip, 16 px chèn trong dòng chữ.

**Mỗi icon chỉ có đúng một nghĩa:**

| Icon | Nghĩa | Icon | Nghĩa |
|---|---|---|---|
| `heart` | Yêu thích | `star` | Đánh giá (số sao) |
| `flame` | Độ hot / Hot (+1) | `close` | Bỏ qua (−1) |
| `flag` | Trạng thái "Hứng thú" | `ellipse-outline` | Trạng thái "Chưa đi" |
| `checkmark-circle` | Trạng thái "Đã đi" | `arrow-undo` | Hoàn tác |
| `information-circle` | Thông tin | `search` | Tìm |
| `layers` | Vuốt | `shuffle` | Bốc thăm |
| `locate` | Gần tôi | `navigate` | Chỉ đường |
| `add` | Thêm | `create` | Sửa |
| `trash` | Xoá | `cloud-offline` | Offline |
| `time` | Giờ | `cash` | Giá |
| `location` | Địa chỉ | `calendar` | Lần đi |
| `pricetag` | Nhãn | `options` | Lọc |
| `ellipsis-horizontal` | Menu thêm (⋯) | `refresh` | Đổi quán khác |

### 6.7 Cách xử lý ảnh

- **Hình dạng:**
  - ảnh chính (hero) tỉ lệ 4:3 (16:10 trên máy tính, cao tối đa 480 px);
  - ảnh của "Hôm nay thử quán này" và của bảng thông tin tỉ lệ 16:10;
  - ảnh ở Vuốt tỉ lệ 4:5, đổi sang 1:1 khi chiều cao màn hình dưới 740 px và 4:3 khi dưới 640 px;
  - lưới và ảnh thu nhỏ hình vuông.
- **Cách lấp đầy:** `object-fit: cover` (ảnh phủ kín khung, phần thừa bị cắt), góc md, một viền photo-edge 1 px vẽ bằng `::after` (lớp vẽ phụ gắn vào phần tử). Không bộ lọc, không dải chuyển màu.
- **Không đặt chữ đè lên ảnh**, trừ khi chữ nằm trong nhãn bo tròn nền đặc surface độ đục 92%.
- **Quán chưa có ảnh:** một ô surface-2 có chữ cái đầu của tên, phông Newsreader, màu text-muted ("Ố" cho "Ốc Đào").
- **Đang tải:** nhịp sáng tối chậm (đứng yên khi bật giảm chuyển động).
- **Lỗi:** nút "Tải lại ảnh".
- **Trình xem ảnh:** nền `#0C0A09`, ảnh dùng `contain` (hiện trọn ảnh, không cắt).

### 6.8 Nút đăng nhập Google

Làm theo hướng dẫn thương hiệu của Google. `[KIỂM TRA]` đọc lại trang hướng dẫn hiện hành của Google trước khi nộp hồ sơ thương hiệu.

- Hình viên thuốc (pill), cao **44 px**, rộng 240–400 px, không rộng hơn 400 px.
- Chữ "G" nhiều màu chính thức của Google (SVG), giữ nguyên không sửa, cỡ 20 px. Đệm trái 12 px, khoảng cách tới chữ 10 px, đệm phải 12 px.
- Nhãn **"Tiếp tục với Google"**, Roboto Medium 14/20 (tập con đã đóng gói ở mục 6.2).
- **Sáng:** nền `#FFFFFF`, viền 1 px `#747775`, chữ `#1F1F1F`.
- **Tối:** nền `#131314`, viền 1 px `#8E918F`, chữ `#E3E3E3`.
- Vòng tiêu điểm: dùng token focus chuẩn, cách nút 2 px.
- Không đổi màu, không thêm icon, không đổi chữ trên nút. Dòng chữ báo đang tải hiện **bên dưới** nút.

### 6.9 Ánh xạ sang Ionic (`web/src/theme/tokens.css`)

`scripts/gen-tokens.mjs` sinh file này từ một nguồn JSON; trang công khai tĩnh dùng đúng file đó, nên app và trang giới thiệu luôn cùng một bảng màu.

- **Xoá và viết lại:** xoá `web/src/theme/variables.css` (thay bằng `tokens.css`); viết lại `fonts.css` theo quy tắc `@font-face` ở 6.2; xoá dòng import `@ionic/react/css/palettes/dark.system.css` (file này đè lên bảng màu đã thiết kế nên chế độ tối hiện đen tuyền, xem mục 1), file `themes.css`, mọi lớp `.wtg-theme-*` và prop `theme` của PlaceInfoSheet.
- **Không dùng** `light-dark()` (hàm CSS chọn màu theo sáng/tối, cần iOS 17.5) hay `color-mix()` (hàm CSS pha màu, hỏng trên iOS 16.0–16.1). Các màu bậc (step) viết thẳng thành giá trị cụ thể.
- `color-scheme: light dark` báo cho trình duyệt biết trang hỗ trợ cả hai chế độ, để thanh cuộn và ô nhập mặc định của hệ thống cũng đổi theo.

```css
:root, :root.ios {                      /* sáng */
  color-scheme: light dark;
  --wtg-bg:#F5F2E9; --wtg-surface:#FBF9F4; /* …mọi token ở mục 6.1… */
  --ion-font-family:'Be Vietnam Pro', system-ui, sans-serif;
  --ion-background-color:#F5F2E9; --ion-background-color-rgb:245,242,233;
  --ion-text-color:#1C1917;       --ion-text-color-rgb:28,25,23;
  --ion-toolbar-background:#F5F2E9; --ion-toolbar-color:#1C1917; --ion-toolbar-border-color:#E2DBCC;
  --ion-item-background:#FBF9F4; --ion-card-background:#FBF9F4; --ion-overlay-background-color:#FBF9F4;
  --ion-border-color:#E2DBCC; --ion-placeholder-color:#5C554B;
  --ion-backdrop-color:#1C1917; --ion-backdrop-opacity:.45;
  --ion-color-primary:#A8482A; --ion-color-primary-rgb:168,72,42;
  --ion-color-primary-contrast:#FFFFFF; --ion-color-primary-contrast-rgb:255,255,255;
  --ion-color-primary-shade:#8F3D23; --ion-color-primary-tint:#B15A3F;
  --ion-color-medium:#5C554B; --ion-color-medium-rgb:92,85,75; --ion-color-medium-contrast:#FFFFFF;
  --ion-color-light:#EDE8DC; --ion-color-light-rgb:237,232,220; --ion-color-light-contrast:#1C1917;
  --ion-color-success:#2D6E45; --ion-color-success-rgb:45,110,69;   /* + contrast #FFF, shade/tint */
  --ion-color-warning:#8A5600; --ion-color-warning-rgb:138,86,0;
  --ion-color-danger:#B3261E;  --ion-color-danger-rgb:179,38,30;
  /* --ion-background-color-step-N và --ion-text-color-step-N: giá trị cụ thể ở bảng bên dưới */
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]), :root.ios:not([data-theme="light"]) { /* khối tối */ }
}
:root[data-theme="dark"], :root.ios[data-theme="dark"] { /* cùng khối tối như trên */ color-scheme: dark; }
:root[data-theme="light"] { color-scheme: light; }
/* Điểm chính của khối tối: primary #E58A66 (rgb 229,138,102), contrast #1C1210 (28,18,16),
   shade #CF7652, tint #E89675; medium #B3AB9C; light #2A2723; success #86CB9A; warning #E9B65E;
   danger #F49283; backdrop #000 độ đục .60; bg rgb 20,19,17; text rgb 242,237,227. */
ion-back-button { --min-height:44px; --min-width:44px; }
ion-segment-button { min-height:44px; }
ion-title { line-height:1.65; }
```

**Màu bậc (step).** Ionic dùng 19 màu bậc, đánh số 50, 100, … 950, để tô các lớp nền và chữ nhạt dần. Bậc N của nền là bg pha về phía text theo tỉ lệ N/1000. Các bậc của chữ dùng cùng giá trị nhưng theo thứ tự ngược lại (bậc 50 của chữ bằng bậc 950 của nền).

| Bậc | Sáng | Tối | Bậc | Sáng | Tối |
|---|---|---|---|---|---|
| 50 | `EAE7DE` | `1F1E1C` | 550 | `7E7B75` | `8E8B84` |
| 100 | `DFDCD4` | `2A2926` | 600 | `73706B` | `99968F` |
| 150 | `D4D1CA` | `353430` | 650 | `686560` | `A4A19A` |
| 200 | `CAC7BF` | `403F3B` | 700 | `5D5A56` | `AFACA4` |
| 250 | `BFBCB4` | `4C4A46` | 750 | `524F4C` | `BAB6AE` |
| 300 | `B4B1AA` | `575450` | 800 | `474441` | `C6C1B9` |
| 350 | `A9A6A0` | `625F5A` | 850 | `3D3A36` | `D1CCC4` |
| 400 | `9E9B95` | `6D6A65` | 900 | `322F2C` | `DCD7CE` |
| 450 | `93908A` | `787570` | 950 | `272422` | `E7E2D8` |
| 500 | `888680` | `83807A` | | | |

**Công tắc Sáng / Tối (V9).** Người dùng chọn Theo máy, Sáng hoặc Tối ở trang Tài khoản.
- Một đoạn script nhỏ nằm trong `<head>`, chạy trước CSS (để trang không nháy sai màu lúc mở), đọc `localStorage['wtg.theme']` (bộ nhớ nhỏ lưu trong trình duyệt) bên trong `try/catch` (đọc lỗi cũng không làm hỏng trang).
- Script đặt thuộc tính `data-theme` lên `<html>` và thay hai thẻ `theme-color` bằng một thẻ khớp với chế độ đã chọn.
- Chọn "Theo máy" thì bỏ thuộc tính `data-theme` và khôi phục hai thẻ `theme-color` theo điều kiện media (sáng / tối của máy).

---

## 7. Linh kiện

Mỗi dòng dưới đây là bản đặc tả để dựng một linh kiện dùng chung. Chữ trong ngoặc kép là câu chữ chốt, chép nguyên văn khi làm. Kích thước ở đây bằng px.

| Linh kiện | Đặc tả |
|---|---|
| **Header — đầu trang (`WtgPage`)** | Cao 56 px cộng vùng an toàn (safe area: phần màn hình mà tai thỏ hoặc thanh Home chiếm, nội dung phải tránh), màu nền bg; đường kẻ mảnh chỉ hiện sau khi cuộn. Bên trái: nút quay lại 44×44, `aria-label` (nhãn để trình đọc màn hình đọc lên) là "Quay lại"; Trang chủ hiện chữ "WhereToGo" (wordmark, Newsreader 22/30) thay cho nút này. Tiêu đề trong nội dung là h1. Tiêu đề trên toolbar (Be Vietnam Pro 600 cỡ 17/24) chỉ hiện dần khi h1 đã trôi khỏi màn hình (dùng IntersectionObserver, công cụ của trình duyệt báo một phần tử còn trong tầm nhìn hay không), nhờ vậy tên không bao giờ hiện hai lần. Trang tiện ích không có h1 (Tìm kiếm, các trang con của Tài khoản) hiện tiêu đề toolbar ngay từ đầu. Bên phải: tối đa 2 nút icon 44 px cộng menu ⋯ |
| **Dock (chỉ ở Trang chủ)** | Dính đáy màn hình, cao 64 px cộng vùng an toàn, nền surface độ đục 96%, đường kẻ mảnh phía trên, độ nổi e2. Lưới `1fr 1fr 64px 1fr 1fr`, đệm hai bên 8 px. Mỗi ô tối thiểu 64×56: icon 24 px đặt trên nhãn micro màu text-muted; nhãn nhìn thấy cũng là tên mà trình đọc màn hình đọc. ＋ là vòng tròn accent 56 px, nhô lên 12 px, nhãn "Thêm". Độ rộng nhãn đã đo ở 12/600: Tìm 22,4 · Yêu thích 56,1 · Thêm 33,4 · Vuốt 28,8 · Bốc thăm 57,6 px; mỗi ô rộng tối thiểu 70 px ở màn hình rộng 360 px. Khi offline: ＋ chuyển sang nền surface-2 với icon text-muted và vẫn giữ nhãn; bấm vào thì hiện toast "Đang offline — cần mạng để thêm địa điểm." Ẩn từ 1024 px trở lên |
| **Cột bên (sidebar)** | Rộng 248 px, có đường kẻ mảnh bên phải. Hàng cao 44 px: icon 20 px cộng nhãn 15/600. Trang hiện tại: nền accent-soft, chữ accent-text và `aria-current="page"` (báo cho trình đọc màn hình đây là trang đang mở). Hàng nhóm hiện "Quán ăn 12", số quán màu muted |
| **Hàng địa điểm (danh sách)** | Cao tối thiểu 80 px, đệm 12×16, ảnh vuông 64 px góc sm. Dòng 1: tên (17/22, một dòng). Dòng 2: chú thích "Quán ăn · 50.000–90.000 ₫ · 1,2 km". Dòng 3: chip trạng thái, sao màu mực (14 px), và trái tim đặc nếu là Yêu thích (chỉ để hiển thị). Cả hàng là vùng bấm. Danh sách hiện 50 hàng mỗi lượt bằng `IonInfiniteScroll` (cuộn tới đâu nạp thêm tới đó); danh sách dài dùng `content-visibility:auto` (trình duyệt bỏ qua việc vẽ các hàng nằm ngoài màn hình) |
| **Thẻ địa điểm (lưới)** | Cố định 2 cột dưới 600 px (khoảng cách 12 px), 3 cột từ 600 px, 4 cột từ 1024 px. Ảnh vuông góc md, kèm nhãn bo tròn trạng thái tuỳ chọn (nền đặc surface 92%). Tên 17/22, tối đa 2 dòng, có đệm cho phần dấu bị cắt (mục 6.3). Chú thích là giá, một dòng. Trái tim (nếu là Yêu thích) nằm trong vòng tròn surface 28 px ở góc trên bên phải của ảnh |
| **Thẻ nhóm (Trang chủ)** | Nền surface, góc lg, viền, độ nổi e1, đệm 16 px. Dòng 1: icon nhóm trong vòng tròn surface-2 32 px, rồi nhãn "Quán ăn · 12 quán" (label 14/600, màu muted). Dòng 2: câu hỏi của nhóm "Chán cơm thì ăn gì?" bằng kiểu h2. Dòng 3: dải ảnh gồm 3 ảnh vuông cộng ô "+N" (Newsreader 22 trên nền surface-2), khe 2 px, góc sm. N là số quán của nhóm mà 3 ảnh không thể hiện hết; bỏ ô này khi N bằng 0. Nhóm trống: một dải surface-2 cao 72 px với chữ "Chưa có địa điểm · Thêm vào Quán ăn" (accent-text). Hai cột từ 768 px |
| **Chip** | Dùng phần tử `<button>` thường, không dùng IonChip, để tránh lớp màu pha trong suốt (alpha tint) mà Ionic tự thêm.<br>**Chip lọc:** cao 36 px nhìn thấy, vùng bấm 44 px (`::before` mở rộng ra 4 px mỗi phía), bo tròn hẳn, nhãn 14/20. Tắt: nền surface-2 với viền border-strong. Bật: nền accent-soft, viền accent, chữ accent-text và dấu tích ✓ 16 px, nên trạng thái không bao giờ chỉ thể hiện bằng màu. Chip mở bộ chọn thì kết thúc bằng `chevron-down` và hiện giá trị đang chọn: "Giá: 50.000–150.000 ₫".<br>**Chip hiển thị:** cao 28 px, chữ micro; chip nhóm dùng accent-soft, chip nhãn dùng surface-2 với chữ text-muted. Ở trang Chi tiết chúng là link (vùng bấm 44 px).<br>**Chip trạng thái:** Hứng thú (icon `flag`, accent-soft / accent-text), Chưa đi (`ellipse-outline`, surface-2 / muted), Đã đi (`checkmark-circle`, success-bg / success) |
| **Nút** | Cao 48 px (44 px bản gọn), góc md, chữ kiểu nút, icon 20 px đứng trước chữ. **Mỗi màn hình chỉ một nút chính.** Chính: nền accent, chữ on-accent. Phụ: nền surface, viền 1 px border-strong, chữ màu text. Ghost: chữ accent-text. Xoá: lúc đầu chỉ là chữ danger; chỉ nút xác nhận cuối cùng mới tô đặc danger với chữ on-danger. Bị khoá: nền surface-2, chữ text-muted, kèm một dòng chú thích bên dưới nói vì sao |
| **Ô nhập (`.wtg-field`)** | Nhãn nằm trên (kiểu label). Ô bắt buộc ghi "(bắt buộc)" ngay trong nhãn, không dùng dấu `*`. Ô cao 48 px, nền surface, viền 1 px border-strong, góc md, chữ body. Chữ hướng dẫn bên dưới kiểu caption màu muted. Khi chọn vào: viền accent cộng vòng tiêu điểm. Khi lỗi: viền danger, icon `alert-circle` và dòng caption màu danger. Dựng bằng `IonInput labelPlacement="stacked"` đặt trong lớp bọc này. Ô tìm kiếm dùng cùng kiểu, kèm icon tìm, không dùng IonSearchbar (ô nhập của nó chỉ cao 36 px) |
| **Bảng trượt (`WtgSheet`)** | Bọc IonModal.<br>**Điện thoại:** `breakpoints [0, .6, 1]` (các mức dừng khi kéo bảng lên), `initialBreakpoint .6` (P17 của PLAN-UI-1), góc trên xl, tay nắm 36×5 màu border-strong, phần đầu có h2 và nút đóng 44 px nhãn "Đóng".<br>**Từ 768 px:** một đoạn code (hook) dùng `matchMedia` để theo dõi chiều rộng màn hình; nó bỏ các breakpoint và thêm lớp `wtg-dialog` (`--width:520px; --height:auto; --max-height:min(720px,90vh); --border-radius:24px`) để bảng thành hộp thoại. Chân bảng có tối đa 2 nút |
| **Trạng thái trống** | Căn giữa, rộng tối đa 320 px. Vòng tròn surface-2 72 px chứa icon 32 px, tiêu đề h2, một câu body-sm màu muted (nói thiếu gì và vì sao nên thêm), một nút chính, và tuỳ chọn một nút ghost |
| **Toast** | IonToast đặt ở đáy, `positionAnchor` neo vào dock, thanh dính (sticky bar) hoặc hàng nút của trang Vuốt, để toast nằm ngay phía trên chúng. Màu inverse, rộng tối đa 480 px, `aria-live="polite"` (trình đọc màn hình đọc nhẹ nhàng, không ngắt lời). Hiện 3 giây, hoặc 5 giây nếu có nút; tối đa một nút, màu inverse-action. Toast ở trang Vuốt cũng chuyển xuống đáy (thay vị trí phía trên của P11 trong PLAN-UI-1) |
| **Banner** | Nằm trong nội dung, rộng hết chiều ngang, góc md, gồm icon, chữ và nút tuỳ chọn. Không dùng viền màu nhấn bên trái. Offline (nền surface-2): "Đang offline — chỉ xem được." Drive (nền warning-bg): "Chưa lưu được ảnh vào Google Drive." [Cấp lại quyền]. Bản mới: "Có bản mới." [Tải lại]. Hạn mức (nền warning-bg): "Bạn đã lưu 950/1.000 địa điểm." |
| **Nét bút đỏ (`RedPen`)** | SVG nhúng trực tiếp (inline), hai kiểu: `circle` (một vòng khoanh không hoàn hảo quanh một chữ số hoặc con dấu) và `underline` (một nét gạch chân). Nét accent dày 2,5 px, đầu nét tròn, vẽ ra trong `--dur-4`. Chỉ dùng ở nhãn "Hôm nay thử quán này" (gạch chân), con dấu khi vuốt (khoanh tròn) và nút "Chốt quán này" (khoanh tròn). Không bao giờ dùng làm hoạ tiết nền |
| **Ghim bản đồ** | Nguồn GeoJSON của MapLibre với `cluster:true` (gom các ghim gần nhau thành cụm), vẽ bằng lớp hình tròn (circle layer), không dùng marker DOM, không dùng nhãn chữ trên bản đồ (glyph labels). Ghim: vòng tròn accent 20 px có vòng surface dày 2 px. Ghim đang chọn: 28 px, vòng surface dày 3 px, thêm một vòng ngoài dày 2 px màu text, nên việc chọn thể hiện bằng kích cỡ và vòng chứ không bằng màu. Cụm: vòng tròn surface 32–44 px, viền accent và số lượng. Vị trí người dùng: vòng rỗng 16 px (nền surface, viền focus dày 4 px) kèm quầng sai số 15%, không nhấp nháy. Vòng bán kính: đường accent 1,5 px, tô 6%. Chạm vào ghim dùng `queryRenderedFeatures` (hỏi bản đồ có ghim nào dưới ngón tay) trên một hộp 44 px. Dòng "© OpenFreeMap © OpenStreetMap" luôn hiện |
| **Thanh bước onboarding** | Nằm đầu các màn onboarding: "Bước 2/4" (caption muted) phía trên một thanh 4 đoạn (cao 4 px, khe 4 px; đoạn xong là accent, đoạn chưa làm là border-strong). Được phép quay lại (nút 44 px) trừ bước 1. Bước 2 nếu bị bỏ qua vẫn tính là đã xong |
| **Bảng thông tin** | Ảnh 16:10 · nhãn nhóm · tên (24/32) · "50.000–90.000 ₫ · cách bạn 1,2 km" · trạng thái mở cửa · câu chuyện cắt còn 3 dòng · nút tim bật/tắt ở phần đầu (chỉ khi có mạng) · chân bảng: [Chỉ đường] là nút chính và [Xem đầy đủ] là nút phụ |

---

## 8. Trang giới thiệu (landing page)

Trang giới thiệu (địa chỉ `/`) là trang đầu tiên mà người lạ và cả Google nhìn thấy. Trang phải nói rõ app làm gì, vì Google từ chối xác minh thương hiệu (mục 11.4) nếu trang chủ website chỉ là một trang đăng nhập. Đây là HTML tĩnh: trang viết sẵn, nội dung hiện ra mà không cần chạy JavaScript, và nằm ngoài app.

### 8.1 Phần đầu mã trang (`<head>`) và thông tin khi chia sẻ link

- Thuộc tính `lang="vi"`.
- `<title>`: WhereToGo — Sổ tay những nơi bạn muốn đến.
- Meta description (đoạn mô tả hiện dưới tiêu đề trên kết quả tìm kiếm): "Lưu quán ăn, quán uống, chỗ chơi và điểm du lịch bạn muốn đến, kèm ảnh, giá, giờ mở cửa và câu chuyện của riêng bạn."
- `og:image` (ảnh xem trước khi chia sẻ link): 1200×630, là ảnh chụp Trang chủ trên nền kem cùng chữ WhereToGo.
- Chữ "WhereToGo" phải hiện thành chữ nhìn thấy được trên trang, khớp chính xác với tên trên màn hình xin quyền của Google.

### 8.2 Chín khối nội dung

**1. Đầu trang (header)**
- Logo và chữ "WhereToGo".
- Trên máy tính có các link: Cách dùng · Quyền riêng tư · Câu hỏi.
- Nút ghost **[Đăng nhập]** → `/app/#/login`.

**2. Phần mở đầu (hero).** Máy tính chia hai cột: chữ bên trái, hai ảnh chụp màn hình điện thoại bên phải.
- Dòng nhỏ phía trên tiêu đề: "Sổ tay địa điểm — miễn phí, không quảng cáo"
- **H1:** "Mọi quán muốn đến, gói gọn trong một cuốn sổ."
- Dòng phụ: "WhereToGo giúp bạn lưu quán ăn, quán uống, chỗ chơi và điểm du lịch — kèm ảnh, giá, giờ mở cửa và câu chuyện của riêng bạn. Đến lúc phân vân “đi đâu giờ?”, vuốt vài thẻ là có chỗ."
- **[Bắt đầu lưu quán]** (nút chính) → `/app/#/login` · [Xem cách dùng] (nút ghost) → `#cach-dung`
- Dòng nhỏ: "Đăng nhập bằng tài khoản Google. Ảnh nằm trong Google Drive của chính bạn."
- Ảnh chụp màn hình: Trang chủ và Chi tiết, mỗi ảnh có bản sáng và bản tối đặt trong `<picture>` (thẻ HTML cho phép chọn ảnh theo chế độ sáng/tối của máy). Chú thích: "Dữ liệu minh hoạ".

**3. Cách dùng** (`id="cach-dung"`), đánh số 1–3 bằng phông Newsreader:
1. **Dán link Google Maps** — "Tên và vị trí tự điền. Thêm ảnh, khoảng giá, giờ mở cửa nếu muốn."
2. **Xếp vào nhóm** — "Quán ăn, Quán uống, Chỗ chơi, Du lịch hay nhóm của riêng bạn. Gắn nhãn như “Hẹn hò” để tìm lại nhanh."
3. **Để app chọn giúp** — "Vuốt thẻ, bốc thăm 3 quán, hoặc xem quanh đây có gì."

**4. Tính năng:** 6 thẻ, lưới 3×2 trên máy tính và 1 cột trên điện thoại; mỗi thẻ có icon, tiêu đề và một dòng chữ.
- Hôm nay thử quán này — "Mỗi lần mở app, một gợi ý từ chính danh sách của bạn."
- Vuốt chọn quán — "Vuốt phải để quán “hot” lên, vuốt trái để bỏ qua."
- Bốc thăm — "Chọn một nhóm, app bốc tối đa 3 nơi. Không ưng thì bốc lại."
- Gần tôi — "Xem quán đã lưu trong bán kính 1–10 km quanh bạn."
- Câu chuyện & lần đi — "Ghi lại kỷ niệm, ngày đã đến, món nên gọi."
- Giá & giờ mở cửa — "Ghi khoảng giá theo ₫; app báo quán đang mở hay đã đóng."

**5. Quyền riêng tư** (`id="quyen-rieng-tu"`, khối nền surface-2)
- **H2:** "Ảnh của bạn nằm trong Google Drive của chính bạn."
- Các gạch đầu dòng:
  - "Ảnh được tải thẳng lên thư mục “WhereToGo Photos” trong Drive của bạn. WhereToGo chỉ xin quyền Google Drive hẹp nhất (drive.file): app chỉ thấy các tệp do chính app tạo, không đọc được tệp nào khác."
  - "Từ Google, app chỉ nhận tên, email, ảnh đại diện (để đăng nhập) và quyền drive.file (để lưu ảnh, và bản sao lưu hằng tuần nếu bạn bật)."
  - "Thông tin địa điểm lưu trên máy chủ Supabase tại Singapore; trong app chỉ tài khoản của bạn xem được. Người vận hành chỉ truy cập kỹ thuật khi cần sửa lỗi hoặc sao lưu."
  - "Vị trí hiện tại chỉ dùng trên máy để tính khoảng cách; chỉ được lưu khi bạn bấm “Dùng vị trí hiện tại” lúc thêm quán. Bản đồ tải từ OpenFreeMap — họ thấy địa chỉ IP và khu vực bạn đang xem."
  - "Không quảng cáo, không bán dữ liệu, không công cụ theo dõi. Tải dữ liệu về, ngắt kết nối Drive hoặc xoá tài khoản ngay trong app."
- Link: [Đọc Chính sách quyền riêng tư →]
- Câu **Limited Use** (Sử dụng giới hạn: điều kiện Google đặt ra cho app dùng dữ liệu người dùng Google; chưa xác nhận được điều kiện này áp dụng cho quyền không nhạy cảm như `drive.file`, nhưng câu này không tốn gì nên vẫn đưa vào `[KIỂM TRA]`) viết cỡ caption, và lặp lại trong trang Chính sách quyền riêng tư:
  - "Việc WhereToGo sử dụng và chuyển cho ứng dụng khác thông tin nhận được từ API của Google tuân thủ Chính sách dữ liệu người dùng của Dịch vụ API Google, bao gồm các yêu cầu về Sử dụng giới hạn."
  - Kế đó là câu tiếng Anh của Google, gắn link tới chính sách của Google: "WhereToGo's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements."

**6. Cài lên màn hình chính**
- **H2:** "Dùng như một app — không cần App Store hay CH Play."
- iPhone (iOS 26): "Mở [TÊN MIỀN]/app bằng Safari → nút ba chấm → Chia sẻ → Thêm vào MH chính → giữ bật “Mở dưới dạng ứng dụng web” → Thêm." `[KIỂM TRA NHÃN iOS 26]`
- iPhone iOS 16.4–18: "Mở [TÊN MIỀN]/app bằng Safari → nút Chia sẻ → Thêm vào MH chính → Thêm." `[KIỂM TRA]`
- Android: "Mở bằng Chrome → nút ba chấm → Cài đặt ứng dụng."
- "Sau khi cài, mở WhereToGo từ màn hình chính và đăng nhập lại một lần."
- [Hướng dẫn chi tiết →] → `/cai-ung-dung/`. **Trang này không có nút cài** (V33).

**7. Câu hỏi thường gặp** (mỗi câu là một khối `<details>`: bấm vào thì mở ra, bấm lại thì đóng):
- **WhereToGo có mất phí không?** "Không. Đây là dự án cá nhân phi thương mại của [TÊN NGƯỜI VẬN HÀNH], không quảng cáo. Dịch vụ không cam kết chạy mãi; nếu ngừng, bạn sẽ được báo trước [SỐ NGÀY] ngày để tải dữ liệu về."
- **Có cần App Store hay CH Play không?** "Không. Mở bằng trình duyệt, rồi thêm vào màn hình chính nếu muốn dùng như app."
- **Vì sao Google hỏi quyền Google Drive?** "Để lưu ảnh (và bản sao lưu nếu bạn bật) vào Drive của chính bạn. Không cho phép vẫn dùng được, chỉ chưa thêm được ảnh."
- **Màn hình Google ghi “[MÃ DỰ ÁN].supabase.co” là gì?** "Đó là máy chủ đăng nhập mà WhereToGo dùng. Tên này hiện ra vì WhereToGo chưa đăng ký thương hiệu với Google."
- **Không có mạng thì sao?** "Bạn vẫn xem được những gì đã mở gần đây. Thêm, sửa và vuốt thẻ cần có mạng."
- **Mở link từ Zalo hay Messenger mà không đăng nhập được?** "Google chặn đăng nhập trong trình duyệt của ứng dụng chat. Bấm nút ba chấm và chọn mở bằng Safari hoặc Chrome."
- **Ai xem được danh sách của tôi?** "Trong app chỉ bạn. Người vận hành chỉ truy cập kỹ thuật khi cần sửa lỗi hoặc sao lưu, như ghi trong Chính sách quyền riêng tư."
- **Chia sẻ kho với bạn bè được không?** "Chưa. Mỗi kho là riêng của một người."
- **Xoá tài khoản thế nào?** "Tài khoản → Quyền riêng tư & dữ liệu → Xoá tài khoản. Dữ liệu của bạn trên máy chủ bị xoá ngay (nhật ký kỹ thuật của Vercel và GitHub tự hết hạn theo chính sách của họ, như ghi trong Chính sách quyền riêng tư); ảnh trong Drive giữ hay xoá do bạn chọn."

**8. Lời kêu gọi cuối trang (call to action):** "Bắt đầu cuốn sổ của bạn" [Bắt đầu lưu quán]

**9. Chân trang (footer)**
- "WhereToGo — dự án cá nhân của [TÊN NGƯỜI VẬN HÀNH], Việt Nam."
- Chính sách quyền riêng tư · Điều khoản sử dụng · Trợ giúp · Cài ứng dụng · Mã nguồn [LINK GITHUB] · [EMAIL HỖ TRỢ] · © 2026.
- Không có lời chứng thực của người dùng và không có số người dùng.

### 8.3 Các trạng thái của trang

- **Đã đăng nhập** (trong localStorage có mục `sb-[MÃ DỰ ÁN]-auth-token`; cùng tên miền với app): cả hai nút đều đổi thành "Mở WhereToGo" → `/app/#/home`.
- **`?da-xoa=1`:** hiện banner trên cùng: "Tài khoản của bạn đã được xoá. Cảm ơn bạn đã dùng WhereToGo."
- **Mở dưới dạng app đã cài:** gọi `location.replace('/app/#/home')` để bỏ qua trang này.

### 8.4 Cách làm kỹ thuật

- **HTML tĩnh, không phải một route của SPA** (SPA: app một trang, nội dung do JavaScript dựng ra), vì bộ đọc trang (crawler) của Google phải thấy được nội dung mà không cần chạy JavaScript.
- **Cấu trúc nguồn:** thư mục `web/site/` chứa `index.html`, các trang pháp lý và trợ giúp, `site.css`, `inapp.js` (khoảng 2 KB, lớp chặn trình duyệt chat, V32) và `landing.js` (khoảng 1 KB).
- **Cách build:**
  - chạy `vite build` với `base:'/app/'` và `outDir:'dist/app'`;
  - rồi `scripts/build-site.mjs` chép các file của trang tĩnh, `tokens.css` và các file phông vào thư mục gốc của `dist/`, và thêm file `CNAME` (file báo cho GitHub Pages biết đang dùng tên miền riêng).
- **Ngân sách dung lượng:** HTML + CSS + JS tối đa 40 KB truyền qua mạng. Phông dùng chung và được lưu đệm (145 KB). Ảnh chụp màn hình tối đa 300 KB tổng cộng (AVIF hoặc WebP, hai định dạng ảnh nhẹ, kèm `srcset` để gửi ảnh vừa cỡ màn hình; chỉ tải khi cuộn tới nếu nằm dưới màn hình đầu).
- **Cài đặt PWA** (service worker là phần mềm nền của trình duyệt giúp app chạy offline; Workbox là thư viện tạo ra nó):
  - manifest `id:'/app/'`, `scope:'/app/'`, `start_url:'/app/#/home'`;
  - Workbox `navigateFallback:'/app/index.html'` và `navigateFallbackAllowlist:[/^\/app\//]`, để các trang tĩnh không bao giờ bị app tiếp quản;
  - `globIgnores:['**/maplibre*.js','**/screenshots/**']` (loại các file này khỏi danh sách lưu sẵn khi cài);
  - MapLibre đi vào bộ nhớ đệm lúc chạy kiểu `CacheFirst` (lấy từ đệm trước); ô bản đồ (tile) dùng `NetworkOnly` (luôn tải từ mạng, không lưu);
  - `check:size` bổ sung **ngân sách tổng 2,5 MB cho phần lưu sẵn khi cài**, bên cạnh giới hạn 2 MiB cho mỗi file đã có.

### 8.5 Thứ tự chuyển sang tên miền riêng

Phải làm đúng thứ tự này. Nếu đặt tên miền trước, GitHub chuyển hướng địa chỉ cũ bằng mã 301 (chuyển hướng vĩnh viễn) và các bản app đã cài sẽ không bao giờ cập nhật được nữa (xem bảng lỗi ở mục 2).

1. Phát hành một bản "WhereToGo đã chuyển nhà" trên địa chỉ cũ (một banner cộng service worker có `selfDestroying: true`, tức là tự gỡ chính nó). Rồi bạn mở một lần các bản app đã cài của mình để chúng nhận bản này.
2. `[USER]` Đặt tên miền: thêm file `CNAME` vào bản build và tạo bản ghi DNS (bảng chỉ đường của tên miền) ở nơi bạn mua tên miền. Từ lúc này GitHub chuyển hướng 301 các địa chỉ cũ.
3. `[USER]` Supabase: đặt Site URL (địa chỉ gốc của app) và các URL chuyển hướng sau đăng nhập ở dạng **chính xác** (`https://[TÊN MIỀN]/app/`); xoá các dòng tunnel và localhost khỏi môi trường chạy thật.
4. `[USER]` Google: cập nhật JavaScript origins (các nguồn được phép gọi đăng nhập), authorized domain (tên miền được uỷ quyền), và các URL trang chủ website, quyền riêng tư, điều khoản (URL quyền riêng tư là `/quyen-rieng-tu/`).
5. `[USER]` Máy chủ (Vercel → Environment Variables): đặt `ALLOWED_ORIGINS` (danh sách địa chỉ được phép gọi máy chủ) và làm cho quy tắc regex của tunnel không bao giờ khớp trên môi trường chạy thật.
6. `[USER]` Search Console (công cụ của Google để chứng minh bạn sở hữu tên miền): thêm một thuộc tính loại Domain, xác minh bằng bản ghi DNS.

### 8.6 Vì sao làm tên miền ngay bây giờ

Việc xác minh thương hiệu với Google về sau cần một tên miền riêng. Hiện chỉ có chủ app mới có bản cài cần chuyển, nên chuyển nhà bây giờ tốn ít công nhất.

---

## 9. Đăng nhập & bắt đầu

Mục này tả đường đi của người mới: trang đăng nhập, 4 bước làm quen (onboarding), màn hỏi lại khi chính sách đổi, và lớp chặn trình duyệt trong ứng dụng chat. Phần đồng ý được thiết kế theo cách đọc Luật 91 ở mục 11.5 (Luật đã giải thích ở mục 0; không phải tư vấn pháp lý, luật sư duyệt lại trước khi mở): mỗi mục đích một ô riêng, ô nào không chọn thì app không làm việc đó.

**Cách đọc.** Tên trong ngoặc vuông như [Đồng ý và tiếp tục] là nút thật trên màn hình. Kiểu nút: xem dòng "Nút" ở mục 7 (nút chính, nút phụ, nút ghost chỉ có chữ màu nhấn, nút xoá màu đỏ). Tên màu (`surface`, `surface-2`, `accent-text`…) ở mục 6.1; tên kiểu chữ (`display`, `body-sm`, `caption`…) ở mục 6.3. Dấu `[KIỂM TRA]` nghĩa là phải đối chiếu trên máy thật hoặc trên trang Google trước khi làm.

| Màn | Route | Hiện khi nào | Việc chính |
|---|---|---|---|
| Đăng nhập (9.1) | `#/login?next=` | Chưa đăng nhập | Tiếp tục với Google |
| Bước 1/4 — Đồng ý (9.2) | `#/welcome/1` | Đã đăng nhập, chưa có đồng ý hiện hành | Đồng ý từng mục đích |
| Bước 2/4 — Ảnh & Google Drive (9.3) | `#/welcome/2` | Chỉ khi đã tick ô 2 ở bước 1 | Cho phép lưu ảnh vào Drive |
| Bước 3/4 — Nhóm (9.4) | `#/welcome/3` | Bỏ qua nếu tài khoản đã có ít nhất 1 nhóm | Tạo các nhóm đầu tiên |
| Bước 4/4 — Nơi đầu tiên (9.4) | `#/welcome/4` | Bỏ qua nếu tài khoản đã có ít nhất 1 địa điểm | Dán link Google Maps |
| Đồng ý lại (9.5) | `#/welcome/policy` | Phiên bản đồng ý đã cũ | Đồng ý lại sau khi chính sách đổi |
| Lớp chặn trình duyệt chat (9.7) | Lớp phủ, không có URL | Mở bằng trình duyệt của Zalo, Messenger… | Sao chép link |

Đường đi của tài khoản mới: `#/login` → Google → bước 1 → (bước 2, nếu tick ô 2) → bước 3 → bước 4 → `#/places/new?link=…` đã điền sẵn → `#/places/:id` kèm bảng Cài app. Tài khoản đã đăng ký từ trước: đi tới `next` (trang bạn định vào trước đó, nếu có) hoặc `#/home`; nếu chính sách đã đổi thì qua `#/welcome/policy` trước.

### 9.1 Đăng nhập (`#/login`)

Một cột căn giữa, rộng 420 px, từ trên xuống:
1. Logo 72 px, rồi chữ "WhereToGo" kiểu `display` (Newsreader, cỡ lớn nhất), rồi dòng "Sổ tay những nơi bạn muốn đến" (`body-sm`, màu muted).
2. Cho tới khi Google xác minh thương hiệu cho app (V29), có một dòng chú thích nằm **phía trên** nút: "Màn hình Google sẽ ghi “tiếp tục tới [MÃ DỰ ÁN].supabase.co” — đó là máy chủ đăng nhập của WhereToGo."
3. Nút Google "Tiếp tục với Google" (kiểu nút ở mục 6.8). Chữ "Đang mở Google…" hiện **dưới** nút, không đổi chữ trên nút.
4. Lời công bố nằm dưới nút: "Google sẽ gửi cho WhereToGo tên, email và ảnh đại diện của bạn để tạo tài khoản; máy chủ đăng nhập ghi lại thời điểm và địa chỉ IP để bảo mật. Sau khi đăng nhập, app hỏi bạn đồng ý từng mục — gồm lưu ảnh vào Google Drive của bạn, sao lưu hằng tuần và khoá truy cập Drive đã mã hoá trên máy chủ. Nếu bạn không đồng ý, tài khoản bị xoá ngay."
5. Hàng link: Điều khoản sử dụng · Chính sách quyền riêng tư · WhereToGo là gì? (→ `/`).

**Không có dòng "bằng việc tiếp tục, bạn đồng ý".** Kiểu đồng ý ngầm đó (bấm tiếp tục là coi như đồng ý) trái với các ô tick ở bước 1; đồng ý chỉ được ghi nhận ở bước 1.

**Các trạng thái**

| Tình huống | Câu chữ |
|---|---|
| Vừa bấm nút Google | "Đang mở Google…" |
| Bạn huỷ ở màn hình Google | "Bạn đã huỷ đăng nhập. Thử lại khi sẵn sàng." |
| Lỗi mạng | "Không kết nối được. Kiểm tra mạng rồi thử lại." |
| Đang offline | "Cần có mạng để đăng nhập." |
| `signup_disabled` (lỗi do đợt thử chỉ mời; xem V2, Q4) | "WhereToGo đang mở thử cho một nhóm nhỏ. Gửi email tới [EMAIL HỖ TRỢ] để được mời." |
| Mọi lỗi khác | "Đăng nhập chưa thành công (mã lỗi: {code}). Thử lại hoặc gửi mã này tới [EMAIL HỖ TRỢ]." |

**Quy tắc đi kèm**
- `next` (trang bạn định vào trước khi bị đưa tới đăng nhập) được giữ trong `sessionStorage` (bộ nhớ tạm của tab trình duyệt) suốt lần đi sang Google và quay lại, để đăng nhập xong vào đúng trang đó thay vì bị đưa về Trang chủ.
- Người đã đăng nhập mà mở trang này thì được chuyển tới `next` hoặc `#/home`.
- Đăng nhập thường dùng `prompt=select_account` (cho chọn tài khoản Google, không bắt cấp lại quyền); chỉ xin các quyền cơ bản (V26).

### 9.2 Bước 1/4 — Đồng ý (`#/welcome/1`)

Đầu màn có thanh bước "Bước 1/4" (mục 7); ở bước 1 không có nút quay lại.

**Tiêu đề:** "Chào {tên}, trước khi bắt đầu" — `{tên}` lấy `given_name` (tên gọi) từ Google; không có thì dùng họ tên đầy đủ.

**Lời dẫn:** "Đồng ý cho từng việc. Ô nào không chọn, app không làm việc đó. Bạn rút lại được bất cứ lúc nào trong Tài khoản → Quyền riêng tư & dữ liệu."

**4 ô đồng ý — tất cả để trống lúc đầu.** Chữ "(bắt buộc)" hoặc "(không bắt buộc)" đứng đầu mỗi ô.

| Ô | Loại | Câu chữ |
|---|---|---|
| 1 | (bắt buộc) | "Lưu kho địa điểm của tôi trên máy chủ WhereToGo (Supabase, Singapore): tên, email, ảnh đại diện Google và những gì tôi nhập — tên quán, địa chỉ, vị trí quán, giá, giờ mở cửa, đánh giá, ghi chú, câu chuyện, lần đi, lượt vuốt và mục yêu thích." |
| 2 | (không bắt buộc) | "Lưu ảnh tôi thêm vào thư mục “WhereToGo Photos” trong Google Drive của tôi. Máy chủ giữ một khoá truy cập Google đã mã hoá để tải và hiển thị ảnh. Ở bước sau, Google sẽ hỏi bạn cho phép." |
| 3 | (không bắt buộc) | "Mỗi tuần sao lưu kho địa điểm thành một tệp trong thư mục “WhereToGo Backups” trên Drive của tôi." Khi ô 2 chưa tick, ô 3 bị khoá và có dòng phụ "Cần chọn ô lưu ảnh trước." |
| 4 | (bắt buộc) | "Tôi từ 16 tuổi trở lên và đã đọc Điều khoản sử dụng và Chính sách quyền riêng tư." Hai cụm "Điều khoản sử dụng" và "Chính sách quyền riêng tư" là link. |

**Hộp thông tin** (nền `surface-2`, không phải ô tick): "Vị trí: chỉ hỏi khi bạn dùng Gần tôi hoặc lọc theo khoảng cách, và chỉ dùng trên máy này. Vị trí chỉ được lưu khi bạn bấm “Dùng vị trí hiện tại” lúc thêm quán — khi đó nó thành vị trí của quán."

**Nút**
- **[Đồng ý và tiếp tục]** (nút chính) bị khoá cho tới khi tick đủ ô 1 và ô 4. Khi đang khoá, dòng chú thích dưới nút: "Cần chọn 2 ô bắt buộc để tiếp tục."
- **[Tôi không đồng ý]** (ghost) mở một bảng trượt:
  - Tiêu đề: "Không dùng WhereToGo?"
  - Nội dung: "Tài khoản vừa tạo (tên, email, ảnh đại diện, nhật ký đăng nhập) sẽ bị xoá ngay và bạn được đăng xuất."
  - `[KIỂM TRA]` Supabase có xoá cả nhật ký đăng nhập (có địa chỉ IP) khi xoá người dùng không; nếu không, bỏ "nhật ký đăng nhập" khỏi câu hoặc ghi rõ thời hạn giữ.
  - [Xoá và thoát] (danger) / [Quay lại]. Nút xoá dùng chung điểm cuối (endpoint: địa chỉ API trên máy chủ) với trang Xoá tài khoản (10.11), xong chuyển tới `/?da-xoa=1` (trang giới thiệu hiện banner đã xoá).

**Dữ liệu lưu.** Mỗi ô một dòng trong bảng `consents`, ghi mục đích, đã đồng ý hay không, phiên bản chính sách, thời gian và user agent (chuỗi nhận dạng trình duyệt). Migration (tệp thay đổi cấu trúc cơ sở dữ liệu) tạo bảng này phải ghi rõ lệnh `GRANT` (lệnh cấp quyền truy cập bảng), vì Supabase đổi mặc định vào ngày 2026-10-30.

**Chưa tạo sẵn gì trước bước này:** không nhóm, không nhãn, không dữ liệu mặc định nào.

### 9.3 Bước 2/4 — Ảnh & Google Drive (`#/welcome/2`, chỉ khi đã tick ô 2)

Nếu ô 2 không được tick thì bỏ qua bước này; thanh bước tính bước 2 là đã xong.

**Trước khi sang Google**
- Tiêu đề: "Cho phép lưu ảnh vào Google Drive"
- Nội dung: "Google sẽ hỏi bạn có cho WhereToGo xem, tạo và xoá các tệp Drive do chính ứng dụng này tạo không `[KIỂM TRA câu chữ trên màn hình Google]`. Đây là quyền hẹp nhất: app không đọc được tệp nào khác của bạn."
- **[Tiếp tục tới Google]** (nút chính) · [Để sau — dùng không có ảnh]

**Luồng kỹ thuật**
- Xin quyền bổ sung cho `drive.file` (incremental request: xin thêm một quyền sau khi đã đăng nhập, không xin gộp lúc đầu), kèm ba tham số:
  - `access_type=offline`: để Google cấp khoá làm mới dài hạn, giúp máy chủ tiếp tục tải ảnh khi bạn không mở app;
  - `prompt=consent`: bắt Google hiện hộp xin quyền;
  - `include_granted_scopes=true`: giữ các quyền đã cấp trước đó.
- Khoá làm mới (refresh token, loại khoá dùng được lâu dài) được chuyển lên máy chủ ngay khi quay về.
- Máy chủ kiểm quyền Google đã thật sự cấp (A6, mục 11): người dùng có thể huỷ, hoặc (nếu Google hiện ô tick riêng `[KIỂM TRA]`) bỏ chọn ô Drive, nên không thể coi "đã quay về" là "đã được cấp".

**Ba kết quả**

| Kết quả | Câu chữ | Nút |
|---|---|---|
| Đã cấp | Tự sang bước tiếp theo, kèm toast "Đã kết nối Google Drive" | — |
| Thiếu quyền | Tiêu đề "Google chưa cho phép lưu ảnh". Nội dung: "Ở màn hình Google, ô quyền Google Drive đang bị bỏ chọn. Không sao — mọi thứ khác vẫn dùng được, chỉ chưa thêm được ảnh." | [Thử lại] · [Để sau] |
| Huỷ hoặc lỗi | "Chưa kết nối được Google Drive." | [Thử lại] · [Để sau] |

### 9.4 Bước 3/4 — Nhóm, bước 4/4 — Nơi đầu tiên, và sau đó

**Bước 3/4 — Nhóm (`#/welcome/3`)**
- Tiêu đề: "Bạn hay lưu những nơi nào?"
- Giải thích: "Nhóm là các ngăn lớn trong kho — mỗi nhóm thành một thẻ trên Trang chủ, và mỗi địa điểm thuộc ít nhất một nhóm. Nhãn là ghi chú nhỏ để tìm nhanh, như “Hẹn hò”."
- Các hàng có ô tick, **tất cả được tick sẵn**:
  - Quán ăn ("Chán cơm thì ăn gì?")
  - Quán uống ("Chán nước thì uống gì?")
  - Chỗ chơi ("Chán ở nhà thì đi đâu?")
  - Du lịch ("Cuối tuần trốn đi đâu?")
  - cộng "＋ Thêm nhóm khác", bấm thì mở ô nhập tên ngay tại chỗ.
- Nút **[Tạo 4 nhóm]**; con số đổi theo số nhóm đang chọn.
- Lỗi: "Chọn ít nhất một nhóm."
- Bước này tạo nhóm và nhãn "Hẹn hò" **theo từng mã người dùng (`user.id`)** (sửa lỗi A13: hiện `AuthProvider.tsx:85-108` tự tạo nhóm và nhãn ngay sau đăng nhập, một lần mỗi lần mở app, chưa hỏi đồng ý; phần tự tạo đó phải gỡ và việc tạo chuyển hẳn vào bước này, theo từng `user.id`).

**Bước 4/4 — Nơi đầu tiên (`#/welcome/4`)**
- Tiêu đề: "Thêm nơi đầu tiên"
- Giải thích: "Dán link Google Maps — tên và vị trí tự điền."
- Một ô nhập cộng nút [Dán].
- Mục mở rộng "Lấy link ở đâu?": "Mở quán trên Google Maps → bấm Chia sẻ → Sao chép đường liên kết."
- **[Tiếp tục]** (nút chính) mở form Thêm địa điểm đã điền sẵn · [Tự nhập] · link "Để sau, vào Trang chủ".

**Tài khoản đã có dữ liệu thì bỏ bước.** Tài khoản đã có ít nhất 1 nhóm bỏ qua bước 3; đã có ít nhất 1 địa điểm bỏ qua bước 4. Vì vậy tài khoản của chính chủ app chỉ thấy bước 1 và bước 2.

**Sau lần lưu địa điểm đầu tiên**
- Toast: "Đã lưu nơi đầu tiên vào sổ."
- Bảng Cài app, nếu app chưa được cài (quy tắc mời ở V33: mời sau địa điểm thứ 1 và thứ 3, không mời nữa sau 2 lần bị bỏ qua).
- Trên Trang chủ hiện danh sách việc "Bắt đầu với WhereToGo":
  - Thêm 3 địa điểm (1/3)
  - Thử Vuốt chọn quán
  - Cài lên màn hình chính (ẩn khi đã cài)
  - [Ẩn]

### 9.5 Đồng ý lại (`#/welcome/policy`)

Màn này hiện khi người dùng đã đồng ý trước đây nhưng phiên bản chính sách đã đổi.
- Tiêu đề: "Chính sách quyền riêng tư đã thay đổi"
- Danh sách "Điểm mới" (2–4 gạch đầu dòng) và link tới toàn văn chính sách.
- Chỉ hiện những ô có câu chữ thay đổi, để trống.
- [Đồng ý và tiếp tục] · [Không đồng ý] → mở bảng trượt cho chọn [Xoá tài khoản] hoặc [Đăng xuất].
- Khi offline: banner chỉ xem (xem 9.6).

### 9.6 Kiểm tra đồng ý mỗi lần mở app

Phiên bản chính sách mà bạn đã đồng ý được lưu sẵn ở hai nơi trên máy: mục `wtg.consent` trong `localStorage` và bộ nhớ đệm dữ liệu lưu bền của app. Nhờ vậy mở app khi offline vẫn biết bạn đã đồng ý hay chưa.

| Tình huống | Hành vi |
|---|---|
| Phiên bản lưu đệm là bản hiện hành | App mở bình thường, kể cả khi offline |
| Chưa có đệm, đang online | Hỏi máy chủ |
| Chưa có đệm, đang offline | Hiện "Cần có mạng để hoàn tất đăng ký." kèm [Thử lại] |
| Phiên bản đã cũ, đang offline | App mở ở chế độ chỉ xem, kèm banner "Chính sách đã đổi — kết nối mạng để xem và đồng ý." Khi offline, app vốn đã không cho thêm hay sửa dữ liệu nên chế độ chỉ xem không làm mất thao tác nào |

### 9.7 Lớp chặn trình duyệt chat (Zalo, Messenger…)

Zalo, Messenger, Facebook, Instagram, TikTok… mở link trong một trình duyệt nhúng (in-app browser, còn gọi là webview). Google không cho đăng nhập trong đó để bảo vệ tài khoản, nên app phát hiện và hướng dẫn người dùng mở bằng Safari hoặc Chrome (V32). Lớp chặn này chạy ở `/`, `/cai-ung-dung/` và `/app/`.

**Cách nhận biết** (theo user agent):

| Ứng dụng | Chuỗi nhận dạng |
|---|---|
| Zalo | `Zalo` |
| Facebook | `FBAN\|FBAV\|FB_IAB` |
| Messenger | `Messenger` |
| Instagram | `Instagram` |
| TikTok | `musical_ly\|TikTok\|BytedanceWebview` |
| Line | `Line/` |

**Lớp phủ** toàn màn hình, nền `surface`:
- Biểu tượng `open-outline`.
- Tiêu đề: "Mở bằng Safari hoặc Chrome để đăng nhập"
- Nội dung: "Bạn đang xem trong trình duyệt của {Zalo}. Google không cho đăng nhập ở đây để bảo vệ tài khoản của bạn." (`{Zalo}` được thay bằng tên ứng dụng phát hiện được.)

**Các bước cho đúng ứng dụng đang dùng** `[KIỂM TRA TÊN MENU]`:

| Ứng dụng | Hướng dẫn |
|---|---|
| Zalo | "Bấm nút ba chấm ở góc trên → chọn “Mở bằng trình duyệt”." |
| Messenger / Facebook | "Bấm nút ba chấm → “Mở bằng trình duyệt” (iPhone: “Mở trong Safari”)." |
| Instagram | "Bấm nút ba chấm → “Mở trong trình duyệt ngoài”." |
| TikTok | "Bấm nút ba chấm → “Mở trong trình duyệt”." |
| Ứng dụng khác | "Mở menu của ứng dụng và chọn mở bằng trình duyệt, hoặc sao chép link rồi dán vào Safari hay Chrome." |

**Nút của lớp phủ**
- **[Sao chép link]** (nút chính).
  - Chép được: "Đã sao chép. Mở Safari hoặc Chrome và dán vào thanh địa chỉ."
  - Chép lỗi: link hiện trong một ô cho chọn chữ, kèm "Giữ ngón tay lên link để sao chép."
- Trên Android có thêm **[Mở bằng Chrome]**, dùng intent URL (link đặc biệt của Android để mở thẳng một ứng dụng cụ thể): `intent://[TÊN MIỀN]/app/#Intent;scheme=https;package=com.android.chrome;end`.
- Chỉ ở các trang tĩnh: **[Vẫn xem trang]** đóng lớp phủ, nhưng các nút đăng nhập vẫn bị chặn.

---

## 10. Đặc tả từng trang

Mỗi trang dưới đây gồm: header, các khối từ trên xuống, và các trạng thái. Tra cứu nhanh:
- Bảng tóm tắt các trang: mục 5. Màu: mục 6.1. Kiểu chữ (`h1`, `h2`, `story`, `name`, `label`, `caption`, `micro`…): mục 6.3. Bo góc và đổ bóng (`sm`, `md`, `lg`, `e1`, `e2`): mục 6.4. Thành phần dùng chung (chip, nút, thẻ, banner, bảng trượt, trạng thái trống…): mục 7.
- Mã trong ngoặc: M# và U# trỏ về UI-REDESIGN.md; D# trỏ về PLAN.md; V# là bảng ở mục 3; A# là mục bảo mật ở mục 11.
- Mã trạng thái L, E, Er, Off, P, Q: giải thích ở đầu mục 5.

### 10.1 Trang chủ (`#/home`)

**Header:** chữ "WhereToGo" (wordmark — tên viết thành logo chữ) · biểu tượng offline (chỉ hiện khi đang offline) · avatar 32 px nằm trong vùng bấm 44 px, bấm mở Tài khoản.

**Nội dung, từ trên xuống**
1. **Dòng ngày:** "Thứ Bảy, 17 tháng 10" (`caption`, màu muted).
2. **Thẻ gợi ý hôm nay** (bo góc `lg`):
   - Nhãn "Hôm nay thử quán này" (kiểu `label`, màu `accent-text`, gạch chân bằng nét bút đỏ).
   - Ảnh tỉ lệ 16:10.
   - Tên quán (`h2`); dòng phụ "Quán ăn · 50.000–90.000 ₫"; trạng thái "Đang mở · đóng lúc 20:30" màu `success`.
   - Nút icon "Đổi quán khác" (icon `refresh`).
   - Bấm vào thẻ thì mở bảng thông tin (M4).
3. **Danh sách việc "Bắt đầu với WhereToGo"** — chỉ người mới (nội dung ở 9.4).
4. **"Nhóm của bạn"** (`h2`), cùng nút ghost "Sửa" → Quản lý nhóm (10.12).
5. **Các thẻ nhóm**, xếp theo M2 (nhóm nhiều quán nhất lên đầu; bằng nhau thì theo thứ tự tạo).
6. **Thẻ Gần tôi:** icon `locate`, "Gần tôi", "Quanh đây có gì?", dòng phụ "Xem quán đã lưu trong bán kính 1–10 km".
7. **Dock** (thanh dưới có 5 ô: Tìm · Yêu thích · ＋ Thêm · Vuốt · Bốc thăm).

**Trạng thái**

| Trạng thái | Cách hiện |
|---|---|
| Đang tải (L) | Khung xương cho thẻ gợi ý hôm nay và 2 thẻ nhóm. Dữ liệu nhóm tải riêng, nên thẻ "chưa có nhóm" không nháy lên lúc đang tải |
| Lỗi (Er) | Banner "Không tải được dữ liệu." kèm [Thử lại] |
| 0 địa điểm (E) | Không có thẻ gợi ý hôm nay; danh sách việc nằm trên cùng; các thẻ nhóm hiện với dải trống của chúng |
| 0 nhóm | Thẻ "Chưa có nhóm nào" / "Tạo nhóm để sắp xếp địa điểm thành các thẻ ở đây." [Tạo nhóm] |
| Offline (Off), Drive, hạn mức (Q) | Các banner nằm phía trên thẻ gợi ý hôm nay. Chữ chốt (mục 7): offline "Đang offline — chỉ xem được."; Drive "Chưa lưu được ảnh vào Google Drive." [Cấp lại quyền]; hạn mức "Bạn đã lưu 950/1.000 địa điểm." |

### 10.2 Trang chọn quán (`#/categories/:id`)

Địa chỉ đầy đủ: `#/categories/:id?q=&nhan=&gia=&tt=&sx=` (bộ lọc nằm trên URL).

**Header:** quay lại · ＋ (nhãn "Thêm vào nhóm này") · ⋯ (mục "Sửa nhóm" mở bảng trượt sửa nhóm).

**Nội dung**
- Vòng tròn icon 40 px, rồi `h1` "Quán uống".
- Câu gợi ý "Chán nước thì uống gì?" ở kiểu `story`, màu muted.
- Dòng meta: "8 địa điểm · 3 đã đi".
- Hàng nút phụ: [Vuốt nhóm này] (icon `layers`) và [Bốc thăm] (icon `shuffle`). Khi nhóm trống, cả hai bị khoá và có dòng chú thích giải thích lý do (theo quy tắc nút bị khoá ở mục 7). `[CẦN CHỐT CÂU CHỮ]` Đề xuất: "Nhóm này chưa có địa điểm nào nên chưa vuốt hay bốc thăm được."
- Ô tìm "Tìm trong Quán uống" và nút [Lọc] có số đếm bộ lọc đang bật. Bảng Lọc gồm: Nhãn, Giá, Trạng thái, Sắp xếp (Mới thêm, Mới sửa, Đánh giá cao, Hot nhất, Tên A–Z).
- Lưới thẻ địa điểm.

**Trạng thái**

| Trạng thái | Câu chữ | Nút |
|---|---|---|
| Trống (E) | "Nhóm này chưa có nơi nào" / "Thêm quán đầu tiên vào Quán uống để vuốt và bốc thăm trong nhóm." | [Thêm vào Quán uống] |
| Không có kết quả | "Không có nơi nào khớp bộ lọc" / "Thử bỏ bớt điều kiện." | [Xoá bộ lọc] |
| `:id` lạ | Hiện trang 404 (10.15) | — |
| Đang tải (L), offline (Off) | Khung xương; banner chỉ xem | — |

### 10.3 Tìm kiếm (`#/search`)

Địa chỉ đầy đủ: `#/search?q=&nhom=&gia=&km=&nhan=&tt=&yt=&vitri=&sx=`. Mọi bộ lọc và cách sắp xếp nằm trên URL (V17).

Ý nghĩa các tham số trong địa chỉ (suy ra từ ngữ cảnh, kiểm lại khi làm): `q` từ khoá tìm, `nhom` nhóm, `gia` mức giá, `km` bán kính, `nhan` nhãn, `tt` trạng thái, `yt` yêu thích, `vitri` vị trí, `sx` sắp xếp, `xem` kiểu xem (danh sách hay bản đồ).

**Bố cục**
- Tiêu đề trên thanh công cụ: "Tìm kiếm" (trang tiện ích không có `h1` nên tiêu đề này hiện ngay từ đầu).
- Ô tìm dính ở đầu trang, chữ gợi ý (placeholder — chữ mờ trong ô khi chưa gõ) "Tên quán, địa chỉ, ghi chú, nhãn…". So khớp không phân biệt dấu và hoa thường (tách dấu khỏi chữ theo chuẩn NFD, bỏ dấu, đổi đ thành d), nên gõ "bun cha" vẫn ra "Bún chả".
- Một hàng chip cuộn ngang: Nhóm ▾ · Giá ▾ · Khoảng cách ▾ · Nhãn ▾ · Trạng thái ▾ · Yêu thích · Sắp xếp ▾.
- Dòng kết quả: "18 địa điểm · Xoá bộ lọc".
- Các hàng kết quả.

**Giá trị của bộ lọc**

| Bộ lọc | Giá trị |
|---|---|
| Giá | "Dưới 50.000 ₫", "50.000–150.000 ₫", "150.000–300.000 ₫", "Trên 300.000 ₫". Một quán khớp nếu khoảng giá của quán có phần trùng với mức đã chọn. Khi đang lọc theo giá, có dòng chú thích "Quán chưa có giá không hiện khi lọc theo giá." |
| Khoảng cách | 1 · 3 · 5 · 10 km. Chọn mức nào cũng mở trước bảng Vị trí, dùng lại lời giải thích của trang Gần tôi (10.5) |
| Nhãn | Chọn được nhiều nhãn; khớp theo HOẶC — quán có ít nhất một nhãn đã chọn (D19) |
| Sắp xếp | Mới thêm (mặc định) · Mới sửa · Đánh giá cao · Hot nhất · Gần nhất · Tên A–Z |

**Trạng thái**

| Trạng thái | Câu chữ |
|---|---|
| Ô tìm trống | "Tất cả 28 địa điểm" (liệt kê mọi địa điểm) |
| Không có kết quả | "Không tìm thấy “bún bò”" / "Kiểm tra chính tả hoặc bỏ bớt bộ lọc." [Xoá bộ lọc] |
| Offline (Off) | Vẫn tìm trong dữ liệu đã lưu trên máy, kèm banner |
| Cần quyền vị trí (P) | Khi chọn lọc theo Khoảng cách: mở bảng Vị trí, dùng lời giải thích của trang Gần tôi |
| Đang tải (L) | Khung xương |

### 10.4 Yêu thích (`#/favorites`)

Địa chỉ đầy đủ: `#/favorites?nhom=`.

- `h1` "Yêu thích", dưới là "6 nơi".
- Hàng chip nhóm "Tất cả · Quán ăn · Quán uống…". Chỉ nhóm nào có địa điểm yêu thích mới hiện.
- Lưới thẻ, quán mới được yêu thích nằm trước.
- Trống (E): icon trái tim, "Chưa có nơi yêu thích" / "Bấm hình trái tim ở trang địa điểm hoặc khi vuốt thẻ." [Vuốt chọn quán]
- Đang tải (L): khung xương. Offline (Off): banner chỉ xem.

### 10.5 Gần tôi

**Trang hỏi (`#/nearby`)**
- `h1` "Gần tôi", lời dẫn "Tìm quán đã lưu quanh bạn."
- Hộp thông tin (nền `surface-2`): "Vị trí hiện tại chỉ dùng trên máy này để tính khoảng cách, không gửi lên máy chủ. Bản đồ tải từ OpenFreeMap — họ thấy địa chỉ IP và khu vực bạn xem."
- **Nhóm (bắt buộc):** chip chọn một, nhớ lựa chọn lần trước.
- **Tầm giá (tuỳ chọn):** "Bất kỳ" (mặc định) cộng 4 mức giá sẵn như ở Tìm kiếm.
- **Bán kính:** nút chọn một trong 1 · 3 · 5 · 10 km, mặc định 3 (U11).
- **[Tìm quanh đây]** — bấm thì trình duyệt mới hiện hộp xin vị trí (không hỏi ngay lúc mở trang). Bị khoá cho tới khi chọn nhóm, kèm chú thích "Chọn một nhóm."
- Đang định vị: "Đang tìm vị trí của bạn…". Sau 10 giây vẫn chưa có: "Không lấy được vị trí." [Thử lại]

**Bị từ chối quyền (P):** tiêu đề "Chưa có quyền vị trí", rồi các bước theo nền tảng phát hiện được `[KIỂM TRA]`, rồi nút [Thử lại].

| Nền tảng | Các bước |
|---|---|
| iPhone (Safari) | "Cài đặt → Ứng dụng → Safari → Vị trí → Hỏi." |
| iPhone (app đã cài) | "Cài đặt → Quyền riêng tư & Bảo mật → Dịch vụ định vị → Trang web Safari → Khi dùng ứng dụng." |
| Android | "Bấm biểu tượng cạnh thanh địa chỉ → Quyền → Vị trí → Cho phép." |
| Máy tính | "Bấm biểu tượng ổ khoá cạnh địa chỉ trang → Vị trí → Cho phép, rồi tải lại trang." |

**Không có quán nào có toạ độ** (U36): tiêu đề "Chưa có quán nào trong Quán ăn có vị trí" / nội dung "Mở quán trên Google Maps, bấm Chỉ đường hoặc thả ghim, rồi Chia sẻ → Sao chép đường liên kết và dán vào ô “Dán link Google Maps” khi sửa quán. Hoặc dán chuỗi “21.0285, 105.8542”." Nút [Xem quán chưa có vị trí] → `#/search?vitri=thieu`.

**Kết quả dạng danh sách (làm trước — V19)** (`#/nearby/results?nhom=&gia=&km=&xem=ds|bando`)
- Header: quay lại · tiêu đề "Quán ăn · trong 3 km" (bấm vào thì về trang hỏi) · khi bản đồ ra mắt thì có nút chọn một "Danh sách | Bản đồ".
- Các hàng xếp theo khoảng cách ("0,4 km").
- Chú thích: "3 quán trong Quán ăn chưa có vị trí — Thêm vị trí"
- 0 kết quả: "Không có quán nào trong 3 km" / "Mở rộng bán kính hoặc chọn nhóm khác." [Mở rộng lên 5 km]

**Kết quả dạng bản đồ (làm sau)**
- Toàn màn hình, có nút quay lại nổi 44 px, nhãn tóm tắt "Quán ăn · 3 km" và nút "Danh sách" (đều nền `surface`, đổ bóng `e2`).
- Góc phải dưới: nút "Về vị trí của tôi" (icon `locate`). Góc trái dưới: dòng ghi công nguồn bản đồ (attribution).
- Kiểu bản đồ: OpenFreeMap Positron (bản sáng) và bản tối `[KIỂM TRA tên style]`.
- Bấm ghim → bảng thông tin mở ở mốc 0,6 chiều cao (U13).
- Trên máy tính: một bảng kết quả rộng 360 px nằm bên trái, thay cho bảng trượt.
- Trạng thái:
  - "Đang tải bản đồ…"
  - Offline: hiện dạng danh sách kèm "Bản đồ cần mạng — đang hiện danh sách."
  - Máy không có WebGL (công nghệ vẽ đồ hoạ mà bản đồ cần) hoặc lỗi tải ô bản đồ: hiện dạng danh sách kèm "Không tải được bản đồ." [Thử lại]

### 10.6 Bốc thăm (`#/random`)

Địa chỉ đầy đủ: `#/random?nhom=`.

- `h1` "Bốc thăm", lời dẫn "Chọn một nhóm, app bốc tối đa 3 nơi. Không ưng thì bốc lại."
- Chip nhóm bắt buộc chọn, nhớ lựa chọn lần trước.
- **[Bốc 3 quán]** đổi thành "Bốc lại" sau lần bốc đầu; sau khi bấm "Chốt quán này", [Bốc lại] hạ xuống nút phụ để màn chỉ còn một nút chính là [Chỉ đường].
- **Kết quả:** xếp dọc trên điện thoại, 3 cột trên máy tính. Mỗi thẻ có số thứ tự bằng Newsreader (kiểu `numeral`), ảnh 16:10, tên quán, dòng "giá · Đang mở" và nút phụ [Chốt quán này].
- **Khi bấm "Chốt quán này":**
  - nét bút đỏ vẽ một vòng quanh số thứ tự của thẻ đó (vòng bút đỏ, V14);
  - thẻ có viền màu nhấn;
  - hai nút của thẻ đổi thành [Chỉ đường] (nút chính) và [Xem đầy đủ];
  - các thẻ còn lại giữ nguyên;
  - **không ghi gì vào cơ sở dữ liệu** (V18).
- **Trạng thái**
  - 0 địa điểm: tiêu đề (câu của chính chủ app, U20) "Chưa thêm gì vào thì đào đâu ra mà random", nội dung "Thêm vài nơi vào Quán ăn rồi quay lại bốc nhé." [Thêm vào Quán ăn]
  - 1–2 địa điểm: chú thích "Nhóm này mới có 2 nơi — bốc lại vẫn ra đúng 2 nơi này."
  - Chưa chọn nhóm: chưa bốc được vì nhóm là bắt buộc (V18); nút Bốc bị khoá kèm chú thích theo quy tắc nút bị khoá ở mục 7.
  - Offline: trang Bốc thăm vẫn chạy được.

### 10.7 Vuốt chọn quán (`#/swipe`)

Địa chỉ đầy đủ: `#/swipe?nhom=&nhan=`. Đây là chế độ toàn màn hình, không có dock (V20).

**Bố cục**
- Header: quay lại · "Vuốt chọn quán" · Lọc (icon `options`, có số đếm) · avatar.
- Dòng: "Quán ăn · còn 14 thẻ · [Xoá lọc]".
- **Thẻ** (bo góc `lg`, đổ bóng `e2`):
  - ảnh theo tỉ lệ ở V20: 4:5; dưới 740 px chiều cao màn hình thì 1:1; dưới 640 px thì 4:3 (mục 6.7);
  - dưới ảnh là một khung đặc nền `surface`: chip nhóm, tên quán (24/32, tối đa 2 dòng), "60.000–80.000 ₫ · 13 Lò Đúc", và ngọn lửa kèm "Độ hot 3";
  - bấm vào khung này thì mở bảng thông tin.
- **Con dấu khi kéo thẻ:** "+1 hot" (màu `accent-text`) hoặc "Bỏ qua" (màu chữ thường), mỗi con dấu nằm trong một nhãn bo tròn nền `surface` và được khoanh bằng bút đỏ.
- **Toast:** "+1 độ hot", "−1 độ hot", "Đã thêm vào Yêu thích", "Đã hoàn tác".
- **Gợi ý lần đầu** (dưới hàng nút): "Vuốt phải: +1 độ hot · Vuốt trái: bỏ qua".

**Hàng nút**, từ trái sang phải:

| Nút | Cỡ | Kiểu |
|---|---|---|
| Hoàn tác | 44 px | icon `arrow-undo` |
| **Bỏ qua** | 64 px | nền `surface`, viền `border-strong`, icon `close` |
| **Yêu thích** | 52 px | icon trái tim; tô màu nhấn khi đang bật |
| **Hot** | 64 px | nền `accent`, icon ngọn lửa (`flame`) |
| Thông tin | 44 px | icon `information-circle` |

Ba nút ở giữa (Bỏ qua, Yêu thích, Hot) có nhãn nhỏ (`micro`) bên dưới.

**Hành vi**
- Trang được phép cuộn khi nội dung cao hơn màn hình.
- Máy tính: thẻ rộng 420 px. Phím tắt: ← Bỏ qua, → Hot, F Yêu thích, Z Hoàn tác, I Thông tin.

**Trạng thái**

| Trạng thái | Câu chữ | Nút |
|---|---|---|
| Chưa có địa điểm | "Chưa có gì để vuốt" / "Thêm vài nơi rồi quay lại vuốt nhé." | [Thêm địa điểm] |
| Không khớp bộ lọc | "Không có thẻ nào khớp bộ lọc" | [Xoá bộ lọc] |
| Đã xem hết | "Đã xem hết 14 thẻ" | [Xem lại từ đầu] · [Xem quán hot nhất] → `#/search?sx=hot` |
| Offline (Off) | Khoá các nút thao tác; banner "Đang offline — vuốt thẻ cần có mạng." (M6) | — |
| Đang bận | `[CẦN CHỐT CÂU CHỮ]` Trong lúc một lượt vuốt đang bay hoặc đang ghi, mọi nút và cử chỉ bị khoá (P25 của PLAN-UI-1). Đề xuất: không hiện chữ, chỉ làm mờ các nút. | — |

### 10.8 Chi tiết địa điểm và xem ảnh

**Chi tiết (`#/places/:id`)**

**Header:** quay lại · trái tim (chỉ khi online) · Sửa (icon `create`) · ⋯ (mục "Xoá địa điểm").

**Nội dung, từ trên xuống**
1. Ảnh lớn tỉ lệ 4:3 kèm nhãn "1/6"; bấm vào thì mở trang xem ảnh.
2. Chip nhóm, rồi tên quán ở `h1`.
3. Dòng meta: sao đánh giá màu mực, chip trạng thái, ngọn lửa "Độ hot 5".
4. **Danh sách thông tin** (icon 20 px cộng chữ, mỗi hàng cao 48 px):
   - Địa chỉ;
   - Giá "50.000 ₫ – 90.000 ₫";
   - Giờ "Đang mở · đóng lúc 20:30 ▸", bấm thì bung ra cả tuần. Các trạng thái khác: "Sắp đóng · 20:30", "Đã đóng · mở lúc 8:00 mai", "Chưa rõ giờ";
   - Khoảng cách — chỉ hiện nếu quyền vị trí đã được cấp từ trước;
   - "2 lần đi".
5. **Câu chuyện** (`h2`, rồi nội dung kiểu `story`).
6. **Ghi chú.**
7. **Nhãn**: các chip, mỗi chip là link sang Tìm kiếm.
8. **Các lần đi:** dòng thời gian. Mỗi hàng ghi "12/07/2026 · Đi với nhóm lớp" và có menu ⋯ (Sửa, Xoá; xoá thì hiện bảng xác nhận). Dưới cùng là [＋ Thêm lần đi].
9. Dòng chú thích: "Thêm ngày 12/07/2026 · Sửa lần cuối 03/10/2026".

**Thanh dính ở đáy:** [Chỉ đường] (nút chính) và [Thêm lần đi] (nút phụ). Khi offline chỉ còn [Chỉ đường].

**Trạng thái**
- Đang tải: khung xương.
- Đã bị xoá: "Địa điểm này đã bị xoá" (biến thể của trang 404, xem 10.15).
- Lỗi mạng (Er): "Không tải được địa điểm." [Thử lại]

**Xem ảnh (`#/places/:id/photos/:n`)**
- Nền riêng của trang xem ảnh (`viewer-bg`, `#0C0A09`), dải ảnh vuốt ngang được, số thứ tự "2 / 6", nút đóng 44 px, link "Mở trong Google Drive ↗".
- Phím ←/→ đổi ảnh trên máy tính; bấm Back là đóng (V23).
- Ảnh tải lỗi: nút "Tải lại ảnh".
- Offline mà ảnh chưa có trong bộ nhớ đệm trên máy: là một trạng thái riêng của trang (mục 5). `[CẦN CHỐT CÂU CHỮ]` Đề xuất: "Ảnh này chưa được lưu trên máy. Kết nối mạng để xem."

### 10.9 Thêm / Sửa địa điểm (`#/places/new`, `#/places/:id/edit`)

Địa chỉ đầy đủ: `#/places/new?nhom=&link=`.

**Header:** [Huỷ] (nút chữ) · tiêu đề "Địa điểm mới" hoặc "Sửa địa điểm". **Không có nút Lưu ở header.**

**Bốn phần của form**
1. **Thẻ "Dán link Google Maps"**
   - "Tên và vị trí tự điền. Link chỉ đường điền cả địa chỉ." Một ô nhập cộng nút [Dán].
   - Thành công: "Đã lấy tên và vị trí".
   - Mục mở rộng "Lấy link ở đâu?".
2. **Cơ bản**
   - Tên (bắt buộc).
   - Nhóm (bắt buộc): các chip chọn, cộng "＋ Nhóm mới" mở bảng trượt sửa nhóm.
   - Khoảng giá: hai ô "Từ" và "Đến" có hậu tố ₫, bàn phím số, tự định dạng ngay khi gõ ("45.000").
   - Ảnh: một hàng ảnh nhỏ cộng nút [Thêm ảnh]. Ảnh đầu tiên có nhãn "Ảnh bìa"; menu ⋯ của mỗi ảnh có "Đặt làm ảnh bìa" và "Xoá".
   - Địa chỉ.
   - Vị trí, hiện thành một dòng trạng thái chứ không hiện thẳng các con số toạ độ:
     - "Đã có vị trí từ link Google Maps" (màu `success`), hoặc "Chưa có vị trí";
     - [Dùng vị trí hiện tại], kèm chú thích "Vị trí lúc này của bạn sẽ thành vị trí của quán.";
     - [Xoá vị trí];
     - "Xem toạ độ" bung ra các con số.
3. **Cảm nhận của bạn**
   - Trạng thái: nút chọn một trong ba — Hứng thú / Chưa đi / Đã đi.
   - Đánh giá: 5 sao, mỗi sao 44 px; bấm lại đúng ngôi sao đang chọn thì xoá đánh giá.
   - Câu chuyện, dòng phụ "Kỷ niệm, cảm nhận của bạn về nơi này."
4. **Thêm chi tiết** (thu gọn khi thêm mới; khi sửa thì tự mở nếu có ô nào trong phần này đã có giá trị)
   - Giờ mở cửa: một hàng tóm tắt "Chưa rõ giờ ›" bấm thì mở bảng trượt cao toàn màn hình chứa bộ chỉnh giờ hiện có. Quán mới mặc định "Chưa rõ giờ" (V24).
   - Nhãn.
   - Ghi chú, dòng phụ "Món nên gọi, chỗ gửi xe, giờ đông khách…"

**Chỉ khi sửa:** nút "Xoá địa điểm" (chữ danger) mở bảng trượt:
- "Xoá Bún chả Hương Liên?"
- "Ảnh vẫn nằm trong Google Drive của bạn; các lần đi và lượt vuốt của nơi này sẽ bị xoá."
- [Xoá] / [Huỷ]. Xong thì chuyển về Trang chủ (không giữ trang vừa xoá trong lịch sử) và hiện toast "Đã xoá Bún chả Hương Liên".

**Thanh dính ở đáy:** **[Lưu địa điểm]**. Trong lúc tải ảnh lên: "Đang tải ảnh 2/5…".

**Kiểm tra dữ liệu** (cuộn tới lỗi đầu tiên và đưa con trỏ vào đó):
- "Cần nhập tên địa điểm."
- "Chọn ít nhất một nhóm."
- "Giá “đến” phải lớn hơn hoặc bằng giá “từ”."

**Trạng thái**

| Trạng thái | Câu chữ |
|---|---|
| Thiếu Drive (ở khối ảnh) | "Chưa kết nối Google Drive nên chưa thêm được ảnh." [Kết nối Google Drive] |
| Đủ 20 ảnh | "Đã đủ 20 ảnh — giới hạn của mỗi địa điểm." |
| Chạm hạn mức (Q) | Bảng trượt: "Kho đã có 1.000 địa điểm — mức tối đa hiện tại cho mỗi tài khoản." |
| Offline (Off) | Banner "Đang offline — cần mạng để lưu." Nút Lưu bị khoá và giải thích lý do |
| Chặn mất thay đổi chưa lưu (cả khi bấm Back của trình duyệt và vuốt từ mép trái trên iOS) | "Bỏ thay đổi?" / "Những gì bạn vừa nhập sẽ mất." [Bỏ thay đổi] / [Tiếp tục sửa] |

### 10.10 Tài khoản (`#/settings`)

Từ trên xuống:
1. **Thẻ hồ sơ:** avatar, "Nguyễn Minh Anh", email.
2. **Thẻ Google Drive**, một trong ba:
   - "Đã kết nối — ảnh nằm trong WhereToGo Photos." [Mở thư mục ↗]
   - "Chưa kết nối — chưa thêm được ảnh." [Kết nối Google Drive]
   - Cảnh báo (màu `warning`): "Cần kết nối lại — quyền đã hết hạn hoặc bị gỡ." [Kết nối lại]
3. **Dữ liệu:** Nhóm (4) › · Nhãn (1) ›
4. **Ứng dụng:**
   - Giao diện: nút chọn một Theo máy · Sáng · Tối (V9).
   - Cài lên màn hình chính › (ẩn khi đã cài).
   - "Dọn ảnh lưu trên máy này", xong hiện toast "Đã dọn ảnh lưu trên máy".
5. **Quyền riêng tư & dữ liệu ›**
6. **Trợ giúp & câu hỏi ↗** · **Góp ý qua email ↗** · **Giới thiệu ›**
7. **[Đăng xuất]** mở bảng trượt:
   - [Đăng xuất trên máy này];
   - [Đăng xuất trên mọi thiết bị], chú thích "Điện thoại và máy tính khác cũng phải đăng nhập lại.";
   - [Huỷ].
   - Đăng xuất cũng xoá mã thư mục Drive đã lưu đệm trên máy (A13).
8. Chú thích cuối trang: "WhereToGo {số phiên bản}" (đọc từ `package.json`, hiện là 0.2.0; "0.3.0" trong bản vẽ chỉ là mẫu).

### 10.11 Quyền riêng tư & dữ liệu, và Xoá tài khoản

**Quyền riêng tư & dữ liệu (`#/settings/privacy`)**
- **Nhóm "Bạn đã đồng ý":**
  - "Lưu kho địa điểm · bắt buộc · 17/10/2026", kèm link "Rút lại = xoá tài khoản".
  - "Lưu ảnh vào Google Drive · 17/10/2026", kèm nút [Ngắt kết nối Google Drive]. Đây là **nơi duy nhất** để rút đồng ý lưu ảnh; ngắt Drive cũng tự tắt công tắc "Sao lưu hằng tuần" (ô 3 phụ thuộc ô 2), và khi Drive chưa kết nối công tắc đó bị khoá kèm dòng "Cần kết nối Google Drive trước." (`[CẦN CHỐT CÂU CHỮ]` đề xuất, chưa chốt).
    - Bảng trượt mở ra từ nút này giải thích: "Khoá truy cập bị xoá và Google thu hồi quyền. Ảnh vẫn nằm trong Drive của bạn; trong app, ảnh hiện lại khi bạn kết nối lại."
    - Có thêm ô tick (để trống): "Xoá luôn danh sách ảnh đã gắn vào địa điểm".
  - "Sao lưu hằng tuần": công tắc bật/tắt.
  - [Tải bản ghi đồng ý] (tệp HTML in được).
- **Nhóm "Dữ liệu của bạn":**
  - [Tải bảng tính (CSV)]: bảng địa điểm với các cột Tên, Nhóm, Nhãn, Địa chỉ, Giá từ, Giá đến, Đánh giá, Trạng thái, Độ hot, Link Google Maps, Câu chuyện, Ghi chú, Ngày thêm. Tệp UTF-8 có BOM (dấu đánh dấu đầu tệp) để Excel đọc đúng tiếng Việt.
  - [Tải bản đầy đủ (JSON)] (tệp dữ liệu đầy đủ, dành cho người kỹ thuật hoặc để chuyển sang nơi khác).
  - [Mở thư mục ảnh ↗].
- **Nhóm "Thiết bị":** [Đăng xuất trên mọi thiết bị].
- **[Xoá tài khoản]** (chữ danger) → trang xoá tài khoản.
- Chân trang: "Yêu cầu khác (xem, sửa, hạn chế xử lý): [EMAIL HỖ TRỢ]. Chúng tôi xác nhận trong 2 ngày làm việc." Rồi link tới Chính sách quyền riêng tư và Điều khoản.
- Khi offline (Off): các thao tác bị khoá, kèm banner.

**Xoá tài khoản (`#/settings/privacy/delete`)**
- `h1` "Xoá tài khoản".
- Danh sách "Sẽ bị xoá ngay": địa điểm, nhóm, nhãn, lần đi, lượt vuốt, bản ghi đồng ý, khoá truy cập Google (Google cũng thu hồi quyền).
- Ghi chú cho luật sư: hỏi có phải giữ bản ghi đồng ý sau khi xoá tài khoản để chứng minh không `[KIỂM TRA]`.
- [Tải dữ liệu trước] (nút phụ).
- Ba ô tick, để trống:
  - "Xoá cả thư mục “WhereToGo Photos” trong Google Drive"
  - "Xoá cả thư mục “WhereToGo Backups”"
  - "Tôi hiểu việc xoá không hoàn tác được"
- **[Xoá vĩnh viễn tài khoản]** (nút xoá, nền đỏ đặc) chỉ bật sau khi tick ô cuối. **Không ai phải gõ chữ nào** (gõ chữ "XOÁ" có thể cản trở việc xoá).
- Trạng thái: "Đang xoá…"; lỗi kèm [Thử lại]; xong thì chuyển tới `/?da-xoa=1`; offline thì nút bị khoá, kèm banner.

### 10.12 Quản lý nhóm, Quản lý nhãn

**Quản lý nhóm (`#/settings/categories`)**
- [＋ Nhóm mới] (nút phụ, rộng hết hàng).
- Mỗi hàng: vòng tròn icon · "Quán ăn" · dòng phụ "12 địa điểm · Chán cơm thì ăn gì?" · ⋯ (Sửa, Xoá).
- **Bảng trượt sửa nhóm**
  - Tên (bắt buộc).
  - Câu gợi ý, dòng phụ "Câu lớn trên thẻ nhóm ở Trang chủ. Để trống thì dùng “Hôm nay đi đâu?”".
  - Lưới icon, mỗi ô 44 px, dưới lưới ghi "Đã chọn: Cà phê".
  - **"Xem trước trên Trang chủ"**: một thẻ nhóm thu nhỏ đổi theo từng thay đổi bạn nhập.
- **Xoá bị chặn:** "Chưa xoá được nhóm Quán ăn" / "3 địa điểm chỉ thuộc nhóm này. Chuyển chúng sang nhóm khác trước." [Xem 3 địa điểm]
- `[CẦN CHỐT CÂU CHỮ]` Bảng xác nhận khi xoá nhóm (trường hợp không bị chặn) và khi xoá lần đi. Đề xuất: "Xoá nhóm “Quán uống”?" / "Các địa điểm trong nhóm vẫn còn vì đã thuộc nhóm khác."; "Xoá lần đi 12/07/2026?" / "Lần đi này sẽ bị xoá."

**Quản lý nhãn (`#/settings/tags`)**
- [＋ Nhãn mới] (nút phụ), bấm mở bảng trượt có ô Tên. Đây là chỗ mới để tạo nhãn ngoài form địa điểm (V35).
- Mỗi hàng: "Hẹn hò · 4 địa điểm" · ⋯ (Đổi tên, Xoá). Bấm vào hàng thì mở Tìm kiếm đã lọc theo nhãn đó.
- Xác nhận xoá: "Xoá nhãn “Hẹn hò”?" / "Nhãn sẽ được gỡ khỏi 4 địa điểm. Các địa điểm vẫn còn."
- Trống (E): "Chưa có nhãn nào" / "Nhãn là ghi chú nhỏ để tìm nhanh, như “Hẹn hò” hay “Có chỗ đỗ ô tô”." [Tạo nhãn]

### 10.13 Trợ giúp (`/tro-giup/`)

Trang tĩnh, nằm ngoài app (mở từ Tài khoản bằng link "Trợ giúp & câu hỏi ↗").
- `h1` "Trợ giúp", lời dẫn "Câu trả lời nhanh cho những thắc mắc thường gặp."
- Các nhóm câu hỏi, mỗi nhóm là một khối `<details>` (bấm để mở/đóng):

| Nhóm | Các chủ đề |
|---|---|
| Bắt đầu | Dán link, nhóm và nhãn, vuốt thẻ, bốc thăm |
| Ảnh & Google Drive | Vì sao cần quyền, ảnh nằm đâu, kết nối lại |
| Vị trí & bản đồ | Vị trí có lưu không, cấp quyền theo máy, quán chưa có vị trí |
| Offline | Cái gì xem được khi không có mạng, cái gì cần mạng |
| Cài lên màn hình chính | Cài trên iPhone, Android, máy tính; vì sao phải đăng nhập lại sau khi cài |
| Dữ liệu & xoá tài khoản | Tải dữ liệu về, ngắt Google Drive, xoá tài khoản |
| Đăng nhập | Zalo/Messenger, dòng supabase.co |

- Chân trang: "Chưa có câu trả lời?" [Gửi email tới [EMAIL HỖ TRỢ]]

### 10.14 Hướng dẫn cài (`/cai-ung-dung/` và `#/install`)

Cùng một nội dung ở ba nơi: trang tĩnh `/cai-ung-dung/`, trang trong app `#/install` và bảng trượt Cài app.
- `h1` "Dùng WhereToGo như một app", lời dẫn "Mở nhanh từ màn hình chính, toàn màn hình, không cần App Store."
- Các tab theo nền tảng; tab hợp với thiết bị của người xem được chọn sẵn: iPhone (iOS 26) · iPhone (iOS 16.4–18) · Android · Samsung Internet · Máy tính.
- Các bước được đánh số kèm ảnh chụp màn hình. Các nút trong menu hiện bằng icon Ionicons nằm cùng dòng chữ, không dùng emoji. Các bước của tab iPhone (iOS 26):
  1. "Mở WhereToGo bằng Safari."
  2. "Bấm nút ba chấm ở thanh dưới, rồi bấm Chia sẻ."
  3. "Kéo xuống, chọn “Thêm vào MH chính”."
  4. "Giữ bật “Mở dưới dạng ứng dụng web”, rồi bấm Thêm." `[KIỂM TRA]`
  5. "Mở WhereToGo từ màn hình chính và đăng nhập lại một lần."
- `[CẦN CHỐT CÂU CHỮ]` Bản vẽ mới chốt lời hướng dẫn cho tab iPhone (iOS 26); các tab còn lại viết khi làm và kiểm trên máy thật. Riêng Android, trang giới thiệu đã ghi: "Mở bằng Chrome → nút ba chấm → Cài đặt ứng dụng."
- **Trang tĩnh:** nút [Mở WhereToGo] → `/app/#/install`. Không có nút cài trên trang tĩnh (V33).
- **Trang trong app, trên Android có sự kiện `beforeinstallprompt`** (sự kiện trình duyệt báo app có thể cài): hiện nút [Cài ngay].
- **Đã cài:** icon `checkmark-circle` và dòng "Bạn đang dùng bản đã cài."
- Bản bảng trượt kết thúc bằng nút [Để sau].

### 10.15 Trang 404

Ba biến thể:

| Biến thể | Cách hiện | Nút |
|---|---|---|
| Trong app (route lạ `#/*`) | Icon `compass` trong vòng tròn của trạng thái trống; "Trang này không có trong sổ" / "Có thể link đã cũ hoặc gõ nhầm." | [Về Trang chủ] |
| Địa điểm đã xoá | "Địa điểm này đã bị xoá" / "Có thể bạn đã xoá nó ở máy khác." | [Về Trang chủ] |
| Trang tĩnh `/404.html` | Cùng câu chữ như bản trong app | [Về trang chủ WhereToGo] và [Mở app] |

---

## 11. Việc bắt buộc trước khi mở đăng ký

Hiện app đóng đăng ký (D24): chỉ chủ app đăng nhập được. Đó cũng là biện pháp chống lạm dụng **duy nhất** trong bảng rủi ro của `docs/PLAN.md` (dòng 848: "Tắt đăng ký sau lần đăng nhập đầu (D24); API luôn yêu cầu JWT"). JWT là chuỗi chứng nhận đăng nhập gắn vào mỗi lời gọi API. Bật đăng ký là bỏ biện pháp đó mà chưa có gì thay thế: chưa có giới hạn số lần gọi, chưa có hạn mức dữ liệu cho từng người.

Mục này gồm: 11.1 những việc phải sửa trong code và cài đặt; 11.2 giới hạn của các dịch vụ miễn phí; 11.3 thay đổi của Supabase ngày 2026-10-30; 11.4 Google (chế độ xuất bản, xác minh thương hiệu); 11.5 Luật 91/2025 và Nghị định 356; 11.6 trình duyệt trong ứng dụng chat; 11.7 đợt thử chỉ mời và các tài liệu cũ phải sửa theo. Kết quả rà soát theo commit `ff25e89`.

**Ba điều đáng nhớ**
- **Rủi ro lộ dữ liệu nghiêm trọng nhất không phải sao lưu mà là A1**: địa chỉ chuyển hướng dùng ký tự đại diện `*.trycloudflare.com`. Gỡ nó trước tiên.
- **Sao lưu hằng tuần không làm lộ dữ liệu giữa người dùng.** Job lọc dòng theo `user_id` (`jobs/wheretogo_jobs/backup.py:56-58,83`) và tải mỗi tệp lên Drive của chính người đó bằng khoá truy cập (token) của họ (`backup.py:87-89`). Cả 8 bảng được sao lưu đều có cột `user_id`; bảng mới thiếu cột này sẽ bị bỏ sót chứ không bị lộ. Vấn đề của sao lưu với nhiều người dùng là độ tin cậy và log công khai (A7, A8).
- Để mở an toàn cần năm việc, theo thứ tự:
  1. Dọn cài đặt đăng nhập OAuth (đăng nhập bằng Google) và CORS (quy định trang web nào được gọi API).
  2. Trang giới thiệu công khai cùng Chính sách quyền riêng tư và Điều khoản thật.
  3. Xoá tài khoản, tải dữ liệu, ngắt Drive ngay trong app.
  4. Hạn mức dữ liệu và giới hạn số lần gọi, để bảo vệ DB 500 MB và hạn mức Vercel dùng chung.
  5. Bật lại đăng ký, mời một nhóm nhỏ trước.

### 11.1 Danh sách A1–A14

Cột **Mức** là đánh giá của đợt rà soát: **Phải** = bắt buộc trước khi mở; **Nên** = nên có ngay khi ra mắt; **Tốt** = nên làm nhưng không chặn. Cột **Giai đoạn** là chỗ kế hoạch này xếp việc đó (mục 12). Các dòng **Phải** và **Nên** phải xong trước **[GATE]** bật đăng ký; dòng **Tốt** không chặn (riêng A13 đã xếp vào P5). Ba mã A11, A12 và A14 nằm ngay dưới bảng vì chưa có việc cụ thể cho giai đoạn nào.

| # | Mức | Việc cần làm | Vì sao | Chỗ trong code và tài liệu | Giai đoạn |
|---|---|---|---|---|---|
| A1 | Phải | Xoá `https://*.trycloudflare.com/**` và `http://localhost:5173/**` khỏi Redirect URLs của dự án Supabase bản thật, chỉ giữ địa chỉ chính xác `https://[TÊN MIỀN]/app/`; cho regex tunnel trong CORS không bao giờ khớp ở bản thật | Một dấu `*` khớp mọi tunnel miễn phí của người lạ, nên kẻ xấu lấy được mã đăng nhập của nạn nhân | `docs/SETUP.md:61-64`, `docs/PLAN.md:744`, `server/wheretogo_api/config.py:34`, `server/.env.example` | P4 |
| A2 | Phải | Đặt giới hạn tần suất gọi (rate limit: số lần gọi tối đa trong một khoảng thời gian) bằng một quy tắc trên Vercel WAF (tường lửa web của Vercel) | Hiện không có giới hạn nào, một người có tài khoản Google có thể gọi lặp để dùng hết hạn mức Vercel của mọi người | `server/wheretogo_api/maps_links.py:46-77` (`/api/maps/resolve`), `server/wheretogo_api/routes/photos.py:22-41` (ảnh thu nhỏ), `server/wheretogo_api/routes/google.py` (`/api/google/access-token`) | P6 |
| A3 | Phải | Đặt hạn mức đếm ngay trong DB bằng trigger (đoạn mã DB tự chạy mỗi lần ghi): 1.000 địa điểm mỗi người, 20 ảnh mỗi địa điểm, 50 nhóm, 200 nhãn, 300 lần đi mỗi địa điểm (V30); gom hoặc xoá bớt `swipe_events` | Người dùng ghi thẳng vào DB, nên giới hạn 20 ảnh chỉ nằm ở giao diện là chưa đủ; một đoạn script có thể làm đầy 500 MB và đẩy cả dự án sang chỉ đọc | `supabase/migrations/20260924000100_init_schema.sql:28`, `supabase/migrations/20261016000100_categories_swipes_favorites_story.sql:9` (hiện chỉ có kiểm độ dài chữ) | P6 |
| A4 | Phải | Cho người dùng tự tải dữ liệu, ngắt Drive và xoá tài khoản ngay trong app (V28); khi ngắt hoặc xoá thì thu hồi (revoke) khoá Google | Theo cách đọc ở mục 11.5, Luật 91 và chính sách dữ liệu của Google đòi quyền xoá và rút đồng ý (luật sư xác nhận); hiện chỉ có cách "liên hệ" qua issue GitHub công khai, còn thu hồi ở myaccount.google.com không đăng xuất hay xoá gì | `server/wheretogo_api/routes/google.py` (thêm `DELETE /api/google/credentials`), route mới `DELETE /api/account`, `server/wheretogo_api/credentials_repository.py` (hàm `delete` hiện chỉ gọi khi `invalid_grant`, `google_oauth.py:87-90`), `web/src/features/settings/SettingsPage.tsx`, `web/public/privacy.html:133` | P5 |
| A5 | Phải | Bỏ `prompt=consent` ở mọi lần đăng nhập: đăng nhập thường dùng `select_account`; `consent` chỉ dùng khi xin Drive ở bước 2 onboarding hoặc khi "Kết nối lại Google Drive" (V26) | Mỗi lần đăng nhập Google lại hiện màn đồng ý đầy đủ, làm phiền mọi người dùng | `web/src/features/auth/authService.ts:83-85` | P5 |
| A6 | Phải | Máy chủ kiểm tra quyền `drive.file` đã thật sự được cấp (khi lưu và khi làm mới khoá); thiếu thì trả `google_reauth_required` hoặc mã mới `drive_scope_missing` và app hiện lời mời kết nối lại | Google có thể hiện ô tick riêng cho từng quyền (xem ngay dưới bảng) nên người dùng bỏ tick Drive được, hoặc huỷ giữa chừng; hiện app vẫn báo "đã liên kết" rồi ảnh lỗi chung chung | `server/wheretogo_api/google_oauth.py:93-97` (bỏ qua trường `scope`), `web/src/features/auth/AuthProvider.tsx:36,139` (lần dò Drive) | P5 |
| A7 | Nên | Cho job sao lưu tách lỗi từng người (try/except riêng, log chỉ ghi trạng thái từng người), phân trang `list_user_ids`, tôn trọng công tắc tắt sao lưu (V31) | Một người lỗi (Google thu hồi quyền, Drive đầy, lỗi 5xx) làm dừng sao lưu của mọi người xếp sau; PostgREST (lớp API của Supabase) mặc định cắt ở 1.000 dòng nên người thứ 1.001 trở đi không bao giờ được sao lưu | `jobs/wheretogo_jobs/backup.py:119-124,129-137`, `server/wheretogo_api/credentials_repository.py:70-73` | P6 |
| A8 | Nên | Đặt log của thư viện `httpx` ở mức WARNING trong job (hoặc chuyển job sang repo riêng tư) | Repo công khai nên log GitHub Actions ai cũng đọc được, mà `httpx` ghi mọi URL ở mức INFO; log lộ `user_id`, id thư mục và tệp Drive, số dòng mỗi bảng, tức là lộ số người dùng và tốc độ tăng (chỉ là mã định danh, không phải mật khẩu) | `jobs/wheretogo_jobs/backup.py:52,129`, `.github/workflows/backup.yml` | P6 |
| A9 | Nên | Đổi ràng buộc duy nhất của `drive_file_id` thành `unique (user_id, drive_file_id)` | Ràng buộc duy nhất toàn hệ thống cho phép người này dò hoặc chặn một id mà người khác đã chèn (mức thấp) | `supabase/migrations/20260924000100_init_schema.sql:64` | P6 |
| A10 | Nên | Tách dự án Supabase dev và bản thật; làm file kiểm chỉ trả số tổng hợp; giới hạn hoặc nghỉ hưu `drop_legacy_tags` (chi tiết ngay dưới bảng) | Hiện dev dùng chung dự án thật; file kiểm in dữ liệu từng người; `drop_legacy_tags` xoá nhãn của mọi người | `docs/SETUP.md:61-64,75,165-181`, `supabase/checks/20261016000100_verify.sql:3,8-21,25-32`, `supabase/migrations/20261016000200_drop_legacy_tags.sql:3,17-23` | P4 (tách dự án); hai việc còn lại chưa gán giai đoạn riêng, làm trước **[GATE]** |
| A13 | Tốt | Xoá `cachedFolderId` khi đăng xuất; bỏ việc tự tạo nhóm và nhãn mặc định ngay sau đăng nhập (`web/src/features/auth/AuthProvider.tsx:85-108`); chỉ tạo ở bước 3 của onboarding, theo `user.id`, sau khi đã đồng ý (mục 9.4) | Trên máy dùng chung, người B đăng nhập sau người A (không tải lại trang) bị tải ảnh vào thư mục của A và lỗi mãi, đồng thời không có nhóm hay nhãn mặc định | `web/src/features/google/driveFolderApi.ts:8,14-20`, `web/src/features/auth/authService.ts:98-110`, `web/src/features/auth/AuthProvider.tsx:60,85-89` | P5 |

**A1: kẻ xấu làm gì.**
1. Kẻ xấu mở một tunnel miễn phí (ví dụ `evil.trycloudflare.com`, một đường hầm tạm đưa máy của họ ra internet).
2. Họ dựng link đăng nhập Google có `redirect_to` (địa chỉ quay về sau đăng nhập) trỏ về tunnel đó, rồi gửi cho nạn nhân.
3. Nạn nhân đăng nhập Google như bình thường, nhưng mã đăng nhập (`code`) lại chảy về máy kẻ xấu.
4. Kẻ xấu đổi mã đó lấy phiên đăng nhập của nạn nhân, rồi đổi tiếp lấy quyền `drive.file`.

Cách chặn: chỉ cho phép đúng một địa chỉ. Sau khi bỏ `localhost` và tunnel khỏi dự án thật, việc phát triển cần dự án Supabase riêng (A10). CORS (quy định để trình duyệt cho trang web nào gọi API) ít quan trọng hơn vì API dùng khoá đăng nhập dạng bearer (gửi kèm mỗi lời gọi). Dù vậy, regex mặc định `^https://[a-z0-9-]+\.trycloudflare\.com$` ở `config.py:34` vẫn phải đặt để không khớp ở bản thật (biến `ALLOWED_ORIGIN_REGEX`).

**A2 và A3: hai giới hạn chung của dịch vụ miễn phí.**
- Gói Hobby của Vercel chỉ cho 1 quy tắc WAF mỗi dự án, tính theo IP hoặc JA4 (dấu vân tay của kết nối TLS). Giới hạn theo IP có thể chạm sớm khi nhiều người dùng chung một địa chỉ mạng di động (CGNAT: nhiều thuê bao dùng chung một địa chỉ IP); rủi ro thấp ở quy mô nhỏ.
- Supabase Auth đã tự giới hạn đăng nhập theo IP (mặc định 30 lần trong 5 phút). CAPTCHA (hình kiểm tra "không phải người máy"): chưa thấy tài liệu nói áp dụng cho đăng nhập OAuth `[KIỂM TRA]`, nên cửa chặn thật sự là kiểm tra của Google.
- Tính nhanh cho A3: mỗi địa điểm nặng tối đa khoảng 30 KB, nên khoảng 17.000 lần chèn là đầy 500 MB, và khi đó **cả dự án** chuyển sang chỉ đọc cho mọi người.

**A6: vì sao phải kiểm quyền đã cấp.** Với luồng cũ (xin gộp), khi app xin quyền đăng nhập cơ bản kèm một quyền khác (ở đây là `drive.file`), Google hiện từng quyền kèm ô tick (granular consent: đồng ý chi tiết từng quyền). Với luồng mới (V26), `drive.file` được xin riêng ở bước 2 nên màn Google có thể không còn ô tick riêng `[KIỂM TRA]` bằng tài khoản thử; máy chủ vẫn phải kiểm quyền đã cấp (người dùng huỷ giữa chừng, quyền bị thu hồi). Chính sách OAuth của Google đòi app phải kiểm tra quyền nào đã cấp, không được giả định đã đủ, và phải tắt tính năng liên quan nếu bị từ chối. Thiết kế đã có sẵn chỗ cho tình huống này: bước xin Drive riêng ở onboarding kèm màn "Google chưa cho phép lưu ảnh" (mục 9.3) và trạng thái "thiếu Drive" của form (mục 10.9).

**A10: ba việc trong một mục, cộng một ghi chú về quy trình.**
- Dev và bản thật dùng chung một dự án Supabase và một OAuth client. Gói Free cho 2 dự án nên tách được.
- File kiểm `verify.sql` in `user_id`, tên nhãn và tên nhóm của từng người, và `docs/SETUP.md` bảo chủ app "gửi lại toàn bộ bảng kết quả" vào cuộc trò chuyện. Khi đã có người dùng thật, dán kết quả đó là chia sẻ dữ liệu của người khác. Cần đổi thành chỉ trả số tổng hợp.
- `drop_legacy_tags` xoá các nhãn "Ăn uống", "Vui chơi", "Du lịch" của **mọi** người, trong khi đầu file ghi "An toàn khi chạy lại". Sau ra mắt, chạy lại sẽ xoá thầm các nhãn người mới tự đặt trùng tên. File này cũng là bước 6 của cài mới (`docs/SETUP.md:75`). Cần giới hạn trong nhóm người nó viết cho, hoặc bỏ hẳn.
- Ghi chú về quy trình: migration hiện là dán tay vào SQL Editor, không có môi trường thử, và `docs/SETUP.md:165-181` nhờ chủ app kiểm bằng mắt. Nên chuyển sang Supabase CLI và sao lưu trước mỗi lần chạy (đợt rà soát xếp vào việc vận hành, xem cuối 11.2).

**Ba mã còn lại, mức "Tốt", chưa gán giai đoạn**
- **A11, chính sách bảo mật nội dung (CSP).** GitHub Pages không đặt được header phản hồi, nên CSP phải là thẻ `<meta>` trong `web/index.html` (hiện chưa có). Phiên đăng nhập của supabase-js nằm trong `localStorage`, nên một lỗi chèn mã (XSS) có thể làm lộ khoá đăng nhập.
- **A12, kiểm duyệt nội dung.** Chưa cần, vì mọi dữ liệu còn riêng tư và chưa có tính năng chia sẻ. Mọi chính sách RLS (quy tắc DB cho mỗi người chỉ đọc và ghi dòng của chính mình) hiện đều là `owner_all`. Nếu sau này có chia sẻ công khai thì mô hình riêng tư và RLS đều phải làm lại (xem thêm đoạn "mạng xã hội" ở 11.5).
- **A14, rủi ro danh tiếng của OAuth client.** Nếu app bị lạm dụng, Google có thể đình chỉ OAuth client, và khi đó Drive của mọi người ngừng chạy. Đó là thêm một lý do cho A2 và A3.

### 11.2 Giới hạn của dịch vụ miễn phí

| Dịch vụ | Giới hạn | Chạm trần thì sao | Cần làm |
|---|---|---|---|
| Vercel Hobby (chạy API) | Chỉ dùng cá nhân, phi thương mại. Mỗi tháng: 1 triệu lần gọi hàm · 4 giờ CPU hoạt động · 360 GB-giờ bộ nhớ · 100 GB truyền dữ liệu nhanh | API dừng với **mọi người**: ảnh, ảnh thu nhỏ, khoá Drive, giải link Maps | Giữ app miễn phí, không quảng cáo; A2; theo dõi mức dùng (P6) |
| Supabase Free | 50.000 người dùng hoạt động mỗi tháng · DB 500 MB · egress (dữ liệu đi ra khỏi Supabase) 5 GB mỗi tháng cho cả tổ chức · lưu trữ tệp 1 GB · 2 dự án · tạm dừng sau 1 tuần không hoạt động · không có sao lưu tự động | Vượt 500 MB: **cả dự án chuyển sang chỉ đọc**, không ai ghi được | A3; theo dõi egress và dung lượng; xem lại hạn mức khi DB qua 250 MB (Q8) |
| GitHub Pages | Giới hạn mềm 100 GB băng thông mỗi tháng; không được dùng để chạy dịch vụ thương mại | — | App miễn phí, phi thương mại thì ổn |
| GitHub Actions (job sao lưu và keepalive) | Repo công khai 60 ngày không có commit thì GitHub tự tắt lịch chạy | Sao lưu dừng thầm lặng | Theo dõi lịch chạy; nếu bị tắt: tab Actions → chọn workflow → Enable workflow (`docs/SETUP.md:190`) |
| Google Drive API | 1.000.000 đơn vị mỗi phút mỗi dự án | — | Không đáng lo |

**Ghi chú**
- **Vercel "phi thương mại".** "Thương mại" là mọi khoản lợi ích tài chính: quảng cáo, thanh toán, link tiếp thị liên kết, được trả tiền để làm app; riêng tiền ủng hộ thì các phiên bản tài liệu của Vercel ghi không thống nhất. App miễn phí không quảng cáo thì ổn; kiếm tiền dưới bất kỳ hình thức nào thì phải chuyển sang gói Pro và xét lại điều khoản GitHub Pages. Điều khoản gói Hobby còn cho phép Vercel dùng "Your Content" (nội dung của bạn) để huấn luyện AI. `[KIỂM TRA]` đọc lại điều khoản Vercel hiện hành trước khi mở.
- **Mỗi ảnh thu nhỏ chưa có trong bộ đệm** tốn 1 lần gọi hàm, 1 lần hỏi Drive và 1 lần tải ảnh (`server/wheretogo_api/routes/photos.py:22-41`).
- **Egress của Supabase.** `listPlaces()` lấy mọi địa điểm kèm dữ liệu liên quan (nhóm, nhãn, ảnh…), không phân trang (`web/src/features/places/placeRepository.ts:125-133`), và tải lại mỗi khi bạn quay lại cửa sổ app sau hơn 30 giây (`web/src/app/queryClient.ts:44,52-55`). Mặc định PostgREST cắt ở 1.000 dòng, nên người có hơn 1.000 địa điểm sẽ bị cắt mất âm thầm; hạn mức 1.000 địa điểm của V30 cũng nằm đúng ngưỡng này. Phân trang danh sách để giảm egress là việc mức "Tốt".
- **Có lưu lượng thật thì DB không còn bị tạm dừng**, nên job keepalive trở thành tuỳ chọn.
- **Không có sao lưu tự động.** Bản sao lưu duy nhất là tệp JSON hằng tuần trong Drive của từng người (nếu họ bật, V31); chủ app không có cách khôi phục cấp DB. Một bản sao lưu cấp DB sẽ chứa dữ liệu của mọi người trong kho của chủ app, nên phải mã hoá và công bố. Cũng chưa có tính năng nhập hay khôi phục từ các tệp JSON này, và kế hoạch này chưa có giai đoạn nào làm.
- **Tất cả dữ liệu mọi người đi qua máy chạy của GitHub mỗi tuần** khi job sao lưu chạy, nên GitHub là một bên xử lý dữ liệu và phải được ghi trong Chính sách quyền riêng tư (mục 5).
- **Khoá mã hoá `TOKEN_ENCRYPTION_KEY`** dùng chung giữa Vercel và GitHub Actions (`docs/SETUP.md:102,131`). Mất hoặc đổi khoá thì mọi người phải kết nối lại Drive (`docs/SETUP.md:85`). Nên có đường xoay khoá bằng `MultiFernet` (cho phép dùng khoá mới mà vẫn giải mã được dữ liệu cũ); mức "Tốt".
- **Migration và môi trường.** Chuyển migration sang Supabase CLI, sao lưu trước mỗi lần chạy, và tách dự án dev khỏi bản thật (A10). Gói Free cho 2 dự án.
- **Theo dõi lỗi.** Lỗi hiện chỉ in ra console. Cần thêm theo dõi lỗi và cảnh báo mức dùng cho Vercel, Supabase và các workflow theo lịch (P6 có "theo dõi mức dùng").

### 11.3 Supabase đổi cách cấp quyền cho bảng mới (2026-10-30)

Còn 13 ngày kể từ ngày viết kế hoạch này (2026-10-17).

- **Thay đổi.** Với các dự án đang chạy, bảng **mới** trong schema `public` sẽ không còn tự được mở ra cho Data API (PostgREST và GraphQL, tức là đường app gọi thẳng vào DB) nếu không có lệnh `GRANT` (cấp quyền) rõ ràng. Bảng đã có thì giữ nguyên quyền.
- **Hệ quả cho kế hoạch này.** Bảng `consents` (V27) và mọi bảng thêm sau (ví dụ bảng hồ sơ) phải kèm `GRANT` ngay trong migration. Thiếu thì app nhận lỗi `42501` (không đủ quyền).
- **Mẫu để chép.** Các migration hiện có đã viết `grant` tường minh cho đúng vai trò cần dùng: `supabase/migrations/20260924000200_rls_and_grants.sql:67-73` và `supabase/migrations/20261016000100_categories_swipes_favorites_story.sql:129-135`.
- `[KIỂM TRA]` mở bản tin thay đổi của Supabase (mục 15) trước khi viết migration của P5.

### 11.4 Google: chế độ xuất bản và xác minh thương hiệu

**Tóm lại cho bạn.** Theo tài liệu Google (đọc qua tóm tắt tìm kiếm; `[KIỂM TRA]` trong Verification Center của dự án), quyền `drive.file` thuộc loại "không nhạy cảm" nên Google không bắt xét duyệt, không hiện cảnh báo "ứng dụng chưa xác minh" và không giới hạn số người dùng. Cái bạn phải chọn là chuyện khác: màn hình đồng ý của Google sẽ ghi tên miền `[MÃ DỰ ÁN].supabase.co` thay vì "WhereToGo" cho tới khi bạn xác minh thương hiệu, mà xác minh thương hiệu cần tên miền riêng.

**Chế độ Testing và In production** (Google Cloud Console → Google Auth Platform)

| | Testing (đang thử) | In production (đã xuất bản) |
|---|---|---|
| Số người dùng | Tối đa 100 người dùng thử, thêm tay từng người (con số này chỉ thấy ở nguồn bên thứ ba) | Quyền chỉ ở mức cơ bản và không nhạy cảm nên không có cảnh báo "chưa xác minh" và không có trần 100 người dùng mới trọn đời của dự án (trần này chỉ áp cho quyền nhạy cảm hoặc bị hạn chế) |
| Khoá làm mới (refresh token) | Hết hạn sau 7 ngày. WhereToGo xin `drive.file` ngoài quyền đăng nhập cơ bản nên (theo trí nhớ của người rà soát về hướng dẫn OAuth, chưa mở được trang gốc `[KIỂM TRA]`) mọi người dùng đều bị ảnh hưởng | Thường không hết hạn, trừ khi bị thu hồi hoặc lâu không dùng (thường khoảng 6 tháng) |
| Dùng cho app công khai? | Không | Có: đặt Audience = External, bấm Publish app → In production |

- Repo giả định app đã ở In production (`docs/SETUP.md:44`, `docs/PLAN.md:733`), nhưng không có gì kiểm chứng. `[KIỂM TRA]` `[USER]` mở Google Cloud Console và xác nhận trạng thái xuất bản là In production.
- Quyền `openid`, `userinfo.email`, `userinfo.profile` là quyền đăng nhập cơ bản; `drive.file` xếp loại "Recommended / Non-sensitive". Không có bước xét duyệt quyền nhạy cảm và không có đánh giá bảo mật CASA (bước kiểm tra an ninh Google đòi với quyền bị hạn chế).

**Xác minh thương hiệu (brand verification) là gì và vì sao vướng**
- Là bước nhẹ để màn hình đồng ý hiện **tên và logo** của app. Chưa xác minh thì Google hiện tên miền của máy chủ đăng nhập, ở đây là `[MÃ DỰ ÁN].supabase.co` ("tiếp tục tới …"). Chính Supabase nói tên miền đó "không gây được lòng tin".
- **Không xác minh được `supabase.co`** vì bạn không sở hữu nó. Công cụ kiểm của Google báo "tên app không khớp trang chủ" vì màn đồng ý vẫn hiện tên miền Supabase, nên một số báo cáo trên diễn đàn nói bị kẹt ở bước này.
- **Tên miền `…github.io` gần như chắc chắn không dùng được** để xác minh thương hiệu (theo hướng dẫn của Google và vài báo cáo diễn đàn, không phải tuyên bố chính thức; một nguồn khác cho rằng github.io xác minh được trong Search Console `[KIỂM TRA]`). Google khuyên trang chủ và chính sách không nên đặt ở nền tảng bên thứ ba mà bạn không chứng minh được quyền sở hữu tên miền phụ, và đã có trường hợp email từ chối nêu đích danh github.io. Vì vậy bước này cần tên miền riêng [TÊN MIỀN] (V3, Q1).
- **Tải logo lên là bắt đầu yêu cầu xác minh** (theo báo cáo của người dùng). Vì thế V29 quy định: không tải logo.
- **Yêu cầu với trang chủ website (trang giới thiệu):** công khai, nằm trên tên miền đã xác minh, mô tả đầy đủ chức năng, nói vì sao xin dữ liệu, **không chỉ là trang đăng nhập**, có link Chính sách quyền riêng tư trùng với link khai trên màn đồng ý. Đã có trường hợp bị từ chối chỉ vì trang chủ website không có link quyền riêng tư; thêm link ở chân trang nhìn thấy được khi chưa đăng nhập là đạt. Trang giới thiệu ở mục 8 viết ra để đáp ứng đúng các yêu cầu này: HTML tĩnh, có mô tả, chân trang có link, chữ "WhereToGo" hiện thật trên trang.
- **Chính sách quyền riêng tư** phải nằm cùng tên miền với trang chủ. **Điều khoản:** các nguồn của Google ghi không thống nhất (một trang gọi là "tuỳ chọn", trang trợ giúp Branding lại ghi là bắt buộc với app production bên ngoài), nên cứ có trang Điều khoản.
- **Tên app** phải khớp đúng "WhereToGo" với chữ hiện trên trang chủ website (chữ nhìn thấy, không chỉ metadata).
- **Tên miền được uỷ quyền (authorized domains):** mỗi tên miền phải được xác minh trong Google Search Console bởi người có quyền Owner hoặc Editor của dự án; nên dùng thuộc tính Domain xác minh bằng DNS. Tối đa 10 tên miền. `docs/SETUP.md:43` hiện liệt kê `[MÃ DỰ ÁN].supabase.co`, tên miền bạn không xác minh được.
- Sau khi nộp, xác minh mất khoảng 2–3 ngày làm việc.
- Nút Google phải theo hướng dẫn thương hiệu của Google, và đó cũng là điều kiện để được xác minh (mục 6.8).

**Ba đường đi (Q2)**

| Đường | Chi phí | Màn Google hiện | Ghi chú |
|---|---|---|---|
| **(a) Ra mắt chưa xác minh, không logo** (mặc định khuyến nghị, V29) | 0 | "tiếp tục tới `[MÃ DỰ ÁN].supabase.co`" | Trang đăng nhập có dòng giải thích trước nút (mục 9.1); câu hỏi thường gặp cũng có (mục 10.13). Theo cách đọc của người rà soát, vẫn xuất bản In production được với quyền không nhạy cảm và không logo; `[KIỂM TRA]` trong Verification Center của dự án |
| (b) Supabase Pro cộng tên miền riêng của Supabase | Khoảng 35 USD mỗi tháng (khoảng 25 USD gói Pro cộng khoảng 10 USD tên miền) | Tên miền của bạn thay cho `supabase.co` trên màn đồng ý | Là cách để màn đồng ý nêu tên miền của bạn; vẫn phải làm các bước xác minh thương hiệu ở trên |
| (c) Viết lại phần đăng nhập, dùng nút Google riêng với `signInWithIdToken` | 0 | Tên site của bạn thay cho tên miền Supabase | Chưa rõ cách này có lấy được khoá làm mới offline cho `drive.file` hay không; cần một đợt thử nghiệm riêng, xếp vào dòng "Sau này" (mục 12) |

### 11.5 Luật Bảo vệ dữ liệu cá nhân 91/2025 và Nghị định 356

> **Không phải tư vấn pháp lý.** Đây là ghi chú thực hành, gom từ các bản tóm tắt công khai (người rà soát đọc qua kết quả tìm kiếm, không mở được văn bản gốc). Luật sư phải đọc lại các ô đồng ý, Chính sách quyền riêng tư, Điều khoản và hồ sơ chuyển dữ liệu ra nước ngoài trước khi mở (P0, Q10).

- **Hiệu lực.** Luật 91/2025/QH15 thông qua ngày 26/6/2025 và có hiệu lực từ 01/01/2026. Nghị định 356/2025/NĐ-CP (ngày 31/12/2025) hướng dẫn thi hành và thay Nghị định 13/2023. Hoạt động đã bắt đầu theo Nghị định 13 nhìn chung có thể tiếp tục mà không cần xin đồng ý lại.
- **Phạm vi.** Luật áp dụng cho cơ quan, tổ chức, cá nhân Việt Nam, nên một cá nhân chạy app công khai nằm trong phạm vi. Người rà soát không thấy ngoại lệ "dùng cá nhân hay hộ gia đình" nào che được một app mở cho công chúng.
- **Đồng ý (Điều 9).** Phải rõ ràng và cho **riêng từng mục đích**; im lặng hoặc không phản hồi không phải đồng ý, nên không được tick sẵn; phải ở dạng in hoặc sao chép được (bản điện tử là được); bên kiểm soát dữ liệu (người quyết định dữ liệu dùng vào việc gì, ở đây là chủ app) phải chứng minh được đã có đồng ý. Trước khi xin, phải cho người dùng biết: loại dữ liệu, mục đích, ai là bên kiểm soát, quyền và nghĩa vụ của họ. Thiết kế nhằm đáp ứng điều này bằng 4 ô để trống, bảng `consents` kèm phiên bản và thời gian, và bản ghi đồng ý tải về được (V27, mục 9.2). Luật sư phải xác nhận thiết kế này đủ theo Điều 9 trước khi mở `[KIỂM TRA]`.
- **Quyền của người dùng:** được biết; đồng ý và rút đồng ý; xem và truy cập; sửa; xoá; hạn chế; phản đối; nhận lại dữ liệu của mình; khiếu nại, khởi kiện, đòi bồi thường. Bên kiểm soát phải "tạo điều kiện, không cản trở".

**Hạn trả lời theo Nghị định 356**

| Yêu cầu | Hạn | Nếu có bên xử lý hoặc bên thứ ba |
|---|---|---|
| Xác nhận đã nhận bất kỳ yêu cầu nào | 2 ngày làm việc | — |
| Rút đồng ý, hạn chế xử lý, phản đối | 15 ngày | 20 ngày |
| Xoá dữ liệu | 20 ngày | 30 ngày |
| Xem (truy cập), sửa | 10 ngày | 15 ngày |

- Được gia hạn một lần, kèm lý do báo cho người dùng. Nguồn không nói rõ các hạn "ngày" ngoài hạn xác nhận là ngày dương lịch hay ngày làm việc; hỏi luật sư.
- Vì tải về, ngắt Drive và xoá tài khoản làm thẳng trong app (V28), các hạn này chủ yếu áp cho yêu cầu gửi qua [EMAIL HỖ TRỢ]. Chính sách quyền riêng tư nêu các hạn này (mục 5).

**Các mốc khác của luật**

| Việc | Hạn | Ghi chú |
|---|---|---|
| Hồ sơ đánh giá tác động chuyển dữ liệu ra nước ngoài | Trong 60 ngày kể từ lần chuyển đầu tiên, nộp cho cơ quan chuyên trách | Dùng Supabase, Vercel, Google để xử lý dữ liệu thu ở Việt Nam được tính là chuyển ra nước ngoài. Ngoại lệ cho dịch vụ đám mây chỉ nói về dữ liệu nhân viên; ưu đãi cho doanh nghiệp nhỏ ở mục này chưa rõ. **Rủi ro cần luật sư xem.** Xếp ở P6 và Q10 |
| Báo vi phạm dữ liệu | Trong 72 giờ, báo cho A05 (Bộ Công an) | Nêu bản chất vi phạm, dữ liệu bị ảnh hưởng, hậu quả có thể và biện pháp khắc phục. Nên có sẵn một ghi chú nội bộ về cách xử lý sự cố (đợt rà soát gợi ý; chưa gán giai đoạn) |
| Ân hạn cho doanh nghiệp nhỏ và khởi nghiệp | 5 năm kể từ 01/01/2026 | Chưa rõ có áp dụng cho một cá nhân không đăng ký kinh doanh hay không |

**Những điểm thực hành khác**
- **Vị trí là dữ liệu nhạy cảm** (theo các nguồn, vị trí lấy qua dịch vụ định vị nằm trong danh mục nhạy cảm của Nghị định 356, cần đồng ý rõ ràng). App gọi `navigator.geolocation` ở `web/src/features/location/geolocation.ts:53` (Gần tôi) và `web/src/features/places/PlaceFormPage.tsx:234` (điền toạ độ cho quán). Vì vậy: chỉ hỏi vị trí đúng lúc, giải thích trước, và nói rõ có lưu hay không (V37; mục 9.2 và 10.5). Thiết kế hiện chỉ dùng hộp thông tin ở bước 1 cộng hộp xin quyền của trình duyệt; luật sư quyết định có cần thêm ô đồng ý riêng, không bắt buộc, cho vị trí hay không `[KIỂM TRA]`. Nếu cần thì thêm vào 9.2 và V27.
- **Doanh nghiệp nhỏ.** Doanh nghiệp siêu nhỏ và hộ kinh doanh được miễn bổ nhiệm DPO (cán bộ phụ trách bảo vệ dữ liệu) và miễn đánh giá tác động, nhưng quyền miễn này mất nếu xử lý dữ liệu nhạy cảm, có hơn khoảng 100.000 người, hoặc bán dịch vụ xử lý dữ liệu. Một cá nhân không đăng ký kinh doanh thì chưa rõ; hỏi luật sư.
- **Trẻ em.** Trẻ em là người dưới 16 tuổi (Luật Trẻ em 2016). Tiết lộ dữ liệu của trẻ cần đồng ý của trẻ (7 đến 15 tuổi) và của cha mẹ hoặc người giám hộ; một bản tóm tắt nói luật mới đòi đồng ý của cha mẹ với người dưới 16. Cách thực hành: điều khoản "16+" (Q9), nằm ở ô 4 của bước đồng ý.
- **Tránh trở thành "mạng xã hội".** Nghị định 147/2024 đòi tài khoản mạng xã hội phải xác thực bằng số điện thoại Việt Nam hoặc giấy tờ cá nhân. Giữ mỗi kho là riêng của một người, không đăng bài công khai, trừ khi bạn chấp nhận gánh yêu cầu đó. Đây cũng là lý do câu hỏi thường gặp ghi "Chưa. Mỗi kho là riêng của một người."
- **Cookie.** Nếu không có công cụ theo dõi hay phân tích thì không cần biểu ngữ cookie (suy luận của người rà soát, không phải quy tắc có nguồn). Chính sách vẫn nên ghi dữ liệu lưu trên máy: phiên đăng nhập trong `localStorage`, IndexedDB trong 7 ngày và Cache Storage cho ảnh thu nhỏ, xoá khi đăng xuất.

### 11.6 Trình duyệt trong ứng dụng chat

- **Vấn đề.** Zalo, Messenger, Facebook, Instagram, TikTok mở link trong trình duyệt nhúng (webview). Google chặn đăng nhập OAuth trong trình duyệt nhúng (lỗi `403 disallowed_useragent`, theo chính sách "dùng trình duyệt an toàn"). Có báo cáo với Messenger, Instagram và TikTok; chưa thấy báo cáo riêng về Zalo, nhưng rất có khả năng cũng bị.
- **Vì sao quan trọng ở Việt Nam.** Link thường được chia sẻ qua Zalo và Messenger, nên nhiều lần ghé đầu tiên của người lạ sẽ bắt đầu ở đó. Các trình duyệt nhúng này cũng không cài app lên màn hình chính được.
- **Cách xử lý đã chọn (V32).** Phát hiện theo user agent và hiện lớp chặn "Mở bằng Safari hoặc Chrome để đăng nhập" ở `/`, `/cai-ung-dung/` và `/app/`. Chi tiết nhận diện, lời hướng dẫn cho từng app và nút [Sao chép link] ở mục 9.7.
- `[KIỂM TRA]` tên menu "mở bằng trình duyệt" của từng app chat (mục 9.7) và thử đăng nhập từ Zalo và Messenger thật trước khi mở.
- **Cài app rồi phải đăng nhập lại.** App đã cài lên màn hình chính trên iPhone có kho lưu trữ riêng; phiên đăng nhập (nằm trong `localStorage`) không tự sang. Hướng dẫn cài vì vậy ghi "cài trước, rồi đăng nhập" (mục 10.14).

### 11.7 Đợt thử chỉ mời và tài liệu cũ phải sửa

**Đợt thử chỉ mời (V2, Q4)**
- Để đăng ký vẫn tắt, tạo sẵn người dùng trong dashboard Supabase với email đã xác nhận. Supabase tự liên kết danh tính Google với người dùng đã có cùng email đã xác minh.
- Chưa xác nhận được việc liên kết này có chạy khi đăng ký đang tắt hay không. `[KIỂM TRA]` bằng một tài khoản Google phụ trước khi mời ai (Q4).
- Trong đợt thử, người chưa được mời sẽ thấy câu: "WhereToGo đang mở thử cho một nhóm nhỏ. Gửi email tới [EMAIL HỖ TRỢ] để được mời." (mục 9.1).

**Tài liệu và code cũ phải sửa khi bật đăng ký** (làm trong P6)

| Chỗ | Nội dung cũ | Sửa thành |
|---|---|---|
| `docs/PLAN.md:38` | D24: tắt đăng ký sau lần đăng nhập đầu | Thay bằng V2 |
| `docs/PLAN.md:848` | Bảng rủi ro, dòng "Người lạ đăng ký dùng app" | Cập nhật theo các biện pháp mới: A2, A3, hạn mức DB, WAF |
| `docs/SETUP.md:155-159` | Bước 10: "TẮT Allow new users to sign up" | Cập nhật theo V2: đợt thử chỉ mời rồi bật đăng ký |
| `docs/PLAN.md:885` | Nghiệm thu D-13: đăng nhập tài khoản Google khác thì bị từ chối | Cập nhật theo V2 |
| `web/src/features/auth/authRedirectError.ts:11-12,42-43` | `signup_disabled` → "…hãy đăng nhập bằng tài khoản của chủ app." | Câu của đợt thử ở trên; sau khi mở hẳn thì bỏ |
| `docs/SETUP.md:41-44` | Trang chủ, quyền riêng tư và tên miền được uỷ quyền đặt ở `github.io` và `supabase.co` | Chuyển sang [TÊN MIỀN] (mục 8, 11.4) |
| `web/public/privacy.html` | Bản chính sách cho "ứng dụng cá nhân" | Chuyển sang `/quyen-rieng-tu/` bằng meta refresh (mục 5) |

---

## 12. Các giai đoạn

Mỗi giai đoạn có thể phát hành riêng. Cỡ việc cho một người làm: **S** từ 1 ngày trở xuống, **M** 2–4 ngày, **L** 5–8 ngày. `P0`–`P7` là giai đoạn (không phải mặc định P1–P37 của PLAN-UI-1).

| # | Giai đoạn | Giao gì | Việc chính | Phụ thuộc | Cỡ |
|---|---|---|---|---|---|
| P0 | Việc của bạn (làm song song từ ngày 1) | Các quyết định | Mua [TÊN MIỀN]; tạo [EMAIL HỖ TRỢ]; hẹn luật sư đọc các ô đồng ý, Chính sách, Điều khoản và hồ sơ chuyển dữ liệu ra nước ngoài; trả lời Q1–Q5 | — | Thời gian của bạn |
| P1 | Một giao diện | Mọi màn đang có theo diện mạo mới; sáng, tối và chọn tay; trang 404; màn chờ khởi động | `tokens.css` và bộ sinh ra nó; đổi phông; xoá `dark.system.css`, `themes.css` và prop theme; `WtgPage`, `WtgSheet`, Chip, Field, Button, Banner, EmptyState, PhotoTile; ghi đè Ionic; sàn chữ 12 px; độ rộng nội dung; giảm chuyển động; kiểm mọi lớp phủ của Ionic ở chế độ tối | — | M (4) |
| P2 | Trang thật | Mỗi lối vào ở Trang chủ dẫn tới một trang riêng | Dock có chữ, dải ảnh nhóm, danh sách việc; `PlaceRow` và `PlaceGrid` thay `PlaceListPage`; Trang chọn quán; Tìm kiếm (trạng thái nằm trong URL, so khớp không phân biệt dấu, bảng lọc); Yêu thích; làm lại Chi tiết, trình xem ảnh và bảng thông tin dùng chung; Bốc thăm; chỉnh lại Vuốt (bảng thông tin, Hot, bảng lọc, cuộn, phím tắt); vòng bút đỏ; trang hỏi và danh sách của Gần tôi | P1 | L (8) |
| P3 | Form, quản lý, máy tính | Sửa dữ liệu tốt hơn; bố cục cho máy tính | Form chia phần, nút lưu dính đáy, bảng giờ mở cửa, mặc định "Chưa rõ giờ", chặn mất thay đổi, cuộn tới chỗ lỗi; Quản lý nhóm (xem trước, ⋯) và nhãn (tạo mới); toast AddVisit; cột bên `IonSplitPane`; phím tắt | P2 | M (4) |
| P4 | Nhà mới | App ở [TÊN MIỀN]/app/ cùng site công khai tĩnh | Bản "chuyển nhà" ra trước; CNAME; tách bản build; manifest và cài đặt Workbox; ngân sách precache tổng; các trang tĩnh và lớp chặn trình duyệt; A1 (redirect chính xác, CORS, bỏ regex tunnel); tách dự án Supabase dev và bản thật; origin và URL phía Google | P0 (tên miền), P1 | M (4, cộng thời gian chờ DNS) |
| P5 | Đăng nhập & quyền dữ liệu | Mọi thứ một người dùng công khai cần | Trang đăng nhập; bảng `consents` kèm `GRANT`; onboarding, đồng ý lại và chặn khi offline; xin `drive.file` bổ sung có kiểm quyền; bỏ `prompt=consent` ở đăng nhập thường (A5, A6); điểm cuối (endpoint) trên máy chủ `DELETE /api/account` (đúng thứ tự: xoá thư mục Drive nếu người dùng đã tick, rồi thu hồi khoá Google, rồi xoá tài khoản bằng quyền admin) và `DELETE /api/google/credentials`; xuất CSV và JSON; Tài khoản, Quyền riêng tư & dữ liệu, Xoá tài khoản, Giới thiệu; bảng Đăng xuất; trang và bảng Cài app; `RequireAuth` cho phép `#/install`, `#/login` và trang 404 khi chưa đăng nhập; gỡ việc tự tạo nhóm/nhãn lúc đăng nhập và chuyển vào bước 3 onboarding theo `user.id`; xoá bộ đệm thư mục Drive khi đăng xuất (A13) | P4; câu chữ đã được luật sư duyệt | L (8, gồm 3 ngày làm server) |
| P6 | Mở cửa | **[GATE]: bật đăng ký** (đợt thử chỉ mời đi trước) | Trigger hạn mức trong DB và gom `swipe_events`; quy tắc WAF của Vercel; sao lưu tách theo người, phân trang, tắt bật được, log ít (A7, A8); ảnh duy nhất theo từng người (A9); theo dõi mức dùng; câu chữ đăng ký; Google "In production" **không logo**; sửa D24, SETUP, D-13; luật sư cho ý kiến có phải nộp hồ sơ chuyển dữ liệu ra nước ngoài không; nếu phải, bạn và luật sư nộp (các nguồn ghi: trong 60 ngày kể từ lần chuyển đầu tiên) `[KIỂM TRA]` | P5 | M (3) |
| P7 | Bản đồ | Bản đồ cho Gần tôi | MapLibre là phần tải lười, để ngoài precache và đưa vào cache runtime; kiểu bản đồ OpenFreeMap; ghim gom cụm với vùng bấm nới rộng; bảng thông tin; nút chuyển sang danh sách; phương án dự phòng khi không có WebGL, khi offline và khi lỗi tải ô bản đồ; bảng kết quả trên máy tính; ghi công nguồn | P2, P4 | L (5) |
| Sau này | — | — | Thử nghiệm đăng nhập Google có thương hiệu bằng Google Identity Services và `signInWithIdToken` (đường c ở 11.4); nhập từ Google Takeout; link chia sẻ | — | — |

**Tổng cộng khoảng 36 ngày làm việc** (4 + 8 + 4 + 4 + 8 + 3 + 5), tức khoảng 7–8 tuần cho một người, chưa tính thời gian bạn chờ DNS, luật sư và Google, và đợt thử chỉ mời khoảng 2 tuần (Q4) trước khi bật đăng ký.
- **Thứ tự làm:** P1, P2, P3, P4, P5, P6, rồi P7. P0 làm song song từ ngày 1 vì tên miền (cần cho P4) và luật sư (cần cho P5) là hai thứ phải chờ người khác.
- **Chỉ mở đăng ký sau P6.** Mở ngay sau P4 sẽ đưa các màn cũ trước mặt người lạ, nên không khuyến nghị (Q3).
- **Bản đồ (P7) nằm sau cổng** vì danh sách Gần tôi đã ra ở P2 (V19).

**Đường phụ thuộc**

```
P0 (tên miền) ───────────────► P4
P0 (luật sư duyệt câu chữ) ──────────────► P5
P1 ──► P2 ──► P3
P1 ──► P4 ──► P5 ──► P6 [GATE]
P2 + P4 ──► P7
```

**Việc chỉ bạn làm được** `[USER]`

| Giai đoạn | Việc của bạn |
|---|---|
| P0 | Mua [TÊN MIỀN] (Q1); tạo [EMAIL HỖ TRỢ]; hẹn luật sư; trả lời Q1–Q5 |
| P4 | Mở các bản app đã cài một lần để nhận bản "chuyển nhà"; trỏ DNS của [TÊN MIỀN] về GitHub Pages (CNAME); đặt `ALLOWED_ORIGINS` và `ALLOWED_ORIGIN_REGEX` (không khớp tunnel) trong Vercel; đặt Site URL và Redirect URL chính xác trong Supabase, xoá mục tunnel và localhost khỏi dự án thật; cập nhật origin, tên miền được uỷ quyền, link trang chủ website, quyền riêng tư, điều khoản trong Google Cloud Console; thêm thuộc tính Domain (xác minh bằng DNS) trong Search Console |
| P5 | Gửi câu chữ ô đồng ý, Chính sách, Điều khoản cho luật sư và nhận lại bản đã duyệt |
| P6 | Đưa Google sang "In production" (không logo) `[KIỂM TRA]`; mời đợt thử và thử việc liên kết tài khoản `[KIỂM TRA]`; bật "Allow new users to sign up" khi đã qua đợt thử; cùng luật sư quyết định và (nếu cần) nộp hồ sơ chuyển dữ liệu ra nước ngoài `[KIỂM TRA]`; xác nhận **[GATE]** |

**[GATE] — dừng, chờ bạn xác nhận trước khi bật đăng ký.** Cần đủ các điều sau:
1. P4 và P5 xong: tên miền chạy, A1 đã sửa, đã bỏ `prompt=consent` ở đăng nhập thường và máy chủ kiểm quyền `drive.file` (A5, A6), đăng nhập, đồng ý và quyền dữ liệu (tải về, ngắt Drive, xoá) hoạt động trên bản thật.
2. P6 xong: hạn mức trong DB, quy tắc WAF, sao lưu tách theo người và log yên lặng (A2, A3, A7, A8, A9); file kiểm `verify.sql` chỉ còn trả số tổng hợp và `drop_legacy_tags` đã được giới hạn hoặc bỏ (hai việc còn lại của A10).
3. Luật sư đã duyệt các ô đồng ý, Chính sách và Điều khoản, và đã cho ý kiến về hồ sơ chuyển dữ liệu ra nước ngoài (có phải nộp hay không, nộp khi nào); [EMAIL HỖ TRỢ] đã hoạt động; các ô Branding của Google (trang chủ website, Chính sách quyền riêng tư, Điều khoản) đã điền.
4. `[KIỂM TRA]` đã làm: Google ở In production; việc Google liên kết tài khoản khi đăng ký đang tắt; đăng nhập thử từ Zalo và Messenger thật.
5. Đợt thử chỉ mời (khoảng 20 người, 2 tuần, Q4) đã chạy, và bạn đã hỏi người thử: "Có lúc nào bạn bị kẹt không?" (Q5).

---

## 13. Câu hỏi còn mở

Q1–Q5 cần bạn trả lời sớm (phần việc của P0, mục 12). Với mọi câu, cột "Mặc định khuyến nghị" là đáp án đề xuất: bạn chỉ cần gật đầu hoặc sửa. Q6–Q14 chưa chặn việc nào nên có thể để mặc định.

| # | Câu hỏi | Mặc định khuyến nghị | Liên quan |
|---|---|---|---|
| Q1 | Dùng tên miền nào? | Mua một tên .vn hoặc .com ngắn ngay bây giờ, trước P4. Khoảng 300.000–800.000 ₫ mỗi năm | V3, P4 |
| Q2 | Màn hình đồng ý của Google hiện gì? (a) chưa xác minh và hiện "…supabase.co"; (b) Supabase Pro cộng tên miền riêng, khoảng 35 USD mỗi tháng; (c) viết lại phần đăng nhập | **(a)**. Không tải logo lên. Thử (c) sau khi ra mắt | V29, mục 11.4 |
| Q3 | Làm xong các trang mới rồi mới mở công khai? | Có: P1–P3, rồi P4–P6 | Mục 12 |
| Q4 | Có đợt thử chỉ mời trước không? | Có: khoảng 20 người trong 2 tuần, tạo sẵn tài khoản. Thử việc Google liên kết tài khoản trước khi trông cậy vào nó | V2, mục 11.7 |
| Q5 | Giữ Trang chủ làm trung tâm, không có thanh tab chung? | Có. Sau đợt thử, hỏi người thử "Có lúc nào bạn bị kẹt không?" | V4, mục 4 |
| Q6 | Dùng phông có chân cho tiêu đề (Newsreader)? | Có. Kiểm "Ẩm thực" và "Quán Ốc Đào" trên iPhone của chính bạn trước | V7, mục 6.2 |
| Q7 | Gọi điểm vuốt là "Độ hot" và nút là "Hot"? | Có | V11 |
| Q8 | Các con số hạn mức (V30)? | Như đã liệt kê. Xem lại khi DB vượt 250 MB | V30, A3 |
| Q9 | Tuổi tối thiểu? | 16+ | V27 (ô 4), mục 11.5 |
| Q10 | Ghi tên ai là người vận hành? | Tên thật của bạn cùng [EMAIL HỖ TRỢ]. Theo cách đọc ở mục 11.5 (không phải tư vấn pháp lý), bên kiểm soát dữ liệu phải xác định được danh tính. Luật sư cho ý kiến có phải nộp hồ sơ chuyển dữ liệu ra nước ngoài hay không và nộp cùng bạn nếu có `[KIỂM TRA]` | P6, mục 5, mục 11.5 |
| Q11 | Khi ngừng dịch vụ, báo trước bao nhiêu ngày ([SỐ NGÀY])? | 30 ngày | Điều khoản (mục 5), mục 8 |
| Q12 | Tài khoản của chính bạn có giữ sao lưu hằng tuần không? | Bạn đồng ý lại như mọi người; ô 3 để trống trừ khi bạn tự tick | V31, V27 |
| Q13 | Có thêm nút "Đổi quán khác" ở thẻ gợi ý hằng ngày không? | Có (không đổi quyết định U33) | Mục 10.1 |
| Q14 | "Chốt quán này" có cộng +1 hot không? | Không; nó không ghi gì | V18, mục 10.6 |

---

## 14. Bản vẽ mẫu

**Link:** https://claude.ai/artifact/KGhAgZzQq1ZEp3huRjWz9K

Bản vẽ nằm trên một canvas (trang vẽ giao diện trên claude.ai) **riêng tư**: chỉ bạn mở được cho tới khi bạn tự chia sẻ. Canvas là bản vẽ để duyệt hướng, không phải màn đã dựng; khi làm (P1–P7), chép câu chữ trong ngoặc kép nguyên văn.

**Các trang của canvas** (đối chiếu theo tên trang; nếu không thấy một màn ở trang dự đoán, tìm theo tên màn trong bảng dưới)

| Trang canvas | Xem gì ở đó |
|---|---|
| Tổng quan (gồm Hệ thiết kế và Sơ đồ trang) | Bảng quy chuẩn màu, phông, cỡ chữ, linh kiện của Sổ tay (mục 6, 7) và sơ đồ điều hướng (mục 4) |
| Trang công khai | Trang giới thiệu và các trang tĩnh (mục 8) |
| Đăng nhập & bắt đầu | Lớp chặn trình duyệt, đăng nhập, bốn bước làm quen (mục 9) |
| App chính | Trang chủ, các trang nhóm, tìm kiếm, yêu thích, Gần tôi, Bốc thăm, Vuốt, chi tiết, form (mục 10.1–10.9) |
| Tài khoản & dữ liệu | Tài khoản, quyền riêng tư và xoá tài khoản, quản lý nhóm, bảng Cài app (mục 10.10–10.14) |
| Máy tính | Bố cục từ 1024 px (mục 4) |
| Các hướng đã cân nhắc | Ba hướng A, B, C của mục 2 |

**Cách xem**
- **Ảnh quán chỉ là ô màu trơn giữ chỗ**, không phải ảnh thật. Ảnh thật chỉ có trong app.
- **Mỗi màn có công tắc "dark"** trong bảng Tweaks (bảng chỉnh nhanh của canvas) để đổi giữa sáng và tối. 7 màn đánh dấu **D** trong bảng dưới được vẽ sẵn ở chế độ tối.
- **Chế độ Play (chạy thử):** bấm chuyển giữa các màn như app thật. Chỉ những chỗ điều hướng rõ ràng (nút quay lại, dock, thẻ mở chi tiết, nút chính) mới chuyển màn; chỗ khác chỉ là hình.
- **Khung điện thoại** 390×844, không vẽ thanh trạng thái hay thanh home giả (máy thật tự vẽ hai thanh này); vài màn vẽ dài hơn để thấy trọn nội dung. Người dùng mẫu: "Nguyễn Minh Anh", `minhanh@example.com`, ảnh đại diện chữ "MA". Ngày mẫu: Thứ Bảy, 17 tháng 10. Nhóm mẫu: Quán ăn 12 · Quán uống 8 · Chỗ chơi 5 · Du lịch 3. Mọi dữ liệu là minh hoạ.
- Khi góp ý, nói theo số màn trong bảng dưới kèm tên màn, ví dụ "màn 7, Trang chủ đang dùng: …".

**Danh sách màn** (số thứ tự theo bản đặc tả; **D** = vẽ ở chế độ tối)

| # | Màn | Nội dung chính | Xem mục |
|---|---|---|---|
| 1 | Lớp chặn trình duyệt chat (Zalo) | Lớp chặn phủ lên trang giới thiệu bị làm mờ; các bước cho Zalo; [Sao chép link]; [Vẫn xem trang] | 9.7 |
| 2 | Đăng nhập | Logo, "WhereToGo", câu giới thiệu, dòng chú thích về supabase.co, nút Google bản sáng, lời công bố đầy đủ, 3 link | 9.1 |
| 3 | Onboarding 1/4 — Đồng ý | Thanh bước; "Chào Minh Anh, trước khi bắt đầu"; ô 1 và 4 đã tick, ô 2 và 3 chưa tick (ô 3 bị khoá kèm dòng giải thích); hộp thông tin về vị trí; nút chính bấm được | 9.2 |
| 4 **D** | Onboarding 2/4 — thiếu Drive | Trạng thái "Google chưa cho phép lưu ảnh"; [Thử lại] · [Để sau] | 9.3 |
| 5 | Onboarding 3/4 — Nhóm | 4 hàng đã tick kèm câu gợi ý; "＋ Thêm nhóm khác"; [Tạo 4 nhóm] | 9.4 |
| 6 | Trang chủ, người mới | Dòng ngày; danh sách việc (Thêm 3 địa điểm 0/3); 4 thẻ nhóm với dải ảnh trống; thẻ Gần tôi; dock | 10.1 |
| 7 | Trang chủ, đang dùng | Gợi ý hôm nay "Bún chả Hương Liên", Quán ăn · 50.000–90.000 ₫, "Đang mở · đóng lúc 20:30"; thẻ Quán ăn "Chán cơm thì ăn gì?" với 3 ảnh và "+9"; thẻ Quán uống "+5"; dock | 10.1 |
| 8 **D** | Trang chủ, đang dùng (tối) | Cùng nội dung màn 7 | 10.1 |
| 9 | Bảng thông tin trên Trang chủ | Bún chả Hương Liên, ảnh 16:10, "cách bạn 1,2 km", câu chuyện cắt còn 3 dòng, nút tim, [Chỉ đường] [Xem đầy đủ] | 10.1, 10.8 |
| 10 | Trang chọn quán: Quán uống | "8 địa điểm · 3 đã đi"; [Vuốt nhóm này] [Bốc thăm]; lưới: Cộng Cà Phê 35.000–65.000 ₫ (Hứng thú) · Cà phê Giảng 30.000–50.000 ₫ (Đã đi) · The Note Coffee 40.000–70.000 ₫ · Cafe Đinh 25.000–45.000 ₫ · Tranquil Books & Coffee 45.000–75.000 ₫ · Loading T Cafe 40.000–60.000 ₫ | 10.2 |
| 11 | Tìm kiếm | Từ khoá "bun"; chip Nhóm: Quán ăn (đang chọn) và Giá: 50.000–150.000 ₫ (đang chọn); "3 địa điểm · Xoá bộ lọc"; các hàng Bún chả Hương Liên 1,2 km · Bún riêu Hàng Bạc 0,6 km · Bún đậu Hàng Khay 0,9 km | 10.3 |
| 12 | Bảng lọc (Tìm kiếm) | Nhóm, Giá chọn sẵn (một mức đang bật), Nhãn "Hẹn hò" đang bật, Trạng thái; chân bảng [Xoá bộ lọc] [Xem 3 kết quả] | 10.3 |
| 13 **D** | Yêu thích | "6 nơi"; chip; lưới Cộng Cà Phê, Phở Thìn Lò Đúc, Phố đi bộ Hồ Gươm (Miễn phí), Bản Cát Cát – Sa Pa, Cà phê Giảng, Ốc Đào | 10.4 |
| 14 | Gần tôi: hỏi | Hộp thông tin về vị trí; chọn Quán ăn; Tầm giá "Bất kỳ"; chọn 3 km; [Tìm quanh đây] | 10.5 |
| 15 | Gần tôi: danh sách | "Quán ăn · trong 3 km"; Bún riêu Hàng Bạc 0,6 km · Bún chả Hương Liên 1,2 km · Phở Thìn Lò Đúc 1,8 km; chú thích "3 quán trong Quán ăn chưa có vị trí — Thêm vị trí" | 10.5 |
| 16 **D** | Gần tôi: bản đồ kèm bảng | Chỗ chơi · 3 km; một cụm "3"; ghim đang chọn Phố đi bộ Hồ Gươm, bảng "Miễn phí · cách bạn 0,8 km · T6 19:00–24:00, T7–CN cả ngày"; ghi công nguồn bản đồ hiện rõ | 10.5 |
| 17 | Bốc thăm, đã bốc | Chọn Quán ăn; 1 Phở Thìn Lò Đúc (khoanh vòng bút đỏ, [Chỉ đường] [Xem đầy đủ]) · 2 Bánh cuốn Thanh Vân · 3 Ốc Đào; [Bốc lại] | 10.6 |
| 18 | Vuốt, đang kéo | "Quán ăn · còn 14 thẻ"; Phở Thìn Lò Đúc nghiêng sang phải với dấu "+1 hot" khoanh tròn; bảng "60.000–80.000 ₫ · 13 Lò Đúc", ngọn lửa "Độ hot 3"; 5 nút | 10.7 |
| 19 | Chi tiết, đầu trang | Bún chả Hương Liên: ảnh "1/6", tiêu đề h1, 4 sao, Đã đi, Độ hot 5, danh sách thông tin (24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội; 50.000 ₫ – 90.000 ₫; Đang mở · đóng lúc 20:30; 1,2 km; 2 lần đi) | 10.8 |
| 20 **D** | Chi tiết, đã cuộn | Câu chuyện "Lần đầu ăn ở đây là trưa mưa tháng Bảy, cả nhóm chen nhau ở tầng hai. Chả nướng thơm than hoa, nước chấm hơi ngọt — lần sau nhớ gọi thêm nem cua bể."; Ghi chú "Gửi xe máy ở ngõ bên cạnh, 5.000 ₫."; nhãn Hẹn hò, Ăn trưa; các lần đi 12/07/2026 và 03/10/2026; thanh nút dính | 10.8 |
| 21 | Thêm địa điểm, điền từ link | Thẻ dán link báo thành công; Tên "Cộng Cà Phê"; chọn Quán uống; 35.000–65.000 ₫; 2 ảnh (ảnh đầu đánh dấu "Ảnh bìa"); "Đã có vị trí từ link Google Maps"; phần Cảm nhận; "Thêm chi tiết" đang thu gọn; nút dính [Lưu địa điểm] | 10.9 |
| 22 | Tài khoản | Hồ sơ; Drive đã kết nối; Nhóm (4), Nhãn (1); Giao diện "Theo máy"; các hàng menu; [Đăng xuất] | 10.10 |
| 23 | Quyền riêng tư & dữ liệu | 3 đồng ý kèm ngày; công tắc sao lưu đang tắt; xuất CSV và JSON; Xoá tài khoản; chân trang có email | 10.11 |
| 24 **D** | Xoá tài khoản | Danh sách những gì bị xoá; [Tải dữ liệu trước]; 3 ô tick, ô cuối đã tick; nút xoá bấm được | 10.11 |
| 25 | Quản lý nhóm kèm bảng sửa | Bảng sửa: Tên "Ăn vặt", Câu gợi ý "Đói giữa buổi thì ăn gì?", icon que kem đã chọn, xem trước thẻ trực tiếp | 10.12 |
| 26 | Bảng Cài app (iOS 26) | Tab iPhone; 5 bước với icon nằm trong câu; [Để sau] | 10.14 |
| L1 | Trang giới thiệu, máy tính 1280 (sáng) | Header; hero hai cột với ảnh Trang chủ và Chi tiết chú thích "Dữ liệu minh hoạ"; 3 bước; lưới tính năng 3×2; khối quyền riêng tư kèm câu Sử dụng giới hạn; phần cài app; câu hỏi thường gặp; lời kêu gọi cuối; chân trang | 8 |
| L2 **D** | Trang giới thiệu, điện thoại 390 (tối) | Các khối như L1 xếp một cột, hero trước, ảnh xếp chồng | 8 |
| Thêm | App trên máy tính, Trang chủ 1280 (sáng) (tuỳ chọn) | Cột bên với danh sách nhóm; gợi ý hôm nay và lưới 2 cột thẻ nhóm; không có dock | 4, 10.1 |

---

## 15. Nguồn tham khảo

Toàn bộ nguồn web ở đây được đọc qua tóm tắt kết quả tìm kiếm, vì lúc rà soát không mở được nhiều trang gốc (đặc biệt support.google.com và supabase.com). Câu chữ trích trong kế hoạch này có thể không đúng từng chữ; mở trang thật để kiểm trước khi trích nguyên văn. Các mục lấy từ diễn đàn và blog là ý kiến người dùng, không phải tài liệu chính thức.

### Google OAuth và thương hiệu

- Quyền Drive, `drive.file` là "Recommended / Non-sensitive": https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Danh sách quyền, quyền đăng nhập cơ bản: https://developers.google.com/identity/protocols/oauth2/scopes
- Cảnh báo "chưa xác minh" và trần 100 người dùng mới: https://support.google.com/cloud/answer/7454865
- Xác minh thương hiệu (trang trợ giúp và trang hướng dẫn):
  - https://support.google.com/cloud/answer/13463073
  - https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification
  - https://support.google.com/cloud/answer/13464321
  - https://support.google.com/cloud/answer/13807376
  - https://support.google.com/cloud/answer/13804963
- Trang Branding (yêu cầu link trang chủ, quyền riêng tư, điều khoản): https://support.google.com/cloud/answer/15549049
- Trang Audience (chế độ Testing và In production): https://support.google.com/cloud/answer/15549945
- Hết hạn khoá làm mới ở chế độ Testing: https://developers.google.com/health/setup và https://discuss.google.dev/t/oauth2-refresh-token-expiration-and-youtube-api-v3/160874
- Chính sách xác minh quyền bị hạn chế (vị trí trang chính sách): https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification
- Chính sách dữ liệu người dùng của Dịch vụ API Google và Sử dụng giới hạn: https://developers.google.com/terms/api-services-user-data-policy
- Quyền chi tiết (granular permissions): https://developers.google.com/identity/protocols/oauth2/resources/granular-permissions
- Chính sách OAuth, trình duyệt an toàn: https://developers.google.com/identity/protocols/oauth2/policies và https://developers.googleblog.com/2021/06/upcoming-security-changes-to-googles-oauth-2.0-authorization-endpoint.html
- Hướng dẫn thương hiệu nút "Đăng nhập bằng Google": https://developers.google.com/identity/branding-guidelines
- Thu hồi khoá (revoke) trong luồng OAuth cho máy chủ: https://developers.google.com/identity/protocols/oauth2/web-server
- Hạn mức Drive API: https://developers.google.com/workspace/drive/api/guides/limits
- Trường hợp thực tế (diễn đàn, không chính thức):
  - Tên app không khớp do tên miền callback của Supabase: https://discuss.google.dev/t/oauth-branding-verification-stuck-name-mismatch-due-to-supabase-callback-domain-no-trust-safety-email-received/389007
  - github.io bị từ chối: https://discuss.google.dev/t/google-oauth-domain-not-found-for-verified-github-pages-domain/404025
  - Trang chủ thiếu link quyền riêng tư: https://discuss.google.dev/t/oauth-brand-verification-stuck-homepage-issue-fixed-but-never-received-any-trust-safety-email/371654
  - Tải logo kéo theo yêu cầu xác minh: https://github.com/orgs/supabase/discussions/2925
  - Lỗi `403 disallowed_useragent` trong trình duyệt nhúng: https://community.auth0.com/t/403-disallowed-useragent-for-web-login-from-embedded-browsers/55074

### Supabase (kèm Vercel và GitHub)

- Đăng nhập Google và tên miền Supabase trên màn đồng ý: https://supabase.com/docs/guides/auth/social-login/auth-google (vấn đề liên quan: https://github.com/supabase/supabase/issues/33387)
- Redirect URLs và ký tự đại diện: https://supabase.com/docs/guides/auth/redirect-urls
- Giới hạn tần suất của Auth: https://supabase.com/docs/guides/auth/rate-limits và https://supabase.com/docs/guides/local-development/cli/config
- CAPTCHA: https://supabase.com/docs/guides/auth/auth-captcha
- Công tắc "Allow new users to sign up": https://supabase.com/docs/guides/auth/general-configuration
- Liên kết danh tính theo email: https://supabase.com/docs/guides/auth/auth-identity-linking
- Xoá người dùng bằng Admin API: https://supabase.com/docs/reference/javascript/auth-admin-deleteuser và https://supabase.com/docs/guides/auth/auth-user-management
- Tên miền riêng, giá, dung lượng DB: https://supabase.com/docs/guides/platform/custom-domains, https://supabase.com/pricing, https://supabase.com/docs/guides/platform/database-size
- Bản tin thay đổi `GRANT` cho bảng mới (2026-10-30): https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
- Vercel: https://vercel.com/docs/limits/fair-use-guidelines, https://vercel.com/docs/limits, https://vercel.com/docs/plans/hobby, https://vercel.com/terms, giới hạn tần suất của WAF https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- GitHub: giới hạn Pages https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits; log chạy workflow https://docs.github.com/en/actions/how-tos/monitor-workflows/use-workflow-run-logs; chế độ công khai của repo https://docs.github.com/articles/setting-repository-visibility

### Luật 91/2025 và Nghị định 356

- Văn bản và bản dịch Luật 91/2025/QH15:
  - https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Luat-Bao-ve-du-lieu-ca-nhan-2025-so-91-2025-QH15-625628.aspx
  - https://english.luatvietnam.vn/dan-su/law-on-personal-data-protection-law-no-91-2025-qh15-405135-d1.html
- Nghị định 356/2025/NĐ-CP, hạn trả lời và điểm mới so với Nghị định 13:
  - https://www.vietnam-briefing.com/news/vietnam-personal-data-protection-regulation-decree-356.html/
  - https://vietanlaw.com/decree-356-2025-vs-decree-13-2023-updates-on-personal-data-protection-in-vietnam/
  - https://luatvietnam.vn/dan-su/diem-moi-cua-nghi-dinh-356-2025-so-voi-nghi-dinh-13-2023-ve-bao-ve-du-lieu-ca-nhan-568-106269-article.html
  - https://www.dataguidance.com/news/vietnam-personal-data-protection-law-enters-force
- Tóm tắt cho bên nước ngoài (có báo vi phạm 72 giờ):
  - https://www.dfdl.com/insights/legal-and-tax-updates/vietnam-personal-data-protection-2026-what-foreign-organizations-need-to-know/
  - https://www.ey.com/content/dam/ey-unified-site/ey-com/en-vn/technical/tax/documents/ey-vietnam-legal-alert-march-2026-decree-no356-2025-nd-cp-providing-detailed-guidance-for-implementation-of-personal-data-protection-law-eng.pdf
- Đồng ý theo từng mục đích (Điều 9): https://flaw.vn/en/personal-data-protection-law-and-impact-on-companies/, https://www.vnetwork.vn/en-US/news/luat-so-91-2025-qh15/, https://bewiseapps.com/doing-business-in-vietnam/intellectual-property-data-and-technology/personal-data-protection
- Dữ liệu vị trí là nhạy cảm: https://www.uniconsent.com/vietnam-pdpl và https://www.vietnam-briefing.com/news/vietnam-law-on-personal-data-protection-latest-developments-and-insights.html/
- Doanh nghiệp nhỏ: https://vietnam.acclime.com/news-insights/vietnams-new-personal-data-protection-law-what-businesses-must-know-before-2026/
- Chuyển dữ liệu ra nước ngoài: https://skylaw.vn/en/cross-border-personal-data-transfer-procedures-and-key-notes/ và https://vietnamlawmagazine.vn/businesses-face-tightened-personal-data-protection-requirements-79374.html
- Trẻ em dưới 16 tuổi: https://www.linklaters.com/de-lu/insights/data-protected/data-protected---vietnam và https://www.clym.io/regulations/personal-data-protection-law-pdpl-vietnam
- Nghị định 147/2024 (xác thực tài khoản mạng xã hội): https://vneconomy.vn/tu-ngay-25-12-tai-khoan-mang-xa-hoi-phai-xac-thuc-so-dien-thoai-moi-duoc-dang-bai.htm và https://kpmg.com/vn/vi/home/phan-tich-chuyen-sau/2025/02/understanding-vietnam-new-internet-regulations.html

### PWA và iOS

- iOS không có `beforeinstallprompt`: https://bugs.webkit.org/show_bug.cgi?id=193959 và https://developer.apple.com/forums/thread/807603
- iOS 26, mọi trang thêm vào màn hình chính mở như app web:
  - https://webkit.org/?p=16993
  - https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios
  - https://www.idownloadblog.com/2025/06/17/apple-ios-26-safari-web-apps-home-screen-bookmarks/
  - https://heise.de/-10749652
- Các bước cài trên iOS 26 (bố cục Compact không có nút Chia sẻ): https://www.macrumors.com/how-to/save-safari-bookmark-web-app-iphone-home-screen/ và https://community.glideapps.com/t/ios-26-add-to-home-screen-workflow-change/84599
- Cài từ trình duyệt khác trên iOS 16.4 trở lên và điều kiện cài PWA: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Developer_guide/Installing và https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_Installable
- App đã cài có kho lưu trữ riêng, phải đăng nhập lại: https://wwdcnotes.com/documentation/wwdc23-10120-whats-new-in-web-apps/
- Android Chrome, điều kiện cài: https://developer.chrome.com/blog/update-install-criteria
- Cách mời cài app: https://web.dev/articles/promote-install và https://web.dev/customize-install
- Hạn chế của PWA trên iOS: https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide
- Trình duyệt trong ứng dụng chat không cài được PWA: https://progressier.com/pwa-capabilities/in-app-browser

### Ứng dụng tương tự

| Ứng dụng | Điều rút ra cho WhereToGo | Nguồn |
|---|---|---|
| Mapstr | Nhập từ Google Maps, CSV, KML; bản đồ công khai mặc định; tài khoản miễn phí dừng ở 300 địa chỉ | https://en.mapstr.com/faq, https://en.mapstr.com/fonctionnalites/importer-des-adresses |
| Beli | Bước ép mời ít nhất 4 bạn bị chê; nên có "Bỏ qua". WhereToGo không ép mời ai | https://ixd.prattsi.org/2024/09/design-critique-beli-app/, https://en.wikipedia.org/wiki/Beli_(app) |
| Corner | Dán link TikTok hay Instagram thành ghim; nhập danh sách nhưng không có bước xem trước | https://apps.apple.com/us/app/corner-curate-share-places/id1668282277 |
| Google Maps (Đã lưu) | Danh sách có sẵn, link chia sẻ chỉ xem, ghi chú tối đa 4.000 ký tự | https://support.google.com/maps/answer/7280933 |
| Wanderlog | Bài trắc nghiệm dài rồi tới màn trả phí: tránh | https://wanderlog.com/ |
| Foursquare | City Guide đóng ngày 15/12/2024; có xuất dữ liệu thì người dùng tin hơn khi app có thể ngừng | https://foursquare.com/city-guide-sunset/ |
| Airbnb Wishlists | Gỡ người cộng tác nhưng họ vẫn còn quyền xem qua link; bài học cho chia sẻ sau này | https://www.airbnb.com/help/article/1236 |
| Pinterest | Hỏi chọn ít nhất 3 sở thích; mỗi câu hỏi thêm làm tăng tỉ lệ bỏ | https://appcues.com/blog/casey-winters-pinterest-user-onboarding |
| Thatch | Biến tệp Google Takeout thành danh sách, giữ ghi chú | https://thatch.notion.site/Import-Your-Saved-Places-from-Google-Maps-d03fa4773960460d8bb7c84cbe4c67cb |
| Ứng dụng Việt Nam | Foody (List), Riviu (Bộ sưu tập), LunchFoods (nút "Chọn giúp tôi"), SpotShare (gần nhất về ý tưởng) | https://www.foody.vn/tro-giup, https://riviu.vn/, https://apps.apple.com/us/app/lunchfoods-%C4%83n-g%C3%AC/id6449702815, https://spotshare.io.vn/ |

- Cấu trúc trang giới thiệu: https://theswiftk.it.com/blog/app-landing-page-sections-guide, https://screenhance.com/blog/saas-landing-page-screenshots; mẫu câu về dữ liệu nằm trong Drive: https://www.drawio.com/blog/data-protection
- Làm quen (onboarding): https://raw.studio/?p=9526
- Định dạng Google Takeout "Đã lưu": https://exportmymap.com/blog/google-takeout-saved-places-json-vs-csv/

