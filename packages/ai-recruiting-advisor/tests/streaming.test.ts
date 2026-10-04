import { describe, it, expect } from 'vitest';
import { createAdvisorContainer } from '../src/di/container.js';
import { ScriptedProvider } from '../src/providers/ScriptedProvider.js';
import { collectStream, streamToSse } from '../src/api/streaming.js';
import { CancelledError } from '../src/models/errors.js';
import { BaseAdvice } from '../src/models/output.js';

describe('streaming', () => {
  it('streams deltas and ends with a validated final result', async () => {
    const c = createAdvisorContainer();
    const events = c.service.askStream('player-development', { playerId: 'demo', message: 'improve?' });
    const { text, final } = await collectStream(events);
    expect(text.length).toBeGreaterThan(0);
    expect(final?.type).toBe('final');
    if (final?.type === 'final') expect(BaseAdvice.safeParse(final.result.output).success).toBe(true);
  });

  it('adapts events to SSE frames', async () => {
    const c = createAdvisorContainer();
    const frames: string[] = [];
    const sink = { write: (s: string) => frames.push(s), end: () => undefined };
    await streamToSse(c.service.askStream('parent', { playerId: 'demo', message: 'D3 scholarships?' }), sink);
    const joined = frames.join('');
    expect(joined).toContain('event: delta');
    expect(joined).toContain('event: final');
    expect(joined).toContain('event: end');
  });

  it('cancels a stream via AbortSignal', async () => {
    // A long canned response so cancellation lands mid-stream.
    const provider = new ScriptedProvider(() => JSON.stringify({
      summary: 'x'.repeat(500), recommendations: [], actionItems: [], risks: [],
      followUpQuestions: [], facts: [], confidence: 0.5,
    }));
    const c = createAdvisorContainer({ provider });
    const ac = new AbortController();
    const it = c.service.askStream('academic', { playerId: 'demo', message: 'hi' }, ac.signal);

    await expect(
      (async () => {
        let n = 0;
        for await (const _ of it) {
          n += 1;
          if (n === 1) ac.abort();
        }
      })(),
    ).rejects.toBeInstanceOf(CancelledError);
  });
});
