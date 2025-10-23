/**
 * Logger instance for web UI
 *
 * Simple console-based logger for browser environment.
 * TODO Phase 1: Integrate wonder-logger with proper browser configuration
 */
export const logger = {
  trace: (...args: any[]) => console.trace(...args),
  debug: (...args: any[]) => console.debug(...args),
  info: (...args: any[]) => console.info(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
  fatal: (...args: any[]) => console.error('[FATAL]', ...args),
};
