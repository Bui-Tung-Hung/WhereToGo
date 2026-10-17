# Opening WhereToGo to the public: what has to change (audit of the repo as of commit ff25e89)

I did not modify any repo files. A few third-party pages (support.google.com, supabase.com docs) could not be opened through the session proxy, so those facts come from search-result summaries of the official pages. Each such item is cited to its official URL.

## Summary for the plan doc

The one serious data-exposure risk is not the backup. It is the wildcard redirect `https://*.trycloudflare.com/**` (A1). Remove it first.

The weekly backup does **not** leak data between users (§1.6). Its problems for many users are reliability and public-log exposure (A7, A8).

To open the app safely, five things must exist in order:
1. Cleaned-up OAuth and CORS settings.
2. A public landing page with a truthful privacy policy and terms.
3. In-app account deletion and data export, plus Drive disconnect.
4. Basic quotas and rate limits that protect the shared 500 MB database and the Vercel caps.
5. Sign-ups turned back on, optionally invite-only first.

---

## 1. Single-user assumptions and what each one breaks

**1.1 D24: sign-ups are off.** The app is closed to everyone except the owner by design.
- Where it is set: `docs/PLAN.md:38`, `docs/SETUP.md:155-159` (step 10, "TẮT Allow new users to sign up"), and acceptance test D-13 at `docs/PLAN.md:885`.
- The error text assumes one owner. `web/src/features/auth/authRedirectError.ts:11-12,42-43` maps `signup_disabled` to "Tài khoản Google này không có quyền dùng WhereToGo. Hãy đăng nhập bằng tài khoản của chủ app."
- D24 is the only abuse control in the risk table (`docs/PLAN.md:848`: "Người lạ đăng ký dùng app | Tắt đăng ký… API luôn yêu cầu JWT"). Turning sign-ups on removes it and nothing replaces it: there are no quotas and no rate limits (§6).

**1.2 The privacy policy is written for a personal app** (full text in `web/public/privacy.html`). It opens with "WhereToGo là ứng dụng cá nhân…" (`:85`). Deletion of Supabase data is a manual request through a public GitHub issue (`:133, :139-142, :156-158`), and the owner deletes it by hand. With many users that does not scale, and it makes each person announce in public that they use the app and want deletion. Details in §4.

**1.3 Some docs and checks assume only the owner's data is in the database.**
- `supabase/checks/20261016000100_verify.sql:3`: "gửi lại toàn bộ bảng kết quả". Its queries (`:8-21`, `:25-32`) print each user's `user_id`, tag names and category names. Once there are real users, pasting these results into a chat or AI session shares other people's data. Checks must become aggregate-only.
- `supabase/migrations/20261016000200_drop_legacy_tags.sql:17-23` deletes tags named "Ăn uống" / "Vui chơi" / "Du lịch" for **every** user. The header (`:3`) says "An toàn khi chạy lại" (safe to re-run). After launch, a re-run would silently delete tags that new users made with those common names. It is also step 6 of a fresh install (`SETUP.md:75`).
- `SETUP.md:165-181` asks the owner to check things like "số quán của bạn" and "4 cho mỗi user" by eye. That is a manual SQL Editor migration process with no staging, running on the same project where dev happens (`SETUP.md:63-64`: localhost and tunnel redirects allowed on the prod project).

**1.4 Dev and prod share one Supabase project and one Google OAuth client.**
- The prod project accepts redirects to `http://localhost:5173/**` and `https://*.trycloudflare.com/**` (`SETUP.md:61-64`, `PLAN.md:744`).
- The API's CORS default allows any `*.trycloudflare.com` origin (`server/wheretogo_api/config.py:34`, `server/.env.example`).
- This was harmless with one user. With public users it is a security hole (§6, A1).

**1.5 Client-side state is scoped to the app session, not to the user.** On a shared device, if user A signs out and user B signs in without reloading the page:
- **B's photos go to A's folder.** `web/src/features/google/driveFolderApi.ts:8,14-20` caches A's "WhereToGo Photos" folder id at module level. `signOut()` (`web/src/features/auth/authService.ts:98-110`) clears thumbnails, the Drive token and the query cache, but not `cachedFolderId`. B's uploads target A's folder, B's `drive.file` token cannot see it, and every upload fails until a reload.
- **B gets no default groups or tags.** `web/src/features/auth/AuthProvider.tsx:60,85-89` seeds only once per app launch (`hasSeededDefaultsRef`), not once per user.

**1.6 Weekly backup: no cross-user leak, but it is fragile with many users.**

It does **not** dump every user's rows into the owner's Drive:
- Rows are filtered per user with `_rows_for_user` (`jobs/wheretogo_jobs/backup.py:56-58,83`). All 8 backed-up tables have a `user_id` column (`init_schema.sql:16,44,54,63,78`; `20261016000100…sql:26,39,49`).
- Each file is uploaded with that user's own token into that user's Drive (`backup.py:87-89`).
- A future table without `user_id` would be silently left out, not leaked, so the filter is safe by default.

What is wrong with it for many users:
- **One user's error stops everyone's backup.** The loop (`backup.py:119-124`) has no per-user try/except. `main()` catches everything and exits with code 1 (`:129-137`). So one failure (a revoked Google grant raising `invalid_grant`, a full Drive returning 403, any 5xx) aborts backups for all users after that one in the list. On `invalid_grant` the user's credential is also deleted (`server/wheretogo_api/google_oauth.py:87-90`).
- **Users beyond 1000 are never backed up.** `list_user_ids()` (`server/wheretogo_api/credentials_repository.py:70-73`) does not paginate, so PostgREST's default 1000-row cap applies.
- **All users' data passes through GitHub-hosted runners every week.** GitHub becomes a data processor, which must be disclosed (§4).
- **Users cannot opt out.** If someone deletes "WhereToGo Backups", the job creates it again (`server/wheretogo_api/drive.py:13`, `backup.py:88`), and the files count against their Drive storage.
- **There is no restore or import feature** for these JSON files anywhere in the app.
- **Public logs.** See §6, A8.

**1.7 Free Supabase has no automatic backups**, so the per-user Drive JSON files are the only backups (source: https://supabase.com/pricing). The owner has no database-level restore. A database-level dump would hold all users' data in the owner's storage, so it would have to be encrypted and disclosed.

**1.8 Scheduled jobs can silently stop.** GitHub disables schedules after 60 days without commits on a public repo (`SETUP.md:190`). Once users rely on backups, that is a silent outage. Nothing monitors it.

**1.9 Server caches are per-instance dictionaries that never shrink.** `folder_cache` (`server/wheretogo_api/deps.py:29`) and `_access_token_cache` (`google_oauth.py:29`) are keyed by `user_id`. That is correct for many users and only a memory note at this scale.

**1.10 Owner contact details are personal and visible to all users.** The Google consent screen's "User support email" is the owner's own address (`SETUP.md:40`), and the privacy contact is a public GitHub issue tracker.

**1.11 The UI and data are Vietnamese-only and VND-only.**
- Strings are hard-coded; there is no i18n library in `web/package.json`. The manifest has `lang: 'vi'` (`web/vite.config.ts:64-65`).
- Default groups and tags are Vietnamese (`20261016000100…sql:147-152,169`). Prices are VND only (D20).
- This is fine for a Vietnamese audience. It only matters if the audience is meant to be wider.

---

## 2. First run for a brand-new user today

**Today, with sign-ups off.** A stranger hits a dead end:
1. They open `https://<user>.github.io/WhereToGo/`. `main.tsx` runs `bootstrap()`, finds no session, and routing goes `/` → `/home` → `RequireAuth` → `#/login` (`web/src/app/App.tsx:87`, `web/src/features/auth/RequireAuth.tsx:20-22`).
2. The login page (`web/src/features/auth/LoginPage.tsx:41-63`) shows only:
   - logo, "WhereToGo" and "Kho địa điểm của riêng bạn";
   - one button, "Tiếp tục với Google";
   - the line "App sẽ xin quyền lưu ảnh vào một thư mục riêng trên Google Drive của bạn."

   There is no description of the app, no privacy or terms link and no screenshots. **There is no landing page at all**, because `/` always goes to `/home`.
3. Google consent:
   - Without brand verification, the screen names the domain `<project-ref>.supabase.co`, not "WhereToGo" and its logo (§5).
   - Because the app asks for sign-in scopes plus `drive.file`, Google shows a **granular consent** screen with checkboxes, so the user can untick Drive (§6, A6).
   - `prompt: 'consent'` (`authService.ts:83-85`, D5 at `PLAN.md:16`) makes this consent screen appear on **every** login, not just the first.
4. Supabase rejects the new sign-up with `error_code=signup_disabled`. `captureAuthRedirectError` sends the user to `#/login` with the "…tài khoản của chủ app" message. The Google grant was already made, so WhereToGo now appears in the stranger's Google "third-party apps" list even though they have no account.

**After sign-ups are turned on:**

3'. Supabase creates the `auth.users` row and returns `?code=`. `initializeAuth()` exchanges the code, then `forwardProviderRefreshToken` POSTs the refresh token to `/api/google/credentials` (`authService.ts:28-47,56-70`). The server encrypts it with Fernet and upserts it.

4'. The user lands on `/home`. `AuthProvider` fires two seeds in parallel (`AuthProvider.tsx:85-108`), fire-and-forget, with failures only logged to the console:
   - `seed_default_tags()` → one tag, "Hẹn hò" (`20261016000100…sql:161-172`);
   - `seed_default_categories()` → Quán ăn / Quán uống / Chỗ chơi / Du lịch (`:139-155`).

   Both are security-invoker and only run when the user has no rows yet, which is correct.

5'. The home page with zero places (`web/src/features/home/HomePage.tsx:104-116`) shows an EmptyState: "Chưa có địa điểm nào" / "Bắt đầu lưu lại những nơi bạn muốn nhớ." with the button "Thêm địa điểm đầu tiên".
   - **The four seeded groups are hidden**, because the empty check returns before the group cards render.
   - The dock still shows Search, ＋ and Swipe. Swipe shows the same empty state (`web/src/features/swipe/SwipeEmptyState.tsx:28-31`).
   - There is no welcome or onboarding: nothing explains groups vs tags, the swipe page, pasting a Maps link, Drive photos, or "Thêm vào MH chính" (Add to Home Screen, which the iOS PWA depends on, D1).
   - There is no step to accept the terms or acknowledge the privacy policy.

6'. The Drive status is probed after 1.2 s (`AuthProvider.tsx:36,139`).
   - If the user unticked Drive, the probe still reports "linked" (§6, A6), and the first upload fails with the generic "Không thể bắt đầu tải ảnh lên Google Drive."
   - If forwarding the refresh token failed, the "Cần kết nối lại Google Drive" banner shows **only on Settings** (`web/src/features/settings/SettingsPage.tsx:80`), never on Home.

7'. On the first Sunday at 09:41 Vietnam time (`.github/workflows/backup.yml:5-6`), a "WhereToGo Backups" folder appears in the user's Drive. They were never told about it in the app.

**Smaller first-run issues:**
- `RequireAuth` does not remember where the user was going, so deep links are lost after login.
- A signed-in user who opens `#/login` sees the login page again instead of being sent to Home.

---

## 3. Missing account-level features

What Settings has today (`SettingsPage.tsx:82-149`): email, "Kết nối lại Google Drive", manage groups and tags, clear cached thumbnails, version, and "Đăng xuất". There are no links to privacy, terms or help.

| Feature | State today | What it needs | Priority |
|---|---|---|---|
| **Delete account and data** | None. Privacy policy says to "liên hệ" (`privacy.html:133`). | New server endpoint (the browser cannot delete its own auth user). It would: (1) revoke the Google token with `POST https://oauth2.googleapis.com/revoke` ([Google docs](https://developers.google.com/identity/protocols/oauth2/web-server)); (2) delete the user through the Supabase Admin API, which cascades to every table because all `user_id` foreign keys are `on delete cascade` (`init_schema.sql:16,44,54,63,78,87`; `20261016000100…sql:26,39,49`); (3) optionally trash the "WhereToGo Photos" and "WhereToGo Backups" folders (`drive.file` can delete files the app created); (4) clear local caches like `signOut()` does. Confirm with an alert plus typing a word. | **Must** (Google User Data Policy; Vietnam PDPL) |
| **Export my data** | Only the weekly Drive JSON, which the user cannot trigger. | "Tải dữ liệu của tôi": download JSON in the browser through PostgREST (RLS already limits it to the user's own rows, same format as `backup.py:79-84`), and point to the Drive photos folder. Import or restore is nice-to-have. | **Must** (data rights) |
| **Disconnect Google Drive** | No route. `credentials_repository.delete` exists but is only called on `invalid_grant`. | `DELETE /api/google/credentials`, which also revokes the token. Today, revoking at myaccount.google.com (as `privacy.html:128-129` tells users) does not sign them out or delete anything. | **Must** |
| **Sign out on this device vs all devices** | `supabase.auth.signOut()` defaults to `{ scope: 'global' }` (checked in auth-js 2.118.0 source), so "Đăng xuất" on the PC also signs out the iPhone without warning. | Two options ("Đăng xuất trên máy này" uses `scope: 'local'`), or at least explain it. | Should |
| **Backup opt-in or opt-out** | Every linked user is backed up, with no way to stop. | A toggle stored per user (a new column or table) that the job checks. | Should |
| **Privacy, Terms, Help links** | Missing from Login, Settings and the (missing) landing page. | Links in Settings, the landing page and the login footer. Both Google Branding fields filled in. | **Must** (privacy) / Should (terms) |
| **Terms of service** | Does not exist. | Short document: free service with no guarantee and no SLA, may stop at any time; acceptable use; user owns their content and their Drive files; account deletion; age (at least the Google account minimum); contact; Vietnamese governing law. | **Must** before public launch |
| **Contact and support** | GitHub issues only, which are public. | A dedicated support email, also used on the consent screen. Optional in-app "Góp ý". | **Must** |
| **Language switch** | Vietnamese only, hard-coded. | Defer, unless the audience is not Vietnamese. | Nice |
| **Onboarding / "what is this" for a new user** | Nothing (see §2). | Belongs to the landing page and first-run UI work. | Should |

---

## 4. Privacy policy: what it says now vs what a public version must say

**Current text** (`web/public/privacy.html`):
- Effective 25/09/2026 (`:82`); describes a "personal app" (`:85`).
- Collects only email and name (`:92`).
- Place data: name, address, coordinates, rating, notes, price, hours, **tags**, status, visits, "chỉ tài khoản của bạn đọc được" (`:95-97`; English `:149`).
- Photos and backups live in the user's Drive with the `drive.file` scope; an encrypted refresh token is used to upload, display and back up (`:104-113`).
- No selling or sharing, no ads, no trackers; data goes through Supabase, Vercel, GitHub Pages and Google (`:119-122`).
- Deletion: revoke at myaccount.google.com, delete the Drive folders yourself, contact the owner through a GitHub issue for the database rows (`:125-142`).
- An English summary (`:145-160`).

**What is wrong or missing for a public, multi-user app:**

1. **The data list is out of date.** Missing:
   - groups (`categories`, `place_categories`), `story`, favourites (`favorited_at`), `interest_score`;
   - **swipe history** (`swipe_events`: each +1/-1 with a timestamp). This is behavioural data, even if the user creates it for themselves;
   - the Google **profile photo** (used by `web/src/features/auth/avatarInfo.ts:23`);
   - what Supabase Auth stores itself: Google identity metadata, sign-in timestamps, auth audit logs that include IP addresses;
   - server and hosting logs (Vercel request logs; GitHub Actions logs, §6 A8);
   - data cached on the device (IndexedDB for 7 days, Cache Storage for thumbnails), cleared on sign-out.
2. **"Chỉ tài khoản của bạn đọc được" (only your account can read it) is not strictly true.** The operator can read every row through the Supabase dashboard and service-role keys, and the backup job reads all tables with service role (`PLAN.md:58`; `rls_and_grants.sql:70-71`). The policy must say who has technical access and that it is used only for operations and backups.
3. **Processors and locations.** Name each processor and where it runs:
   - Supabase (Singapore), Vercel (`sin1`, `server/vercel.json`), GitHub Pages and **GitHub Actions** (weekly backup processing), Google (sign-in, Drive);
   - the Maps short-link resolver: the server fetches the pasted `goo.gl` link (`server/wheretogo_api/routes/maps.py:29-39`).

   Add a section on transfers out of Vietnam.
4. **Google API Services User Data Policy** ([policy](https://developers.google.com/terms/api-services-user-data-policy)). The policy must "comprehensively disclose how an application… collects, uses, and shares user data… how you store and secure the data, and what happens to the data when an account is deactivated or deleted." The **in-product** disclosure has to be in the app (or a separate dialog for web apps) and "cannot be placed only in a privacy policy". The login caption is a start, but it must also mention the weekly backups and the encrypted token stored on the server. Optionally add a Limited Use statement.
5. **Self-service rights with deadlines:** access/export, correction, deletion, withdrawing consent (disconnect Drive or delete the account). State what deletion removes (all database rows by cascade, the token, and the Drive folders if the user chooses), how long it takes, and that GitHub and Vercel logs expire under their own retention (public-repo Actions logs: up to 90 days, [GitHub docs](https://docs.github.com/en/actions/how-tos/monitor-workflows/use-workflow-run-logs)).
6. **Retention:** how long data is kept while the account exists, 8 backups kept in Drive (`backup.py:43`), and what happens to inactive accounts.
7. **Contact:** a dedicated email instead of public GitHub issues. Identify the controller (the owner as an individual).
8. **Vietnam's Personal Data Protection Law** (Law 91/2025/QH15 and Decree 356/2025/ND-CP, both in force since 1 January 2026; summaries: [DFDL](https://www.dfdl.com/insights/legal-and-tax-updates/vietnam-personal-data-protection-2026-what-foreign-organizations-need-to-know/), [EY](https://www.ey.com/content/dam/ey-unified-site/ey-com/en-vn/technical/tax/documents/ey-vietnam-legal-alert-march-2026-decree-no356-2025-nd-cp-providing-detailed-guidance-for-implementation-of-personal-data-protection-law-eng.pdf)). It expects consent tied to each purpose, rights to withdraw consent and to delete, and deletion when the purpose ends. Flag this to the owner as something to confirm with a lawyer, not legal advice.
9. **Age statement, and how policy changes are announced** (version number, date, in-app notice).
10. **Hosting and placement.** The policy must sit on the same verified domain as the home page and be linked from the landing page, the login page and Settings. Note that the PWA service worker serves `index.html` as a fallback for navigations it does not recognise (`web/vite.config.ts:82-86`). `privacy.html` works because it is precached, but any new static page (terms, landing) must also be precached or excluded from the fallback.

---

## 5. Infrastructure and quota concerns to flag to the owner

**Google OAuth publishing mode.**
- The repo assumes the app was **published, "In production"**: `SETUP.md:44` ("bấm Publish app… Đây là điều kiện để refresh token không hết hạn sau 7 ngày"), `PLAN.md:735`.
- So the Testing-mode limits (100 test users; consent and refresh tokens expiring after 7 days for any scope beyond basic sign-in) should not apply. **The owner should still check the console status**, because nothing in the repo verifies it. Source: Google's "audience" help page (https://support.google.com/cloud/answer/15549945), via search.
- `drive.file` is classed as **non-sensitive** ([Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)). That means no unverified-app warning and no user cap.

**Google brand verification is the real blocker.**
- "Without verification, only your application domain is visible to users" ([brand verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification)). Today strangers see `<ref>.supabase.co`, which Supabase itself says "does not inspire trust" ([Supabase Google login docs](https://supabase.com/docs/guides/auth/social-login/auth-google)).
- Verification needs a **public home page** that describes the app and links the privacy policy. The current root shows only the login page, so it would fail.
- It also needs every **authorized domain** verified in Search Console. `SETUP.md:43` lists `<project-ref>.supabase.co`, which the owner cannot verify. The realistic fix is a Supabase custom domain: a paid add-on, about $10/month on top of the $25/month Pro plan ([Supabase custom domains](https://supabase.com/docs/guides/platform/custom-domains), [pricing](https://supabase.com/pricing)).
- The alternative is to accept the unbranded consent screen. The owner has to choose.
- `bui-tung-hung.github.io` can be verified, because github.io is a public-suffix domain.

**Vercel Hobby.**
- "Restricted to non-commercial personal use only." Commercial means any financial gain: ads, payments, affiliate links, being paid to build it; donations are listed inconsistently between versions ([Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines)). A free public app with no ads is OK. Any monetisation means moving to Pro.
- Hobby has **hard caps**: 1M invocations, 4 active-CPU hours, 360 GB-hours of memory, 100 GB fast data transfer per month ([Vercel limits](https://vercel.com/docs/limits)). Hitting a cap takes the API down for everyone: photos, thumbnails, Drive tokens, Maps resolve.
- Every uncached thumbnail is one invocation plus a Drive metadata call plus an image download (`server/wheretogo_api/routes/photos.py:22-41`).

**Supabase Free.**
- Limits: 50,000 MAU, **500 MB database** (the project goes **read-only** above that, for all users), 5 GB egress per month for the whole organisation, 1 GB storage, paused after 1 week idle, no automatic backups ([pricing](https://supabase.com/pricing), [database size](https://supabase.com/docs/guides/platform/database-size)).
- Egress risk: `listPlaces()` fetches every place with all relations and no pagination (`web/src/features/places/placeRepository.ts:125-133`), and refetches whenever the window regains focus after 30 s (`web/src/app/queryClient.ts:44,52-55`). Monitor egress.
- PostgREST's 1000-row default also silently cuts off a user with more than 1000 places.
- Real traffic will keep the project from pausing, so keepalive becomes optional.

**GitHub Pages.** Soft limit of 100 GB/month bandwidth; not allowed as hosting for commercial SaaS ([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)). Fine for a free app.

**Google Drive API quotas** are generous: 1,000,000 quota units per minute per project ([Drive limits](https://developers.google.com/workspace/drive/api/guides/limits)). Not a concern.

**Encryption key.** One `TOKEN_ENCRYPTION_KEY` is shared by Vercel and GitHub Actions (`SETUP.md:102,131`). Losing or rotating it forces every user to reconnect Drive (`SETUP.md:85`). Plan for rotation with `MultiFernet`.

**Operations.**
- Split dev and prod: free Supabase allows two projects.
- Move migrations to the Supabase CLI and take a backup before each one.
- Add some error monitoring: today errors only go to `console`.
- Watch the scheduled workflows (§1.8).

---

## 6. Security and abuse issues that matter once sign-up is public

Ranked by priority.

**A1 (must) – OAuth redirect allowlist lets anyone steal a login.**
- Supabase Redirect URLs include `https://*.trycloudflare.com/**` (`SETUP.md:64`, `PLAN.md:744`). A single `*` matches any non-separator characters ([Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)), so any free quick tunnel matches.
- How the attack works: an attacker starts a PKCE flow with their own verifier and `redirect_to=https://evil.trycloudflare.com/`, then sends the link to a victim. The victim signs in with Google, and the code goes to the attacker, who exchanges it. The attacker gets the victim's Supabase session, and their app can then exchange the provider refresh token for `drive.file` access.
- Fix: remove the tunnel and `localhost` entries from the prod project and list only the exact production URL. Also remove the tunnel regex from prod CORS (`server/wheretogo_api/config.py:34`; set `ALLOWED_ORIGIN_REGEX` to never match in prod). CORS matters less here because the API uses bearer tokens.

**A2 (must) – No rate limiting anywhere** (no limiter found in `server/`, `jobs/` or `web/src`).
- Anyone with a Google account can loop calls to `/api/maps/resolve` (outbound GETs to goo.gl, `server/wheretogo_api/maps_links.py:46-77`), `/api/photos/{id}/thumbnail` and `/api/google/access-token`, and use up the Vercel Hobby caps for everyone.
- Options: Vercel WAF rate limiting, which Hobby gets with only 1 rule per project, keyed by IP or JA4 ([Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)); and/or a per-user limiter backed by a shared store.
- Supabase Auth has per-IP limits on sign-in (default 30 per 5 minutes, [Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits)). CAPTCHA does not apply to the OAuth flow.

**A3 (must) – No per-user quotas in the database.**
- Users write directly to PostgREST with the public publishable key and their own JWT. Limits exist only as text-length checks (notes and story ≤ 5000 characters, `init_schema.sql:28`, `20261016000100…sql:9`).
- The limit of 20 photos per place (D23) is enforced only in the UI, and `swipe_events` grows with every swipe.
- At about 30 KB worst case per place, a script can fill the shared 500 MB in about 17,000 inserts, which puts the **whole project in read-only mode**.
- Fix: count limits enforced in the database (triggers or check functions on places per user, photos per place, visits), plus compacting or pruning `swipe_events`.

**A4 (must) – Self-service delete and disconnect** (§3). Also add the token revocation that is missing everywhere.

**A5 (must) – Drop `prompt=consent` on every login** (`authService.ts:83-85`). Use `select_account` normally and `consent` only for "Kết nối lại Google Drive", or when the server has no refresh token. Otherwise every public user goes through the full consent screen each time.

**A6 (must) – Granular consent: the app does not check whether Drive was granted.**
- With sign-in scopes plus `drive.file`, Google shows checkboxes ([granular permissions](https://developers.google.com/identity/protocols/oauth2/resources/granular-permissions)), and the app "must check what scopes are granted… can't assume users grant all requested scopes".
- `GoogleTokenService.get_access_token` ignores the `scope` field in the token response (`google_oauth.py:93-97`). So `driveLinked` reports true and uploads and thumbnails fail with generic errors.
- Fix: check for `drive.file` on store and on refresh, return the existing `google_reauth_required` error or a new `drive_scope_missing`, and show a clear reconnect prompt. Possibly let the app work without photos.

**A7 (should) – Make the backup job isolate failures** (§1.6): per-user try/except, log only per-user status, paginate `list_user_ids`, honour an opt-out.

**A8 (should) – Public GitHub Actions logs.**
- The repo is public (`SETUP.md:18`, `PLAN.md:23`), and public Actions logs are visible to everyone ([GitHub repository visibility](https://docs.github.com/articles/setting-repository-visibility)).
- `backup.py:129` calls `logging.basicConfig(level="INFO")`. httpx 0.28 logs every request URL at INFO (`'HTTP Request: %s %s "%s %d %s"'` in `httpx/_client.py`).
- So each run prints, in public: `…/google_credentials?user_id=eq.<uuid>…` for every user, Drive folder ids (`'<folderId>' in parents`), Drive file ids of deleted backups, and table row counts (`backup.py:52`). These are identifiers, not credentials, but they reveal user count and growth.
- The project URL is probably masked, since `SUPABASE_URL` is a secret (`backup.yml:25`).
- Fix: set the `httpx` logger to WARNING in the jobs, or move the jobs to a private repo.

**A9 (should) – Photo file ids are unique across all users.** `photos.drive_file_id` has a global unique constraint (`init_schema.sql:64`). That lets one user detect, or block, an id that another user already inserted. Change it to `unique (user_id, drive_file_id)`. Low severity.

**A10 (should) – Separate dev from prod data** (§1.3, §1.4). Make verification checks aggregate-only. Make `drop_legacy_tags` limited to the users it was written for, or retire it.

**A11 (nice) – Content Security Policy.**
- GitHub Pages cannot set response headers, so a CSP would have to be a `<meta>` tag in `web/index.html` (there is none today).
- The supabase-js session lives in `localStorage` by default, so any XSS means token theft.

**A12 (nice) – No moderation needed while all data is private.** There are no sharing features today, so there is no user-generated content to moderate or report. Any future public sharing changes the privacy model and RLS (every policy today is `owner_all`).

**A13 (nice) – Fix the shared-device bugs** (§1.5): clear `cachedFolderId` on sign-out, and seed defaults per `user.id`, not per launch.

**A14 (nice) – Reputation risk to the OAuth client.** If the app is abused, Google can suspend the OAuth client, which would cut Drive access for every user. This is another reason for A2 and A3.

---

## Priority list

**Must do before turning sign-ups on:**
1. Remove the wildcard redirect URLs and tunnel CORS entries from prod; separate dev from prod (A1, A10).
2. Build a public landing page at the root, with a privacy link and screenshots or description. Needed for brand verification and for first-time users.
3. Rewrite the privacy policy (§4). Add terms of service and a dedicated support email; fill in Google Branding.
4. Self-service delete account (with Google revoke and optional Drive cleanup), disconnect Drive, and export data (§3).
5. Database-level per-user quotas and a basic API rate limit (A2, A3).
6. Check the `drive.file` grant; remove `prompt=consent` from normal logins (A5, A6).
7. Make the backup job isolate per-user failures (A7). Change the `signup_disabled` copy, or keep it for an invite-only phase. Update D24, the `PLAN.md:848` risk table, `SETUP.md` step 10 and acceptance test D-13.
8. Decide on brand verification: Supabase custom domain (paid) vs accepting the `<ref>.supabase.co` consent screen.

**Should do at launch:**
- First-run onboarding: show the seeded groups even when there are zero places; explain swipe, Maps paste and Drive; add an "Add to Home Screen" hint for iOS.
- Show the Drive reconnect banner on Home, not only Settings.
- Separate "sign out this device" from "sign out all devices".
- Backup opt-out; hide or move public job logs (A8).
- Monitoring and alerts for Vercel, Supabase usage and scheduled workflows.
- Scoped photo uniqueness (A9); shared-device fixes (A13).

**Nice to have:**
- Import or restore from a backup.
- Language switch.
- CSP meta tag.
- Database-level disaster-recovery backup, encrypted and disclosed.
- Encryption-key rotation with `MultiFernet`.
- Paginated place list to reduce egress.
- Remember the deep link through login; send signed-in users away from `#/login`.

**Optional staged rollout: invite-only beta.**
- Keep sign-ups off and pre-create users in the dashboard with a confirmed email.
- Supabase automatically links a Google identity to an existing user with the same *verified* email ([Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking)).
- Whether that works while sign-ups are disabled is unconfirmed. Test it before relying on it.