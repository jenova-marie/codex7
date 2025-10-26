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
 * 🐙 GitHub Repository Processor
 *
 * Fetches documentation from GitHub repositories.
 * Clones repos, finds markdown files, and extracts content.
 */

import { simpleGit } from 'simple-git';
import { readdir, readFile, rm, mkdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { logger } from '../utils/logger.js';
import type { GitHubJobData } from '../queue/job-types.js';
import type { RawDocument } from '../pipeline/fetcher.js';

/**
 * Documentation file patterns to look for
 */
const DOC_PATTERNS = [
  /README\.md$/i,
  /docs\/.*\.md$/,
  /documentation\/.*\.md$/,
  /guides?\/.*\.md$/,
  /wiki\/.*\.md$/,
  /CONTRIBUTING\.md$/i,
  /CHANGELOG\.md$/i,
];

/**
 * Check if a file path matches documentation patterns
 */
function isDocumentationFile(filePath: string): boolean {
  return DOC_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Recursively find all markdown files in a directory
 */
async function findMarkdownFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip node_modules, .git, and other common build directories
      if (
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules' &&
        entry.name !== 'dist' &&
        entry.name !== 'build'
      ) {
        const subFiles = await findMarkdownFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relativePath = relative(baseDir, fullPath);

        // Only include if it matches documentation patterns
        if (isDocumentationFile(relativePath)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    logger.warn({ error, dir }, '⚠️  Failed to read directory');
  }

  return files;
}

/**
 * Extract repository name from GitHub URL
 */
function extractRepoName(url: string): string {
  // Handle various GitHub URL formats
  const match = url.match(/github\.com[:/]([^/]+)\/([^/\s.]+)/);
  if (match && match[1] && match[2]) {
    return `${match[1]}-${match[2]}`;
  }
  return 'unknown-repo';
}

/**
 * Process GitHub repository
 *
 * 1. Clones repository to temporary directory
 * 2. Finds documentation files (README.md, docs/*, etc.)
 * 3. Extracts markdown content
 * 4. Returns raw documents with metadata
 */
export async function processGitHub(jobData: GitHubJobData): Promise<RawDocument[]> {
  const { source, branch = 'main', path: subPath, libraryId } = jobData;

  logger.info(
    {
      source,
      branch,
      subPath,
      libraryId,
    },
    '🐙 Processing GitHub repository',
  );

  const git = simpleGit();
  const repoName = extractRepoName(source);
  const tempDir = join(tmpdir(), `codex7-${repoName}-${Date.now()}`);

  try {
    // Create temp directory
    await mkdir(tempDir, { recursive: true });

    logger.info({ tempDir, source, branch }, '📥 Cloning repository...');

    // Clone repository
    await git.clone(source, tempDir, ['--depth', '1', '--branch', branch]);

    logger.info({ tempDir }, '✅ Repository cloned successfully');

    // Determine search directory (subdirectory if specified)
    const searchDir = subPath ? join(tempDir, subPath) : tempDir;

    // Find all markdown documentation files
    const markdownFiles = await findMarkdownFiles(searchDir);

    logger.info(
      {
        filesFound: markdownFiles.length,
        searchDir,
      },
      '📄 Found markdown files',
    );

    // Read and process each file
    const documents: RawDocument[] = [];

    for (const filePath of markdownFiles) {
      try {
        const content = await readFile(filePath, 'utf-8');
        const relativePath = relative(tempDir, filePath);

        // Generate URL for the file (GitHub raw URL)
        const fileUrl = `${source}/blob/${branch}/${relativePath}`;

        // Extract title from first h1 or use filename
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : relativePath;

        documents.push({
          title,
          content,
          url: fileUrl,
          metadata: {
            libraryId,
            source,
            filePath: relativePath,
            branch,
            fileType: 'markdown',
          },
        });

        logger.info(
          {
            title,
            filePath: relativePath,
            size: content.length,
          },
          '📄 Document extracted',
        );
      } catch (error) {
        logger.warn(
          {
            error,
            filePath,
          },
          '⚠️  Failed to read markdown file',
        );
      }
    }

    logger.info(
      {
        totalDocuments: documents.length,
        source,
      },
      '✅ GitHub repository processed successfully',
    );

    return documents;
  } catch (error) {
    logger.error(
      {
        error,
        source,
        branch,
      },
      '❌ Failed to process GitHub repository',
    );
    throw error;
  } finally {
    // Clean up temp directory
    try {
      await rm(tempDir, { recursive: true, force: true });
      logger.info({ tempDir }, '🧹 Cleaned up temp directory');
    } catch (error) {
      logger.warn({ error, tempDir }, '⚠️  Failed to clean up temp directory');
    }
  }
}
