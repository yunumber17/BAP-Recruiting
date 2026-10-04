import type { Request, Response, NextFunction } from 'express';
import { z, type ZodTypeAny } from 'zod';
import { ValidationError } from '../errors/index.js';

export interface RequestSchemas {
  params?: ZodTypeAny;
  query?: ZodTypeAny;
  body?: ZodTypeAny;
}

/**
 * Validates params/query/body against Zod schemas and REPLACES them with the
 * parsed (typed, coerced) values. On failure throws ValidationError with the
 * flattened issues, handled by the error middleware.
 */
export function validate(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
      if (schemas.query) {
        Object.defineProperty(req, 'query', {
          value: schemas.query.parse(req.query),
          writable: true,
          configurable: true,
        });
      }
      if (schemas.body) req.body = schemas.body.parse(req.body) as unknown;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(new ValidationError('Request validation failed', err.flatten()));
      } else {
        next(err);
      }
    }
  };
}

/** Validate a service/controller output against its response schema. */
export function parseResponse<T>(schema: ZodTypeAny, value: unknown): T {
  return schema.parse(value) as T;
}
