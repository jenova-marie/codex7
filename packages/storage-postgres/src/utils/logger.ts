/**
 * 📝 Logger Setup for PostgreSQL Storage Adapter
 *
 * Creates a configured logger instance using wonder-logger
 */

import { createLoggerFromConfig } from '@jenova-marie/wonder-logger';

/**
 * Logger instance for storage-postgres package
 *
 * Configured via wonder-logger.yaml in the package root
 */
export const logger: ReturnType<typeof createLoggerFromConfig> = createLoggerFromConfig();
