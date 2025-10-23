import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * JWT authentication middleware
 *
 * STUB: Just logs and allows all requests.
 * Real implementation in Phase 1.
 *
 * @returns Express middleware function
 */
export function authenticate() {
  return (_req: Request, _res: Response, next: NextFunction) => {
    logger.debug('Authentication check (STUB - allowing all)');

    // TODO Phase 1:
    // 1. Extract JWT from Authorization header
    // 2. Verify JWT signature
    // 3. Check expiration
    // 4. Attach user to req.user

    next();
  };
}
