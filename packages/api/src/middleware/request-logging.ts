import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Request/response logging middleware
 *
 * Logs incoming requests and their responses with timing information.
 * Uses wonder-logger for beautiful structured logging.
 */
export function requestLogging() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log request
    logger.info({
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;

      logger.info({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration
      });
    });

    next();
  };
}
