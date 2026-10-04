# BAP Recruiting — Production Launch Checklist

Everything that must be true in the **production** environment before the App Store /
public launch. Grouped so you can work top-to-bottom. Check each box only after you've
verified it in the real prod project (not locally).

## 1. Supabase production project
- [ ] Using the intended **production** project (not the dev project) — confirm the URL/ref.
- [ ] `config.js` in the deployed build points to the **prod** `SUPABASE_URL` + **anon** key.
- [ ] `service_role` key is **NOT** in the client bundle anywhere (only anon key client-side).
- [ ] **RLS enabled** on every table with data (players, tasks, events, coach_contacts,
      coach_messages, performance_metrics, improvement_goals, recruiting_documents, videos,
      saved_colleges, favorite_colleges, email_drafts, player_seasons, public_profiles,
      assistant_usage). Owner-scoped policies (`player_id = auth.uid()`).
- [ ] Point-in-time recovery / **daily backups enabled** (Supabase → Database → Backups).

### Run ALL migrations against prod (order doesn't matter unless noted)
- [ ] `rls_hardening.sql`
- [ ] `fix_player_scores_view.sql`
- [ ] `add_room_board_column.sql`
- [ ] `assistant_usage.sql`
- [ ] `add_recruiting_level_column.sql` → then the 7 data files:
      `update_recruiting_level_d1_batch1/2/3.sql`, `_d2.sql`, `_naia.sql`, `_juco.sql`, `_d3.sql`
- [ ] `fix_document_status.sql`  ← 書類 buttons (workflow depends on it)
- [ ] `fix_saved_colleges_id.sql`  ← saved-school remove/rating/stage (workflow depends on it)
- [ ] `fix_onboarding_metric_keys.sql`  ← already run per Tomo
- [ ] Metric label updates: `update_fastball_label.sql`, `update_poptime_label.sql`, `update_throwing_label.sql`
- [ ] Confirm the public-share objects exist: `public_profiles` table + `get_public_profile` RPC.
- [ ] Sanity query after: `select division::text, count(*) total, count(recruiting_level) real from public.colleges group by division::text;` → real = total for D1/D2 (others as expected).

## 2. Auth configuration
- [ ] **Email confirmation** ON (Authentication → Providers → Email → Confirm email).
- [ ] **Custom SMTP (Resend)** configured and the sending domain is **Verified** in Resend.
- [ ] Email templates set + branded: **Confirm signup** (use `email_confirm_signup_ja.html`)
      and **Reset password**.
- [ ] **Redirect URLs allowlisted** (Authentication → URL Configuration): your production app
      origin **and** localhost — required for the new password-reset link to return correctly.
- [ ] **Google OAuth** configured for prod: client ID/secret set, authorized redirect URI added.
- [ ] Test: sign up with a fresh email → confirmation arrives → can log in.
- [ ] Test: **forgot password** → reset email arrives → link opens the set-new-password screen → new password works.

## 3. Edge Function (AI assistant)
- [ ] `recruiting-assistant` deployed to prod.
- [ ] Secrets set on prod: `LLM_PROVIDER=openai`, `OPENAI_API_KEY`, `MODEL_CHAT`, `MODEL_DEEP`.
- [ ] `assistant_usage` table exists (daily rate limit) with RLS.
- [ ] Test: assistant returns a real answer for a signed-in user; rate limit works.

## 4. Analytics (currently NOT installed — decide before launch)
- [ ] Pick one lightweight, privacy-friendly analytics tool (e.g. Plausible or PostHog).
- [ ] Track the launch-critical funnel: signup started → onboarding completed → survey completed
      → first school saved → assistant used → profile shared. (These are the numbers that tell
      you whether onboarding/clarity is working — which is where early apps lose people.)
- [ ] Verify events actually fire in prod.

## 5. Legal + support (App Store requires these)
- [ ] **Privacy Policy** published at a public URL (App Store requires the link). Must cover:
      data collected (profile, metrics, email), Supabase storage, no selling of data, and how a
      user can delete their account/data.
- [ ] **Terms of Service** published at a public URL.
- [ ] Both linked from inside the app (a footer/settings link) and from the marketing site.
- [ ] **Support email** live and monitored (e.g. support@ballersacrosspacific.com) and shown in-app.
- [ ] Account deletion path available (App Store now requires in-app account deletion).

## 6. App assets
- [ ] App icon finalized (all required iOS sizes) — the BAP emblem.
- [ ] Splash / launch screen finalized.
- [ ] App Store screenshots (required sizes) — show onboarding, マッチング率, School Hub, share.
- [ ] App Store copy: name, subtitle, description (Japanese-first), keywords.

## 7. iOS wrap → TestFlight (if wrapping the web app)
- [ ] Wrapper chosen (Capacitor / WKWebView). App loads the web build offline-tolerant or from host.
- [ ] Bundle ID + Apple Developer signing/provisioning set.
- [ ] `Info.plist`: ATS (all traffic HTTPS — Supabase is), no unused permission strings.
- [ ] Safe-area insets respected (already using `env(safe-area-inset-*)` in the toast; verify screens).
- [ ] App Store privacy "nutrition labels" filled to match the Privacy Policy.
- [ ] TestFlight build uploaded; internal testers can install and complete the full flow.
- [ ] Test on a real **iPhone** and a real **Android** width (keyboard overlap on onboarding inputs,
      safe areas, the long 送付用（コーチ・大学）tab label, scroll on the full college list).

## 8. Final pre-launch live QA (the "first-time athlete" walkthrough)
Run the whole journey on prod once, top to bottom, nothing mocked:
- [ ] Create a brand-new account → onboarding (position player AND pitcher) → confirm マッチング率
      uses the entered metrics immediately.
- [ ] Complete the School Match Survey → recommendations change.
- [ ] Search / sort by マッチング率 / save / remove a school.
- [ ] Add a coach interaction → School Hub reflects it.
- [ ] Generate + open the public share page → confirm coach mode shows **no** 志望校 list.
- [ ] Resume / PDF export opens.
- [ ] Log out → log back in the next day → **all data persists**.

---

### Status right now
- **Code:** app is feature-frozen and stable; Forgot Password added this pass. 17/20 workflows
  code-verified PASS.
- **Blocking on you:** the live/prod items above — especially running every migration on prod,
  the auth redirect-URL config, analytics install, and the legal pages. Those are the real
  remaining launch blockers, not more code.
