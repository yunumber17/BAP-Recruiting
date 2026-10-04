-- ============================================================
-- BAP — Supabase Security Advisor warning fixes
-- Run in: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- Read the comments: a couple of items are optional or need a look, not a blind run.
-- Safe to run more than once.
-- ============================================================

-- 1) HIGH — Internal functions must NOT be callable over the public REST API.
--    * handle_new_user(): runs automatically as a signup trigger. Revoking EXECUTE
--      does NOT break the trigger (triggers run as the definer regardless).
--    * rls_auto_enable(): admin/maintenance helper. Nobody outside should call it.
revoke execute on function public.handle_new_user()  from anon, authenticated, public;
revoke execute on function public.rls_auto_enable()  from anon, authenticated, public;

-- 2) MEDIUM — "get my waitlist" only makes sense for a signed-in user.
--    Keep it for authenticated; remove anon's ability to call it.
revoke execute on function public.get_my_waitlist()  from anon;

-- 3) LOW (hardening) — pin the trigger helper's search_path.
--    set_updated_at() only does NEW.updated_at = now(), so an empty search_path is safe.
alter function public.set_updated_at() set search_path = '';

-- ------------------------------------------------------------
-- INTENTIONALLY LEFT ALONE (no action needed):
--   * public.get_public_profile(text) — powers your share-by-link profile page,
--     so anon SHOULD be able to call it. Just make sure the function body returns
--     only the row matching the token and nothing else.
--   * pg_trgm extension in the public schema — backs your text-search indexes.
--     Moving it can break those indexes; the risk of leaving it is negligible. Skip.
-- ------------------------------------------------------------

-- 4) VERIFY (not a fix) — make sure anon CANNOT read the waitlist (email leak check).
--    The "insert always true" policy is fine for public signups. The danger would be
--    a SELECT policy that lets anon read everyone's entries. Run this and inspect:
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'waitlist'
order by cmd;
--    -> If you see a SELECT (cmd = 'SELECT') policy whose roles include 'anon',
--       that exposes signups. If so, drop or tighten it, e.g.:
--       drop policy "<the_select_policy_name>" on public.waitlist;
--       (Only do this after confirming the app doesn't rely on anon reading it.)
