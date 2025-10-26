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
 * ✨ Embedding Generator
 *
 * Generates vector embeddings for document chunks using OpenAI's API.
 * Uses text-embedding-3-small model with intelligent batching and retry logic.
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import type { DocumentChunk } from './chunker.js';

/**
 * Document chunk with embedding
 */
export interface EmbeddedDocument extends DocumentChunk {
  embedding: number[];
}

/**
 * Configuration for embedding generation
 */
export interface EmbeddingConfig {
  apiKey?: string;
  model?: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<EmbeddingConfig> = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'text-embedding-3-small', // 1536 dimensions, $0.02/1M tokens
  batchSize: 100, // Balance between API efficiency and memory
  maxRetries: 3,
  retryDelay: 1000, // ms
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate embeddings for document chunks
 *
 * - Batches chunks for API efficiency (up to 100 per request)
 * - Uses text-embedding-3-small (1536 dimensions)
 * - Handles rate limits with exponential backoff
 * - Retries failed requests up to 3 times
 */
export async function generateEmbeddings(
  chunks: DocumentChunk[],
  config: EmbeddingConfig = {},
): Promise<EmbeddedDocument[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (!cfg.apiKey) {
    logger.error('❌ OPENAI_API_KEY not set in environment');
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  logger.info(
    {
      count: chunks.length,
      model: cfg.model,
      batchSize: cfg.batchSize,
    },
    '✨ Generating embeddings with OpenAI API',
  );

  const openai = new OpenAI({ apiKey: cfg.apiKey });
  const results: EmbeddedDocument[] = [];

  // Process chunks in batches
  for (let i = 0; i < chunks.length; i += cfg.batchSize) {
    const batch = chunks.slice(i, i + cfg.batchSize);
    const batchNum = Math.floor(i / cfg.batchSize) + 1;
    const totalBatches = Math.ceil(chunks.length / cfg.batchSize);

    logger.info(
      {
        batchNum,
        totalBatches,
        batchSize: batch.length,
      },
      `📦 Processing batch ${batchNum}/${totalBatches}`,
    );

    // Extract text content for embedding
    const texts = batch.map((chunk) => chunk.content);

    // Generate embeddings with retry logic
    let attempt = 0;
    let embeddings: number[][] | null = null;

    while (attempt < cfg.maxRetries && !embeddings) {
      try {
        const response = await openai.embeddings.create({
          model: cfg.model,
          input: texts,
          encoding_format: 'float',
        });

        embeddings = response.data.map((item) => item.embedding);

        logger.info(
          {
            batchNum,
            embeddingsGenerated: embeddings.length,
            dimensions: embeddings[0]?.length || 0,
          },
          '✅ Batch embeddings generated',
        );
      } catch (error) {
        attempt++;

        if (attempt >= cfg.maxRetries) {
          logger.error(
            {
              error,
              batchNum,
              attempt,
            },
            '❌ Failed to generate embeddings after max retries',
          );
          throw error;
        }

        // Exponential backoff
        const delay = cfg.retryDelay * Math.pow(2, attempt - 1);

        logger.warn(
          {
            error,
            batchNum,
            attempt,
            nextRetryIn: delay,
          },
          '⚠️  Embedding generation failed, retrying...',
        );

        await sleep(delay);
      }
    }

    if (!embeddings) {
      throw new Error('Failed to generate embeddings');
    }

    // Combine chunks with their embeddings
    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      const embedding = embeddings[j];

      if (!chunk || !embedding) {
        logger.warn({ index: j, batchNum }, '⚠️  Missing chunk or embedding in batch');
        continue;
      }

      results.push({
        ...chunk,
        embedding,
      });
    }
  }

  logger.info(
    {
      totalChunks: chunks.length,
      embeddingsGenerated: results.length,
      model: cfg.model,
    },
    '✅ All embeddings generated successfully',
  );

  return results;
}
