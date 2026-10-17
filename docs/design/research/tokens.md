# Visual design system audit: WhereToGo `web/`

Scope: the current tokens, fonts, spacing, motion, how Ionic variables are mapped, inconsistencies between pages, accessibility, and font and precache cost. No repo files were modified (`git status` is clean). To measure real sizes I built a copy of `web/` in the scratchpad (`npm ci` + `vite build`). I also unpacked `@ionic/core@9.0.5` and the 4 fontsource packages there and checked them with fontTools.

## Headline findings

1. **Dark mode on the default-themed pages is not the designed palette.** `main.tsx:11` imports `@ionic/react/css/palettes/dark.system.css`. In dark mode that file sets `:root.ios { --ion-background-color:#000000; --ion-text-color:#ffffff; --ion-item-background:#000000; --ion-card-background:#1c1c1d }`. `:root.ios` (specificity 0,2,0) beats the app's `:root` (0,1,0) at `variables.css:67-73`. Ionic puts the `ios` class on `<html>` because `setupIonicReact({mode:'ios'})`. So Login, list, detail, form, settings and the manage pages render pure black and white with Ionic's neutral greys, not stone `#0c0a09/#fafaf9/#1c1917`. Non-themed modals also get `:root.ios ion-modal`: background `#1a1a1a`, toolbar `#262626`.
2. **There are 3 separate design systems.** Default (stone + bronze + Be Vietnam Pro / Playfair 600) is used on about 10 screens. Home (cream + blue + Be Vietnam Pro / Playfair 800) and Swipe (beige + orange + Plus Jakarta Sans / Fraunces) are one screen each. The shared `PlaceInfoSheet` changes font, radius and weight depending on which page opened it.
3. **4 font families are shipped:** 17 `@font-face` rules, 16 precached woff2 files, 298,036 B (≈291 KiB). That is about 12.6% of the 2,305 KiB precache.
4. **Real text-contrast failures exist,** despite the "≥ 4.5:1" claims at `themes.css:5` and `variables.css:5`:
   - the selected filter chip on Swipe in light mode is 2.24:1;
   - text over photos on the swipe card can drop to 1.4–3.3:1;
   - the accent chip over a photo is 1.2–3.3:1.
5. **All sizes are in px,** so iOS Dynamic Type is ignored, while Ionic components (which use rem) do scale. The minimum text size is 11px in 7 places.

---

## (a) Color tokens

### A1. Default theme — `web/src/theme/variables.css`

Used by: Login, `/search`, `/favorites`, `/nearby`, `/categories/:id` (all `PlaceListPage`), Detail, Form, Settings, Manage tags, Manage categories, and the AddVisit / TimeWheel / CategoryEditor sheets.

| Token | Light | Dark (declared, `:67-117`) | Dark actually rendered (iOS mode) |
|---|---|---|---|
| `--ion-font-family` (`:9`) | `'Be Vietnam Pro', system-ui, sans-serif` | same | same |
| `--ion-background-color` (`:11`) | `#fafaf9` | `#0c0a09` | **`#000000`** (Ionic `:root.ios`) |
| `--ion-text-color` (`:12`) | `#0c0a09` | `#fafaf9` | **`#ffffff`** |
| `--ion-card-background` (`:13`) | `#ffffff` | `#1c1917` | **`#1c1c1d`** |
| `--ion-item-background` (`:14`) | `#ffffff` | `#1c1917` | **`#000000`** |
| `--ion-border-color` (`:15`) | `#e7e5e4` | `#44403c` | `#44403c` |
| `--ion-toolbar-background` | not set → Ionic iOS fallback `#f7f7f7` | — | `--ion-background-color-step-50` = `#0d0d0d` |
| primary / contrast / shade / tint (`:17-22`, `:75-80`) | `#1c1917` / `#fff` / `#191614` / `#33302e` | `#fafaf9` / `#0c0a09` / `#dcdcdb` / `#fbfbfa` | as declared |
| secondary (`:24-29`) | `#44403c` | **not redefined**, stays `#44403c` (1.92:1 on dark; unused in code) | |
| tertiary, "vàng đồng" (`:31-36`, `:82-87`) | `#a16207` / `#fff` | `#eab308` / `#0c0a09` | |
| success | `#15803d` / `#fff` | `#4ade80` / `#0c0a09` | |
| danger | `#dc2626` / `#fff` | `#f87171` / `#0c0a09` | |
| medium | `#57534e` / `#fff` | `#a8a29e` / `#0c0a09` | |
| light | `#f5f5f4` / `#0c0a09` | `#292524` / `#fafaf9` | |
| warning, dark | not defined → Ionic defaults | (dark: `#ffce31`, `#f4f5f8`) | |

What uses which color:
- **primary (ink black / white):** IonButtons, IonFab (`PlaceListPage.tsx:295`), selected ToggleChip, category IonBadge (`PlaceDetailPage.tsx:185`), back buttons.
- **tertiary (bronze):** stars (`StarRatingView.tsx:37`, `StarRatingInput.tsx`), the "Hứng thú" badge (`StatusChip.tsx:17`), the "Mở Google Maps" button (`PlaceDetailPage.tsx:274`).
- **light:** OfflineBanner (`OfflineBanner.tsx:18`), PhotoGallery empty state (`PhotoGallery.tsx:42`), list-thumb placeholder (`PlaceCard.tsx:81`), DriveReauthBanner (`AuthProvider.tsx:186`), tag badges (`PlaceDetailPage.tsx:195`).

### A2. Home — `.wtg-theme-home`

Light at `themes.css:8-44`, dark at `:90-116`. Applied at `HomePage.tsx:155` and on the sheet.

| Token | Light | Dark |
|---|---|---|
| bg / surface / surface-2 | `#f5f2e9` / `#fbf9f4` / `#f5f2e9` | `#141311` / `#1e1c19` / `#26231f` |
| border | `#eae5d9` | `#3a3631` |
| text / text-muted | `#1c1917` / `#57534e` | `#f5f2e9` / `#a8a29e` |
| accent / on-accent | `#0071e3` / `#fff` | **not redefined** (`#0071e3` / `#fff`) |
| accent-text | `#0066cc` | `#4da3ff` |
| chip-accent-bg / border | `rgba(0,113,227,.10)` / `.25` | `rgba(77,163,255,.15)` / `.30` |
| chip-bg / border / text | `#ede8dc` / `#e2dcce` / `#44403c` | `#2a2723` / `#3a3631` / `#e7e5e4` |
| ring | `#fff` | `#1e1c19` |
| pill-bg / pill-text | `rgba(229,229,229,.9)` / `#404040` | `rgba(68,64,60,.9)` / `#e7e5e4` |
| dock-bg | `rgba(245,242,233,.95)` | `rgba(20,19,17,.95)` |
| sheet-bg / handle | `#fbf9f4` / `#a8a29e` | `#1e1c19` / `#78716c` |
| shadow-card | `0 1px 2px rgba(0,0,0,.05)` | `none` |
| success-bg / success-text / danger-text | `#dcfce7` / `#15803d` / `#b91c1c` | `rgba(22,101,52,.35)` / `#4ade80` / `#f87171` |
| Ionic primary (`:36-41`) | `#0071e3`, shade `#0063c8`, tint `#1a7fe6` | unchanged |
| Ionic medium (`:42-43`, `:114-115`) | `#57534e` | `#a8a29e` |

Hard-coded in home: the FAB glow `rgba(0,113,227,…)` at `home.css:403-409` does not follow the token.

### A3. Swipe — `.wtg-theme-swipe`

Light at `themes.css:46-87`, dark at `:118-147`. Applied at `SwipePage.tsx:104`.

| Token | Light | Dark |
|---|---|---|
| bg / surface / surface-2 | `#f2ece1` / `#ffffff` / `#f7f3ea` | `#141413` / `#1c1917` / `#201f1b` |
| border | `#e7e5e4` | `#292524` |
| text / text-muted | `#1c1917` / `#57534e` | `#faf7ee` / `#a8a29e` |
| accent / on-accent | `#e8a359` / `#0c0a09` | not redefined |
| accent-text | `#9a5b13` | `#f5ab61` |
| chip-accent-bg / border | `rgba(232,163,89,.18)` / `rgba(154,91,19,.3)` | `rgba(232,163,89,.2)` / `.3` |
| chip-bg / border / text | `#f5f5f4` / `#e7e5e4` / `#44403c` | `rgba(41,37,36,.8)` / `rgba(68,64,60,.6)` / `#d6d3d1` |
| pill-bg / pill-text | `rgba(255,255,255,.85)` / `#1c1917` | `rgba(36,34,30,.75)` / `#faf7ee` |
| sheet-bg | `#ffffff` | `#171614` |
| shadow-card | `0 16px 36px -14px rgba(28,25,23,.35)` | `0 16px 36px -10px rgba(0,0,0,.65)` |
| success / danger | `#dcfce7` / `#15803d` / `#b91c1c` | `#052e16` / `#34d399` / `#fb7185` |
| pass, pass-border | `#be123c`, `rgba(190,18,60,.3)` | `#fb7185`, `rgba(244,63,94,.3)` |
| star, star-border | `#0e7490`, `rgba(14,116,144,.3)` | `#22d3ee`, `rgba(6,182,212,.3)` |
| like gradient | `#e8a359` → `#f58853` | same |
| Ionic primary (`:79-84`) | `#e8a359`, contrast `#0c0a09`, shade `#cc8f4e`, tint `#eaac6a` | unchanged |

Hard-coded in `swipe.css`:
- photo gradient at `:169-175` (`rgba(20,20,19,.02)` 0% → `.2` 50% → `.85` 80% → `#141413` 98%);
- stamp background `rgba(12,10,9,.85)` at `:185`; stamps `#34d399`/`#6ee7b7` at `:195-196` and `#f43f5e`/`#fb7185` at `:202-203`;
- card name `#faf7ee` (`:233`), price `#e8a359` (`:250`), address `#d6d3d1` (`:254`), like icon `#0c0a09` (`:435`).

### A4. Sheet

The sheet has no palette of its own. It inherits whatever `wtg-theme-${theme}` class it is given (`PlaceInfoSheet.tsx:61`) and uses `--wtg-sheet-bg` and `--wtg-handle` (`placeInfoSheet.css:4,16`).

### A5. Other color sources

| Source | Values |
|---|---|
| `public/logo.svg` | bg `#1C1917`, pin `#CA8A04` (amber-600; matches no app token), dot `#FAFAF9` |
| Manifest (`vite.config.ts:69-70`) | `background_color` / `theme_color` `#FAFAF9`, one value only |
| `index.html:6-7` | theme-color `#FAFAF9` light / `#0C0A09` dark. Neither matches Home (`#F5F2E9` / `#141311`) or the real default dark (`#000`). |
| `public/privacy.html:8-24` | a hand copy of the default palette (`--accent` `#a16207` / `#eab308`) |

---

## (b) Fonts and type scale

### Families

| Family | Weights bundled | Where it is used |
|---|---|---|
| **Be Vietnam Pro** (static) | 400 / 500 / 600; latin + vietnamese (`fonts.css:2-7`) | Default body (`variables.css:9`); Home body (`themes.css:33`); `privacy.html:33` names it but never loads it, so it renders in system-ui |
| **Playfair Display** (static) | 600 / 800 (`fonts.css:10-13`) | `.wtg-display` / `.wtg-heading` (`global.css:12-26`); large titles (`global.css:43-46`); Home display (`themes.css:34`) for the wordmark at 800 (`home.css:8-11`); sheet name at 800 from Home (`placeInfoSheet.css:129-131`); `privacy.html:44` names it but does not load it, so it falls back to Times New Roman |
| **Plus Jakarta Sans Variable** | wght 200–800 (`fonts.css:19`) | Swipe body (`themes.css:70`): filter chips, buttons, and the sheet when opened from Swipe |
| **Fraunces Variable** | wght 100–900 (`fonts.css:18`) | Swipe display (`themes.css:71`): title `swipe.css:28`, card name `:229`, teaser name `:327`; sheet name at 700 (`placeInfoSheet.css:133-135`) |

Faces that are requested but not bundled:
- **Weight 700:** IonBadge uses `font-weight:bold` (StatusChip, detail badges), and OpeningHoursView uses `<strong>` (`OpeningHoursView.tsx:55,61`). Be Vietnam Pro falls back to 600, possibly with synthetic bold.
- **Italic:** the teaser line is italic (`swipe.css:337`). No italic face is bundled, so the browser fakes an oblique.

Vietnamese coverage, checked against every precomposed vowel, đ/Đ and ₫:
- Be Vietnam Pro, Fraunces and Plus Jakarta Sans: complete.
- Playfair Display: complete except **₫ (U+20AB)**, which is missing from all its subsets. This is harmless today because prices render in the body font (`formatVnd` in `shared/money/vnd.ts:13` appends " ₫").

### Type scale

There are 12 sizes and 8 line-heights (1.2, 1.25, 1.3, 1.35, 1.375, 1.4, 1.5, 1.6). There is no modular scale and no rem.

| Size | Where |
|---|---|
| 11px | chip `themes.css:207` (500, lh 1.4); cluster pill `home.css:204`; swipe subtitle `swipe.css:44` (uppercase, 0.08em, lh 1.3); remaining count `:74`; teaser price `:319`; teaser "THÔNG TIN" `:349`; open badge `placeInfoSheet.css:171` |
| 12px | group title `global.css:34` (uppercase, 0.08em); home labels `home.css:72,108,237,311`; stamp `swipe.css:186` (800, 0.06em); card price/address `:245`; teaser line `:336`; sheet label/price `placeInfoSheet.css:42,139`; story title `:226` |
| 13px | `.wtg-caption` `global.css:29` (lh 1.4), which default pages also use for body text such as story and notes (`PlaceDetailPage.tsx:228,235`); "Xem" button `home.css:328`; sheet address `placeInfoSheet.css:158`; IonBadge; IonSegment |
| 14px | sheet buttons `placeInfoSheet.css:205`; story text `:235` (lh 1.6); IonChip |
| 15px | home prompt `home.css:92` (lh 1.375) |
| 16px | body `global.css:8` (lh 1.5); daily name `home.css:261`; teaser name `swipe.css:328` |
| 17px | PlaceCard name, inline (`PlaceCard.tsx:92-93`); iOS IonTitle; iOS back button |
| 18px | swipe title `swipe.css:29` |
| 20px | `.wtg-heading` `global.css:23`; home wordmark `home.css:10` (−0.04em); sheet name `placeInfoSheet.css:124` |
| 22px | swipe card name `swipe.css:230` (lh 1.25) |
| 28px | `.wtg-display` `global.css:15` (Login, Detail h1) |
| 34px | iOS large title, only on `PlaceListPage.tsx:239-241` |

---

## (c) Radii, spacing, shadows, borders, motion

**Radii** (10 distinct values):

| Radius | Where |
|---|---|
| 4 | daily badge (`home.css:248`) |
| 8 | photo buttons (`PhotoGallery.tsx:90,106`); IonSegment |
| 10 | IonBadge; IonSearchbar |
| 12 | list thumb (`global.css:66`), icon grid (`CategoryEditorForm.tsx:218`), stamp (`swipe.css:184`) |
| 14 | IonButton iOS default |
| 16 | `.wtg-card` (`global.css:51`), teaser (`swipe.css:279`), sheet photo, story (`placeInfoSheet.css:89,219`), gallery (`PhotoGallery.tsx:41,69`), Drive banner, privacy card; also IonChip |
| 22 | sheet buttons (`placeInfoSheet.css:200`) |
| 24 | home card (`home.css:49`), Home sheet (`placeInfoSheet.css:5`) |
| 28 | swipe card (`swipe.css:91`) |
| 36 | Swipe sheet (`placeInfoSheet.css:12`) |
| 50% / 999px | pills, chips, FABs, avatars, action buttons |

**Spacing values in use:** 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 48, 52, 96px. 14px is off the 4/8 grid (`home.css:31,39`, `placeInfoSheet.css:82,218`).
- Page padding is applied 4 different ways: `.wtg-page` on a wrapper div, `.ion-padding`, `.wtg-home-list` (`0 16px 24px`), and `.wtg-page` set directly on `IonContent`.
- **That last way silently does nothing.** `ion-content` has `:host{padding:0 !important}`, and an `!important` shadow rule beats normal page CSS. Affected: `AddVisitSheet.tsx:108`, `ManageTagsPage.tsx:109`, `ManageCategoriesPage.tsx:105`.
- Settings puts `IonList inset` inside `.wtg-page`, so the list is inset twice relative to the `.wtg-group-title` above it (`SettingsPage.tsx:79-84`).

**Shadows:**
- The global rule says no shadows (`global.css:2-4`; `.wtg-card` at `:52`).
- Home card: `0 1px 2px` light, none in dark.
- Swipe card: heavy shadow in both modes.
- Home FAB: breathing blue glow (`home.css:399-415`).
- Ionic iOS IonFab on the list page: `0 4px 16px rgba(0,0,0,.12)`.
- Avatar ring: `0 0 0 1px var(--wtg-border)` (`themes.css:194`).

**Borders:** everything is 1px solid on a token. 2px is used for the photo ring (`home.css:124,291`), stamps (`swipe.css:183`) and the selected icon (`CategoryEditorForm.tsx:225`). The default and swipe light themes share `#e7e5e4`; Home uses `#eae5d9`.

**Motion:**

| Motion | Where |
|---|---|
| Press scale 0.98, 200ms ease | `home.css:54-58` |
| Press scale 0.9, 150ms | `swipe.css:392-396` |
| Cascade: 0.55s `cubic-bezier(.16,1,.3,1)`, fill `backwards`, delay 0.05s + i×0.08s | `home.css:395-397`, `HomeCardLayout.tsx:5-10` |
| FAB breathing: 3s ease-in-out, infinite | `home.css:399-415` |
| Card stack: 300ms ease | `swipe.css:94-96` |
| Fly-out: 450ms / 400ms ease-out | `swipe.css:126-128`, `swipeMotion.ts:10` |
| Snap-back: 350ms `cubic-bezier(.175,.885,.32,1.275)` | `swipeMotion.ts:14` |

No motion tokens exist; every value is a literal.

**Reduced motion:**
- Handled in `home.css:417-422` (cascade, glow) and `swipe.css:446-451` (card and action transitions).
- Ionic's `animated` flag is set once at boot (`main.tsx:25`), so it does not react to later changes.
- `usePrefersReducedMotion` also exists (`shared/hooks/usePrefersReducedMotion.ts`).
- The `.wtg-home-card:active` transition is not disabled under reduced motion (a minor gap).

---

## (d) How Ionic CSS variables are mapped

**Import order** (`main.tsx:4-16`): Ionic core → `dark.system.css` → `fonts.css` → `variables.css` → `global.css` → `themes.css`.

**`variables.css` sets:** font family, background, text, card, item, border, plus the full `--ion-color-{primary,secondary,tertiary,success,danger,medium,light}` sets (base, rgb, contrast, contrast-rgb, shade, tint).

**It never sets:** `--ion-text-color-rgb`, `--ion-background-color-rgb`, the toolbar or tab-bar variables, the step colors, placeholder, overlay or backdrop. As a result:
- Toolbars fall back to Ionic's iOS grey `#f7f7f7` instead of the stone `#fafaf9`.
- IonChip and other components compute tints from the default `0,0,0` (light) or Ionic's `255,255,255` (dark).

**In dark mode, `:root.ios` overrides background, text, item, card and the step colors** (finding 1).

**`themes.css:150-170` (P37)** sets the following on the theme class:
- `font-family` and `--ion-font-family`;
- `--ion-background-color`, `--ion-text-color`, `--ion-toolbar-background`, `--ion-toolbar-color`;
- `--ion-color-primary` (+5 variants) and `--ion-color-medium` (+rgb only);
- `ion-content --background`, and `ion-toolbar --background` with `--border-width:0`.

Because these are declared on the page element itself, they beat the inherited `:root.ios` values, so Home and Swipe render as designed in dark mode. They do not map item, card or border colors, `--ion-text-color-rgb`, or tertiary/success/danger, so stars stay bronze inside Home and Swipe.

On the themed sheet, `:root.ios ion-modal` (0,2,1) still overrides the theme class (0,1,0) for `--ion-background-color` and `--ion-toolbar-background` in dark mode. This is mostly masked by the explicit `--background: var(--wtg-sheet-bg)` (`placeInfoSheet.css:4,20`).

**Other overrides:**
- `global.css:43-46`: `ion-title.title-large::part(native)` uses Playfair 600 (Ionic's default is 34px/700).
- `global.css:81-84`: `ion-datetime` is full width inside modals.
- `@supports(-webkit-touch-callout:none) html{font:var(--ion-dynamic-font)}` (Ionic `typography.css`) turns on Dynamic Type on iOS, but `body{font-size:16px}` (`global.css:8`) and all-px component sizes cancel it for app text.

---

## (e) Inconsistencies between pages

1. **Accent / primary action color differs everywhere:**
   - default: ink-black/white buttons and IonFab, with bronze for Maps and stars;
   - Home: blue `#0071e3` FAB with glow and "Xem" pill;
   - Swipe: orange `#e8a359` and an orange→coral "like" gradient;
   - logo: amber `#CA8A04`.
   The "add place" FAB comes in two forms: a centered 56px blue dock FAB on Home, and a corner charcoal/white IonFab on the list page.
2. **Neutral families:** stone (default), warm cream `#f5f2e9/#fbf9f4` (Home), beige plus stone mix (Swipe), and in dark mode Ionic's neutral greys `#000/#0d0d0d/#1a1a1a/#1c1c1d` next to stone `#292524/#44403c`. Text color is `#0c0a09`, `#1c1917`, `#f5f2e9`, `#faf7ee` or `#ffffff` depending on the page.
3. **Semantic colors:** 3 greens (`#15803d`, `#4ade80`, `#34d399`), 4 reds (`#dc2626`, `#b91c1c`, `#f87171`, `#fb7185`), plus rose `#be123c` and teal `#0e7490` used only on Swipe.
4. **Fonts:** body is Be Vietnam Pro (default, Home) or Plus Jakarta Sans (Swipe). Display is Playfair 600 (default), Playfair 800 (Home), or Fraunces 600/700 (Swipe). The same sheet renders as Be Vietnam Pro + Playfair 800 or Plus Jakarta Sans + Fraunces 700.
5. **Headers come in 3 styles:**
   - Home: no border, left-aligned Playfair 800 wordmark, heart and avatar on the right.
   - Swipe: no border, 44px circular pill back button, centered 2-line Fraunces title with an accent dot and an 11px uppercase subtitle, avatar on the right.
   - Default: iOS hairline toolbar on `#f7f7f7`/`#0d0d0d`, plain 32px chevron, centered 17px Be Vietnam Pro title, a Playfair large title on the list page only, and a "Cài đặt" text back button on the manage pages.
   Login has no header. Avatar and offline indicator appear only on Home and Swipe.
6. **Footers come in 3 styles:** the Home dock (custom `div`, 95% opacity, no toolbar); Detail's `IonFooter > IonToolbar` with two block buttons (bronze plus black); and no footer on Swipe.
7. **Cards come in 4 styles:**

   | Card | Radius | Padding | Shadow / extras |
   |---|---|---|---|
   | `.wtg-card` (list) | 16 | 12 | none; 88px thumbnail, radius 12 |
   | `.wtg-home-card` | 24 | 16 | subtle shadow; press scale |
   | `.wtg-swipe-card` | 28 | — | heavy shadow |
   | `.wtg-swipe-teaser` | 16 | 12 | accent top line |

   Sheet radius is 24 or 36.
8. **Chips:** `.wtg-chip` is 11px, `2px 8px` (`themes.css:198-218`). ToggleChip is an IonChip at 14px, 44px tall. Detail uses IonBadge at 13px bold. Category and tag labels therefore look different in the sheet, on Detail and in the filter bars.
9. **Icon meaning:**
   - Heart: Home header heart opens Yêu thích (`HomeHeader.tsx:18-21`), but on Swipe the heart means Hứng thú +1 (`SwipeActions.tsx:79`).
   - Star: Swipe star = Yêu thích (teal), Detail star = Yêu thích (ink), and StarRating stars = rating (bronze).
10. **Muted-text token:** inline `var(--ion-color-medium)` (PlaceCard, EmptyState, PhotoGallery) versus `--wtg-text-muted`. Shared components mix the two systems:
    - OfflineBanner uses `--ion-*` and renders a neutral `#f5f5f4` bar inside the beige Swipe page (`SwipePage.tsx:127`);
    - UserAvatar and OfflineIndicator use `--wtg-*` vars that are undefined outside the themed pages (`UserAvatar.tsx:47-48`, `OfflineIndicator.tsx:16`).
11. **Off-site pages:** `privacy.html` names Be Vietnam Pro and Playfair but loads neither. Manifest and status-bar colors match only the default light theme.

---

## (f) Accessibility visible in the tokens (WCAG 2.x ratios, computed)

### Main pairs

| Theme | Text / bg | Muted | Accent pairs |
|---|---|---|---|
| Default L | 18.92 (on card 19.76) | 7.30 / 7.63 | tertiary on bg 4.71; white on tertiary 4.92; white on success 5.02; danger on bg 4.62; white on danger 4.83 |
| Default D (declared) | 18.92 / 16.74 | 7.83 / 6.93 | tertiary 10.30; danger 7.14 |
| Default D (rendered) | `#fff` on `#000` 21.0 | 8.33 | — |
| Home L | 15.62 / 16.62 | 6.82 / 7.25 | white on `#0071e3` 4.70; accent-text 5.29; accent-text on chip-accent 4.61; success on success-bg 4.57 |
| Home D | 16.59 / 15.19 | 7.36 / 6.74 | white on `#0071e3` 4.70; `#4da3ff` 6.47 (on chip 5.11) |
| Swipe L | 14.87 / 17.49 | 6.49 / 7.63 | `#0c0a09` on `#e8a359` 9.23; accent-text 5.41 (on chip 4.75) |
| Swipe D | 17.21 / 16.33 | 7.31 / 6.93 | `#f5ab61` 9.06 |
| Card overlay at 80–98% of the gradient | name 11.1–17.2 | price 5.6–8.6 | address 8.0–12.4 |

### Failures and risks

- **Swipe light, selected filter chip:** IonChip `color=primary` renders text in `--ion-color-primary-shade` `#cc8f4e` on 8% orange over `#f2ece1` = **2.24:1** at 14px. Affects `CategoryFilterBar` and `TagFilterBar` on Swipe (`ToggleChip.tsx:22-23`). The unselected chip outline is 2.21:1.
- **Swipe card overlay.** The chips and the first line of a 2-line name sit at 49–69% of the card height, where the gradient alpha is only 0.19–0.60. Over a bright photo:
  - name `#faf7ee`: 1.43–4.56:1;
  - accent chip text: 1.3–3.3 (light) and 1.1–2.1 (dark).
  The gradient is fixed (`swipe.css:166-176`) and does not adapt to content height.
- **Dark-mode Vietnamese contrast is fine, but borders nearly disappear.** Non-text contrast (target 3:1):
  - card or outline-button borders: 1.12–1.26 (light), 1.15–1.70 (dark);
  - the "Xem đầy đủ" outline button, identified only by its border: 1.19 (Home L), 1.42 (Home D);
  - Swipe like button against its background: 1.82.
  These are strict 1.4.11 failures only where the border is the only cue.
- **Text under 12px:** the 7 × 11px sites listed in (b). PLAN.md 6.3 set a 12px floor; P36 lowered it to 11 (`PLAN-UI-1.md:77`). The risk is highest for uppercase Vietnamese with stacked marks at lh 1.3: "VUỐT ĐỂ KHÁM PHÁ" (`swipe.css:44-49`), "THÔNG TIN" (`:349-351`). The line-clamped displays at lh 1.2–1.25 with `overflow:hidden` (`swipe.css:226-236`, `home.css:88-98`, `placeInfoSheet.css:121-127`) may clip the top of stacked diacritics such as Ấ or Ổ; this needs a visual check.
- **Tap targets under 44px** (all are Ionic iOS defaults; every custom control is 44 or 56):
  - IonBackButton `--min-height:32px` at `PlaceListPage.tsx:233`, `PlaceDetailPage.tsx:95,112,140`, `SettingsPage.tsx:73`, `ManageTagsPage.tsx:104`, `ManageCategoriesPage.tsx:89` (Swipe fixes this to 44 at `swipe.css:12-13`);
  - IonSegmentButton `min-height:28px` (`PlaceListPage.tsx:262-273`);
  - IonSearchbar input 36px (`:255`).
- **Font sizing is px-only,** so iOS Dynamic Type has no effect on app text while Ionic chips, buttons and badges (rem/clamp) do scale. The result is mixed sizes when a user raises system text size. See https://ionicframework.com/docs/layout/dynamic-font-scaling.
- **Logo:** dot on pin is 2.81:1, but logos are exempt.

References: https://www.w3.org/TR/WCAG22/#contrast-minimum, https://www.w3.org/TR/WCAG22/#non-text-contrast, https://www.w3.org/TR/WCAG22/#target-size-minimum, https://developer.apple.com/design/human-interface-guidelines/accessibility, https://ionicframework.com/docs/theming/dark-mode

---

## (g) Font bundle cost and precache

Real build of `web/` at 0.2.0 (copied into the scratchpad, `vite build`): Workbox reports 38 precache entries, **2,305.21 KiB**. `check:size` passes.

**Per-file limit.** The largest file is `ionic-*.js` at 1,236,867 B (59% of the 2 MiB per-file limit), then react 240,897, supabase 223,381, forms 123,588 and index 109,422. Fonts are each 36.6 KB or less, so the per-file limit is irrelevant for fonts. The limit matters for JS (the ionic chunk, or a future map library), and `check-precache-size.mjs` only checks per file (`:29-35`). **There is no total-size budget.**

**Precached fonts** (17 `@font-face`, 16 woff2 files, plus Plus Jakarta Sans cyrillic-ext at 1,716 B inlined as a data URI): **298,036 B, about 12.6% of the precache.**

| Family | Files | Bytes |
|---|---|---|
| Be Vietnam Pro | 3 weights × latin + vietnamese | 100,972 |
| Fraunces Variable | latin 36,620 + latin-ext 33,584 + vietnamese 11,572 | 81,776 |
| Playfair Display | 2 weights × 2 subsets | 57,860 |
| Plus Jakarta Sans Variable | latin 27,348 + latin-ext 21,728 + vietnamese 8,352 (+1,716 inlined) | 57,428 |

Notes:
- **10 `.woff` fallback files (141,728 B)** are emitted to `dist/` but not precached, because `globPatterns` only includes woff2 (`vite.config.ts:83`). They are dead weight for modern browsers.
- **Be Vietnam Pro and Playfair are imported per subset.** Those fontsource files have **no `unicode-range`**, so their 10 faces always load together (7 of 17 rules in the built CSS have `unicode-range`). It works only because browsers fall back glyph by glyph (https://www.w3.org/TR/css-fonts-4/#composite-fonts). The variable families include latin-ext, which really is fetched for đ/ơ/ư/ă because a later-defined overlapping range wins.
- **Everything is precached when the service worker installs,** including Fraunces and Plus Jakarta Sans, which only Swipe uses.
- Be Vietnam Pro has no variable fontsource package (`@fontsource-variable/be-vietnam-pro` returns 404). Each extra static weight costs about 34 KB (700: latin 22,152 + vietnamese 12,468).

---

## Recommendation: keep or drop for one unified system

**Keep:**
- **Be Vietnam Pro as the only UI/body font.** It is designed for Vietnamese, has complete diacritics and ₫ (verified), is already bundled at 400/500/600 for about 101 KB, and is already the default and Home body font. Add 700 (+34 KB) only if bold is needed; otherwise set IonBadge and `<strong>` to 600.
- **One display serif:**
  - *Fraunces Variable* (82 KB) covers all Vietnamese including ₫, has any weight from one file set, and has lower stroke contrast, so it holds up better at 16–22px and in dark mode.
  - *Playfair Display* (58 KB, 2 static weights) is the current wordmark, but it lacks ₫ and its thin strokes are fragile at small sizes.
  - I lean towards Fraunces if the design uses several heading weights; Playfair is fine if it stays at one or two.
- **The `--wtg-*` semantic token names** from `themes.css` (bg, surface, surface-2, border, text, text-muted, accent, on-accent, accent-text, chip-*, success-*, danger-text, shadow-card, font-body, font-display). Promote them to a single `:root` light/dark theme and map every Ionic variable from them once, including toolbar, item, card, `-rgb` and tertiary/success/danger.
- **The stone neutral ramp** (`#fafaf9 … #0c0a09`, shared by all three themes), with the Home cream `#f5f2e9 / #fbf9f4` as the light page and surface colors if a warmer look is wanted.
- **One warm accent family** that matches the logo pin `#CA8A04`:
  - `#e8a359` (with `#0c0a09` on top, 9.2:1) as the fill;
  - `#9a5b13` (light, 5.4:1) / `#f5ab61` (dark, 9.1:1) for accent text.
- **One success/danger pair:** `#15803d`/`#4ade80` and `#b91c1c`/`#f87171`.
- **The rules and patterns:** the 44px `.wtg-tap-target`, 1px borders, the reduced-motion handling, and the cascade and press motions (turned into duration and easing tokens).

**Drop:**
- Plus Jakarta Sans (−57 KB) and whichever serif is not chosen (−58 or −82 KB). Fonts would fall from 298 KB to about 159–183 KB.
- The per-page theme classes and the `theme` prop on `PlaceInfoSheet`.
- The blue accent `#0071e3` and the bronze/ink split.
- The `dark.system.css` dependency, or override it with `:root.ios`-level selectors.
- 11px text (set the floor at 12–13px, especially for uppercase Vietnamese).
- The 10-value radius scale: reduce it to about 12 / 16 / 24 plus full.
- The `.woff` fallbacks, by using custom `@font-face` with woff2 only and `unicode-range`.