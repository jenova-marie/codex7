/**
 * 🧪 Tests for Tool Registration
 */

import { describe, it, expect } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { handleResolveLibraryId } from '../tools/resolve-library-id.js';
import { handleGetLibraryDocs } from '../tools/get-library-docs.js';
import { handleSearchDocs } from '../tools/search-docs.js';
import { handleGetVersions } from '../tools/get-versions.js';
import { registerTools } from '../tools/index.js';

describe('Tool Handlers', () => {
  describe('handleResolveLibraryId', () => {
    it('should return stub data', async () => {
      const result = await handleResolveLibraryId({ libraryName: 'react' });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const data = JSON.parse(result.content[0].text);
      expect(data.matches).toBeDefined();
      expect(data._stub).toBe(true);
    });
  });

  describe('handleGetLibraryDocs', () => {
    it('should return stub documentation', async () => {
      const result = await handleGetLibraryDocs({
        context7CompatibleLibraryID: '/facebook/react',
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      const data = JSON.parse(result.content[0].text);
      expect(data.content).toContain('PLACEHOLDER');
      expect(data.metadata._stub).toBe(true);
    });

    it('should handle topic parameter', async () => {
      const result = await handleGetLibraryDocs({
        context7CompatibleLibraryID: '/facebook/react',
        topic: 'hooks',
      });

      const data = JSON.parse(result.content[0].text);
      expect(data.content).toContain('hooks');
      expect(data.metadata.topic).toBe('hooks');
    });
  });

  describe('handleSearchDocs', () => {
    it('should return empty stub results', async () => {
      const result = await handleSearchDocs({ query: 'test query' });

      expect(result).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.results).toEqual([]);
      expect(data._stub).toBe(true);
    });
  });

  describe('handleGetVersions', () => {
    it('should return stub version list', async () => {
      const result = await handleGetVersions({ library_id: '/facebook/react' });

      expect(result).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.versions).toBeDefined();
      expect(data.versions.length).toBeGreaterThan(0);
      expect(data._stub).toBe(true);
    });
  });
});

describe('Tool Registration', () => {
  function createTestServer(): Server {
    return new Server(
      { name: 'test', version: '1.0.0' },
      {
        capabilities: {
          tools: {},
        },
      }
    );
  }

  describe('registerTools', () => {
    it('should register all tools without throwing', () => {
      const server = createTestServer();
      expect(() => registerTools(server)).not.toThrow();
    });

    it('should be idempotent', () => {
      const server = createTestServer();
      expect(() => {
        registerTools(server);
        registerTools(server);
      }).not.toThrow();
    });
  });
});
