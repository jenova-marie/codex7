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
