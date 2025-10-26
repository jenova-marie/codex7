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
 * Job status routes
 *
 * STUB: Returns placeholder job status.
 * TODO Phase 1: Query actual job queue.
 */
export function jobRoutes(): Router {
  const router = Router();

  // GET /api/jobs/:id - Check job status
  router.get('/:id', (req, res) => {
    logger.info({ id: req.params.id });

    // TODO Phase 1: Query job queue

    res.json({
      id: req.params.id,
      status: 'pending',
      message: 'STUB: Job status not implemented yet'
    });
  });

  return router;
}
