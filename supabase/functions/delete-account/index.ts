// ============================================================================
// BAP Recruiting — Account Deletion Edge Function
// Deletes the signed-in user's data AND their auth account, server-side.
// The browser can delete its own DATA rows (RLS lets you delete your own),
// but it CANNOT delete its own auth.users record — that needs the service role,
// which must never be exposed client-side. So this runs here.
//
// Supabase injects SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY
// into every Edge Function automatically — no secrets to set by hand.
//
// DEPLOY (from your project root, with the Supabase CLI):
//   1. Put this file at:  supabase/functions/delete-account/index.ts
//   2. Run:               supabase functions deploy delete-account
// The app calls it with:  BAP.client.functions.invoke('delete-account')
// (supabase-js attaches the caller's JWT, so we can identify exactly who to delete.)
// ============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// Tables that hold user data, keyed by player_id = auth.uid().
// Best-effort: if a table doesn't exist or doesn't have this column, we skip it.
// (If your foreign keys are ON DELETE CASCADE, deleting the auth user already
//  removes these — this loop is just belt-and-suspenders so nothing is orphaned.)
const PLAYER_TABLES = [
  "saved_colleges",
  "favorite_colleges",
  "performance_metrics",
  "coach_contacts",
  "coach_messages",
  "recruiting_documents",
  "videos",
  "improvement_goals",
  "tasks",
  "player_seasons",
  "email_drafts",
  "assistant_usage",
  "events",
  "public_profiles",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Identify the caller from their JWT (never trust a uid sent in the body).
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "missing authorization" }, 401);

    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "invalid session" }, 401);
    const uid = user.id;

    // 2. Admin client (service role) — bypasses RLS to remove data and the account.
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3. Delete the user's data rows (best-effort per table).
    for (const table of PLAYER_TABLES) {
      try {
        await admin.from(table).delete().eq("player_id", uid);
      } catch (_) { /* table absent or different shape — skip */ }
    }
    try {
      await admin.from("players").delete().eq("id", uid);
    } catch (_) { /* skip */ }

    // 4. Delete the auth account itself. This is the step the client cannot do.
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) return json({ error: delErr.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
