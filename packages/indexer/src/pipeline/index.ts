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
 * 🔄 Processing Pipeline Coordinator
 *
 * Orchestrates the full indexing workflow.
 * Implements complete end-to-end processing pipeline.
 */

import { logger } from '../utils/logger.js';
import { fetchSource } from './fetcher.js';
import { chunkDocuments } from './chunker.js';
import { generateEmbeddings } from './embedder.js';
import { storeDocuments } from './storer.js';
import type { IndexJobData, JobResult } from '../queue/job-types.js';

/**
 * Main processing pipeline
 *
 * Orchestrates the full indexing workflow:
 * 1. Fetch source (GitHub, web, PDF)
 * 2. Chunk documents using LangChain MarkdownTextSplitter
 * 3. Generate embeddings using OpenAI API
 * 4. Store in PostgreSQL database with pgvector
 */
export async function processJob(jobData: IndexJobData): Promise<JobResult> {
  logger.info({ jobData }, '🔄 Starting processing pipeline');

  try {
    // Step 1: Fetch source
    logger.info('📥 Step 1: Fetching source...');
    const rawDocuments = await fetchSource(jobData);
    logger.info({ count: rawDocuments.length }, '✅ Source fetched');

    // Step 2: Chunk documents
    logger.info('✂️ Step 2: Chunking documents...');
    const chunks = await chunkDocuments(rawDocuments);
    logger.info({ count: chunks.length }, '✅ Documents chunked');

    // Step 3: Generate embeddings
    logger.info('✨ Step 3: Generating embeddings...');
    const withEmbeddings = await generateEmbeddings(chunks);
    logger.info({ count: withEmbeddings.length }, '✅ Embeddings generated');

    // Step 4: Store documents
    logger.info('💾 Step 4: Storing documents...');
    await storeDocuments(withEmbeddings);
    logger.info('✅ Documents stored');

    return {
      success: true,
      documentsIndexed: chunks.length,
    };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      '❌ Pipeline error'
    );

    return {
      success: false,
      documentsIndexed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export all pipeline types
export * from './fetcher.js';
export * from './chunker.js';
export * from './embedder.js';
export * from './storer.js';
