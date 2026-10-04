import type {
  LLMProvider, CompletionRequest, CompletionResponse, StreamChunk, HttpTransport, ChatMessage,
} from './types.js';
import { ProviderError } from '../models/errors.js';

export interface OpenAIConfig {
  baseUrl: string; // e.g. https://api.openai.com/v1  (or any OpenAI-compatible)
  apiKey: string;
  model: string;
}

/** OpenAI-compatible chat-completions adapter. Depends only on HttpTransport. */
export class OpenAICompatibleProvider implements LLMProvider {
  readonly name = 'openai-compatible';
  readonly model: string;

  constructor(
    private readonly cfg: OpenAIConfig,
    private readonly http: HttpTransport,
  ) {
    this.model = cfg.model;
  }

  private headers(): Record<string, string> {
    return { 'content-type': 'application/json', authorization: `Bearer ${this.cfg.apiKey}` };
  }

  private body(req: CompletionRequest, stream: boolean): unknown {
    return {
      model: this.model,
      messages: toOpenAIMessages(req.messages),
      temperature: req.temperature ?? 0.4,
      max_tokens: req.maxTokens,
      stream,
      ...(req.json ? { response_format: { type: 'json_object' } } : {}),
    };
  }

  async complete(req: CompletionRequest, signal?: AbortSignal): Promise<CompletionResponse> {
    const url = `${this.cfg.baseUrl}/chat/completions`;
    const raw = await this.http.postJson({ url, headers: this.headers(), body: this.body(req, false), signal });
    const parsed = raw as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const text = parsed.choices?.[0]?.message?.content;
    if (typeof text !== 'string') throw new ProviderError('malformed OpenAI response');
    return {
      text,
      model: this.model,
      usage: {
        promptTokens: parsed.usage?.prompt_tokens ?? 0,
        completionTokens: parsed.usage?.completion_tokens ?? 0,
      },
    };
  }

  async *stream(req: CompletionRequest, signal?: AbortSignal): AsyncIterable<StreamChunk> {
    const url = `${this.cfg.baseUrl}/chat/completions`;
    for await (const data of this.http.postStream({ url, headers: this.headers(), body: this.body(req, true), signal })) {
      if (data === '[DONE]') return;
      try {
        const evt = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
        const delta = evt.choices?.[0]?.delta?.content;
        if (delta) yield { delta };
      } catch {
        // ignore keep-alive / non-JSON lines
      }
    }
  }
}

/** OpenAI treats "developer" as a system-tier message; merge for compatibility. */
function toOpenAIMessages(messages: ChatMessage[]): { role: string; content: string }[] {
  return messages.map((m) => ({ role: m.role === 'developer' ? 'system' : m.role, content: m.content }));
}
