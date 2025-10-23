/**
 * ✂️ Text Processing Utilities
 */

/**
 * Truncate text to a maximum token count (approximate)
 *
 * Uses a simple heuristic: ~4 characters per token
 *
 * @param text - Text to truncate
 * @param maxTokens - Maximum tokens
 * @returns Truncated text
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  const CHARS_PER_TOKEN = 4;
  const maxChars = maxTokens * CHARS_PER_TOKEN;

  if (text.length <= maxChars) {
    return text;
  }

  return text.slice(0, maxChars) + '...';
}

/**
 * Estimate token count for text
 *
 * Uses a simple heuristic: ~4 characters per token
 *
 * @param text - Text to estimate
 * @returns Approximate token count
 */
export function estimateTokenCount(text: string): number {
  const CHARS_PER_TOKEN = 4;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Clean and normalize text content
 *
 * - Removes excessive whitespace
 * - Normalizes line endings
 * - Trims leading/trailing whitespace
 *
 * @param text - Text to clean
 * @returns Cleaned text
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    .replace(/[ \t]+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Extract code blocks from markdown text
 *
 * @param markdown - Markdown text
 * @returns Array of code blocks with language info
 */
export function extractCodeBlocks(markdown: string): Array<{ language: string; code: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];

  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const [, language = '', code] = match;
    blocks.push({ language, code: code.trim() });
  }

  return blocks;
}

/**
 * Remove markdown formatting from text
 *
 * @param markdown - Markdown text
 * @returns Plain text
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .replace(/^>\s+/gm, '') // Remove blockquotes
    .replace(/^[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\d+\.\s+/gm, ''); // Remove ordered list numbers
}

/**
 * Highlight search terms in text
 *
 * @param text - Text to highlight
 * @param searchTerms - Terms to highlight
 * @param maxLength - Maximum length of highlighted snippet
 * @returns Highlighted text with context
 */
export function highlightSearchTerms(
  text: string,
  searchTerms: string[],
  maxLength: number = 200
): string {
  const lowerText = text.toLowerCase();
  const lowerTerms = searchTerms.map((t) => t.toLowerCase());

  // Find first occurrence of any term
  let firstIndex = -1;
  for (const term of lowerTerms) {
    const index = lowerText.indexOf(term);
    if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
      firstIndex = index;
    }
  }

  if (firstIndex === -1) {
    return truncateToTokens(text, maxLength / 4);
  }

  // Extract context around the match
  const contextLength = maxLength / 2;
  const start = Math.max(0, firstIndex - contextLength);
  const end = Math.min(text.length, firstIndex + contextLength);

  let snippet = text.slice(start, end);

  // Add ellipsis if truncated
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  // Highlight the terms (markdown bold)
  for (const term of searchTerms) {
    const regex = new RegExp(`(${term})`, 'gi');
    snippet = snippet.replace(regex, '**$1**');
  }

  return snippet;
}
