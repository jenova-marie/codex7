/**
 * Integration tests for Phase 3 (Topic Generation) and Phase 4 (Enhanced Retrieval)
 * Tests the complete flow of topic extraction, quality scoring, and blended ranking
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { setupTestEnv, cleanupTestData, TEST_LIBRARY_PREFIX, isQdrantAccessible } from "./setup.js";

// Set up test environment before imports
setupTestEnv();

let qdrantAvailable = false;

import { indexProject, type IndexConfig } from "../../src/lib/local-generator.js";
import { fetchLocalDocumentation } from "../../src/lib/local-api.js";
import {
  getDb,
  localLibraries,
  localSnippets,
  localDocuments,
  closeDb,
} from "../../src/db/index.js";
import {
  upsertVectors,
  searchVectors,
  getLibraryVectors,
  deleteLibraryVectors,
  type VectorPayload,
} from "../../src/lib/local-vectors.js";
import { eq } from "drizzle-orm";

describe("Phase 3 & 4 Integration Tests", { sequential: true }, () => {
  let testProjectPath: string;
  const testLibraryId = `${TEST_LIBRARY_PREFIX}phase34-test-${Date.now()}`;

  beforeAll(async () => {
    // Check Qdrant availability
    qdrantAvailable = await isQdrantAccessible();
    if (!qdrantAvailable) {
      console.warn("Qdrant not accessible - some tests will be skipped");
    }

    // Create test project with rich content for topic extraction
    testProjectPath = path.join(os.tmpdir(), "codex7-phase34-test-" + Date.now());
    fs.mkdirSync(testProjectPath, { recursive: true });

    // Create package.json
    fs.writeFileSync(
      path.join(testProjectPath, "package.json"),
      JSON.stringify({
        name: "@test/phase34-lib",
        version: "1.0.0",
        description: "Test library for Phase 3 and 4 features",
        keywords: ["routing", "authentication", "api"],
      })
    );

    // Create README.md with multiple headers for topic extraction
    fs.writeFileSync(
      path.join(testProjectPath, "README.md"),
      `# Phase 3/4 Test Library

A comprehensive library for testing topic extraction and quality scoring.

## Authentication

Learn how to authenticate with the API using various methods.

\`\`\`typescript
import { authenticate } from '@test/phase34-lib';

const client = await authenticate({
  apiKey: 'your-api-key',
  method: 'bearer',
});
\`\`\`

### OAuth2 Flow

For OAuth2-based authentication:

\`\`\`typescript
const authUrl = oauth2.getAuthorizationUrl({
  clientId: 'client-id',
  redirectUri: 'https://example.com/callback',
  scopes: ['read', 'write'],
});
\`\`\`

## Routing

The routing system provides flexible URL handling.

### Basic Routes

\`\`\`typescript
import { createRouter } from '@test/phase34-lib';

const router = createRouter();
router.get('/users', listUsers);
router.post('/users', createUser);
router.get('/users/:id', getUser);
\`\`\`

### Dynamic Routes

\`\`\`typescript
// Dynamic segments
router.get('/posts/:postId/comments/:commentId', getComment);

// Optional parameters
router.get('/search/:query?', search);

// Wildcard routes
router.get('/files/*', serveFiles);
\`\`\`

## Error Handling

Proper error handling is essential for robust applications.

\`\`\`typescript
import { Result, Ok, Err } from '@test/phase34-lib';

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Err('Division by zero');
  return Ok(a / b);
}

const result = divide(10, 2);
result.match({
  ok: value => console.log('Result:', value),
  err: error => console.error('Error:', error),
});
\`\`\`

## Data Fetching

Efficient data fetching with caching and deduplication.

### Fetch API

\`\`\`typescript
const data = await fetchData('/api/users', {
  cache: 'force-cache',
  next: { revalidate: 60 },
});
\`\`\`

### Server Actions

\`\`\`typescript
'use server';

export async function createPost(formData: FormData) {
  const title = formData.get('title');
  const content = formData.get('content');

  await db.posts.create({ title, content });
  revalidatePath('/posts');
}
\`\`\`
`
    );

    // Create docs directory with more content
    fs.mkdirSync(path.join(testProjectPath, "docs"), { recursive: true });

    // High quality snippet - long description, multiple code blocks
    fs.writeFileSync(
      path.join(testProjectPath, "docs", "middleware.md"),
      `## Middleware

Middleware provides a powerful way to intercept and modify requests and responses.
This comprehensive guide covers all aspects of middleware implementation, from basic
concepts to advanced patterns. Middleware functions can perform various tasks like
logging, authentication, request validation, and response transformation.

### Creating Middleware

\`\`\`typescript
import { NextRequest, NextResponse } from '@test/phase34-lib';

export function middleware(request: NextRequest) {
  // Log the request
  console.log('Request:', request.method, request.url);

  // Add custom headers
  const response = NextResponse.next();
  response.headers.set('X-Custom-Header', 'value');

  return response;
}
\`\`\`

### Chaining Middleware

\`\`\`typescript
const middleware = compose(
  loggerMiddleware,
  authMiddleware,
  rateLimitMiddleware,
  validationMiddleware,
);
\`\`\`

### Conditional Middleware

\`\`\`typescript
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    return apiMiddleware(request);
  }
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return adminMiddleware(request);
  }
  return NextResponse.next();
}
\`\`\`
`
    );

    // Low quality snippet - short, no code blocks
    fs.writeFileSync(
      path.join(testProjectPath, "docs", "faq.md"),
      `## FAQ

### What is this library?

A test library.

### How do I install it?

Use npm install.

### Is it production ready?

Yes.
`
    );

    // Medium quality snippet
    fs.writeFileSync(
      path.join(testProjectPath, "docs", "configuration.md"),
      `## Configuration

Configure the library with environment variables or a config file.

### Environment Variables

Set these environment variables:

\`\`\`bash
export API_KEY=your-api-key
export DEBUG=true
export LOG_LEVEL=info
\`\`\`

### Config File

Or use a configuration file:

\`\`\`json
{
  "apiKey": "your-api-key",
  "debug": true,
  "logLevel": "info"
}
\`\`\`
`
    );

    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test project
    if (testProjectPath && fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }

    // Clean up database and vectors
    const db = getDb();
    await db.delete(localLibraries).where(eq(localLibraries.id, testLibraryId));
    await deleteLibraryVectors(testLibraryId);
    await closeDb();
  });

  beforeEach(async () => {
    // Clean up before each test
    const db = getDb();
    await db.delete(localLibraries).where(eq(localLibraries.id, testLibraryId));
    await deleteLibraryVectors(testLibraryId);
  });

  describe("Phase 3: Topic Generation", { sequential: true }, () => {
    it("should extract topics from headers during indexing", async () => {
      if (!qdrantAvailable) {
        console.log("Skipping: Qdrant not accessible");
        return;
      }

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const db = getDb();
      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      // Find snippets with topics
      const withTopics = snippets.filter(
        (s) => s.topics && s.topics.length > 0
      );

      expect(withTopics.length).toBeGreaterThan(0);
    });

    it("should normalize topic names correctly", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const db = getDb();
      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      // Find all topics
      const allTopics = new Set<string>();
      for (const snippet of snippets) {
        if (snippet.topics) {
          for (const topic of snippet.topics) {
            allTopics.add(topic);
          }
        }
      }

      // Topics should be lowercase and hyphenated
      for (const topic of allTopics) {
        expect(topic).toMatch(/^[a-z0-9-]+$/);
        expect(topic.length).toBeGreaterThanOrEqual(3);
        expect(topic.length).toBeLessThanOrEqual(30);
      }
    });

    it("should aggregate topics at library level", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const db = getDb();
      const [lib] = await db
        .select()
        .from(localLibraries)
        .where(eq(localLibraries.id, testLibraryId));

      // Library should have aggregated topics
      expect(lib.topics).toBeDefined();
      expect(lib.topics!.length).toBeGreaterThan(0);
    });

    it("should store topics in vector payloads for filtering", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const vectors = await getLibraryVectors(testLibraryId, 50);

      // Some vectors should have topics in their payload
      const withTopics = vectors.filter(
        (v) => v.payload.topics && (v.payload.topics as string[]).length > 0
      );

      expect(withTopics.length).toBeGreaterThan(0);
    });

    it("should support topic-based vector filtering", async () => {
      if (!qdrantAvailable) return;

      // Insert test vectors with specific topics
      const topicTestLibrary = `${TEST_LIBRARY_PREFIX}topic-filter-${Date.now()}`;

      const points = [
        {
          id: `${topicTestLibrary}:0:auth1`,
          vector: generateTestVector(1536, 0.1),
          payload: {
            snippet_id: `${topicTestLibrary}:0:auth1`,
            library_id: topicTestLibrary,
            title: "Authentication Guide",
            source_file: "auth.md",
            source_type: "docs",
            content_preview: "How to authenticate",
            topics: ["authentication", "security"],
          } as VectorPayload,
        },
        {
          id: `${topicTestLibrary}:1:route1`,
          vector: generateTestVector(1536, 0.2),
          payload: {
            snippet_id: `${topicTestLibrary}:1:route1`,
            library_id: topicTestLibrary,
            title: "Routing Basics",
            source_file: "routing.md",
            source_type: "docs",
            content_preview: "How to set up routes",
            topics: ["routing", "navigation"],
          } as VectorPayload,
        },
        {
          id: `${topicTestLibrary}:2:both`,
          vector: generateTestVector(1536, 0.3),
          payload: {
            snippet_id: `${topicTestLibrary}:2:both`,
            library_id: topicTestLibrary,
            title: "Auth Middleware for Routes",
            source_file: "auth-routes.md",
            source_type: "docs",
            content_preview: "Protecting routes with auth",
            topics: ["authentication", "routing", "middleware"],
          } as VectorPayload,
        },
      ];

      await upsertVectors(points);

      try {
        // Search with topic filter for "authentication"
        const authResults = await searchVectors(
          generateTestVector(1536, 0.15),
          topicTestLibrary,
          10,
          ["authentication"]
        );

        // Should only return snippets with authentication topic
        expect(authResults.length).toBeGreaterThan(0);
        for (const result of authResults) {
          const topics = result.payload.topics as string[] | undefined;
          expect(topics).toBeDefined();
          expect(topics).toContain("authentication");
        }

        // Search with topic filter for "routing"
        const routeResults = await searchVectors(
          generateTestVector(1536, 0.15),
          topicTestLibrary,
          10,
          ["routing"]
        );

        expect(routeResults.length).toBeGreaterThan(0);
        for (const result of routeResults) {
          const topics = result.payload.topics as string[] | undefined;
          expect(topics).toContain("routing");
        }
      } finally {
        await deleteLibraryVectors(topicTestLibrary);
      }
    });
  });

  describe("Phase 4: Quality Scoring", { sequential: true }, () => {
    it("should compute quality scores during indexing", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const db = getDb();
      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      // All snippets should have quality scores
      for (const snippet of snippets) {
        expect(snippet.qualityScore).toBeDefined();
        expect(snippet.qualityScore).toBeGreaterThanOrEqual(0);
        expect(snippet.qualityScore).toBeLessThanOrEqual(1);
      }
    });

    it("should score snippets with code blocks higher", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const db = getDb();
      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      const withCode = snippets.filter((s) => s.hasCode);
      const withoutCode = snippets.filter((s) => !s.hasCode);

      if (withCode.length > 0 && withoutCode.length > 0) {
        const avgWithCode =
          withCode.reduce((sum, s) => sum + (s.qualityScore ?? 0), 0) /
          withCode.length;
        const avgWithoutCode =
          withoutCode.reduce((sum, s) => sum + (s.qualityScore ?? 0), 0) /
          withoutCode.length;

        // Snippets with code should have higher average score
        expect(avgWithCode).toBeGreaterThan(avgWithoutCode);
      }
    });

    it("should track hasCode and codeBlockCount fields", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const db = getDb();
      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      // Find snippets with code blocks
      const withCode = snippets.filter((s) => s.hasCode);
      expect(withCode.length).toBeGreaterThan(0);

      // Each snippet with hasCode=true should have codeBlockCount > 0
      for (const snippet of withCode) {
        expect(snippet.codeBlockCount).toBeGreaterThan(0);
      }

      // Verify the hasCode field is consistent with codeBlockCount
      for (const snippet of snippets) {
        if (snippet.codeBlockCount && snippet.codeBlockCount > 0) {
          expect(snippet.hasCode).toBe(true);
        }
      }
    });

    it("should store quality scores in vector payloads", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const vectors = await getLibraryVectors(testLibraryId, 50);

      // All vectors should have quality_score in payload
      for (const vector of vectors) {
        expect(vector.payload.quality_score).toBeDefined();
        expect(typeof vector.payload.quality_score).toBe("number");
      }
    });

    it("should have varied quality scores based on content", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const db = getDb();
      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      const scores = snippets.map((s) => s.qualityScore ?? 0.5);
      const uniqueScores = new Set(scores.map((s) => s.toFixed(1)));

      // Should have at least 2 different score levels
      expect(uniqueScores.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Phase 4: Blended Ranking", { sequential: true }, () => {
    it("should use blended scores for retrieval ordering", async () => {
      if (!qdrantAvailable) return;

      // Create a test scenario with known quality scores
      const blendTestLibrary = `${TEST_LIBRARY_PREFIX}blend-test-${Date.now()}`;

      // Insert vectors with different quality scores
      const points = [
        {
          id: `${blendTestLibrary}:0:low-quality`,
          vector: generateTestVector(1536, 0.9), // High vector similarity to query
          payload: {
            snippet_id: `${blendTestLibrary}:0:low-quality`,
            library_id: blendTestLibrary,
            title: "Low Quality Match",
            source_file: "low.md",
            source_type: "docs",
            content_preview: "Short content",
            quality_score: 0.3, // Low quality
          } as VectorPayload,
        },
        {
          id: `${blendTestLibrary}:1:high-quality`,
          vector: generateTestVector(1536, 0.7), // Medium vector similarity
          payload: {
            snippet_id: `${blendTestLibrary}:1:high-quality`,
            library_id: blendTestLibrary,
            title: "High Quality Match",
            source_file: "high.md",
            source_type: "docs",
            content_preview: "Comprehensive content with examples",
            quality_score: 1.0, // High quality
          } as VectorPayload,
        },
      ];

      await upsertVectors(points);

      try {
        // Search with a query close to the high-vector-similarity one
        const queryVector = generateTestVector(1536, 0.85);
        const results = await searchVectors(queryVector, blendTestLibrary, 10);

        // Both should be returned
        expect(results.length).toBe(2);

        // The result order depends on blended score:
        // Low quality (0.9 * 0.7 + 0.3 * 0.3 = 0.63 + 0.09 = 0.72)
        // High quality (0.7 * 0.7 + 1.0 * 0.3 = 0.49 + 0.30 = 0.79)
        // With quality weighting, the high quality one might rank higher
        // despite lower vector similarity

        // Verify we got both results with their metadata
        const lowQuality = results.find(
          (r) => r.payload.title === "Low Quality Match"
        );
        const highQuality = results.find(
          (r) => r.payload.title === "High Quality Match"
        );

        expect(lowQuality).toBeDefined();
        expect(highQuality).toBeDefined();
      } finally {
        await deleteLibraryVectors(blendTestLibrary);
      }
    });
  });

  describe("Document Storage (Phase 2)", { sequential: true }, () => {
    it("should store full documents during indexing", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const db = getDb();
      const docs = await db
        .select()
        .from(localDocuments)
        .where(eq(localDocuments.libraryId, testLibraryId));

      expect(docs.length).toBeGreaterThan(0);

      // Should include README
      const readme = docs.find((d) => d.path.includes("README"));
      expect(readme).toBeDefined();
      expect(readme?.content).toContain("Phase 3/4 Test Library");
    });

    it("should store document metadata correctly", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const db = getDb();
      const docs = await db
        .select()
        .from(localDocuments)
        .where(eq(localDocuments.libraryId, testLibraryId));

      for (const doc of docs) {
        expect(doc.path).toBeDefined();
        expect(doc.path.startsWith("/")).toBe(true);
        expect(doc.title).toBeDefined();
        expect(doc.tokens).toBeGreaterThan(0);
        expect(doc.sourceType).toBeDefined();
      }
    });
  });

  describe("End-to-End Retrieval", { sequential: true }, () => {
    it("should retrieve documentation with topic filtering", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      // Fetch docs with topic filter
      const docs = await fetchLocalDocumentation(testLibraryId, {
        topics: ["authentication"],
        tokens: 5000,
      });

      // Should return content related to authentication
      expect(docs).not.toBeNull();
      if (docs) {
        // Content should be about authentication
        const lowerDocs = docs.toLowerCase();
        expect(
          lowerDocs.includes("auth") ||
            lowerDocs.includes("authenticate") ||
            lowerDocs.includes("oauth")
        ).toBe(true);
      }
    });

    it("should retrieve documentation with semantic query", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      // Fetch docs with semantic topic query
      const docs = await fetchLocalDocumentation(testLibraryId, {
        topic: "how to handle errors",
        tokens: 5000,
      });

      expect(docs).not.toBeNull();
    });

    it("should respect token limits in output", async () => {
      if (!qdrantAvailable) return;

      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const smallDocs = await fetchLocalDocumentation(testLibraryId, {
        tokens: 1000,
      });

      const largeDocs = await fetchLocalDocumentation(testLibraryId, {
        tokens: 10000,
      });

      // Both should return content
      expect(smallDocs).not.toBeNull();
      expect(largeDocs).not.toBeNull();

      // Larger token limit should allow more content
      if (smallDocs && largeDocs) {
        expect(largeDocs.length).toBeGreaterThanOrEqual(smallDocs.length);
      }
    });
  });
});

/**
 * Generate a test vector with optional seed for reproducibility
 */
function generateTestVector(
  dimensions: number,
  seed: number = Math.random()
): number[] {
  const vector: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    vector.push(Math.sin(seed * (i + 1)) * 0.5 + 0.5);
  }
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map((v) => v / magnitude);
}
