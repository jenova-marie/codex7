import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Stub Codex7Error for Phase 0
 * Will use actual @codex7/shared version in Phase 1
 */
class Codex7Error extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'Codex7Error';
  }
}

/**
 * Global error handling middleware
 *
 * Catches all errors and formats them consistently.
 * Handles both Codex7Error instances and unknown errors.
 */
export function errorHandler() {
  return (err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error({
      error: err.message,
      stack: err.stack,
      path: req.path
    });

    // Handle Codex7 errors
    if (err instanceof Codex7Error) {
      return res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
          context: err.context
        }
      });
    }

    // Handle unknown errors
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  };
}
