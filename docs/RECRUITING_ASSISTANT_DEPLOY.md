# Recruiting Assistant — deploy guide

The chat UI is already built into `bap.html` (自分 → リクルーティングアシスタント). It calls a
Supabase **Edge Function** that holds your model API key. Until you deploy that function
and set the key, the assistant shows a friendly "server setup required" message — the app
does not break.

**Why an Edge Function and not just calling the model from the browser:** an API key shipped
in `bap.html` is scraped and abused within minutes (the exact "no secrets in the client" rule
your security review verified you were clean on). The key must stay server-side.

## Architecture
```
bap.html  →  functions.invoke('recruiting-assistant')  →  Edge Function  →  LLM provider
(sends user's own      (carries the user's                (holds the key,       (Anthropic or
 context + question)    Supabase JWT)                      routes the model)     OpenAI)
```
Read-only. The assistant never writes data or takes actions.

## One-time setup

### 1. Create the rate-limit table
In the Supabase dashboard → SQL editor, run **`assistant_usage.sql`**.

### 2. Add the function — pick ONE of these two ways

The function code is the file I generated for you:
`…/outputs/supabase/functions/recruiting-assistant/index.ts`
(Keep it in that exact folder path — `supabase/functions/recruiting-assistant/` — Supabase requires it.)

**Easiest — Dashboard, no install (do this):**
1. Open your project at **supabase.com/dashboard** → left sidebar → **Edge Functions**.
2. Click **Deploy a new function → Via editor**. Name it exactly `recruiting-assistant`.
3. Open the `index.ts` file above, **copy the whole file**, paste it into the browser editor (replace the sample code), and click **Deploy**.

**Or — Supabase CLI (only if you prefer the terminal):**
1. Install once: `npm install -g supabase` (or `brew install supabase/tap/supabase`).
2. In a terminal, from the folder that *contains* your `supabase/` folder:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy recruiting-assistant
   ```
   `YOUR_PROJECT_REF` is the code in your dashboard URL:
   `https://supabase.com/dashboard/project/`**`<this-part>`**.

### 3. Get an API key, then set it as a secret (never in code)

**Where to get a key** (pick the same provider you'll configure below):
- Anthropic (Claude): **console.anthropic.com** → *API Keys* → *Create Key* → copy the `sk-ant-…` value.
- OpenAI (GPT): **platform.openai.com/api-keys** → *Create new secret key* → copy the `sk-…` value.
- Add a little billing/credit on the provider first, or the calls will fail.
- Copy the key immediately — the provider only shows it once.

**Where to put the secrets — Dashboard, no install (do this):**
Supabase project → **Edge Functions** → **Secrets** (or *Project Settings → Edge Functions → Secrets*).
Click **Add new secret** and add each row below as a **separate** Name / Value pair
(e.g. Name `LLM_PROVIDER`, Value `anthropic`). Add all four for your chosen provider.

**Or** run the CLI commands below instead. Pick ONE provider.

**Anthropic (Claude):**
```bash
supabase secrets set LLM_PROVIDER=anthropic \
  ANTHROPIC_API_KEY=sk-ant-... \
  MODEL_CHAT=claude-3-5-haiku-latest \
  MODEL_DEEP=claude-3-5-sonnet-latest
```

**OpenAI (GPT):**
```bash
supabase secrets set LLM_PROVIDER=openai \
  OPENAI_API_KEY=sk-... \
  MODEL_CHAT=gpt-4o-mini \
  MODEL_DEEP=gpt-4o
```
(`SUPABASE_URL` and `SUPABASE_ANON_KEY` are injected automatically.)
Optional: `ASSISTANT_DAILY_LIMIT=40` (per-user calls/day; default 40).

> Model names change over time — confirm the current model IDs in your provider's docs and update
> the `MODEL_CHAT` / `MODEL_DEEP` secrets. The router sends analytical/comparison questions to
> `MODEL_DEEP` and quick chat to `MODEL_CHAT`, so you control cost vs quality per task.

### 4. Verify
Open the app → 自分 → リクルーティングアシスタント → ask "保存した大学の中で、私の優先順位に合うのはどこ？".
Check the function logs in the dashboard if you get the error message.

## Security controls already built in
- **Auth required:** the function rejects anyone without a valid Supabase user JWT (401).
- **Rate limited per user:** daily cap via `assistant_usage` (RLS-scoped) — protects your bill.
- **Prompt-injection resistant:** the athlete's profile/school/coach text is passed inside a fenced
  `<player_data>` block, and the system prompt instructs the model to treat it as data, not
  instructions, and never reveal the system prompt.
- **Read-only:** no tools, no writes, no actions — it can only talk.
- **Output escaped:** replies render through the app's `escapeHtml`, so a model reply can't inject HTML.
- **No error leakage:** provider/internal errors are logged server-side; the client only sees a
  friendly message.

## To harden later (optional)
- Change `Access-Control-Allow-Origin: "*"` in `index.ts` to your exact app origin.
- Have the function *fetch* the user's data itself (under their JWT) instead of trusting client-sent
  context — stronger, but the current model is safe because it's the user's own data.
- Add a monthly spend cap / alert at the provider.
