/**
 * 📝 Logging Utilities for Codex7
 */

/**
 * Initialize logger - Phase 0 stub
 * @param _serviceName - Service name (unused in Phase 0)  
 * @returns Logger instance
 */
export function initializeLogger(_serviceName: string): any {
  // Phase 0: Return a mock logger that satisfies compilation
  return {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
    trace: () => {},
    fatal: () => {},
    child: () => ({})
  } as any;
}

/**
 * Default logger instance
 */
export const logger: any = initializeLogger('codex7-shared');
