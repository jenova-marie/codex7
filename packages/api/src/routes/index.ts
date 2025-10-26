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

import type { Express } from 'express';
import { logger } from '../utils/logger.js';
import { healthRoutes } from './health.js';
import { metricsRoutes } from './metrics.js';
import { authRoutes } from './auth.js';
import { libraryRoutes } from './libraries.js';
import { searchRoutes } from './search.js';
import { jobRoutes } from './jobs.js';

/**
 * Register all API routes
 *
 * @param app - Express application
 */
export function registerRoutes(app: Express): void {
  logger.info('Registering routes...');

  // Health & Metrics (no auth required)
  app.use('/', healthRoutes());
  app.use('/', metricsRoutes());

  // Authentication
  app.use('/api/auth', authRoutes());

  // API routes (auth required in Phase 1)
  app.use('/api/libraries', libraryRoutes());
  app.use('/api/search', searchRoutes());
  app.use('/api/jobs', jobRoutes());

  logger.info({
    routes: [
      'GET /health',
      'GET /metrics',
      'POST /api/auth/token',
      'GET/POST /api/libraries',
      'POST /api/search',
      'GET /api/jobs/:id'
    ]
  });
}
