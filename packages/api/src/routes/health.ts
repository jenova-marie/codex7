import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Health check routes
 *
 * Provides basic health status endpoint for monitoring.
 */
export function healthRoutes(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    logger.debug('Health check');

    // TODO Phase 1: Check database connectivity

    res.json({
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}
