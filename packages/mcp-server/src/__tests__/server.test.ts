/**
 * 🧪 Tests for Codex7MCPServer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Codex7MCPServer } from '../server.js';

describe('Codex7MCPServer', () => {
  let server: Codex7MCPServer;

  beforeEach(() => {
    server = new Codex7MCPServer({
      name: 'test-server',
      version: '0.0.1-test',
    });
  });

  afterEach(async () => {
    if (server) {
      await server.shutdown();
    }
  });

  describe('constructor', () => {
    it('should create server instance', () => {
      expect(server).toBeDefined();
      expect(server).toBeInstanceOf(Codex7MCPServer);
    });

    it('should accept configuration', () => {
      const customServer = new Codex7MCPServer({
        name: 'custom-server',
        version: '1.0.0',
      });

      expect(customServer).toBeDefined();
    });
  });

  describe('registerTools', () => {
    it('should register tools without throwing', () => {
      // Just verify it doesn't throw
      expect(() => server.registerTools()).not.toThrow();
    });

    it('should be callable multiple times', () => {
      expect(() => {
        server.registerTools();
        server.registerTools();
      }).not.toThrow();
    });
  });

  describe('shutdown', () => {
    it('should shutdown gracefully', async () => {
      await expect(server.shutdown()).resolves.not.toThrow();
    });

    it('should be callable multiple times', async () => {
      await server.shutdown();
      await expect(server.shutdown()).resolves.not.toThrow();
    });
  });

  // NOTE: start() cannot be easily tested as it requires stdio transport
  // Integration tests will cover full server lifecycle
});
