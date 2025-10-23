// enable-pgvector.ts
// SQL migration to enable pgvector extension in PostgreSQL
// This must run BEFORE any Drizzle migrations that use vector columns

import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

/**
 * Enable pgvector extension in PostgreSQL
 *
 * This creates the `vector` type and associated functions for similarity search.
 * Must be run with a database user that has CREATE EXTENSION privileges.
 *
 * @param db - Drizzle database instance
 */
export async function enablePgVector(db: PostgresJsDatabase): Promise<void> {
  console.log('🔧 Enabling pgvector extension...');

  try {
    // Enable the pgvector extension
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);

    console.log('✅ pgvector extension enabled successfully');

    // Verify installation
    const result = await db.execute(sql`
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname = 'vector';
    `);

    if (result.rows.length > 0) {
      const version = result.rows[0].extversion;
      console.log(`📦 pgvector version: ${version}`);
    } else {
      console.warn('⚠️  Warning: pgvector extension created but not found in pg_extension');
    }
  } catch (error) {
    console.error('❌ Failed to enable pgvector extension:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Ensure pgvector is installed: brew install pgvector (macOS) or apt install postgresql-16-pgvector (Ubuntu)');
    console.error('   2. Ensure database user has CREATE EXTENSION privileges');
    console.error('   3. For managed databases (RDS, Supabase, etc.), check provider documentation for enabling extensions\n');
    throw error;
  }
}

/**
 * Check if pgvector extension is already enabled
 *
 * @param db - Drizzle database instance
 * @returns true if pgvector is enabled, false otherwise
 */
export async function isPgVectorEnabled(db: PostgresJsDatabase): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as enabled;
    `);

    return result.rows[0]?.enabled === true;
  } catch (error) {
    console.error('❌ Failed to check pgvector status:', error);
    return false;
  }
}

/**
 * Standalone script to enable pgvector
 * Usage: tsx enable-pgvector.ts
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const postgres = await import('postgres');
  const { drizzle } = await import('drizzle-orm/postgres-js');

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable not set');
    console.error('💡 Set it with: export DATABASE_URL="postgresql://user:password@localhost:5432/codex7"\n');
    process.exit(1);
  }

  const client = postgres.default(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    await enablePgVector(db as any);
    console.log('\n🎉 All done! You can now run Drizzle migrations.\n');
  } catch (error) {
    console.error('\n❌ Failed to enable pgvector\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}
