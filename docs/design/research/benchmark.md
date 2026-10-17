# WhereToGo benchmark: page inventory, onboarding and landing page (web research)

Research method and limits: WebFetch failed with DNS errors on every domain. Direct curl was refused by the egress proxy (403, for example on en.mapstr.com). Mobbin needs a paid plan. So everything below comes from WebSearch result summaries. Tab names in some apps (especially Beli) are from third-party write-ups and are not fully confirmed.

## 1. Per-app screens and first-run steps

**Mapstr**
- Screens: personal map with colour-coded tags, place pages with notes, rating, photos and "To try / Tried", following other people's maps, merging friends' maps into yours (paid), and a web app.
- Import: Google Maps, CSV or KML. The Google Maps route goes through Takeout files (KML/KMZ/JSON/CSV) opened with "copy to Mapstr".
- Maps are public by default. A shared link opens in any browser without the app or an account. Private maps need an access request.
- Collaborative maps: only the admin can edit or delete places, the free plan allows 20 people, and collaboration works on mobile only.
- Paid tier: free accounts stop at 300 addresses.
- Onboarding: a guided tutorial, a request to connect contacts, then a soft paywall after profile setup.
- Sources: https://en.mapstr.com/faq, https://en.mapstr.com/fonctionnalites/importer-des-adresses, https://en.mapstr.com/fonctionnalites/faire-une-carte-collaborative, https://github.com/plykhvar-glitch/mapstr-paywall-rebuild, https://apps.apple.com/us/app/mapstr-save-follow-places/id917288465

**Beli**
- Screens: feed of friends' visits, your lists ("Been" and "Want to try"), search for places and members, map/list toggle, leaderboard (now reached from the profile), and a friend score on each place.
- Ranking: three reactions (liked / fine / didn't like), then head-to-head comparisons, giving a 0–10 score. Personal recommendations start after about 15 ranked places.
- Onboarding: phone and contacts, then a forced "invite at least 4 friends" step. A 2024 design critique attacked this step and proposed "Skip for now". New users then rank places they have already been to. Beli has used invite-only access and a waitlist.
- Users report importing Google Maps want-to-try lists.
- Sources: https://ixd.prattsi.org/2024/09/design-critique-beli-app/, https://d3.harvard.edu/platform-digit/?p=12200, https://en.wikipedia.org/wiki/Beli_(app), https://medium.com/@jyl99/case-study-beli-4cdf776a5e5d

**Corner (corner.inc)**
- Screens: personal pin map, lists (now with a "checked off" count), following friends, and taste-based recommendations.
- The main hook is sharing a TikTok or Instagram link to the app, which becomes a pin.
- Import sits in the "+" menu: paste notes or text (10,000 characters) or a Google Maps list link, then wait for a "we'll ping you when it's done" notification. There is no preview before the import runs.
- It notifies you when you and a friend want the same place.
- Sources: https://apps.apple.com/us/app/corner-curate-share-places/id1668282277, https://coolcuration.com/mobbin-new-september-2026, https://www.tiktok.com/@thecornerapp

**Google Maps (Saved / You tab)**
- Built-in lists: Favorites, Want to go (with a visited progress bar), Starred, Travel plans, Labeled.
- Custom lists can have an emoji icon. Each saved place can carry a note of up to 4,000 characters.
- Sharing: a view-only link, or "Invite collaborators" to give edit access. Followers see later edits to the list.
- Since 2025 the place share sheet offers "share as a collaborative list".
- Sources: https://support.google.com/maps/answer/7280933, https://9to5google.com/2023/09/06/google-maps-saved-places-icon-emoji/, https://www.androidauthority.com/google-maps-share-sheet-update-3571897, https://www.androidcentral.com/how-use-saved-lists-google-maps

**Wanderlog**
- Screens: per trip Overview / Itinerary / Explore / Budget, a map and itinerary in one view, guides, real-time collaboration, and import of reservations from email.
- Onboarding: a long personalisation quiz, then a Pro paywall. Creating a trip means picking a destination, then dates, then inviting tripmates.
- Homepage: "One app for all your travel planning needs", a "Your itinerary and your map in one view" section, and a testimonials section ("What travelers are raving about").
- Sources: https://wanderlog.com/, https://screensdesign.com/apps/wanderlog-travel-planner/, https://www.redbrick.me/wanderlog-a-travel-tool-i-cant-live-without/

**Foursquare**
- The City Guide app closed on 15 Dec 2024 (web on 28 Apr 2025). Swarm is now a check-in lifelog, and data export is under Settings → Privacy.
- The lesson here is that a data export option builds trust when an app may shut down.
- Source: https://foursquare.com/city-guide-sunset/

**Airbnb Wishlists**
- Anyone with the link can view a wishlist. Logged-in collaborators can add notes, vote up or down, and change dates and guest count.
- Removing a collaborator still leaves them link access. The only way to cancel a link is to delete the list.
- Source: https://www.airbnb.com/help/article/1236

**Pinterest**
- Onboarding: country (with a "not shown on profile" note), then pick at least 3 interests, then the home feed.
- Each added question raises drop-off.
- Boards can be secret with up to 20 collaborators.
- Sources: https://appcues.com/blog/casey-winters-pinterest-user-onboarding, https://lazyweb.com/canvas/flows/pinterest/onboarding

**Thatch**
- Turns a Google Takeout zip into lists, keeping notes. Starred places are skipped.
- Source: https://thatch.notion.site/Import-Your-Saved-Places-from-Google-Maps-d03fa4773960460d8bb7c84cbe4c67cb

**Vietnamese apps**
- **Foody:** a "List" feature for saving places into personal collections that can be shared with friends (https://www.foody.vn/tro-giup).
- **Lozi:** pin dishes and places into your own collections (https://cellphones.com.vn/sforum/ung-dung-tim-kiem-quan-an-gan-day).
- **Riviu:** sections for Posts, Collections ("Bộ sưu tập"), Photos/Video and Places (https://riviu.vn/).
- **LunchFoods – Ăn Gì?:** a "Chọn giúp tôi" (pick for me) button, group voting, sharing by link or QR, and a restaurant notebook with photos and notes (https://apps.apple.com/us/app/lunchfoods-%C4%83n-g%C3%AC/id6449702815).
- **SpotShare ("Quán ngon, bạn bè bảo"):** the closest local match. Take a photo, tag the place, rate it, shared only with chosen groups. Suggests 5 nearby places ranked by friends, has a widget, and is launching in waves (https://spotshare.io.vn/).
- **Lemon8:** a For You feed with location tags on posts; I found no place-page feature.

## 2. Common page inventory compared with WhereToGo

Current state: `web/src/app/App.tsx:56-88` defines `/login` as the only public route, and every unknown hash silently redirects to `/` and then `/home` (`App.tsx:88`). There is no landing page, onboarding, 404/offline page, sharing, import, account/privacy page or map yet. The map is only planned (`docs/UI-REDESIGN.md:72`, `:124` U12).

| Page | Seen in | WhereToGo now | Needed for public launch |
|---|---|---|---|
| Landing / marketing | all | none | **Yes.** Google brand verification says a home page that is only a login page does not qualify. |
| Privacy policy, Terms | all | none | **Yes.** Must be on the same domain as the home page and linked from the OAuth consent screen. |
| Sign-in | all | `/login` | Keep. Add an explanation of the Drive permission before the Google consent screen. |
| Onboarding (1–3 steps) | Pinterest, Beli, Wanderlog, Mapstr | none | Yes, short. |
| Home / feed | all | `/home` | Exists. |
| Collections (lists/boards) | all | `/categories/:id` (temporary) | Needs a real "all collections" index. |
| Map view | Mapstr, Corner, Beli, Google, Wanderlog | none | Yes (U12). |
| Place detail | all | `/places/:id` | Exists. |
| Add / import | Mapstr, Corner, Thatch, Beli | `/places/new`, paste Maps link | Add Takeout import. |
| Search | all | `/search` | Exists. |
| Profile / account | all | Settings only | Add account details, data export, account deletion. |
| Public shared place/list page | Mapstr, Google, Airbnb, Foody | none | High value. |
| Collaborators | Google, Airbnb, Mapstr, Pinterest | none | Later. |
| Notifications | Corner, Beli | none | Skip. Web push on iOS only works for installed web apps, and the value is low here. |
| Help / FAQ, install guide | most | none | Yes (small). |
| 404 / offline | — | silent redirect | Yes (small). |

## 3. Landing page structure

General rules from the sources:
- The hero should hook, not explain: one headline, one subhead, one visual and **one** primary button (https://theswiftk.it.com/blog/app-landing-page-sections-guide).
- Show the core screen, never the login screen (https://screenhance.com/blog/saas-landing-page-screenshots).
- A small product needs one focused page, not 10 sub-pages (https://www.gamedeveloper.com/business/indie-game-marketing-guide-part-1-how-to-create-landing-pages).

Recommended section order for `#/` when signed out:

1. **Header:** logo, "Đăng nhập" link, theme toggle.
2. **Hero:** for example "Lưu mọi quán muốn đi. Hết cảnh 'hôm nay đi đâu?'".
   - Subhead: dán link Google Maps, thêm ảnh, giá, giờ mở cửa, rồi vuốt để chọn.
   - Primary button: "Bắt đầu với Google". Secondary text link: "Cài lên màn hình chính".
   - Phone mockup of Home and Swipe in the new unified style, with light and dark variants.
3. **How it works in 3 steps:** Dán link Maps → Thêm ảnh và ghi chú → Vuốt thẻ chọn chỗ đi.
4. **Feature grid (4–6 cards):** auto-fill from a Maps link; own rating and VND price range; opening hours with an "open now" state; visit log; nhóm and nhãn; swipe and favourites; Gần tôi map.
5. **Privacy block (the key differentiator).** Suggested headline: "Ảnh của bạn nằm trong Google Drive của chính bạn."
   - Explain `drive.file`. Google officially describes it as access to "only the specific Google Drive files you use with this app" and rates it "Recommended Non-sensitive" (https://developers.google.com/workspace/drive/api/guides/api-specific-auth).
   - Access can be revoked at any time in the Google account settings.
   - No ads, and data can be exported as JSON.
   - Model the wording on draw.io's line "your data is stored only in Google Drive, so no additional third-party to trust" (https://www.drawio.com/blog/data-protection).
6. **Install as an app:**
   - iOS: Safari → Chia sẻ → Thêm vào MH chính. In iOS 26 every site added to the Home Screen opens as a web app by default, with an "Open as Web App" toggle (https://heise.de/-10749652).
   - Safari never fires `beforeinstallprompt`. Detect iOS, check `navigator.standalone`, and show manual steps with a dismissal you can persist (https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide).
   - Android Chrome: stash the `beforeinstallprompt` event and call `prompt()` from a tap (https://web.dev/customize-install).
7. **FAQ:** Miễn phí? Cần App Store không? Dữ liệu ở đâu? Offline được không? Xoá tài khoản? Chia sẻ với bạn bè được không?
8. **Social proof without fake testimonials:** "mã nguồn mở / làm bởi một dev độc lập", plus real counts once they exist.
9. **Final button** repeated from the hero, then a footer linking Privacy, Terms, GitHub and contact.

## 4. Features public users would expect but WhereToGo lacks

- **Share one place by link.** Mapstr links open "in any browser, no app required" and Google lists have view-only links.
  - Catch: photos uploaded under `drive.file` are private to the owner. A public page would need the server to proxy thumbnails, or the app to set "anyone with link" permission on the files it created.
- **Share a nhóm as a public list page:** Foody, Google, Airbnb and Pinterest all do this.
- **Import from Google Maps.** Mapstr, Thatch, Beli and Corner all offer it so new users don't start with an empty map.
  - Takeout "Saved" gives one CSV per list with the columns Title, Note, URL, Comment (older exports: Tags) and **no coordinates**. Each URL must be resolved, which the existing server Maps resolver could do in batch.
  - Map each CSV to one nhóm.
  - Sources: https://exportmymap.com/blog/google-takeout-saved-places-json-vs-csv/, https://github.com/PimpinPumpkin/Vela/pull/767
  - Corner also accepts a pasted Google Maps list link.
- **Map of all places:** U12 is planned but not built.
- **Collaborative list with a partner.** Airbnb has notes and up/down votes. Corner tells you when both people want the same place. This fits WhereToGo's +1/-1 swipe score naturally ("cả hai cùng vuốt").
- **Account trust basics:** data export (the weekly Drive backup job already exists), account deletion, and disconnecting Drive.
- **"Pick for me" for a group or couple:** LunchFoods has this, and WhereToGo's DailyPick or random pick can grow into it.

## 5. Recommendations, ranked by value for effort (solo developer)

1. **Landing page at `#/` plus `/privacy` and `/terms` (small–medium, very high value).**
   - These are required for Google brand verification. The app name and logo only appear on the consent screen after verification; until then users see only the domain, here the `*.supabase.co` callback domain, which looks untrustworthy.
   - Verification takes 2–3 business days, and the home page and privacy policy must share a verified domain (https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification, https://support.google.com/cloud/answer/13804963).
   - `docs/SETUP.md:44` says only that `drive.file` needs no Google review. That is true for sensitive-scope review, but basic or brand verification still applies.
   - Check that `<user>.github.io` can be verified in Search Console, or use a custom domain.
2. **Open sign-ups (reverse D24, `docs/PLAN.md:38`) with a 2–3 step onboarding (small).**
   - Step 1: one value screen. Step 2: a pre-permission screen explaining Drive before Google consent. Step 3: optional starter nhóm (Ăn uống, Cà phê, Vui chơi, Du lịch).
   - Then an empty Home with two buttons: "Thêm địa điểm đầu tiên" and "Nhập từ Google Maps".
   - Ask for location only in context, on Gần tôi.
   - Do **not** copy Beli's forced invites or Wanderlog's quiz plus paywall. NN/g-style guidance says up-front tutorials are skipped and don't improve performance; use empty states with direct paths to the key tasks instead (https://raw.studio/?p=9526).
3. **Install guide sheet and page with iOS and Android variants (small).**
4. **404 / offline page and Help/FAQ (small).** Replace the silent redirect at `App.tsx:88`.
5. **Account page (small–medium):** profile, export JSON, delete account, Drive status and revoke link.
6. **Google Takeout CSV import with a preview step (medium, high value).** Show matched and unmatched rows before committing, which fixes Corner's no-preview complaint.
7. **Map view (medium):** U12 with Leaflet and OSM tiles, with pins only for places that have coordinates.
8. **Public read-only share for a place, then for a nhóm (medium):** a token URL, the Web Share API, and server-proxied thumbnails.
9. **Collaborative nhóm with a partner and a shared swipe match (large):** needs a membership table and RLS rework. Defer.
10. **Skip for now:** social feed, follows, push notifications, gamification. Beli and Corner depend on these, but they bring moderation load a solo developer can't absorb.

Unified style (replacing U28, `docs/UI-REDESIGN.md:165`): use the landing page as the reference design for the token set, so the marketing page and the app share one light and dark palette and one font pair.