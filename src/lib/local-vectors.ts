import { QdrantClient } from "@qdrant/js-client-rest";

/**
 * Qdrant collection name for local docs
 */
const COLLECTION_NAME = "codex7_local_docs";

/**
 * Vector dimensions for text-embedding-3-small
 */
const VECTOR_SIZE = 1536;

/**
 * Payload schema for stored vectors
 */
export interface VectorPayload {
  snippet_id: string;
  library_id: string;
  title: string;
  source_file: string;
  source_type: string;
  content_preview: string;
  topics?: string[]; // Topic tags for filtering
  [key: string]: unknown; // Index signature for Qdrant compatibility
}

/**
 * Get Qdrant URL from environment
 */
function getQdrantUrl(): string {
  const url = process.env.CODEX7_QDRANT_URL;
  if (!url) {
    throw new Error(
      "CODEX7_QDRANT_URL environment variable is required. " +
        "Set it to your Qdrant instance URL, e.g., " +
        "http://qdrant.rso:6333"
    );
  }
  return url;
}

/**
 * Get Qdrant API key from environment (optional)
 */
function getQdrantApiKey(): string | undefined {
  return process.env.CODEX7_QDRANT_API_KEY;
}

/**
 * Qdrant client singleton
 */
let _client: QdrantClient | null = null;

/**
 * Get the Qdrant client, initializing if needed
 */
export function getQdrantClient(): QdrantClient {
  if (!_client) {
    const url = getQdrantUrl();
    const apiKey = getQdrantApiKey();

    // Parse URL to detect if we need to set explicit port for HTTPS
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";
    const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : isHttps ? 443 : 6333;

    _client = new QdrantClient({
      url,
      apiKey,
      port,
      checkCompatibility: false, // Skip version check
    });
  }
  return _client;
}

/**
 * Check if Qdrant is configured
 */
export function isQdrantConfigured(): boolean {
  return !!process.env.CODEX7_QDRANT_URL;
}

/**
 * Ensure the collection exists, creating if needed
 */
export async function ensureCollection(): Promise<void> {
  const client = getQdrantClient();

  try {
    // Check if collection exists
    const collections = await client.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (!exists) {
      // Create collection with cosine distance
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      });
      console.error(`Created Qdrant collection: ${COLLECTION_NAME}`);
    }
  } catch (error) {
    throw new Error(`Failed to ensure Qdrant collection: ${error}`);
  }
}

/**
 * Upsert vectors for a library's snippets
 */
export async function upsertVectors(
  points: Array<{
    id: string;
    vector: number[];
    payload: VectorPayload;
  }>
): Promise<void> {
  if (points.length === 0) return;

  const client = getQdrantClient();
  await ensureCollection();

  // Qdrant requires numeric or UUID point IDs, so we'll use a hash
  const qdrantPoints = points.map((p) => ({
    id: hashStringToNumber(p.id),
    vector: p.vector,
    payload: p.payload,
  }));

  // Upsert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < qdrantPoints.length; i += batchSize) {
    const batch = qdrantPoints.slice(i, i + batchSize);
    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: batch,
    });
  }
}

/**
 * Search for similar vectors by topic
 * @param queryVector - The embedding vector to search for
 * @param libraryId - Filter to this library
 * @param limit - Maximum number of results
 * @param topics - Optional topic filter (matches any of the provided topics)
 */
export async function searchVectors(
  queryVector: number[],
  libraryId: string,
  limit: number = 20,
  topics?: string[]
): Promise<Array<{ payload: VectorPayload; score: number }>> {
  const client = getQdrantClient();

  try {
    // Build filter conditions
    const mustConditions: Array<Record<string, unknown>> = [
      {
        key: "library_id",
        match: { value: libraryId },
      },
    ];

    // Add topic filter if provided (match any of the topics)
    if (topics && topics.length > 0) {
      mustConditions.push({
        key: "topics",
        match: { any: topics },
      });
    }

    const results = await client.search(COLLECTION_NAME, {
      vector: queryVector,
      limit,
      filter: {
        must: mustConditions,
      },
      with_payload: true,
    });

    return results.map((r) => ({
      payload: r.payload as unknown as VectorPayload,
      score: r.score,
    }));
  } catch (error) {
    console.error(`Qdrant search failed: ${error}`);
    return [];
  }
}

/**
 * Get all vectors for a library (for retrieval without topic)
 */
export async function getLibraryVectors(
  libraryId: string,
  limit: number = 100
): Promise<Array<{ payload: VectorPayload }>> {
  const client = getQdrantClient();

  try {
    const results = await client.scroll(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: "library_id",
            match: { value: libraryId },
          },
        ],
      },
      limit,
      with_payload: true,
    });

    return results.points.map((r) => ({
      payload: r.payload as unknown as VectorPayload,
    }));
  } catch (error) {
    console.error(`Qdrant scroll failed: ${error}`);
    return [];
  }
}

/**
 * Delete all vectors for a library
 */
export async function deleteLibraryVectors(libraryId: string): Promise<void> {
  const client = getQdrantClient();

  try {
    await client.delete(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: "library_id",
            match: { value: libraryId },
          },
        ],
      },
    });
  } catch (error) {
    console.error(`Failed to delete vectors for ${libraryId}: ${error}`);
  }
}

/**
 * Hash a string to a positive integer for Qdrant point ID
 * Uses a simple but effective hash function
 */
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Ensure positive number
  return Math.abs(hash);
}
