#!/usr/bin/env tsx
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

/**
 * 🔄 Automated Migration Runner
 *
 * Runs all SQL migration files in order with proper tracking and error handling
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import postgres from 'postgres';
import { ok as tsOk, err as tsErr, type Result } from '@jenova-marie/ts-rust-result';
import type { MigrationInfo } from '@codex7/shared';

const MIGRATIONS_DIR = join(import.meta.dirname, '../migrations');

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<Result<MigrationInfo[], Error>> {
  console.log('🚀 Codex7 Migration Runner\n');

  // Get connection string from environment
  const connectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'codex7'}`;

  console.log(`📦 Connecting to database...`);
  const sql = postgres(connectionString, { max: 1 });

  try {
    // Test connection
    await sql`SELECT version()`;
    console.log(`✅ Connected successfully\n`);

    // Get all .sql files in migrations directory
    const files = await readdir(MIGRATIONS_DIR);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Alphabetical order (0000_, 0001_, etc.)

    if (sqlFiles.length === 0) {
      console.log('⚠️  No migration files found');
      await sql.end();
      return tsOk([]);
    }

    console.log(`📋 Found ${sqlFiles.length} migration file(s):\n`);

    // Create migrations tracking table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS _drizzle_migrations (
        id serial PRIMARY KEY,
        filename text NOT NULL UNIQUE,
        executed_at timestamp DEFAULT now()
      );
    `;

    // Get already executed migrations
    const executed = await sql`
      SELECT filename FROM _drizzle_migrations;
    `;
    const executedSet = new Set(executed.map(row => row.filename));

    const migrationResults: MigrationInfo[] = [];

    // Run pending migrations
    for (const file of sqlFiles) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        migrationResults.push({
          name: file,
          executedAt: 0, // We don't track this for already-executed migrations
          success: true,
        });
        continue;
      }

      console.log(`🔄 Running ${file}...`);

      const filePath = join(MIGRATIONS_DIR, file);
      const sqlContent = await readFile(filePath, 'utf-8');

      try {
        const startTime = Date.now();

        // Execute migration
        await sql.unsafe(sqlContent);

        // Record execution
        await sql`
          INSERT INTO _drizzle_migrations (filename)
          VALUES (${file});
        `;

        const executedAt = Date.now();
        migrationResults.push({
          name: file,
          executedAt,
          success: true,
        });

        console.log(`✅ Completed ${file} (${executedAt - startTime}ms)\n`);
      } catch (error) {
        console.error(`❌ Failed to execute ${file}:`);
        if (error instanceof Error) {
          console.error(error.message);
        }

        migrationResults.push({
          name: file,
          executedAt: Date.now(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        await sql.end();
        return tsErr(new Error(`Migration failed: ${file} - ${(error as Error).message}`));
      }
    }

    console.log('🎉 All migrations completed successfully!\n');
    await sql.end();

    return tsOk(migrationResults);

  } catch (error) {
    console.error('\n❌ Migration failed:');
    if (error instanceof Error) {
      console.error(error.message);
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Ensure PostgreSQL is running (docker compose ps)');
      console.error('   2. Check DATABASE_URL or POSTGRES_* environment variables');
      console.error('   3. Verify pgvector extension is enabled\n');
    }

    await sql.end();
    return tsErr(error as Error);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().then((result) => {
    if (!result.ok) {
      process.exit(1);
    }
  });
}
