/** Provider-agnostic LLM contract. Nothing in this package calls OpenAI or
 *  Anthropic SDKs directly — only these interfaces. */

export type Role = 'system' | 'developer' | 'user' | 'assistant';

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface CompletionRequest {
  messages: ChatMessage[];
  /** Temperature 0–2. */
  temperature?: number;
  maxTokens?: number;
  /** Ask the provider to return strict JSON. */
  json?: boolean;
  /** Free-form routing metadata (e.g. advisorKind) — never sent to the model. */
  metadata?: Record<string, string>;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface CompletionResponse {
  text: string;
  usage: TokenUsage;
  model: string;
}

export interface StreamChunk {
  /** Incremental text delta. */
  delta: string;
}

export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  complete(req: CompletionRequest, signal?: AbortSignal): Promise<CompletionResponse>;
  stream(req: CompletionRequest, signal?: AbortSignal): AsyncIterable<StreamChunk>;
}

/**
 * HTTP transport the OpenAI/Anthropic adapters depend on — a real fetch-based
 * implementation is injected at wiring time. Keeps HTTP concerns out of the
 * provider logic and out of tests.
 */
export interface HttpTransport {
  postJson(input: { url: string; headers: Record<string, string>; body: unknown; signal?: AbortSignal }): Promise<unknown>;
  /** Yields raw SSE `data:` payload strings from a streaming endpoint. */
  postStream(input: { url: string; headers: Record<string, string>; body: unknown; signal?: AbortSignal }): AsyncIterable<string>;
}
