/**
 * 🧪 PostgresConnection Tests
 *
 * Tests for PostgreSQL connection manager with mocked postgres.js
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostgresConnection } from '../connection.js';

// Mock postgres.js
vi.mock('postgres', () => {
  const mockSql = vi.fn().mockImplementation((strings: TemplateStringsArray) => {
    // Return a mock result for queries
    return Promise.resolve([{ test: 1 }]);
  });

  mockSql.end = vi.fn().mockResolvedValue(undefined);

  return {
    default: vi.fn(() => mockSql),
  };
});

describe('PostgresConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create connection instance', () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'test',
      password: 'test',
    };

    const conn = new PostgresConnection(config);
    expect(conn).toBeDefined();
  });

  it('should connect successfully', async () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'test',
      password: 'test',
    };

    const conn = new PostgresConnection(config);
    const result = await conn.connect();

    expect(result.ok).toBe(true);
  });

  it('should connect successfully with connection string', async () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'test',
      password: 'test',
      connectionString: 'postgresql://test:test@localhost:5432/test',
    };

    const conn = new PostgresConnection(config);
    const result = await conn.connect();

    expect(result.ok).toBe(true);
  });

  it('should disconnect successfully', async () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'test',
      password: 'test',
    };

    const conn = new PostgresConnection(config);
    await conn.connect();
    const result = await conn.disconnect();

    expect(result.ok).toBe(true);
  });

  it('should perform health check successfully', async () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'test',
      password: 'test',
    };

    const conn = new PostgresConnection(config);
    await conn.connect();
    const result = await conn.healthCheck();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(true);
    }
  });

  it('should fail health check if not connected', async () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'test',
      password: 'test',
    };

    const conn = new PostgresConnection(config);
    const result = await conn.healthCheck();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain('not connected');
    }
  });

  it('should fail to get db if not connected', () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'test',
      password: 'test',
    };

    const conn = new PostgresConnection(config);
    const dbResult = conn.getDb();

    expect(dbResult.ok).toBe(false);
    if (!dbResult.ok) {
      expect(dbResult.error.message).toContain('not connected');
    }
  });
});
