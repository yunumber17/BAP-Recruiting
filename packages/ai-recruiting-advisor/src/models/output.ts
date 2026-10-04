import { z } from 'zod';
import { Priority, Certainty, Confidence } from './common.js';

/**
 * Base structured output every advisor returns. Advisors extend this — never
 * return raw text. `facts` forces the model to separate what is known vs. an
 * opinion vs. unknown (safety: no fabricated NCAA rules).
 */
export const Recommendation = z.object({
  title: z.string(),
  detail: z.string(),
  priority: Priority,
  estimatedImpact: z.string().optional(),
  confidence: Confidence,
});
export type Recommendation = z.infer<typeof Recommendation>;

export const ActionItem = z.object({
  text: z.string(),
  dueHint: z.string().optional(),
});

export const FactClaim = z.object({
  claim: z.string(),
  certainty: Certainty,
  disclaimer: z.string().optional(),
});

export const BaseAdvice = z.object({
  summary: z.string(),
  recommendations: z.array(Recommendation),
  actionItems: z.array(ActionItem),
  risks: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  facts: z.array(FactClaim),
  confidence: Confidence,
});
export type BaseAdvice = z.infer<typeof BaseAdvice>;
