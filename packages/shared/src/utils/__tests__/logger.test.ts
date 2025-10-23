/**
 * 🧪 Tests for Logger Utilities
 */

import { describe, it, expect } from 'vitest';
import { initializeLogger, logger } from '../logger.js';

describe('initializeLogger', () => {
  it('should create logger with service name', () => {
    const testLogger = initializeLogger('test-service');

    expect(testLogger).toBeDefined();
    expect(testLogger.info).toBeDefined();
    expect(testLogger.error).toBeDefined();
    expect(testLogger.warn).toBeDefined();
    expect(testLogger.debug).toBeDefined();
  });

  it('should create logger with custom config', () => {
    const testLogger = initializeLogger('test-service', {
      logLevel: 'debug',
      prettyPrint: false,
    });

    expect(testLogger).toBeDefined();
  });

  it('should use environment variables for defaults', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalLogLevel = process.env.LOG_LEVEL;

    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'error';

    const testLogger = initializeLogger('test-service');
    expect(testLogger).toBeDefined();

    // Restore env
    process.env.NODE_ENV = originalEnv;
    process.env.LOG_LEVEL = originalLogLevel;
  });
});

describe('default logger export', () => {
  it('should export default logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
  });

  it('should allow logging without errors', () => {
    // This should not throw
    expect(() => {
      logger.info({ test: 'data' }, 'Test message');
    }).not.toThrow();
  });
});
