import { z } from 'zod';

export type UUID = string;

/** The specialized advisors. Each has its own prompt template + output schema. */
export const ADVISOR_KINDS = [
  'player-development',
  'recruiting-strategy',
  'academic',
  'email',
  'mental-performance',
  'parent',
  'coach-communication',
  'timeline',
  'profile',
  'video-review',
  'goal-planning',
  'interview',
  'scholarship',
] as const;
export type AdvisorKind = (typeof ADVISOR_KINDS)[number];

export const Priority = z.enum(['high', 'medium', 'low']);
export type Priority = z.infer<typeof Priority>;

/** How sure a factual claim is — used to keep the AI honest (no fabrication). */
export const Certainty = z.enum(['known', 'likely', 'unknown']);
export type Certainty = z.infer<typeof Certainty>;

/** 0–1 confidence. */
export const Confidence = z.number().min(0).max(1);
