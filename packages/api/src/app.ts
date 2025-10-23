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
