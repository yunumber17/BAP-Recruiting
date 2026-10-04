import { describe, it, expect } from 'vitest';
import { applySafety } from '../src/advisors/safety.js';
import { ContextBuilder } from '../src/context/ContextBuilder.js';
import { createMockContextProviders } from '../src/context/mocks.js';
import { InMemoryShortTermMemory, InMemoryLongTermMemory } from '../src/memory/Memory.js';
import { findImprovementAreasTool } from '../src/tools/definitions.js';
import { explainRecruitingScoreTool } from '../src/tools/definitions.js';
import { NotIntegratedError } from '../src/models/errors.js';

describe('safety post-processor', () => {
  it('adds a verify disclaimer to a confidently-stated NCAA rule', () => {
    const out = applySafety({
      summary: 'ok', facts: [{ claim: 'NCAA D1 requires a 2.3 GPA', certainty: 'known' as const }],
    });
    expect((out.facts[0] as { disclaimer?: string }).disclaimer).toContain('ncaa.org');
  });
  it('flags NCAA guidance in summary with no facts as unknown', () => {
    type Fact = { claim: string; certainty: 'known' | 'likely' | 'unknown'; disclaimer?: string };
    const out = applySafety<{ summary: string; facts: Fact[] }>({
      summary: 'This depends on NCAA eligibility rules.',
      facts: [],
    });
    expect(out.facts.length).toBe(1);
    expect(out.facts[0].certainty).toBe('unknown');
  });
});

describe('context builder', () => {
  it('fetches only the requested slices', async () => {
    const cb = new ContextBuilder(createMockContextProviders());
    const ctx = await cb.build('demo', ['profile', 'metrics']);
    expect(ctx.profile?.firstName).toBe('Taro');
    expect(ctx.metrics?.length).toBeGreaterThan(0);
    expect(ctx.scores).toBeUndefined(); // not requested
  });
  it('degrades gracefully when a provider throws', async () => {
    const providers = createMockContextProviders({
      metrics: { async getMetrics() { throw new Error('down'); } },
    });
    const ctx = await new ContextBuilder(providers).build('demo', ['profile', 'metrics']);
    expect(ctx.profile).toBeTruthy();
    expect(ctx.metrics).toBeUndefined(); // omitted, not crashed
  });
});

describe('memory', () => {
  it('short-term keeps a rolling window', async () => {
    const m = new InMemoryShortTermMemory(2);
    await m.append('s', { role: 'user', content: 'a' });
    await m.append('s', { role: 'user', content: 'b' });
    await m.append('s', { role: 'user', content: 'c' });
    const recent = await m.recent('s');
    expect(recent.map((x) => x.content)).toEqual(['b', 'c']);
  });
  it('long-term stores preferences + goals', async () => {
    const m = new InMemoryLongTermMemory();
    await m.setPreference('p', 'region', 'WEST');
    await m.addGoal('p', 'Reach D2');
    const mem = await m.get('p');
    expect(mem.preferences.region).toBe('WEST');
    expect(mem.goals).toContain('Reach D2');
  });
});

describe('tools', () => {
  it('FindImprovementAreas ranks weakest metrics from context', async () => {
    const areas = await findImprovementAreasTool.execute(
      { topN: 2 },
      { playerId: 'demo', metrics: [
        { type: 'EXIT_VELOCITY', value: 84 },
        { type: 'INFIELD_VELOCITY', value: 84 },
      ] },
    );
    expect(areas[0]?.metric).toBeTruthy();
    expect(areas[0]?.gap).toBeGreaterThan(0);
  });
  it('ExplainRecruitingScore is declared but not integrated', async () => {
    await expect(explainRecruitingScoreTool.execute({ schoolId: 's' }, { playerId: 'demo' }))
      .rejects.toBeInstanceOf(NotIntegratedError);
  });
});
