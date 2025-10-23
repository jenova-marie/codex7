import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Prometheus metrics endpoint
 *
 * STUB: Returns placeholder metrics.
 * TODO Phase 1: Implement Prometheus metrics.
 */
export function metricsRoutes(): Router {
  const router = Router();

  router.get('/metrics', (_req, res) => {
    logger.debug('Metrics requested');

    // TODO Phase 1: Implement Prometheus metrics

    res.set('Content-Type', 'text/plain');
    res.send('# STUB: Metrics not implemented yet\n');
  });

  return router;
}
