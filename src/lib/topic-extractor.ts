/**
 * Topic extraction for documentation snippets
 * Extracts topics from markdown headers first, falls back to LLM for headerless content
 */

import { generateText, isOpenAIConfigured } from "./embeddings.js";

/**
 * Normalize a topic name for consistency
 */
function normalizeTopicName(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to hyphens
    .trim()
    .slice(0, 30); // Limit length
}

/**
 * Extract topics from markdown headers (## and ###)
 */
export function extractTopicsFromHeaders(markdown: string): string[] {
  const headerRegex = /^#{2,3}\s+(.+)$/gm;
  const topics: Set<string> = new Set();

  let match;
  while ((match = headerRegex.exec(markdown)) !== null) {
    const header = match[1].trim();
    const topic = normalizeTopicName(header);
    if (topic && topic.length >= 3) {
      topics.add(topic);
    }
  }

  return Array.from(topics);
}

/**
 * Use LLM to extract topics when headers aren't available
 */
export async function extractTopicsWithLLM(content: string): Promise<string[]> {
  if (!isOpenAIConfigured()) {
    return [];
  }

  const prompt = `Analyze this documentation snippet and return 2-4 topic tags.
Return ONLY a JSON array of lowercase topic strings, no explanation.
Example: ["authentication", "middleware", "error-handling"]

Content:
${content.slice(0, 2000)}`;

  try {
    const response = await generateText(prompt, { maxTokens: 100 });
    // Extract JSON array from response (handle markdown code blocks)
    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      return [];
    }

    const topics = JSON.parse(jsonMatch[0]);
    if (Array.isArray(topics)) {
      return topics
        .map((t) => normalizeTopicName(String(t)))
        .filter((t) => t.length >= 3);
    }
  } catch (error) {
    console.error(`LLM topic extraction failed: ${error}`);
  }

  return [];
}

/**
 * Extract topics from content - headers first, LLM fallback
 */
export async function extractTopics(
  content: string,
  useLLMFallback: boolean = true
): Promise<string[]> {
  // Try headers first
  const headerTopics = extractTopicsFromHeaders(content);

  if (headerTopics.length > 0) {
    return headerTopics;
  }

  // LLM fallback if enabled and no headers found
  if (useLLMFallback && isOpenAIConfigured()) {
    return extractTopicsWithLLM(content);
  }

  return [];
}
