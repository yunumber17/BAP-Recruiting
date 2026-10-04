import { z } from 'zod';
import type { AdvisorKind } from '../models/common.js';
import type { Advisor, AdvisorRequest, AdvisorResult, AdvisorStreamEvent } from '../advisors/Advisor.js';
import { NotIntegratedError } from '../models/errors.js';

/**
 * Entry point to the AI layer. Routes a request to the right specialized advisor
 * and returns structured output (or a stream). It has no prompt/model logic —
 * that lives in the advisors + templates.
 */
export class AdvisorService {
  constructor(private readonly advisors: Map<AdvisorKind, Advisor<z.ZodType>>) {}

  kinds(): AdvisorKind[] {
    return [...this.advisors.keys()];
  }

  private require(kind: AdvisorKind): Advisor<z.ZodType> {
    const a = this.advisors.get(kind);
    if (!a) throw new NotIntegratedError(`advisor not registered: ${kind}`);
    return a;
  }

  ask(kind: AdvisorKind, req: AdvisorRequest, signal?: AbortSignal): Promise<AdvisorResult<unknown>> {
    return this.require(kind).run(req, signal);
  }

  askStream(
    kind: AdvisorKind,
    req: AdvisorRequest,
    signal?: AbortSignal,
  ): AsyncGenerator<AdvisorStreamEvent<unknown>> {
    return this.require(kind).stream(req, signal);
  }
}
