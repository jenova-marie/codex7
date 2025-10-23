/**
 * 📝 Logger setup for MCP Server
 *
 * Uses @jenova-marie/wonder-logger for structured logging with trace context
 */

import { createLoggerFromConfig } from '@jenova-marie/wonder-logger';

/**
 * Logger instance for MCP server
 *
 * Configuration loaded from wonder-logger.yaml at package root
 * Note: Trace context disabled for Phase 0 to avoid @opentelemetry/api dependency
 */
export const logger = createLoggerFromConfig() as any;
