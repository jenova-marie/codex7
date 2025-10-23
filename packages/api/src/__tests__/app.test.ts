import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('Express App', () => {
  const app = createApp({
    port: 3000,
    corsOrigins: ['*'],
    enableRateLimit: false
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.version).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /metrics', () => {
    it('should return metrics (stub)', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.text).toContain('STUB');
    });
  });

  describe('POST /api/auth/token', () => {
    it('should return stub JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/token')
        .send({ username: 'test', password: 'test' })
        .expect(200);

      expect(response.body.token).toBe('stub-jwt-token');
      expect(response.body.message).toContain('STUB');
    });
  });

  describe('GET /api/libraries', () => {
    it('should return empty library list (stub)', async () => {
      const response = await request(app)
        .get('/api/libraries')
        .expect(200);

      expect(response.body.libraries).toEqual([]);
      expect(response.body.total).toBe(0);
      expect(response.body.message).toContain('STUB');
    });
  });

  describe('POST /api/libraries', () => {
    it('should accept library submission (stub)', async () => {
      const response = await request(app)
        .post('/api/libraries')
        .send({ type: 'github', source: 'https://github.com/facebook/react' })
        .expect(202);

      expect(response.body.job_id).toBe('stub-job-id');
      expect(response.body.message).toContain('STUB');
    });
  });

  describe('GET /api/libraries/:id', () => {
    it('should return library details (stub)', async () => {
      const response = await request(app)
        .get('/api/libraries/react')
        .expect(200);

      expect(response.body.library).toBeNull();
      expect(response.body.message).toContain('STUB');
    });
  });

  describe('POST /api/search', () => {
    it('should return empty search results (stub)', async () => {
      const response = await request(app)
        .post('/api/search')
        .send({ query: 'react hooks' })
        .expect(200);

      expect(response.body.results).toEqual([]);
      expect(response.body.took_ms).toBe(0);
      expect(response.body.message).toContain('STUB');
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should return job status (stub)', async () => {
      const response = await request(app)
        .get('/api/jobs/job-123')
        .expect(200);

      expect(response.body.id).toBe('job-123');
      expect(response.body.status).toBe('pending');
      expect(response.body.message).toContain('STUB');
    });
  });
});
