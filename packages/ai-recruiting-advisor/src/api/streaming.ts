/**
 * Transport-agnostic streaming helpers. Advisors yield AdvisorStreamEvents; here
 * we adapt them to SSE and to a WebSocket-like sink, with cancellation.
 */
import type { AdvisorStreamEvent } from '../advisors/Advisor.js';

/** Minimal writable sink (Express res, Node ServerResponse, etc.). */
export interface SseSink {
  write(chunk: string): void;
  end(): void;
}

/** Pipe advisor events to Server-Sent Events. Honors an AbortSignal. */
export async function streamToSse<T>(
  events: AsyncIterable<AdvisorStreamEvent<T>>,
  sink: SseSink,
  signal?: AbortSignal,
): Promise<void> {
  try {
    for await (const evt of events) {
      if (signal?.aborted) break;
      if (evt.type === 'delta') sink.write(sseEvent('delta', { text: evt.text }));
      else sink.write(sseEvent('final', evt.result));
    }
  } catch (err) {
    sink.write(sseEvent('error', { message: (err as Error).message }));
  } finally {
    sink.write('event: end\ndata: {}\n\n');
    sink.end();
  }
}

/** Minimal WebSocket-like sink. */
export interface WsSink {
  send(data: string): void;
}

export async function streamToWebSocket<T>(
  events: AsyncIterable<AdvisorStreamEvent<T>>,
  ws: WsSink,
  signal?: AbortSignal,
): Promise<void> {
  for await (const evt of events) {
    if (signal?.aborted) break;
    ws.send(JSON.stringify(evt));
  }
  ws.send(JSON.stringify({ type: 'end' }));
}

/** Collect a full result from a stream (for chunked HTTP or tests). */
export async function collectStream<T>(
  events: AsyncIterable<AdvisorStreamEvent<T>>,
): Promise<{ text: string; final?: AdvisorStreamEvent<T> & { type: 'final' } }> {
  let text = '';
  let final: (AdvisorStreamEvent<T> & { type: 'final' }) | undefined;
  for await (const evt of events) {
    if (evt.type === 'delta') text += evt.text;
    else final = evt;
  }
  return { text, final };
}

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
