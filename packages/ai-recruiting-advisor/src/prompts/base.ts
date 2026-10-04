import type { AdvisorKind } from '../models/common.js';
import type { ChatMessage } from '../providers/types.js';
import type { ContextSlice, PlayerContext } from '../context/providers.js';
import type { PlayerMemory } from '../memory/Memory.js';

/** Shared safety constraints injected into every advisor's system prompt. */
export const SHARED_SAFETY = [
  'Safety and honesty rules:',
  '- Never fabricate NCAA/NAIA/NJCAA rules, deadlines, or eligibility requirements.',
  '- Clearly separate what is a FACT, an OPINION, a SUGGESTION, or UNKNOWN.',
  '- If you are not certain of a rule or number, mark it "unknown" and advise verifying with the official source.',
  '- Populate the "facts" array with any factual claims and their certainty ("known" | "likely" | "unknown").',
  '- Be encouraging and age-appropriate; never guarantee scholarships, offers, or outcomes.',
].join('\n');

export interface PromptTemplate {
  kind: AdvisorKind;
  title: string;
  requiredContext: ContextSlice[];
  system: string;
  developer: string;
  /** Description of the exact JSON to return (advisor-specific keys). */
  outputInstruction: string;
  fewShot: { user: string; assistant: string }[];
}

export interface RenderInput {
  template: PromptTemplate;
  context: PlayerContext;
  memory?: PlayerMemory;
  history?: ChatMessage[];
  userMessage: string;
}

/** Serialize only the context slices the advisor asked for (compact). */
function renderContext(ctx: PlayerContext): string {
  const compact: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(ctx)) {
    if (v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    compact[k] = v;
  }
  return JSON.stringify(compact);
}

/** Assemble the provider message list from a template + context + memory + input. */
export function renderPrompt(input: RenderInput): ChatMessage[] {
  const { template, context, memory, history, userMessage } = input;
  const messages: ChatMessage[] = [];

  messages.push({ role: 'system', content: `${template.system}\n\n${SHARED_SAFETY}` });
  messages.push({
    role: 'developer',
    content:
      `${template.developer}\n\n` +
      `Respond with STRICT JSON only (no prose, no markdown fences) matching:\n${template.outputInstruction}`,
  });

  for (const shot of template.fewShot) {
    messages.push({ role: 'user', content: shot.user });
    messages.push({ role: 'assistant', content: shot.assistant });
  }

  const memoryBlock = memory
    ? `Player memory: preferences=${JSON.stringify(memory.preferences)}; goals=${JSON.stringify(memory.goals)}; summary="${memory.summary}"`
    : '';
  const contextBlock = `Player context (authoritative; do not invent beyond this):\n${renderContext(context)}`;

  if (history) for (const h of history) messages.push(h);

  messages.push({
    role: 'user',
    content: [contextBlock, memoryBlock, `Request: ${userMessage}`].filter(Boolean).join('\n\n'),
  });
  return messages;
}
