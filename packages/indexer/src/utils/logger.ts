/**
 * 📝 Logger Utility
 *
 * Centralized logger instance for the indexer service.
 * Uses wonder-logger with configuration from wonder-logger.yaml.
 */

import { createLoggerFromConfig } from '@jenova-marie/wonder-logger';
import type { Logger } from 'pino';

/**
 * Logger instance for indexer service
 *
 * Configured via wonder-logger.yaml in package root.
 * Includes structured logging, trace context, and OTEL integration.
 */
export const logger: Logger = createLoggerFromConfig();
