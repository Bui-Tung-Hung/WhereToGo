# WhereToGo final design spec: "Sổ tay" (v1, 2026-10-17)

Written for the mockup artists and the doc writer. The prose is in English and every piece of UI copy is in Vietnamese. **[KIỂM TRA]** means "check this on a real device or the live Google page before shipping". Square brackets in capitals, such as [TÊN MIỀN] or [EMAIL HỖ TRỢ], are placeholders for the owner to fill in.

---

## 0. Verdict

1. **Winner: Direction A, "Sổ tay"** (the notebook). Judge scores: trust 8, craft 8, build 7, total 23. C scored 21 and B scored 16.
2. A grows out of the cream Home screen the owner already approved, so the redesign reads as "the rest of the app caught up" rather than a new app.
3. A had the most complete public-launch compliance: one consent per purpose, boxes that depend on each other, a downloadable consent record, and the account is deleted if the user declines. Its trust copy is also honest.
4. A reuses the most existing code (`HomePage`, `HomeDock`, `DailyPickCard`, `CategoryCard`, the flat `IonRouterOutlet`). That makes it the lowest routing risk for a developer working alone.
5. A's weaknesses can all be fixed, and are fixed below: the dock is too tight at 360 px, diacritics get clipped in titles, some accent contrast margins are thin, the look is close to a generic "warm editorial" template, and Roboto was not bundled.

**Taken from C:**
- the dense list row with paging and `content-visibility`;
- search filters stored in the URL;
- the GeoJSON cluster pins, padded tap box and hollow user-location dot;
- the `:root, :root.ios` token selectors and turning Ionic animations off for reduced motion at boot;
- a separate delete-account page that offers export first;
- the plain explanation of nhóm versus nhãn;
- the full list of data types in consent box 1;
- the "quyền hẹp nhất (drive.file)" wording;
- the "Dữ liệu minh hoạ" caption on screenshots;
- the FAQ line "Dịch vụ không cam kết chạy mãi";
- the separate offline sign-in state.

**Taken from B:**
- "Độ hot" with the flame icon;
- the bundled Roboto Medium subset for the Google button;
- the explicit `/app/` scope and `start_url`;
- the Swipe keyboard map;
- the sign-out sheet ("máy này" versus "mọi thiết bị");
- the line "Ô nào không chọn, app không làm việc đó.";
- the Android Chrome intent link, with a selectable URL when copying fails;
- a solid info panel under the swipe photo;
- one celebratory decision moment, redrawn in A's language as the red-pen mark and "Chốt quán này".

**Rejected:**
- from B: the Duo page (scope the owner did not ask for), nhóm tints assigned by hash (frequent collisions), the Paytone font (clips Vietnamese diacritics), and the sticker look (it disappears in dark mode);
- from C: the map as a main tab (it puts MapLibre on the critical path and sends every saved area to OpenFreeMap), a tab bar placed inside each page, the one-font system (looks generic), and the "40k" price format;
- a global tab bar in general (see V4).

**Where each judge finding is fixed:**

| Finding | Fix |
|---|---|
| Old github.io address returns a 301, and installed copies never update | Ship a "moved" release with a self-destroying service worker *before* setting the domain (§6, phase P4) |
| `ALLOWED_ORIGINS`, the tunnel regex and wildcard redirects | P4 |
| Lazy chunks end up precached; no total precache budget | `globIgnores`, a runtime cache, and a 2.5 MB total budget (§6) |
| "Cài ngay" button on static pages | Install only inside `/app/` (V33) |
| Consent guard blocks offline use; token lost on reload | Drive is requested incrementally after consent; consent is cached on the device (V26, V27, §7.6) |
| Sheets cannot become dialogs through CSS alone | `WtgSheet` wrapper (§5) |
| Theme switch needs `color-scheme` and a `theme-color` rewrite | §4.9 |
| Manifest needs an `id` | §6 |
| The 5-slot dock overflows at 360 px | Labels measured (longest is 57.6 px) and fixed at 12 px (§5) |
| Newsreader optical size and font cost | Accepted; fonts total 145 KB (§4.2) |
| Gaps in the Ionic mapping; split pane is 270 px wide; menu swipe conflicts | §4.9, §2 |
| `color-mix()` fails on iOS 16.0–16.1 | Literal step colours (§4.9) |
| Grid collapses to one column on phones | Fixed 2 columns below 600 px (§5) |
| Location promise is false; OpenFreeMap not disclosed | V37, §6, §7 |
| No decision on the supabase.co domain shown by Google | V29 and Q2 |
| Google Drive is granted before the Law 91 consent | V26 |
| Typing "XOÁ" can block deletion | Checkbox confirmation instead (§8.11) |
| Policy changes, offline use and existing accounts | §7.5, §7.6 |
| Withdrawal appears twice; withdrawing a required item | Merged; "Rút lại = xoá tài khoản" (§8.11) |
| Cross-border transfer dossier | P6 and Q10 |
| Copy says "nothing is created" before consent; sign-in page uses browsewrap wording | §7.1 |
| "Bắt đầu miễn phí", raw "drive.file" jargon, an extra tap on step 2 | §6, §7.3 |
| Form has no "Drive missing" state; export is not human-readable | §8.9, §8.11 |
| Diacritics clipped in Ionic titles | No large titles; `ion-title` line-height 1.65; clamp padding (§4.3) |
| Look is close to the AI default | Red-pen mark, date line, serif numerals (V14) |
| Toast action colour; accent text on accent-soft | Defined in §4.1 (5.44:1) |
| "Muốn đi" versus "Hứng thú" confusion | V11, V12 |
| Row density for 300+ places; map pin spec | §5 |

---

## 1. Decisions (V1–V37)

| # | Decision | Changes |
|---|---|---|
| V1 | One visual style, "Sổ tay", on every app page, sheet and public page, in light and dark: cream paper, ink text, a brick-red "red pen" accent and serif headings | replaces U28, M7, M8, P24, P37 |
| V2 | Public sign-up for anyone with a Google account, starting with an invite-only beta (Q4) | replaces D24 (also SETUP step 10, test D-13) |
| V3 | Custom domain [TÊN MIỀN]. Static public site at `/`, the app at `/app/` (manifest `id` and `scope` are `/app/`, `start_url` is `/app/#/home`). Hosting stays on GitHub Pages | amends D1, D11, base in D3 |
| V4 | On phones, Home stays the hub. Its dock gets 5 labelled slots: `Tìm · Yêu thích · (＋ Thêm) · Vuốt · Bốc thăm`. No tab bar on other pages | keeps U5, U6, U8; amends U34 (heart moves out of the header) |
| V5 | At 1024 px and wider: `IonSplitPane` with a 248 px sidebar. From 768 to 1023 px: the phone layout, centred at 720 px | adds to U8 (desktop only) |
| V6 | One header pattern: 44 px back button; the toolbar title appears only after the h1 in the content scrolls away; at most 2 icons plus a ⋯ menu. No Ionic large titles | replaces the large-title rule in global.css |
| V7 | Fonts: Be Vietnam Pro 400/600 and Newsreader Variable, plus an 8 KB Roboto Medium subset used only on the Google button. Drop Playfair, Fraunces, Plus Jakarta Sans and Be Vietnam Pro 500 | replaces M7, P6, P22, P23 |
| V8 | Text is never smaller than 12 px. Vietnamese is never set in all capitals | replaces P36 |
| V9 | Appearance setting in Tài khoản: Theo máy (default), Sáng, Tối | amends U27 |
| V10 | Each icon has one meaning. Yêu thích is always a heart, including on Swipe | amends U16 (icon), P34 |
| V11 | The swipe score is shown as **Độ hot** with a flame icon. The right-swipe action is "Hot", the stamp reads "+1 hot", the toast reads "+1 độ hot", and the sort option is "Hot nhất" | amends U16/U23 wording, P11 |
| V12 | Status keeps the names Hứng thú · Chưa đi · Đã đi. "Hứng thú" uses the `flag` icon. Adding a visit that switches the status to Đã đi now shows a toast | keeps D16 |
| V13 | Nhóm cards show 3 square photos plus a "+N" tile, chosen with P21's "newest photos" rule | amends U3 (shape) and P21 (5 → 3) |
| V14 | Signature mark "vòng bút đỏ": a hand-drawn red-pen SVG (circle or underline), used only at decision moments | new |
| V15 | Yêu thích is its own page, `#/favorites` | decides U22 |
| V16 | Trang chọn quán becomes a real grid page for each nhóm, with "Vuốt nhóm này" and "Bốc thăm" | builds U9; replaces P9 |
| V17 | Search with an empty query lists every place. Filters and sort are kept in the URL. Matching ignores diacritics | builds U10 and U44; partly reverses U8 ("bỏ Khám phá") |
| V18 | The random page is named "Bốc thăm": up to 3 results, re-roll, nhóm required. "Chốt quán này" writes nothing to the database | keeps U19–U21 |
| V19 | Gần tôi: an ask page leads to a results page. Results ship first as a list sorted by distance; the MapLibre + OpenFreeMap map comes later. The "Danh sách" toggle stays after the map ships | keeps U11–U13, U35 |
| V20 | Swipe stays a full-screen mode with back + avatar and no dock. The page may scroll, and the photo shape adapts to screen height | keeps U17; replaces P29 |
| V21 | One info sheet that looks the same from every caller, with a heart toggle | amends M5; drops the `theme` prop |
| V22 | "Chỉ đường" is the only label for opening Google Maps at the place | makes U13 consistent |
| V23 | The photo viewer is a route (`#/places/:id/photos/:n`), so Back closes it | new |
| V24 | The Add/Edit form has 4 sections, a sticky "Lưu địa điểm" button, and opening hours in a sheet. New places default to "Chưa rõ giờ". The unsaved-changes guard also covers gestures and browser Back | replaces the D18/P75 default of 08:00–22:00 |
| V25 | Offline, the dock ＋ stays visible, looks disabled, and explains itself when tapped. Other write buttons stay hidden as before | amends D13 (＋ only) |
| V26 | Sign-in asks only for the basic scopes. `drive.file` is requested in onboarding step 2 (incremental, `prompt=consent`, `access_type=offline`). Normal sign-ins use `prompt=select_account`. The server checks that the scope was granted | replaces D5 |
| V27 | Consent per purpose under Law 91: 4 boxes, all unticked. Each record is stored in `consents` with version, time and user agent, and can be downloaded. A separate screen asks again when the policy changes. Consent is cached on the device | new |
| V28 | Self-service rights: export (CSV + JSON), disconnect Drive (this also withdraws photo consent), a weekly-backup toggle, delete account (checkbox, no typed word), sign out on this device or on all devices | new |
| V29 | Launch unverified (path a). Do not upload a logo. The sign-in page explains the "…supabase.co" line Google shows | new (Q2) |
| V30 | Database quotas: 1.000 places per user, 20 photos per place, 50 nhóm, 200 nhãn, 300 visits per place. One Vercel WAF rate-limit rule | moves D23 into the database |
| V31 | The weekly backup becomes opt-in (consent box 3), runs isolated per user, and logs less | amends D12 |
| V32 | An in-app-browser gate on `/`, `/cai-ung-dung/` and `/app/` | new |
| V33 | Install help lives inside the app (`#/install` and a sheet). It is offered after the 1st and 3rd saved place, and never again after 2 dismissals | new |
| V34 | Prices on Detail: "50.000 ₫ – 90.000 ₫". On rows and cards: "50.000–90.000 ₫", "Từ 50.000 ₫", "Đến 90.000 ₫", "Miễn phí" | adds to D20 |
| V35 | Every row action has a ⋯ menu, so nothing is swipe-only. Quản lý nhãn can create nhãn | new |
| V36 | Real 404 pages (static and in-app) and an inline boot splash | replaces the `*` → `/` redirect |
| V37 | Accurate location copy: location is used on the device; it is saved only through "Dùng vị trí hiện tại"; OpenFreeMap sees the IP address and the map area viewed | new |

---

## 2. Navigation model

**Phone (below 768 px)**
- **Home is the hub.** Only Home has the dock (V4).
- **Every other page** has the V6 header with a back button. Back with no history replaces the route with `#/home`.
- **Full-screen modes** with no dock: Swipe, Gần tôi map, photo viewer and onboarding.
- **No dead ends.** Every empty state has one action. Nhóm and nhãn chips are links. The nhóm page links to Swipe and Bốc thăm.
- **Avatar → Tài khoản.** The avatar appears on Home and Swipe (U2, U17).

**Tablet (768–1023 px)**
- The phone layout, centred at 720 px. The dock is also centred at 720 px.
- Sheets become 520 px dialogs.

**Desktop (1024 px and wider)**
- Split pane configuration: `IonSplitPane when="(min-width:1024px)" contentId="main"`.
- Sidebar: `IonMenu` with `--side-min-width:248px; --side-max-width:248px`. Set `disabled` below 1024 px and `swipeGesture={false}`, so it never fights the iOS back swipe.
- The dock is hidden. Swipe, Bốc thăm and the map open in the content area with the sidebar still visible.
- **Sidebar contents, top to bottom:**
  - wordmark;
  - **[＋ Thêm địa điểm]** (primary button);
  - Trang chủ · Tìm kiếm · Yêu thích · Vuốt chọn quán · Bốc thăm · Gần tôi;
  - a "Nhóm" section listing every nhóm with its count;
  - at the bottom: an offline line, "Trợ giúp ↗", and the avatar with the user's name, which opens "Tài khoản".
- **Content widths:** reading pages 680 px, forms 560 px, grids 1120 px.
- **Keyboard:** `/` opens Tìm kiếm, `n` opens Thêm, `Esc` closes a sheet, ←/→ change photos. Swipe keys are in §8.7.

```
PUBLIC  https://[TÊN MIỀN]/   (static HTML, outside the service worker)
/  Landing ──[Bắt đầu lưu quán] / [Đăng nhập]──────────────► /app/#/login
 ├ /quyen-rieng-tu/  /dieu-khoan/  /tro-giup/  /404.html
 ├ /cai-ung-dung/ ──[Mở WhereToGo]──────────────────────────► /app/#/install
 └ Zalo/Messenger/FB/IG/TikTok webview ► Gate overlay (Sao chép link · Mở bằng Chrome · Vẫn xem trang)

APP  https://[TÊN MIỀN]/app/#/…
#/login ─Google─► new account ► #/welcome/1 Đồng ý ► 2 Ảnh & Drive* ► 3 Nhóm ► 4 Nơi đầu tiên
        │                       ► #/places/new?link=… ► #/places/:id + [Install sheet]   (*only if box 2 ticked)
        └ returning ► ?next or #/home        policy changed ► #/welcome/policy

#/home (HUB)
 ├ avatar ─────────────────► #/settings
 ├ Hôm nay thử quán này ───► [Info sheet] ─ Chỉ đường ↗ │ Xem đầy đủ ► #/places/:id
 ├ Bắt đầu (checklist) ────► #/places/new · #/swipe · [Install sheet]
 ├ Nhóm card ──────────────► #/categories/:id ─ Vuốt nhóm này ► #/swipe?nhom=:id
 │   "Sửa" ► #/settings/categories              ├ Bốc thăm ► #/random?nhom=:id
 │                                              ├ ＋ ► #/places/new?nhom=:id
 │                                              └ card ► #/places/:id
 ├ Gần tôi card ───────────► #/nearby ► #/nearby/results?…  [Danh sách | Bản đồ] ─ pin ► [Info sheet]
 └ DOCK  Tìm ► #/search · Yêu thích ► #/favorites · ＋ ► #/places/new · Vuốt ► #/swipe · Bốc thăm ► #/random

#/places/:id ─ photo ► #/places/:id/photos/:n │ Sửa ► #/places/:id/edit │ nhãn ► #/search?nhan=
             └ nhóm ► #/categories/:id │ Thêm lần đi ► [AddVisit] │ ⋯ Xoá ► [confirm] ► #/home (replace)
#/settings ─ #/settings/categories │ #/settings/tags │ #/settings/privacy ► #/settings/privacy/delete
           └ #/settings/about │ #/install │ Trợ giúp ↗ /tro-giup/ │ Đăng xuất ► [sheet]
#/* unknown, or unknown :id ► 404 ─ Về Trang chủ
```

---

## 3. Final page inventory

State codes: L = loading skeleton · E = empty · Er = error with "Thử lại" · Off = offline banner, view only · P = permission · Q = quota reached.

| Page | Route / file | Who | Purpose | Blocks, top to bottom | Primary action | States |
|---|---|---|---|---|---|---|
| Landing | `/` · `web/site/index.html` | Signed out; signed in sees "Mở WhereToGo" | Explain the app; Google homepage requirement | §6 | Bắt đầu lưu quán | Works without JS; gate; `?da-xoa=1` banner; installed app redirects to `/app/` |
| Privacy | `/quyen-rieng-tu/` (`/privacy.html` uses a meta refresh) | All | Law 91 and Google disclosure | Version and date · summary · controller and contact · data table · purposes · processors and locations (Supabase SG, Vercel sin1, GitHub Pages, GitHub Actions, Google, OpenFreeMap, Maps-link resolver) · cross-border transfer · retention · rights with deadlines (acknowledge in 2 working days; 10/15/20 days) · how to export, withdraw and delete · Limited Use · 16+ · 72 h breach notice · changes · English summary | — | Print stylesheet |
| Terms | `/dieu-khoan/` | All | Rules of use | Free, no warranty, may stop with [SỐ NGÀY] days' notice · your content and Drive stay yours · acceptable use · quotas · 16+ · suspension · Vietnamese law · contact | — | — |
| Help | `/tro-giup/` | All | Self-service help | `<details>` groups (§8.13) | Gửi email hỗ trợ | — |
| Install guide | `/cai-ung-dung/` | All | Explain installing | Platform tabs · steps with screenshots | Mở WhereToGo → `/app/#/install` | — |
| 404 (static) | `/404.html` | All | Recover from a bad link | §8.15 | Về trang chủ | — |
| Moved notice | Old `…github.io/WhereToGo/`, temporary | All | Move the owner's installs | "WhereToGo đã chuyển nhà" · new link | Mở địa chỉ mới | Self-destroying service worker |
| In-app gate | Overlay from `inapp.js`, no URL | All | Google blocks sign-in in webviews | §7.7 | Sao chép link | Copied / copy failed; Vẫn xem trang (static pages only) |
| Boot splash | Inline in `/app/index.html` | All | No blank screen while loading | Logo · "WhereToGo" · spinner after 600 ms · `<noscript>` "WhereToGo cần JavaScript để chạy." | — | Follows system dark mode |
| Sign-in | `#/login?next=` · `features/auth/LoginPage.tsx` | Signed out | Start Google sign-in | §7.1 | Tiếp tục với Google | Đang mở Google… · errors · offline · signed in → `next` |
| Onboarding | `#/welcome/1…4` · `features/onboarding/WelcomePage.tsx` | Signed in, no current consent | Consent, Drive, nhóm, first place | Step bar · one task per step | Per step | §7 |
| Re-consent | `#/welcome/policy` · `PolicyUpdatePage.tsx` | Signed in, consent version out of date | Ask again after a policy change | §7.5 | Đồng ý và tiếp tục | Offline: view-only banner |
| Home | `#/home` · `features/home/HomePage.tsx` | Signed in | Hub | §8.1 | Dock ＋ | L, Er, E (0 places), 0 nhóm, Off, Drive, Q |
| Trang chọn quán | `#/categories/:id?q=&nhan=&gia=&tt=&sx=` · `features/categories/CategoryPage.tsx` | Signed in | Browse one nhóm (U9) | §8.2 | Card → Detail | L, E, no results, unknown id → 404, Off |
| Tìm kiếm | `#/search?q=&nhom=&gia=&km=&nhan=&tt=&yt=&vitri=&sx=` · `features/search/SearchPage.tsx` | Signed in | Find any place | §8.3 | Row → Detail | L, E, no results, P (distance), Off (searches cache) |
| Yêu thích | `#/favorites?nhom=` · `features/favorites/FavoritesPage.tsx` | Signed in | Shortlist | §8.4 | Card → Detail | L, E, Off |
| Gần tôi: hỏi | `#/nearby` · `features/nearby/NearbyAskPage.tsx` | Signed in | Explain location; pick criteria | §8.5 | Tìm quanh đây | P denied, no coordinates, locating, timeout |
| Gần tôi: kết quả | `#/nearby/results?nhom=&gia=&km=&xem=ds\|bando` · `NearbyResultsPage.tsx` (lazy `NearbyMap.tsx`) | Signed in | Matches as a list, later a map | §8.5 | Row or pin → info sheet | 0 matches, Off (list only), no WebGL, tile error |
| Bốc thăm | `#/random?nhom=` · `features/random/RandomPage.tsx` | Signed in | App picks up to 3 places | §8.6 | Bốc 3 quán / Bốc lại | No nhóm chosen, 0 places (U20), 1–2 places; works offline |
| Vuốt chọn quán | `#/swipe?nhom=&nhan=` · `features/swipe/SwipePage.tsx` | Signed in | Build the Độ hot score | §8.7 | Hot (+1) | No places, no match, finished, Off locks actions, busy |
| Place detail | `#/places/:id` · `PlaceDetailPage.tsx` | Signed in | The notebook page | §8.8 | Chỉ đường | L, deleted (404 variant), Er + retry, Off |
| Photo viewer | `#/places/:id/photos/:n` · `PhotoViewerPage.tsx` | Signed in | Full-screen photos | §8.8 | Swipe or arrow keys | L, "Tải lại ảnh", Off and not cached |
| Add / Edit | `#/places/new?nhom=&link=`, `#/places/:id/edit` · `PlaceFormPage.tsx` | Signed in | Save a place | §8.9 | Lưu địa điểm | Upload progress, validation, Off, Drive missing, Q, unsaved guard |
| Tài khoản | `#/settings` · `SettingsPage.tsx` | Signed in | Settings hub | §8.10 | — | Drive states, Off |
| Quản lý nhóm | `#/settings/categories` | Signed in | Create, edit and delete nhóm | §8.12 | ＋ Nhóm mới | L, delete blocked, Q, Off read-only |
| Quản lý nhãn | `#/settings/tags` | Signed in | Create, rename and delete nhãn | §8.12 | ＋ Nhãn mới | L, E, Q, Off |
| Quyền riêng tư & dữ liệu | `#/settings/privacy` · `PrivacyDataPage.tsx` | Signed in | Data rights | §8.11 | Tải dữ liệu | Exporting, Off disables actions |
| Xoá tài khoản | `#/settings/privacy/delete` · `DeleteAccountPage.tsx` | Signed in | Permanent deletion | §8.11 | Xoá vĩnh viễn tài khoản | Deleting, Er + retry, done → `/?da-xoa=1`, Off |
| Giới thiệu | `#/settings/about` · `AboutPage.tsx` | Signed in | Trust and credits | Version · "Dự án cá nhân, miễn phí, không quảng cáo của [TÊN NGƯỜI VẬN HÀNH]" · Có gì mới · Mã nguồn [LINK GITHUB] · credits (Be Vietnam Pro and Newsreader under SIL OFL, Ionicons, MapLibre, © OpenFreeMap © OpenStreetMap) | — | — |
| Cài ứng dụng | `#/install` · `features/install/InstallPage.tsx` (same body as InstallSheet) | Signed in or out | Install the PWA | §8.14 | Cài ngay (Android only) | Already installed |
| 404 (in-app) | `#/*` · `app/NotFoundPage.tsx` | All | Replaces the silent redirect | §8.15 | Về Trang chủ | Deleted-place variant |

**Sheets** (not pages, all built on `WtgSheet`):
- Info sheet, Filter, AddVisit, Giờ mở cửa (OpeningHoursEditor plus TimeWheel), Nhóm editor, Nhãn editor;
- Install, Đăng xuất, Kết nối / Ngắt kết nối Drive;
- Vị trí (the location ask on Search);
- Confirm sheets: delete place, discard changes, delete nhóm, nhãn or visit, decline consent;
- Quota.

**Removed:**
- `PlaceListPage` becomes `PlaceRow` + `PlaceGrid` and the 4 pages above.
- The old nearby list.
- Creating nhóm and nhãn inside an IonAlert; editor sheets replace it.
- The global.css large-title rule.

---

## 4. Design tokens

### 4.1 Colour

Every ratio below is WCAG 2.x and was computed for this spec.

| Token | Light | Dark | Used for | Contrast (light / dark) |
|---|---|---|---|---|
| bg | `#F5F2E9` | `#141311` | Page, toolbar | text 15.62 / 15.91 |
| surface | `#FBF9F4` | `#1E1C19` | Cards, sheets, dock, inputs | text 16.62 / 14.57 |
| surface-2 | `#EDE8DC` | `#2A2723` | Chips that are off, placeholders, disabled controls, info boxes | text 14.30 / 12.74 · muted 6.01 / 6.53 |
| border | `#E2DBCC` | `#3A3631` | Decorative hairlines only; never the only cue | vs bg 1.23 / 1.55 |
| border-strong | `#8A8072` | `#7D7466` | Inputs, chip outlines, secondary buttons, empty stars, sheet handle | vs bg 3.47 / 4.03 · surface 3.69 / 3.69 · surface-2 3.17 / 3.23 |
| text | `#1C1917` | `#F2EDE3` | All text | at least 12.02 on every surface, including accent-soft (13.82 / 12.02) |
| text-muted | `#5C554B` | `#B3AB9C` | Meta lines, helpers, placeholders, dock labels | bg 6.57 / 8.15 · surface 6.99 / 7.47 · surface-2 6.01 / 6.53 |
| accent | `#A8482A` | `#E58A66` | **Fills only:** primary button, ＋, pins, heart or flame when on, red-pen mark | as a shape vs bg 5.17 / 7.21 · surface 5.51 / 6.60 · surface-2 4.74 / 5.77 |
| accent-pressed | `#8F3D23` | `#CF7652` | Pressed fill (Ionic shade) | on-accent 7.34 / 5.57 |
| on-accent | `#FFFFFF` | `#1C1210` | Text and icons on accent | 5.79 / 7.14 |
| accent-text | **`#96401F`** | `#F09D7B` | **All accent-coloured text:** links, ghost buttons, selected chips, active sidebar row | bg 6.15 / 8.68 · surface 6.54 / 7.94 · surface-2 5.63 / 6.95 · accent-soft 5.44 / 6.56 |
| accent-soft | `#F4E1D7` | `#3B2720` | Selected chip, sidebar row, "Hứng thú" chip | accent border on it 4.58 / 5.45 |
| success / success-bg | `#2D6E45` / `#E2EEE2` | `#86CB9A` / `#1F3326` | Đang mở, Đã đi | bg 5.47 / 9.75 · on its own bg 5.12 / 7.07 |
| warning / warning-bg | `#8A5600` / `#F5E6C8` | `#E9B65E` / `#3A2E17` | Sắp đóng, Drive problems, quota | bg 5.50 / 10.01 · on its own bg 4.99 / 7.15 · text on warning-bg 14.19 / 11.37 |
| danger / danger-bg | `#B3261E` / `#F8E0DA` | `#F49283` / `#3E211D` | Errors, delete | bg 5.84 / 8.21 · on its own bg 5.19 / 6.45 |
| on-danger | `#FFFFFF` | `#1C1210` | Text on the final destructive button | 6.54 / 8.12 |
| focus | `#2F5DA8` | `#93B6F2` | 2 px ring with a 2 px gap; user-location dot | bg 5.77 / 9.03 · surface 6.14 / 8.27 · surface-2 5.28 / 7.23 |
| inverse-bg / inverse-text | `#1C1917` / `#F5F2E9` | `#F2EDE3` / `#1C1917` | Toast | 15.62 / 14.99 |
| inverse-action | `#F09D7B` | `#96401F` | Toast action ("Hoàn tác") | 8.17 / 5.90 |
| scrim | `rgba(28,25,23,.45)` | `rgba(0,0,0,.60)` | Behind sheets; never has text on it | — |
| photo-edge | `rgba(28,25,23,.08)` | `rgba(255,255,255,.06)` | 1 px inner edge on photos | — |
| viewer-bg | `#0C0A09` | `#0C0A09` | Photo viewer | white text 19.76 |

**Composite checks (worst case):**
- **Text pill over a photo** (surface at 92% over black, white and mid-grey photos): text at least 13.89 (light) / 11.60 (dark); accent-text at least 5.47 / 6.33.
- **Dock over scrolling content** (surface at 96%): muted labels at least 6.46 / 6.80.
- **Map markers** always sit on a 2 px surface ring, so they pass whatever the map colour: accent vs ring 5.51 / 6.60; focus dot vs ring 6.14 / 8.27.
- **Google button:** light text 16.48 and stroke 4.53 against the fill; dark text 14.47 and stroke 5.83.

**Logo and system colours:**
- Recolour the logo pin from `#CA8A04` to accent, keep the ink tile `#1C1917`, then run `npm run icons`.
- `theme-color` meta: `#F5F2E9` (light) / `#141311` (dark).
- Manifest `background_color` and `theme_color`: `#F5F2E9`.

### 4.2 Fonts

All woff2, latin + vietnamese subsets. Sizes measured.

| Face | Files | Bytes | Role |
|---|---|---|---|
| Be Vietnam Pro 400 (already bundled) | 21,168 + 11,532 | 32,700 | Body text |
| Be Vietnam Pro 600 (already bundled) | 22,032 + 12,176 | 34,208 | Buttons, labels, emphasis |
| Newsreader Variable, wght 200–800 (new: `@fontsource-variable/newsreader@5.2.10`) | 58,084 + 11,932 | 70,016 | Headings, place names, Câu chuyện, numerals |
| Roboto Medium subset for "Tiếp tục với Google" | 4,476 + 3,936 | 8,412 | Google button only |
| **Total** | | **145,336 B (about 142 KiB)** | Was 298,036 B |

- **Packages:** remove `@fontsource/playfair-display`, `@fontsource-variable/fraunces` and `@fontsource-variable/plus-jakarta-sans`.
- **Be Vietnam Pro:** drop weight 500. Ionic's 500 falls back to 400. Set `strong, b { font-weight: 600 }`.
- **`@font-face` rules:** write them by hand, woff2 only, with `unicode-range`. No `.woff` files and no latin-ext. Use `font-display: swap` and `font-synthesis: none`.
- **Roboto subset:** make it once with `pyftsubset --text="Tiếp tục với Google"` from the `@fontsource/roboto` 500 files and commit it to `web/src/theme/fonts/`. It is precached because it is 8 KB. Rebuild it if the button label changes.
- **Coverage, checked with fontTools:** all 134 Vietnamese letters plus ₫ – — … “ ” ’ · in every face.
- **Newsreader's optical size:** the wght file has no opsz axis, so display sizes use the text design. That is sturdier and holds up in dark mode. The opsz files cost about 159 KB, which is not worth it.
- **No italics anywhere.**

### 4.3 Type scale

All sizes are in rem (1 rem = 16 px). `body { font-size: 1rem }` keeps iOS Dynamic Type working. Only the dock labels are a fixed 12 px with `nowrap`, the same as native tab bars.

| Style | Font | Size / line height (px) | Weight | Used for |
|---|---|---|---|---|
| display | Newsreader | 36/46; 52/66 at 768 px and wider | 600 | Landing hero, onboarding titles |
| h1 | Newsreader | 28/36 | 600 | Page title in the content, place name |
| h2 | Newsreader | 22/30 | 600 | Sections, nhóm prompt, sheet and empty-state titles |
| name | Newsreader | 17/22 in rows and grids; 24/32 on Swipe and the info sheet | 600 | Place names |
| numeral | Newsreader | 28/36 ("+N" tile: 22/30) | 600 | Bốc thăm numbers 1–3 |
| story | Newsreader | 18/28 | 400 | Câu chuyện, nhóm prompt on the nhóm page |
| title | Be Vietnam Pro | 17/24 (toolbar: line-height 1.65) | 600 | Toolbar, settings rows |
| body / button | Be Vietnam Pro | 16/24 | 400 / 600 | Text and inputs (16 px prevents iOS zoom) / buttons |
| body-sm | Be Vietnam Pro | 15/22 | 400 | Sheet text, lead paragraphs |
| label | Be Vietnam Pro | 14/20 | 600 | Field labels, chips |
| caption | Be Vietnam Pro | 13/18 | 400 | Meta lines, helpers, errors |
| micro | Be Vietnam Pro | 12/16 | 600 | Dock labels, small display chips; always a single line |

**Diacritic safety (measured):** Ổ reaches 1.168 em above the baseline in Be Vietnam Pro (hhea ascent 1.0) and 0.982 em in Newsreader (ascent 0.735). Therefore:
1. **Boxes with `overflow:hidden`** (line clamps, ellipsis) get `padding-top: .14em`. The worst case needs .134 em (Be Vietnam Pro at 12/16).
2. **Toolbar titles:** set `ion-title { line-height: 1.65 }`. Be Vietnam Pro needs at least 1.60 inside Ionic's `overflow:hidden` `.toolbar-title`.
   - `ion-title` exposes no `::part` in Ionic 9.0.5, so the current `ion-title.title-large::part(native)` rule in `global.css` matches nothing. Delete it.
3. **Line heights for multi-line text:** Be Vietnam Pro needs at least 1.38, Newsreader at least 1.25. Every style in the table above complies.
4. **Test strings:** "Ẩm thực", "Quán Ốc Đào", and "ỔI DẺO SÀI GÒN" (pasted from Google Maps in capitals) at 17, 22 and 28 px, on a real iPhone.

### 4.4 Spacing, layout, radii, elevation

- **Spacing:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
- **Side gutters:** 16 px on phones, 24 at 768 px, 32 at 1024 px.
- **Content widths:** reading 680, forms 560, sign-in 420, grids and landing 1120.
- **Radii:** sm 8 (thumbnails) · md 12 (buttons, inputs, photos) · lg 16 (cards) · xl 24 (top of sheets, dialogs) · full (chips, avatar, ＋, pins).
- **Elevation:**
  - e0: border only.
  - e1 (cards): border, plus `0 1px 2px rgba(28,25,23,.06)` in light mode; border only in dark mode.
  - e2 (dock, sheets, swipe card, floating map buttons): `0 8px 24px -8px rgba(28,25,23,.20)` in light; `0 8px 24px -8px rgba(0,0,0,.70)` plus border in dark.

### 4.5 Motion

| Token | Value | Used for |
|---|---|---|
| `--dur-1` | 100 ms | Press: cards scale to .98, icon buttons to .94 |
| `--dur-2` | 180 ms | Toggles, chips |
| `--dur-3` | 280 ms | Sheets, pages, cards appearing |
| `--dur-4` | 420 ms | Swipe fly-out, red-pen stroke (`stroke-dashoffset`) |
| `--ease-standard` | `cubic-bezier(.2,0,0,1)` | Default |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` | Things leaving |
| `--ease-spring` | `cubic-bezier(.175,.885,.32,1.275)` | Swipe card snapping back only |

- Home cards fade up 8 px, 40 ms apart, at most 5 cards, and only once.
- **Remove** the breathing glow on ＋. No animation ever loops.
- **Reduced motion:**
  - only opacity fades of 100 ms or less;
  - the swipe card cross-fades instead of flying, while dragging still follows the finger;
  - the red-pen mark appears instantly;
  - the map uses `jumpTo` instead of `flyTo`;
  - `setupIonicReact({ mode:'ios', animated: !matchMedia('(prefers-reduced-motion: reduce)').matches })` at boot.

### 4.6 Icons

Ionicons, outline style. The filled variant is used only for an "on" state. Sizes: 24 px default, 20 px in buttons and chips, 16 px inline.

**Each icon has exactly one meaning:**

| Icon | Meaning | Icon | Meaning |
|---|---|---|---|
| heart | Yêu thích | star | Đánh giá (rating) |
| flame | Độ hot / Hot (+1) | close | Bỏ qua (−1) |
| flag | Status "Hứng thú" | ellipse-outline | Status "Chưa đi" |
| checkmark-circle | Status "Đã đi" | arrow-undo | Hoàn tác |
| information-circle | Thông tin | search | Tìm |
| layers | Vuốt | shuffle | Bốc thăm |
| locate | Gần tôi | navigate | Chỉ đường |
| add | Thêm | create | Sửa |
| trash | Xoá | cloud-offline | Offline |
| time | Giờ | cash | Giá |
| location | Địa chỉ | calendar | Lần đi |
| pricetag | Nhãn | options | Lọc |
| ellipsis-horizontal | More menu (⋯) | refresh | Đổi quán khác |

### 4.7 Photo treatment

- **Shapes:**
  - hero 4:3 (16:10 on desktop, at most 480 px tall);
  - daily pick and info sheet 16:10;
  - Swipe 4:5, falling back to 1:1 below a 740 px viewport height and 4:3 below 640 px;
  - grids and thumbnails square.
- **Fill:** `object-fit: cover`, md corners, a 1 px photo-edge drawn with `::after`. No filters and no gradients.
- **No text on photos** except inside solid surface pills at 92% opacity.
- **Missing photo:** a surface-2 tile with the first letter of the name in Newsreader, in text-muted ("Ố" for "Ốc Đào").
- **Loading:** a slow pulse (static under reduced motion).
- **Error:** a "Tải lại ảnh" button.
- **Viewer:** `#0C0A09` background, images use `contain`.

### 4.8 Google sign-in button

Follows Google's branding guidelines **[KIỂM TRA the current page before brand submission]**.

- Pill shape, **44 px** tall, 240–400 px wide, never stretched beyond that.
- Google's official multi-colour "G" SVG, unmodified, at 20 px. 12 px left padding, 10 px gap, 12 px right padding.
- Label **"Tiếp tục với Google"**, Roboto Medium 14/20 (the bundled subset).
- **Light:** fill `#FFFFFF`, 1 px stroke `#747775`, text `#1F1F1F`.
- **Dark:** fill `#131314`, 1 px stroke `#8E918F`, text `#E3E3E3`.
- Focus ring: the standard focus token, offset 2 px.
- Never recolour it, never put an icon on it, never change its text. The loading text appears *under* the button.

### 4.9 Ionic mapping (`web/src/theme/tokens.css`)

`scripts/gen-tokens.mjs` generates this file from one JSON source. The static site uses the same file.

- **Delete:** the `@ionic/react/css/palettes/dark.system.css` import, `themes.css`, every `.wtg-theme-*` class and the `theme` prop on PlaceInfoSheet.
- **Do not use** `light-dark()` (needs iOS 17.5) or `color-mix()` (fails on iOS 16.0–16.1). Step colours are written as literal values.

```css
:root, :root.ios {                      /* light */
  color-scheme: light dark;
  --wtg-bg:#F5F2E9; --wtg-surface:#FBF9F4; /* …every token from 4.1… */
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
  /* --ion-background-color-step-N and --ion-text-color-step-N: literals listed below */
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]), :root.ios:not([data-theme="light"]) { /* dark block */ }
}
:root[data-theme="dark"], :root.ios[data-theme="dark"] { /* the same dark block */ color-scheme: dark; }
:root[data-theme="light"] { color-scheme: light; }
/* Dark block highlights: primary #E58A66 (rgb 229,138,102), contrast #1C1210 (28,18,16),
   shade #CF7652, tint #E89675; medium #B3AB9C; light #2A2723; success #86CB9A; warning #E9B65E;
   danger #F49283; backdrop #000 at .60; bg rgb 20,19,17; text rgb 242,237,227. */
ion-back-button { --min-height:44px; --min-width:44px; }
ion-segment-button { min-height:44px; }
ion-title { line-height:1.65; }
```

**Step colours.** Background step N blends bg toward text by N/1000. Text steps use the same values in reverse order (text step 50 equals background step 950).
- **Light, background steps 50→950:** EAE7DE DFDCD4 D4D1CA CAC7BF BFBCB4 B4B1AA A9A6A0 9E9B95 93908A 888680 7E7B75 73706B 686560 5D5A56 524F4C 474441 3D3A36 322F2C 272422.
- **Dark, background steps 50→950:** 1F1E1C 2A2926 353430 403F3B 4C4A46 575450 625F5A 6D6A65 787570 83807A 8E8B84 99968F A4A19A AFACA4 BAB6AE C6C1B9 D1CCC4 DCD7CE E7E2D8.

**Theme switch.**
- An inline script in `<head>`, before the CSS, reads `localStorage['wtg.theme']` inside a try/catch.
- It sets `data-theme` on `<html>` and replaces the two `theme-color` metas with one that matches the chosen theme.
- "Theo máy" removes the attribute and restores both media-query metas.

---

## 5. Component specs

| Component | Spec |
|---|---|
| **Page header (`WtgPage`)** | 56 px plus safe area, bg colour; hairline appears only after scrolling. Left: back button, 44×44, `aria-label` "Quay lại"; Home shows the "WhereToGo" wordmark (Newsreader 22/30) instead. The title in the content is an h1. The toolbar title (17/24 Be Vietnam Pro 600) fades in only when the h1 leaves the screen (IntersectionObserver), so the name never shows twice. Utility pages without an h1 (Tìm kiếm, settings sub-pages) show the toolbar title from the start. Right side: at most 2 icon buttons of 44 px plus ⋯ |
| **Dock (Home only)** | Fixed to the bottom, 64 px plus safe area, surface at 96%, top hairline, e2. Grid `1fr 1fr 64px 1fr 1fr`, 8 px side padding. Each slot is at least 64×56: a 24 px icon above a micro label in text-muted, with the visible label also used as the accessible name. ＋ is a 56 px accent circle raised 12 px, labelled "Thêm". Measured label widths at 12/600: Tìm 22.4 · Yêu thích 56.1 · Thêm 33.4 · Vuốt 28.8 · Bốc thăm 57.6 px; each slot is at least 70 px at 360 px wide. Offline: ＋ turns surface-2 with a text-muted icon and keeps its label; tapping it shows the toast "Đang offline — cần mạng để thêm địa điểm." Hidden at 1024 px and wider |
| **Sidebar** | 248 px with a hairline on the right. Rows are 44 px: 20 px icon plus a 15/600 label. Current page: accent-soft background, accent-text, and `aria-current="page"`. Nhóm rows show "Quán ăn 12" with the count in muted |
| **Place row (list)** | At least 80 px tall, 12×16 padding, 64 px square thumbnail with sm corners. Line 1: name (17/22, one line). Line 2: caption "Quán ăn · 50.000–90.000 ₫ · 1,2 km". Line 3: status chip, ink stars (14 px), a filled heart if it is a favourite (display only). The whole row is the tap target. Lists render 50 rows at a time with `IonInfiniteScroll`; long lists use `content-visibility:auto` |
| **Place card (grid)** | Fixed 2 columns below 600 px (12 px gap), 3 at 600 px, 4 at 1024 px. Square photo with md corners and an optional status pill (solid surface at 92%). Name 17/22, up to 2 lines, with clamp padding. Caption is the price on one line. Heart (if favourite) sits in a 28 px surface circle at the top right of the photo |
| **Nhóm card (Home)** | Surface, lg corners, border, e1, 16 px padding. Row 1: nhóm icon in a 32 px surface-2 circle, then label "Quán ăn · 12 quán" (label 14/600, muted). Row 2: the prompt "Chán cơm thì ăn gì?" in h2. Row 3: photo strip of 3 square photos plus a "+N" tile (Newsreader 22 on surface-2), 2 px gaps, sm corners. N is the number of places in the nhóm that none of the 3 photos show; the tile is left out when N is 0. Empty nhóm: a 72 px surface-2 band with "Chưa có địa điểm · Thêm vào Quán ăn" (accent-text). Two columns from 768 px |
| **Chips** | Plain `<button>` elements, not IonChip, to avoid Ionic's alpha tints. **Filter chip:** 36 px visible, 44 px tap area (`::before` inset −4 px), full radius, label 14/20. Off: surface-2 with a border-strong outline. On: accent-soft, accent border, accent-text and a 16 px check icon, so the state is never shown by colour alone. Chips that open a picker end with `chevron-down` and show their value: "Giá: 50.000–150.000 ₫". **Display chips:** 28 px, micro text; nhóm use accent-soft, nhãn use surface-2 with text-muted. On Detail they are links (44 px tap area). **Status chips:** Hứng thú (flag, accent-soft / accent-text), Chưa đi (ellipse-outline, surface-2 / muted), Đã đi (checkmark-circle, success-bg / success) |
| **Buttons** | 48 px tall (44 compact), md corners, button text style, 20 px leading icon. **One primary per screen.** Primary: accent fill with on-accent text. Secondary: surface with a 1 px border-strong border and text colour. Ghost: accent-text. Destructive: danger text first; only the final confirm is filled danger with on-danger text. Disabled: surface-2 with text-muted, plus a caption under it explaining why |
| **Form field (`.wtg-field`)** | Label above (label style). Required fields say "(bắt buộc)" in the label, never `*`. Input 48 px, surface fill, 1 px border-strong, md corners, body text. Helper text below in caption muted. Focus: accent border plus the focus ring. Error: danger border, `alert-circle` icon and a caption in danger. Built as `IonInput labelPlacement="stacked"` inside the wrapper. Search uses the same field with a search icon, never IonSearchbar (its input is 36 px) |
| **Sheet (`WtgSheet`)** | Wraps IonModal. **Phone:** `breakpoints [0, .6, 1]`, `initialBreakpoint .6` (P17), xl top corners, handle 36×5 in border-strong, header with h2 and a 44 px close button labelled "Đóng". **768 px and wider:** a `matchMedia` hook removes the breakpoints and adds class `wtg-dialog` (`--width:520px; --height:auto; --max-height:min(720px,90vh); --border-radius:24px`). The footer holds at most 2 buttons |
| **Empty state** | Centred, max 320 px wide. A 72 px surface-2 circle with a 32 px icon, h2 title, body-sm muted text (one sentence: what is missing and why it is worth adding), one primary button, and an optional ghost button |
| **Toast** | IonToast at the bottom, `positionAnchor` set to the dock, sticky bar or swipe action row. Inverse colours, max 480 px wide, `aria-live="polite"`. 3 s, or 5 s with an action; at most one action, in inverse-action colour. Toasts on Swipe also move to the bottom (replaces P11's top position) |
| **Banner** | Inside the content, full width, md corners, icon plus text plus an optional action. No left-border accent. Offline (surface-2): "Đang offline — chỉ xem được." Drive (warning-bg): "Chưa lưu được ảnh vào Google Drive." [Cấp lại quyền]. Update: "Có bản mới." [Tải lại]. Quota (warning-bg): "Bạn đã lưu 950/1.000 địa điểm." |
| **Red-pen mark (`RedPen`)** | Inline SVG in two variants: `circle` (an imperfect loop around a numeral or stamp) and `underline` (a single stroke). 2.5 px accent stroke, round caps, drawn over `--dur-4`. Used only on the daily-pick label (underline), the swipe stamps (circle), and "Chốt quán này" (circle). Never as a background texture |
| **Map pin** | MapLibre GeoJSON source with `cluster:true`, drawn with circle layers (no DOM markers, no glyph labels). Pin: 20 px accent circle with a 2 px surface ring. Selected: 28 px with a 3 px surface ring plus an outer 2 px text-colour ring, so selection is shown by size and rings. Clusters: 32–44 px surface circles with an accent ring and a count. User: hollow 16 px circle (surface fill, 4 px focus stroke) with a 15% accuracy halo, no pulse. Radius circle: 1.5 px accent line with a 6% fill. Taps use `queryRenderedFeatures` on a 44 px box. "© OpenFreeMap © OpenStreetMap" is always visible |
| **Onboarding stepper** | Top of the onboarding screens: "Bước 2/4" (caption muted) above a 4-part bar (4 px tall, 4 px gaps; done = accent, todo = border-strong). Back (44 px) is allowed except on step 1. A skipped step 2 counts as done |
| **Info sheet** | 16:10 photo · nhóm label · name (24/32) · "50.000–90.000 ₫ · cách bạn 1,2 km" · open status · story clamped to 3 lines · heart toggle in the header (online only) · footer [Chỉ đường] primary + [Xem đầy đủ] secondary |

---

## 6. Landing page (`/`, static)

**Head**
- `lang="vi"`.
- `<title>`: WhereToGo — Sổ tay những nơi bạn muốn đến.
- Meta description: "Lưu quán ăn, quán uống, chỗ chơi và điểm du lịch bạn muốn đến, kèm ảnh, giá, giờ mở cửa và câu chuyện của riêng bạn."
- `og:image`: 1200×630, a Home screenshot on cream with the wordmark.
- "WhereToGo" appears as visible text, matching the Google consent screen exactly.

**1. Header**
- Logo and "WhereToGo".
- Desktop links: Cách dùng · Quyền riêng tư · Câu hỏi.
- **[Đăng nhập]** (ghost button) → `/app/#/login`.

**2. Hero.** Two columns on desktop: text on the left, two phone screenshots on the right.
- Small line above the headline: "Sổ tay địa điểm — miễn phí, không quảng cáo"
- **H1:** "Mọi quán muốn đến, gói gọn trong một cuốn sổ."
- Subhead: "WhereToGo giúp bạn lưu quán ăn, quán uống, chỗ chơi và điểm du lịch — kèm ảnh, giá, giờ mở cửa và câu chuyện của riêng bạn. Đến lúc phân vân “đi đâu giờ?”, vuốt vài thẻ là có chỗ."
- **[Bắt đầu lưu quán]** (primary) → `/app/#/login` · [Xem cách dùng] (ghost) → `#cach-dung`
- Small line: "Đăng nhập bằng tài khoản Google. Ảnh nằm trong Google Drive của chính bạn."
- Screenshots: Home and Detail, with light and dark versions in `<picture>`. Caption: "Dữ liệu minh hoạ".

**3. Cách dùng** (`id="cach-dung"`), numbered 1–3 in Newsreader:
1. **Dán link Google Maps** — "Tên và vị trí tự điền. Thêm ảnh, khoảng giá, giờ mở cửa nếu muốn."
2. **Xếp vào nhóm** — "Quán ăn, Quán uống, Chỗ chơi, Du lịch hay nhóm của riêng bạn. Gắn nhãn như “Hẹn hò” để tìm lại nhanh."
3. **Để app chọn giúp** — "Vuốt thẻ, bốc thăm 3 quán, hoặc xem quanh đây có gì."

**4. Tính năng:** 6 cards in a 3×2 grid on desktop and 1 column on phones; each has an icon, a title and one line.
- Hôm nay thử quán này — "Mỗi lần mở app, một gợi ý từ chính danh sách của bạn."
- Vuốt chọn quán — "Vuốt phải để quán “hot” lên, vuốt trái để bỏ qua."
- Bốc thăm — "Chọn một nhóm, app bốc tối đa 3 nơi. Không ưng thì bốc lại."
- Gần tôi — "Xem quán đã lưu trong bán kính 1–10 km quanh bạn."
- Câu chuyện & lần đi — "Ghi lại kỷ niệm, ngày đã đến, món nên gọi."
- Giá & giờ mở cửa — "Ghi khoảng giá theo ₫; app báo quán đang mở hay đã đóng."

**5. Quyền riêng tư** (`id="quyen-rieng-tu"`, a surface-2 block)
- **H2:** "Ảnh của bạn nằm trong Google Drive của chính bạn."
- Bullets:
  - "Ảnh được tải thẳng lên thư mục “WhereToGo Photos” trong Drive của bạn. WhereToGo chỉ xin quyền Google Drive hẹp nhất (drive.file): app chỉ thấy các tệp do chính app tạo, không đọc được tệp nào khác."
  - "Từ Google, app chỉ nhận tên, email, ảnh đại diện (để đăng nhập) và quyền drive.file (để lưu ảnh, và bản sao lưu hằng tuần nếu bạn bật)."
  - "Thông tin địa điểm lưu trên máy chủ Supabase tại Singapore; trong app chỉ tài khoản của bạn xem được. Người vận hành chỉ truy cập kỹ thuật khi cần sửa lỗi hoặc sao lưu."
  - "Vị trí hiện tại chỉ dùng trên máy để tính khoảng cách; chỉ được lưu khi bạn bấm “Dùng vị trí hiện tại” lúc thêm quán. Bản đồ tải từ OpenFreeMap — họ thấy địa chỉ IP và khu vực bạn đang xem."
  - "Không quảng cáo, không bán dữ liệu, không công cụ theo dõi. Tải dữ liệu về, ngắt kết nối Drive hoặc xoá tài khoản ngay trong app."
- Link: [Đọc Chính sách quyền riêng tư →]
- Limited Use statement in caption size, repeated in the privacy policy:
  - "Việc WhereToGo sử dụng và chuyển cho ứng dụng khác thông tin nhận được từ API của Google tuân thủ Chính sách dữ liệu người dùng của Dịch vụ API Google, bao gồm các yêu cầu về Sử dụng giới hạn."
  - Then Google's English sentence, linked to Google's policy: "WhereToGo's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements."

**6. Cài lên màn hình chính**
- **H2:** "Dùng như một app — không cần App Store hay CH Play."
- iPhone: "Mở [TÊN MIỀN]/app bằng Safari → nút ba chấm → Chia sẻ → Thêm vào MH chính → giữ bật “Mở dưới dạng ứng dụng web” → Thêm." [KIỂM TRA NHÃN iOS 26]
- Android: "Mở bằng Chrome → nút ba chấm → Cài đặt ứng dụng."
- "Sau khi cài, mở WhereToGo từ màn hình chính và đăng nhập lại một lần."
- [Hướng dẫn chi tiết →] → `/cai-ung-dung/`. **No install button on this page** (V33).

**7. Câu hỏi thường gặp** (`<details>`):
- **WhereToGo có mất phí không?** "Không. Đây là dự án cá nhân phi thương mại của [TÊN NGƯỜI VẬN HÀNH], không quảng cáo. Dịch vụ không cam kết chạy mãi; nếu ngừng, bạn sẽ được báo trước [SỐ NGÀY] ngày để tải dữ liệu về."
- **Có cần App Store hay CH Play không?** "Không. Mở bằng trình duyệt, rồi thêm vào màn hình chính nếu muốn dùng như app."
- **Vì sao Google hỏi quyền Google Drive?** "Để lưu ảnh (và bản sao lưu nếu bạn bật) vào Drive của chính bạn. Không cho phép vẫn dùng được, chỉ chưa thêm được ảnh."
- **Màn hình Google ghi “[MÃ DỰ ÁN].supabase.co” là gì?** "Đó là máy chủ đăng nhập mà WhereToGo dùng. Tên này hiện ra vì WhereToGo chưa đăng ký thương hiệu với Google."
- **Không có mạng thì sao?** "Bạn vẫn xem được những gì đã mở gần đây. Thêm, sửa và vuốt thẻ cần có mạng."
- **Mở link từ Zalo hay Messenger mà không đăng nhập được?** "Google chặn đăng nhập trong trình duyệt của ứng dụng chat. Bấm nút ba chấm và chọn mở bằng Safari hoặc Chrome."
- **Ai xem được danh sách của tôi?** "Trong app chỉ bạn. Người vận hành chỉ truy cập kỹ thuật khi cần sửa lỗi hoặc sao lưu, như ghi trong Chính sách quyền riêng tư."
- **Chia sẻ kho với bạn bè được không?** "Chưa. Mỗi kho là riêng của một người."
- **Xoá tài khoản thế nào?** "Tài khoản → Quyền riêng tư & dữ liệu → Xoá tài khoản. Dữ liệu trên máy chủ bị xoá ngay; ảnh trong Drive giữ hay xoá do bạn chọn."

**8. Final call to action:** "Bắt đầu cuốn sổ của bạn" [Bắt đầu lưu quán]

**9. Footer**
- "WhereToGo — dự án cá nhân của [TÊN NGƯỜI VẬN HÀNH], Việt Nam."
- Chính sách quyền riêng tư · Điều khoản sử dụng · Trợ giúp · Cài ứng dụng · Mã nguồn [LINK GITHUB] · [EMAIL HỖ TRỢ] · © 2026.
- No testimonials and no user counts.

**Page states**
- **Signed in** (a `sb-[MÃ DỰ ÁN]-auth-token` key exists in localStorage; same origin as the app): both buttons read "Mở WhereToGo" → `/app/#/home`.
- **`?da-xoa=1`:** a top banner, "Tài khoản của bạn đã được xoá. Cảm ơn bạn đã dùng WhereToGo."
- **Opened as an installed app:** `location.replace('/app/#/home')`.

**Technical approach**
- **Static HTML, not an SPA route**, because Google's crawler must see the content without JavaScript.
- **Source layout:** `web/site/` holds `index.html`, the legal and help pages, `site.css`, `inapp.js` (about 2 KB) and `landing.js` (about 1 KB).
- **Build:**
  - `vite build` with `base:'/app/'` and `outDir:'dist/app'`;
  - then `scripts/build-site.mjs` copies the site files, `tokens.css` and the font files into the root of `dist/`, and adds the `CNAME`.
- **Size budget:** HTML+CSS+JS at most 40 KB transferred. Fonts are shared and cached (145 KB). Screenshots at most 300 KB in total (AVIF/WebP with `srcset`, lazy-loaded below the fold).
- **PWA settings:**
  - manifest `id:'/app/'`, `scope:'/app/'`, `start_url:'/app/#/home'`;
  - Workbox `navigateFallback:'/app/index.html'` and `navigateFallbackAllowlist:[/^\/app\//]`, so static pages are never taken over;
  - `globIgnores:['**/maplibre*.js','**/screenshots/**']`;
  - MapLibre goes in a `CacheFirst` runtime cache; map tiles are `NetworkOnly`;
  - `check:size` adds a **2.5 MB total precache budget** next to the existing 2 MiB per-file limit.
- **Custom domain migration, in this order:**
  1. Ship a "WhereToGo đã chuyển nhà" release on the old origin (banner plus `selfDestroying: true` service worker) and let the owner's installs pick it up.
  2. Set the CNAME. GitHub then 301-redirects the old URLs.
  3. Supabase: set the Site URL and **exact** redirect URLs (`https://[TÊN MIỀN]/app/`); remove the tunnel and localhost entries from production.
  4. Google: update the JavaScript origins, authorized domain, and homepage/privacy/terms URLs (the privacy URL is `/quyen-rieng-tu/`).
  5. Server: set `ALLOWED_ORIGINS` and make the tunnel regex never match in production.
  6. Search Console: add a DNS Domain property.
- **Why the domain now:** brand verification later needs a custom domain, and right now only the owner has installs to migrate, so it is cheap.

---

## 7. Sign-in and onboarding

### 7.1 Sign-in (`#/login`)

Centred column, 420 px wide:
- 72 px logo, then "WhereToGo" in display style, then "Sổ tay những nơi bạn muốn đến" (body-sm muted).
- Until brand verification, a caption *above* the button: "Màn hình Google sẽ ghi “tiếp tục tới [MÃ DỰ ÁN].supabase.co” — đó là máy chủ đăng nhập của WhereToGo."
- The Google button.
- Disclosure under the button: "Google sẽ gửi cho WhereToGo tên, email và ảnh đại diện của bạn để tạo tài khoản; máy chủ đăng nhập ghi lại thời điểm và địa chỉ IP để bảo mật. Sau khi đăng nhập, app hỏi bạn đồng ý từng mục — gồm lưu ảnh vào Google Drive của bạn, sao lưu hằng tuần và khoá truy cập Drive đã mã hoá trên máy chủ. Nếu bạn không đồng ý, tài khoản bị xoá ngay."
- Links: Điều khoản sử dụng · Chính sách quyền riêng tư · WhereToGo là gì? (→ `/`).
- **There is no "bằng việc tiếp tục, bạn đồng ý" line.**

States:
- After tapping: "Đang mở Google…"
- Cancelled: "Bạn đã huỷ đăng nhập. Thử lại khi sẵn sàng."
- Network error: "Không kết nối được. Kiểm tra mạng rồi thử lại."
- Offline: "Cần có mạng để đăng nhập."
- `signup_disabled` (beta): "WhereToGo đang mở thử cho một nhóm nhỏ. Gửi email tới [EMAIL HỖ TRỢ] để được mời."
- Anything else: "Đăng nhập chưa thành công (mã lỗi: {code}). Thử lại hoặc gửi mã này tới [EMAIL HỖ TRỢ]."
- `next` is kept in sessionStorage through the OAuth redirect.
- A signed-in user who opens this page goes to `next` or `#/home`.

### 7.2 Step 1/4: Đồng ý

- **Title:** "Chào {tên}, trước khi bắt đầu" (uses Google `given_name`, falling back to the full name).
- **Intro:** "Đồng ý cho từng việc. Ô nào không chọn, app không làm việc đó. Bạn rút lại được bất cứ lúc nào trong Tài khoản → Quyền riêng tư & dữ liệu."
- **Boxes, all unticked:**
  1. **(bắt buộc)** "Lưu kho địa điểm của tôi trên máy chủ WhereToGo (Supabase, Singapore): tên, email, ảnh đại diện Google và những gì tôi nhập — tên quán, địa chỉ, vị trí quán, giá, giờ mở cửa, đánh giá, ghi chú, câu chuyện, lần đi, lượt vuốt và mục yêu thích."
  2. (không bắt buộc) "Lưu ảnh tôi thêm vào thư mục “WhereToGo Photos” trong Google Drive của tôi. Máy chủ giữ một khoá truy cập Google đã mã hoá để tải và hiển thị ảnh. Ở bước sau, Google sẽ hỏi bạn cho phép."
  3. (không bắt buộc) "Mỗi tuần sao lưu kho địa điểm thành một tệp trong thư mục “WhereToGo Backups” trên Drive của tôi." While box 2 is unticked, this box is disabled with the helper "Cần chọn ô lưu ảnh trước."
  4. **(bắt buộc)** "Tôi từ 16 tuổi trở lên và đã đọc Điều khoản sử dụng và Chính sách quyền riêng tư." (both are links)
- **Info box (surface-2, not a checkbox):** "Vị trí: chỉ hỏi khi bạn dùng Gần tôi hoặc lọc theo khoảng cách, và chỉ dùng trên máy này. Vị trí chỉ được lưu khi bạn bấm “Dùng vị trí hiện tại” lúc thêm quán — khi đó nó thành vị trí của quán."
- **[Đồng ý và tiếp tục]** stays disabled until boxes 1 and 4 are ticked. Caption while disabled: "Cần chọn 2 ô bắt buộc để tiếp tục."
- **[Tôi không đồng ý]** (ghost) opens a sheet:
  - "Không dùng WhereToGo?"
  - "Tài khoản vừa tạo (tên, email, ảnh đại diện, nhật ký đăng nhập) sẽ bị xoá ngay và bạn được đăng xuất."
  - [Xoá và thoát] (danger) / [Quay lại]. Deleting uses the delete-account endpoint, then goes to `/?da-xoa=1`.
- **Saved data:** one row in `consents` per box, with purpose, granted, policy version, time and user agent. The table's migration needs explicit `GRANT`s (Supabase changes the default on 2026-10-30).
- **Nothing is seeded before this step.**

### 7.3 Step 2/4: Ảnh & Google Drive (only when box 2 is ticked)

- **Before going to Google:**
  - Title: "Cho phép lưu ảnh vào Google Drive"
  - "Google sẽ hỏi bạn có cho WhereToGo xem, tạo và xoá các tệp Drive do chính ứng dụng này tạo không [KIỂM TRA câu chữ trên màn hình Google]. Đây là quyền hẹp nhất: app không đọc được tệp nào khác của bạn."
  - **[Tiếp tục tới Google]** · [Để sau — dùng không có ảnh]
- **Technical flow:**
  - Incremental request for `drive.file` with `access_type=offline`, `prompt=consent` and `include_granted_scopes=true`.
  - The refresh token is forwarded immediately on return.
  - The server checks the granted scope (A6).
- **Granted:** advance automatically, with the toast "Đã kết nối Google Drive".
- **Scope missing:**
  - "Google chưa cho phép lưu ảnh"
  - "Ở màn hình Google, ô quyền Google Drive đang bị bỏ chọn. Không sao — mọi thứ khác vẫn dùng được, chỉ chưa thêm được ảnh."
  - [Thử lại] · [Để sau]
- **Cancelled or error:** "Chưa kết nối được Google Drive." [Thử lại] · [Để sau]

### 7.4 Step 3/4: Nhóm, step 4/4: Nơi đầu tiên, and after

**Step 3: Nhóm**
- **Title:** "Bạn hay lưu những nơi nào?"
- "Nhóm là các ngăn lớn trong kho — mỗi nhóm thành một thẻ trên Trang chủ, và mỗi địa điểm thuộc ít nhất một nhóm. Nhãn là ghi chú nhỏ để tìm nhanh, như “Hẹn hò”."
- Rows with checkboxes, all ticked: Quán ăn ("Chán cơm thì ăn gì?") · Quán uống ("Chán nước thì uống gì?") · Chỗ chơi ("Chán ở nhà thì đi đâu?") · Du lịch ("Cuối tuần trốn đi đâu?"), plus "＋ Thêm nhóm khác", which opens an inline name field.
- Button **[Tạo 4 nhóm]**; the number follows the selection.
- Error: "Chọn ít nhất một nhóm."
- Seeds the nhóm and the "Hẹn hò" nhãn **per user id** (fixes A13).

**Step 4: Nơi đầu tiên**
- **Title:** "Thêm nơi đầu tiên"
- "Dán link Google Maps — tên và vị trí tự điền."
- A field plus a [Dán] button.
- Expandable "Lấy link ở đâu?": "Mở quán trên Google Maps → bấm Chia sẻ → Sao chép đường liên kết."
- **[Tiếp tục]** opens the form already filled in · [Tự nhập] · link "Để sau, vào Trang chủ".

**Skipping for existing accounts:** an account that already has at least 1 nhóm skips step 3; one with at least 1 place skips step 4. The owner's own account therefore sees only steps 1–2.

**After the first save**
- Toast: "Đã lưu nơi đầu tiên vào sổ."
- The Install sheet, if the app is not installed (rules in V33).
- The Home checklist "Bắt đầu với WhereToGo":
  - Thêm 3 địa điểm (1/3)
  - Thử Vuốt chọn quán
  - Cài lên màn hình chính (hidden when installed)
  - [Ẩn]

### 7.5 Re-consent (`#/welcome/policy`)

- Title: "Chính sách quyền riêng tư đã thay đổi"
- An "Điểm mới" list (2–4 bullets) and a link to the full policy.
- Only the boxes whose wording changed are shown, unticked.
- [Đồng ý và tiếp tục] · [Không đồng ý] → a sheet offering [Xoá tài khoản] or [Đăng xuất].

### 7.6 Guard rules

- The consent version is cached in localStorage (`wtg.consent`) and in the persisted query cache.
- **Cached version is current:** the app opens, offline too.
- **No cache, online:** ask the server.
- **No cache, offline:** show "Cần có mạng để hoàn tất đăng ký." [Thử lại].
- **Version out of date, offline:** the app opens view-only, with the banner "Chính sách đã đổi — kết nối mạng để xem và đồng ý." No new processing happens offline anyway.

### 7.7 In-app browser gate

Detection by user agent: `Zalo`, `FBAN|FBAV|FB_IAB`, `Messenger`, `Instagram`, `musical_ly|TikTok|BytedanceWebview`, `Line/`. The overlay is full screen on surface:
- Icon `open-outline`.
- **Title:** "Mở bằng Safari hoặc Chrome để đăng nhập"
- "Bạn đang xem trong trình duyệt của {Zalo}. Google không cho đăng nhập ở đây để bảo vệ tài khoản của bạn."
- **Steps for the detected app** [KIỂM TRA TÊN MENU]:
  - Zalo: "Bấm nút ba chấm ở góc trên → chọn “Mở bằng trình duyệt”."
  - Messenger / Facebook: "Bấm nút ba chấm → “Mở bằng trình duyệt” (iPhone: “Mở trong Safari”)."
  - Instagram: "Bấm nút ba chấm → “Mở trong trình duyệt ngoài”."
  - TikTok: "Bấm nút ba chấm → “Mở trong trình duyệt”."
  - Other apps: "Mở menu của ứng dụng và chọn mở bằng trình duyệt, hoặc sao chép link rồi dán vào Safari hay Chrome."
- **[Sao chép link]** (primary).
  - Success: "Đã sao chép. Mở Safari hoặc Chrome và dán vào thanh địa chỉ."
  - Failure: the URL appears in a selectable field with "Giữ ngón tay lên link để sao chép."
- Android: [Mở bằng Chrome] uses the intent URL `intent://[TÊN MIỀN]/app/#Intent;scheme=https;package=com.android.chrome;end`.
- Static pages only: [Vẫn xem trang] closes the overlay, but the sign-in buttons stay gated.

---

## 8. Per-page detail specs

### 8.1 Home

**Header:** wordmark · offline icon (only when offline) · 32 px avatar inside a 44 px target.

**Content, top to bottom:**
1. **Date line:** "Thứ Bảy, 17 tháng 10" (caption muted).
2. **Daily pick card (lg):**
   - Label "Hôm nay thử quán này" (label style, accent-text, red-pen underline).
   - 16:10 photo.
   - Name (h2), caption "Quán ăn · 50.000–90.000 ₫", status "Đang mở · đóng lúc 20:30" in success.
   - Icon button "Đổi quán khác" (refresh).
   - Tapping the card opens the info sheet (M4).
3. **Checklist** (new users only).
4. **"Nhóm của bạn"** (h2), with a ghost "Sửa" → Quản lý nhóm.
5. **Nhóm cards**, ordered by M2.
6. **Gần tôi card:** locate icon, "Gần tôi", "Quanh đây có gì?", caption "Xem quán đã lưu trong bán kính 1–10 km".
7. **Dock.**

**States:**
- Loading: skeletons for the daily card and 2 nhóm cards. Nhóm data loads separately, so the "no nhóm" card never flashes.
- Error: banner "Không tải được dữ liệu." [Thử lại]
- 0 places: no daily card; the checklist on top; nhóm cards with their empty band.
- 0 nhóm: card "Chưa có nhóm nào" / "Tạo nhóm để sắp xếp địa điểm thành các thẻ ở đây." [Tạo nhóm]
- Off, Drive and quota banners sit above the daily card.

### 8.2 Trang chọn quán (`#/categories/:id`)

**Header:** back · ＋ ("Thêm vào nhóm này") · ⋯ (Sửa nhóm opens the editor sheet).

**Content:**
- 40 px icon circle, then h1 "Quán uống".
- The prompt "Chán nước thì uống gì?" in story style, muted.
- Meta: "8 địa điểm · 3 đã đi".
- Row of secondary buttons: [Vuốt nhóm này] (layers) and [Bốc thăm] (shuffle). Both are disabled with a caption when the nhóm is empty.
- Field "Tìm trong Quán uống" plus a [Lọc] button with a count badge. The Filter sheet has Nhãn, Giá, Trạng thái and Sắp xếp (Mới thêm, Mới sửa, Đánh giá cao, Hot nhất, Tên A–Z).
- Grid.

**States:**
- Empty: "Nhóm này chưa có nơi nào" / "Thêm quán đầu tiên vào Quán uống để vuốt và bốc thăm trong nhóm." [Thêm vào Quán uống]
- No results: "Không có nơi nào khớp bộ lọc" / "Thử bỏ bớt điều kiện." [Xoá bộ lọc]
- Unknown id: the 404 page.

### 8.3 Tìm kiếm (`#/search`)

**Layout:**
- Toolbar title "Tìm kiếm".
- Sticky field with placeholder "Tên quán, địa chỉ, ghi chú, nhãn…". Matching ignores diacritics and case (NFD, marks removed, đ → d), so "bun cha" finds "Bún chả".
- A horizontally scrolling chip row: Nhóm ▾ · Giá ▾ · Khoảng cách ▾ · Nhãn ▾ · Trạng thái ▾ · Yêu thích · Sắp xếp ▾.
- Result line: "18 địa điểm · Xoá bộ lọc".
- Rows.

**Filter values:**
- Giá presets: "Dưới 50.000 ₫", "50.000–150.000 ₫", "150.000–300.000 ₫", "Trên 300.000 ₫". A place matches if its price range overlaps the preset. With a price filter on, the caption reads "Quán chưa có giá không hiện khi lọc theo giá."
- Khoảng cách: 1 · 3 · 5 · 10 km. Choosing one first opens the Vị trí sheet, which uses the Gần tôi explainer copy.
- Nhãn: several can be chosen, matched with OR (D19).
- Sort: Mới thêm (default) · Mới sửa · Đánh giá cao · Hot nhất · Gần nhất · Tên A–Z.

**States:**
- Empty query: "Tất cả 28 địa điểm".
- No results: "Không tìm thấy “bún bò”" / "Kiểm tra chính tả hoặc bỏ bớt bộ lọc." [Xoá bộ lọc]
- Offline: searches the cached data, with the banner.

### 8.4 Yêu thích (`#/favorites`)

- h1 "Yêu thích", then "6 nơi".
- Nhóm chips "Tất cả · Quán ăn · Quán uống…". Only nhóm that contain favourites appear.
- Grid, newest favourite first.
- Empty: heart icon, "Chưa có nơi yêu thích" / "Bấm hình trái tim ở trang địa điểm hoặc khi vuốt thẻ." [Vuốt chọn quán]

### 8.5 Gần tôi

**Ask page (`#/nearby`)**
- h1 "Gần tôi", lead "Tìm quán đã lưu quanh bạn."
- Info box (surface-2): "Vị trí hiện tại chỉ dùng trên máy này để tính khoảng cách, không gửi lên máy chủ. Bản đồ tải từ OpenFreeMap — họ thấy địa chỉ IP và khu vực bạn xem."
- **Nhóm (bắt buộc):** single-choice chips, remembering the last choice.
- **Tầm giá (tuỳ chọn):** "Bất kỳ" (default) plus the 4 presets.
- **Bán kính:** segmented 1 · 3 · 5 · 10 km, default 3 (U11).
- **[Tìm quanh đây]** triggers the browser's location prompt. Disabled until a nhóm is chosen, with the caption "Chọn một nhóm."
- While locating: "Đang tìm vị trí của bạn…". After 10 s: "Không lấy được vị trí." [Thử lại]
- **Permission denied:** "Chưa có quyền vị trí", then steps for the detected platform [KIỂM TRA]:
  - iPhone (Safari): "Cài đặt → Ứng dụng → Safari → Vị trí → Hỏi."
  - iPhone (installed app): "Cài đặt → Quyền riêng tư & Bảo mật → Dịch vụ định vị → Trang web Safari → Khi dùng ứng dụng."
  - Android: "Bấm biểu tượng cạnh thanh địa chỉ → Quyền → Vị trí → Cho phép."
  - Máy tính: "Bấm biểu tượng ổ khoá cạnh địa chỉ trang → Vị trí → Cho phép, rồi tải lại trang."
  - Then [Thử lại].
- **No places with coordinates** (U36): "Chưa có quán nào trong Quán ăn có vị trí" / "Mở quán trên Google Maps, bấm Chỉ đường hoặc thả ghim, rồi Chia sẻ → Sao chép đường liên kết và dán vào ô “Dán link Google Maps” khi sửa quán. Hoặc dán chuỗi “21.0285, 105.8542”." [Xem quán chưa có vị trí] → `#/search?vitri=thieu`.

**Results, list view (ships first)**
- Header: back · title "Quán ăn · trong 3 km" (tapping it goes back to the ask page) · the segmented control "Danh sách | Bản đồ" once the map ships.
- Rows sorted by distance ("0,4 km").
- Caption: "3 quán trong Quán ăn chưa có vị trí — Thêm vị trí".
- 0 matches: "Không có quán nào trong 3 km" / "Mở rộng bán kính hoặc chọn nhóm khác." [Mở rộng lên 5 km]

**Results, map view**
- Full screen, with a floating 44 px back button, a summary pill "Quán ăn · 3 km" and a "Danh sách" button (all surface, e2).
- Bottom right: "Về vị trí của tôi" (locate). Bottom left: attribution.
- Styles: OpenFreeMap Positron (light) and dark [KIỂM TRA tên style].
- Pin → info sheet at 0.6 (U13).
- Desktop: a 360 px results panel on the left instead of the sheet.
- States:
  - "Đang tải bản đồ…"
  - Offline: list view plus "Bản đồ cần mạng — đang hiện danh sách."
  - No WebGL or tile error: list view plus "Không tải được bản đồ." [Thử lại]

### 8.6 Bốc thăm (`#/random`)

- h1 "Bốc thăm", lead "Chọn một nhóm, app bốc tối đa 3 nơi. Không ưng thì bốc lại."
- Required nhóm chips, remembering the last choice.
- **[Bốc 3 quán]** becomes "Bốc lại" after the first draw.
- **Results:** stacked on phones, 3 columns on desktop. Each card has a Newsreader numeral, a 16:10 photo, the name, "giá · Đang mở" and [Chốt quán này] (secondary).
- **"Chốt quán này":**
  - the red-pen circle draws around that card's numeral;
  - the card gets an accent border;
  - its buttons change to [Chỉ đường] (primary) and [Xem đầy đủ];
  - the other cards stay as they are;
  - nothing is written to the database.
- **States:**
  - 0 places, using the owner's own U20 line as the title: "Chưa thêm gì vào thì đào đâu ra mà random", body "Thêm vài nơi vào Quán ăn rồi quay lại bốc nhé." [Thêm vào Quán ăn]
  - 1–2 places: caption "Nhóm này mới có 2 nơi — bốc lại vẫn ra đúng 2 nơi này."
  - Works offline.

### 8.7 Vuốt chọn quán (`#/swipe`)

**Layout:**
- Header: back · "Vuốt chọn quán" · Lọc (`options` icon with a badge) · avatar.
- Line: "Quán ăn · còn 14 thẻ · [Xoá lọc]".
- **Card** (lg corners, e2):
  - photo (V20 ratios);
  - a solid surface panel underneath: nhóm chip, name (24/32, 2 lines), "60.000–80.000 ₫ · 13 Lò Đúc", and a flame with "Độ hot 3".
  - Tapping the panel opens the info sheet.
- **Action row**, left to right:
  - Hoàn tác (44 px);
  - **Bỏ qua** (64 px, surface with a border-strong border, `close` icon);
  - **Yêu thích** (52 px, heart, filled accent when on);
  - **Hot** (64 px, accent fill, flame);
  - Thông tin (44 px).
  - Micro labels sit under the 3 middle buttons.
- **Drag stamps:** "+1 hot" (accent-text) or "Bỏ qua" (text colour), each in a surface pill circled by the red pen.
- Toasts: "+1 độ hot", "−1 độ hot", "Đã thêm vào Yêu thích", "Đã hoàn tác".
- First-run hint under the actions: "Vuốt phải: +1 độ hot · Vuốt trái: bỏ qua".

**Behaviour:**
- The page scrolls when content is taller than the screen.
- Desktop: the card is 420 px wide. Keys: ← Bỏ qua, → Hot, F Yêu thích, Z Hoàn tác, I Thông tin.

**States:**
- No places: "Chưa có gì để vuốt" / "Thêm vài nơi rồi quay lại vuốt nhé." [Thêm địa điểm]
- No match: "Không có thẻ nào khớp bộ lọc" [Xoá bộ lọc]
- Finished: "Đã xem hết 14 thẻ" [Xem lại từ đầu] · [Xem quán hot nhất] → `#/search?sx=hot`
- Offline: actions locked, banner "Đang offline — vuốt thẻ cần có mạng." (M6)

### 8.8 Place detail and photo viewer

**Header:** back · heart (online only) · Sửa (`create`) · ⋯ (Xoá địa điểm).

**Content:**
1. 4:3 hero photo with a "1/6" pill; tapping it opens the viewer.
2. Nhóm chip(s), then the name as h1.
3. Meta line: ink stars, status chip, flame "Độ hot 5".
4. **Facts list** (20 px icon plus text, 48 px rows):
   - Địa chỉ;
   - Giá "50.000 ₫ – 90.000 ₫";
   - Giờ "Đang mở · đóng lúc 20:30 ▸", which expands to the week. Other states: "Sắp đóng · 20:30", "Đã đóng · mở lúc 8:00 mai", "Chưa rõ giờ";
   - Khoảng cách, only if location permission was already granted;
   - "2 lần đi".
5. **Câu chuyện** (h2, then story style).
6. **Ghi chú.**
7. **Nhãn** chips (each links to Search).
8. **Các lần đi:** a timeline. Each row shows "12/07/2026 · Đi với nhóm lớp" and a ⋯ menu (Sửa, Xoá). Then [＋ Thêm lần đi].
9. Caption: "Thêm ngày 12/07/2026 · Sửa lần cuối 03/10/2026".

**Sticky bar:** [Chỉ đường] (primary) and [Thêm lần đi] (secondary). Offline, only Chỉ đường remains.

**States:**
- Loading skeleton.
- Deleted: "Địa điểm này đã bị xoá" (404 variant).
- Network error: "Không tải được địa điểm." [Thử lại]

**Photo viewer:**
- Viewer background, swipeable carousel, "2 / 6", close (44 px), "Mở trong Google Drive ↗".
- Image failed: "Tải lại ảnh".

### 8.9 Add / Edit (`#/places/new`, `#/places/:id/edit`)

**Header:** [Huỷ] (text button) · title "Địa điểm mới" or "Sửa địa điểm". There is no Lưu button in the header.

**Sections:**
1. **Card "Dán link Google Maps"**
   - "Tên và vị trí tự điền. Link chỉ đường điền cả địa chỉ." A field plus [Dán].
   - Success: "Đã lấy tên và vị trí".
   - Expandable "Lấy link ở đâu?".
2. **Cơ bản**
   - Tên (bắt buộc).
   - Nhóm (bắt buộc, chips, plus "＋ Nhóm mới" which opens the editor sheet).
   - Khoảng giá: "Từ" and "Đến" with a ₫ suffix, numeric keyboard, live "45.000" formatting.
   - Ảnh: a thumbnail row plus [Thêm ảnh]. The first photo carries an "Ảnh bìa" pill; each photo's ⋯ menu has "Đặt làm ảnh bìa" and "Xoá".
   - Địa chỉ.
   - Vị trí, shown as a status line, not raw numbers:
     - "Đã có vị trí từ link Google Maps" (success), or "Chưa có vị trí";
     - [Dùng vị trí hiện tại], with the caption "Vị trí lúc này của bạn sẽ thành vị trí của quán.";
     - [Xoá vị trí];
     - "Xem toạ độ" reveals the numbers.
3. **Cảm nhận của bạn**
   - Trạng thái: segmented Hứng thú / Chưa đi / Đã đi.
   - Đánh giá: 5 stars, 44 px each; tapping the current star again clears it.
   - Câu chuyện, helper "Kỷ niệm, cảm nhận của bạn về nơi này."
4. **Thêm chi tiết** (collapsed on new places; on edit, expanded if any field in it has a value)
   - Giờ mở cửa: a summary row "Chưa rõ giờ ›" that opens a full-height sheet with the existing editor.
   - Nhãn.
   - Ghi chú, helper "Món nên gọi, chỗ gửi xe, giờ đông khách…"
5. **Edit only:** "Xoá địa điểm" (danger text) opens a sheet:
   - "Xoá Bún chả Hương Liên?"
   - "Ảnh vẫn nằm trong Google Drive của bạn; các lần đi và lượt vuốt của nơi này sẽ bị xoá."
   - [Xoá] / [Huỷ]. Afterwards: replace the route with Home and show the toast "Đã xoá Bún chả Hương Liên".

**Sticky bar:** **[Lưu địa điểm]**. While uploading: "Đang tải ảnh 2/5…".

**Validation** (scrolls to the first error and focuses it):
- "Cần nhập tên địa điểm."
- "Chọn ít nhất một nhóm."
- "Giá “đến” phải lớn hơn hoặc bằng giá “từ”."

**States:**
- Drive missing (photo block): "Chưa kết nối Google Drive nên chưa thêm được ảnh." [Kết nối Google Drive]
- 20 photos: "Đã đủ 20 ảnh — giới hạn của mỗi địa điểm."
- Quota: a sheet, "Kho đã có 1.000 địa điểm — mức tối đa hiện tại cho mỗi tài khoản."
- Offline: banner "Đang offline — cần mạng để lưu." The save button is disabled and explains why.
- Unsaved-changes guard, also on browser Back and the iOS edge swipe: "Bỏ thay đổi?" / "Những gì bạn vừa nhập sẽ mất." [Bỏ thay đổi] / [Tiếp tục sửa]

### 8.10 Tài khoản (`#/settings`)

1. **Profile card:** avatar, "Nguyễn Minh Anh", email.
2. **Google Drive card, one of:**
   - "Đã kết nối — ảnh nằm trong WhereToGo Photos." [Mở thư mục ↗]
   - "Chưa kết nối — chưa thêm được ảnh." [Kết nối Google Drive]
   - Warning: "Cần kết nối lại — quyền đã hết hạn hoặc bị gỡ." [Kết nối lại]
3. **Dữ liệu:** Nhóm (4) › · Nhãn (1) ›
4. **Ứng dụng:**
   - Giao diện: segmented Theo máy · Sáng · Tối.
   - Cài lên màn hình chính › (hidden when installed).
   - "Dọn ảnh lưu trên máy này", with the toast "Đã dọn ảnh lưu trên máy".
5. **Quyền riêng tư & dữ liệu ›**
6. **Trợ giúp & câu hỏi ↗** · **Góp ý qua email ↗** · **Giới thiệu ›**
7. **[Đăng xuất]** opens a sheet:
   - [Đăng xuất trên máy này];
   - [Đăng xuất trên mọi thiết bị], caption "Điện thoại và máy tính khác cũng phải đăng nhập lại.";
   - [Huỷ].
   - Signing out also clears the cached Drive folder id (A13).
8. Footer caption: "WhereToGo 0.3.0".

### 8.11 Quyền riêng tư & dữ liệu, and Xoá tài khoản

**Privacy & data**
- **"Bạn đã đồng ý":**
  - "Lưu kho địa điểm · bắt buộc · 17/10/2026", with the link "Rút lại = xoá tài khoản".
  - "Lưu ảnh vào Google Drive · 17/10/2026", with [Ngắt kết nối Google Drive]. This is the single withdrawal control for photos. Its sheet explains: "Khoá truy cập bị xoá và Google thu hồi quyền. Ảnh vẫn nằm trong Drive của bạn; trong app, ảnh hiện lại khi bạn kết nối lại." It also has an unticked box "Xoá luôn danh sách ảnh đã gắn vào địa điểm".
  - "Sao lưu hằng tuần": a toggle.
  - [Tải bản ghi đồng ý] (a printable HTML file).
- **"Dữ liệu của bạn":**
  - [Tải bảng tính (CSV)]: places with columns Tên, Nhóm, Nhãn, Địa chỉ, Giá từ, Giá đến, Đánh giá, Trạng thái, Độ hot, Link Google Maps, Câu chuyện, Ghi chú, Ngày thêm. UTF-8 with a BOM so Vietnamese opens correctly in Excel.
  - [Tải bản đầy đủ (JSON)].
  - [Mở thư mục ảnh ↗].
- **"Thiết bị":** [Đăng xuất trên mọi thiết bị].
- **[Xoá tài khoản]** (danger text) → the delete page.
- Footer: "Yêu cầu khác (xem, sửa, hạn chế xử lý): [EMAIL HỖ TRỢ]. Chúng tôi xác nhận trong 2 ngày làm việc." Then links to the policy and terms.

**Xoá tài khoản**
- h1 "Xoá tài khoản".
- List "Sẽ bị xoá ngay": địa điểm, nhóm, nhãn, lần đi, lượt vuốt, bản ghi đồng ý, khoá truy cập Google (Google cũng thu hồi quyền).
- [Tải dữ liệu trước] (secondary).
- Unticked boxes:
  - "Xoá cả thư mục “WhereToGo Photos” trong Google Drive"
  - "Xoá cả thư mục “WhereToGo Backups”"
  - "Tôi hiểu việc xoá không hoàn tác được"
- **[Xoá vĩnh viễn tài khoản]** (filled danger) is enabled once the last box is ticked. **Nobody types a word.**
- States: "Đang xoá…", an error with [Thử lại], done → `/?da-xoa=1`. Offline: disabled with the banner.

### 8.12 Quản lý nhóm, Quản lý nhãn

**Nhóm**
- [＋ Nhóm mới] (secondary, full width).
- Rows: icon circle · "Quán ăn" · caption "12 địa điểm · Chán cơm thì ăn gì?" · ⋯ (Sửa, Xoá).
- **Editor sheet:**
  - Tên (bắt buộc).
  - Câu gợi ý, helper "Câu lớn trên thẻ nhóm ở Trang chủ. Để trống thì dùng “Hôm nay đi đâu?”".
  - Icon grid of 44 px tiles, with "Đã chọn: Cà phê" shown under it.
  - **"Xem trước trên Trang chủ"**: a live mini nhóm card.
- **Delete blocked:** "Chưa xoá được nhóm Quán ăn" / "3 địa điểm chỉ thuộc nhóm này. Chuyển chúng sang nhóm khác trước." [Xem 3 địa điểm]

**Nhãn**
- [＋ Nhãn mới] (sheet with Tên).
- Rows: "Hẹn hò · 4 địa điểm" · ⋯ (Đổi tên, Xoá). Tapping a row opens Search filtered by that nhãn.
- Delete confirmation: "Xoá nhãn “Hẹn hò”?" / "Nhãn sẽ được gỡ khỏi 4 địa điểm. Các địa điểm vẫn còn."
- Empty: "Chưa có nhãn nào" / "Nhãn là ghi chú nhỏ để tìm nhanh, như “Hẹn hò” hay “Có chỗ đỗ ô tô”." [Tạo nhãn]

### 8.13 Help / FAQ (`/tro-giup/`)

- h1 "Trợ giúp", lead "Câu trả lời nhanh cho những thắc mắc thường gặp."
- Groups:
  - Bắt đầu (dán link, nhóm và nhãn, vuốt thẻ, bốc thăm)
  - Ảnh & Google Drive (vì sao cần quyền, ảnh nằm đâu, kết nối lại)
  - Vị trí & bản đồ (vị trí có lưu không, cấp quyền theo máy, quán chưa có vị trí)
  - Offline
  - Cài lên màn hình chính
  - Dữ liệu & xoá tài khoản
  - Đăng nhập (Zalo/Messenger, dòng supabase.co)
- Footer: "Chưa có câu trả lời?" [Gửi email tới [EMAIL HỖ TRỢ]]

### 8.14 Install guide (`/cai-ung-dung/` and `#/install`)

- h1 "Dùng WhereToGo như một app", lead "Mở nhanh từ màn hình chính, toàn màn hình, không cần App Store."
- Tabs, with the visitor's platform selected first: iPhone (iOS 26) · iPhone (iOS 16.4–18) · Android · Samsung Internet · Máy tính.
- Numbered steps with screenshots. Menu buttons are shown as inline ionicons, never emoji. iOS 26 steps:
  1. "Mở WhereToGo bằng Safari."
  2. "Bấm nút ba chấm ở thanh dưới, rồi bấm Chia sẻ."
  3. "Kéo xuống, chọn “Thêm vào MH chính”."
  4. "Giữ bật “Mở dưới dạng ứng dụng web”, rồi bấm Thêm." [KIỂM TRA]
  5. "Mở WhereToGo từ màn hình chính và đăng nhập lại một lần."
- Static page: [Mở WhereToGo] → `/app/#/install`.
- In-app page on Android with `beforeinstallprompt`: [Cài ngay].
- Already installed: checkmark-circle icon, "Bạn đang dùng bản đã cài."
- The sheet version ends with [Để sau].

### 8.15 404

- **In-app:** compass icon in the empty-state circle, "Trang này không có trong sổ" / "Có thể link đã cũ hoặc gõ nhầm." [Về Trang chủ]
- **Deleted place:** "Địa điểm này đã bị xoá" / "Có thể bạn đã xoá nó ở máy khác." [Về Trang chủ]
- **Static `/404.html`:** the same copy, with [Về trang chủ WhereToGo] and [Mở app].

---

## 9. Build phases

Each phase can be shipped on its own. Sizes for one developer: S is 1 day or less, M is 2–4 days, L is 5–8 days.

| # | Phase | What ships | Main work | Depends on | Size |
|---|---|---|---|---|---|
| P0 | Owner tasks (start on day 1, in parallel) | Decisions | Buy [TÊN MIỀN]; create [EMAIL HỖ TRỢ]; book a lawyer to review consent, privacy, terms and the cross-border dossier; answer Q1–Q5 | — | Owner time |
| P1 | Một giao diện | Every existing screen in the new look; light/dark/manual theme; 404; boot splash | `tokens.css` and its generator; font swap; delete `dark.system.css`, `themes.css` and the theme prop; `WtgPage`, `WtgSheet`, Chip, Field, Button, Banner, EmptyState, PhotoTile; Ionic overrides; 12 px floor; content widths; reduced motion; check every Ionic overlay in dark mode | — | M (4) |
| P2 | Trang thật | Every Home entry point leads to its own page | Labelled dock, nhóm photo strip, checklist; `PlaceRow`/`PlaceGrid` replace `PlaceListPage`; Trang chọn quán; Tìm kiếm (URL state, diacritic-insensitive matching, filter sheet); Yêu thích; Detail rework, photo viewer, single info sheet; Bốc thăm; Swipe restyle (panel, Hot, filter sheet, scroll, keys); red-pen mark; Gần tôi ask page and list | P1 | L (8) |
| P3 | Form, quản lý, máy tính | Better editing; desktop layout | Sectioned form, sticky save, hours sheet, "Chưa rõ giờ" default, back guard, scroll to error; Manage nhóm (preview, ⋯) and nhãn (create); AddVisit toast; `IonSplitPane` sidebar; keyboard shortcuts | P2 | M (4) |
| P4 | Nhà mới | App at [TÊN MIỀN]/app/ with the public static site | Moved release first; CNAME; build split; manifest and Workbox settings; total precache budget; static pages and the gate; A1 (exact redirects, CORS, remove tunnel regex); split dev/prod Supabase projects; Google origins and URLs | P0 domain; P1 | M (4, plus DNS wait) |
| P5 | Đăng nhập & quyền dữ liệu | Everything a public user needs | Sign-in page; `consents` table with GRANTs; onboarding, re-consent and offline guard; incremental `drive.file` with scope check; `prompt=consent` removed from normal logins (A5, A6); server endpoints `DELETE /api/account` (revoke, admin delete, optional Drive folders) and `DELETE /api/google/credentials`; CSV/JSON export; Tài khoản, Privacy & data, Delete, About; sign-out sheet; install page and sheet; per-user seeding and folder-cache fixes (A13) | P4; lawyer-reviewed copy | L (8, including 3 server days) |
| P6 | Mở cửa | **GATE: sign-ups turned on** (invite beta first) | Database quota triggers and swipe-event compaction; Vercel WAF rule; backup job isolation, pagination, opt-out and quiet logs (A7, A8); per-user photo uniqueness (A9); usage monitoring; signup copy; Google "In production" with **no logo**; update D24, SETUP and D-13; owner and lawyer file the cross-border dossier within 60 days of the first transfer | P5 | M (3) |
| P7 | Bản đồ | Gần tôi map | MapLibre as a lazy chunk kept out of the precache and in a runtime cache; OpenFreeMap styles; cluster pins with padded tap box; info sheet; list toggle; no-WebGL, offline and tile-error fallbacks; desktop results panel; attribution | P2, P4 | L (5) |
| Later | — | — | Spike for branded Google consent with Google Identity Services and `signInWithIdToken` (path c); Google Takeout import; share links | — | — |

Total is about 36 working days, roughly 7–8 weeks for one developer. Sign-ups open only after P6. Opening after P4 would put the old screens in front of strangers, so it is not recommended.

---

## 10. Open questions for the owner

| # | Question | Recommended default |
|---|---|---|
| Q1 | Which domain? | Buy a short .vn or .com now, before P4. About 300.000–800.000 ₫ per year |
| Q2 | What Google's consent screen shows: (a) unverified and showing "…supabase.co", (b) Supabase Pro plus a custom domain at about $35 per month, or (c) a sign-in rewrite | **(a)**. Do not upload a logo. Try (c) after launch |
| Q3 | Build the new pages before opening to the public? | Yes: P1–P3, then P4–P6 |
| Q4 | Invite-only beta first? | Yes: about 20 people for 2 weeks with pre-created users. Test Google account linking before relying on it |
| Q5 | Keep Home as the hub, without a global tab bar? | Yes. After the beta, ask testers "Có lúc nào bạn bị kẹt không?" |
| Q6 | A serif font for headings (Newsreader)? | Yes. Check "Ẩm thực" and "Quán Ốc Đào" on your own iPhone first |
| Q7 | Name the swipe score "Độ hot" and the button "Hot"? | Yes |
| Q8 | Quota numbers (V30)? | As listed. Review once the database passes 250 MB |
| Q9 | Minimum age? | 16+ |
| Q10 | Who is named as the operator? | Your real name plus [EMAIL HỖ TRỢ]. Law 91 requires an identifiable controller. A lawyer also files the cross-border dossier |
| Q11 | Notice period before shutting down ([SỐ NGÀY])? | 30 days |
| Q12 | Should your own account keep the weekly backup? | You re-consent like everyone else; box 3 is unticked unless you tick it |
| Q13 | "Đổi quán khác" button on the daily pick? | Yes; it does not change U33 |
| Q14 | Should "Chốt quán này" add +1 hot? | No; it records nothing |

---

## 11. Mockup list

**Phone frames:** 390×844 with a status bar and home indicator. Sample user: "Nguyễn Minh Anh", `minhanh@example.com`, avatar initials "MA". Date: Thứ Bảy, 17 tháng 10.

**Sample nhóm:** Quán ăn 12 · Quán uống 8 · Chỗ chơi 5 · Du lịch 3.

**D** marks the 7 frames drawn in dark mode.

| # | Screen | Exact content |
|---|---|---|
| 1 | In-app gate (Zalo) | Gate overlay over a blurred landing page; Zalo steps; [Sao chép link]; [Vẫn xem trang] |
| 2 | Sign-in | Logo, "WhereToGo", tagline, supabase.co caption, light Google button, full disclosure, 3 links |
| 3 | Onboarding 1/4 Đồng ý | Step bar; "Chào Minh Anh, trước khi bắt đầu"; boxes 1 and 4 ticked, 2 and 3 unticked (3 disabled with its helper); location info box; primary button enabled |
| 4 **D** | Onboarding 2/4, Drive missing | "Google chưa cho phép lưu ảnh" state; [Thử lại] · [Để sau] |
| 5 | Onboarding 3/4 Nhóm | The 4 rows ticked with their prompts; "＋ Thêm nhóm khác"; [Tạo 4 nhóm] |
| 6 | Home, new user | Date line; checklist (Thêm 3 địa điểm 0/3); 4 nhóm cards with empty bands; Gần tôi card; dock |
| 7 | Home, active | Daily pick "Bún chả Hương Liên", Quán ăn · 50.000–90.000 ₫, "Đang mở · đóng lúc 20:30"; Quán ăn card "Chán cơm thì ăn gì?" with 3 photos and "+9"; Quán uống card "+5"; dock |
| 8 **D** | Home, active | Same content as 7 |
| 9 | Info sheet over Home | Bún chả Hương Liên, 16:10 photo, "cách bạn 1,2 km", story clamped to 3 lines, heart, [Chỉ đường] [Xem đầy đủ] |
| 10 | Trang chọn quán: Quán uống | "8 địa điểm · 3 đã đi"; [Vuốt nhóm này] [Bốc thăm]; grid: Cộng Cà Phê 35.000–65.000 ₫ (Hứng thú) · Cà phê Giảng 30.000–50.000 ₫ (Đã đi) · The Note Coffee 40.000–70.000 ₫ · Cafe Đinh 25.000–45.000 ₫ · Tranquil Books & Coffee 45.000–75.000 ₫ · Loading T Cafe 40.000–60.000 ₫ |
| 11 | Tìm kiếm | Query "bun"; chips Nhóm: Quán ăn ✓ and Giá: 50.000–150.000 ₫ ✓; "3 địa điểm · Xoá bộ lọc"; rows: Bún chả Hương Liên 1,2 km · Bún riêu Hàng Bạc 0,6 km · Bún đậu Hàng Khay 0,9 km |
| 12 | Filter sheet (Search) | Nhóm, Giá presets (one on), Nhãn "Hẹn hò" on, Trạng thái; footer [Xoá bộ lọc] [Xem 3 kết quả] |
| 13 **D** | Yêu thích | "6 nơi"; chips; grid with Cộng Cà Phê, Phở Thìn Lò Đúc, Phố đi bộ Hồ Gươm (Miễn phí), Bản Cát Cát – Sa Pa, Cà phê Giảng, Ốc Đào |
| 14 | Gần tôi: hỏi | Location info box; Quán ăn chosen; Tầm giá "Bất kỳ"; 3 km selected; [Tìm quanh đây] |
| 15 | Gần tôi: list | "Quán ăn · trong 3 km"; rows: Bún riêu Hàng Bạc 0,6 km · Bún chả Hương Liên 1,2 km · Phở Thìn Lò Đúc 1,8 km; caption "3 quán trong Quán ăn chưa có vị trí — Thêm vị trí" |
| 16 **D** | Gần tôi: map with sheet | Chỗ chơi · 3 km; one cluster "3"; selected pin, Phố đi bộ Hồ Gươm, sheet: "Miễn phí · cách bạn 0,8 km · T6 19:00–24:00, T7–CN cả ngày"; attribution visible |
| 17 | Bốc thăm, chosen | Quán ăn chosen; 1 Phở Thìn Lò Đúc (red-pen circle, [Chỉ đường] [Xem đầy đủ]) · 2 Bánh cuốn Thanh Vân · 3 Ốc Đào; [Bốc lại] |
| 18 | Swipe, mid-drag | "Quán ăn · còn 14 thẻ"; Phở Thìn Lò Đúc tilted right with the "+1 hot" circled stamp; panel "60.000–80.000 ₫ · 13 Lò Đúc", flame "Độ hot 3"; 5 actions |
| 19 | Detail, top | Bún chả Hương Liên: photo "1/6", h1, 4 stars, Đã đi, Độ hot 5, the facts list (24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội; 50.000 ₫ – 90.000 ₫; Đang mở · đóng lúc 20:30; 1,2 km; 2 lần đi) |
| 20 **D** | Detail, scrolled | Câu chuyện: "Lần đầu ăn ở đây là trưa mưa tháng Bảy, cả nhóm chen nhau ở tầng hai. Chả nướng thơm than hoa, nước chấm hơi ngọt — lần sau nhớ gọi thêm nem cua bể."; Ghi chú "Gửi xe máy ở ngõ bên cạnh, 5.000 ₫."; nhãn Hẹn hò, Ăn trưa; visits 12/07/2026 and 03/10/2026; sticky bar |
| 21 | Add place, filled from a link | Paste card success; Tên "Cộng Cà Phê"; Quán uống chosen; 35.000–65.000 ₫; 2 photos (first marked "Ảnh bìa"); "Đã có vị trí từ link Google Maps"; Cảm nhận section; collapsed "Thêm chi tiết"; sticky [Lưu địa điểm] |
| 22 | Tài khoản | Profile; Drive connected; Nhóm (4), Nhãn (1); Giao diện "Theo máy"; menu rows; [Đăng xuất] |
| 23 | Quyền riêng tư & dữ liệu | 3 consents with dates; backup toggle off; CSV and JSON exports; Xoá tài khoản; email footer |
| 24 **D** | Xoá tài khoản | List of what is deleted; [Tải dữ liệu trước]; 3 boxes with the last one ticked; danger button enabled |
| 25 | Quản lý nhóm with editor sheet | Sheet: Tên "Ăn vặt", Câu gợi ý "Đói giữa buổi thì ăn gì?", ice-cream icon chosen, live card preview |
| 26 | Install sheet (iOS 26) | iPhone tab; 5 steps with inline icons; [Để sau] |
| L1 | Landing, desktop 1280 (light) | Header; two-column hero with the Home and Detail screenshots captioned "Dữ liệu minh hoạ"; 3 steps; 3×2 feature grid; privacy block with the Limited Use text; install section; FAQ; final call to action; footer |
| L2 **D** | Landing, phone 390 (dark) | The same sections in one column, hero first, screenshots stacked |
| Optional | Desktop app, Home at 1280 (light) | Sidebar with the nhóm list; daily pick and a 2-column grid of nhóm cards; no dock |

Contrast and font measurements were computed with throwaway scripts during the design session; they are not stored in the repo. Recompute contrast with any WCAG 2.x calculator from the hex values in §4.1, and rebuild the Roboto subset with the `pyftsubset` command in §4.2.
