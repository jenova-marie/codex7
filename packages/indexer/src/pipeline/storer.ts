/**
 * Codex7 - Documentation Indexing Service
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
 * 💾 Document Storer
 *
 * Stores documents in database using PostgreSQL adapter.
 * Handles batch inserts and deduplication.
 */

import { createHash } from 'node:crypto';
import { PostgresAdapter } from '@codex7/storage-postgres';
import type { Document } from '@codex7/shared';
import { logger } from '../utils/logger.js';
import type { EmbeddedDocument } from './embedder.js';

/**
 * Storage configuration
 */
export interface StorageConfig {
  adapter?: PostgresAdapter;
  batchSize?: number;
}

/**
 * Default configuration
 */
const DEFAULT_BATCH_SIZE = 50;

/**
 * Generate SHA-256 hash of document content
 */
function generateContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Detect if content contains code blocks
 */
function detectCode(content: string): { hasCode: boolean; language?: string } {
  const codeBlockRegex = /```(\w+)?\n/;
  const match = content.match(codeBlockRegex);

  if (match) {
    return {
      hasCode: true,
      language: match[1] || 'unknown',
    };
  }

  return { hasCode: false };
}

/**
 * Store documents in database using PostgreSQL adapter
 *
 * - Batches documents for efficient insertion
 * - Handles deduplication by content hash
 * - Uses library and version from metadata
 */
export async function storeDocuments(
  documents: EmbeddedDocument[],
  config: StorageConfig = {},
): Promise<void> {
  logger.info({ count: documents.length }, '💾 Storing documents in database');

  // Get or create adapter
  const adapter =
    config.adapter ||
    new PostgresAdapter({
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      database: process.env.DATABASE_NAME || 'codex7',
      user: process.env.DATABASE_USER || 'codex7_user',
      password: process.env.DATABASE_PASSWORD || '',
    });

  const batchSize = config.batchSize || DEFAULT_BATCH_SIZE;

  try {
    // Initialize adapter if we created it
    if (!config.adapter) {
      const initResult = await adapter.initialize({
        backend: 'postgres',
        connectionUrl: `postgresql://${process.env.DATABASE_USER || 'codex7_user'}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST || 'localhost'}:${process.env.DATABASE_PORT || '5432'}/${process.env.DATABASE_NAME || 'codex7'}`,
      });
      if (!initResult.ok) {
        throw new Error(`Failed to initialize adapter: ${initResult.error.message}`);
      }
    }

    // Process documents in batches
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(documents.length / batchSize);

      logger.info(
        {
          batchNum,
          totalBatches,
          batchSize: batch.length,
        },
        `📦 Storing batch ${batchNum}/${totalBatches}`,
      );

      // Map embedded documents to storage format (Omit<Document, 'id' | 'indexed' | 'updated'>)
      const docsToStore: Array<Omit<Document, 'id' | 'indexed' | 'updated'>> = batch.map((doc) => {
        const codeInfo = detectCode(doc.content);
        return {
          versionId: String(doc.metadata.versionId || 'latest'),
          title: doc.title,
          content: doc.content,
          contentHash: generateContentHash(doc.content),
          embedding: doc.embedding,
          chunkIndex: (doc.metadata.chunkIndex as number) || 0,
          hierarchy: doc.hierarchy,
          sourceUrl: doc.url,
          sourceType: String(doc.metadata.sourceType || 'github'),
          sourcePath: String(doc.metadata.filePath || ''),
          language: String(doc.metadata.language || 'en'),
          hasCode: codeInfo.hasCode,
          codeLanguage: codeInfo.language || '',
          metadata: doc.metadata,
        } as Omit<Document, 'id' | 'indexed' | 'updated'>;
      });

      // Index documents (adapter handles batch insertion internally)
      const result = await adapter.indexDocuments(docsToStore);

      if (!result.ok) {
        logger.error(
          {
            error: result.error.message,
            batchNum,
          },
          '❌ Failed to store batch',
        );
        throw new Error(`Failed to store batch ${batchNum}: ${result.error.message}`);
      }

      logger.info(
        {
          batchNum,
          documentsStored: batch.length,
        },
        '✅ Batch stored successfully',
      );
    }

    logger.info(
      {
        totalDocuments: documents.length,
      },
      '✅ All documents stored successfully',
    );
  } catch (error) {
    logger.error(
      {
        error,
      },
      '❌ Failed to store documents',
    );
    throw error;
  } finally {
    // Close adapter if we created it
    if (!config.adapter) {
      await adapter.close();
    }
  }
}
