/**
 * Codex7 - PostgreSQL Storage Adapter
 *
 * Copyright (C) 2025 Jenova Marie and Codex7 Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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

    if (result && Array.isArray(result) && result.length > 0) {
      const version = (result[0] as any).extversion;
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

    return Array.isArray(result) && result.length > 0 && (result[0] as any)?.enabled === true;
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
