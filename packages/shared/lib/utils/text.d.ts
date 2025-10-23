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
export declare function truncateToTokens(text: string, maxTokens: number): string;
/**
 * Estimate token count for text
 *
 * Uses a simple heuristic: ~4 characters per token
 *
 * @param text - Text to estimate
 * @returns Approximate token count
 */
export declare function estimateTokenCount(text: string): number;
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
export declare function cleanText(text: string): string;
/**
 * Extract code blocks from markdown text
 *
 * @param markdown - Markdown text
 * @returns Array of code blocks with language info
 */
export declare function extractCodeBlocks(markdown: string): Array<{
    language: string;
    code: string;
}>;
/**
 * Remove markdown formatting from text
 *
 * @param markdown - Markdown text
 * @returns Plain text
 */
export declare function stripMarkdown(markdown: string): string;
/**
 * Highlight search terms in text
 *
 * @param text - Text to highlight
 * @param searchTerms - Terms to highlight
 * @param maxLength - Maximum length of highlighted snippet
 * @returns Highlighted text with context
 */
export declare function highlightSearchTerms(text: string, searchTerms: string[], maxLength?: number): string;
