# THIẾT KẾ GIAO DIỆN MỚI (STITCH) — GHI CHÉP RESEARCH

Ngày: 2026-10-11. Chế độ: **RESEARCH**. Tài liệu chỉ ghi lại hiện trạng và các quyết định user đã nói; **chưa có kế hoạch triển khai**.
Nguồn: `stitch_web_page_builder.zip`, thư mục `img/` ở gốc repo, mã nguồn `web/` và `supabase/`, các câu trả lời của user trong phiên 2026-10-11.
Quy ước: `U#` = quyết định của user cho giao diện mới (giống cách đánh số `D#` trong [PLAN.md](PLAN.md)).

---

## 1. Gói Stitch đã tải

| Thư mục trong zip | Loại | Nội dung |
|---|---|---|
| `clubhouse_feed` | HTML tĩnh, nền sáng | Trang chủ "Pick ur interest": thẻ "Can Decide Yet? / Navigate" và 3 thẻ nhóm Lựa quán ăn / quán uống / nơi giải trí (mỗi thẻ có cụm 5 ảnh tròn và số "+N") |
| `clubhouse_feed_animated_interactive` | HTML + JS, nền sáng | Cùng màn trên, có thêm hiệu ứng: thẻ hiện lần lượt, nút "+" xoay, công tắc kính râm, nhãn LIVE |
| `dish_discovery_swipe_cards` | HTML + JS, nền tối | Vuốt thẻ kiểu Tinder với 4 món (bánh xèo, bánh mì, phở, cơm tấm). Nút bỏ qua / sao / tim / hoàn tác / thông tin |
| `dish_discovery_swipe_details_sheet` | HTML + JS, nền tối | Màn vuốt thẻ, có thêm thẻ tóm tắt và bảng chi tiết kéo từ dưới lên |
| `recipe_detail_screen` | HTML tĩnh, nền tối | Chi tiết một công thức nấu ăn ("Fish Tartare on Nori Shells") nhưng dùng ảnh bánh xèo |
| `matcha_club_logo` | SVG | Logo "matcha CLUB", không liên quan tới tên WhereToGo |
| 4 thư mục `crispy_…`, `delicious_…` | Chỉ có ảnh | Ảnh món ăn do AI tạo, 1024×1024, 1,7–2 MB mỗi ảnh |
| `image.png_1`, `image.png_2` | Ảnh tham chiếu | Ảnh chụp app Clubhouse, và app CREME có dòng "curated by Mobbin" |

Thư mục `img/` (12 ảnh) chỉ để minh hoạ thiết kế, không đưa vào app (U30). Ảnh trong các file HTML lấy từ `lh3.googleusercontent.com` (bản Stitch lưu), không lấy từ `img/`.

### 1.1 An toàn

- Không có `fetch`, `localStorage`, cookie, `eval` hay mã theo dõi. JS chỉ thay đổi giao diện ngay trên trang.
- Tài nguyên tải từ ngoài: Tailwind CDN (không ghi số phiên bản), Google Fonts, ảnh trên `lh3.googleusercontent.com`. Mở các file HTML cần có mạng.
- File zip sạch: không có đường dẫn lạ, không có file thừa, không có câu lệnh nào ẩn trong file.

### 1.2 Lỗi thấy trong thiết kế (để lưu ý khi vẽ lại)

- Chữ trong nhãn bị xuống dòng rồi tràn ra ngoài viền: "Golden / Turmeric", "Southern / Classic".
- Ảnh bánh xèo cắt tròn trên nền trắng, nên 4 góc thẻ bo tròn lộ vệt trắng.
- Màn vuốt thẻ: tên trong thông báo khác tên in trên thẻ ("Phở Bò Tái Lăn" so với "Phở Bò Tái Hà Nội"). Địa chỉ quán cũng khác nhau giữa hai file vuốt thẻ.
- Còn sót tên và nội dung của app gốc: `<title>Clubhouse</title>`, "Radio Alon", "Omer Alony", nút "Unmute" rỗng, tab "Recipe Details" trỏ tới `#recipe` (trang không có chỗ nào tên `recipe`).
- Logo "Matcha Club" (160×48) bị nhét vào ô 20×20, nên chỉ còn một chấm xanh.
- Một số class chỉ có ở Tailwind v4 (`shadow-xs`, `w-4.5`…) trong khi CDN tải v3. Kết quả là icon Chia sẻ/Yêu thích ở `recipe_detail_screen` to bất thường.
- Thiết kế vẽ sẵn khung điện thoại cố định (384px hoặc 393×852) với thanh trạng thái giả "9:41". Không xử lý vùng an toàn (tai thỏ, thanh home).
- Chữ nhỏ 9–11px. Nhiều nút chỉ 28–40px, nhỏ hơn mức 44pt dễ bấm của iOS.
- Giao diện tiếng Anh trộn dữ liệu tiếng Việt (`lang="en"`), dùng emoji làm icon.
- Ảnh xem trước `dish_discovery_swipe_cards/screen.png` bị cắt, chỉ còn khoảng 178px bên trái: **bỏ qua** (U31).

### 1.3 Màu và phông

| | Thiết kế Clubhouse | Thiết kế vuốt thẻ / công thức | App hiện tại |
|---|---|---|---|
| Chế độ | Chỉ sáng | Chỉ tối | Theo máy (sáng + tối) |
| Nền | Kem `#F5F2E9`, thẻ `#FBF9F4` | Tối `#141413`, thẻ `#1c1917` | `#fafaf9` / `#0c0a09`, thẻ `#ffffff` / `#1c1917` |
| Màu nhấn | Xanh `#0A84FF` | Cam `#E8A359` | Vàng đồng `#a16207` / `#eab308` |
| Phông nội dung | DM Sans | Plus Jakarta Sans | Be Vietnam Pro |
| Phông tiêu đề | Playfair Display 800 | Fraunces | Playfair Display 600 |
| Bo góc thẻ | 24px, có bóng | 28–32px, có bóng | 16px, không bóng |

---

## 2. App hiện tại (để đối chiếu)

| Màn hình | Đường dẫn | File |
|---|---|---|
| Đăng nhập | `#/login` | `features/auth/LoginPage.tsx` |
| Khám phá (danh sách) | `#/tabs/explore` | `features/places/PlaceListPage.tsx` (`mode="explore"`) |
| Gần tôi (danh sách) | `#/tabs/nearby` | `features/places/PlaceListPage.tsx` (`mode="nearby"`) |
| Cài đặt | `#/tabs/settings` | `features/settings/SettingsPage.tsx` |
| Chi tiết địa điểm | `#/places/:id` | `features/places/PlaceDetailPage.tsx` |
| Thêm / Sửa địa điểm | `#/places/new`, `#/places/:id/edit` | `features/places/PlaceFormPage.tsx` |
| Quản lý nhãn | `#/settings/tags` | `features/tags/ManageTagsPage.tsx` |
| Bảng ghi lần đi, bảng chọn giờ mở cửa | kéo từ dưới lên, nằm trong các trang trên | `features/visits/AddVisitSheet.tsx`, `features/opening-hours/TimeWheelSheet.tsx` |

- **Điều hướng:** 3 tab dưới cùng Khám phá · Gần tôi · Cài đặt ([Tabs.tsx](../web/src/app/Tabs.tsx)); nút **+** ở góc dưới phải, ẩn khi offline.
- **Danh sách Khám phá:** ô tìm kiếm (tên, địa chỉ, ghi chú), chip lọc nhãn, lọc trạng thái Tất cả / Hứng thú / Chưa đi / Đã đi, sắp xếp Mới cập nhật / Đánh giá cao, kéo để làm mới.
- **Dữ liệu một địa điểm (bảng `places`):** tên, địa chỉ, vĩ độ/kinh độ, link Google Maps, sao tự chấm 1–5, giá thấp nhất/cao nhất (VNĐ), ghi chú (`notes`, tối đa 5000 ký tự), trạng thái (`interested` / `not_visited` / `visited`), giờ mở cửa. Các bảng liên quan: `tags` + `place_tags` (một địa điểm gắn được nhiều nhãn; 4 nhãn mặc định Ăn uống, Vui chơi, Du lịch, Hẹn hò), `photos` (ảnh trên Google Drive), `visits` (các lần đi).
- **Không có:** bản đồ nhúng (chưa dùng thư viện bản đồ nào), vuốt thẻ, chọn ngẫu nhiên, avatar (không đọc ảnh đại diện Google), "nhóm" tách riêng khỏi nhãn.
- **Toạ độ:** theo ghi chú ngày 2026-09-29, cả 3 địa điểm trong DB đều chưa có toạ độ.

---

## 3. Ý tưởng giao diện mới — quyết định của user

### 3.1 Cách đi giữa các trang

```
Trang chủ (kiểu Clubhouse)
├─ Thẻ nhóm ─────────────► Trang chọn quán ──► Chi tiết địa điểm
├─ Thẻ Gần tôi ──────────► Gần tôi: hỏi ──► Gần tôi: bản đồ ──(bấm ghim)──► Bảng trượt lên ──► Google Maps
├─ Nút Search ───────────► Trang tìm kiếm
├─ Avatar ───────────────► Cài đặt
├─ Nút + (giữa đáy) ─────► Thêm địa điểm
├─ Nút vuốt thẻ (dưới phải) ──► Trang vuốt thẻ ──(nút thông tin / thẻ tóm tắt)──► Bảng chi tiết kéo lên
└─ Nút ngẫu nhiên (dưới phải) ─► Trang ngẫu nhiên
```

### 3.2 Quyết định theo từng trang

**Trang chủ**

| # | Quyết định |
|---|---|
| U1 | Bố cục theo `clubhouse_feed`. Bỏ thư, chuông, công tắc kính râm (có thể đặt thứ khác vào chỗ đó, chưa quyết). Giữ nút Search và avatar |
| U2 | Avatar lấy ảnh tài khoản Google. Bấm avatar mở Cài đặt. Không có nút bánh răng |
| U3 | Mỗi thẻ nhóm hiện số địa điểm đã thêm trong nhóm ("+N") và cụm 5 ảnh tròn lấy từ ảnh mới thêm gần đây. **Danh sách nhóm: chưa quyết, cần bàn** |
| U4 | Có một thẻ Gần tôi nằm dưới các thẻ nhóm |
| U5 | Nút **+** ở giữa đáy, mở form thêm địa điểm hiện có |
| U6 | Nút vuốt thẻ và nút ngẫu nhiên nằm ở góc dưới phải |
| U7 | Thẻ "Can Decide Yet? / Navigate": chưa quyết, user đang suy nghĩ |
| U8 | Bỏ thanh 3 tab. Bỏ danh sách Khám phá |

**Trang chọn quán** (chưa có thiết kế)

| # | Quyết định |
|---|---|
| U9 | Mở khi bấm thẻ nhóm. Hiện nhiều quán trên một màn hình. Bấm một quán mở trang chi tiết đầy đủ |

**Trang tìm kiếm** (chưa có thiết kế)

| # | Quyết định |
|---|---|
| U10 | Lọc được theo nhóm, khoảng giá, khoảng cách |

**Gần tôi** (chưa có thiết kế)

| # | Quyết định |
|---|---|
| U11 | Trang hỏi: nhóm (bắt buộc), tầm giá (không bắt buộc), bán kính km (không nhập thì lấy 3 km) |
| U12 | Trang bản đồ giống Google Maps, các quán khớp được đánh dấu bằng ghim |
| U13 | Bấm ghim thì bảng thông tin trượt lên (giống ở trang vuốt thẻ): ảnh, khoảng giá, địa chỉ, nút chỉ đường. Bấm nút chỉ đường thì mở Google Maps **tại quán** (thấy ghim và thông tin quán; muốn đi thì tự bấm "Đường đi"), giống nút "Mở Google Maps" hiện nay |

**Trang vuốt thẻ** (theo `dish_discovery_swipe_cards`)

| # | Quyết định |
|---|---|
| U14 | Mỗi thẻ là một quán. Tiêu đề thẻ là tên quán |
| U15 | Có bộ lọc nhóm. Không bỏ những nơi đã đi |
| U16 | Vuốt phải: điểm hứng thú **+1** (lưu DB). Vuốt trái: **−1** và bỏ qua trong lần xem này. Nút sao: bật/tắt Yêu thích (bấm lần nữa để bỏ) |
| U17 | Không có thanh dưới. Chỉ có nút quay lại và avatar (mở Cài đặt) |
| U18 | Bấm nút thông tin hoặc thẻ tóm tắt: bảng chi tiết kéo từ dưới lên (theo `dish_discovery_swipe_details_sheet`). Bỏ nốt vị, nguyên liệu, dietary. Giữ **câu chuyện** |

**Trang ngẫu nhiên** (chưa có thiết kế)

| # | Quyết định |
|---|---|
| U19 | Chỉ lọc theo nhóm (nhóm nào cũng được), không lọc giá hay khoảng cách. **Chọn nhóm là bắt buộc** (đổi lại ngày 2026-10-16) |
| U20 | Trả về tối đa 3 nơi cùng nhóm. Khớp ít hơn 3 thì trả về số còn lại. Không có nơi nào thì hiện dòng chữ "Chưa thêm gì vào thì đào đâu ra mà random" (user sẽ tự thiết kế) |
| U21 | Có nút quay lại số. Mỗi lần quay bốc lại hoàn toàn ngẫu nhiên (có thể ra lại quán cũ). Không loại quán "Đã đi" |

**Yêu thích**

| # | Quyết định |
|---|---|
| U22 | Trang riêng, hay bộ lọc trong trang vuốt thẻ: chưa quyết |

**Dữ liệu**

| # | Quyết định |
|---|---|
| U23 | **Điểm hứng thú:** trường số mới trong DB, tách khỏi trạng thái Hứng thú / Chưa đi / Đã đi. Cộng dồn qua các lần vuốt, được âm. Trước mắt chỉ lưu, cách dùng tính sau |
| U24 | **Yêu thích:** đánh dấu mới, tách khỏi trạng thái và số sao tự chấm |
| U25 | **Câu chuyện:** trường mới, khác Ghi chú. User tự gõ |
| U26 | "Món" chính là một quán/địa điểm. Không thêm trường "món đặc trưng" (tên quán đã có hoặc user tự ghi) |

**Giao diện chung**

| # | Quyết định |
|---|---|
| U27 | Mọi trang theo chế độ sáng/tối của máy. User tự làm cả bản sáng và bản tối trên Stitch |
| U28 | Mỗi thiết kế giữ màu và phông riêng như trong Stitch (có thể vẽ lại sau) |
| U29 | Toàn bộ chữ trên giao diện bằng tiếng Việt |
| U30 | Ảnh trong `img/` chỉ để minh hoạ thiết kế |
| U31 | Bỏ qua ảnh xem trước bị cắt của `dish_discovery_swipe_cards` |

**Bổ sung ở INNOVATE (2026-10-16)**

| # | Quyết định |
|---|---|
| U32 | "Nhóm" là các nhãn kiểu chỗ ăn, chỗ uống, chỗ chơi… Sau này phải thêm được nhóm mới. Một quán được nằm trong nhiều nhóm. **Quan hệ nhóm và nhãn đang được làm rõ lại** (2026-10-16) |
| U33 | Thẻ "Can Decide Yet?" thành **"Hôm nay thử quán này"**, đổi quán mỗi lần mở lại app |
| U34 | Chỗ của thư, chuông, kính râm: nút tim mở Yêu thích, và biểu tượng offline (đã xác nhận) |
| U35 | Bản đồ Gần tôi: **MapLibre + OpenFreeMap** |
| U36 | Lấy toạ độ: **cách A** (lấy link từ màn Chỉ đường hoặc thả ghim của Google Maps, hoặc dán chuỗi "vĩ độ, kinh độ"). Có hướng dẫn ngay trong trang thêm quán, làm theo gợi ý của Claude |
| U37 | Điểm hứng thú lưu **cả** bảng ghi từng lần vuốt **và** cột tổng (đã xác nhận) |
| U39 | **Nhóm và nhãn là HAI khái niệm riêng** (cách 2). Nhóm: ít, hiện thành thẻ trên trang chủ, dùng cho các bộ lọc bắt buộc. Nhãn: tự do, chỉ để mô tả thêm và tìm kiếm. User tự thêm được cả hai |
| U40 | "Du lịch" là nhóm. "Hẹn hò" chỉ là nhãn mô tả |
| U41 | Thứ tự thẻ nhóm trên trang chủ do app tự xếp (tiêu chí chưa chốt) |
| U42 | Mỗi quán **bắt buộc** thuộc ít nhất 1 nhóm |
| U43 | Chuyển đổi 4 nhãn cũ: "Ăn uống" tách thành hai nhóm "Quán ăn" và "Quán uống"; "Vui chơi" thành nhóm "Chỗ chơi"; "Du lịch" thành nhóm; "Hẹn hò" giữ là nhãn |
| U44 | Lọc theo nhãn có ở trang tìm kiếm và trang vuốt thẻ, **không** có ở trang ngẫu nhiên |
| U45 | Nhóm ban đầu: Quán ăn, Quán uống, Chỗ chơi, Du lịch (suy ra từ U43) |
| U38 | Cách làm việc: **C** — user sửa 2 trang Stitch hiện có theo quyết định (có đủ sáng/tối), DB đổi một lần, xây theo từng phần song song với việc user thiết kế các trang sau |

**MẶC ĐỊNH do Claude đặt (2026-10-16)**

User giao: làm theo các quyết định đã có, câu nào còn mở thì đặt mặc định, user sửa sau.

| # | Mặc định |
|---|---|
| M1 | Form thêm nhóm **kiểu C**: tên bắt buộc; câu gợi ý và biểu tượng tuỳ chọn, bỏ trống thì dùng mẫu chung. 4 nhóm ban đầu lấy câu từ Stitch: Quán ăn "Chán cơm thì ăn gì?", Quán uống "Chán nước thì uống gì?", Chỗ chơi "Chán ở nhà thì đi đâu?", Du lịch "Cuối tuần trốn đi đâu?" |
| M2 | Thẻ nhóm xếp theo **số quán nhiều nhất lên đầu**; bằng nhau thì theo thứ tự tạo |
| M3 | Khi chuyển đổi: quán gắn "Ăn uống" (và quán chưa có nhóm nào) tạm vào nhóm **Quán ăn**; user tự sửa sau |
| M4 | "Hôm nay thử quán này" bốc từ **tất cả quán**; bấm vào mở **bảng trượt lên** |
| M5 | Bảng trượt lên gồm: ảnh, tên, nhóm và nhãn, giá, địa chỉ, khoảng cách (nếu có toạ độ), Đang mở/Đã đóng, câu chuyện, nút "Chỉ đường" (mở Google Maps tại quán), nút "Xem đầy đủ" (mở trang chi tiết) |
| M6 | Vuốt thẻ: "lần xem" kết thúc khi **rời trang**; hết thẻ thì hiện "Đã xem hết" và nút "Xem lại từ đầu"; giữ nút **hoàn tác** lần vuốt cuối như thiết kế; khi **offline thì khoá vuốt và nút sao** (đúng D13) |
| M7 | Thay DM Sans bằng **Be Vietnam Pro** (đã có trong app, có đủ chữ tiếng Việt, không tăng dung lượng). Giữ Playfair Display cho tiêu đề trang chủ; trang vuốt thẻ giữ Plus Jakarta Sans và Fraunces |
| M8 | Bản tối của trang chủ và bản sáng của trang vuốt thẻ (Stitch chưa có): Claude tự suy ra theo cùng phong cách; user thay bằng thiết kế của mình sau |

### 3.3 Khác với quyết định cũ

| Trước đây | Giao diện mới |
|---|---|
| D15: 3 tab Khám phá · Gần tôi · Cài đặt | Trang chủ kiểu Clubhouse, bỏ tab và danh sách Khám phá (U8) |
| Quyết định ở INNOVATE ngày 2026-09-23 (không ghi trong PLAN.md): giai đoạn 1 không nhúng bản đồ, chỉ có nút "Mở Google Maps" | Gần tôi có bản đồ ngay trong app (U12) |
| D14: trắng ngà / đen than / vàng đồng, Playfair + Be Vietnam Pro, không đổ bóng | Màu và phông theo Stitch (U28) |
| Gợi ý ngẫu nhiên để sau | Có trang ngẫu nhiên (U19–U21) |
| D16: chỉ có 3 trạng thái | Giữ 3 trạng thái, thêm điểm hứng thú (U23) và Yêu thích (U24) |

---

## 4. Danh sách trang cần thiết kế

Tổng hợp từ các quyết định ở mục 3. Không có trang nào do tôi tự thêm.

> **Phần 1 đã làm (2026-10):** theo [PLAN-UI-1.md](PLAN-UI-1.md) — trang chủ (8), trang vuốt thẻ (9), bảng trượt lên dùng chung (10), form Thêm/Sửa có chọn nhóm và Câu chuyện, chi tiết có nút Yêu thích và Câu chuyện, trang Quản lý nhóm. Tìm kiếm, Yêu thích, thẻ nhóm và Gần tôi tạm mở danh sách cũ đã lọc sẵn. Các trang ở nhóm A (trừ phần tạm này) để các phần sau.

**A. Trang mới, chưa có thiết kế Stitch: 6 trang, thêm 1 trang chưa quyết**

| # | Trang | Theo |
|---|---|---|
| 1 | Trang chọn quán | U9 |
| 2 | Trang tìm kiếm | U10 |
| 3 | Gần tôi: trang hỏi | U11 |
| 4 | Gần tôi: trang bản đồ | U12 |
| 5 | Gần tôi: bảng trượt lên khi bấm ghim | U13 |
| 6 | Trang ngẫu nhiên (cả trường hợp 0 kết quả) | U19–U21 |
| (7) | Yêu thích | U22, chưa quyết |

**B. Đã có thiết kế Stitch, phải sửa theo quyết định: 3 trang**

| # | Trang | Cần đổi |
|---|---|---|
| 8 | Trang chủ | U1–U8 |
| 9 | Trang vuốt thẻ | U14–U17, chữ tiếng Việt |
| 10 | Bảng chi tiết kéo lên | U18 |

Mỗi trang ở A và B cần **2 bản (sáng và tối)** theo U27, tức khoảng 18–20 bản.

**C. Màn app đang có, user chưa quyết làm lại hay giữ: 7 màn**

Đăng nhập · Thêm/Sửa địa điểm (sẽ có thêm ô Câu chuyện theo U25) · Chi tiết địa điểm · Cài đặt · Quản lý nhãn · Bảng ghi lần đi · Bảng chọn giờ mở cửa.

**Bị bỏ:** danh sách Khám phá (U8). Danh sách Gần tôi được thay bằng luồng hỏi → bản đồ (U11–U13).

**Các trạng thái app hiện đã xử lý ở trang tương ứng** (ghi lại để tham khảo): chưa có địa điểm nào · không tìm thấy kết quả · đang offline · chưa có quyền vị trí · địa điểm chưa có toạ độ · đang tải.

---

## 5. Ghi chú quan sát được

- Ghim trên bản đồ và lọc khoảng cách (Tìm kiếm, Gần tôi) chỉ tính được cho quán **đã có toạ độ**. Quán không có toạ độ sẽ không có ghim và không khớp lọc khoảng cách.
- Nút "Mở Google Maps" hiện nay ([buildGoogleMapsLink.ts](../web/src/features/places/buildGoogleMapsLink.ts)) chọn link theo thứ tự: (1) link Google Maps đã dán, (2) toạ độ, (3) tìm theo "tên, địa chỉ". Nút mở bản đồ tại vị trí quán, không mở thẳng chế độ chỉ đường.
- Trang ngẫu nhiên: khi một nhóm chỉ có 1–3 quán, mỗi lần quay lại số vẫn ra đúng các quán đó.
- Trong app, một địa điểm gắn được **nhiều nhãn**. Nếu nhóm trên trang chủ chính là nhãn, một quán có thể nằm trong nhiều nhóm cùng lúc.
- Các file HTML của Stitch phụ thuộc mạng (Tailwind CDN, Google Fonts, ảnh lh3), trong khi app hiện tại đóng gói sẵn phông và chạy được offline ở chế độ xem.

---

## 6. Câu hỏi còn mở (cập nhật 2026-10-16)

Đã xong: nhóm và nhãn (U39–U45), thẻ "Can Decide Yet?" (U33), chỗ của thư/chuông/kính râm và lối vào Yêu thích (U34), nút chỉ đường mở tại quán (U13).

**Câu 1–7 dưới đây đã được đặt mặc định M1–M8 (mục 3.2)**; user có thể sửa lại sau.

**Từng cần trả lời trước khi lập PLAN phần đầu** (trang chủ, vuốt thẻ, bảng trượt lên, đổi DB một lần):

1. **Form thêm nhóm**: kiểu A (nhập tên, câu gợi ý, biểu tượng), B (chỉ tên) hay C (tên bắt buộc, còn lại tuỳ chọn)? Câu này quyết định nhóm lưu những cột nào trong DB.
2. **Tiêu chí app tự xếp thẻ nhóm** (U41): nhiều quán nhất, có quán mới thêm gần nhất, thứ tự tạo, hay tên A → Z?
3. **3 quán đang gắn "Ăn uống"**: khi chuyển đổi thì vào nhóm nào (bạn tự chọn lại, hay app gán tạm "Quán ăn")?
4. **"Hôm nay thử quán này"**: chọn từ tất cả quán, bỏ quán "Đã đi", hay ưu tiên quán "Hứng thú"? Bấm vào thì mở trang chi tiết hay bảng trượt lên?
5. **Bảng trượt lên** (U18): ngoài câu chuyện, giữ những phần nào (ảnh, giá, địa chỉ, khoảng cách, "Đang mở", nhãn, nút chỉ đường, "Xem đầy đủ")?
6. **Vuốt thẻ**: một "lần xem" kết thúc khi nào (rời trang, hay đóng app)? Hết thẻ thì hiện gì? Khi offline thì khoá hay lưu tạm?
7. **Phông DM Sans** (không có chữ tiếng Việt): đổi sang phông khác, hay giữ DM Sans và mượn Be Vietnam Pro cho chữ có dấu?

**Để sau** (trả lời khi thiết kế các trang tiếp theo):

8. Có gộp trang chọn quán, tìm kiếm và Yêu thích thành một trang lưới không?
9. **Trang tìm kiếm** (U10): có ô gõ chữ, lọc trạng thái, sắp xếp không? Bấm một kết quả thì mở trang chi tiết?
10. **Trang lưới**: mỗi quán hiện những gì (ảnh, tên, giá, khoảng cách, sao, trạng thái…)?
11. **Nút chỉ đường**: giữ thứ tự tìm quán hiện tại (link đã dán → toạ độ → tên), hay luôn tìm theo tên quán?
12. **Quản lý nhóm**: trang riêng, hay chung một trang với Quản lý nhãn?
13. **Các màn ở mục 4C**: làm lại theo giao diện mới hay giữ nguyên? Riêng form Thêm/Sửa địa điểm chắc chắn phải thêm: chọn nhóm (bắt buộc), chọn nhãn, ô Câu chuyện.
