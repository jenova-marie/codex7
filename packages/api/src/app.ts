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

import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './utils/logger.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogging } from './middleware/request-logging.js';

/**
 * API configuration
 */
export interface APIConfig {
  port: number;
  corsOrigins: string[];
  enableRateLimit: boolean;
}

/**
 * Create and configure Express application
 *
 * Sets up middleware pipeline and routes.
 * STUB: Routes return placeholder data.
 *
 * @param config - API configuration
 * @returns Configured Express application
 */
export function createApp(config: APIConfig): Express {
  const app = express();

  logger.info({ config });

  // ==================== Security Middleware ====================

  // Helmet for security headers
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: config.corsOrigins,
    credentials: true
  }));

  // ==================== Body Parsing ====================

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==================== Request Logging ====================

  app.use(requestLogging());

  // ==================== Routes ====================

  registerRoutes(app);

  // ==================== Error Handling ====================

  // Global error handler (must be last)
  app.use(errorHandler());

  logger.info('Express app configured');

  return app;
}
