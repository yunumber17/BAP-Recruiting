import { createApp } from './api/app.js';
import { createContainer } from './di/container.js';
import { loadConfig } from './config/env.js';
import { logger } from './utils/logger.js';

const config = loadConfig();
const container = createContainer();
const app = createApp(container);

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'backend-services listening');
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    logger.info({ signal }, 'shutting down');
    server.close(() => process.exit(0));
  });
}
