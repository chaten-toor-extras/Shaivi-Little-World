import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { corsOptions } from './config/cors.js';
import { globalErrorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { mountRoutes } from './routes/index.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);

  // Security
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(cookieParser());

  // Body parsing with limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request logging
  app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'request');
    next();
  });

  // Routes
  mountRoutes(app);

  // Error handling
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

