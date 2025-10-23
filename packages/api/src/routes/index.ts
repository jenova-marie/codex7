import type { Express } from 'express';
import { logger } from '../utils/logger.js';
import { healthRoutes } from './health.js';
import { metricsRoutes } from './metrics.js';
import { authRoutes } from './auth.js';
import { libraryRoutes } from './libraries.js';
import { searchRoutes } from './search.js';
import { jobRoutes } from './jobs.js';

/**
 * Register all API routes
 *
 * @param app - Express application
 */
export function registerRoutes(app: Express): void {
  logger.info('Registering routes...');

  // Health & Metrics (no auth required)
  app.use('/', healthRoutes());
  app.use('/', metricsRoutes());

  // Authentication
  app.use('/api/auth', authRoutes());

  // API routes (auth required in Phase 1)
  app.use('/api/libraries', libraryRoutes());
  app.use('/api/search', searchRoutes());
  app.use('/api/jobs', jobRoutes());

  logger.info({
    routes: [
      'GET /health',
      'GET /metrics',
      'POST /api/auth/token',
      'GET/POST /api/libraries',
      'POST /api/search',
      'GET /api/jobs/:id'
    ]
  });
}
