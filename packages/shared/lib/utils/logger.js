/**
 * 📝 Logging Utilities for Codex7
 */
/**
 * Initialize logger - Phase 0 stub
 * @param _serviceName - Service name (unused in Phase 0)
 * @returns Logger instance
 */
export function initializeLogger(_serviceName) {
    // Phase 0: Return a mock logger that satisfies compilation
    return {
        info: () => { },
        error: () => { },
        warn: () => { },
        debug: () => { },
        trace: () => { },
        fatal: () => { },
        child: () => ({})
    };
}
/**
 * Default logger instance
 */
export const logger = initializeLogger('codex7-shared');
//# sourceMappingURL=logger.js.map