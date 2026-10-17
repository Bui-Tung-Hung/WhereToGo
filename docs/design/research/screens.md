# WhereToGo web/src: inventory of every screen, sheet, modal and state (as of commit ff25e89)

## 0. Counts

- **Routes:** App.tsx:56-88 defines 13 real routes and 3 redirects (`/tabs/*` and `/` go to `/home`; `*` goes to `/`, which then goes to `/home`). There is no 404 page.
- **Page components:** the 13 routes use 9 components. `PlaceListPage` serves 4 routes: `/search` (App.tsx:59-62), `/favorites` (63-74), `/nearby` (75-78) and `/categories/:id` (79, through the CategoryPlacesPage wrapper). `PlaceFormPage` serves 2 routes (`/places/new` and `/places/:id/edit`, App.tsx:83,85).
- **Redesigned in UI part 1:** HomePage, SwipePage and the shared PlaceInfoSheet. The other 7 page components and 3 sheets still have the old look.
- **Sheets (IonModal):** 4. They are PlaceInfoSheet, AddVisitSheet, TimeWheelSheet and CategoryEditorSheet.
- **Other overlays:**
  - about 20 IonAlert dialogs
  - 1 IonLoading
  - 1 IonSelect action-sheet
  - about 12 toast messages
  - 3 banners or indicators
- **Static page:** 1 (`public/privacy.html`).

## 1. App shell and the three visual systems

**Boot**
- main.tsx:23-26 calls `setupIonicReact({mode:'ios'})`, so every platform gets the iOS look (Android and desktop too).
- main.tsx:34-44 waits for `initializeAuth()` to finish before it renders anything.
- index.html:13 has an empty `#root` with no splash, spinner or noscript. Users see a blank page until JS loads and the Supabase session check finishes.
- RequireAuth.tsx:17-19 returns `null` while auth is `loading`. That is a second blank flash.

**index.html**
- `lang="vi"`, title "WhereToGo".
- `theme-color` #FAFAF9 / #0C0A09 (index.html:6-7). This matches neither the home background (#f5f2e9) nor the swipe background (#f2ece1).
- No meta description and no Open Graph tags.
- The PWA manifest in vite.config.ts:61-80 uses `background_color` and `theme_color` #FAFAF9, with description "Kho địa điểm của riêng bạn".

**Theme A: old default** (`:root`, variables.css:8-65, dark mode at 67-118)
- Ivory #fafaf9, charcoal, gold `tertiary` #a16207.
- `primary` is #1c1917 in light mode, so buttons, chips and the FAB are near-black. In dark mode `primary` is #fafaf9 (white).
- Fonts: Playfair Display and Be Vietnam Pro (global.css:12-27).

**Theme B: `.wtg-theme-home`** (themes.css:8-44, dark 90-116)
- Cream #f5f2e9 with Apple blue #0071e3.
- Fonts: Playfair Display and Be Vietnam Pro.

**Theme C: `.wtg-theme-swipe`** (themes.css:46-87, dark 118-147)
- Warm cream #f2ece1 with orange #e8a359, plus rose for "pass" and cyan for "star".
- Fonts: **Fraunces and Plus Jakarta Sans** (fonts.css:18-19), a different font pair from the rest of the app.

**Dark mode** follows the system setting only. Nothing in the app lets users switch it.

**Responsive layout:** there is none.
- A grep for `max-width`, `@media (min-width)`, IonSplitPane, IonMenu and IonTabs finds only `swipe.css:376` (the action row, 340px) and global.css:83 (datetime).
- Every screen stretches to full width on desktop.

**Which screen uses which theme**

| Theme | Screens |
|---|---|
| B (home) | HomePage, plus PlaceInfoSheet when opened from Home |
| C (swipe) | SwipePage, plus PlaceInfoSheet when opened from Swipe. **The same sheet looks different depending on where it was opened** (PlaceInfoSheet.tsx:61). |
| A (old default) | Login, the 4 list routes, Detail, Form (new and edit), Settings, Manage tags, Manage categories, CategoryEditorSheet, TimeWheelSheet, AddVisitSheet, every IonAlert, toast and IonLoading, OfflineBanner, DriveReauthBanner |

Shared components change color with the page they sit on:
- ToggleChip (`color=primary`, ToggleChip.tsx:20) is near-black on Search and orange on Swipe.
- EmptyState's button (EmptyState.tsx:37) is blue on Home, orange on Swipe and black elsewhere.

## 2. Screen-by-screen inventory

### S1. Login: `#/login` (features/auth/LoginPage.tsx)

- **Reached from:** RequireAuth when signed out (RequireAuth.tsx:20-22); captureAuthRedirectError after an OAuth error (authRedirectError.ts:63); Sign out (SettingsPage.tsx:57).
- **Shows:** logo.svg 96px, "WhereToGo" in `.wtg-display`, tagline "Kho địa điểm của riêng bạn", one block button "Tiếp tục với Google", and a caption about the Drive permission (LoginPage.tsx:41-63).
- **Actions:** the only action is sign in, via Google OAuth PKCE with the drive.file scope and `prompt:'consent'`, redirecting to BASE_URL (authService.ts:76-91). There are no links to privacy, about, a demo or help.
- **States:** signing in (button disabled); error message from the URL or sign-in (`role=alert`, red caption).
  - There is no loading spinner after the click.
  - A signed-in user who opens `#/login` is not redirected; the login page renders again.
- **Theme:** A (old). Layout is inline styles.
- **UX problems:**
  - There is no landing content: no explanation of what the app does, no screenshots, no features, no privacy or terms link.
  - The error copy for `signup_disabled` is owner-only: "Hãy đăng nhập bằng tài khoản của chủ app" (authRedirectError.ts:43). This is wrong for a public app.
  - `prompt:'consent'` (authService.ts:84) forces the Google consent screen on every sign-in.
  - Deep links are lost. A protected URL opened while signed out goes to `/login`, and after OAuth the user lands on `/` and then `/home` (authService.ts:80).
  - On desktop the button is full width (`style={{width:'100%'}}`, LoginPage.tsx:48) with no max-width.

### S2. Home: `#/home` (features/home/HomePage.tsx), REDESIGNED

- **Shows:**
  - Header (HomeHeader.tsx): left-aligned "WhereToGo" (Playfair 800), OfflineIndicator, a heart button (Favorites) and an avatar button (Settings).
  - Card list (HomePage.tsx:119-151):
    - **DailyPickCard** "Hôm nay thử quán này": a random place, kept for the JS session (dailyPick.ts:56-60). It shows name, a 32px cover or category icon, address and a "Xem" button.
    - One **CategoryCard** per category, sorted by number of places (`sortCategoriesForHome`). Each shows label, prompt ("Chán cơm thì ăn gì?"…), a cluster of up to 5 round photos and a "+N" pill, or "Chưa có địa điểm".
    - Or a "Chưa có nhóm nào" card when there are no categories.
    - **NearbyCard** "Gần tôi / Quanh đây có gì?".
  - Dock (HomeDock.tsx): Search icon, a blue center FAB "+" (hidden offline, with a spacer), and the albums icon for Swipe.
- **Actions:**

| Element | Goes to |
|---|---|
| Heart | `/favorites` (HomeHeader.tsx:19) |
| Avatar | `/settings` (AvatarButton.tsx:12) |
| Daily pick card or "Xem" | PlaceInfoSheet (HomePage.tsx:125) |
| Category card | `/categories/:id` (CategoryCard.tsx:40) |
| "Chưa có nhóm nào" card | `/settings/categories` (HomePage.tsx:135) |
| Nearby card | `/nearby` (NearbyCard.tsx:25) |
| Dock search | `/search` |
| Dock "+" | `/places/new` |
| Dock albums | `/swipe` (HomeDock.tsx:20,29,40) |
| Pull to refresh | refetches places, categories and tags (HomePage.tsx:67-74) |

- **States:**
  - Offline with no cache: "Đang offline".
  - Error: "Không tải được dữ liệu" plus "Thử lại".
  - Loading: spinner.
  - 0 places: EmptyState "Chưa có địa điểm nào" with "Thêm địa điểm đầu tiên" (button only when online) (HomePage.tsx:76-117).
  - No categories: the special card described above.
  - Offline: the header cloud icon (OfflineIndicator.tsx) and the hidden FAB.
- **UX problems:**
  - A brand-new user sees only one empty state and the dock. Category cards, the Nearby card and any explanation of Swipe, Favorites or categories are hidden until the first place exists. There is no onboarding.
  - Category errors and loading are not handled (`categories = []`, HomePage.tsx:49). The "Chưa có nhóm nào" card can flash while categories are still loading.
  - Dock icons have no visible labels; only aria-labels (HomeDock.tsx:19,28,39). The albums icon for "Vuốt chọn quán" is not self-explanatory.
  - The avatar is the only way into Settings, and nothing visually says so.
  - The heart opens Favorites, but favorites are added with a **star** (the Favorites empty text says so, App.tsx:71). On Swipe the heart means "Hứng thú +1".
  - The daily pick opens a sheet rather than a page.
  - Text is small: labels 12px (home.css:72), pill 11px (home.css:204), daily badge icon 11px.
  - Desktop: cards span the full width with a 58/42 split (home.css:62,103). The dock pushes Search and Swipe to the far screen edges (`justify-content:space-between`, home.css:333-340).
  - Every card except the daily pick leads to the same old-look list page (see section 4).

### S3. Swipe: `#/swipe` (features/swipe/SwipePage.tsx), REDESIGNED

- **Shows:**
  - Header: round back pill, centered title "Chọn quán" with an orange dot and sub-line "VUỐT ĐỂ KHÁM PHÁ", avatar (SwipePage.tsx:105-121).
  - CategoryFilterBar ("Tất cả" plus one category, single select) and TagFilterBar (multi, OR).
  - "Còn N địa điểm" in 11px (swipe.css:73-77).
  - A stack of 3 cards with cover, up to 2 category chips, name, price and address (SwipeCard.tsx). Stamps "Hứng thú" and "Bỏ qua" appear while dragging.
  - SwipeTeaser: rating and category chip, price, name, story or address, and "Thông tin".
  - SwipeActions: Undo, X (−1), Star (favorite), Heart (+1), Info (SwipeActions.tsx).
- **Actions:**

| Action | Effect |
|---|---|
| Drag right or Heart | like, +1 |
| Drag left or X | skip, −1 |
| Star | toggles favorite without advancing the card |
| Undo | reverts the last swipe |
| Teaser or Info | PlaceInfoSheet (swipe theme) |
| Back | previous page, default `/home` |
| Avatar | `/settings` |

Swipe and undo outcomes come back as top toasts (useSwipeDeckController.ts:94-101,117).

- **States:**
  - Offline with no cache, error with retry, loading (SwipePage.tsx:61-87).
  - OfflineBanner above the filters (SwipePage.tsx:125); write buttons are disabled offline.
  - `no-places` → "Thêm địa điểm" goes to `/places/new` (when online).
  - `no-match`: **no action button** (SwipeEmptyState.tsx:39-46).
  - `finished` → "Xem lại từ đầu".
  - Busy lock while a card is flying or a write is in progress.
- **UX problems:**
  - **The +1/−1 interest score is never shown or used anywhere in the UI.** A grep shows `interestScore` only in repository, cache, types and tests. Users get a toast "+1 điểm hứng thú" with no visible consequence. It is also easily confused with the *status* "Hứng thú" (StatusChip.tsx:17), which is a different field.
  - Icon meanings are overloaded: star = favorite here (SwipeActions.tsx:63-71), star = rating elsewhere, and star = the "Thông tin nhanh" label in the sheet (PlaceInfoSheet.tsx:73). Heart = +1 here but heart = Favorites on Home.
  - The page is a near dead end. The only exits are Back and Avatar; there is no route to search or to add a place (except the `no-places` empty state).
  - `scrollY={false}` (SwipePage.tsx:122) with a fixed stack height `clamp(280px,44vh,380px)` (swipe.css:83). The plan sized this for 667pt or taller (PLAN-UI-1.md P29). On iPhone SE or a phone in landscape, the action row can be pushed off-screen with no way to scroll to it.
  - Desktop: the card is full-width × at most 380px (a very wide, short landscape crop), and the teaser is full width while the actions are capped at 340px.
  - A filter that matches nothing offers no "Xoá bộ lọc" button.
  - The tapping on the card itself does nothing; only the teaser or Info opens details.

### S4. List page (PlaceListPage.tsx), OLD look, 4 routes

| Route | Props | Reached from |
|---|---|---|
| `#/search` | title "Tìm kiếm" | dock search |
| `#/favorites` | `favoritesOnly`, custom empty text | Home heart |
| `#/nearby` | `mode="nearby"`, sorted by distance, asks for geolocation immediately | Nearby card |
| `#/categories/:id` | via CategoryPlacesPage.tsx:15-22, preset category, title = category name or "Nhóm" | category card |

- **Shows:**
  - iOS header with back chevron (text="") plus a condensed large title (PlaceListPage.tsx:230-243).
  - IonSearchbar ("Tìm tên, địa chỉ, ghi chú…").
  - TagFilterBar.
  - Status IonSegment: Tất cả, Hứng thú, Chưa đi, Đã đi (56-61, 262-273).
  - Sort IonSelect as an action-sheet (Mới cập nhật, Đánh giá cao), explore mode only (275-289).
  - PlaceCard list: 88px thumbnail, name, tags and price, stars, status badge, distance (PlaceCard.tsx).
  - Bottom-right IonFab "+" (294-300).
- **Actions:**
  - Card → `/places/:id` (PlaceCard.tsx:43).
  - FAB → `/places/new`.
  - Back → `/home`.
  - Pull to refresh (129-135); in nearby mode it also re-locates.
  - Location error → "Thử lại".
- **States:**
  - Nearby locating: spinner.
  - Nearby error: "Chưa có quyền vị trí" or "Không lấy được vị trí", with retry.
  - 0 places → "Thêm địa điểm đầu tiên".
  - Nearby with all places missing coordinates → "Chưa có địa điểm nào có vị trí" with long how-to copy.
  - No results: custom emptyTitle, or "Không tìm thấy địa điểm".
  - Caption "N địa điểm chưa có vị trí".
  - OfflineBanner; FAB hidden offline.
- **UX problems:**
  - **No loading or error handling for the places query.** `places = placesQuery.data ?? []` (line 83). On a first load or a network error the page shows "Chưa có địa điểm nào" plus "Thêm địa điểm đầu tiên" (163-176), which is wrong. Nearby mode also flashes "Không tìm thấy" while status is `idle`, before geolocation starts.
  - The permission-denied copy is **iOS Safari only** ("Vào Cài đặt → … → Trang web Safari", line 155). It is wrong for Android, desktop and Chrome users once the app is public.
  - Nearby triggers the browser permission prompt as soon as the page opens, with no explanation first. The planned "Gần tôi: trang hỏi" (U11) was not built.
  - The category page has none of the category's identity (icon, prompt, photos) and offers no category edit. Its FAB does not preselect the category, and Favorites' FAB does not mark the place as a favorite.
  - Favorites carries the full search, filter and sort UI, which is heavy for a short list.
  - The sort select has no visible label (aria-label only, 278).
  - No "clear filters" button on the no-result state.
  - There are two different "add" buttons in the app (the black corner FAB here versus Home's blue center glowing FAB).
  - The header style (iOS large title with a bottom border) differs from Home and Swipe.
  - Desktop: full-width cards and searchbar.

### S5. Place detail: `#/places/:id` (PlaceDetailPage.tsx), OLD look

Section 6.7 of PLAN-UI-1 only added the favorite star and Story here.

- **Reached from:** a PlaceCard, the sheet's "Xem đầy đủ" (PlaceInfoSheet.tsx:51-54), or after saving the form (PlaceFormPage.tsx:287).
- **Shows:**
  - Header with back, the place name as a small title, and a favorite star (online only) (137-158).
  - PhotoGallery: horizontal 4:3 at 85% width, or "Chưa có ảnh".
  - h1 with the name again (165-167).
  - StatusChip and StarRatingView (178-179).
  - Category IonBadges (`primary`, black) and tag badges (`light`) (182-200).
  - "Thông tin": address, price, distance (only if permission was already granted, 66-67), or "Chưa có thông tin." (202-220).
  - OpeningHoursView (badge plus a 7-row table).
  - Câu chuyện, Ghi chú.
  - "Các lần đi" with "+ Thêm lần đi" (online) and VisitLog.
  - Fixed footer: "Mở Google Maps" (gold `tertiary`) and "Sửa" (online) (260-295).
- **Actions:**
  - Star → toggles favorite, with a toast at the default bottom position that can overlap the footer.
  - Photo "Mở trong Google Drive" opens an external page (PhotoGallery.tsx:80-94).
  - Thêm lần đi → AddVisitSheet.
  - Visit row → swipe left → delete confirmation.
  - Mở Google Maps → external.
  - Sửa → `/places/:id/edit`.
- **States:**
  - Loading: plain text "Đang tải…" (89-104).
  - Missing → "Không tìm thấy địa điểm / có thể đã bị xoá" (106-125). **The same message appears for network errors and offline cache misses.** There is no retry.
  - OfflineBanner.
- **UX problems:**
  - The name appears twice (title and h1).
  - The header star (favorite) sits directly above the rating stars, so users cannot tell which is which.
  - "Mở Google Maps" here and "Chỉ đường" in the sheet do the same thing under different names.
  - Delete exists only inside the edit form.
  - No share button; no interest score, created date or visit count.
  - No full-screen photo viewer: tapping a photo does nothing, and the only option is opening it in Drive.
  - Category and tag badges are not tappable.
  - Opening hours default to 08:00–22:00 every day for new places (PlaceFormPage.tsx:75, D18). "Đang mở" may be fiction unless the user edited the hours.
  - Visits can be deleted only by swiping left (VisitLog.tsx:73-92). This is hidden, hard on desktop, and visits cannot be edited.
  - The visit log shows "Chưa có lần đi nào" while it is still loading (VisitLog.tsx:66-68).
  - Desktop: gallery images become huge (85% of a wide viewport at 4:3).

### S6. Place form: `#/places/new` and `#/places/:id/edit` (PlaceFormPage.tsx), OLD look

- **Shows:** one long scrolling form with 13 sections, in this order:
  1. Google Maps (paste button plus URL input that is parsed on blur)
  2. Tên *
  3. Địa chỉ
  4. Vị trí ("Dùng vị trí hiện tại", "Xoá vị trí", raw "21.02851, 105.85420" at 486-490, a no-coordinates hint)
  5. Ảnh (existing gallery with delete, new previews with ×, "Thêm ảnh")
  6. Nhóm * (chips plus "Nhóm mới")
  7. Nhãn (chips plus "Nhãn mới")
  8. Trạng thái segment (Hứng thú, Chưa đi, Đã đi; default "Chưa đi")
  9. Đánh giá (5 star buttons; tapping the selected star again clears it)
  10. Khoảng giá (Từ and Đến in ₫)
  11. Giờ mở cửa: OpeningHoursEditor with "Chưa rõ giờ", "Mở 24h cả tuần", then for each of 7 days a toggle, up to 3 ranges (each with open and close time buttons and a trash button), "+ Khung giờ", "Mở 24h", and "Áp dụng cho cả tuần" on Monday only (OpeningHoursEditor.tsx:150-263)
  12. Ghi chú (5000-character counter)
  13. Câu chuyện (5000-character counter)

  The edit form adds an outlined red "Xoá địa điểm" at the end (693-706).
- **Header:** "Huỷ" (asks to confirm discarding when the form is dirty, 171-188), the title "Địa điểm mới" or "Sửa địa điểm", and "Lưu" (disabled offline or while saving).
- **Overlays:**
  - IonLoading "Đang lưu… Đang tải ảnh i/n" (710-717).
  - Alerts: Bỏ thay đổi?, Không lưu được, Lỗi vị trí, Xoá địa điểm (with a Drive warning), and the delete error.
  - Toasts: "N ảnh không thêm được", paste success "Đã lấy tên và vị trí", parse errors.
- **Navigation:**
  - Save → `/places/:id` (replace).
  - Delete → `/home` (replace, 317).
  - Huỷ → `navigate(-1)`.
- **States:**
  - Edit loading "Đang tải…".
  - Edit load error EmptyState **without retry**. Its Huỷ calls `navigate(-1)` (338); on a deep link with no history this may do nothing or leave the app.
- **UX problems:**
  - Very long, with no sections, steps or progressive disclosure. The hours editor alone is about 30+ controls.
  - "Lưu" exists only in the top bar, and a validation error (for example Nhóm *) can be off-screen with no scroll-to-error.
  - Labels are doubled ("Tên *" group title plus an IonInput label "Tên", 414-426; the same for Địa chỉ).
  - **No OfflineBanner.** "Lưu" is silently disabled.
  - Discard confirmation only catches "Huỷ". The iOS edge-swipe back gesture and browser or hardware back skip it.
  - The difference between "Ghi chú" and "Câu chuyện" is never explained.
  - Raw coordinates mean nothing to users.
  - Default hours are 08:00–22:00 every day.
  - Time, star and photo-× buttons are unstyled native `<button>` (OpeningHoursEditor.tsx:191-215, StarRatingInput.tsx:26-40).
  - Photo order and cover photo cannot be chosen.
  - After a delete, history may still hold the deleted place's detail page, so Back can land on "Không tìm thấy".
  - Desktop: full-width inputs.

### S7. Settings: `#/settings` (SettingsPage.tsx), OLD look

- **Reached from:** only the avatar on Home and Swipe.
- **Shows:**
  - DriveReauthBanner "Cần kết nối lại Google Drive" with "Kết nối lại" (AuthProvider.tsx:171-201), shown only when `driveLinked===false`.
  - Tài khoản: the email, and an always-visible "Kết nối lại Google Drive" (82-97).
  - Dữ liệu: "Quản lý nhóm" → `/settings/categories`, "Quản lý nhãn" → `/settings/tags`, "Xoá ảnh đã lưu tạm" (toast) (99-124).
  - Ứng dụng: Phiên bản, and a static row "Dữ liệu offline: chỉ xem" (126-137).
  - "Đăng xuất" with confirmation, then `/login`.
- **States:** none beyond the banner.
- **UX problems:**
  - "Kết nối lại Google Drive" is always shown and starts a full OAuth redirect with no explanation.
  - Jargon: "Xoá ảnh đã lưu tạm".
  - The static "Dữ liệu offline: chỉ xem" row looks tappable but does nothing.
  - **Missing for a public app:** a privacy policy link (privacy.html is not linked anywhere in src; grep returns nothing), account or data deletion, export or backup, a theme switch, help or about, feedback, and a name or avatar display.

### S8. Manage tags: `#/settings/tags` (ManageTagsPage.tsx), OLD look

- **Shows:** a list of tags with the number of places using each.
- **Actions:** swipe left for "Đổi tên" (an alert with validation) or "Xoá" (confirmation "Nhãn sẽ bị gỡ khỏi N địa điểm").
- **Back:** shows the text "Cài đặt" (104). Every other back button has no text.
- **States:** empty shows plain "Chưa có nhãn nào." (110-112), which also flashes while loading. There is no offline guard on the swipe actions.
- **UX problems:**
  - **There is no way to create a tag here.** Tags can only be created from the TagPicker in the place form.
  - Actions are swipe-only, with no hint, and hard on desktop.
  - No loading state.

### S9. Manage categories: `#/settings/categories` (ManageCategoriesPage.tsx), OLD look

- **Shows:** a list with an icon, name, "N địa điểm · prompt" (or "Câu gợi ý mặc định"), sorted by creation.
- **Actions:**
  - Header "+" (icon only, online) → CategoryEditorSheet (new).
  - Tap a row → CategoryEditorSheet (edit), online only.
  - Swipe → "Xoá". It is blocked with "N địa điểm chỉ thuộc nhóm này…" when some places belong only to this category; otherwise it asks for confirmation (59-82).
  - Back shows "Cài đặt".
- **States:** plain empty text that also flashes while loading; actions hidden offline.
- **UX problems:**
  - The blocked-delete dialog does not link to the affected places.
  - Categories cannot be reordered. Home orders them by place count while this page orders them by creation date.
  - The meaning of "Câu gợi ý" (the big text on the Home card) is never explained, and there is no preview.

## 3. Sheets, dialogs, overlays and banners

| # | Element | Trigger | Content and actions | Theme | Problems |
|---|---|---|---|---|---|
| M1 | **PlaceInfoSheet** (PlaceInfoSheet.tsx) | Home daily pick; Swipe teaser or Info | Breakpoints 0/0.6/1, handle. Header row "★ Thông tin nhanh" with a close button (44px hit area, 28px visual). PlaceInfoHeader: 80px photo, up to 3 chips (categories accent, tags) plus "+N", name, price · "cách bạn X", address, open badge. "Chỉ đường" (only if a maps link exists) opens external; "Xem đầy đủ" → `/places/:id`. PlaceStoryBlock shows "Câu chuyện" or "Chưa có câu chuyện." | Redesigned; uses home OR swipe theme, so it looks different depending on the caller | No favorite toggle, no edit. The star icon on the label conflicts with its other meanings. The same content looks different in two places. |
| M2 | **AddVisitSheet** (visits/AddVisitSheet.tsx) | Detail "Thêm lần đi" | Breakpoint 0.75. Huỷ / "Thêm lần đi" / Lưu. Date wheel (max today) and Ghi chú (500 chars). Errors in an alert. | Old | Adding a visit **silently** changes the status to "Đã đi" (D16) with no toast. No success feedback. |
| M3 | **TimeWheelSheet** (opening-hours/TimeWheelSheet.tsx) | Any time button in OpeningHoursEditor | Breakpoint 0.5. Toolbar: Huỷ, plus "Hết ngày (24:00)" for closing times, plus Xong. IonDatetime time wheel in 5-minute steps, 24h format. | Old | Three buttons crowd the toolbar on narrow phones. |
| M4 | **CategoryEditorSheet** with CategoryEditorForm | Manage categories "+" or a row tap | Full height (breakpoints 0/1). Huỷ / "Nhóm mới" or "Sửa nhóm" / Lưu. Inputs: Tên, Câu gợi ý (placeholder is the default prompt). An icon grid of 21 options at 44px with no visible labels. | Old | No preview of the Home card. |
| D | **IonAlerts** | Various | Form: Bỏ thay đổi? (PlaceFormPage:177), Không lưu được (291), Lỗi vị trí (239), Xoá địa điểm (306), delete error (320). Paste: manual "Dán link Google Maps" textarea alert when clipboard read fails (PasteMapsLinkButton.tsx:42-59). Creation: "Nhóm mới" (CategoryPicker:63) and its error; "Nhãn mới" (TagPicker:54) and its error. Manage pages: Đổi tên nhãn (ManageTags:52), Xoá nhãn (86), Không xoá được nhóm / Xoá nhóm (ManageCategories:63,71). Others: Xoá lần đi (VisitLog:45), Đăng xuất (Settings:46), generic "Lỗi" alerts. | Old (default Ionic) | Creating a category or tag inside a bare alert offers no icon or prompt choice. |
| O | IonLoading | Saving the form | "Đang lưu…" plus photo progress | Old | |
| O | IonSelect action-sheet | List sort | Mới cập nhật / Đánh giá cao | Old | |
| T | Toasts | Various | Swipe outcomes at the **top**; favorite toggles; paste and link errors; photo errors; "Đã xoá ảnh đã lưu tạm". The others show at the bottom. | Old | Position is inconsistent (top on Swipe, bottom elsewhere). |
| B | OfflineBanner, OfflineIndicator, DriveReauthBanner | Offline or a Drive token problem | OfflineBanner "Đang offline — chỉ xem được" (OfflineBanner.tsx:24) on Swipe, Lists and Detail. OfflineIndicator is a cloud icon in the Home header. DriveReauthBanner appears only on Settings. | Old | The Drive problem surfaces only on Settings; Home and the Form never warn. Photo uploads fail with a toast. |
| I | AuthedImage states (AuthedImage.tsx:131-150) | Every photo | Skeleton while loading; a grey icon on error with **no retry**; "Chưa có ảnh xem trước" button that opens Drive. | | |

**Static page: `public/privacy.html`**
- Its own CSS uses the Theme A palette and fonts it never loads.
- Its copy says the app is a "ứng dụng cá nhân" (privacy.html:85).
- Data deletion is only by opening a GitHub issue (privacy.html:133,143-147).
- It has no link back to the app and is not linked from the app.

## 4. Why the owner sees the app as "only 2 pages"

1. **Only Home and Swipe were designed** (PLAN-UI-1.md:15-35). They are also the only screens with a distinctive look (Themes B and C). Every other screen uses the stock Ionic iOS look (Theme A): grey inset lists, black primary buttons, default alerts. These read as generic utility or settings screens rather than "pages" of the product.
2. **Four of Home's six entry points open the same component.** The search icon, the heart, every category card and the Nearby card all open `PlaceListPage`. Its layout is identical each time (search bar, tag chips, 4-way status segment, sort, list, FAB); only the title and preset filter change (App.tsx:59-79; PLAN-UI-1.md P9 calls this a temporary entry). A category card looks like a rich destination with photos and a prompt, but it opens a generic list with none of that identity. The fifth entry, the daily pick, opens a **sheet** rather than a page. The sixth, the avatar, opens Settings.
3. **Planned pages were never built** (UI-REDESIGN.md:222-233; PLAN-UI-1.md:26-35):
   - Trang chọn quán (U9)
   - New search page (U10)
   - Gần tôi: permission-ask page, map, and pin sheet (U11–U13)
   - Random page (U19–U21)
   - Favorites page (U22)
   - Old screens listed in section 4C were never decided.
4. **There is no landing, onboarding or marketing page.** Signed-out visitors see a single centered button. Signed-in new users see one empty state. No about, help, profile or stats page exists.
5. **There is no global navigation** (no tab bar, side menu or split pane). Home's dock has 3 unlabeled icons. Swipe has no dock at all. Settings is hidden behind the avatar.
6. **Numbers:** 13 routes → 9 page components → in practice about 6 distinct layouts (Login, Home, Swipe, List, Detail, Form) plus 3 settings-style lists. Only 2 of the 9 components (and 1 of the 4 sheets) carry the new design.

## 5. Navigation graph

```
(signed out, any route) → /login --Google OAuth--> / → /home     [deep link lost]
/login (signed in) → stays on /login (no redirect)
unknown hash → / → /home ; /tabs/* → /home

/home
 ├─ heart ─────────────→ /favorites   (PlaceListPage)
 ├─ avatar ────────────→ /settings
 ├─ daily pick / Xem ──→ [PlaceInfoSheet:home] ─ Chỉ đường → external Maps
 │                                             └ Xem đầy đủ → /places/:id
 ├─ category card ─────→ /categories/:id (PlaceListPage)
 ├─ "Chưa có nhóm" card → /settings/categories
 ├─ Nearby card ───────→ /nearby (PlaceListPage, geolocation prompt)
 ├─ empty "Thêm…" ─────→ /places/new
 └─ dock: search → /search | + → /places/new | albums → /swipe

/swipe
 ├─ back → /home ; avatar → /settings
 ├─ teaser / info → [PlaceInfoSheet:swipe] → Xem đầy đủ → /places/:id (back keeps the deck)
 └─ empty no-places → /places/new ; finished → restart ; no-match → (nothing)

/search | /favorites | /nearby | /categories/:id
 ├─ back → /home ; card → /places/:id ; FAB → /places/new ; empty → /places/new

/places/:id
 ├─ back → previous|/home ; star → toggle favorite ; photo → external Drive
 ├─ Thêm lần đi → [AddVisitSheet] ; visit swipe → [alert Xoá]
 └─ footer: Mở Google Maps → external ; Sửa → /places/:id/edit

/places/new, /places/:id/edit
 ├─ Huỷ → [alert Bỏ thay đổi?] → back(-1)
 ├─ Lưu → /places/:id (replace)
 ├─ time button → [TimeWheelSheet] ; Nhóm mới / Nhãn mới / Dán link → [alerts]
 └─ (edit) Xoá → [alert] → /home (replace)

/settings
 ├─ back → /home ; Kết nối lại → OAuth ; Đăng xuất → [alert] → /login
 ├─ Quản lý nhóm → /settings/categories ─ + / row → [CategoryEditorSheet] ; swipe → Xoá
 └─ Quản lý nhãn → /settings/tags ─ swipe → Đổi tên / Xoá   (no add)

privacy.html: not linked from anywhere in the app; no link out to the app.
```

## 6. Dead ends and unreachable items

**Unreachable**
- `privacy.html` cannot be reached from inside the app.
- No screen shows the interest score, so the results of swiping are invisible.
- Tag creation is only possible from the place form; the tag manager cannot create tags.

**Dead ends with no forward or recovery action**
- Swipe "Không có địa điểm nào khớp bộ lọc" (no clear-filter button).
- List "Không tìm thấy địa điểm" (no clear-filter button).
- Detail "Không tìm thấy địa điểm" (also shown for network or offline errors; back only, no retry).
- Edit form "Không tải được địa điểm" (no retry; its `navigate(-1)` may not work on a deep link).
- AuthedImage error state (no retry).
- Login has no secondary paths at all.

**Weakly connected**
- Swipe has no exits besides Back and Avatar.
- Settings is reachable only through the avatar.
- The tag and category managers are reachable only through Settings. The one exception is the Home "Chưa có nhóm nào" card.
- `/categories/<unknown id>` renders an empty list titled "Nhóm".
- After deleting a place, history may still hold its detail page, so Back can land on "Không tìm thấy".
- The iOS edge-swipe back gesture and browser back skip the form's unsaved-changes confirmation.