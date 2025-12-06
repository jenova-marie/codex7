import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

/**
 * Get database URL from environment
 */
function getDatabaseUrl(): string {
  const url = process.env.CODEX7_PG_URL;
  if (!url) {
    throw new Error(
      "CODEX7_PG_URL environment variable is required. " +
        "Set it to your PostgreSQL connection string, e.g., " +
        "postgres://user:pass@db.rso:5432/codex7"
    );
  }
  return url;
}

/**
 * PostgreSQL client singleton
 * Uses lazy initialization to avoid connection issues at import time
 */
let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Get the database client, initializing if needed
 */
export function getDb() {
  if (!_db) {
    const url = getDatabaseUrl();
    _client = postgres(url, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    _db = drizzle(_client, { schema });
  }
  return _db;
}

/**
 * Close the database connection
 * Call this when shutting down the application
 */
export async function closeDb() {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}

/**
 * Check if the database is configured
 */
export function isDbConfigured(): boolean {
  return !!process.env.CODEX7_PG_URL;
}

// Re-export schema for convenience
export * from "./schema.js";
