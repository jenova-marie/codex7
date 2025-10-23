import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Authentication routes
 *
 * STUB: Returns placeholder JWT token.
 * TODO Phase 1: Verify credentials and generate real JWT.
 */
export function authRoutes(): Router {
  const router = Router();

  // POST /api/auth/token - Generate JWT token
  router.post('/token', (_req, res) => {
    logger.info('POST /api/auth/token (STUB)');

    // TODO Phase 1: Verify credentials, generate JWT

    res.json({
      token: 'stub-jwt-token',
      message: 'STUB: Authentication not implemented yet'
    });
  });

  return router;
}
