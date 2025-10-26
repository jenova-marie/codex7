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
