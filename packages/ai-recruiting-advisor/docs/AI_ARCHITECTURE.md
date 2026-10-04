# AI Architecture

## Layers
```
AdvisorService (router)
  └─ Advisor<T>  (generic engine, one per kind)
       ├─ PromptTemplate            (system/developer/safety/few-shot/output — DATA)
       ├─ ContextBuilder            (fetch only the slices the advisor needs)
       │    └─ Context data providers (interfaces; mocked now, real later)
       ├─ Memory (short + long term)
       ├─ LLMProvider               (Scripted | OpenAI | Anthropic — interface)
       ├─ zod output schema         (validate → structured result)
       └─ SafetyGuard               (label facts, add verify disclaimers)
```

## Principles
- **Not a chatbot.** Each advisor is a bounded, typed capability with its own
  prompt template, required context, and output schema.
- **Interfaces only.** Advisors depend on `LLMProvider`, `ContextBuilder`, and
  memory interfaces — never on a vendor SDK, the score engine, or Prisma.
- **Prompts are data.** They live in `prompts/registry.ts`, not inside services,
  so they can be edited/versioned/AB-tested without code changes.
- **Structured output always.** The provider returns text; the advisor parses +
  zod-validates it into a typed object. Invalid output → `OutputParseError`.
- **DI everywhere.** `createAdvisorContainer` wires defaults (offline) and takes
  overrides for real providers/context.

## Request lifecycle (`AdvisorService.ask`)
1. Router selects the `Advisor` for the kind.
2. `ContextBuilder.build(playerId, template.requiredContext)` fetches only the
   needed slices in parallel (failures degrade gracefully).
3. Long-term memory + recent turns are loaded.
4. `renderPrompt` assembles system(+safety) / developer(+output schema) /
   few-shot / context / memory / user message.
5. `provider.complete({ json: true, metadata: { advisorKind } })`.
6. Parse → zod validate → `applySafety` → return `AdvisorResult<T>`.
7. Turn stored in short-term memory.

Streaming (`askStream`) is identical but yields `delta` events while buffering,
then emits a validated `final` event; `AbortSignal` cancels mid-stream.

## Provider abstraction
`LLMProvider { complete, stream }`. Adapters:
- `OpenAICompatibleProvider` — `/chat/completions`, merges `developer`→system,
  supports `response_format: json_object`.
- `AnthropicCompatibleProvider` — `/v1/messages`, splits system from turns.
- `ScriptedProvider` — deterministic; powers offline demos + tests.
All HTTP goes through an injected `HttpTransport`, so the package has no fetch/
SDK dependency and adapters are trivially testable.

## Safety model
The shared system prompt forbids fabricating NCAA/NAIA/NJCAA rules and requires
separating fact/opinion/suggestion/unknown. Output carries a `facts[]` array with
`certainty`. `applySafety` then (a) attaches a verify-source disclaimer to any
confidently-stated rule and (b) injects an explicit "unknown" when the summary
invokes a rule but declared no facts.
