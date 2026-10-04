/** Typed errors for the AI layer. */
export abstract class AdvisorError extends Error {
  abstract readonly code: string;
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = new.target.name;
  }
}

export class ProviderError extends AdvisorError {
  readonly code = 'PROVIDER_ERROR';
}
export class OutputParseError extends AdvisorError {
  readonly code = 'OUTPUT_PARSE_ERROR';
}
export class ContextError extends AdvisorError {
  readonly code = 'CONTEXT_ERROR';
}
export class NotIntegratedError extends AdvisorError {
  readonly code = 'NOT_INTEGRATED';
}
export class CancelledError extends AdvisorError {
  readonly code = 'CANCELLED';
}
