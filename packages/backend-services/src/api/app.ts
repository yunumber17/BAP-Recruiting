import express, { type Express } from 'express';
import type { Container } from '../di/container.js';
import { requestContext } from '../middleware/context.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';
import { buildRoutes } from './routes.js';

/** Build the Express app from a container. Pure factory — no side effects. */
export function createApp(container: Container): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(requestContext);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', buildRoutes(container));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
