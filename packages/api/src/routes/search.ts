import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Search routes
 *
 * STUB: Returns empty search results.
 * TODO Phase 1: Implement semantic + keyword search.
 */
export function searchRoutes(): Router {
  const router = Router();

  // POST /api/search - Semantic + keyword search
  router.post('/', (req, res) => {
    logger.info({ body: req.body });

    // TODO Phase 1: Implement search

    res.json({
      results: [],
      took_ms: 0,
      message: 'STUB: Search not implemented yet'
    });
  });

  return router;
}
