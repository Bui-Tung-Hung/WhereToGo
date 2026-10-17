# WhereToGo "Sổ tay" mockup kit — READ FULLY BEFORE WRITING ANY ARTBOARD

You are drawing hi-fi mockups of the redesigned WhereToGo app on a Design canvas. Every artboard is ONE self-contained `.dc.html` file. Consistency across ~34 artboards drawn by several artists is the top priority: copy the snippets below EXACTLY (tokens, fonts, skeleton, components) and only change content.

Source of truth for WHAT to draw: the final spec `SPEC.md` (sections 4–8 and the mockup list in section 11). This kit is HOW to draw it.

Paths (relative to this file):
- Spec: `SPEC.md`
- Mockup sources (the artboards drawn with this kit): `mockups/*.dc.html`, layout in `mockups/canvas.json`
- Icons: the mockups inline Ionicons 8 outline SVGs; in the app use the `ionicons` package that is already a dependency.

---

## 1. Format rules (these fail SILENTLY if broken)

- Write each file with your file-writing tool (Write), one file per call. Never generate files with a script. Do not publish; the lead publishes.
- Keep the head line `<script src="./support.js"></script>` EXACTLY.
- Close every non-void element (`<path ...></path>`, never `<path/>`; `<div></div>`); quote every attribute value. Void elements (`<img>`, `<input>`, `<br>`, `<meta>`, `<link>`) need no closing tag.
- All UI is literal markup inside `<x-dc> … </x-dc>`. Never build UI from script (no innerHTML/appendChild/document.*).
- `{{hole}}` is a dotted lookup into `renderVals()` ONLY — never an expression (`{{a+b}}`, `{{!x}}` fail). The only holes you need: `{{mode}}` on the root class (and optional simple state flags if you build interaction).
- Always include the `<script type="text/x-dc" data-dc-script data-props='…'>` block with `class Component extends DCLogic { renderVals() { … } }` — classic JS, no imports, no TypeScript.
- `data-props` is single-quoted JSON. Inside it: `&amp;` for &, `&#39;` for a literal single quote, `\"` for double quotes. Raw UTF-8 Vietnamese is fine.
- No emoji anywhere. Icons = inline SVG from icons.md. No `<iframe>`, `<object>`, `<embed>`, no network except the Google Fonts `<link>` in `<helmet>`.
- Accessible as drawn: real `<button>`, `<a href>`, `<input>` + `<label>`; icon-only buttons get `aria-label`; never `onClick`/`role` on a div. Decorative SVG has `aria-hidden="true"` (already in icons.md).
- Lay out sibling groups with flex/grid + `gap` (not margins/whitespace). Inline `style="…"` for layout and component styling; `<helmet><style>` only for the shared tokens/type classes below.
- NO fake iOS status bar (no "9:41", battery, wifi) and NO fake home indicator or keyboard. Leave the top 47px and bottom 34px of a phone frame as plain background (the real phone draws its own bars there).
- No lorem ipsum, no filler, no invented stats or testimonials. Use the sample data in §6. Unknown facts → visible placeholders like [TÊN MIỀN], [EMAIL HỖ TRỢ], [MÃ DỰ ÁN], [TÊN NGƯỜI VẬN HÀNH].
- Do NOT read your files back, render, screenshot or open them. Write carefully once.
- `lang="vi"` on `<html>`; give each artboard its own `<title>` (a few words, Vietnamese).

Links between artboards (clickable prototype in Play mode): an `<a href="Other.dc.html">` moves to that artboard. Style the `<a>` itself as the button (no `<button>` inside an `<a>`). Use ONLY filenames from the list in §7. Use links for obvious navigation (back → previous screen, dock items, cards → detail, primary CTAs). Everything else is a `<button type="button">`.

---

## 2. The artboard skeleton (copy exactly; change title, content, the `dark` default and `$preview` size)

```html
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Trang chủ</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600&amp;family=Newsreader:wght@400;600&amp;family=Roboto:wght@500&amp;display=swap" rel="stylesheet">
<style>
/* ===== WTG TOKENS v1 — identical in every artboard, do not edit ===== */
body{margin:0}
.wtg{--bg:#F5F2E9;--surface:#FBF9F4;--surface-2:#EDE8DC;--border:#E2DBCC;--border-strong:#8A8072;--text:#1C1917;--muted:#5C554B;--accent:#A8482A;--accent-pressed:#8F3D23;--on-accent:#FFFFFF;--accent-text:#96401F;--accent-soft:#F4E1D7;--success:#2D6E45;--success-bg:#E2EEE2;--warning:#8A5600;--warning-bg:#F5E6C8;--danger:#B3261E;--danger-bg:#F8E0DA;--on-danger:#FFFFFF;--focus:#2F5DA8;--inverse-bg:#1C1917;--inverse-text:#F5F2E9;--inverse-action:#F09D7B;--scrim:rgba(28,25,23,.45);--photo-edge:rgba(28,25,23,.08);--pill:rgba(251,249,244,.92);--dock:rgba(251,249,244,.96);--e1:0 1px 2px rgba(28,25,23,.06);--e2:0 8px 24px -8px rgba(28,25,23,.20);--g-fill:#FFFFFF;--g-stroke:#747775;--g-text:#1F1F1F;--ph-1:#D9C7A7;--ph-2:#C9B8A6;--ph-3:#B9C3AA;--ph-4:#D8B8A4;--ph-5:#C2C9CC;--ph-6:#D3C4A0;--ph-icon:rgba(28,25,23,.32);--viewer-bg:#0C0A09;--sans:'Be Vietnam Pro',system-ui,-apple-system,'Segoe UI',sans-serif;--serif:'Newsreader',Georgia,'Times New Roman',serif;color-scheme:light;background:var(--bg);color:var(--text);font-family:var(--sans);font-size:16px;line-height:24px;-webkit-font-smoothing:antialiased}
.wtg.dark{--bg:#141311;--surface:#1E1C19;--surface-2:#2A2723;--border:#3A3631;--border-strong:#7D7466;--text:#F2EDE3;--muted:#B3AB9C;--accent:#E58A66;--accent-pressed:#CF7652;--on-accent:#1C1210;--accent-text:#F09D7B;--accent-soft:#3B2720;--success:#86CB9A;--success-bg:#1F3326;--warning:#E9B65E;--warning-bg:#3A2E17;--danger:#F49283;--danger-bg:#3E211D;--on-danger:#1C1210;--focus:#93B6F2;--inverse-bg:#F2EDE3;--inverse-text:#1C1917;--inverse-action:#96401F;--scrim:rgba(0,0,0,.60);--photo-edge:rgba(255,255,255,.06);--pill:rgba(30,28,25,.92);--dock:rgba(30,28,25,.96);--e1:none;--e2:0 8px 24px -8px rgba(0,0,0,.70);--g-fill:#131314;--g-stroke:#8E918F;--g-text:#E3E3E3;--ph-1:#4A4033;--ph-2:#463E37;--ph-3:#3D4436;--ph-4:#4D3A31;--ph-5:#3B4145;--ph-6:#48412F;--ph-icon:rgba(255,255,255,.30);color-scheme:dark}
.wtg *{box-sizing:border-box}
.wtg button,.wtg input,.wtg select,.wtg textarea{font:inherit;color:inherit}
.wtg a{color:var(--accent-text);text-decoration:none}
.wtg a:hover{color:var(--accent-text)}
.wtg p a,.wtg li a{text-decoration:underline;text-underline-offset:3px}
.wtg :focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.t-display{font-family:var(--serif);font-size:36px;line-height:46px;font-weight:600;letter-spacing:-0.01em;margin:0}
.t-h1{font-family:var(--serif);font-size:28px;line-height:36px;font-weight:600;margin:0}
.t-h2{font-family:var(--serif);font-size:22px;line-height:30px;font-weight:600;margin:0}
.t-name{font-family:var(--serif);font-size:17px;line-height:22px;font-weight:600;margin:0}
.t-name-lg{font-family:var(--serif);font-size:24px;line-height:32px;font-weight:600;margin:0}
.t-numeral{font-family:var(--serif);font-size:28px;line-height:36px;font-weight:600}
.t-story{font-family:var(--serif);font-size:18px;line-height:28px;font-weight:400;margin:0}
.t-title{font-size:17px;line-height:24px;font-weight:600;margin:0}
.t-body{font-size:16px;line-height:24px;font-weight:400;margin:0}
.t-btn{font-size:16px;line-height:24px;font-weight:600}
.t-body-sm{font-size:15px;line-height:22px;font-weight:400;margin:0}
.t-label{font-size:14px;line-height:20px;font-weight:600;margin:0}
.t-caption{font-size:13px;line-height:18px;font-weight:400;margin:0}
.t-micro{font-size:12px;line-height:16px;font-weight:600;white-space:nowrap}
.muted{color:var(--muted)}
/* ===== end WTG TOKENS v1 ===== */
</style>
</helmet>
<div class="wtg {{mode}}" style="width: 390px; height: 844px; position: relative; overflow: hidden; display: flex; flex-direction: column; background: var(--bg)">
  <!-- top safe area: leave empty -->
  <div style="height: 47px; flex: none"></div>
  <!-- header, content, dock … -->
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"dark":{"editor":"boolean","default":false,"section":"Giao diện"},"$preview":{"width":390,"height":844}}'>
class Component extends DCLogic {
  renderVals() {
    return { mode: (this.props.dark ?? false) ? 'dark' : 'light' };
  }
}
</script>
</body>
</html>
```

- For a DARK-default artboard set `"default":true` AND write `(this.props.dark ?? true)` in renderVals.
- The `dark` tweak lets the owner flip any screen between light and dark — keep it on every artboard.
- Taller phone frames (a scrolled long page) keep width 390 and set a taller height in BOTH the root style and `$preview` (the lead sets the canvas frame to match).
- A desktop/landing PAGE (fluid, not a device): root style has NO px width: `style="min-height: 100vh; width: 100%; background: var(--bg)"` and content in `max-width` containers with % / fr; grids use `repeat(auto-fit, minmax(min(280px, 100%), 1fr))`; it must still work at phone width. `$preview` = {"width":1280,"height":<its full height>}.
- Body text never < 12px. Never set Vietnamese in ALL CAPS. No italics. Tap targets ≥ 44px.

---

## 3. Layout constants (phone 390×844)

- Top safe area 47px empty. Bottom safe area 34px empty (dock/sticky bars sit above it; their background extends into it).
- Header 56px. Side gutter 16px. Vertical rhythm: 4/8/12/16/24/32/48/64.
- Radii: 8 thumbnails · 12 buttons/inputs/photos · 16 cards · 24 sheet tops/dialogs · 999 chips/avatars/＋/pins.
- Elevation: cards `border: 1px solid var(--border); box-shadow: var(--e1)`; floating (dock, sheet, swipe card, map buttons) `box-shadow: var(--e2)` (+ `border: 1px solid var(--border)` in dark is already fine to always include).
- Content max widths (desktop): reading 680, forms 560, sign-in 420, grids/landing 1120.

## 4. Components (copy & adapt; all colors via var())

### 4.1 Header (sub-page): back · title · ≤2 icon buttons + ⋯
```html
<header style="height: 56px; flex: none; display: flex; align-items: center; gap: 4px; padding: 0 8px">
  <a href="Home.dc.html" aria-label="Quay lại" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 999px; color: var(--text)">[chevron-back 24]</a>
  <div class="t-title" style="flex: 1; min-width: 0; text-align: center; line-height: 28px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">Tìm kiếm</div>
  <button type="button" aria-label="Thêm khác" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 0; background: transparent; border-radius: 999px; color: var(--text)">[ellipsis-horizontal 24]</button>
</header>
```
Rules: pages that have an h1 in the content (detail, nhóm page, Yêu thích, Bốc thăm, Gần tôi, settings sub-pages with h1) show an EMPTY toolbar title (keep the flex:1 spacer) — the h1 sits in the content. Utility pages (Tìm kiếm, Bộ lọc) show the toolbar title. Never show the same name twice.

### 4.2 Home header: wordmark · (offline icon) · avatar
```html
<header style="height: 56px; flex: none; display: flex; align-items: center; gap: 8px; padding: 0 8px 0 16px">
  <div style="font-family: var(--serif); font-size: 22px; line-height: 30px; font-weight: 600; flex: 1">WhereToGo</div>
  <a href="TaiKhoan.dc.html" aria-label="Tài khoản" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 999px">
    <span style="width: 32px; height: 32px; border-radius: 999px; background: var(--accent-soft); color: var(--accent-text); display: flex; align-items: center; justify-content: center; font-size: 13px; line-height: 18px; font-weight: 600">MA</span>
  </a>
</header>
```

### 4.3 Dock (Home only) — 5 labelled slots, ＋ raised in the middle
```html
<nav aria-label="Điều hướng chính" style="position: absolute; left: 0; right: 0; bottom: 0; height: 98px; padding: 0 8px 34px; background: var(--dock); border-top: 1px solid var(--border); box-shadow: var(--e2); display: grid; grid-template-columns: 1fr 1fr 64px 1fr 1fr; align-items: center">
  <a href="TimKiem.dc.html" style="height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: var(--muted)">[search-outline 24]<span class="t-micro">Tìm</span></a>
  <a href="YeuThichDark.dc.html" style="height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: var(--muted)">[heart-outline 24]<span class="t-micro">Yêu thích</span></a>
  <a href="ThemDiaDiem.dc.html" style="height: 76px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 2px; color: var(--muted); transform: translateY(-12px)">
    <span style="width: 56px; height: 56px; border-radius: 999px; background: var(--accent); color: var(--on-accent); display: flex; align-items: center; justify-content: center; box-shadow: var(--e2)">[add 28]</span><span class="t-micro">Thêm</span></a>
  <a href="Vuot.dc.html" style="height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: var(--muted)">[layers-outline 24]<span class="t-micro">Vuốt</span></a>
  <a href="BocTham.dc.html" style="height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: var(--muted)">[shuffle-outline 24]<span class="t-micro">Bốc thăm</span></a>
</nav>
```
(Content area above it gets `padding-bottom: 110px` so nothing hides behind the dock.)

### 4.4 Buttons (48px; compact 44px). ONE primary per screen.
```html
<a href="…" class="t-btn" style="height: 48px; padding: 0 20px; border-radius: 12px; background: var(--accent); color: var(--on-accent); display: inline-flex; align-items: center; justify-content: center; gap: 8px">[icon 20] Chỉ đường</a>
<button type="button" class="t-btn" style="height: 48px; padding: 0 20px; border-radius: 12px; background: var(--surface); color: var(--text); border: 1px solid var(--border-strong); display: inline-flex; align-items: center; justify-content: center; gap: 8px">Xem đầy đủ</button>
<button type="button" class="t-btn" style="height: 44px; padding: 0 12px; border-radius: 12px; background: transparent; color: var(--accent-text); border: 0">Sửa</button>   <!-- ghost -->
<button type="button" class="t-btn" style="height: 48px; padding: 0 20px; border-radius: 12px; background: transparent; color: var(--danger); border: 1px solid var(--danger)">Xoá tài khoản</button>  <!-- destructive (not final) -->
<button type="button" class="t-btn" style="height: 48px; padding: 0 20px; border-radius: 12px; background: var(--danger); color: var(--on-danger); border: 0">Xoá vĩnh viễn tài khoản</button>  <!-- final destructive confirm only -->
<button type="button" disabled class="t-btn" style="height: 48px; padding: 0 20px; border-radius: 12px; background: var(--surface-2); color: var(--muted); border: 0">Đồng ý và tiếp tục</button>  <!-- disabled + caption under it saying why -->
```
On `<a>` buttons add `text-decoration: none` is automatic (helmet). Full-width buttons: add `width: 100%`.

### 4.5 Google sign-in button (exact; never recolor)
```html
<a href="BatDau1DongY.dc.html" style="height: 44px; min-width: 240px; max-width: 400px; width: 100%; padding: 0 12px; border-radius: 999px; background: var(--g-fill); border: 1px solid var(--g-stroke); color: var(--g-text); display: flex; align-items: center; justify-content: center; gap: 10px; font-family: Roboto, var(--sans); font-size: 14px; line-height: 20px; font-weight: 500">
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" style="display: block; flex: none"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path></svg>
  Tiếp tục với Google
</a>
```

### 4.6 Chips
Filter chip (36 visible / 44 tap area via padding wrapper not needed in mockup — keep 36px tall inside a 44px-tall row):
```html
<button type="button" aria-pressed="false" class="t-label" style="height: 36px; padding: 0 14px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border-strong); color: var(--text); display: inline-flex; align-items: center; gap: 6px; white-space: nowrap">Quán uống</button>
<button type="button" aria-pressed="true" class="t-label" style="height: 36px; padding: 0 14px 0 10px; border-radius: 999px; background: var(--accent-soft); border: 1px solid var(--accent); color: var(--accent-text); display: inline-flex; align-items: center; gap: 6px; white-space: nowrap">[checkmark 16] Quán ăn</button>
<button type="button" class="t-label" style="height: 36px; padding: 0 10px 0 14px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border-strong); color: var(--text); display: inline-flex; align-items: center; gap: 6px; white-space: nowrap">Giá [chevron-down 16]</button>   <!-- opens a picker -->
```
Display chips (28px, micro): nhóm `background: var(--accent-soft); color: var(--accent-text)`; nhãn `background: var(--surface-2); color: var(--muted)`:
```html
<span class="t-micro" style="height: 28px; padding: 0 10px; border-radius: 999px; background: var(--accent-soft); color: var(--accent-text); display: inline-flex; align-items: center; gap: 4px">Quán ăn</span>
```
Status chips (28px, icon 16 + micro label):
- Hứng thú: `background: var(--accent-soft); color: var(--accent-text)` + flag-outline
- Chưa đi: `background: var(--surface-2); color: var(--muted)` + ellipse-outline
- Đã đi: `background: var(--success-bg); color: var(--success)` + checkmark-circle-outline

### 4.7 Photo placeholder (we have no real photos — never draw fake food illustrations)
```html
<div role="img" aria-label="Ảnh minh hoạ: Bún chả Hương Liên" style="aspect-ratio: 16 / 10; width: 100%; border-radius: 12px; background: var(--ph-1); box-shadow: inset 0 0 0 1px var(--photo-edge); display: flex; align-items: center; justify-content: center; color: var(--ph-icon)">[image-outline 32]</div>
```
Use the place's tone from §6 (`--ph-1`…`--ph-6`). Square for grids/thumbnails (`aspect-ratio: 1 / 1`), 4:3 detail hero, 16:10 daily pick/info sheet, 4:5 swipe. Missing-photo variant (spec 4.7): surface-2 tile with the first letter of the name in Newsreader 600, muted — use it for 1–2 places so both states appear.
Pills over photos: solid `background: var(--pill)` with text color var(--text), e.g. "1/6", status pill.

### 4.8 Place row (list, ≥80px)
```html
<a href="ChiTiet.dc.html" style="display: flex; gap: 12px; padding: 12px 16px; align-items: center; color: var(--text)">
  <div role="img" aria-label="Ảnh minh hoạ: Bún chả Hương Liên" style="width: 64px; height: 64px; flex: none; border-radius: 8px; background: var(--ph-1); box-shadow: inset 0 0 0 1px var(--photo-edge); display: flex; align-items: center; justify-content: center; color: var(--ph-icon)">[image-outline 20]</div>
  <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px">
    <div class="t-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-top: 2px">Bún chả Hương Liên</div>
    <div class="t-caption muted">Quán ăn · 50.000–90.000 ₫ · 1,2 km</div>
    <div style="display: flex; align-items: center; gap: 8px">[status chip] [4 stars 14px in var(--text)] [filled heart 16 in var(--accent) if favourite]</div>
  </div>
</a>
```
Rows separated by `border-top: 1px solid var(--border)` (inset 92px from left) or in a surface card.

### 4.9 Place card (grid; 2 columns, 12px gap on phones)
Square photo (radius 12) with optional status pill top-left (`background: var(--pill)`) and heart in a 28px `var(--pill)` circle top-right if favourite; below: name `t-name` (≤2 lines), caption price one line.

### 4.10 Nhóm card (Home)
Surface, radius 16, `border: 1px solid var(--border); box-shadow: var(--e1)`, padding 16, gap 12:
- Row 1: 32px circle `background: var(--surface-2)` with the nhóm icon 20 + `t-label muted` "Quán ăn · 12 quán".
- Row 2: prompt in `t-h2` ("Chán cơm thì ăn gì?").
- Row 3: grid of 4 equal squares (2px gap, radius 8): 3 photo placeholders + "+9" tile (`background: var(--surface-2)`, Newsreader 22/30 600, centered, color var(--text)). N = count − 3; omit the tile when 0.
- Empty nhóm: instead of row 3, a 72px band `background: var(--surface-2); border-radius: 12px` with caption "Chưa có địa điểm · " + accent-text link "Thêm vào Quán ăn".
The whole card is an `<a>` to the nhóm page.

### 4.11 Form field
```html
<div style="display: flex; flex-direction: column; gap: 6px">
  <label for="f-ten" class="t-label">Tên (bắt buộc)</label>
  <input id="f-ten" type="text" value="Cộng Cà Phê" class="t-body" style="height: 48px; padding: 0 14px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border-strong); color: var(--text); width: 100%">
  <p class="t-caption muted">Helper text.</p>
</div>
```
Error: border `var(--danger)` + caption in `var(--danger)` with alert-circle-outline 16. Focus: border `var(--accent)` + `outline: 2px solid var(--focus); outline-offset: 2px`. Required → "(bắt buộc)" in the label, never `*`. Textareas same style, `min-height: 96px; padding: 12px 14px`.

### 4.12 Checkbox row (consent etc.)
```html
<label style="display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; cursor: pointer">
  <input type="checkbox" checked style="width: 24px; height: 24px; margin: 0; flex: none; accent-color: var(--accent)">
  <span class="t-body-sm"><strong style="font-weight: 600">(bắt buộc)</strong> Lưu kho địa điểm của tôi …</span>
</label>
```
Disabled box: `disabled` attribute + text in `var(--muted)` + helper caption.

### 4.13 Segmented control
```html
<div role="radiogroup" aria-label="Bán kính" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; padding: 4px; border-radius: 12px; background: var(--surface-2)">
  <button type="button" role="radio" aria-checked="false" class="t-label" style="height: 40px; border: 0; border-radius: 9px; background: transparent; color: var(--text)">1 km</button>
  <button type="button" role="radio" aria-checked="true" class="t-label" style="height: 40px; border: 0; border-radius: 9px; background: var(--surface); color: var(--text); box-shadow: var(--e1); outline: 1px solid var(--border-strong)">3 km</button>
  …
</div>
```

### 4.14 Bottom sheet (phone) over a dimmed screen
Draw the underlying screen (simplified is fine), then a full-size scrim layer `position: absolute; inset: 0; background: var(--scrim)`, then the sheet `position: absolute; left: 0; right: 0; bottom: 0; background: var(--surface); border-radius: 24px 24px 0 0; box-shadow: var(--e2); padding: 8px 16px 34px` with: handle `width: 36px; height: 5px; border-radius: 999px; background: var(--border-strong); margin: 0 auto`, a header row (h2 + 44px close button aria-label "Đóng" with close-outline), content, footer with ≤2 buttons.

### 4.15 Empty state
Centered column, max-width 320px, gap 12: 72px circle `background: var(--surface-2)` with icon 32 in var(--muted); `t-h2` title; `t-body-sm muted` one sentence; one primary button; optional ghost.

### 4.16 Banner (inside content, never a left-border card)
```html
<div role="status" style="display: flex; gap: 10px; align-items: center; padding: 12px 14px; border-radius: 12px; background: var(--surface-2)">[cloud-offline-outline 20]<p class="t-body-sm" style="flex: 1">Đang offline — chỉ xem được.</p></div>
```
Drive/quota banners use `background: var(--warning-bg)`, icon in `var(--warning)`, text var(--text), optional ghost action.

### 4.17 Toast (bottom, above dock/sticky bar)
```html
<div role="status" aria-live="polite" style="position: absolute; left: 16px; right: 16px; bottom: 118px; min-height: 48px; padding: 12px 16px; border-radius: 12px; background: var(--inverse-bg); color: var(--inverse-text); display: flex; align-items: center; gap: 12px; box-shadow: var(--e2)"><span class="t-body-sm" style="flex: 1">+1 độ hot</span><button type="button" class="t-label" style="border: 0; background: transparent; color: var(--inverse-action); height: 44px; padding: 0 4px">Hoàn tác</button></div>
```

### 4.18 Onboarding stepper
```html
<div style="display: flex; flex-direction: column; gap: 8px">
  <p class="t-caption muted">Bước 1/4</p>
  <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px"><span style="height: 4px; border-radius: 999px; background: var(--accent)"></span><span style="height: 4px; border-radius: 999px; background: var(--border-strong)"></span><span style="height: 4px; border-radius: 999px; background: var(--border-strong)"></span><span style="height: 4px; border-radius: 999px; background: var(--border-strong)"></span></div>
</div>
```

### 4.19 Red-pen mark (signature; ONLY on: daily-pick label underline, swipe stamps circle, "Chốt quán này" circle)
Underline (place under the text, width ≈ text width):
```html
<svg width="150" height="10" viewBox="0 0 150 10" aria-hidden="true" style="display: block"><path d="M3 7 C 40 2, 95 1, 147 5" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"></path></svg>
```
Circle (absolutely positioned around a numeral or stamp; scale width/height to fit):
```html
<svg width="72" height="56" viewBox="0 0 72 56" aria-hidden="true" style="position: absolute; left: -14px; top: -10px; pointer-events: none"><path d="M10 33 C 5 16, 30 4, 50 7 C 66 10, 70 26, 60 39 C 49 52, 18 54, 9 42 C 4 35, 9 22, 22 15" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"></path></svg>
```

### 4.20 Stars (rating, ink not gold)
5 × star / star-outline at 14px (rows) or 20px (detail), `color: var(--text)`; wrap in `<span role="img" aria-label="4 trên 5 sao" style="display: inline-flex; gap: 1px">`.

### 4.21 Map (Gần tôi map board only)
Draw an abstract map base (no real tiles): `background: #EEEAE0` light / `#1B1A18` dark (use a local CSS var set inline on that div) with a few street lines as thin absolutely positioned divs (`background: var(--surface)`, 6–10px wide, rotated a little) and a lake shape (`border-radius: 50%`, `background` a muted blue-grey `#C9D3D6` / `#26303A`). Pins per spec §5 "Map pin". Attribution "© OpenFreeMap © OpenStreetMap" visible bottom-left in a pill.

---

## 5. Icon meanings (one meaning each — spec 4.6)
heart = Yêu thích · star = Đánh giá · flame = Độ hot / Hot (+1) · close = Bỏ qua · flag = Hứng thú · ellipse-outline = Chưa đi · checkmark-circle = Đã đi · arrow-undo = Hoàn tác · information-circle = Thông tin · search = Tìm · layers = Vuốt · shuffle = Bốc thăm · locate = Gần tôi · navigate = Chỉ đường · add = Thêm · create = Sửa · trash = Xoá · cloud-offline = Offline · time = Giờ · cash = Giá · location = Địa chỉ · calendar = Lần đi · pricetag = Nhãn · options = Lọc · ellipsis-horizontal = ⋯ · refresh = Đổi quán khác.
Nhóm icons: Quán ăn = restaurant-outline · Quán uống = cafe-outline · Chỗ chơi = game-controller-outline · Du lịch = airplane-outline · Ăn vặt = ice-cream-outline.
Sizes: 24 default, 20 in buttons/chips/facts, 16 inline. Outline style; filled only for an "on" state (filled heart = favourite; filled flame on the Hot button).

## 6. Sample data (use EXACTLY these; photos are placeholders with the given tone)

User: Nguyễn Minh Anh · minhanh@example.com · avatar initials "MA". Today: Thứ Bảy, 17 tháng 10. App version WhereToGo 0.3.0.
Nhóm (count · icon · prompt): Quán ăn 12 · restaurant · "Chán cơm thì ăn gì?" | Quán uống 8 · cafe · "Chán nước thì uống gì?" | Chỗ chơi 5 · game-controller · "Chán ở nhà thì đi đâu?" | Du lịch 3 · airplane · "Cuối tuần trốn đi đâu?". Nhãn: Hẹn hò (4 địa điểm), Ăn trưa (3).

| Place | Nhóm | Price | Other | Tone |
|---|---|---|---|---|
| Bún chả Hương Liên | Quán ăn | 50.000–90.000 ₫ (detail: 50.000 ₫ – 90.000 ₫) | 24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội · Đã đi · 4★ · Độ hot 5 · Đang mở · đóng lúc 20:30 · 1,2 km · nhãn Hẹn hò, Ăn trưa · Yêu thích · 6 photos · visits 12/07/2026 "Đi với nhóm lớp", 03/10/2026 "Ăn trưa với chị Hà" · Thêm ngày 12/07/2026 · Sửa lần cuối 03/10/2026 | ph-1 |
| Phở Thìn Lò Đúc | Quán ăn | 60.000–80.000 ₫ | 13 Lò Đúc · Chưa đi · Độ hot 3 · 1,8 km · Yêu thích | ph-6 |
| Bún riêu Hàng Bạc | Quán ăn | 35.000–50.000 ₫ | 0,6 km · Chưa đi | ph-4 |
| Bún đậu Hàng Khay | Quán ăn | 40.000–80.000 ₫ | 0,9 km · Hứng thú | ph-2 |
| Bánh cuốn Thanh Vân | Quán ăn | 30.000–50.000 ₫ | Đang mở · Chưa đi | ph-3 |
| Ốc Đào | Quán ăn | 80.000–200.000 ₫ | Đã đóng · mở lúc 15:00 · Yêu thích · NO PHOTO (letter tile "Ố") | — |
| Cộng Cà Phê | Quán uống | 35.000–65.000 ₫ | Hứng thú · Yêu thích | ph-3 |
| Cà phê Giảng | Quán uống | 30.000–50.000 ₫ | Đã đi · Yêu thích | ph-2 |
| The Note Coffee | Quán uống | 40.000–70.000 ₫ | Chưa đi | ph-5 |
| Cafe Đinh | Quán uống | 25.000–45.000 ₫ | Chưa đi | ph-6 |
| Tranquil Books & Coffee | Quán uống | 45.000–75.000 ₫ | Hứng thú | ph-4 |
| Loading T Cafe | Quán uống | 40.000–60.000 ₫ | Đã đi · NO PHOTO (letter tile "L") | — |
| Phố đi bộ Hồ Gươm | Chỗ chơi | Miễn phí | 0,8 km · T6 19:00–24:00, T7–CN cả ngày · Yêu thích | ph-5 |
| Bản Cát Cát – Sa Pa | Du lịch | 150.000 ₫ (vé) → card caption "Từ 150.000 ₫" | Hứng thú · Yêu thích | ph-3 |

Câu chuyện (Bún chả Hương Liên): "Lần đầu ăn ở đây là trưa mưa tháng Bảy, cả nhóm chen nhau ở tầng hai. Chả nướng thơm than hoa, nước chấm hơi ngọt — lần sau nhớ gọi thêm nem cua bể." Ghi chú: "Gửi xe máy ở ngõ bên cạnh, 5.000 ₫."
Price formats: rows/cards "50.000–90.000 ₫", "Từ 50.000 ₫", "Miễn phí"; detail "50.000 ₫ – 90.000 ₫".

## 7. Artboard file list (the ONLY valid link targets)
Main.dc.html (Hệ thiết kế) · SoDoTrang.dc.html (Sơ đồ trang)
LandingDesktop.dc.html · LandingPhoneDark.dc.html · InAppGate.dc.html · DangNhap.dc.html
BatDau1DongY.dc.html · BatDau2DriveDark.dc.html · BatDau3Nhom.dc.html · HomeMoi.dc.html · CaiApp.dc.html
Home.dc.html · HomeDark.dc.html · InfoSheet.dc.html · NhomQuanUong.dc.html · TimKiem.dc.html · BoLoc.dc.html · YeuThichDark.dc.html
GanToiHoi.dc.html · GanToiDanhSach.dc.html · GanToiBanDoDark.dc.html · BocTham.dc.html · Vuot.dc.html
ChiTiet.dc.html · ChiTietDuoiDark.dc.html · ThemDiaDiem.dc.html · QuanLyNhom.dc.html
TaiKhoan.dc.html · QuyenRiengTu.dc.html · XoaTaiKhoanDark.dc.html · HomeDesktop.dc.html
HuongA.dc.html · HuongB.dc.html · HuongC.dc.html

## 8. Voice
Vietnamese, warm, short, second person "bạn". Sentence case. Full diacritics always. Copy from the spec wherever the spec gives copy — do not invent different wording for the same thing.
