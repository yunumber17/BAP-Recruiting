import { describe, it, expect } from 'vitest';
import { renderPrompt, SHARED_SAFETY } from '../src/prompts/base.js';
import { PROMPT_TEMPLATES } from '../src/prompts/registry.js';

describe('prompt assembly', () => {
  it('injects system + safety + developer + output instruction + context + user', () => {
    const messages = renderPrompt({
      template: PROMPT_TEMPLATES['player-development'],
      context: { playerId: 'demo', profile: { playerId: 'demo', firstName: 'T', lastName: 'Y', graduationYear: 2027, primaryPosition: 'SHORTSTOP' } },
      memory: { preferences: { region: 'WEST' }, goals: ['Reach D2'], summary: 's' },
      userMessage: 'What should I improve?',
    });
    const roles = messages.map((m) => m.role);
    expect(roles[0]).toBe('system');
    expect(messages[0].content).toContain(SHARED_SAFETY);
    expect(roles).toContain('developer');
    const dev = messages.find((m) => m.role === 'developer');
    expect(dev?.content).toContain('STRICT JSON');
    const user = messages[messages.length - 1];
    expect(user.role).toBe('user');
    expect(user.content).toContain('Player context');
    expect(user.content).toContain('Reach D2'); // memory folded in
    expect(user.content).toContain('What should I improve?');
  });

  it('every advisor template declares required context and output instruction', () => {
    for (const t of Object.values(PROMPT_TEMPLATES)) {
      expect(t.requiredContext.length).toBeGreaterThan(0);
      expect(t.outputInstruction).toContain('summary');
      expect(t.system.length).toBeGreaterThan(0);
    }
  });
});
