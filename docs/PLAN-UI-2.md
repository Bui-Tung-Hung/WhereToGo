# KẾ HOẠCH GIAO DIỆN MỚI — PHẦN 2: MỘT PHONG CÁCH, ĐỦ TRANG, MỞ CÔNG KHAI

Ngày: 2026-10-17. Chế độ: **PLAN** (chưa thực hiện cho tới khi user gõ `ENTER EXECUTE MODE`).
Nguồn quyết định: [UI-REDESIGN.md](UI-REDESIGN.md) (U1–U45 của user, M1–M8 mặc định), [PLAN-UI-1.md](PLAN-UI-1.md) (P1–P37 mặc định kỹ thuật của phần 1), [PLAN.md](PLAN.md) (D1–D26), và 3 câu trả lời của user ngày 2026-10-17: (1) mở app cho mọi người (công khai, nhiều người dùng); (2) MỘT phong cách chung cho mọi trang, có cả sáng và tối; (3) cần kế hoạch kèm bản vẽ mẫu.
Quy ước giống PLAN.md: `[USER]` = bước chỉ user làm được; `[GATE]` = dừng, chờ user xác nhận. `V#` = quyết định của kế hoạch này; `Q#` = câu hỏi còn mở; `[KIỂM TRA]` = phải thử trên máy thật hoặc trang Google trước khi làm. `P0`–`P7` trong tài liệu này là **giai đoạn** (mục 12); khi nhắc mặc định P1–P37 của PLAN-UI-1 thì ghi rõ "(PLAN-UI-1)", riêng cột "Thay/Đổi" của bảng V luôn là mặc định của PLAN-UI-1. `A#` = mục bảo mật khi mở công khai (mục 11). Chỗ trống user tự điền: `[TÊN MIỀN]`, `[EMAIL HỖ TRỢ]`, `[MÃ DỰ ÁN]` (mã dự án Supabase), `[TÊN NGƯỜI VẬN HÀNH]`, `[SỐ NGÀY]`, `[LINK GITHUB]`.
Cách viết số: tỉ lệ tương phản giữ dấu chấm thập phân như bản đo (5.44:1); số byte tách hàng nghìn bằng dấu cách (145 336 B); số trong câu chữ giao diện viết kiểu Việt Nam ("50.000 ₫", "1,2 km").
Câu chữ giao diện trong ngoặc kép là bản chốt, chép nguyên văn khi làm.

---

## 0. Tóm tắt cho bạn

**Vì sao app trông như "chỉ có 2 trang"**
- Phần 1 mới vẽ lại đúng 2 trang: Trang chủ và Vuốt thẻ (cộng bảng thông tin trượt lên). 7 trang còn lại vẫn mang giao diện Ionic mặc định cũ, trông như màn cài đặt chứ không như một "trang" của sản phẩm.
- 4 lối vào trên Trang chủ (nút tìm, nút tim, mọi thẻ nhóm, thẻ Gần tôi) cùng mở **một** trang danh sách cũ, chỉ khác tiêu đề.
- Các trang đã hẹn trong UI-REDESIGN chưa được làm: Trang chọn quán, Tìm kiếm mới, Gần tôi, Ngẫu nhiên, Yêu thích.
- Không có trang giới thiệu (landing page — trang đầu tiên người lạ thấy, nói app làm gì) và không có bước làm quen lúc mới dùng (onboarding).

**Kế hoạch này đổi gì.** App mở cho mọi người có tài khoản Google, bắt đầu bằng một đợt thử chỉ dành cho người được mời. Mỗi lối vào có trang riêng thật sự. Thêm các trang công khai (giới thiệu, quyền riêng tư, điều khoản, trợ giúp, cài app), luồng đăng nhập và đồng ý từng mục theo Luật 91, trang Tài khoản với quyền dữ liệu (tải về, ngắt Drive, xoá tài khoản), bố cục cho máy tính, và các việc bảo mật bắt buộc trước khi cho người lạ đăng ký. Mọi trang theo một phong cách, sáng và tối.

**Phong cách đã chọn: "Sổ tay".** App trông như một cuốn sổ tay in: nền giấy kem, chữ màu mực, một màu nhấn đỏ gạch như nét bút đỏ chấm bài. Tiêu đề và tên quán dùng Newsreader, một phông có chân (serif — chữ có nét chân nhỏ ở đầu nét, kiểu sách báo); chữ thường dùng Be Vietnam Pro, phông đang có sẵn trong app. Dấu ấn riêng là "vòng bút đỏ", một nét khoanh tay chỉ hiện lúc bạn chốt quyết định. Phong cách mọc ra từ Trang chủ nền kem bạn đã duyệt, nên người dùng sẽ thấy "phần còn lại của app đã theo kịp" chứ không thấy một app khác.

**Thứ tự làm** (tổng khoảng 36 ngày làm việc, 7–8 tuần cho một người)
- P0 — Việc của bạn (làm song song từ ngày 1)
- P1 — Một giao diện · P2 — Trang thật · P3 — Form, quản lý, máy tính
- P4 — Nhà mới (tên miền riêng, trang công khai) · P5 — Đăng nhập & quyền dữ liệu
- P6 — Mở cửa (**[GATE]** bật đăng ký) · P7 — Bản đồ

**Bạn cần làm gì ngay** `[USER]`
1. Mua tên miền [TÊN MIỀN] (Q1).
2. Tạo email hỗ trợ [EMAIL HỖ TRỢ].
3. Hẹn luật sư đọc các ô đồng ý, Chính sách quyền riêng tư, Điều khoản và hồ sơ chuyển dữ liệu ra nước ngoài.
4. Trả lời Q1–Q5 ở mục 13.

**Bản vẽ mẫu:** https://claude.ai/artifact/KGhAgZzQq1ZEp3huRjWz9K — đang để riêng tư, chỉ bạn mở được cho tới khi bạn tự chia sẻ (mục 14).

---

## 1. Hiện trạng

Theo commit `ff25e89`.

**Số liệu**
- 13 route thật và 3 route chuyển hướng (`/tabs/*` và `/` về `/home`; `*` về `/` rồi về `/home`). Không có trang 404.
- 9 component trang. `PlaceListPage` phục vụ 4 route (`/search`, `/favorites`, `/nearby`, `/categories/:id`); `PlaceFormPage` phục vụ 2 (`/places/new`, `/places/:id/edit`). Thực tế chỉ có khoảng 6 bố cục khác nhau (Đăng nhập, Trang chủ, Vuốt, Danh sách, Chi tiết, Form) cộng 3 trang kiểu danh sách cài đặt.
- Đã vẽ lại ở phần 1: `HomePage`, `SwipePage` và bảng `PlaceInfoSheet` dùng chung. 7 component trang còn lại và 3 bảng trượt (AddVisit, TimeWheel, CategoryEditor) vẫn giao diện cũ.
- Lớp phủ: 4 bảng trượt (IonModal), khoảng 20 hộp thoại IonAlert, 1 IonLoading, khoảng 12 loại toast (thông báo nhỏ tự tắt), 3 banner/biểu tượng trạng thái. 1 trang tĩnh `public/privacy.html`, không được link từ đâu.

**3 hệ giao diện không khớp nhau**

| Hệ | Màu | Phông | Dùng ở |
|---|---|---|---|
| Mặc định cũ (`variables.css`) | trắng ngà `#fafaf9`, nút đen, vàng đồng `#a16207` | Playfair Display + Be Vietnam Pro | Đăng nhập, 4 trang danh sách, Chi tiết, Form, Cài đặt, 2 trang Quản lý, 3 bảng trượt cũ, mọi alert, toast, banner |
| `.wtg-theme-home` | kem `#f5f2e9`, xanh Apple `#0071e3` | Playfair 800 + Be Vietnam Pro | Trang chủ, và bảng thông tin khi mở từ Trang chủ |
| `.wtg-theme-swipe` | be `#f2ece1`, cam `#e8a359` | Fraunces + Plus Jakarta Sans | Vuốt thẻ, và bảng thông tin khi mở từ Vuốt |

Thêm nữa:
- Chế độ tối của các trang mặc định thật ra hiện đen tuyền `#000` và trắng `#fff`, vì file `dark.system.css` của Ionic đè lên bảng màu đã thiết kế.
- 4 họ phông, 298 036 B; 7 chỗ chữ 11 px.
- Vài cặp màu không đạt tương phản: chip lọc đang chọn ở trang Vuốt 2.24:1, chữ trên ảnh thẻ vuốt 1.4–3.3:1.
- Không có bố cục cho máy tính: mọi trang kéo giãn hết chiều ngang.

**Vấn đề trải nghiệm chính**
1. Người mới chỉ thấy một màn trống và thanh dưới; 4 nhóm đã tạo sẵn bị ẩn cho tới khi có quán đầu tiên. Không có bước làm quen.
2. Thanh dưới Trang chủ có 3 icon không có chữ; icon "albums" của Vuốt không tự nói nó làm gì.
3. Thẻ nhóm trông như một điểm đến riêng (ảnh, câu gợi ý) nhưng mở ra danh sách chung không còn chút gì của nhóm.
4. Nghĩa icon chồng chéo: tim là Yêu thích ở Trang chủ nhưng là +1 ở Vuốt; sao là Yêu thích ở Vuốt nhưng là đánh giá ở chỗ khác.
5. Điểm hứng thú (+1/−1 khi vuốt) không hiện ở đâu, và dễ nhầm với trạng thái "Hứng thú".
6. Trang danh sách không xử lý đang tải hay lỗi: lần đầu tải hoặc mất mạng lại hiện "Chưa có địa điểm nào".
7. Gần tôi bật hộp xin vị trí ngay khi mở, không giải thích trước; hướng dẫn cấp quyền chỉ đúng cho Safari trên iPhone.
8. Trang Vuốt khoá cuộn với chiều cao cố định: trên iPhone SE hoặc khi xoay ngang, hàng nút có thể bị đẩy khuất.
9. Chi tiết: tên hiện 2 lần; sao Yêu thích nằm ngay trên sao đánh giá; "Mở Google Maps" và "Chỉ đường" là cùng một việc mang hai tên; không xem ảnh toàn màn hình được; xoá lần đi chỉ bằng vuốt trái.
10. Form là một trang dài 13 mục, nút "Lưu" chỉ ở trên cùng, lỗi có thể nằm khuất; giờ mở cửa mặc định 08:00–22:00 nên "Đang mở" có thể sai; hiện toạ độ thô; vuốt mép trái hay nút Back của trình duyệt bỏ qua câu hỏi "Bỏ thay đổi?".
11. Cài đặt chỉ vào được qua avatar; thiếu link quyền riêng tư, xoá tài khoản, tải dữ liệu, đổi sáng/tối, trợ giúp.
12. Quản lý nhãn không tạo được nhãn; mọi thao tác chỉ bằng vuốt, khó dùng trên máy tính.
13. Đăng nhập: không giới thiệu app, không link quyền riêng tư hay điều khoản; `prompt=consent` bắt Google hỏi lại quyền mỗi lần đăng nhập; mở một link sâu (deep link) khi chưa đăng nhập thì sau đó bị đưa về Trang chủ; câu lỗi `signup_disabled` chỉ đúng với chủ app.
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

Ba hướng được vẽ song song rồi chấm bởi 3 giám khảo, mỗi người nhìn một góc: **Dựng & bảo trì** (một người làm, Ionic React 9, GitHub Pages, chạy offline), **Người dùng mới & tuân thủ** (lòng tin, Luật 91, Google), **Thẩm mỹ & truy cập** (bản sắc, tương phản, dấu tiếng Việt). Mọi tỉ lệ tương phản các hướng đưa ra đều được tính lại và khớp.

| Hướng | Người dùng mới & tuân thủ | Thẩm mỹ & truy cập | Dựng & bảo trì | Tổng |
|---|---|---|---|---|
| **A — "Sổ tay"** | 8 | 8 | 7 | **23** |
| C — "Bản đồ của riêng bạn" | 7 | 6 | 8 | 21 |
| B — "Chốt!" | 6 | 6 | 4 | 16 |

**A — "Sổ tay" (cuốn sổ ấm).** Giữ Trang chủ nền kem và biến nó thành một giao diện chung như một cuốn nhật ký in: giấy kem, chữ mực, một màu đỏ gạch `#A8482A`, tiêu đề Newsreader. Trang chủ vẫn là trung tâm với thanh dưới 5 ô có chữ, không có thanh tab chung; máy tính có cột bên 248 px. *Điểm mạnh:* mọc ra từ màn bạn đã duyệt; phần tuân thủ đầy đủ nhất (mỗi mục đích một ô, ô sao lưu phụ thuộc ô ảnh, tải được bản ghi đồng ý, từ chối thì xoá tài khoản); câu chữ về lòng tin trung thực; dùng lại nhiều code nhất (`HomePage`, `HomeDock`, `DailyPickCard`, `CategoryCard`, `IonRouterOutlet` phẳng) nên ít rủi ro về điều hướng nhất. *Điểm yếu:* dock 5 ô chật ở màn 360 px; dấu chồng (Ấ, Ổ) bị cắt trong tiêu đề Ionic; vài cặp màu nhấn sát ngưỡng (chữ nhấn trên nền nhấn nhạt 4.58:1, màu nút trong toast chưa định nên có thể chỉ 3.02:1); giống kiểu "biên tập ấm" mà AI hay tạo; chưa đóng gói phông Roboto cho nút Google; phông 171 KB; câu "vị trí không lưu lên máy chủ" sai sự thật; trang đăng nhập có câu "bằng việc tiếp tục, bạn đồng ý" (kiểu đồng ý ngầm, trái với ô tick phía sau).

**B — "Chốt!" (Hôm nay đi đâu?).** Biến app thành trò chơi ra quyết định: biển hiệu đường phố, ghế nhựa, màu cam đậm `#C2410C`, phông tiêu đề to tròn Paytone One, thẻ như nhãn dán có bóng cứng, và con dấu "Chốt!" mỗi lần chọn. Có thanh tab dưới Hôm nay · Tìm · ＋ · Bản đồ · Tôi và thêm trang "Chọn cho hai người". *Điểm mạnh:* đáng nhớ và "Việt" nhất; "Độ hot" với icon ngọn lửa tách hẳn điểm vuốt khỏi trạng thái "Hứng thú"; nút Google đúng chuẩn nhất (tập con Roboto Medium); khung thông tin đặc dưới ảnh thẻ vuốt thay lớp mờ chuyển màu; ghi rõ phạm vi `/app/`; phông rẻ nhất 132,3 KB. *Điểm yếu:* Paytone làm dấu tiếng Việt chồng lên dòng trên (cần dòng cao ≥ 1.45); kiểu nhãn dán biến mất ở chế độ tối (viền 2.30:1, bóng 1.12:1); quá nhiều màu, màu nhóm gán theo hàm băm nên 4 nhóm mặc định có 72% khả năng trùng màu; nhiều CSS tự viết nhất; trang "hai người" là phạm vi bạn không yêu cầu; 9–11 tuần; thiếu ô 16+, ô ảnh không nói về khoá truy cập lưu trên máy chủ, nói sai về vị trí mạnh nhất; tiếng lóng làm giảm lòng tin.

**C — "Bản đồ của riêng bạn" (tiện ích, bản đồ là chính).** Trang xám yên tĩnh, một màu xanh mực `#2F44C8`, chỉ một phông Be Vietnam Pro, thanh tab 5 ô có tab Bản đồ, dùng linh kiện Ionic gốc nhiều nhất. *Điểm mạnh:* hệ nhỏ nhất, một phông 136 KB; tương phản cẩn thận nhất; token đặt ở `:root, :root.ios` (đúng chỗ gây lỗi chế độ tối hiện nay); mật độ tốt nhất cho 300+ quán; đặc tả ghim bản đồ tốt nhất; câu chữ dữ liệu chính xác nhất; trang xoá tài khoản riêng; 5–6 tuần. *Điểm yếu:* trông chung chung như phần mềm văn phòng, bỏ Trang chủ ấm và phông có chân bạn đã duyệt; lưới tụt còn 1 cột trên điện thoại; thanh tab nằm trong từng trang nên trượt theo mỗi lần chuyển trang; bản đồ là tab chính nên MapLibre nằm trên đường tải chính và gửi vùng của mọi quán đã lưu cho OpenFreeMap; `color-mix()` hỏng trên iOS 16.0–16.1; "Không đồng ý" chỉ đăng xuất, tài khoản và quyền Google vẫn còn; giá "40k–70k ₫" trộn hai kiểu viết.

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
- một khoảnh khắc mừng lúc chốt quyết định, vẽ lại theo ngôn ngữ của A thành vòng bút đỏ và "Chốt quán này".

**Đã loại**
- Từ B: trang "hai người" (phạm vi bạn không yêu cầu); màu nhóm gán theo hàm băm (hay trùng); phông Paytone (cắt dấu tiếng Việt); kiểu nhãn dán (mất ở chế độ tối).
- Từ C: bản đồ là tab chính (đưa MapLibre vào đường tải chính và gửi mọi vùng đã lưu cho OpenFreeMap); thanh tab đặt trong từng trang; hệ một phông (trông chung chung); kiểu giá "40k".
- Thanh tab chung nói chung (xem V4).

**Các lỗi giám khảo chỉ ra và chỗ đã sửa**

| Lỗi | Cách sửa |
|---|---|
| Địa chỉ github.io cũ trả về 301, và các bản app đã cài không bao giờ cập nhật được nữa | Ra một bản "chuyển nhà" với service worker tự huỷ *trước khi* đặt tên miền (mục 8, giai đoạn P4) |
| `ALLOWED_ORIGINS`, regex tunnel và redirect wildcard | P4 |
| Các phần tải lười vẫn bị precache (lưu sẵn khi cài); không có ngân sách precache tổng | `globIgnores`, cache runtime, và ngân sách tổng 2,5 MB (mục 8) |
| Nút "Cài ngay" trên trang tĩnh | Chỉ cài từ bên trong `/app/` (V33) |
| Chặn đồng ý làm hỏng dùng offline; mất token khi tải lại trang | Xin Drive bổ sung sau khi đồng ý; trạng thái đồng ý lưu đệm trên máy (V26, V27, mục 9.6) |
| Bảng trượt không thể thành hộp thoại chỉ bằng CSS | Lớp bọc `WtgSheet` (mục 7) |
| Đổi sáng/tối bằng tay cần `color-scheme` và viết lại thẻ `theme-color` | Mục 6.9 |
| Manifest cần `id` | Mục 8 |
| Dock 5 ô tràn ở 360 px | Đã đo chữ (dài nhất 57,6 px) và cố định 12 px (mục 7) |
| Cỡ quang học của Newsreader và giá phông | Chấp nhận; tổng phông 145 KB (mục 6.2) |
| Ánh xạ Ionic còn hở; split pane mặc định rộng 270 px; vuốt menu đụng vuốt quay lại | Mục 6.9, mục 4 |
| `color-mix()` hỏng trên iOS 16.0–16.1 | Viết thẳng giá trị các màu bậc (mục 6.9) |
| Lưới tụt còn 1 cột trên điện thoại | Cố định 2 cột dưới 600 px (mục 7) |
| Lời hứa về vị trí sai; không nhắc OpenFreeMap | V37, mục 8, mục 9 |
| Chưa quyết về tên miền supabase.co Google hiện | V29 và Q2 |
| Google Drive được cấp trước khi đồng ý theo Luật 91 | V26 |
| Bắt gõ chữ "XOÁ" có thể chặn việc xoá | Dùng ô tick xác nhận (mục 10.11) |
| Chính sách thay đổi, dùng offline và tài khoản đã có | Mục 9.5, 9.6 |
| Rút đồng ý xuất hiện hai lần; rút mục bắt buộc thì sao | Gộp lại; "Rút lại = xoá tài khoản" (mục 10.11) |
| Hồ sơ chuyển dữ liệu ra nước ngoài | P6 và Q10 |
| Câu "chưa tạo gì" trước khi đồng ý là sai; trang đăng nhập dùng câu đồng ý ngầm | Mục 9.1 |
| "Bắt đầu miễn phí", chữ "drive.file" trần trụi, một lần bấm thừa ở bước 2 | Mục 8, 9.3 |
| Form không có trạng thái "thiếu Drive"; bản tải về người đọc không hiểu | Mục 10.9, 10.11 |
| Dấu bị cắt trong tiêu đề Ionic | Không dùng tiêu đề lớn; `ion-title` dòng cao 1.65; đệm trên cho chữ bị cắt dòng (mục 6.3) |
| Trông giống mặc định của AI | Vòng bút đỏ, dòng ngày, chữ số có chân (V14) |
| Màu nút trong toast; chữ nhấn trên nền nhấn nhạt | Định ở mục 6.1 (5.44:1) |
| Nhầm "Muốn đi" với "Hứng thú" | V11, V12 |
| Mật độ hàng cho 300+ quán; đặc tả ghim bản đồ | Mục 7 |

---

## 3. Bảng quyết định V1–V37

Cột "Thay/Đổi" ghi quyết định cũ bị thay hoặc sửa (U#, M# của UI-REDESIGN; D# của PLAN; P# của PLAN-UI-1).

| # | Quyết định | Thay/Đổi |
|---|---|---|
| V1 | Một phong cách "Sổ tay" cho mọi trang app, mọi bảng trượt và mọi trang công khai, cả sáng và tối: nền giấy kem, chữ màu mực, màu nhấn đỏ gạch "bút đỏ", tiêu đề có chân | thay U28, M7, M8, P24, P37 |
| V2 | Mở đăng ký cho bất kỳ ai có tài khoản Google, bắt đầu bằng đợt thử chỉ dành cho người được mời (Q4) | thay D24 (cả SETUP bước 10, nghiệm thu D-13) |
| V3 | Tên miền riêng [TÊN MIỀN]. Trang công khai tĩnh ở `/`, app ở `/app/` (manifest `id` và `scope` là `/app/`, `start_url` là `/app/#/home`). Vẫn host trên GitHub Pages | sửa D1, D11, base trong D3 |
| V4 | Trên điện thoại, Trang chủ vẫn là trung tâm. Thanh dưới (dock) có 5 ô có chữ: `Tìm · Yêu thích · (＋ Thêm) · Vuốt · Bốc thăm`. Các trang khác không có thanh tab | giữ U5, U6, U8; sửa U34 (nút tim rời khỏi header) |
| V5 | Từ 1024 px trở lên: `IonSplitPane` với cột bên rộng 248 px. Từ 768 đến 1023 px: bố cục điện thoại, căn giữa, rộng 720 px | thêm vào U8 (chỉ máy tính) |
| V6 | Một kiểu header: nút quay lại 44 px; tiêu đề trên thanh công cụ chỉ hiện khi h1 trong nội dung đã cuộn khuất; tối đa 2 icon cộng menu ⋯. Không dùng tiêu đề lớn (large title) của Ionic | thay luật large title trong `global.css` |
| V7 | Phông: Be Vietnam Pro 400/600 và Newsreader Variable, cộng một tập con Roboto Medium 8 KB chỉ dùng cho nút Google. Bỏ Playfair, Fraunces, Plus Jakarta Sans và Be Vietnam Pro 500 | thay M7, P6, P22, P23 |
| V8 | Chữ không bao giờ nhỏ hơn 12 px. Không bao giờ viết tiếng Việt toàn chữ in hoa | thay P36 |
| V9 | Mục Giao diện trong Tài khoản: Theo máy (mặc định), Sáng, Tối | sửa U27 |
| V10 | Mỗi icon chỉ một nghĩa. Yêu thích luôn là trái tim, kể cả ở trang Vuốt | sửa U16 (icon), P34 |
| V11 | Điểm vuốt hiện thành **Độ hot** với icon ngọn lửa. Nút vuốt phải là "Hot", dấu đóng ghi "+1 hot", toast ghi "+1 độ hot", lựa chọn sắp xếp là "Hot nhất" | sửa chữ của U16/U23, P11 |
| V12 | Trạng thái giữ tên Hứng thú · Chưa đi · Đã đi. "Hứng thú" dùng icon `flag` (lá cờ). Thêm lần đi làm trạng thái chuyển sang Đã đi thì giờ có toast báo | giữ D16 |
| V13 | Thẻ nhóm hiện 3 ảnh vuông cộng ô "+N", chọn theo luật "ảnh mới nhất" của P21 | sửa U3 (hình dạng) và P21 (5 → 3) |
| V14 | Dấu ấn "vòng bút đỏ": nét SVG vẽ tay màu đỏ (khoanh tròn hoặc gạch chân), chỉ dùng ở khoảnh khắc chốt quyết định | mới |
| V15 | Yêu thích là trang riêng, `#/favorites` | chốt U22 |
| V16 | Trang chọn quán thành trang lưới thật cho từng nhóm, có "Vuốt nhóm này" và "Bốc thăm" | làm U9; thay P9 |
| V17 | Tìm kiếm với ô trống liệt kê mọi địa điểm. Bộ lọc và sắp xếp lưu trong URL. So khớp không phân biệt dấu | làm U10 và U44; đảo một phần U8 ("bỏ Khám phá") |
| V18 | Trang ngẫu nhiên tên "Bốc thăm": tối đa 3 kết quả, bốc lại, bắt buộc chọn nhóm. "Chốt quán này" không ghi gì vào DB | giữ U19–U21 |
| V19 | Gần tôi: trang hỏi dẫn tới trang kết quả. Kết quả ra trước dạng danh sách xếp theo khoảng cách; bản đồ MapLibre + OpenFreeMap làm sau. Nút chuyển "Danh sách" vẫn giữ sau khi có bản đồ | giữ U11–U13, U35 |
| V20 | Vuốt vẫn là chế độ toàn màn hình có nút quay lại + avatar, không có dock. Trang được phép cuộn, và tỉ lệ ảnh đổi theo chiều cao màn hình | giữ U17; thay P29 |
| V21 | Một bảng thông tin trông giống hệt nhau dù mở từ đâu, có nút tim bật/tắt | sửa M5; bỏ prop `theme` |
| V22 | "Chỉ đường" là nhãn duy nhất cho việc mở Google Maps tại quán | làm U13 nhất quán |
| V23 | Xem ảnh là một route (`#/places/:id/photos/:n`), nên bấm Back là đóng | mới |
| V24 | Form Thêm/Sửa có 4 phần, nút "Lưu địa điểm" dính ở đáy, giờ mở cửa nằm trong một bảng trượt. Quán mới mặc định "Chưa rõ giờ". Việc chặn mất thay đổi chưa lưu bao cả cử chỉ vuốt và nút Back của trình duyệt | thay mặc định 08:00–22:00 của D18 (`PlaceFormPage.tsx:75`) |
| V25 | Khi offline, nút ＋ trên dock vẫn hiện, trông như bị tắt, và bấm vào thì giải thích. Các nút ghi khác vẫn ẩn như cũ | sửa D13 (chỉ nút ＋) |
| V26 | Đăng nhập chỉ xin các quyền cơ bản. `drive.file` được xin ở bước 2 của onboarding (xin bổ sung, `prompt=consent`, `access_type=offline`). Đăng nhập thường dùng `prompt=select_account`. Server kiểm quyền đó đã thật sự được cấp | thay D5 |
| V27 | Đồng ý theo từng mục đích theo Luật 91: 4 ô, đều để trống. Mỗi lần đồng ý lưu trong bảng `consents` kèm phiên bản, thời gian và user agent (chuỗi nhận dạng trình duyệt), tải về được. Một màn riêng hỏi lại khi chính sách đổi. Trạng thái đồng ý được lưu đệm trên máy | mới |
| V28 | Tự thực hiện quyền dữ liệu: tải về (CSV + JSON), ngắt kết nối Drive (đồng thời rút đồng ý lưu ảnh), công tắc sao lưu hằng tuần, xoá tài khoản (bằng ô tick, không gõ chữ), đăng xuất trên máy này hoặc trên mọi thiết bị | mới |
| V29 | Ra mắt khi chưa xác minh thương hiệu với Google (cách a). Không tải logo lên. Trang đăng nhập giải thích dòng "…supabase.co" mà Google hiện | mới (Q2) |
| V30 | Hạn mức trong DB: 1.000 địa điểm mỗi người, 20 ảnh mỗi địa điểm, 50 nhóm, 200 nhãn, 300 lần đi mỗi địa điểm. Một luật giới hạn tần suất gọi (rate limit) trên Vercel WAF | chuyển D23 vào DB |
| V31 | Sao lưu hằng tuần thành tự chọn (ô đồng ý 3), chạy tách riêng từng người, ghi log ít hơn | sửa D12 |
| V32 | Cổng chặn trình duyệt trong ứng dụng chat (in-app browser) ở `/`, `/cai-ung-dung/` và `/app/` | mới |
| V33 | Hướng dẫn cài nằm trong app (`#/install` và một bảng trượt). Được mời sau khi lưu địa điểm thứ 1 và thứ 3, và không mời nữa sau 2 lần bị bỏ qua | mới |
| V34 | Giá ở Chi tiết: "50.000 ₫ – 90.000 ₫". Ở hàng và thẻ: "50.000–90.000 ₫", "Từ 50.000 ₫", "Đến 90.000 ₫", "Miễn phí" | thêm vào D20 |
| V35 | Mọi thao tác trên một hàng đều có menu ⋯, không có gì chỉ làm được bằng vuốt. Quản lý nhãn tạo được nhãn | mới |
| V36 | Trang 404 thật (bản tĩnh và bản trong app) và màn chờ khởi động (boot splash) viết thẳng trong HTML | thay chuyển hướng `*` → `/` |
| V37 | Câu chữ về vị trí phải đúng: vị trí dùng trên máy; chỉ được lưu qua nút "Dùng vị trí hiện tại"; OpenFreeMap thấy địa chỉ IP và vùng bản đồ đang xem | mới |

---

## 4. Điều hướng

**Điện thoại (dưới 768 px)**
- **Trang chủ là trung tâm.** Chỉ Trang chủ có dock (V4).
- **Mọi trang khác** dùng header V6 có nút quay lại. Bấm quay lại khi không có lịch sử thì thay route bằng `#/home`.
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
| Trang giới thiệu (landing) | `/` · `web/site/index.html` | Chưa đăng nhập; đã đăng nhập thấy "Mở WhereToGo" | Giới thiệu app; đáp ứng yêu cầu trang chủ của Google | Mục 8 | Bắt đầu lưu quán | Chạy được không cần JS; cổng chặn; banner `?da-xoa=1`; app đã cài thì chuyển sang `/app/` |
| Quyền riêng tư | `/quyen-rieng-tu/` (`/privacy.html` chuyển sang bằng meta refresh) | Mọi người | Công bố theo Luật 91 và Google | Phiên bản và ngày · tóm tắt · bên kiểm soát dữ liệu và liên hệ · bảng dữ liệu · mục đích · bên xử lý và nơi đặt (Supabase SG, Vercel sin1, GitHub Pages, GitHub Actions, Google, OpenFreeMap, bộ giải link Maps) · chuyển dữ liệu ra nước ngoài · thời gian lưu · quyền kèm thời hạn (xác nhận trong 2 ngày làm việc; 10/15/20 ngày) · cách tải về, rút đồng ý và xoá · Limited Use · 16+ · báo vi phạm trong 72 giờ · thay đổi · tóm tắt tiếng Anh | — | Có kiểu in (print stylesheet) |
| Điều khoản | `/dieu-khoan/` | Mọi người | Quy định sử dụng | Miễn phí, không bảo đảm, có thể ngừng với báo trước [SỐ NGÀY] ngày · nội dung và Drive vẫn là của bạn · sử dụng hợp lệ · hạn mức · 16+ · tạm khoá tài khoản · luật Việt Nam · liên hệ | — | — |
| Trợ giúp | `/tro-giup/` | Mọi người | Tự tìm câu trả lời | Các nhóm `<details>` (mục 10.13) | Gửi email hỗ trợ | — |
| Hướng dẫn cài | `/cai-ung-dung/` | Mọi người | Giải thích cách cài | Tab theo nền tảng · các bước có ảnh chụp | Mở WhereToGo → `/app/#/install` | — |
| 404 (tĩnh) | `/404.html` | Mọi người | Thoát khỏi link hỏng | Mục 10.15 | Về trang chủ | — |
| Thông báo chuyển nhà | Địa chỉ cũ `…github.io/WhereToGo/`, tạm thời | Mọi người | Chuyển các bản app đã cài của chủ app | "WhereToGo đã chuyển nhà" · link mới | Mở địa chỉ mới | Service worker tự huỷ |
| Cổng trình duyệt trong app | Lớp phủ từ `inapp.js`, không có URL | Mọi người | Google chặn đăng nhập trong webview | Mục 9.7 | Sao chép link | Đã chép / chép lỗi; Vẫn xem trang (chỉ trang tĩnh) |
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
| Quyền riêng tư & dữ liệu | `#/settings/privacy` · `PrivacyDataPage.tsx` | Đã đăng nhập | Quyền dữ liệu | Mục 10.11 | Tải dữ liệu | Đang xuất, Off tắt các thao tác |
| Xoá tài khoản | `#/settings/privacy/delete` · `DeleteAccountPage.tsx` | Đã đăng nhập | Xoá vĩnh viễn | Mục 10.11 | Xoá vĩnh viễn tài khoản | Đang xoá, Er + thử lại, xong → `/?da-xoa=1`, Off |
| Giới thiệu | `#/settings/about` · `AboutPage.tsx` | Đã đăng nhập | Lòng tin và ghi công | Phiên bản · "Dự án cá nhân, miễn phí, không quảng cáo của [TÊN NGƯỜI VẬN HÀNH]" · Có gì mới · Mã nguồn [LINK GITHUB] · ghi công (Be Vietnam Pro và Newsreader theo giấy phép SIL OFL, Ionicons, MapLibre, © OpenFreeMap © OpenStreetMap) | — | — |
| Cài ứng dụng | `#/install` · `features/install/InstallPage.tsx` (cùng nội dung với InstallSheet) | Đã hoặc chưa đăng nhập | Cài PWA (app web cài lên màn hình chính) | Mục 10.14 | Cài ngay (chỉ Android) | Đã cài |
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
- Luật large title trong `global.css`.

<!-- PHẦN TIẾP THEO -->
