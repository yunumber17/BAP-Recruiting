import { describe, it, expect } from 'vitest';
import { createAdvisorContainer } from '../src/di/container.js';
import { EmailAdvice, GoalPlanAdvice, TimelineAdvice } from '../src/advisors/schemas.js';
import { BaseAdvice } from '../src/models/output.js';

const c = createAdvisorContainer();
const req = { playerId: 'demo', message: 'What should I improve?' };

describe('advisors return structured, schema-valid output', () => {
  it('player-development → BaseAdvice with recommendations', async () => {
    const r = await c.service.ask('player-development', req);
    const parsed = BaseAdvice.safeParse(r.output);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.recommendations.length).toBeGreaterThan(0);
      expect(parsed.data.confidence).toBeGreaterThan(0);
    }
    expect(r.kind).toBe('player-development');
    expect(r.usage.completionTokens).toBeGreaterThan(0);
  });

  it('email → editable email object + variables', async () => {
    const r = await c.service.ask('email', { playerId: 'demo', message: 'initial email to Tampa' });
    const parsed = EmailAdvice.safeParse(r.output);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email.subject).toBeTruthy();
      expect(parsed.data.email.kind).toBe('initial');
      expect(parsed.data.variables.length).toBeGreaterThan(0);
    }
  });

  it('goal-planning → SMART goals array', async () => {
    const r = await c.service.ask('goal-planning', { playerId: 'demo', message: 'goals for D2' });
    const parsed = GoalPlanAdvice.safeParse(r.output);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.goals[0]?.target).toBeGreaterThan(0);
  });

  it('timeline → phases with a current flag', async () => {
    const r = await c.service.ask('timeline', { playerId: 'demo', message: 'build my timeline' });
    const parsed = TimelineAdvice.safeParse(r.output);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.phases.some((p) => p.current)).toBe(true);
  });

  it('every registered advisor produces valid base output', async () => {
    for (const kind of c.service.kinds()) {
      const r = await c.service.ask(kind, { playerId: 'demo', message: 'help' });
      expect(BaseAdvice.safeParse(r.output).success).toBe(true);
    }
  });
});
