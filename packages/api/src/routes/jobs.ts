import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Job status routes
 *
 * STUB: Returns placeholder job status.
 * TODO Phase 1: Query actual job queue.
 */
export function jobRoutes(): Router {
  const router = Router();

  // GET /api/jobs/:id - Check job status
  router.get('/:id', (req, res) => {
    logger.info({ id: req.params.id });

    // TODO Phase 1: Query job queue

    res.json({
      id: req.params.id,
      status: 'pending',
      message: 'STUB: Job status not implemented yet'
    });
  });

  return router;
}
