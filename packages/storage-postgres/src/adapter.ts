/**
 * 🐘 PostgreSQL Storage Adapter
 *
 * PostgreSQL + pgvector implementation of StorageAdapter interface
 *
 * STUB: All methods return Ok with placeholder data or throw NotImplementedError.
 * Actual implementation comes in Phase 1.
 */

import { ok as tsOk, err as tsErr, type Result } from '@jenova-marie/ts-rust-result';
import { eq, desc, sql, and, or, ilike, cosineDistance, gt } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import ObjectID from 'bson-objectid';

// Import entity classes (needed as values for .fromJSON() methods)
import {
  Library,
  Version,
  Document,
} from '@codex7/shared';
// Import type-only interfaces
import type {
  StorageAdapter,
  StorageConfig,
  StorageStats,
  MigrationInfo,
  IndexingJob,
  SearchOptions,
  SearchResult,
  VectorSearchParams,
} from '@codex7/shared';
import { PostgresConnection, type PostgresConfig } from './connection.js';
import { libraries, versions, documents, indexingJobs } from './drizzle/index.js';
import { logger } from './utils/logger.js';
import { runMigrations } from './scripts/run-migrations.js';

/**
 * PostgreSQL + pgvector implementation of StorageAdapter interface
 */
export class PostgresAdapter implements StorageAdapter {
  private connection: PostgresConnection;
  private db!: PostgresJsDatabase;

  constructor(config: PostgresConfig) {
    this.connection = new PostgresConnection(config);
    logger.info('🐘 PostgresAdapter created');
  }

  // ========================================
  // 🔧 Lifecycle Operations
  // ========================================

  /**
   * Initialize the adapter - connect and verify schema
   */
  async initialize(config: StorageConfig): Promise<Result<void, Error>> {
    logger.info('🚀 Initializing PostgresAdapter...');

    const connectResult = await this.connection.connect();
    if (!connectResult.ok) {
      return tsErr(new Error(connectResult.error.message));
    }

    // Get Drizzle instance from connection
    const dbResult = this.connection.getDb();
    if (!dbResult.ok) {
      return tsErr(new Error(dbResult.error.message));
    }
    this.db = dbResult.value;

    // Run migrations if auto strategy is enabled
    if (config.migrationStrategy === 'auto') {
      logger.info('🔄 Running database migrations...');

      // Build connection URL from config
      const pgConfig = this.connection['config']; // Access private config
      const connectionUrl = `postgresql://${pgConfig.user}:${pgConfig.password}@${pgConfig.host}:${pgConfig.port}/${pgConfig.database}`;

      const migrationResult = await runMigrations(connectionUrl);
      if (!migrationResult.ok) {
        logger.error({ error: migrationResult.error }, '❌ Migration failed');
        return tsErr(new Error(`Migration failed: ${migrationResult.error.message}`));
      }

      logger.info({ migrations: migrationResult.value }, '✅ Migrations completed');
    }

    // Verify pgvector extension is enabled
    try {
      const result = await this.db.execute(sql`
        SELECT EXISTS (
          SELECT 1 FROM pg_extension WHERE extname = 'vector'
        ) as enabled;
      `);

      const enabled = Array.isArray(result) && result.length > 0 && (result[0] as any)?.enabled === true;
      if (!enabled) {
        logger.warn('⚠️  pgvector extension not enabled - vector search will not work');
      }
    } catch (error) {
      logger.warn({ error }, '⚠️  Could not verify pgvector extension');
    }

    logger.info('✅ PostgresAdapter initialized');
    return tsOk(undefined);
  }

  /**
   * Close database connections
   * STUB: Just calls connection.disconnect()
   */
  async close(): Promise<Result<void, Error>> {
    logger.info('🔌 Closing PostgresAdapter (STUB)...');
    const result = await this.connection.disconnect();
    if (!result.ok) {
      return tsErr(new Error(result.error.message));
    }
    return tsOk(undefined);
  }

  /**
   * Health check
   * STUB: Returns result from connection health check
   */
  async healthCheck(): Promise<Result<boolean, Error>> {
    logger.debug('🏥 Health check (STUB)');
    const result = await this.connection.healthCheck();
    if (!result.ok) {
      return tsErr(new Error(result.error.message));
    }
    return tsOk(result.value);
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<Result<StorageStats, Error>> {
    logger.debug('📊 getStats called');

    try {
      // Get counts for each table
      const libCountResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(libraries);

      const verCountResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(versions);

      const docCountResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(documents);

      const libCount = libCountResult[0]?.count ?? 0;
      const verCount = verCountResult[0]?.count ?? 0;
      const docCount = docCountResult[0]?.count ?? 0;

      // Get database size
      const sizeResult = await this.db.execute(sql`
        SELECT pg_database_size(current_database()) as size;
      `);
      const storageSize = Array.isArray(sizeResult) && sizeResult.length > 0
        ? Number((sizeResult[0] as any)?.size ?? 0)
        : 0;

      // Get pgvector version
      let pgvectorVersion = 'unknown';
      try {
        const versionResult = await this.db.execute(sql`
          SELECT extversion FROM pg_extension WHERE extname = 'vector';
        `);
        if (Array.isArray(versionResult) && versionResult.length > 0) {
          pgvectorVersion = (versionResult[0] as any)?.extversion ?? 'unknown';
        }
      } catch {
        pgvectorVersion = 'not installed';
      }

      const stats: StorageStats = {
        libraryCount: libCount,
        versionCount: verCount,
        documentCount: docCount,
        storageSize,
        avgDocumentsPerLibrary: libCount > 0 ? docCount / libCount : 0,
        backendStats: {
          backend: 'postgres',
          pgvectorVersion,
        },
      };

      return tsOk(stats);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to get stats: ${String(error)}`)
      );
    }
  }

  /**
   * Run database migrations
   * STUB: Calls migration runner stub
   */
  async migrate(): Promise<Result<MigrationInfo[], Error>> {
    logger.info('🔄 Running migrations (STUB)...');
    const result = await runMigrations();
    if (!result.ok) {
      return tsErr(new Error(result.error.message));
    }
    return tsOk(result.value);
  }

  // ========================================
  // 📚 Library Operations
  // ========================================

  async createLibrary(
    library: Omit<Library, 'created' | 'updated'> | Omit<Library, 'id' | 'created' | 'updated'>
  ): Promise<Result<Library, Error>> {
    logger.debug({ library }, '📚 createLibrary called');

    try {
      // Use provided ID or generate new one
      const id = ('id' in library && library.id) ? library.id : new ObjectID().toHexString();
      const now = Date.now();

      // Create full library object
      const fullLibrary = {
        ...library,
        id,
        created: now,
        updated: now,
      };

      // Insert into database
      await this.db.insert(libraries).values({
        id: fullLibrary.id,
        name: fullLibrary.name,
        org: fullLibrary.org,
        project: fullLibrary.project,
        identifier: fullLibrary.identifier,
        description: fullLibrary.description || '',
        repositoryUrl: fullLibrary.repositoryUrl || '',
        homepageUrl: fullLibrary.homepageUrl || '',
        created: fullLibrary.created,
        updated: fullLibrary.updated,
        metadata: JSON.stringify(fullLibrary.metadata || {}),
        trustScore: fullLibrary.trustScore ?? 5,
      });

      // Convert to Library class instance
      const libraryResult = Library.fromJSON(fullLibrary);
      if (!libraryResult.ok) {
        return tsErr(new Error(`Failed to create library: ${libraryResult.error.message}`));
      }

      logger.info({ id }, '✅ Library created');
      return tsOk(libraryResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to create library: ${String(error)}`)
      );
    }
  }

  async getLibrary(id: string): Promise<Result<Library | null, Error>> {
    logger.debug({ id }, '📚 getLibrary called');

    try {
      const result = await this.db
        .select()
        .from(libraries)
        .where(eq(libraries.id, id))
        .limit(1);

      if (result.length === 0) {
        return tsOk(null);
      }

      const row = result[0]!;
      const libraryData = {
        id: row.id,
        name: row.name,
        org: row.org,
        project: row.project,
        identifier: row.identifier,
        description: row.description || '',
        repositoryUrl: row.repositoryUrl || '',
        homepageUrl: row.homepageUrl || '',
        trustScore: row.trustScore ?? 5,
        created: row.created,
        updated: row.updated,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      };

      const libraryResult = Library.fromJSON(libraryData);
      if (!libraryResult.ok) {
        return tsErr(new Error(`Failed to parse library: ${libraryResult.error.message}`));
      }

      return tsOk(libraryResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to get library: ${String(error)}`)
      );
    }
  }

  async getLibraryByIdentifier(identifier: string): Promise<Result<Library | null, Error>> {
    logger.debug({ identifier }, '📚 getLibraryByIdentifier called');

    try {
      const result = await this.db
        .select()
        .from(libraries)
        .where(eq(libraries.identifier, identifier))
        .limit(1);

      if (result.length === 0) {
        return tsOk(null);
      }

      const row = result[0]!;
      const libraryData = {
        id: row.id,
        name: row.name,
        org: row.org,
        project: row.project,
        identifier: row.identifier,
        description: row.description || '',
        repositoryUrl: row.repositoryUrl || '',
        homepageUrl: row.homepageUrl || '',
        trustScore: row.trustScore ?? 5,
        created: row.created,
        updated: row.updated,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      };

      const libraryResult = Library.fromJSON(libraryData);
      if (!libraryResult.ok) {
        return tsErr(new Error(`Failed to parse library: ${libraryResult.error.message}`));
      }

      return tsOk(libraryResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to get library by identifier: ${String(error)}`)
      );
    }
  }

  async listLibraries(options?: { limit?: number; offset?: number }): Promise<Result<Library[], Error>> {
    logger.debug({ options }, '📚 listLibraries called');

    try {
      const limit = options?.limit ?? 100;
      const offset = options?.offset ?? 0;

      const results = await this.db
        .select()
        .from(libraries)
        .orderBy(desc(libraries.updated))
        .limit(limit)
        .offset(offset);

      const libraryList: Library[] = [];
      for (const row of results) {
        const libraryData = {
          id: row.id,
          name: row.name,
          org: row.org,
          project: row.project,
          identifier: row.identifier,
          description: row.description || '',
          repositoryUrl: row.repositoryUrl || '',
          homepageUrl: row.homepageUrl || '',
          trustScore: row.trustScore ?? 5,
          created: row.created,
          updated: row.updated,
          metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
        };

        const libraryResult = Library.fromJSON(libraryData);
        if (libraryResult.ok) {
          libraryList.push(libraryResult.value);
        } else {
          logger.warn({ id: row.id }, `Failed to parse library: ${libraryResult.error.message}`);
        }
      }

      return tsOk(libraryList);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to list libraries: ${String(error)}`)
      );
    }
  }

  async updateLibrary(id: string, updates: Partial<Library>): Promise<Result<Library, Error>> {
    logger.debug({ id, updates }, '📚 updateLibrary called');

    try {
      // First check if library exists
      const existingResult = await this.getLibrary(id);
      if (!existingResult.ok) {
        return existingResult;
      }
      if (!existingResult.value) {
        return tsErr(new Error(`Library not found: ${id}`));
      }

      // Prepare update data
      const updateData: any = {
        updated: Date.now(),
      };

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.org !== undefined) updateData.org = updates.org;
      if (updates.project !== undefined) updateData.project = updates.project;
      if (updates.identifier !== undefined) updateData.identifier = updates.identifier;
      if (updates.metadata !== undefined) {
        updateData.metadata = JSON.stringify(updates.metadata);
        if ((updates.metadata as any)?.trustScore !== undefined) {
          updateData.trustScore = (updates.metadata as any).trustScore;
        }
      }

      // Update in database
      await this.db
        .update(libraries)
        .set(updateData)
        .where(eq(libraries.id, id));

      // Fetch and return updated library
      const updatedResult = await this.getLibrary(id);
      if (!updatedResult.ok || !updatedResult.value) {
        return tsErr(new Error('Failed to fetch updated library'));
      }

      logger.info({ id }, '✅ Library updated');
      return tsOk(updatedResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to update library: ${String(error)}`)
      );
    }
  }

  async deleteLibrary(id: string): Promise<Result<void, Error>> {
    logger.debug({ id }, '📚 deleteLibrary called');

    try {
      // Delete all documents for all versions of this library
      const versionsResult = await this.listVersions(id);
      if (versionsResult.ok) {
        for (const version of versionsResult.value) {
          await this.deleteDocumentsByVersion(version.id);
        }
      }

      // Delete all versions for this library
      await this.db
        .delete(versions)
        .where(eq(versions.libraryId, id));

      // Delete the library
      await this.db
        .delete(libraries)
        .where(eq(libraries.id, id));

      logger.info({ id }, '✅ Library deleted');
      return tsOk(undefined);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to delete library: ${String(error)}`)
      );
    }
  }

  async searchLibraries(query: string): Promise<Result<Library[], Error>> {
    logger.debug({ query }, '🔍 searchLibraries called');

    try {
      const searchPattern = `%${query}%`;
      const results = await this.db
        .select()
        .from(libraries)
        .where(
          or(
            ilike(libraries.name, searchPattern),
            ilike(libraries.org, searchPattern),
            ilike(libraries.project, searchPattern),
            ilike(libraries.identifier, searchPattern)
          )
        )
        .orderBy(desc(libraries.updated))
        .limit(50);

      const libraryList: Library[] = [];
      for (const row of results) {
        const libraryData = {
          id: row.id,
          name: row.name,
          org: row.org,
          project: row.project,
          identifier: row.identifier,
          description: row.description || '',
          repositoryUrl: row.repositoryUrl || '',
          homepageUrl: row.homepageUrl || '',
          trustScore: row.trustScore ?? 5,
          created: row.created,
          updated: row.updated,
          metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
        };

        const libraryResult = Library.fromJSON(libraryData);
        if (libraryResult.ok) {
          libraryList.push(libraryResult.value);
        } else {
          logger.warn({ id: row.id }, `Failed to parse library: ${libraryResult.error.message}`);
        }
      }

      return tsOk(libraryList);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to search libraries: ${String(error)}`)
      );
    }
  }

  // ========================================
  // 📌 Version Operations
  // ========================================

  async createVersion(
    version: Omit<Version, 'indexed' | 'updated'> | Omit<Version, 'id' | 'indexed' | 'updated'>
  ): Promise<Result<Version, Error>> {
    logger.debug({ version }, '📌 createVersion called');

    try {
      // Use provided ID or generate new one
      const id = ('id' in version && version.id) ? version.id : new ObjectID().toHexString();
      const now = Date.now();

      // Create full version object
      const fullVersion = {
        ...version,
        id,
        indexed: now,
        updated: now,
      };

      // Insert into database
      await this.db.insert(versions).values({
        id: fullVersion.id,
        libraryId: fullVersion.libraryId,
        versionString: fullVersion.versionString,
        versionNormalized: fullVersion.versionNormalized,
        indexed: fullVersion.indexed,
        updated: fullVersion.updated,
        isLatest: fullVersion.isLatest ?? false,
        isDeprecated: fullVersion.isDeprecated ?? false,
        metadata: JSON.stringify(fullVersion.metadata || {}),
      });

      // Convert to Version class instance
      const versionResult = Version.fromJSON(fullVersion);
      if (!versionResult.ok) {
        return tsErr(new Error(`Failed to create version: ${versionResult.error.message}`));
      }

      logger.info({ id, versionString: fullVersion.versionString }, '✅ Version created');
      return tsOk(versionResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to create version: ${String(error)}`)
      );
    }
  }

  async getVersion(id: string): Promise<Result<Version | null, Error>> {
    logger.debug({ id }, '📌 getVersion called');

    try {
      const result = await this.db
        .select()
        .from(versions)
        .where(eq(versions.id, id))
        .limit(1);

      if (result.length === 0) {
        return tsOk(null);
      }

      const row = result[0]!;
      const versionData = {
        id: row.id,
        libraryId: row.libraryId,
        versionString: row.versionString,
        versionNormalized: row.versionNormalized,
        indexed: row.indexed,
        updated: row.updated,
        isLatest: row.isLatest,
        isDeprecated: row.isDeprecated,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      };

      const versionResult = Version.fromJSON(versionData);
      if (!versionResult.ok) {
        return tsErr(new Error(`Failed to parse version: ${versionResult.error.message}`));
      }

      return tsOk(versionResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to get version: ${String(error)}`)
      );
    }
  }

  async listVersions(libraryId: string): Promise<Result<Version[], Error>> {
    logger.debug({ libraryId }, '📌 listVersions called');

    try {
      const results = await this.db
        .select()
        .from(versions)
        .where(eq(versions.libraryId, libraryId))
        .orderBy(desc(versions.indexed));

      const versionList: Version[] = [];
      for (const row of results) {
        const versionData = {
          id: row.id,
          libraryId: row.libraryId,
          versionString: row.versionString,
          versionNormalized: row.versionNormalized,
          indexed: row.indexed,
          updated: row.updated,
          isLatest: row.isLatest,
          isDeprecated: row.isDeprecated,
          metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
        };

        const versionResult = Version.fromJSON(versionData);
        if (versionResult.ok) {
          versionList.push(versionResult.value);
        } else {
          logger.warn({ id: row.id }, `Failed to parse version: ${versionResult.error.message}`);
        }
      }

      return tsOk(versionList);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to list versions: ${String(error)}`)
      );
    }
  }

  async getLatestVersion(libraryId: string): Promise<Result<Version | null, Error>> {
    logger.debug({ libraryId }, '📌 getLatestVersion called');

    try {
      const result = await this.db
        .select()
        .from(versions)
        .where(
          and(
            eq(versions.libraryId, libraryId),
            eq(versions.isLatest, true)
          )
        )
        .limit(1);

      if (result.length === 0) {
        return tsOk(null);
      }

      const row = result[0]!;
      const versionData = {
        id: row.id,
        libraryId: row.libraryId,
        versionString: row.versionString,
        versionNormalized: row.versionNormalized,
        indexed: row.indexed,
        updated: row.updated,
        isLatest: row.isLatest,
        isDeprecated: row.isDeprecated,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      };

      const versionResult = Version.fromJSON(versionData);
      if (!versionResult.ok) {
        return tsErr(new Error(`Failed to parse version: ${versionResult.error.message}`));
      }

      return tsOk(versionResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to get latest version: ${String(error)}`)
      );
    }
  }

  async updateVersion(id: string, updates: Partial<Version>): Promise<Result<Version, Error>> {
    logger.debug({ id, updates }, '📌 updateVersion called');

    try {
      // First check if version exists
      const existingResult = await this.getVersion(id);
      if (!existingResult.ok) {
        return existingResult;
      }
      if (!existingResult.value) {
        return tsErr(new Error(`Version not found: ${id}`));
      }

      // Prepare update data
      const updateData: any = {
        updated: Date.now(),
      };

      if (updates.versionString !== undefined) updateData.versionString = updates.versionString;
      if (updates.versionNormalized !== undefined) updateData.versionNormalized = updates.versionNormalized;
      if (updates.isLatest !== undefined) updateData.isLatest = updates.isLatest;
      if (updates.isDeprecated !== undefined) updateData.isDeprecated = updates.isDeprecated;
      if (updates.metadata !== undefined) {
        updateData.metadata = JSON.stringify(updates.metadata);
      }

      // Update in database
      await this.db
        .update(versions)
        .set(updateData)
        .where(eq(versions.id, id));

      // Fetch and return updated version
      const updatedResult = await this.getVersion(id);
      if (!updatedResult.ok || !updatedResult.value) {
        return tsErr(new Error('Failed to fetch updated version'));
      }

      logger.info({ id }, '✅ Version updated');
      return tsOk(updatedResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to update version: ${String(error)}`)
      );
    }
  }

  async deleteVersion(id: string): Promise<Result<void, Error>> {
    logger.debug({ id }, '📌 deleteVersion called');

    try {
      // Delete all documents for this version
      await this.deleteDocumentsByVersion(id);

      // Delete the version
      await this.db
        .delete(versions)
        .where(eq(versions.id, id));

      logger.info({ id }, '✅ Version deleted');
      return tsOk(undefined);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to delete version: ${String(error)}`)
      );
    }
  }

  // ========================================
  // 📄 Document Operations
  // ========================================

  async indexDocument(
    document: Omit<Document, 'indexed' | 'updated'> | Omit<Document, 'id' | 'indexed' | 'updated'>
  ): Promise<Result<Document, Error>> {
    logger.debug({ document }, '📄 indexDocument called');

    try {
      // Use provided ID or generate new one
      const id = ('id' in document && document.id) ? document.id : new ObjectID().toHexString();
      const now = Date.now();

      // Create full document object
      const fullDocument = {
        ...document,
        id,
        indexed: now,
        updated: now,
      };

      // Insert into database
      await this.db.insert(documents).values({
        id: fullDocument.id,
        versionId: fullDocument.versionId,
        title: fullDocument.title,
        content: fullDocument.content,
        contentHash: fullDocument.contentHash,
        embedding: fullDocument.embedding && fullDocument.embedding.length > 0 ? fullDocument.embedding : null,
        chunkIndex: fullDocument.chunkIndex ?? 0,
        hierarchy: fullDocument.hierarchy || [],
        hasCode: fullDocument.hasCode ?? false,
        codeLanguage: fullDocument.codeLanguage ?? '',
        sourcePath: fullDocument.sourcePath || '',
        sourceUrl: fullDocument.sourceUrl || '',
        sourceType: fullDocument.sourceType || 'github',
        language: fullDocument.language || 'en',
        indexed: fullDocument.indexed,
        updated: fullDocument.updated,
        metadata: JSON.stringify(fullDocument.metadata || {}),
      });

      // Convert to Document class instance
      const documentResult = Document.fromJSON(fullDocument);
      if (!documentResult.ok) {
        return tsErr(new Error(`Failed to create document: ${documentResult.error.message}`));
      }

      logger.info({ id, title: fullDocument.title }, '✅ Document indexed');
      return tsOk(documentResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to index document: ${String(error)}`)
      );
    }
  }

  async indexDocuments(
    docsToIndex: Array<Omit<Document, 'id' | 'indexed' | 'updated'>>
  ): Promise<Result<Document[], Error>> {
    logger.debug({ count: docsToIndex.length }, '📄 indexDocuments called');

    try {
      const now = Date.now();
      const fullDocuments: Document[] = [];

      // Prepare all documents for batch insert
      const valuesToInsert = docsToIndex.map((doc) => {
        const id = new ObjectID().toHexString();
        const fullDoc = {
          id,
          ...doc,
          indexed: now,
          updated: now,
        };
        fullDocuments.push(fullDoc as Document);

        return {
          id: fullDoc.id,
          versionId: fullDoc.versionId,
          title: fullDoc.title,
          content: fullDoc.content,
          contentHash: fullDoc.contentHash,
          embedding: fullDoc.embedding && fullDoc.embedding.length > 0 ? fullDoc.embedding : null,
          chunkIndex: fullDoc.chunkIndex ?? 0,
          hierarchy: fullDoc.hierarchy || [],
          hasCode: fullDoc.hasCode ?? false,
          codeLanguage: fullDoc.codeLanguage ?? '',
          sourcePath: fullDoc.sourcePath || '',
          sourceUrl: fullDoc.sourceUrl || '',
          sourceType: fullDoc.sourceType || 'github',
          language: fullDoc.language || 'en',
          indexed: fullDoc.indexed,
          updated: fullDoc.updated,
          metadata: JSON.stringify(fullDoc.metadata || {}),
        };
      });

      // Batch insert
      if (valuesToInsert.length > 0) {
        await this.db.insert(documents).values(valuesToInsert);
      }

      logger.info({ count: fullDocuments.length }, '✅ Documents indexed (batch)');
      return tsOk(fullDocuments);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to index documents: ${String(error)}`)
      );
    }
  }

  async getDocument(id: string): Promise<Result<Document | null, Error>> {
    logger.debug({ id }, '📄 getDocument called');

    try {
      const result = await this.db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1);

      if (result.length === 0) {
        return tsOk(null);
      }

      const row = result[0]!;
      const documentData = {
        id: row.id,
        versionId: row.versionId,
        title: row.title,
        content: row.content,
        contentHash: row.contentHash,
        embedding: typeof row.embedding === 'string' ? JSON.parse(row.embedding) : (row.embedding || []),
        chunkIndex: row.chunkIndex,
        hierarchy: typeof row.hierarchy === 'string' ? JSON.parse(row.hierarchy) : row.hierarchy,
        hasCode: row.hasCode,
        codeLanguage: row.codeLanguage,
        indexed: row.indexed,
        updated: row.updated,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      };

      const documentResult = Document.fromJSON(documentData);
      if (!documentResult.ok) {
        return tsErr(new Error(`Failed to parse document: ${documentResult.error.message}`));
      }

      return tsOk(documentResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to get document: ${String(error)}`)
      );
    }
  }

  async deleteDocument(id: string): Promise<Result<void, Error>> {
    logger.debug({ id }, '📄 deleteDocument called');

    try {
      await this.db
        .delete(documents)
        .where(eq(documents.id, id));

      logger.info({ id }, '✅ Document deleted');
      return tsOk(undefined);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to delete document: ${String(error)}`)
      );
    }
  }

  async deleteDocumentsByVersion(versionId: string): Promise<Result<number, Error>> {
    logger.debug({ versionId }, '📄 deleteDocumentsByVersion called');

    try {
      // Count documents before deletion
      const countResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(documents)
        .where(eq(documents.versionId, versionId));

      const count = countResult[0]?.count ?? 0;

      // Delete all documents for this version
      await this.db
        .delete(documents)
        .where(eq(documents.versionId, versionId));

      logger.info({ versionId, count }, '✅ Documents deleted by version');
      return tsOk(count);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to delete documents by version: ${String(error)}`)
      );
    }
  }

  async documentExistsByHash(contentHash: string): Promise<Result<boolean, Error>> {
    logger.debug({ contentHash }, '📄 documentExistsByHash called');

    try {
      const result = await this.db
        .select({ id: documents.id })
        .from(documents)
        .where(eq(documents.contentHash, contentHash))
        .limit(1);

      return tsOk(result.length > 0);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to check document exists: ${String(error)}`)
      );
    }
  }

  // ========================================
  // 🔍 Search Operations
  // ========================================

  async semanticSearch(options: SearchOptions): Promise<Result<SearchResult[], Error>> {
    logger.debug({ options }, '🔍 semanticSearch called');

    // Note: Semantic search requires embeddings which should be generated by a higher layer
    // For now, this is a placeholder that falls back to full-text search
    logger.warn('semanticSearch called but requires embedding generation in service layer');
    return this.fullTextSearch(options);
  }

  async vectorSearch(params: VectorSearchParams): Promise<Result<SearchResult[], Error>> {
    logger.debug({ params }, '🔍 vectorSearch called');

    try {
      const limit = params.k ?? 10;
      const threshold = params.threshold ?? 0.0;

      // Calculate similarity using cosineDistance (1 - distance gives similarity score)
      const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, params.embedding)})`;

      // Build the query using Drizzle's query builder
      let query = this.db
        .select({
          id: documents.id,
          versionId: documents.versionId,
          title: documents.title,
          content: documents.content,
          contentHash: documents.contentHash,
          embedding: documents.embedding,
          chunkIndex: documents.chunkIndex,
          hierarchy: documents.hierarchy,
          hasCode: documents.hasCode,
          codeLanguage: documents.codeLanguage,
          indexed: documents.indexed,
          updated: documents.updated,
          metadata: documents.metadata,
          similarity,
        })
        .from(documents)
        .$dynamic();

      // Add filters if provided
      if (params.filter?.version) {
        query = query.where(eq(documents.versionId, params.filter.version));
      }

      // Add threshold filter if provided
      if (threshold > 0) {
        query = query.where(gt(similarity, threshold));
      }

      // Execute query with ordering and limit
      const results = await query
        .orderBy(desc(similarity))
        .limit(limit);

      const searchResults: SearchResult[] = [];

      for (const row of results) {
        const score = Number(row.similarity);

        // Get version and library info
        const versionResult = await this.getVersion(row.versionId);
        if (!versionResult.ok || !versionResult.value) {
          continue;
        }

        const libraryResult = await this.getLibrary(versionResult.value.libraryId);
        if (!libraryResult.ok || !libraryResult.value) {
          continue;
        }

        searchResults.push({
          document: {
            id: row.id,
            title: row.title,
            content: row.content,
            metadata: typeof row.metadata === 'string'
              ? JSON.parse(row.metadata)
              : row.metadata,
          },
          library: {
            name: libraryResult.value.name,
            identifier: libraryResult.value.identifier,
            version: versionResult.value.versionString,
          },
          score,
        });
      }

      logger.info({ count: searchResults.length }, '✅ Vector search completed');
      return tsOk(searchResults);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to perform vector search: ${String(error)}`)
      );
    }
  }

  async fullTextSearch(options: SearchOptions): Promise<Result<SearchResult[], Error>> {
    logger.debug({ options }, '🔍 fullTextSearch called');

    try {
      const limit = options.limit ?? 20;
      const offset = options.offset ?? 0;
      const minScore = options.minScore ?? 0.0;

      // Build WHERE conditions
      const conditions: any[] = [];

      // Text search using ILIKE (case-insensitive pattern matching)
      const searchPattern = `%${options.query}%`;
      conditions.push(
        or(
          ilike(documents.title, searchPattern),
          ilike(documents.content, searchPattern)
        )
      );

      // Filter by version if provided
      if (options.version) {
        conditions.push(eq(documents.versionId, options.version));
      }

      // Filter by code only if requested
      if (options.codeOnly) {
        conditions.push(eq(documents.hasCode, true));
      }

      // Query documents
      const results = await this.db
        .select()
        .from(documents)
        .where(and(...conditions))
        .orderBy(desc(documents.updated))
        .limit(limit)
        .offset(offset);

      const searchResults: SearchResult[] = [];

      for (const row of results) {
        // Calculate simple relevance score based on query match
        const titleMatch = row.title.toLowerCase().includes(options.query.toLowerCase());
        const contentMatch = row.content.toLowerCase().includes(options.query.toLowerCase());
        const score = titleMatch ? 0.8 : contentMatch ? 0.5 : 0.3;

        if (score < minScore) {
          continue;
        }

        // Get version and library info
        const versionResult = await this.getVersion(row.versionId);
        if (!versionResult.ok || !versionResult.value) {
          continue;
        }

        const libraryResult = await this.getLibrary(versionResult.value.libraryId);
        if (!libraryResult.ok || !libraryResult.value) {
          continue;
        }

        searchResults.push({
          document: {
            id: row.id,
            title: row.title,
            content: row.content,
            metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
          },
          library: {
            name: libraryResult.value.name,
            identifier: libraryResult.value.identifier,
            version: versionResult.value.versionString,
          },
          score,
        });
      }

      logger.info({ count: searchResults.length }, '✅ Full-text search completed');
      return tsOk(searchResults);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to perform full-text search: ${String(error)}`)
      );
    }
  }

  async hybridSearch(options: SearchOptions): Promise<Result<SearchResult[], Error>> {
    logger.debug({ options }, '🔍 hybridSearch called');

    // Hybrid search combines vector and full-text search
    // For MVP, we'll just use full-text search since semantic search requires embeddings
    // In a real implementation, this would:
    // 1. Generate embeddings for the query
    // 2. Perform both vector and full-text search
    // 3. Combine and rerank results

    logger.info('hybridSearch: Using full-text search (vector search requires embedding generation)');
    return this.fullTextSearch(options);
  }

  // ========================================
  // 🔄 Indexing Job Operations
  // ========================================

  async createIndexingJob(
    job: Omit<IndexingJob, 'id' | 'startedAt'>
  ): Promise<Result<IndexingJob, Error>> {
    logger.debug({ job }, '🔄 createIndexingJob called');

    try {
      // Generate new ID
      const id = new ObjectID().toHexString();
      const startedAt = Date.now();

      // Create full job object
      const fullJob = {
        id,
        ...job,
        startedAt,
      };

      // Insert into database
      await this.db.insert(indexingJobs).values({
        id: fullJob.id,
        libraryId: fullJob.libraryId,
        versionId: fullJob.versionId,
        status: fullJob.status,
        totalDocuments: fullJob.totalDocuments,
        processedDocuments: fullJob.processedDocuments,
        failedDocuments: fullJob.failedDocuments,
        error: fullJob.error,
        startedAt: fullJob.startedAt,
        completedAt: fullJob.completedAt,
        metadata: JSON.stringify(fullJob.metadata || {}),
      });

      logger.info({ id, versionId: fullJob.versionId }, '✅ IndexingJob created');
      return tsOk(fullJob as IndexingJob);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to create indexing job: ${String(error)}`)
      );
    }
  }

  async getIndexingJob(id: string): Promise<Result<IndexingJob | null, Error>> {
    logger.debug({ id }, '🔄 getIndexingJob called');

    try {
      const result = await this.db
        .select()
        .from(indexingJobs)
        .where(eq(indexingJobs.id, id))
        .limit(1);

      if (result.length === 0) {
        return tsOk(null);
      }

      const row = result[0]!;
      const jobData: IndexingJob = {
        id: row.id,
        libraryId: row.libraryId,
        versionId: row.versionId,
        status: row.status as IndexingJob['status'],
        totalDocuments: row.totalDocuments ?? undefined,
        processedDocuments: row.processedDocuments,
        failedDocuments: row.failedDocuments,
        error: row.error ?? undefined,
        startedAt: row.startedAt,
        completedAt: row.completedAt ?? undefined,
        metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      };

      return tsOk(jobData);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to get indexing job: ${String(error)}`)
      );
    }
  }

  async updateIndexingJob(id: string, updates: Partial<IndexingJob>): Promise<Result<IndexingJob, Error>> {
    logger.debug({ id, updates }, '🔄 updateIndexingJob called');

    try {
      // First check if job exists
      const existingResult = await this.getIndexingJob(id);
      if (!existingResult.ok) {
        return existingResult;
      }
      if (!existingResult.value) {
        return tsErr(new Error(`IndexingJob not found: ${id}`));
      }

      // Prepare update data
      const updateData: any = {};

      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.totalDocuments !== undefined) updateData.totalDocuments = updates.totalDocuments;
      if (updates.processedDocuments !== undefined) updateData.processedDocuments = updates.processedDocuments;
      if (updates.failedDocuments !== undefined) updateData.failedDocuments = updates.failedDocuments;
      if (updates.error !== undefined) updateData.error = updates.error;
      if (updates.completedAt !== undefined) updateData.completedAt = updates.completedAt;
      if (updates.metadata !== undefined) {
        updateData.metadata = JSON.stringify(updates.metadata);
      }

      // Update in database
      await this.db
        .update(indexingJobs)
        .set(updateData)
        .where(eq(indexingJobs.id, id));

      // Fetch and return updated job
      const updatedResult = await this.getIndexingJob(id);
      if (!updatedResult.ok || !updatedResult.value) {
        return tsErr(new Error('Failed to fetch updated indexing job'));
      }

      logger.info({ id, status: updates.status }, '✅ IndexingJob updated');
      return tsOk(updatedResult.value);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to update indexing job: ${String(error)}`)
      );
    }
  }

  async listIndexingJobs(options?: { limit?: number; offset?: number }): Promise<Result<IndexingJob[], Error>> {
    logger.debug({ options }, '🔄 listIndexingJobs called');

    try {
      const limit = options?.limit ?? 100;
      const offset = options?.offset ?? 0;

      const results = await this.db
        .select()
        .from(indexingJobs)
        .orderBy(desc(indexingJobs.startedAt))
        .limit(limit)
        .offset(offset);

      const jobList: IndexingJob[] = [];
      for (const row of results) {
        const jobData: IndexingJob = {
          id: row.id,
          libraryId: row.libraryId,
          versionId: row.versionId,
          status: row.status as IndexingJob['status'],
          totalDocuments: row.totalDocuments ?? undefined,
          processedDocuments: row.processedDocuments,
          failedDocuments: row.failedDocuments,
          error: row.error ?? undefined,
          startedAt: row.startedAt,
          completedAt: row.completedAt ?? undefined,
          metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
        };
        jobList.push(jobData);
      }

      return tsOk(jobList);
    } catch (error) {
      return tsErr(
        error instanceof Error
          ? error
          : new Error(`Failed to list indexing jobs: ${String(error)}`)
      );
    }
  }
}
