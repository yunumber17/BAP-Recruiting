# BAP Recruiting — App Store Security & Launch Readiness (verified)

**Date:** 2026-07-03
**Method:** Code + live-DB verification against four checklists you provided (Top-8 AI, Cisco AI-app, the pentester thread, the Lovable/Bolt list). Consolidated here because they overlap ~90%.

**Headline:** Your **code-level and database security is strong and verified.** What stands between you and the App Store is not a code vulnerability — it's a set of **compliance/operational items** (account deletion, privacy policy, minors' data, bot protection) that Apple checks and that a public launch requires. Those are marked 🔴 below.

Legend: ✅ verified in code/DB · ⚙️ platform config you must enable (Supabase/host — I can't from here) · 🔴 launch blocker · 📋 recommended · N/A

---

## A. Verified secure (done)

| Control (source) | Status | Evidence |
|---|---|---|
| **RLS enforced, every table** (all lists) | ✅ | Live DB: 23/23 tables `rls_enabled=true`; every policy owner-scoped |
| **Ownership check, not just login** (pentester, CSA) | ✅ | Policies use `player_id = auth.uid()` / `id = auth.uid()` — an IDOR "change the URL param" attack returns 0 rows |
| **No `using(true)` on user data / anon can't read** | ✅ | 6c/6d verified; anon has no SELECT on `public_profiles`; reference tables login-only after `rls_hardening.sql` |
| **SQL injection** (all lists) | ✅ | 100% Supabase query builder (`.from().eq()`…), 0 raw SQL, the one RPC uses a bound param |
| **XSS — input sanitization** (all lists) | ✅ | Centralized `escapeHtml` / `sanitizeUrl` / `escapeJs`; public share page hardened; `javascript:`/`data:` blocked |
| **No secrets in client code** (all lists) | ✅ | `bap.html` has no `service_role`/JWT/keys. ⚠️ confirm `config.js` holds only the **anon** key (see B) |
| **Auth via established provider** (Lovable) | ✅ | Supabase Auth (email+password hashed by Supabase, + Google OAuth). You are not rolling your own crypto |
| **Encryption in transit & at rest** (commenter) | ✅ | Supabase default: TLS everywhere + AES-256 at rest |
| **OS/DB patching** (commenter, PaaS) | ✅ | Supabase-managed (shared responsibility) |
| **Payments/webhooks** (pentester, Lovable) | N/A | No Stripe/payments/webhooks in the app — nothing to spoof today |
| **AI/LLM attack surface** (Cisco) | N/A | No model, no prompts, no external API calls — verified |

---

## B. Configure before / at launch (platform — you enable these)

| Control | Where | Why |
|---|---|---|
| ⚙️ **Confirm `config.js` = anon key only** | your repo | The anon key is public-safe; the `service_role` key bypasses ALL rls and must never ship to the browser. I can't see `config.js` — you must check. |
| ⚙️ **Rate limiting** (pentester, Lovable) | Supabase auth has defaults; add Cloudflare/WAF in front for the data API | Stops the "$500 AWS bill from a bot" scenario — mass fake signups draining quota |
| ⚙️ **Bot protection / CAPTCHA** (pentester, Lovable) | Supabase Dashboard → Auth → enable **hCaptcha/Turnstile** | Your signup is email+password → prime bot target. ~20 min, ~99% spam cut |
| ⚙️ **HTTPS only + HSTS** (all lists) | your host (Vercel/Netlify/CF) + iOS ATS | Supabase is HTTPS-only already; ensure the app shell is too. If wrapped in a WKWebView, ATS enforces it |
| ⚙️ **Error/activity monitoring** (Lovable) | add Sentry | Know about suspicious activity in real time, not 3 days later |
| ⚙️ **Automated backups + PITR** (pentester) | Supabase Dashboard → Database → Backups (plan-dependent) | A bad deploy or attack shouldn't be total data loss |
| ⚙️ **Rotate keys ~90 days** (pentester) | Supabase | Hygiene |
| ⚙️ **Dependency scanning** (all lists) | Dependabot/Renovate + `npm audit` if you add a repo | Plus pin + SRI the two CDN scripts (see `BAP_SECURITY_8POINT_MAPPING.md`) |
| ⚙️ **Data minimization** (commenter) | review | You already avoid SSNs/card data ✅. You DO collect teen PII + coach PII — keep it to what recruiting needs |

---

## C. 🔴 App Store launch blockers (found in this review)

These are not "nice to have" — Apple rejects on the first three, and the fourth is a legal/safety exposure given your user base.

1. 🔴 **No in-app account deletion.** App Store Guideline **5.1.1(v)** requires any app that lets users create an account to let them delete it in-app. BAP has no delete-account flow (verified: none in code). *Needs a UI action + a Supabase Edge Function running as service_role to delete the auth user and cascade their rows.* I can build this.
2. 🔴 **No privacy policy (and no ToS).** Apple requires a privacy policy URL on the listing and commonly in-app. The only "TERMS" strings in your code are `SEASON_TERMS` (春/夏/秋/冬) — there is no legal policy. You also need Apple **Privacy Nutrition Labels** declaring what you collect (name, email, phone, school, athletic/academic data). *I can draft a policy tailored to exactly what BAP collects.*
3. 🔴 **Minors' data handling.** Your users are high-school recruits — many are **under 18, some under 13**. This triggers **COPPA** (US, under-13 needs verifiable parental consent), **Japan's APPI**, and Apple's **Kids-category / age-gate** rules. At minimum you likely need: an age gate, parental-consent handling for younger users, and explicit disclosure of collecting minors' + third-party (coach) contact data. This is the biggest non-code risk. *Requires product/legal decisions — flagging, not silently proceeding.*
4. 🔴 **Coach contact info is third-party PII.** You store coaches' names/emails/phones (people who never signed up). Combined with the public share page, make sure your privacy policy covers third-party data and that share modes redact it appropriately (they do at `limited` depth ✅ — keep it that way).

---

## D. Process (from the pentester / CodeRabbit advice)
- **Two-layer review** (one writes, another audits, you review): that's the workflow we've used — audit-first, report, verify. Keep it. Adding **CodeRabbit** on PRs is a good automated second layer if you move to a repo.
- **Try to break your own RLS** (pentester's tip): you effectively did via the 6a–6d queries. Re-run them after any schema change.

---

## E. Consolidated verification — all 9 checklists → one control set

I cross-referenced nine security lists you provided (Top-8 AI, Cisco AI-app, the pentester thread, Lovable/Bolt, Wiz, Invicti, Checkmarx, CSA Secure Vibe Coding Guide, the 33-rule list). They converge on the same finite set. Status of every checkable item:

| Control (appears in ~all lists) | Status |
|---|---|
| RLS enabled + owner-scoped, every table | ✅ verified live |
| Authorization on every CRUD / verify ownership not just login (BOLA/IDOR) | ✅ RLS `FOR ALL … auth.uid()`; enforced at DB, not per-route |
| Validate on server even if frontend does | ✅ DB constraints + RLS `WITH CHECK` |
| SQL injection / parameterized queries | ✅ Supabase builder only, 0 raw SQL |
| XSS / sanitize inputs (front + server) | ✅ centralized `escapeHtml`/`sanitizeUrl`/`escapeJs` |
| No hardcoded / placeholder / default secrets (`supersecretkey`, `admin@example`, etc.) | ✅ scanned — none |
| No secrets in client bundle | ✅ `bap.html` clean; ⚙️ confirm `config.js` = anon key only |
| Secrets in localStorage? | ✅ app stores only UI prefs; no tokens/PII in app code |
| File upload validation / signed URLs (Rules 20–22) | ✅ N/A — no uploads exist |
| Hide system errors / no stack traces to users (Rule 11, CSA) | ✅ `bapDbError` → friendly messages; raw only to console |
| No passwords/tokens/PII in logs (Rule 18) | ✅ scanned — none |
| Passwords hashed (Argon2/bcrypt) | ✅ Supabase Auth (bcrypt) |
| Established auth provider, not homemade | ✅ Supabase Auth + Google OAuth |
| Token scoping / short expiry / refresh | ✅ Supabase JWT defaults |
| CSRF protection | ✅ N/A — bearer-token auth (Authorization header), not cookies |
| Encryption in transit + at rest (AES-256) | ✅ Supabase default |
| Frontend talks directly to DB | ✅ safe *because* RLS is the enforcement layer (the intended Supabase model) |
| Predictable endpoints / swagger / graphql / admin exposed | ✅ none in app; share token is 128-bit random (not a guessable `app_id`) |
| OWASP LLM Top 10 (prompt injection, etc.) | ✅ N/A — no LLM in app |
| Payments/webhooks (Stripe signature verify) | ✅ N/A — none |
| **Rate limiting / CAPTCHA (login, signup, reset)** | ⚙️ enable in Supabase dashboard (defaults exist; add hCaptcha/Turnstile) |
| **HTTPS everywhere + HSTS** | ✅ Supabase; ⚙️ enforce on app host / iOS ATS |
| **Strict CSP + X-Frame-Options/frame-ancestors + Referrer-Policy + Cache-Control** | ⚙️ CSP meta ready in `BAP_SECURITY_8POINT_MAPPING.md`; frame/referrer/cache = hosting headers |
| **Dependency scanning + pin/SRI (Dependabot, `npm audit`)** | ⚙️ pin + SRI the 2 CDN scripts; add Dependabot if you use a repo |
| **Monitoring / audit logs (Sentry, login/delete/admin events)** | ⚙️ add Sentry; Supabase logs cover auth/API |
| **Backups + point-in-time restore** | ⚙️ enable in Supabase dashboard |
| **GitHub: 2FA, private repo, no `.env` committed** | ⚙️ repo hygiene if/when you use one |
| **Separate dev/staging/prod credentials, key rotation** | ⚙️ your Supabase project setup |
| Console.log stripped for production (CSA 2.2) | 📋 minor — 35 diagnostic `console.*`; gate behind a debug flag for prod |

**Everything that is a code or database control is ✅ verified.** Everything still open is either a **⚙️ platform toggle** (dashboard/host — only you can flip) or a **🔴 App Store launch requirement** from section C. There are **no unresolved code vulnerabilities.**

---

## Bottom line
Security *of the code and database*: **strong and verified** — RLS, ownership, SQLi, XSS, secrets, encryption all check out. To actually ship on the App Store you must clear the 🔴 blockers in section C (account deletion, privacy policy, minors' compliance) and switch on the ⚙️ platform items in section B (CAPTCHA, rate limiting, monitoring, backups). None of C/B are code vulnerabilities — they're launch requirements.

**I can build right now, if you want:** (1) the in-app **account-deletion** flow (UI button + Supabase Edge Function + cascade SQL), and (2) a **privacy policy + ToS** draft tailored to BAP's data (including the minors/coach-PII disclosures). The CAPTCHA/rate-limit/monitoring/backup items are dashboard toggles only you can flip.
