# 📝 Logging & Observability in Codex7

> **Comprehensive structured logging and distributed tracing with wonder-logger**

---

## 🎯 Overview

Codex7 uses **[@jenova-marie/wonder-logger](https://github.com/jenova-marie/wonder-logger)** for all logging and observability needs. Wonder-logger combines Pino's fast structured logging with OpenTelemetry's distributed tracing, providing comprehensive application instrumentation without singleton state.

### Why Wonder-Logger?

- ✨ **Structured Logging**: Fast JSON-based logging via Pino
- 🔍 **Distributed Tracing**: Full OpenTelemetry SDK integration
- 📊 **Metrics Collection**: Prometheus and OTLP exporters
- 🎯 **Trace Context Correlation**: Automatic trace ID injection into logs
- 🏗️ **Zero Globals**: Factory pattern, no singleton dependencies
- 🧪 **Testable**: In-memory transport for testing
- 💜 **Type-Safe**: Full TypeScript support

---

## 🏗️ Architecture

### Service-Level Configuration

Each Codex7 service has its own `wonder-logger.yaml` configuration file at the package root:

```
packages/
├── mcp-server/
│   └── wonder-logger.yaml
├── api/
│   └── wonder-logger.yaml
├── indexer/
│   └── wonder-logger.yaml
└── storage-postgres/
    └── wonder-logger.yaml
```

### Shared Observability Backend

All services send telemetry to a unified observability stack:

- 📊 **Grafana Loki** - Log aggregation
- 🔍 **Grafana Tempo** - Distributed tracing
- 📈 **Prometheus** - Metrics collection
- 📉 **Grafana** - Unified visualization dashboard

---

## ⚙️ Configuration

### YAML Structure

Wonder-logger uses environment-variable-interpolated YAML configuration:

```yaml
service:
  name: ${SERVICE_NAME:-codex7-api}
  version: ${SERVICE_VERSION:-0.1.0}
  environment: ${NODE_ENV:-development}

logger:
  enabled: true
  level: ${LOG_LEVEL:-info}
  redact:
    - password
    - token
    - apiKey
  transports:
    - type: console
      pretty: ${LOG_PRETTY:-false}
    - type: otel
      endpoint: ${OTEL_LOGS_ENDPOINT:-http://localhost:4318/v1/logs}
  plugins:
    traceContext: true

otel:
  enabled: true
  tracing:
    enabled: true
    exporter: ${OTEL_TRACE_EXPORTER:-otlp}
    endpoint: ${OTEL_TRACES_ENDPOINT:-http://localhost:4318/v1/traces}
    sampleRate: 1.0
  metrics:
    enabled: true
    exporters:
      - type: prometheus
        port: ${PROMETHEUS_PORT:-9464}
      - type: otlp
        endpoint: ${OTEL_METRICS_ENDPOINT:-http://localhost:4318/v1/metrics}
```

### Environment Variable Syntax

- **Required**: `${VAR_NAME}` - Throws error if unset
- **Optional**: `${VAR_NAME:-default}` - Uses default if unset

---

## 🚀 Usage Patterns

### Basic Logger Setup

```typescript
import { createLoggerFromConfig, createTelemetryFromConfig } from 'wonder-logger';

// Initialize OpenTelemetry SDK (once per service)
const sdk = createTelemetryFromConfig();

// Create logger (can create multiple)
const logger = createLoggerFromConfig();
```

### Logger Methods

All logging levels follow the same signature:

```typescript
logger.trace([data], [message], [...interpolation])
logger.debug([data], [message], [...interpolation])
logger.info([data], [message], [...interpolation])
logger.warn([data], [message], [...interpolation])
logger.error([data], [message], [...interpolation])
logger.fatal([data], [message], [...interpolation])
```

### Critical Rule: Data Objects First! ⚠️

**Always** put data objects **before** message strings:

```typescript
// ✅ CORRECT - Data object first
logger.info({ userId: 123, libraryId: '/vercel/next.js' }, 'Library indexed');

// ❌ INCORRECT - Data is lost!
logger.info('Library indexed', { userId: 123, libraryId: '/vercel/next.js' });
```

This follows Pino's signature and ensures structured data is properly captured.

---

## 📚 Service-Specific Patterns

### MCP Server

```typescript
import { createLoggerFromConfig, withTraceContext, withSpan } from 'wonder-logger';

const logger = withTraceContext(createLoggerFromConfig());

// Log MCP tool calls
logger.info(
  {
    tool: 'resolve-library-id',
    libraryName: 'next.js',
    requestId: req.id,
  },
  'Resolving library ID'
);

// Trace expensive operations
const results = await withSpan('semantic-search', async () => {
  return await storage.semanticSearch(query);
});
```

### REST API (Express)

```typescript
import express from 'express';
import morgan from 'morgan';
import { createLoggerFromConfig, withTraceContext, createMorganStream } from 'wonder-logger';

const logger = withTraceContext(createLoggerFromConfig());
const app = express();

// HTTP request logging
app.use(morgan('combined', { stream: createMorganStream(logger) }));

// Request handler
app.get('/api/libraries/:id', async (req, res) => {
  req.logger.info({ libraryId: req.params.id }, 'Fetching library');

  const result = await storage.getLibrary(req.params.id);

  if (result.isErr()) {
    req.logger.error({ err: result.error }, 'Failed to fetch library');
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.json(result.value);
});
```

### Indexer Service

```typescript
import { createLoggerFromConfig, withSpan } from 'wonder-logger';

const logger = createLoggerFromConfig();

async function indexLibrary(libraryId: string) {
  logger.info({ libraryId }, 'Starting library indexing');

  const docs = await withSpan('fetch-documentation', async () => {
    return await fetchDocumentation(libraryId);
  });

  logger.debug({ libraryId, docCount: docs.length }, 'Fetched documentation');

  const embeddings = await withSpan('generate-embeddings', async () => {
    return await generateEmbeddings(docs);
  });

  logger.info({ libraryId, embeddingCount: embeddings.length }, 'Generated embeddings');

  await withSpan('store-documents', async () => {
    return await storage.indexDocuments(embeddings);
  });

  logger.info({ libraryId }, 'Library indexing complete');
}
```

### Storage Adapter

```typescript
import { createLoggerFromConfig } from 'wonder-logger';

export class PostgresStorageAdapter implements StorageAdapter {
  private logger = createLoggerFromConfig();

  async semanticSearch(options: SearchOptions): Promise<StorageResult<SearchResult[]>> {
    this.logger.debug({ query: options.query, limit: options.limit }, 'Semantic search');

    try {
      const results = await this.pool.query(/* ... */);

      this.logger.info(
        { query: options.query, resultCount: results.rows.length },
        'Search completed'
      );

      return ok(results.rows);
    } catch (err) {
      this.logger.error({ err, query: options.query }, 'Search failed');
      return err(databaseQueryError('Semantic search failed', err));
    }
  }
}
```

---

## 🎯 Standard Logging Patterns

### Result Type Integration

Combine wonder-logger with ts-rust-result for comprehensive error tracking:

```typescript
import { ok, err, type StorageResult } from '@codex7/shared';
import { createLoggerFromConfig } from 'wonder-logger';

const logger = createLoggerFromConfig();

async function processDocument(docId: string): Promise<StorageResult<Document>> {
  logger.debug({ docId }, 'Processing document');

  const result = await storage.getDocument(docId);

  if (result.isErr()) {
    logger.error(
      { err: result.error, docId },
      'Failed to fetch document'
    );
    return err(result.error);
  }

  logger.info({ docId, document: result.value }, 'Document processed');
  return ok(result.value);
}
```

### Error Logging

Wonder-logger automatically serializes Error objects:

```typescript
try {
  await riskyOperation();
} catch (err) {
  // Error is automatically serialized with stack trace
  logger.error(
    { err, userId: 123, operation: 'indexing' },
    'Operation failed'
  );

  // Re-throw or return Result
  return err(operationError('Indexing failed', err));
}
```

### Sensitive Data Redaction

Configure redaction in `wonder-logger.yaml`:

```yaml
logger:
  redact:
    - password
    - token
    - apiKey
    - 'user.email'
    - 'req.headers.authorization'
```

Redacted fields show `[Redacted]` in logs.

---

## 🧪 Testing with In-Memory Transport

Use the memory transport for testing:

```typescript
// wonder-logger.test.yaml
logger:
  transports:
    - type: memory
      name: test-service
      maxSize: 10000
      level: debug
```

Query logs in tests:

```typescript
import { getMemoryLogs } from 'wonder-logger';

describe('Library indexing', () => {
  it('should log indexing progress', async () => {
    await indexLibrary('/vercel/next.js');

    const logs = getMemoryLogs('test-service', {
      since: Date.now() - 10000,
      level: ['info'],
      format: 'parsed',
    });

    expect(logs).toContainEqual(
      expect.objectContaining({
        msg: 'Library indexing complete',
        libraryId: '/vercel/next.js',
      })
    );
  });
});
```

---

## 📊 Observability Stack Integration

### Development Environment

```bash
# Start observability stack
docker-compose up -d loki tempo prometheus grafana

# Services automatically connect via wonder-logger.yaml
pnpm dev
```

### Production Environment

Set environment variables for production backends:

```bash
# Loki (logs)
OTEL_LOGS_ENDPOINT=https://loki.codex7.dev/v1/logs

# Tempo (traces)
OTEL_TRACES_ENDPOINT=https://tempo.codex7.dev/v1/traces

# Prometheus (metrics)
OTEL_METRICS_ENDPOINT=https://prometheus.codex7.dev/v1/metrics
```

### Grafana Dashboards

Access unified dashboards at `http://localhost:3001`:

- **Logs**: Search and filter across all services
- **Traces**: End-to-end request tracing
- **Metrics**: Service health and performance
- **Correlation**: Click trace ID in logs to view full trace

---

## 🎯 Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| `trace` | Fine-grained debugging | Function entry/exit, variable values |
| `debug` | Development debugging | Query parameters, intermediate results |
| `info` | **Standard logging** | Request handling, operations completed |
| `warn` | Recoverable issues | Deprecated API usage, fallback behavior |
| `error` | Operation failures | Database errors, API failures |
| `fatal` | Service-level failures | Cannot connect to database, critical dependency unavailable |

**Default level**: `info` in production, `debug` in development

---

## 🔍 Distributed Tracing

### Automatic Instrumentation

Wonder-logger automatically instruments:

- ✅ HTTP requests (incoming and outgoing)
- ✅ Database queries (with compatible drivers)
- ✅ File system operations
- ✅ Network calls

### Manual Spans

Add spans for critical operations:

```typescript
import { withSpan } from 'wonder-logger';

const embeddings = await withSpan('generate-embeddings', async () => {
  // This operation will be traced
  return await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: documents,
  });
});
```

### Trace Context Propagation

Enable the trace context plugin:

```yaml
logger:
  plugins:
    traceContext: true
```

This automatically injects `traceId` and `spanId` into all log entries, enabling correlation between logs and traces.

---

## 📈 Metrics Collection

### Prometheus Metrics

Each service exposes metrics on its configured port:

- `codex7-mcp-server`: `:9464/metrics`
- `codex7-api`: `:9465/metrics`
- `codex7-indexer`: `:9466/metrics`

### Custom Metrics

```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('codex7-indexer');

const documentsIndexed = meter.createCounter('documents_indexed', {
  description: 'Number of documents indexed',
});

documentsIndexed.add(1, { libraryId: '/vercel/next.js' });
```

---

## 🛡️ Security Best Practices

### 1. Redact Sensitive Data

Always redact sensitive fields:

```yaml
logger:
  redact:
    - password
    - token
    - apiKey
    - 'user.email'
    - 'req.headers.authorization'
    - 'req.headers.cookie'
```

### 2. Avoid Logging User Data

Never log PII (Personally Identifiable Information) unless absolutely necessary and properly secured.

### 3. Rate Limiting

In high-throughput scenarios, consider sampling:

```yaml
otel:
  tracing:
    sampleRate: 0.1  # Trace 10% of requests
```

### 4. Secure Transport

Always use HTTPS/TLS for production OTLP endpoints:

```bash
OTEL_LOGS_ENDPOINT=https://loki.codex7.dev/v1/logs
OTEL_TRACES_ENDPOINT=https://tempo.codex7.dev/v1/traces
```

---

## 🎨 Emoji Conventions

Use emojis in log messages for visual scanning:

```typescript
logger.info({ libraryId }, '🚀 Starting library indexing');
logger.info({ count: docs.length }, '📚 Fetched documentation');
logger.info({ count: embeddings.length }, '✨ Generated embeddings');
logger.info({ libraryId }, '✅ Indexing complete');

logger.warn({ apiKey: 'old-key' }, '⚠️ Deprecated API key format');
logger.error({ err }, '❌ Database connection failed');
```

Common emoji patterns:
- 🚀 Starting operations
- ✅ Success
- ❌ Errors
- ⚠️ Warnings
- 🔍 Searching/querying
- 📚 Documentation operations
- ✨ Generation/creation
- 💾 Storage operations
- 🌐 Network operations

---

## 📋 Configuration Checklist

### Development

- [ ] `LOG_LEVEL=debug`
- [ ] `LOG_PRETTY=true` (human-readable console output)
- [ ] Console transport enabled
- [ ] Memory transport enabled (for testing)
- [ ] Local observability stack running

### Production

- [ ] `LOG_LEVEL=info`
- [ ] `LOG_PRETTY=false` (JSON output)
- [ ] OTLP transport enabled
- [ ] Sensitive data redaction configured
- [ ] Trace sampling configured
- [ ] Production OTLP endpoints configured
- [ ] Metrics exporters enabled

---

## 🔗 References

- **Wonder-Logger GitHub**: https://github.com/jenova-marie/wonder-logger
- **Pino Documentation**: https://getpino.io/
- **OpenTelemetry Docs**: https://opentelemetry.io/docs/
- **Grafana Loki**: https://grafana.com/oss/loki/
- **Grafana Tempo**: https://grafana.com/oss/tempo/

---

## 💡 Tips & Tricks

### 1. Request ID Tracking

Generate unique request IDs for correlation:

```typescript
import { randomUUID } from 'crypto';

app.use((req, res, next) => {
  req.id = randomUUID();
  req.logger = logger.child({ requestId: req.id });
  next();
});
```

### 2. Child Loggers

Create child loggers with bound context:

```typescript
const requestLogger = logger.child({
  requestId: req.id,
  userId: req.user?.id,
});

requestLogger.info('Processing request');
// Automatically includes requestId and userId
```

### 3. Performance Monitoring

Use spans to measure operation duration:

```typescript
const result = await withSpan('expensive-operation', async () => {
  // Operation duration automatically tracked
  return await doExpensiveWork();
});
```

### 4. Graceful Shutdown

Flush logs and traces on shutdown:

```typescript
process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down gracefully');

  await sdk.shutdown();

  process.exit(0);
});
```

---

**Made with 💜 by Jenova Marie**

*"Beautiful logs for beautiful code"* ✨
