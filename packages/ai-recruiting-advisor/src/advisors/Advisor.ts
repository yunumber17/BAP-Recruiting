import { z } from 'zod';
import type { UUID, AdvisorKind } from '../models/common.js';
import type { LLMProvider, TokenUsage, ChatMessage } from '../providers/types.js';
import type { ContextBuilder } from '../context/ContextBuilder.js';
import type { LongTermMemory, ShortTermMemory } from '../memory/Memory.js';
import type { PromptTemplate } from '../prompts/base.js';
import { renderPrompt } from '../prompts/base.js';
import { OutputParseError } from '../models/errors.js';
import { applySafety } from './safety.js';
import type { Logger } from '../middleware/logger.js';

export interface AdvisorRequest {
  playerId: UUID;
  message: string;
  sessionId?: string;
  temperature?: number;
}

export interface AdvisorResult<T> {
  kind: AdvisorKind;
  output: T;
  usage: TokenUsage;
  model: string;
}

export type AdvisorStreamEvent<T> =
  | { type: 'delta'; text: string }
  | { type: 'final'; result: AdvisorResult<T> };

export interface AdvisorDeps {
  provider: LLMProvider;
  context: ContextBuilder;
  longTerm?: LongTermMemory;
  shortTerm?: ShortTermMemory;
  logger?: Logger;
}

/**
 * Generic advisor engine. One instance per AdvisorKind, parameterized by its
 * prompt template + zod output schema. Handles: context assembly, prompt
 * rendering, provider call, JSON parsing + validation, safety post-processing,
 * memory, and streaming with cancellation. Business prompts live in templates,
 * not here.
 */
export class Advisor<T extends z.ZodType> {
  readonly kind: AdvisorKind;

  constructor(
    private readonly template: PromptTemplate,
    private readonly schema: T,
    private readonly deps: AdvisorDeps,
  ) {
    this.kind = template.kind;
  }

  private async assemble(req: AdvisorRequest): Promise<ChatMessage[]> {
    const context = await this.deps.context.build(req.playerId, this.template.requiredContext);
    const memory = await this.deps.longTerm?.get(req.playerId);
    const history = req.sessionId ? await this.deps.shortTerm?.recent(req.sessionId, 6) : undefined;
    return renderPrompt({ template: this.template, context, memory, history, userMessage: req.message });
  }

  async run(req: AdvisorRequest, signal?: AbortSignal): Promise<AdvisorResult<z.infer<T>>> {
    const messages = await this.assemble(req);
    const res = await this.deps.provider.complete(
      { messages, json: true, temperature: req.temperature ?? 0.4, metadata: { advisorKind: this.kind } },
      signal,
    );
    const output = this.parse(res.text);
    await this.remember(req, res.text);
    return { kind: this.kind, output, usage: res.usage, model: res.model };
  }

  async *stream(req: AdvisorRequest, signal?: AbortSignal): AsyncGenerator<AdvisorStreamEvent<z.infer<T>>> {
    const messages = await this.assemble(req);
    let buffer = '';
    for await (const chunk of this.deps.provider.stream(
      { messages, json: true, temperature: req.temperature ?? 0.4, metadata: { advisorKind: this.kind } },
      signal,
    )) {
      buffer += chunk.delta;
      yield { type: 'delta', text: chunk.delta };
    }
    const output = this.parse(buffer);
    await this.remember(req, buffer);
    yield {
      type: 'final',
      result: {
        kind: this.kind,
        output,
        model: this.deps.provider.model,
        usage: { promptTokens: 0, completionTokens: Math.ceil(buffer.length / 4) },
      },
    };
  }

  private parse(text: string): z.infer<T> {
    const json = stripFences(text);
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch (err) {
      throw new OutputParseError(`advisor ${this.kind}: response was not valid JSON`, err);
    }
    const parsed = this.schema.safeParse(data);
    if (!parsed.success) {
      throw new OutputParseError(`advisor ${this.kind}: output failed schema`, parsed.error.flatten());
    }
    return applySafety(parsed.data as z.infer<T>);
  }

  private async remember(req: AdvisorRequest, assistantText: string): Promise<void> {
    if (req.sessionId && this.deps.shortTerm) {
      await this.deps.shortTerm.append(req.sessionId, { role: 'user', content: req.message });
      await this.deps.shortTerm.append(req.sessionId, { role: 'assistant', content: assistantText });
    }
  }
}

/** Strip ```json … ``` fences a model might add despite instructions. */
function stripFences(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fence ? fence[1] : trimmed;
}
