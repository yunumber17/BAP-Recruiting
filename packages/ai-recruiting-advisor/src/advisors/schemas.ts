import { z } from 'zod';
import { BaseAdvice } from '../models/output.js';
import type { AdvisorKind } from '../models/common.js';

/** Email advisor adds an editable email object + variables to personalize. */
export const EmailAdvice = BaseAdvice.extend({
  email: z.object({
    subject: z.string(),
    body: z.string(),
    kind: z.enum(['initial', 'followup', 'camp', 'thankyou', 'update']),
  }),
  variables: z.array(z.string()),
});

/** Goal planner adds SMART goals. */
export const GoalPlanAdvice = BaseAdvice.extend({
  goals: z.array(
    z.object({
      title: z.string(),
      specific: z.string(),
      metric: z.string(),
      current: z.number().optional(),
      target: z.number(),
      unit: z.string().optional(),
      dueHint: z.string(),
      nextMilestone: z.string(),
    }),
  ),
});

/** Timeline advisor adds phase-structured items. */
export const TimelineAdvice = BaseAdvice.extend({
  phases: z.array(
    z.object({
      phase: z.enum(['freshman', 'sophomore', 'junior', 'senior']),
      current: z.boolean(),
      items: z.array(z.object({ text: z.string(), done: z.boolean().optional() })),
    }),
  ),
});

/** Map each advisor kind to the zod schema its output must satisfy. */
export const OUTPUT_SCHEMAS: Record<AdvisorKind, z.ZodType> = {
  'player-development': BaseAdvice,
  'recruiting-strategy': BaseAdvice,
  academic: BaseAdvice,
  email: EmailAdvice,
  'mental-performance': BaseAdvice,
  parent: BaseAdvice,
  'coach-communication': BaseAdvice,
  timeline: TimelineAdvice,
  profile: BaseAdvice,
  'video-review': BaseAdvice,
  'goal-planning': GoalPlanAdvice,
  interview: BaseAdvice,
  scholarship: BaseAdvice,
};
