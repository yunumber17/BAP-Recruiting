import type {
  LLMProvider, CompletionRequest, CompletionResponse, StreamChunk, HttpTransport, ChatMessage,
} from './types.js';
import { ProviderError } from '../models/errors.js';

export interface AnthropicConfig {
  baseUrl: string; // e.g. https://api.anthropic.com
  apiKey: string;
  model: string;
  version?: string;
}

/** Anthropic Messages-API-compatible adapter. Depends only on HttpTransport. */
export class AnthropicCompatibleProvider implements LLMProvider {
  readonly name = 'anthropic-compatible';
  readonly model: string;

  constructor(
    private readonly cfg: AnthropicConfig,
    private readonly http: HttpTransport,
  ) {
    this.model = cfg.model;
  }

  private headers(): Record<string, string> {
    return {
      'content-type': 'application/json',
      'x-api-key': this.cfg.apiKey,
      'anthropic-version': this.cfg.version ?? '2023-06-01',
    };
  }

  private body(req: CompletionRequest, stream: boolean): unknown {
    const { system, turns } = split(req.messages);
    return {
      model: this.model,
      system,
      messages: turns,
      max_tokens: req.maxTokens ?? 2048,
      temperature: req.temperature ?? 0.4,
      stream,
    };
  }

  async complete(req: CompletionRequest, signal?: AbortSignal): Promise<CompletionResponse> {
    const url = `${this.cfg.baseUrl}/v1/messages`;
    const raw = await this.http.postJson({ url, headers: this.headers(), body: this.body(req, false), signal });
    const parsed = raw as {
      content?: { type: string; text?: string }[];
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const text = parsed.content?.find((c) => c.type === 'text')?.text;
    if (typeof text !== 'string') throw new ProviderError('malformed Anthropic response');
    return {
      text,
      model: this.model,
      usage: {
        promptTokens: parsed.usage?.input_tokens ?? 0,
        completionTokens: parsed.usage?.output_tokens ?? 0,
      },
    };
  }

  async *stream(req: CompletionRequest, signal?: AbortSignal): AsyncIterable<StreamChunk> {
    const url = `${this.cfg.baseUrl}/v1/messages`;
    for await (const data of this.http.postStream({ url, headers: this.headers(), body: this.body(req, true), signal })) {
      try {
        const evt = JSON.parse(data) as { type?: string; delta?: { text?: string } };
        if (evt.type === 'content_block_delta' && evt.delta?.text) yield { delta: evt.delta.text };
      } catch {
        // ignore non-JSON events
      }
    }
  }
}

/** Anthropic takes system separately and only user/assistant turns in messages. */
function split(messages: ChatMessage[]): { system: string; turns: { role: 'user' | 'assistant'; content: string }[] } {
  const systemParts: string[] = [];
  const turns: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const m of messages) {
    if (m.role === 'system' || m.role === 'developer') systemParts.push(m.content);
    else turns.push({ role: m.role, content: m.content });
  }
  return { system: systemParts.join('\n\n'), turns };
}
