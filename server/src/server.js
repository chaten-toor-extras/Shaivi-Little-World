import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { migrateMoodWorldEffects } from './migrations/moodWorldEffects.js';
import { logger } from './utils/logger.js';

const app = createApp();

const start = async () => {
  await connectDatabase();
  await migrateMoodWorldEffects();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    server.close(async () => {
      const mongoose = await import('mongoose');
      await mongoose.default.disconnect();
      logger.info('Server shut down gracefully');
      process.exit(0);
    });
    // Force shutdown after 10s
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  logger.fatal(err, 'Failed to start server');
  process.exit(1);
});

