import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Library management routes
 *
 * STUB: All endpoints return placeholder data.
 * TODO Phase 1: Implement actual library operations.
 */
export function libraryRoutes(): Router {
  const router = Router();

  // GET /api/libraries - List all libraries
  router.get('/', (_req, res) => {
    logger.info('GET /api/libraries (STUB)');

    // TODO Phase 1: Query storage for libraries

    res.json({
      libraries: [],
      total: 0,
      message: 'STUB: Library listing not implemented yet'
    });
  });

  // POST /api/libraries - Add library to indexing queue
  router.post('/', (req, res) => {
    logger.info({ body: req.body });

    // TODO Phase 1: Add to job queue

    res.status(202).json({
      job_id: 'stub-job-id',
      message: 'STUB: Job queuing not implemented yet'
    });
  });

  // GET /api/libraries/:id - Get library details
  router.get('/:id', (req, res) => {
    logger.info({ id: req.params.id });

    // TODO Phase 1: Query storage

    res.json({
      library: null,
      message: 'STUB: Library lookup not implemented yet'
    });
  });

  return router;
}
