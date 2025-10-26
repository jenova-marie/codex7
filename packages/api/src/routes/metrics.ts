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
 * Prometheus metrics endpoint
 *
 * STUB: Returns placeholder metrics.
 * TODO Phase 1: Implement Prometheus metrics.
 */
export function metricsRoutes(): Router {
  const router = Router();

  router.get('/metrics', (_req, res) => {
    logger.debug('Metrics requested');

    // TODO Phase 1: Implement Prometheus metrics

    res.set('Content-Type', 'text/plain');
    res.send('# STUB: Metrics not implemented yet\n');
  });

  return router;
}
