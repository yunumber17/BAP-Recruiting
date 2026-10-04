import type { CompletionRequest } from './types.js';
import { PROMPT_TEMPLATES } from '../prompts/registry.js';
import { ADVISOR_KINDS, type AdvisorKind } from '../models/common.js';

/**
 * Default responder for the ScriptedProvider: returns schema-valid JSON per
 * advisor so the platform runs fully offline (demos, CI, tests). For advisors
 * with a few-shot example it reuses that example's assistant JSON; otherwise it
 * returns a generic-but-valid BaseAdvice object.
 */
const GENERIC_ADVICE = JSON.stringify({
  summary: 'Here is guidance based on your current profile.',
  recommendations: [
    { title: 'Keep building your profile', detail: 'Add metrics and video to strengthen it.', priority: 'medium', confidence: 0.6 },
  ],
  actionItems: [{ text: 'Update your metrics this month' }],
  risks: [],
  followUpQuestions: ['What is your top recruiting goal right now?'],
  facts: [],
  confidence: 0.6,
});

function isAdvisorKind(v: string | undefined): v is AdvisorKind {
  return !!v && (ADVISOR_KINDS as readonly string[]).includes(v);
}

export function defaultAdvisorResponder(req: CompletionRequest): string {
  const kind = req.metadata?.advisorKind;
  if (isAdvisorKind(kind)) {
    const example = PROMPT_TEMPLATES[kind].fewShot[0]?.assistant;
    if (example) return example;
  }
  return GENERIC_ADVICE;
}
