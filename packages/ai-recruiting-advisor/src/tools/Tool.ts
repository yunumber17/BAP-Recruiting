import { z } from 'zod';
import type { PlayerContext } from '../context/providers.js';

/**
 * AI tool interface. Tools are deterministic capabilities an advisor (or the
 * orchestrator) can call. Each declares a zod input schema and returns typed
 * output. Score-engine-backed tools are declared but throw NotIntegrated until
 * wired (see FUTURE_AI_INTEGRATION.md).
 */
export interface Tool<I, O> {
  readonly name: string;
  readonly description: string;
  /** Zod schema whose parsed output is `I` (input side may be looser). */
  readonly inputSchema: z.ZodTypeAny;
  execute(input: I, context: PlayerContext): Promise<O>;
}

export type AnyTool = Tool<unknown, unknown>;

export class ToolRegistry {
  private readonly tools = new Map<string, AnyTool>();
  register(tool: AnyTool): void {
    this.tools.set(tool.name, tool);
  }
  get(name: string): AnyTool | undefined {
    return this.tools.get(name);
  }
  list(): string[] {
    return [...this.tools.keys()];
  }
}
