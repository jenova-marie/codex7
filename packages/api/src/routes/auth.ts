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
