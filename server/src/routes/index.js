import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { csrfProtection } from '../middleware/csrf.middleware.js';

import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import publicRoutes from './public.routes.js';

export const mountRoutes = (app) => {
  const router = Router();

  router.get('/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date() } });
  });

  router.use('/auth', authRoutes);
  router.use('/public', publicRoutes);

  // Apply auth and CSRF universally to admin route group
  router.use('/admin', authenticate, csrfProtection, adminRoutes);

  app.use('/api/v1', router);
};

