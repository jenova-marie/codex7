# 🌐 REST API - Framework Establishment Plan

> **Goal**: Create Express.js REST API skeleton with routing framework, middleware pipeline, logging, error handling, and testing. NO actual business logic yet!

---

## 🎯 Package Purpose

The `@codex7/api` package provides:
- Express.js HTTP server
- RESTful API endpoints (stubs)
- Authentication middleware (JWT framework)
- Request validation
- Error handling middleware

**What we're NOT doing yet**: Implementing actual endpoints, storage queries, or search logic.

---

## 🏗️ Foundation Phase Tasks

### 1. Project Structure Setup

```
packages/api/
├── src/
│   ├── index.ts                    # Entry point (start server)
│   ├── app.ts                      # Express app setup
│   ├── server.ts                   # HTTP server lifecycle
│   ├── routes/                     # API route handlers (stubs)
│   │   ├── index.ts
│   │   ├── health.ts              # GET /health
│   │   ├── metrics.ts             # GET /metrics (Prometheus)
│   │   ├── auth.ts                # POST /api/auth/token (stub)
│   │   ├── libraries.ts           # Library endpoints (stubs)
│   │   ├── search.ts              # POST /api/search (stub)
│   │   └── jobs.ts                # GET /api/jobs/:id (stub)
│   ├── middleware/                 # Express middleware
│   │   ├── index.ts
│   │   ├── authentication.ts      # JWT verification (stub)
│   │   ├── rate-limit.ts          # Rate limiting (stub)
│   │   ├── request-logging.ts     # Request/response logging
│   │   ├── validation.ts          # Request validation
│   │   ├── error-handler.ts       # Global error handler
│   │   └── cors.ts                # CORS configuration
│   ├── schemas/                    # Request validation schemas
│   │   ├── index.ts
│   │   ├── search-schema.ts
│   │   └── library-schema.ts
│   ├── utils/                      # Utilities
│   │   ├── index.ts
│   │   └── logger.ts              # Logger setup
│   └── __tests__/                  # Tests
│       ├── app.test.ts
│       ├── routes.test.ts
│       └── middleware.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

**Deliverable**: Complete directory structure.

---

### 2. Package Configuration

#### package.json
```json
{
  "name": "@codex7/api",
  "version": "0.1.0",
  "description": "REST API server for Codex7",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@codex7/shared": "workspace:*",
    "@codex7/storage-postgres": "workspace:*",
    "@jenova-marie/ts-rust-result": "workspace:*",
    "@jenova-marie/wonder-logger": "workspace:*",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "zod": "^3.22.4",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcrypt": "^5.0.2",
    "typescript": "^5.3.3",
    "vitest": "^1.1.0",
    "@vitest/coverage-v8": "^1.1.0",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2",
    "tsx": "^4.7.0"
  }
}
```

**Deliverable**: Config files ready.

---

### 3. Express App Setup

#### src/app.ts
```typescript
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './utils/logger.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogging } from './middleware/request-logging.js';

/**
 * API configuration
 */
export interface APIConfig {
  port: number;
  corsOrigins: string[];
  enableRateLimit: boolean;
}

/**
 * Create and configure Express application
 *
 * Sets up middleware pipeline and routes.
 * STUB: Routes return placeholder data.
 */
export function createApp(config: APIConfig): Express {
  const app = express();

  logger.info('Creating Express app', { config });

  // ==================== Security Middleware ====================

  // Helmet for security headers
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: config.corsOrigins,
    credentials: true
  }));

  // ==================== Body Parsing ====================

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==================== Request Logging ====================

  app.use(requestLogging());

  // ==================== Routes ====================

  registerRoutes(app);

  // ==================== Error Handling ====================

  // Global error handler (must be last)
  app.use(errorHandler());

  logger.info('Express app configured');

  return app;
}
```

**Deliverable**: Express app factory with middleware pipeline.

---

### 4. Server Lifecycle

#### src/server.ts
```typescript
import type { Express } from 'express';
import type { Server } from 'http';
import { logger } from './utils/logger.js';

/**
 * HTTP server lifecycle manager
 *
 * Handles server start, graceful shutdown, and error handling.
 */
export class APIServer {
  private app: Express;
  private server: Server | null = null;
  private port: number;

  constructor(app: Express, port: number) {
    this.app = app;
    this.port = port;
  }

  /**
   * Start the HTTP server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          logger.info('API server started', {
            port: this.port,
            url: `http://localhost:${this.port}`
          });
          resolve();
        });

        this.server.on('error', (error) => {
          logger.error('Server error', { error });
          reject(error);
        });
      } catch (error) {
        logger.error('Failed to start server', { error });
        reject(error);
      }
    });
  }

  /**
   * Gracefully shutdown the server
   */
  async shutdown(): Promise<void> {
    if (!this.server) {
      return;
    }

    logger.info('Shutting down API server...');

    return new Promise((resolve, reject) => {
      this.server!.close((error) => {
        if (error) {
          logger.error('Error during shutdown', { error });
          reject(error);
        } else {
          logger.info('API server stopped');
          resolve();
        }
      });
    });
  }
}
```

**Deliverable**: Server lifecycle manager.

---

### 5. Route Registration

#### src/routes/index.ts
```typescript
import type { Express } from 'express';
import { logger } from '../utils/logger.js';
import { healthRoutes } from './health.js';
import { metricsRoutes } from './metrics.js';
import { authRoutes } from './auth.js';
import { libraryRoutes } from './libraries.js';
import { searchRoutes } from './search.js';
import { jobRoutes } from './jobs.js';

/**
 * Register all API routes
 *
 * @param app - Express application
 */
export function registerRoutes(app: Express): void {
  logger.info('Registering routes...');

  // Health & Metrics (no auth required)
  app.use('/', healthRoutes());
  app.use('/', metricsRoutes());

  // Authentication
  app.use('/api/auth', authRoutes());

  // API routes (auth required in Phase 1)
  app.use('/api/libraries', libraryRoutes());
  app.use('/api/search', searchRoutes());
  app.use('/api/jobs', jobRoutes());

  logger.info('Routes registered', {
    routes: [
      'GET /health',
      'GET /metrics',
      'POST /api/auth/token',
      'GET/POST /api/libraries',
      'POST /api/search',
      'GET /api/jobs/:id'
    ]
  });
}
```

**Deliverable**: Route registration orchestrator.

---

### 6. Route Handlers (Stubs)

#### src/routes/health.ts
```typescript
import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Health check routes
 */
export function healthRoutes(): Router {
  const router = Router();

  router.get('/health', (req, res) => {
    logger.debug('Health check');

    // TODO Phase 1: Check database connectivity

    res.json({
      status: 'ok',
      version: '0.1.0',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}
```

#### src/routes/metrics.ts
```typescript
import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Prometheus metrics endpoint
 */
export function metricsRoutes(): Router {
  const router = Router();

  router.get('/metrics', (req, res) => {
    logger.debug('Metrics requested');

    // TODO Phase 1: Implement Prometheus metrics

    res.set('Content-Type', 'text/plain');
    res.send('# STUB: Metrics not implemented yet\n');
  });

  return router;
}
```

#### src/routes/libraries.ts
```typescript
import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Library management routes
 */
export function libraryRoutes(): Router {
  const router = Router();

  // GET /api/libraries - List all libraries
  router.get('/', (req, res) => {
    logger.info('GET /api/libraries (STUB)');

    // TODO Phase 1: Query storage for libraries

    res.json({
      libraries: [],
      total: 0,
      message: 'STUB: Library listing not implemented yet'
    });
  });

  // POST /api/libraries - Add library to indexing queue
  router.post('/', (req, res) => {
    logger.info('POST /api/libraries (STUB)', { body: req.body });

    // TODO Phase 1: Add to job queue

    res.status(202).json({
      job_id: 'stub-job-id',
      message: 'STUB: Job queuing not implemented yet'
    });
  });

  // GET /api/libraries/:id - Get library details
  router.get('/:id', (req, res) => {
    logger.info('GET /api/libraries/:id (STUB)', { id: req.params.id });

    // TODO Phase 1: Query storage

    res.json({
      library: null,
      message: 'STUB: Library lookup not implemented yet'
    });
  });

  return router;
}
```

#### src/routes/search.ts
```typescript
import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Search routes
 */
export function searchRoutes(): Router {
  const router = Router();

  // POST /api/search - Semantic + keyword search
  router.post('/', (req, res) => {
    logger.info('POST /api/search (STUB)', { body: req.body });

    // TODO Phase 1: Implement search

    res.json({
      results: [],
      took_ms: 0,
      message: 'STUB: Search not implemented yet'
    });
  });

  return router;
}
```

#### src/routes/auth.ts
```typescript
import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Authentication routes
 */
export function authRoutes(): Router {
  const router = Router();

  // POST /api/auth/token - Generate JWT token
  router.post('/token', (req, res) => {
    logger.info('POST /api/auth/token (STUB)');

    // TODO Phase 1: Verify credentials, generate JWT

    res.json({
      token: 'stub-jwt-token',
      message: 'STUB: Authentication not implemented yet'
    });
  });

  return router;
}
```

#### src/routes/jobs.ts
```typescript
import { Router } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Job status routes
 */
export function jobRoutes(): Router {
  const router = Router();

  // GET /api/jobs/:id - Check job status
  router.get('/:id', (req, res) => {
    logger.info('GET /api/jobs/:id (STUB)', { id: req.params.id });

    // TODO Phase 1: Query job queue

    res.json({
      id: req.params.id,
      status: 'pending',
      message: 'STUB: Job status not implemented yet'
    });
  });

  return router;
}
```

**Deliverable**: All route handlers as stubs.

---

### 7. Middleware

#### src/middleware/request-logging.ts
```typescript
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Request/response logging middleware
 */
export function requestLogging() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log request
    logger.info('Incoming request', {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;

      logger.info('Request completed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration
      });
    });

    next();
  };
}
```

#### src/middleware/error-handler.ts
```typescript
import type { Request, Response, NextFunction } from 'express';
import { Codex7Error } from '@codex7/shared';
import { logger } from '../utils/logger.js';

/**
 * Global error handling middleware
 *
 * Catches all errors and formats them consistently.
 */
export function errorHandler() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Request error', {
      error: err.message,
      stack: err.stack,
      path: req.path
    });

    // Handle Codex7 errors
    if (err instanceof Codex7Error) {
      return res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
          context: err.context
        }
      });
    }

    // Handle unknown errors
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  };
}
```

#### src/middleware/authentication.ts
```typescript
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * JWT authentication middleware
 *
 * STUB: Just logs and allows all requests.
 * Real implementation in Phase 1.
 */
export function authenticate() {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.debug('Authentication check (STUB - allowing all)');

    // TODO Phase 1:
    // 1. Extract JWT from Authorization header
    // 2. Verify JWT signature
    // 3. Check expiration
    // 4. Attach user to req.user

    next();
  };
}
```

**Deliverable**: Middleware pipeline with logging and error handling.

---

### 8. Entry Point

#### src/index.ts
```typescript
import { createApp } from './app.js';
import { APIServer } from './server.js';
import { logger } from './utils/logger.js';

/**
 * Main entry point for REST API
 */
async function main() {
  logger.info('Starting Codex7 REST API...');

  // Configuration from environment
  const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    corsOrigins: (process.env.CORS_ORIGINS || '*').split(','),
    enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false'
  };

  // Create Express app
  const app = createApp(config);

  // Create server
  const server = new APIServer(app, config.port);

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down...');
    await server.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down...');
    await server.shutdown();
    process.exit(0);
  });

  // Start server
  try {
    await server.start();
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('Fatal error', { error });
    process.exit(1);
  });
}
```

**Deliverable**: Runnable entry point.

---

### 9. Logger Setup

#### src/utils/logger.ts
```typescript
import { initializeLogger } from '@codex7/shared';

/**
 * Logger instance for API server
 */
export const logger = initializeLogger('api');
```

---

### 10. Testing Framework

#### src/__tests__/app.test.ts
```typescript
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

  describe('POST /api/libraries', () => {
    it('should accept library submission (stub)', async () => {
      const response = await request(app)
        .post('/api/libraries')
        .send({ type: 'github', source: 'https://github.com/facebook/react' })
        .expect(202);

      expect(response.body.job_id).toBeDefined();
    });
  });
});
```

**Deliverable**: Test suite using supertest.

---

### 11. Package Exports

#### src/index.ts (also export app factory)
```typescript
export { createApp, type APIConfig } from './app.js';
export { APIServer } from './server.js';
```

---

## ✅ Success Criteria

This phase is complete when:

- [ ] All directories and files created
- [ ] `pnpm install` runs successfully
- [ ] `pnpm build` compiles without errors
- [ ] `pnpm test` runs all tests
- [ ] `pnpm dev` starts server on port 3000
- [ ] All endpoints return stub responses
- [ ] Health check works
- [ ] Error handling middleware catches errors
- [ ] Request logging works

---

## 🚫 What We're NOT Doing

- ❌ Implementing actual endpoints
- ❌ Connecting to storage
- ❌ Implementing authentication
- ❌ Rate limiting logic
- ❌ Search functionality

---

## 📚 References

- [Architecture](../../docs/ARCHITECTURE.md) - REST API design
- [PLAN.md](../../PLAN.md#rest-api) - API specifications

---

**Made with 💜 by the Codex7 team**

*"Building REST foundations, one endpoint at a time"* 🌐✨
