# Which pages a public WhereToGo needs: web research on Google OAuth, Supabase, Vietnam data law and PWA install (as of 2026-10-17)

**How the sources were read:** WebFetch could not resolve any host (getaddrinfo ENOTFOUND), and curl got a 403 from the egress proxy (blocked host). So the web findings below come from WebSearch result snippets and summaries only. Quoted phrases are as the search returned them; check the live page before using any of them as exact wording. Repo files were read directly.

---

## 1. Google OAuth consent screen and verification

### 1.1 Scope classification
- **`drive.file` is non-sensitive.** Google's Drive scope guide lists it as "Recommended / Non-sensitive". Non-sensitive scopes "only require basic app verification".
  - https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- **`openid`, `userinfo.email` and `userinfo.profile` are the basic Sign-In scopes**, also non-sensitive.
  - https://developers.google.com/identity/protocols/oauth2/scopes
- **No sensitive-scope or restricted-scope review is needed, and there is no CASA security assessment.**
- **The "unverified app" warning screen and the 100-new-user lifetime cap do not apply.** They apply only to apps "requesting unapproved sensitive or restricted scopes". The cap "applies over the entire lifetime of the project" and cannot be reset.
  - https://support.google.com/cloud/answer/7454865
- **Full app verification is optional when every scope is non-sensitive.** But to show an app name and logo on the consent screen, the app must pass the lighter "brand verification".
  - https://support.google.com/cloud/answer/13463073

### 1.2 Testing mode vs. In production
- **Refresh tokens expire after 7 days in Testing mode.** In production they "generally don't expire unless revoked or unused for a prolonged period (typically six months)".
  - https://developers.google.com/health/setup
  - Google forum confirmation: https://discuss.google.dev/t/oauth2-refresh-token-expiration-and-youtube-api-v3/160874
- **The only exception is not available to this app.** From memory of Google's web-server OAuth guide (the page could not be fetched here): tokens are exempt only when the app asks for nothing beyond name, email and profile. WhereToGo also asks for `drive.file`, so the 7-day expiry would hit every Testing-mode user.
- **Testing mode is limited to 100 test users, each added by hand.** I found this only in third-party sources:
  - https://tech.sailjada.com/posts/2026-05-06-1924.html
  - https://www.unipile.com/google-oauth-100-user-limit/
- **So a public app must set Audience = External and Publish app → In production.** `docs/SETUP.md:44` already says so, which is correct.

### 1.3 What happens without brand verification (the Supabase domain problem)
- **Google shows the redirect domain instead of the app name until the brand is verified.** For Supabase Auth that domain is `<project-ref>.supabase.co`.
  - Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-google
  - Open Supabase issue: https://github.com/supabase/supabase/issues/33387
- **You cannot verify `supabase.co`, so brand verification often gets stuck.** Google's checker reports "app name does not match homepage" because the consent screen still shows the Supabase domain.
  - https://discuss.google.dev/t/oauth-branding-verification-stuck-name-mismatch-due-to-supabase-callback-domain-no-trust-safety-email-received/389007
  - Similar rejection-loop reports: https://discuss.google.dev/t/oauth-branding-verification-stuck-in-instant-rejection-loop-app-name-matches-homepage-exactly-no-trust-safety-email-ever-received/390467
- **Uploading a logo starts the brand-verification requirement.** This comes from a user report:
  - https://github.com/orgs/supabase/discussions/2925
- **Fixes:**
  - Supabase custom domain. This is a paid add-on on top of a paid plan (users report about $10/mo for the domain plus $25/mo for Pro).
  - Google's own Sign-In button with `signInWithIdToken`, so the consent screen names your site rather than the Supabase domain. Example: https://github.com/wildlifeai/ww-website/pull/201
  - Whether that second route can also get a `drive.file` offline refresh token needs architecture work. That is outside my scope.

### 1.4 Brand verification requirements (they decide what the landing page must contain)
**Homepage must:**
- Be hosted on a verified domain that you own.
- Accurately identify the app or brand.
- "Fully describe your app's functionality".
- Explain why the app requests user data.
- Not be "only a login page".
- Be "publicly accessible, and not just accessible to your site's logged-in users".
- Not be a Play Store or Facebook page.
- Link to the privacy policy, and that link "should match the link you added on your consent screen".

Sources:
- https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification
- https://support.google.com/cloud/answer/13464321
- https://support.google.com/cloud/answer/13807376

Forum case: an app was rejected because the homepage had no privacy link. It passed after a footer link visible without login was added.
- https://discuss.google.dev/t/oauth-brand-verification-stuck-homepage-issue-fixed-but-never-received-any-trust-safety-email/371654

**Privacy policy must:**
- Be visible to users.
- Be hosted on the same domain as the homepage.
- Be linked on the consent screen.

Source: https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification

**Terms of service: the sources disagree.**
- The brand-verification page calls it "optional terms of service".
- The Branding help page says the homepage, privacy and ToS links are "required for all external production apps", and that you "will not be able to submit your app for verification if it is missing these links": https://support.google.com/cloud/answer/15549049
- **So ship a ToS page anyway.**

**App name** must exactly match the name on the homepage (visible text, not only metadata), per the forum threads above.

**Authorized domains:**
- They must cover the top private domain of the homepage, privacy and ToS URLs, plus the redirect and JavaScript-origin hosts.
- Each must be verified in Google Search Console by a project Owner or Editor.
- Third-party guides recommend a DNS-verified *Domain* property rather than a URL-prefix property.
- Maximum of 10 authorized domains.
- Sources: https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification, https://singhamandeep.com/google-oauth-brand-verification/

### 1.5 Can `*.github.io` be the authorized domain?
- **Effectively no, if you want brand verification.**
- Google's guidance: the homepage and privacy policy "should not be hosted on a third-party platform where you can't verify that you own your subdomain" (it gives Google Sites, Facebook and others as examples): https://support.google.com/cloud/answer/13807376
- In one forum case, Google's rejection email named github.io explicitly: https://discuss.google.dev/t/google-oauth-domain-not-found-for-verified-github-pages-domain/404025
- One developer whose github.io site was verified in Search Console was still told "Google doesn't treat GitHub Pages as first-party domains": https://medium.com/@info.brightconstruct/the-real-oauth-journey-getting-a-google-workspace-add-on-verified-fc31bc4c9858
- `github.io` is on the Public Suffix List, so `<user>.github.io` counts as its own top private domain. Reports show "home page not registered to you" even when it is verified: https://en.wikipedia.org/wiki/Public_Suffix_List
- **So brand verification needs a custom domain.** GitHub Pages supports one. You would also need to deal with the supabase.co redirect (section 1.3).
- **Without brand verification:** you can still publish to production with only non-sensitive scopes and no logo. Users would then see "to continue to `<ref>.supabase.co`". Tokens would be long-lived and there would be no user cap. This is my reading of sections 1.1 to 1.3, not a Google statement; confirm it in the project's Verification Center.

### 1.6 Other Google rules that require pages or UI
- **Limited Use statement (Google API Services User Data Policy).**
  - Google requires an affirmative statement in the app or on the website, for example linked from the homepage to the privacy policy page.
  - You "must disclose all user data that you access, use, store, delete, or share, as well as any actions you take on a user's behalf".
  - Standard wording: "WhereToGo's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements."
  - I could not confirm that Limited Use applies to non-sensitive scopes. The statement costs nothing, so include it.
  - Sources: https://developers.google.com/terms/api-services-user-data-policy and an example disclosure at https://www.uber.com/us/en/google-disclosure/
- **Granular consent.** Google shows per-scope checkboxes when an app asks for Sign-In scopes together with a non-Sign-In scope. WhereToGo asks for openid/email/profile plus `drive.file`, so it gets checkboxes.
  - Users can untick Drive. The app "must check what scopes are granted… can't assume users grant all requested scopes".
  - Source: https://developers.google.com/identity/protocols/oauth2/resources/granular-permissions
  - The OAuth policies add: if a user declines a scope, the app must "disable any related functionality… and not make any related API calls": https://developers.google.com/identity/protocols/oauth2/policies
- **Secure browsers.** Google blocks OAuth inside embedded webviews (`403 disallowed_useragent`). Reported with Messenger, Instagram and TikTok in-app browsers. I found no Zalo-specific report, but Zalo's in-app browser is very likely affected too.
  - https://developers.google.com/identity/protocols/oauth2/policies
  - https://developers.googleblog.com/2021/06/upcoming-security-changes-to-googles-oauth-2.0-authorization-endpoint.html
  - https://community.auth0.com/t/403-disallowed-useragent-for-web-login-from-embedded-browsers/55074
- **Sign in with Google branding guidelines.**
  - Approved button texts: "Sign in with Google", "Sign up with Google", "Continue with Google". Localized versions are allowed (e.g. "Tiếp tục với Google").
  - The standard-color "G" logo must sit on a white background.
  - Light theme: fill #FFFFFF, stroke #747775, text #1F1F1F. Dark theme: fill #131314, stroke #8E918F, text #E3E3E3.
  - "Following these guidelines is required for app verification."
  - https://developers.google.com/identity/branding-guidelines

### 1.7 Current repo state vs. these rules
- `docs/SETUP.md:41-43` and `docs/PLAN.md:732`: homepage `https://<user>.github.io/WhereToGo/`, privacy `…/privacy.html`, authorized domains `<user>.github.io` and `<ref>.supabase.co`. This setup cannot pass brand verification (sections 1.3 and 1.5).
- `docs/SETUP.md:44` says "drive.file không cần Google xét duyệt" (needs no Google review). That is true for scope review, but the brand stays unverified.
- **The homepage is currently only a login page:**
  - `web/index.html:13` is an empty `<div id="root">` with no meta description (`web/index.html:3-11`).
  - The app content renders only through JavaScript, and the root shows login (`web/src/app/App.tsx:56`, `docs/PLAN.md:964`).
  - This breaks "not just a login page" and "describe functionality".
  - Inference from the crawler-mismatch forum reports: put the landing content in static HTML, not only in a client-rendered hash route.
- **`web/public/privacy.html` exists, but:**
  - It describes a "personal app" (`:85`, `:148`).
  - It has no Limited Use statement.
  - It has no named controller and no email contact; the only contact is public GitHub issues (`:137-141`, `:156`).
  - Deleting place data requires contacting the owner (`:133`).
  - It says nothing about location, retention, cross-border transfer, user rights or deadlines, or children.
  - Good to keep: the Vietnamese and English versions (`:146`) and the effective date (`:82`).
- **The in-app UI has no link to privacy or terms, and no delete or export function.**
  - Settings has only sign-out (`web/src/features/settings/SettingsPage.tsx:46-56,148`).
  - The server routes have no account-delete or data-export endpoints. Current routes: `server/wheretogo_api/routes/google.py:28,39`, `photos.py:22,44`, `maps.py:29`, `drive.py:22`, `health.py:10`.

---

## 2. Supabase Auth for public sign-up
- **"Allow new users to sign up" toggle.** When it is off, "only existing users can sign in": https://supabase.com/docs/guides/auth/general-configuration
  - In the repo, D24 turned it off (`docs/PLAN.md:38`, `docs/PLAN.md:760`, `docs/SETUP.md:158`).
  - The client handles the error that results (`web/src/features/auth/authRedirectError.ts:12`, `signup_disabled`).
  - Going public means turning it back on, retiring D24 and acceptance test D-13 (`docs/PLAN.md:885`), and rewording the `signup_disabled` message.
- **Auth email limits do not matter here.**
  - The roughly 2-3 emails per hour default without custom SMTP applies only to endpoints that send email (sign-up, recover, user update by email).
  - Google-only sign-in sends no Supabase email.
  - https://supabase.com/docs/guides/auth/rate-limits
- **Limits that do apply** (from the CLI config reference):
  - `sign_in_sign_ups`: 30 per 5 minutes per IP.
  - Token refresh: 150 per 5 minutes per IP (the rate-limits page says 1800 per hour, which is the same rate).
  - Token bucket of 30.
  - https://supabase.com/docs/guides/local-development/cli/config
  - Inference: Vietnamese mobile carriers put many users behind shared IPs (CGNAT), which could hit per-IP limits at events. Low risk at small scale.
- **CAPTCHA (hCaptcha or Turnstile)** is documented for sign-in, sign-up and password-reset forms. I found no evidence it covers `signInWithOAuth`, so it is not relevant for Google-only sign-in. Google's own abuse checks act as the gate.
  - https://supabase.com/docs/guides/auth/auth-captcha
- **Account deletion.**
  - `auth.admin.deleteUser()` needs the service-role key and must run on a server.
  - Deleting the user removes its sessions and refresh tokens.
  - Child tables need `ON DELETE CASCADE` to `auth.users(id)`.
  - Supabase Storage objects block deletion (WhereToGo stores photos in Drive, so this does not apply).
  - So the "Xoá tài khoản" (delete account) feature needs a new server endpoint.
  - https://supabase.com/docs/reference/javascript/auth-admin-deleteuser
  - https://supabase.com/docs/guides/auth/auth-user-management
- **Free plan** (third-party summaries):
  - 50,000 monthly active users, 500 MB database, 1 GB file storage, 2 active projects.
  - Pauses after 7 days with no database requests; the existing keepalive job covers this.
  - With no card on file, service stops at a limit rather than billing.
  - https://automationatlas.io/answers/supabase-free-tier-limits-2026/
  - https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/
- **Time-sensitive: 2026-10-30, 13 days from today.**
  - Existing projects switch so that *new* tables in `public` are not exposed to the Data API without an explicit `GRANT`. Existing tables keep their grants.
  - Any new table (for example consent records or profiles) needs `GRANT`s in its migration. Without them, PostgREST returns error 42501.
  - https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
- **Hosting terms that limit a public app:**
  - Vercel Hobby is "non-commercial, personal use only". Ads, donations or payments mean moving to Pro. The Hobby ToS also allows Vercel to use "Your Content" for AI training.
    - https://vercel.com/docs/plans/hobby
    - https://vercel.com/terms
  - GitHub Pages is "not intended for or allowed to be used as a free web-hosting service to run your online business… or commercial SaaS". A free, non-commercial app is fine. Soft limit of 100 GB per month bandwidth.
    - https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- **Already per-user (useful for the privacy text):** the backup job writes each user's rows to that user's own Drive (`jobs/wheretogo_jobs/backup.py:56-58,119-122`). The privacy policy must disclose this server-side processing done on the user's behalf.

---

## 3. Vietnam: Law on Personal Data Protection 91/2025/QH15 and Decree 356/2025 (practical notes, not legal advice)
- **Status.**
  - Law 91/2025/QH15 was passed 26/6/2025 and took effect 01/01/2026.
  - Decree 356/2025/NĐ-CP (31/12/2025) is the implementing decree and replaces Decree 13/2023.
  - Activities started under Decree 13 can generally continue without new consent.
  - Sources:
    - https://thuvienphapluat.vn/van-ban/Bo-may-hanh-chinh/Luat-Bao-ve-du-lieu-ca-nhan-2025-so-91-2025-QH15-625628.aspx
    - https://english.luatvietnam.vn/dan-su/law-on-personal-data-protection-law-no-91-2025-qh15-405135-d1.html
    - https://www.vietnam-briefing.com/news/vietnam-personal-data-protection-regulation-decree-356.html/
    - https://www.dataguidance.com/news/vietnam-personal-data-protection-law-enters-force
- **Scope.** The law applies to Vietnamese "agencies, organizations and individuals", so an individual running a public app is in scope. I found no carve-out for personal or household use that would cover an app open to the public.
- **Consent (Art. 9).**
  - Explicit, given separately for each purpose.
  - "Silence or non-response is not consent", so pre-ticked boxes are not allowed.
  - Must be in a form that can be printed or copied (electronic is fine).
  - The controller must be able to prove consent was given.
  - Before consent, tell the user: data types, purposes, who the controller is, and the user's rights and obligations (some sources add recipients and consequences).
  - Sources:
    - https://english.luatvietnam.vn/dan-su/law-on-personal-data-protection-law-no-91-2025-qh15-405135-d1.html
    - https://flaw.vn/en/personal-data-protection-law-and-impact-on-companies/
    - https://www.vnetwork.vn/en-US/news/luat-so-91-2025-qh15/
    - https://bewiseapps.com/doing-business-in-vietnam/intellectual-property-data-and-technology/personal-data-protection
- **User rights:** to be informed, to consent and withdraw consent, to view and access, to correct, to delete, to restrict, to object, to obtain their data, and to complain, sue and claim damages. Controllers "must facilitate, not obstruct" these.
- **Deadlines (Decree 356):**

  | Request | Deadline | If a processor or third party is involved |
  |---|---|---|
  | Acknowledge any request | 2 working days | — |
  | Withdraw consent / restrict / object | 15 days | 20 days |
  | Delete | 20 days | 30 days |
  | Access / correct | 10 days | 15 days |

  One extension is allowed, with the reason given to the user.
  - https://www.vietnam-briefing.com/news/vietnam-personal-data-protection-regulation-decree-356.html/
  - https://vietanlaw.com/decree-356-2025-vs-decree-13-2023-updates-on-personal-data-protection-in-vietnam/
  - https://luatvietnam.vn/dan-su/diem-moi-cua-nghi-dinh-356-2025-so-voi-nghi-dinh-13-2023-ve-bao-ve-du-lieu-ca-nhan-568-106269-article.html
- **Sensitive data: location.** Location obtained through positioning services is reportedly on the sensitive list (Decree 356), which needs explicit consent.
  - The app calls `navigator.geolocation` (`web/src/features/location/geolocation.ts:53`) for "Gần tôi" (near me) and for filling a place's coordinates in the form (`web/src/features/places/PlaceFormPage.tsx:234`).
  - The privacy policy must say whether the user's position is stored. Ask for location in context, with a short explanation first.
  - https://www.uniconsent.com/vietnam-pdpl
  - https://www.vietnam-briefing.com/news/vietnam-law-on-personal-data-protection-latest-developments-and-insights.html/
- **Small operators.**
  - Micro-enterprises and household businesses are exempt from the data protection officer (DPO) requirement and from impact assessments.
  - Small enterprises and startups get a 5-year grace period from 01/01/2026.
  - None of this applies if the operator processes sensitive data, handles more than about 100,000 people, or sells processing services.
  - How this applies to an individual with no business registration is unclear.
  - https://vietnam.acclime.com/news-insights/vietnams-new-personal-data-protection-law-what-businesses-must-know-before-2026/
  - https://www.vnetwork.vn/en-US/news/luat-so-91-2025-qh15/
- **Cross-border transfer.**
  - Using foreign cloud services (Supabase, Vercel, Google) to process data collected in Vietnam counts as a cross-border transfer.
  - A transfer impact assessment dossier goes to the specialised authority within 60 days of the first transfer.
  - The cloud exemption covers only employee data. Small-business relief for this is unclear.
  - **This is a risk to check with a lawyer.**
  - https://skylaw.vn/en/cross-border-personal-data-transfer-procedures-and-key-notes/
  - https://vietnamlawmagazine.vn/businesses-face-tightened-personal-data-protection-requirements-79374.html
- **Breach notification.** Notify A05 (Ministry of Public Security) within 72 hours. Include the nature of the breach, data affected, likely consequences and remedies.
  - https://www.dfdl.com/insights/legal-and-tax-updates/vietnam-personal-data-protection-2026-what-foreign-organizations-need-to-know/
- **Children.**
  - A child is under 16 (Law on Children 2016).
  - Disclosing a child's data needs consent from the child (if aged 7 to 15) and the parent or guardian. One summary says the new law requires parental consent under 16.
  - Practical step: a "16+" clause in the Terms.
  - https://www.linklaters.com/de-lu/insights/data-protected/data-protected---vietnam
  - https://www.clym.io/regulations/personal-data-protection-law-pdpl-vietnam
- **Avoid becoming a "social network".** Decree 147/2024 requires social-network accounts to be verified by a Vietnamese phone number or personal ID. Keep WhereToGo private per user, with no public posting, unless the owner accepts this.
  - https://vneconomy.vn/tu-ngay-25-12-tai-khoan-mang-xa-hoi-phai-xac-thuc-so-dien-thoai-moi-duoc-dang-bai.htm
  - https://kpmg.com/vn/vi/home/phan-tich-chuyen-sau/2025/02/understanding-vietnam-new-internet-regulations.html

---

## 4. Installing the PWA on iOS and Android (2025-2026)
- **iOS has no `beforeinstallprompt`.** Safari offers no install prompt, automatic or site-triggered. The feature request has been open since 2019. Users must install by hand.
  - https://bugs.webkit.org/show_bug.cgi?id=193959
  - https://developer.apple.com/forums/thread/807603
- **iOS 26 change.** "Every website added to the Home Screen opens as a web app", with or without a manifest. A toggle "Open as Web App" defaults to on.
  - https://webkit.org/?p=16993 (WebKit, "News from WWDC25")
  - https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios
  - https://www.idownloadblog.com/2025/06/17/apple-ios-26-safari-web-apps-home-screen-bookmarks/
- **iOS 26 steps.**
  - In the default **Compact** tab layout there is no Share button on the toolbar: tap **•••** → **Share** → scroll → **Add to Home Screen** → keep "Open as Web App" on → **Add**.
  - In the Bottom and Top layouts the Share button is still visible.
  - The layout setting is in Settings → Apps → Safari.
  - Confirmed on iOS 26.2.
  - https://www.macrumors.com/how-to/save-safari-bookmark-web-app-iphone-home-screen/
  - https://community.glideapps.com/t/ios-26-add-to-home-screen-workflow-change/84599
  - https://discuss.google.dev/t/unable-to-add-shot-cut-to-home-with-the-latest-ios-version/330919
- **iOS 16.4 and later** can install from other browsers (Chrome or Edge on iOS) through their share menu.
  - https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Developer_guide/Installing
- **The installed app has separate storage.** Only cookies are copied once, at install time; localStorage is not. The supabase-js session lives in localStorage, so the user has to **sign in again inside the installed app**. The install guide should say "install first, then sign in".
  - https://wwdcnotes.com/documentation/wwdc23-10120-whats-new-in-web-apps/
- **Android Chrome.**
  - Installing from the menu no longer needs a service-worker fetch handler (since Chrome 108 on mobile).
  - The automatic prompt and `beforeinstallprompt` still need it: manifest with name, 192 and 512 px icons, start_url, display standalone, HTTPS, and a service worker with a fetch handler.
  - The repo's manifest meets this (`web/vite.config.ts:59-68`, vite-plugin-pwa).
  - https://developer.chrome.com/blog/update-install-criteria
  - https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_Installable
- **Best practice for promoting install** (web.dev):
  - Keep the offer outside the main task flow, for example a small "Install" button in the header or menu.
  - Make it dismissible.
  - Offer it again only after a meaningful moment (for example after first save or after sign-up).
  - Explain the benefit.
  - https://web.dev/articles/promote-install
- **Note on `start_url`.** It is set to `base` (`web/vite.config.ts:67`). If the root becomes a marketing landing page, the installed app should skip it: either point `start_url` at the app route, or redirect when `display-mode: standalone` or `navigator.standalone` is true.
- **In-app browsers** (Zalo, Messenger, Facebook) cannot install the app, and Google blocks sign-in there (section 1.6). Links in Vietnam are mostly shared through Zalo and Messenger, so detect these by user agent and show an "open in Safari or Chrome" screen.
  - Pattern example: https://progressier.com/pwa-capabilities/in-app-browser

## 5. App stores
- **None are needed.** A PWA installs straight from the browser with no App Store or Play review (MDN pages above).
- **Sign in with Apple does not apply.** Apple's guideline 4.8 covers App Store apps only.
- Google Play would matter only if the app were wrapped as a TWA, which is not planned.
- **The only external review is Google's OAuth brand verification, and it is optional.**

---

## CHECKLIST: required pages and content

| # | Item | What it must contain or do | Source |
|---|---|---|---|
| R1 | **Public landing page at the app root** (no login) | Content in static HTML. App name exactly "WhereToGo", matching the consent screen. What the app does. Why Google data is requested: Drive `drive.file` for photos and backups in the user's own Drive, and email/name for sign-in. Footer links to Privacy and Terms. A Google button that follows the branding guidelines. Must not be just a login page. | https://support.google.com/cloud/answer/13464321, https://support.google.com/cloud/answer/13807376, https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification. Conflicts with `web/index.html:13` and `App.tsx:56`. |
| R2 | **Privacy policy page** on the same domain as R1, with the URL matching the consent screen | Who the controller is and a contact **email**. Every data type: Google email, name, avatar; place data; photos and backups in the user's Drive; the encrypted refresh token; location use. Purposes. Recipients and processors (Supabase, Vercel, GitHub Pages, Google), and that they are cross-border. Retention. Security. All user rights, how to use them, and the deadlines (2 working days to acknowledge, 15/20/10 days). How to withdraw consent. How to delete and export. The **Limited Use statement**. Age 16+. 72-hour breach handling. Version and effective date. Vietnamese and English. Linked from inside the app too. | https://developers.google.com/terms/api-services-user-data-policy, the restricted-scope verification page, Law 91 Art. 9, the Decree 356 summaries. Gaps in `web/public/privacy.html:85,133,137-141`. |
| R3 | **Terms of Service page** | Free, non-commercial service with no warranty; can stop. User owns their content; Drive files stay in the user's Drive. Acceptable use. Minimum age 16. Can suspend accounts. Governing law. Contact. | https://support.google.com/cloud/answer/15549049 (stricter reading), Law on Children |
| R4 | **Consent step at first sign-in** | Shown before any processing beyond sign-in. Unticked checkbox(es), one per purpose (core service; location as a separate, optional item asked in context). Links to R2 and R3. Store consent version and timestamp in the database, with `GRANT`s if the table is created after 2026-10-30. | Law 91 Art. 9 (separate per purpose, silence ≠ consent, provable); Supabase changelog 45329 |
| R5 | **"Privacy & data" section in Settings** | Links to R2 and R3. **Export my data** (JSON download). **Withdraw consent**. **Delete account**: needs a new server endpoint using the service role, cascade deletes, removing `google_credentials`, revoking the Google token, and saying that Drive folders stay unless the user removes them. A contact point (email) for other requests. | Law 91 rights + Decree 356 deadlines; https://supabase.com/docs/reference/javascript/auth-admin-deleteuser. Missing today: `SettingsPage.tsx:46-56,148`, `server/wheretogo_api/routes/*` |
| R6 | **Drive permission explainer and re-grant screen** | Shown when `drive.file` was unticked on Google's per-scope consent: explain the loss (no photos or backups), offer to grant again, keep the rest of the app working. | https://developers.google.com/identity/protocols/oauth2/resources/granular-permissions, https://developers.google.com/identity/protocols/oauth2/policies |
| R7 | **"Open in browser" screen for in-app browsers** (Zalo, Messenger, FB, IG) | Google sign-in and install both fail inside them; show how to open the link in Safari or Chrome. | Google "Use secure browsers" policy, `disallowed_useragent` (sources in 1.6) |
| R8 | **Sign-in screen or section** | A Google button that follows the branding guidelines (text, G logo, light/dark colors). A line such as "Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách quyền riêng tư" ("By continuing, you agree to the Terms and Privacy Policy") with links. | https://developers.google.com/identity/branding-guidelines |
| R9 | **Config steps** (no page) | Publish to In production (avoids the 7-day refresh-token expiry and the 100 test-user limit). Turn Supabase sign-ups back on (retire D24 and D-13). Re-word the `signup_disabled` message. | Sections 1.2 and 2 |
| R10 | **Location permission explained before the browser prompt** | One sentence on purpose, plus whether the position is stored. | Decree 356 (location reportedly sensitive) |
| R-cond | **Only if brand verification is wanted** (name and logo instead of "supabase.co") | Custom domain on GitHub Pages, DNS-verified as a Domain property by the project Owner. Move R1, R2 and R3 there. Plus either a Supabase custom domain (paid) or a switch to Google's own sign-in with `signInWithIdToken`. Without this: publish without a logo and have R1 explain the "`<ref>.supabase.co`" text on Google's screen. | Sections 1.3 and 1.5 |

## Nice to have
- **N1. Install guide page** (e.g. `#/cai-dat-ung-dung`).
  - Detect the platform automatically.
  - iOS 26 Compact layout (••• → Share → Add to Home Screen → Open as Web App → Add), iOS 26 Bottom/Top, iOS 16.4-18 (Share button), Chrome on iOS, Android Chrome (install button or ⋮ → Install app), Samsung Internet.
  - Screenshots of each step.
  - "Sign in again after installing."
  - Hidden when already running standalone.
  - Sources: Apple, WebKit, MacRumors, MDN, WWDC23 notes.
- **N2. Install offer in the app.**
  - Android: `beforeinstallprompt` button. iOS: a hint that links to N1.
  - Dismissible; shown after a value moment (for example the 3rd saved place).
  - https://web.dev/articles/promote-install
- **N3. FAQ / Help page:** why Drive is needed, where photos live, offline use, how to delete, what "`<ref>.supabase.co`" on Google's screen means, the limits of a free service.
- **N4. About / Contact page** and a "What's new" changelog.
- **N5. First-run onboarding** after consent: Drive explainer, choosing categories and tags.
- **N6. 404 / unknown-route page and offline page** (the repo already redirects unknown hashes to `#/login`, per `docs/PLAN.md:1000`).
- **N7. Open Graph tags, meta description and preview image** in `web/index.html` for Zalo and Facebook link previews. Currently none (`web/index.html:3-11`).
- **N8. No cookie banner** if there are no trackers or analytics. This is my inference, not a sourced rule. Still mention auth and cache storage (localStorage/IndexedDB) in R2.
- **N9. Short internal "incident response" note** for the owner (72-hour A05 notice). This is a document, not a page.
- **N10. Avoid ads, donations or payments** unless moving Vercel to Pro and re-checking the GitHub Pages terms.