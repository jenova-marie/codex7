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
 * ✂️ Document Chunker
 *
 * Splits documents into structured chunks using LangChain's MarkdownTextSplitter.
 * Preserves header hierarchy by parsing markdown structure.
 */

import { MarkdownTextSplitter } from '@langchain/textsplitters';
import { logger } from '../utils/logger.js';
import type { RawDocument } from './fetcher.js';

/**
 * Document chunk
 */
export interface DocumentChunk {
  title: string;
  content: string;
  hierarchy: string[];
  sectionLevel: number;
  url: string;
  metadata: Record<string, unknown>;
}

/**
 * Header information extracted from markdown
 */
interface HeaderInfo {
  level: number;
  text: string;
  startIndex: number;
  endIndex?: number;
}

/**
 * Extract header hierarchy from markdown content
 *
 * Parses markdown headers (#, ##, ###, etc.) to build a hierarchy map.
 * Each header's range in the document is tracked to determine which
 * headers apply to each chunk.
 */
function extractHeaders(content: string): HeaderInfo[] {
  const headers: HeaderInfo[] = [];
  const lines = content.split('\n');
  let currentIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;

    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headerMatch && headerMatch[1] && headerMatch[2]) {
      const level = headerMatch[1].length;
      const text = headerMatch[2].trim();

      // Close previous header at same or higher level
      for (let j = headers.length - 1; j >= 0; j--) {
        const header = headers[j];
        if (header && header.level >= level && header.endIndex === undefined) {
          header.endIndex = currentIndex;
        }
      }

      headers.push({
        level,
        text,
        startIndex: currentIndex,
        endIndex: undefined, // Will be set when next header at same/higher level found
      });
    }

    currentIndex += line.length + 1; // +1 for newline
  }

  // Close all remaining open headers
  const contentLength = content.length;
  for (const header of headers) {
    if (header.endIndex === undefined) {
      header.endIndex = contentLength;
    }
  }

  return headers;
}

/**
 * Build hierarchy path for a chunk based on its position in the document
 *
 * Returns array of header texts from h1 down to the deepest applicable header.
 */
function buildHierarchy(chunkStart: number, headers: HeaderInfo[]): string[] {
  const hierarchy: string[] = [];
  let currentLevel = 0;

  for (const header of headers) {
    // Check if this header applies to the chunk position
    if (chunkStart >= header.startIndex && chunkStart < (header.endIndex ?? Infinity)) {
      // Only add if it's the next level down in hierarchy
      if (header.level > currentLevel) {
        hierarchy.push(header.text);
        currentLevel = header.level;
      } else if (header.level <= currentLevel) {
        // Truncate hierarchy and add new header at this level
        hierarchy.splice(header.level - 1);
        hierarchy.push(header.text);
        currentLevel = header.level;
      }
    }
  }

  return hierarchy;
}

/**
 * Chunk documents by structure using LangChain MarkdownTextSplitter
 *
 * - Uses MarkdownTextSplitter for intelligent markdown-aware splitting
 * - Preserves header hierarchy by parsing markdown structure
 * - Maintains code blocks, paragraphs, and other markdown elements
 */
export async function chunkDocuments(documents: RawDocument[]): Promise<DocumentChunk[]> {
  logger.info({ count: documents.length }, '✂️ Chunking documents with MarkdownTextSplitter');

  const allChunks: DocumentChunk[] = [];

  // Configure MarkdownTextSplitter with optimal settings for RAG
  const splitter = new MarkdownTextSplitter({
    chunkSize: 1500, // ~400 tokens, good for embeddings
    chunkOverlap: 200, // Maintain context between chunks
  });

  for (const doc of documents) {
    try {
      // Extract header hierarchy from the document
      const headers = extractHeaders(doc.content);

      // Split the document into chunks
      const chunks = await splitter.splitText(doc.content);

      // Find position of each chunk in original document to determine hierarchy
      for (const chunkText of chunks) {
        const chunkStart = doc.content.indexOf(chunkText);
        const hierarchy = buildHierarchy(chunkStart, headers);

        // Determine section level (deepest header level)
        const sectionLevel = hierarchy.length > 0 ? hierarchy.length : 0;

        // Use the deepest header as title, or document title
        const title = hierarchy[hierarchy.length - 1] || doc.title;

        allChunks.push({
          title,
          content: chunkText,
          hierarchy,
          sectionLevel,
          url: doc.url,
          metadata: {
            ...doc.metadata,
            chunkStart,
            chunkSize: chunkText.length,
          },
        });
      }

      logger.info(
        {
          documentTitle: doc.title,
          chunksCreated: chunks.length,
          headersFound: headers.length,
        },
        '✅ Document chunked successfully',
      );
    } catch (error) {
      logger.error(
        {
          error,
          documentTitle: doc.title,
          documentUrl: doc.url,
        },
        '❌ Failed to chunk document',
      );
      // Continue with next document instead of failing entire batch
    }
  }

  logger.info({ totalChunks: allChunks.length }, '✅ All documents chunked');

  return allChunks;
}
