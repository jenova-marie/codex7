import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { eq } from "drizzle-orm";
import { getDb, localLibraries, localSnippets, type NewLocalSnippet } from "../db/index.js";
import { upsertVectors, deleteLibraryVectors, type VectorPayload } from "./local-vectors.js";
import { generateEmbeddings, createEmbeddingText } from "./embeddings.js";

/**
 * Source file type classification
 */
type SourceType = "readme" | "api" | "docs" | "examples" | "content";

/**
 * A parsed documentation snippet before storage
 */
interface ParsedSnippet {
  title: string;
  sourceFile: string;
  sourceType: SourceType;
  description: string;
  content: string;
  codeBlocks: Array<{ language: string; code: string }>;
}

/**
 * Configuration for indexing a project
 */
export interface IndexConfig {
  projectPath: string;
  libraryId?: string;
  title?: string;
  description?: string;
  keywords?: string[];
}

/**
 * Result of indexing a project
 */
export interface IndexResult {
  libraryId: string;
  title: string;
  snippetCount: number;
  totalTokens: number;
  processedFiles: string[];
  warnings: string[];
}

/**
 * Index a local project and store its documentation
 */
export async function indexProject(config: IndexConfig): Promise<IndexResult> {
  const projectPath = path.resolve(config.projectPath);
  const warnings: string[] = [];

  // Validate project exists
  if (!fs.existsSync(projectPath)) {
    throw new Error(`Project path does not exist: ${projectPath}`);
  }

  // Extract project metadata
  const metadata = extractProjectMetadata(projectPath);

  // Determine library ID
  const libraryId = config.libraryId || metadata.libraryId;
  if (!libraryId) {
    throw new Error(
      "Could not determine library ID. Please provide --id option or ensure package.json has name field."
    );
  }

  const title = config.title || metadata.title || libraryId;
  const description = config.description || metadata.description || "";
  const keywords = [...(config.keywords || []), ...(metadata.keywords || [])];

  console.error(`Indexing: ${title} (${libraryId})`);

  // Find and parse documentation files
  const docFiles = findDocumentationFiles(projectPath);
  console.error(`Found ${docFiles.length} documentation files`);

  if (docFiles.length === 0) {
    warnings.push("No documentation files found");
  }

  // Parse all files into snippets
  const allSnippets: ParsedSnippet[] = [];
  const processedFiles: string[] = [];

  for (const file of docFiles) {
    try {
      const relativePath = path.relative(projectPath, file.path);
      const content = fs.readFileSync(file.path, "utf-8");
      const snippets = parseMarkdownIntoSnippets(content, relativePath, file.type);

      allSnippets.push(...snippets);
      processedFiles.push(relativePath);
    } catch (error) {
      warnings.push(`Failed to parse ${file.path}: ${error}`);
    }
  }

  console.error(`Parsed ${allSnippets.length} snippets from ${processedFiles.length} files`);

  if (allSnippets.length === 0) {
    throw new Error("No snippets extracted from documentation files");
  }

  // Generate embeddings for all snippets
  console.error("Generating embeddings...");
  const embeddingTexts = allSnippets.map((s) =>
    createEmbeddingText(s.title, s.description, s.content)
  );
  const embeddings = await generateEmbeddings(embeddingTexts);

  // Calculate total tokens (rough estimate: 4 chars per token)
  const totalTokens = allSnippets.reduce((sum, s) => sum + estimateTokens(s.content), 0);

  // Get database connection
  const db = getDb();

  // Delete existing library data if present
  await db.delete(localLibraries).where(eq(localLibraries.id, libraryId));
  await deleteLibraryVectors(libraryId);

  // Get current git branch
  const branch = getGitBranch(projectPath);

  // Insert library metadata
  await db.insert(localLibraries).values({
    id: libraryId,
    title,
    description,
    branch,
    sourcePath: projectPath,
    packageName: metadata.packageName,
    version: metadata.version,
    keywords,
    totalTokens,
    totalSnippets: allSnippets.length,
    totalPages: processedFiles.length,
    trustScore: 10.0, // Local projects get highest trust
  });

  // Prepare snippets for insertion - use index to ensure unique IDs
  const snippetRecords: NewLocalSnippet[] = allSnippets.map((snippet, idx) => {
    // Include index in hash to avoid collisions for identical content
    const snippetId = `${libraryId}:${idx}:${hashContent(snippet.content + snippet.sourceFile + idx)}`;
    return {
      id: snippetId,
      libraryId,
      title: snippet.title,
      sourceFile: snippet.sourceFile,
      sourceType: snippet.sourceType,
      description: snippet.description,
      content: snippet.content,
      codeBlocks: snippet.codeBlocks,
      tokens: estimateTokens(snippet.content),
    };
  });

  // Insert snippets in batches
  const batchSize = 100;
  for (let i = 0; i < snippetRecords.length; i += batchSize) {
    const batch = snippetRecords.slice(i, i + batchSize);
    await db.insert(localSnippets).values(batch);
  }

  // Prepare and upsert vectors
  const vectorPoints = snippetRecords.map((snippet, idx) => ({
    id: snippet.id,
    vector: embeddings[idx],
    payload: {
      snippet_id: snippet.id,
      library_id: libraryId,
      title: snippet.title,
      source_file: snippet.sourceFile,
      source_type: snippet.sourceType,
      content_preview: snippet.content.slice(0, 500),
    } as VectorPayload,
  }));

  console.error("Storing vectors...");
  await upsertVectors(vectorPoints);

  console.error(`Successfully indexed ${allSnippets.length} snippets`);

  return {
    libraryId,
    title,
    snippetCount: allSnippets.length,
    totalTokens,
    processedFiles,
    warnings,
  };
}

/**
 * Extract metadata from package.json or other project files
 */
function extractProjectMetadata(projectPath: string): {
  libraryId?: string;
  title?: string;
  description?: string;
  packageName?: string;
  version?: string;
  keywords?: string[];
} {
  const packageJsonPath = path.join(projectPath, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const name = pkg.name || "";

      // Convert package name to library ID format
      // @scope/package-name -> /scope/package-name
      // package-name -> /username/package-name (use folder name as org)
      let libraryId: string;
      if (name.startsWith("@")) {
        libraryId = "/" + name.slice(1);
      } else if (name) {
        const folderName = path.basename(path.dirname(projectPath)) || "local";
        libraryId = `/${folderName}/${name}`;
      } else {
        libraryId = undefined as unknown as string;
      }

      return {
        libraryId,
        title: pkg.name,
        description: pkg.description,
        packageName: pkg.name,
        version: pkg.version,
        keywords: pkg.keywords || [],
      };
    } catch {
      // Ignore parse errors
    }
  }

  // Fallback: use folder name
  const folderName = path.basename(projectPath);
  return {
    libraryId: `/local/${folderName}`,
    title: folderName,
  };
}

/**
 * Find documentation files in the project
 */
function findDocumentationFiles(
  projectPath: string
): Array<{ path: string; type: SourceType }> {
  const files: Array<{ path: string; type: SourceType }> = [];

  // README files
  for (const name of ["README.md", "README.rst", "README.txt", "readme.md"]) {
    const filePath = path.join(projectPath, name);
    if (fs.existsSync(filePath)) {
      files.push({ path: filePath, type: "readme" });
    }
  }

  // API documentation
  for (const name of ["API.md", "api.md", "REFERENCE.md"]) {
    const filePath = path.join(projectPath, name);
    if (fs.existsSync(filePath)) {
      files.push({ path: filePath, type: "api" });
    }
  }

  // docs/ directory
  const docsDir = path.join(projectPath, "docs");
  if (fs.existsSync(docsDir) && fs.statSync(docsDir).isDirectory()) {
    files.push(...findMarkdownFiles(docsDir, "docs"));
  }

  // examples/ directory
  const examplesDir = path.join(projectPath, "examples");
  if (fs.existsSync(examplesDir) && fs.statSync(examplesDir).isDirectory()) {
    files.push(...findMarkdownFiles(examplesDir, "examples"));
  }

  // content/ directory
  const contentDir = path.join(projectPath, "content");
  if (fs.existsSync(contentDir) && fs.statSync(contentDir).isDirectory()) {
    files.push(...findMarkdownFiles(contentDir, "content"));
  }

  return files;
}

/**
 * Recursively find markdown files in a directory
 */
function findMarkdownFiles(
  dir: string,
  type: SourceType
): Array<{ path: string; type: SourceType }> {
  const files: Array<{ path: string; type: SourceType }> = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          files.push(...findMarkdownFiles(fullPath, type));
        }
      } else if (entry.isFile() && /\.(md|mdx|rst)$/i.test(entry.name)) {
        files.push({ path: fullPath, type });
      }
    }
  } catch {
    // Ignore permission errors
  }

  return files;
}

/**
 * Parse markdown content into snippets, chunking by headers
 */
function parseMarkdownIntoSnippets(
  content: string,
  sourceFile: string,
  sourceType: SourceType
): ParsedSnippet[] {
  const snippets: ParsedSnippet[] = [];

  // Split by headers (## or ###)
  const sections = content.split(/(?=^#{2,3}\s)/m);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Extract title from first line
    const titleMatch = trimmed.match(/^#{2,3}\s+(.+?)$/m);
    const title = titleMatch ? titleMatch[1].trim() : sourceFile;

    // Extract code blocks
    const codeBlocks: Array<{ language: string; code: string }> = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(trimmed)) !== null) {
      codeBlocks.push({
        language: match[1] || "text",
        code: match[2].trim(),
      });
    }

    // Extract description (text before first code block or first paragraph)
    const descriptionMatch = trimmed.match(/^#{2,3}\s+.+?\n\n?([\s\S]*?)(?=```|$)/);
    const description = descriptionMatch
      ? descriptionMatch[1].trim().split("\n\n")[0].slice(0, 500)
      : "";

    // Skip very short sections
    if (trimmed.length < 50) continue;

    // Check if section is too long and needs splitting
    const tokens = estimateTokens(trimmed);
    if (tokens > 1000) {
      // Split into smaller chunks
      const chunks = splitLargeSection(trimmed, title);
      for (const chunk of chunks) {
        snippets.push({
          title: chunk.title,
          sourceFile,
          sourceType,
          description: chunk.description,
          content: chunk.content,
          codeBlocks: chunk.codeBlocks,
        });
      }
    } else {
      snippets.push({
        title,
        sourceFile,
        sourceType,
        description,
        content: trimmed,
        codeBlocks,
      });
    }
  }

  // If no headers found, treat entire file as one snippet
  if (snippets.length === 0 && content.trim().length > 50) {
    const codeBlocks: Array<{ language: string; code: string }> = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || "text",
        code: match[2].trim(),
      });
    }

    snippets.push({
      title: sourceFile,
      sourceFile,
      sourceType,
      description: content.slice(0, 500),
      content: content.slice(0, 4000), // Limit size
      codeBlocks: codeBlocks.slice(0, 10),
    });
  }

  return snippets;
}

/**
 * Split a large section into smaller chunks
 */
function splitLargeSection(
  content: string,
  parentTitle: string
): ParsedSnippet[] {
  const chunks: ParsedSnippet[] = [];

  // Try to split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/);
  let currentChunk = "";
  let chunkIndex = 0;

  for (const part of parts) {
    if (currentChunk.length + part.length > 3000) {
      if (currentChunk.trim()) {
        chunks.push(createChunkSnippet(currentChunk, parentTitle, chunkIndex++));
      }
      currentChunk = part;
    } else {
      currentChunk += part;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(createChunkSnippet(currentChunk, parentTitle, chunkIndex));
  }

  return chunks;
}

/**
 * Create a snippet from a chunk of content
 */
function createChunkSnippet(
  content: string,
  parentTitle: string,
  index: number
): ParsedSnippet {
  const codeBlocks: Array<{ language: string; code: string }> = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || "text",
      code: match[2].trim(),
    });
  }

  return {
    title: index === 0 ? parentTitle : `${parentTitle} (continued ${index})`,
    sourceFile: "",
    sourceType: "docs",
    description: content.slice(0, 200),
    content: content.trim(),
    codeBlocks,
  };
}

/**
 * Estimate token count (rough: ~4 chars per token)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Hash content for unique ID generation
 */
function hashContent(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
}

/**
 * Get current git branch
 */
function getGitBranch(projectPath: string): string {
  try {
    const headPath = path.join(projectPath, ".git", "HEAD");
    if (fs.existsSync(headPath)) {
      const head = fs.readFileSync(headPath, "utf-8").trim();
      const match = head.match(/ref: refs\/heads\/(.+)/);
      return match ? match[1] : "main";
    }
  } catch {
    // Ignore errors
  }
  return "main";
}

/**
 * Remove a library from the local index
 */
export async function removeLibrary(libraryId: string): Promise<boolean> {
  const db = getDb();

  // Check if library exists
  const existing = await db
    .select()
    .from(localLibraries)
    .where(eq(localLibraries.id, libraryId))
    .limit(1);

  if (existing.length === 0) {
    return false;
  }

  // Delete from database (cascades to snippets)
  await db.delete(localLibraries).where(eq(localLibraries.id, libraryId));

  // Delete vectors
  await deleteLibraryVectors(libraryId);

  return true;
}

/**
 * List all indexed libraries
 */
export async function listLibraries(): Promise<
  Array<{
    id: string;
    title: string;
    description: string | null;
    snippetCount: number;
    updatedAt: Date | null;
  }>
> {
  const db = getDb();

  const libraries = await db.select().from(localLibraries);

  return libraries.map((lib) => ({
    id: lib.id,
    title: lib.title,
    description: lib.description,
    snippetCount: lib.totalSnippets || 0,
    updatedAt: lib.updatedAt,
  }));
}
