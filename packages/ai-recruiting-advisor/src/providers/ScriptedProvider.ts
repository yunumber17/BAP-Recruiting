import type {
  LLMProvider, CompletionRequest, CompletionResponse, StreamChunk,
} from './types.js';
import { CancelledError } from '../models/errors.js';

export type Responder = (req: CompletionRequest) => string;

/**
 * Deterministic provider for tests / local dev / offline demos. It returns a
 * canned response (default: keyed by req.metadata.advisorKind) and streams it in
 * chunks, honoring cancellation. No network, no SDK.
 */
export class ScriptedProvider implements LLMProvider {
  readonly name = 'scripted';
  readonly model: string;

  constructor(
    private readonly responder: Responder,
    model = 'scripted-1',
  ) {
    this.model = model;
  }

  async complete(req: CompletionRequest, signal?: AbortSignal): Promise<CompletionResponse> {
    if (signal?.aborted) throw new CancelledError('aborted before start');
    const text = this.responder(req);
    return {
      text,
      model: this.model,
      usage: { promptTokens: estimateTokens(req), completionTokens: Math.ceil(text.length / 4) },
    };
  }

  async *stream(req: CompletionRequest, signal?: AbortSignal): AsyncIterable<StreamChunk> {
    const text = this.responder(req);
    const size = 24;
    for (let i = 0; i < text.length; i += size) {
      if (signal?.aborted) throw new CancelledError('stream cancelled');
      yield { delta: text.slice(i, i + size) };
    }
  }
}

function estimateTokens(req: CompletionRequest): number {
  return Math.ceil(req.messages.reduce((n, m) => n + m.content.length, 0) / 4);
}
