# Prompt Guide

Prompts are **data**, in `src/prompts/registry.ts`. Services never contain
prompt strings. A template is:

```ts
interface PromptTemplate {
  kind: AdvisorKind;
  title: string;
  requiredContext: ContextSlice[];   // what the ContextBuilder fetches
  system: string;                    // role + behavior
  developer: string;                 // task instructions
  outputInstruction: string;         // exact JSON shape to return
  fewShot: { user: string; assistant: string }[];
}
```

## Assembly order (`renderPrompt`)
1. **system** = `template.system` + `SHARED_SAFETY`
2. **developer** = `template.developer` + "Respond with STRICT JSON …" +
   `outputInstruction`
3. **few-shot** = alternating user/assistant example turns
4. **history** = recent short-term memory turns (optional)
5. **user** = context block (only requested slices) + memory block + the request

## Rules
- **No prose/markdown in outputs.** The developer prompt demands strict JSON; the
  advisor also strips accidental ```json fences and zod-validates.
- **Shared safety is always injected.** Do not restate it per template.
- **Ground in context.** The user message includes "do not invent beyond this"
  and the serialized context; unknowns must be marked, not guessed.
- **Few-shot examples must be valid** against the advisor's output schema — they
  double as the offline `ScriptedProvider` fixtures, so tests guarantee they parse.
- **Keep system prompts about role/behavior; developer about the task.** OpenAI
  merges `developer`→system; Anthropic folds both into `system`.

## Editing / adding prompts
- Change wording freely in `registry.ts` — no code change needed.
- If you change the output shape, update both `outputInstruction` (the template)
  and the matching zod schema in `advisors/schemas.ts`, and keep the few-shot
  example valid. The `prompt.test.ts` + `advisors.test.ts` suites catch drift.

## Safety phrasing (already in `SHARED_SAFETY`)
- Never fabricate NCAA/NAIA/NJCAA rules, deadlines, or eligibility numbers.
- Separate FACT / OPINION / SUGGESTION / UNKNOWN.
- Put factual claims in `facts[]` with `certainty`; unknown rules get a
  "verify with official source" disclaimer (enforced again by `applySafety`).
- Encouraging, age-appropriate; never guarantee scholarships or outcomes.
