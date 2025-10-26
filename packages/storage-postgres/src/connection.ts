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
 * 🔌 PostgreSQL Connection Manager
 *
 * Handles connection pooling and lifecycle management using postgres.js
 */

import postgres from 'postgres';
import type { Sql } from 'postgres';
import { ok, err, type PostgresResult, postgresConnectionFailed } from './errors/index.js';
import { logger } from './utils/logger.js';

/**
 * PostgreSQL connection configuration
 */
export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections?: number;
  ssl?: boolean;
  connectionString?: string; // Alternative to individual params
}

/**
 * PostgreSQL connection manager
 *
 * Handles connection pooling and lifecycle management using postgres.js
 */
export class PostgresConnection {
  private sql: Sql | null = null;
  private config: PostgresConfig;

  constructor(config: PostgresConfig) {
    this.config = config;
    logger.info({ host: config.host, database: config.database }, '🐘 PostgresConnection initialized');
  }

  /**
   * Connect to PostgreSQL database
   */
  async connect(): Promise<PostgresResult<void>> {
    logger.info(
      {
        host: this.config.host,
        database: this.config.database,
      },
      '🔌 Connecting to PostgreSQL...'
    );

    try {
      // Use connection string if provided, otherwise build from params
      const connectionString = this.config.connectionString ||
        `postgresql://${this.config.user}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;

      this.sql = postgres(connectionString, {
        max: this.config.maxConnections || 20,
        ssl: this.config.ssl ? 'require' : false,
        onnotice: () => {}, // Suppress notices
      });

      // Test connection with simple query
      await this.sql`SELECT 1 as test`;

      logger.info('✅ Connected to PostgreSQL successfully');
      return ok(undefined);
    } catch (error) {
      logger.error({ error }, '❌ Failed to connect to PostgreSQL');
      return err(
        postgresConnectionFailed(
          (error as Error).message,
          this.config.host,
          this.config.database,
          error
        )
      );
    }
  }

  /**
   * Disconnect from PostgreSQL
   */
  async disconnect(): Promise<PostgresResult<void>> {
    logger.info('🔌 Disconnecting from PostgreSQL...');

    try {
      if (this.sql) {
        await this.sql.end();
        this.sql = null;
      }

      logger.info('✅ Disconnected from PostgreSQL');
      return ok(undefined);
    } catch (error) {
      logger.error({ error }, '❌ Failed to disconnect from PostgreSQL');
      return err(
        postgresConnectionFailed(
          `Disconnect failed: ${(error as Error).message}`,
          this.config.host,
          this.config.database,
          error
        )
      );
    }
  }

  /**
   * Health check - verify database is accessible
   */
  async healthCheck(): Promise<PostgresResult<boolean>> {
    logger.debug('🏥 Running health check...');

    try {
      if (!this.sql) {
        return err(
          postgresConnectionFailed(
            'Database not connected',
            this.config.host,
            this.config.database
          )
        );
      }

      await this.sql`SELECT 1 as health_check`;
      return ok(true);
    } catch (error) {
      logger.error({ error }, '❌ Health check failed');
      return err(
        postgresConnectionFailed(
          `Health check failed: ${(error as Error).message}`,
          this.config.host,
          this.config.database,
          error
        )
      );
    }
  }

  /**
   * Get SQL client (for queries)
   */
  getSql(): Sql {
    if (!this.sql) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.sql;
  }
}
