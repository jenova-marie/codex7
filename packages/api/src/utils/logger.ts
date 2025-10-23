import pino from 'pino';

/**
 * Logger instance for API server
 *
 * Simple pino logger for Phase 0.
 * Will integrate with @codex7/shared logger utilities in Phase 1.
 */
export const logger = pino({
  name: 'codex7-api',
  level: process.env.LOG_LEVEL || 'info'
});
