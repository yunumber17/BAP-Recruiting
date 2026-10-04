/**
 * Typed application errors. Every error carries an HTTP status and a stable
 * machine `code`; the error middleware turns these into JSON responses.
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INTERNAL_ERROR';

export abstract class AppError extends Error {
  abstract readonly status: number;
  abstract readonly code: ErrorCode;
  /** Safe to expose to clients. */
  readonly expose: boolean = true;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.details = details;
    Error.captureStackTrace?.(this, new.target);
  }

  toJSON(): { code: ErrorCode; message: string; details?: unknown } {
    return { code: this.code, message: this.message, details: this.details };
  }
}

export class ValidationError extends AppError {
  readonly status = 400;
  readonly code = 'VALIDATION_ERROR' as const;
}

export class UnauthorizedError extends AppError {
  readonly status = 401;
  readonly code = 'UNAUTHORIZED' as const;
}

export class ForbiddenError extends AppError {
  readonly status = 403;
  readonly code = 'FORBIDDEN' as const;
}

export class NotFoundError extends AppError {
  readonly status = 404;
  readonly code = 'NOT_FOUND' as const;
  constructor(entity: string, id?: string) {
    super(id ? `${entity} not found: ${id}` : `${entity} not found`);
  }
}

export class ConflictError extends AppError {
  readonly status = 409;
  readonly code = 'CONFLICT' as const;
}

export class DatabaseError extends AppError {
  readonly status = 500;
  readonly code = 'DATABASE_ERROR' as const;
  readonly expose = false; // don't leak DB internals
}

export class ExternalServiceError extends AppError {
  readonly status = 502;
  readonly code = 'EXTERNAL_SERVICE_ERROR' as const;
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
