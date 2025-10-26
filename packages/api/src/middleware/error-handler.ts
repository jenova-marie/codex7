/**
 * Codex7 - REST API Server
 *
 * Copyright (C) 2025 Jenova Marie and Codex7 Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
