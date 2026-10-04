# BAP Recruiting — "Top 8 AI Security Best Practices" mapped to your app

**Date:** 2026-07-03

That list is written for teams that **train and serve machine-learning models**. BAP is a Supabase-backed web app with no ML model, no training pipeline, and no inference API. So several items have no analog here — and it's more honest to say so than to invent work. Below is each of the 8, what (if anything) it maps to for BAP, and its status.

| # | Article item | Applies to BAP? | Status |
|---|---|---|---|
| 1 | **Data poisoning** (malicious data into a training set) | ✗ No training pipeline. Weak analog: validating user-entered data. | Inputs are constrained by DB schema + escaped on render. No ML to poison. |
| 2 | **Adversarial attacks** (perturbed inputs fool a model) | ✗ No model to fool. | N/A |
| 3 | **Model theft** (extract a proprietary model) | ✗ No model. Analog: protecting your API + curated dataset. | Auth = Supabase; RLS locks data; `colleges` dataset now login-only. ✅ |
| 4 | **Data privacy** (RBAC, encryption, audits) | ✔ **Directly applies.** | RBAC = RLS (done ✅). TLS in transit + at-rest encryption = Supabase default ✅. Audits = this review ✅. MFA = available, see below. |
| 5 | **Governance & accountability** (audit trails) | ~ Partial analog. | Supabase logs API/auth events. App has no in-app audit trail. See below. |
| 6 | **Supply-chain risk** (third-party deps) | ✔ **Directly applies — real gap.** | Floating `@2` Supabase script, no SRI on any CDN dep. **Action below.** |
| 7 | **Securing APIs & endpoints** (auth, input validation, rate limiting) | ✔ Applies via Supabase. | Auth ✅, RLS ✅. Rate limiting = Supabase platform default. Input validation = partial. |
| 8 | **Resource jacking** (cryptomining on your infra) | ✗ You run no compute infra; Supabase manages it. | N/A |

**Bottom line:** 4 of the 8 are N/A (they need an ML system). Of the 4 that apply, #3, #4, and #7 are essentially **already covered** by the auth + RLS + XSS work you've done. The one genuine remaining gap is **#6 Supply chain**, plus two optional defense-in-depth additions (a Content-Security-Policy and MFA/audit logging).

---

## The remaining, actually-applicable work

### 🟠 #6 — Supply chain (real gap, worth doing)
Your page loads code from third parties with no integrity pinning:

| Dependency | Current | Risk | Fix |
|---|---|---|---|
| `@supabase/supabase-js@2` (jsdelivr) | **floating** major version | a future compromised 2.x is auto-pulled and runs with full app access | pin an exact version **you've tested** + add SRI hash |
| `qrcodejs/1.0.0` (cdnjs) | pinned ✅ | tamper if CDN compromised | add SRI hash |
| Google Fonts CSS | floating | low (styles only) | optional |

**How to fix (do this yourself so the version is one you've tested):**
1. Pick the exact Supabase version currently working for you, e.g. `@supabase/supabase-js@2.45.4` (check your `package`/network tab for the real number).
2. On jsdelivr/cdnjs each file has a **"SRI" copy button** — grab the `sha384-…` hash.
3. Update the tags:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"
        integrity="sha384-REPLACE_WITH_REAL_HASH" crossorigin="anonymous"></script>
```
and the QRCode tag likewise. If the hash doesn't match the served file, the browser **refuses to run it** — that's the protection.

> I did not bake a guessed version/hash in for you: a wrong SRI hash or an untested version bump would break the app on load. This is a 5-minute copy-paste once you grab the real values.

### 🟢 #4 / #7 — Defense-in-depth you can turn on
- **MFA:** Supabase Auth supports TOTP MFA. Enable it in the Supabase dashboard (Authentication → providers/MFA). No code change needed for the basics.
- **Content-Security-Policy (CSP):** a second wall behind the XSS escaping — even if an injection slipped through, CSP limits where scripts can load from and where data can be sent. Because your app relies on inline handlers and inline styles, the CSP must allow `'unsafe-inline'`, so it won't stop inline injection — but it **does** restrict script/`connect`/`frame` **sources**, which blocks an injected script from exfiltrating data to an attacker's server. Ready-to-paste tag (add inside `<head>`):
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-src https://www.youtube.com https://player.vimeo.com;
  object-src 'none'; base-uri 'self'; form-action 'self'">
```
> **One assumption to verify:** `connect-src … *.supabase.co` covers a standard Supabase project (`<ref>.supabase.co`). If you use a **custom domain** for Supabase, add it to that line or the app won't be able to reach the API. This is why I've left it for you to confirm rather than baking it blind — a wrong `connect-src` silently breaks data loading, and I can't browser-test it from here.

### 🟢 #5 — Governance / audit trail (optional, future)
Supabase already logs auth and API events (dashboard → Logs). If you later want an in-app trail ("who changed what, when"), a single `audit_log` table (append-only, RLS: insert-own, no update/delete) written on key mutations would cover it. Not needed at your stage.

### HTTP security headers (hosting-level, not in this file)
These can't go in a `<meta>` tag — set them at your host (Vercel/Netlify/Cloudflare):
- `Strict-Transport-Security` (force HTTPS)
- `X-Frame-Options: DENY` / `frame-ancestors 'none'` (clickjacking)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Second article — Cisco "AI application security" (prompt injection, jailbreaks, model backdoors)

**Verified by code inspection — none of it applies.** I searched the full app for any AI/LLM integration:

| Check | Result |
|---|---|
| Calls to `api.openai.com` / `anthropic` / any LLM endpoint | **none** |
| API keys / `sk-…` / `x-api-key` / `messages.create` | **none** |
| `fetch()` / XHR to any non-Supabase host | **zero** |
| App reads/writes the `ai_evaluations` table | **no** (table exists in DB from an earlier design; unused by the app, RLS-locked to owner) |

Because there is **no model, no prompt, and no inference call in BAP**, every threat in that article is structurally impossible here: prompt injection (direct/indirect), jailbreaks, training-data poisoning, meta-prompt extraction, ML model backdoor, model validation, RAG source scanning, and the "AI application firewall" all require an LLM receiving input inside the app. BAP has none.

**If you ever add an AI feature** (e.g., an assistant that drafts coach emails or auto-summarizes a profile), that article becomes relevant, and the four controls that would matter most:
1. **Never call the LLM from the browser.** Put the API key and the model call in a **Supabase Edge Function**; the client calls your function, the function calls the model. A key shipped in `bap.html` is instantly stolen.
2. **Treat user text sent to the model as untrusted** (prompt-injection): keep system instructions separate, don't let profile/notes text override them, and never let the model's output trigger privileged actions without a check.
3. **Filter the output** before rendering it (it flows through the same `escapeHtml` you now have).
4. **Rate/cost-limit** the function so a user can't run up your model bill (the "cost harvesting / DoS" item).

Until then: nothing to do.

---

## Recommended stopping point
After the two 5-minute items above (pin+SRI the Supabase script, add the CSP once you confirm your Supabase domain, optionally enable MFA), you will have covered every point on that list that a non-ML web app can — on top of verified RLS and centralized XSS protection. That is a genuinely strong posture for a solo-built product. Further hardening past this has diminishing returns.
