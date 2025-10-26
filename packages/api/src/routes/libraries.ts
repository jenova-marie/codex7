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
