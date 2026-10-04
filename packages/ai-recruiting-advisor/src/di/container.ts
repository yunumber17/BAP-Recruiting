import { z } from 'zod';
import type { AdvisorKind } from '../models/common.js';
import { ADVISOR_KINDS } from '../models/common.js';
import type { LLMProvider } from '../providers/types.js';
import { ScriptedProvider } from '../providers/ScriptedProvider.js';
import { defaultAdvisorResponder } from '../providers/scriptedResponder.js';
import { ContextBuilder } from '../context/ContextBuilder.js';
import { createMockContextProviders } from '../context/mocks.js';
import type { ContextProviders } from '../context/providers.js';
import {
  InMemoryShortTermMemory, InMemoryLongTermMemory, type ShortTermMemory, type LongTermMemory,
} from '../memory/Memory.js';
import { Advisor } from '../advisors/Advisor.js';
import { PROMPT_TEMPLATES } from '../prompts/registry.js';
import { OUTPUT_SCHEMAS } from '../advisors/schemas.js';
import { AdvisorService } from '../services/AdvisorService.js';
import { ToolRegistry } from '../tools/Tool.js';
import { findImprovementAreasTool, explainRecruitingScoreTool } from '../tools/definitions.js';
import { createLogger, type Logger } from '../middleware/logger.js';

export interface ContainerOverrides {
  provider?: LLMProvider;
  contextProviders?: Partial<ContextProviders>;
  shortTerm?: ShortTermMemory;
  longTerm?: LongTermMemory;
  logger?: Logger;
}

export interface AdvisorContainer {
  provider: LLMProvider;
  contextBuilder: ContextBuilder;
  shortTerm: ShortTermMemory;
  longTerm: LongTermMemory;
  tools: ToolRegistry;
  advisors: Map<AdvisorKind, Advisor<z.ZodType>>;
  service: AdvisorService;
}

/**
 * Composition root. Defaults are fully offline (ScriptedProvider + mock context)
 * so the platform runs and tests deterministically. Swap `provider` for an
 * OpenAI/Anthropic adapter and `contextProviders` for real package-backed
 * adapters at wiring time — advisors are untouched.
 */
export function createAdvisorContainer(overrides: ContainerOverrides = {}): AdvisorContainer {
  const logger = overrides.logger ?? createLogger();
  const provider = overrides.provider ?? new ScriptedProvider(defaultAdvisorResponder);
  const contextProviders = createMockContextProviders(overrides.contextProviders);
  const contextBuilder = new ContextBuilder(contextProviders, logger);
  const shortTerm = overrides.shortTerm ?? new InMemoryShortTermMemory();
  const longTerm = overrides.longTerm ?? new InMemoryLongTermMemory();

  const tools = new ToolRegistry();
  tools.register(findImprovementAreasTool as never);
  tools.register(explainRecruitingScoreTool as never);

  const deps = { provider, context: contextBuilder, shortTerm, longTerm, logger };
  const advisors = new Map<AdvisorKind, Advisor<z.ZodType>>();
  for (const kind of ADVISOR_KINDS) {
    advisors.set(kind, new Advisor(PROMPT_TEMPLATES[kind], OUTPUT_SCHEMAS[kind], deps));
  }

  return { provider, contextBuilder, shortTerm, longTerm, tools, advisors, service: new AdvisorService(advisors) };
}
