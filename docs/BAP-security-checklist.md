# BAP Security Checklist

A prioritized, do-it-yourself security guide for Ballers Across Pacific.
Your stack: Supabase (auth + Postgres + edge functions), the OpenAI-powered
recruiting assistant, the web app at app.ballersacrosspacific.com, and the iOS app.

The order matters. The Priority 0 items prevent the attacks that actually happen
to apps like yours. Monitoring (Priority 2) only tells you after the fact, so do
the top section first.

---

## Priority 0 — Do today (prevents the real attacks)

### 1. Confirm Row Level Security (RLS) is ON for every table
This is the single most important thing. Your app ships with a public "anon" API
key (it is inside the app, so treat it as NOT secret). Without RLS, anyone who
copies that key can read or write your entire database. With RLS, each user can
only touch their own rows.

Fastest way to check:
- Supabase Dashboard → your project → **Advisors → Security Advisor**.
- It lists every table that has RLS disabled as an error. The goal is zero errors.
- For any flagged table: **Database → Tables →** open the table → toggle
  **Enable RLS**, then add policies so users only see their own rows
  (a policy like `auth.uid() = user_id` on select/insert/update/delete).

Do NOT leave a table with RLS off "just for now." That is the classic breach.

### 2. Make sure your service_role key has never been exposed
- **Settings → API.** There are two keys: `anon` (public, fine to ship) and
  `service_role` (full admin, bypasses RLS — must stay secret).
- The service_role key must ONLY live in server-side edge functions / secrets,
  never in the iOS app, the web bundle, or any public GitHub repo.
- If you are unsure whether it leaked, rotate it: **Settings → API → Reset**.

### 3. Turn on two-factor authentication (2FA) everywhere
The account is a bigger target than the app. Enable 2FA on:
- Supabase
- Apple / App Store Connect (Apple ID)
- GitHub (if your code is there)
- Your domain registrar (whoever holds ballersacrosspacific.com)
- The email address tied to all of the above

### 4. Set hard spend caps so an attack fails cheaply
A cost spike is often the first sign of abuse. Cap it in advance:
- **OpenAI** (for the recruiting assistant): dashboard → **Settings → Limits →**
  set a monthly budget and a lower "notification" threshold. This stops someone
  hammering your assistant from running up a huge bill.
- **Supabase**: **Settings → Billing / Cost Control →** enable the **Spend cap**
  so usage-based charges can't run away.

---

## Priority 1 — This week

### 5. Rate-limit the recruiting assistant edge function
Right now, if someone finds the assistant endpoint, they can call it in a loop
(your cost + OpenAI abuse). Add a simple per-user limit inside the function:
require an authenticated user, and reject if that user has made more than N
requests in the last minute/hour. (I can write this code for you — just ask.)

### 6. Lock down who can reach the edge functions
- Require a valid Supabase auth token on every function (no anonymous calls).
- Never trust input from the app blindly — validate it server-side.

### 7. Confirm auth settings
- **Authentication → Providers / Settings:** make sure email confirmation is on,
  and password requirements are reasonable.
- Consider enabling Supabase's built-in bot/abuse protection (CAPTCHA) on signup
  if you see junk accounts.

---

## Priority 2 — Ongoing (how you'd actually notice a breach)

Spend two minutes a week glancing at these. You are looking for spikes that don't
match real user growth.

- **Supabase → Authentication → logs:** a flood of failed logins or a burst of
  new signups from one IP = credential stuffing or bots.
- **Supabase → Reports:** API request volume and database egress. A jump with no
  matching jump in real users = scraping or an attack.
- **Supabase → Edge Functions → logs:** unusual call volume on the assistant.
- **OpenAI usage dashboard:** a cost/usage spike you can't explain.
- **Your billing pages (Supabase + OpenAI):** unexpected cost is the loudest
  and most reliable alarm. This is why the spend caps in step 4 matter.

Optional: add an uptime monitor (e.g. a free service that pings
app.ballersacrosspacific.com) so you're told immediately if the site goes down.

---

## If you think you've been breached

1. Don't panic or delete logs — you'll want them.
2. Rotate keys: **Settings → API → Reset** the service_role key; consider rotating
   the anon key too (requires an app update).
3. Force-log-out users if account data may be compromised (Supabase can revoke
   sessions), and reset affected passwords.
4. Check the **Advisors → Security Advisor** again for any table left without RLS —
   that's the most likely entry point.
5. If real user data (emails, profiles) was exposed, you may have a legal duty to
   notify affected users depending on your region. Document what happened and when.

---

## The 5-minute version (if you only do a few things)

1. Advisors → Security Advisor shows **zero** RLS errors.
2. service_role key is not in the app or any public repo.
3. 2FA on Supabase, Apple, email, domain registrar.
4. Spend caps set on OpenAI and Supabase.
5. Rate limit on the assistant function.

Do those five and you've closed the doors that actually get kicked in.
