# @bap/ai-recruiting-advisor

An AI **service layer** — not a chatbot — of specialized recruiting advisors.
Provider-agnostic, streaming, structured JSON outputs. It consumes the other
packages **through interfaces only**; neither the Recruiting Score Engine nor the
Schools table is connected (clean adapters make that a later, refactor-free swap).

- **13 specialized advisors** (player development, recruiting strategy, academic,
  email, mental performance, parent, coach communication, timeline, profile,
  video review, goal planning, interview, scholarship) — 6 with tailored prompts,
  all sharing one typed engine.
- **Provider abstraction** — `LLMProvider` with OpenAI- and Anthropic-compatible
  adapters (built on an injectable `HttpTransport`) and a deterministic
  `ScriptedProvider`. Nothing calls a vendor SDK directly.
- **Structured output** — every advisor returns validated JSON
  (summary, recommendations, priority, confidence, action items, risks,
  follow-up questions, facts) — never raw text.
- **Context engine** — a `ContextBuilder` over mocked data providers (profile,
  metrics, scores, schools, timeline, tasks, contacts, videos).
- **Memory** — short-term (rolling window) + long-term (preferences/goals/summary).
- **Streaming** — SSE + WebSocket adapters, with `AbortSignal` cancellation.
- **Safety** — prompts forbid fabricating NCAA rules; a post-processor forces
  facts to be labeled known/likely/unknown and attaches verify-source disclaimers.
- **Strict TypeScript**, no `any`, DI throughout, **18 tests** (all green,
  offline via the scripted provider).

## Quick start
```bash
npm install
npm run typecheck
npm test
```
```ts
import { createAdvisorContainer } from '@bap/ai-recruiting-advisor';

const { service } = createAdvisorContainer();               // offline defaults
const res = await service.ask('player-development', {
  playerId: 'player-uuid',
  message: 'What should I improve?',
});
res.output.summary;          // structured, validated
res.output.recommendations;  // prioritized with confidence

// streaming
for await (const evt of service.askStream('email', { playerId, message: 'initial email to Tampa' })) {
  if (evt.type === 'delta') process.stdout.write(evt.text);
  else console.log(evt.result.output.email); // editable email object
}
```

## Wiring real providers / context
```ts
createAdvisorContainer({
  provider: new OpenAICompatibleProvider({ baseUrl, apiKey, model }, httpTransport),
  contextProviders: { profile: realProfileAdapter, metrics: realMetricsAdapter /* … */ },
});
```

## Layout
```
src/
  models/       common types, structured output schema, errors
  providers/    LLMProvider + OpenAI/Anthropic adapters + ScriptedProvider
  prompts/      renderer + shared safety + per-advisor templates (data, not code)
  context/      data-provider interfaces + mocks + ContextBuilder
  memory/       short-term + long-term memory
  advisors/     generic Advisor engine + extended output schemas + safety
  tools/        Tool interface + FindImprovementAreas + ExplainRecruitingScore (declared)
  services/     AdvisorService (router)
  api/          SSE / WebSocket streaming + cancellation
  di/           composition root (offline defaults + overrides)
docs/           AI_ARCHITECTURE · PROMPT_GUIDE · ADVISOR_OVERVIEW · CONTEXT_ENGINE · FUTURE_AI_INTEGRATION
```

See `docs/FUTURE_AI_INTEGRATION.md` for exactly where each advisor connects to the
Score Engine, College Database, Recommendation Engine, Dashboard, Backend
Services, Timeline Engine, and Import Pipeline — with no refactoring.
