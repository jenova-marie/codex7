import OpenAI from "openai";

/**
 * Embedding model to use
 */
const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Maximum batch size for embedding requests
 */
const BATCH_SIZE = 100;

/**
 * OpenAI client singleton
 */
let _client: OpenAI | null = null;

/**
 * Get the OpenAI client, initializing if needed
 */
function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required for generating embeddings."
      );
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getClient();

  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in batches
 * Returns embeddings in the same order as input texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getClient();
  const allEmbeddings: number[][] = [];

  // Process in batches
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    // Sort by index to ensure order matches input
    const sortedData = response.data.sort((a, b) => a.index - b.index);
    const batchEmbeddings = sortedData.map((d) => d.embedding);

    allEmbeddings.push(...batchEmbeddings);

    // Log progress for large batches
    if (texts.length > BATCH_SIZE) {
      console.error(
        `Generated embeddings: ${Math.min(i + BATCH_SIZE, texts.length)}/${texts.length}`
      );
    }
  }

  return allEmbeddings;
}

/**
 * Prepare text for embedding by truncating if too long
 * text-embedding-3-small has an 8191 token limit
 * We use a rough estimate of 4 chars per token
 */
export function prepareTextForEmbedding(text: string, maxChars: number = 30000): string {
  if (text.length <= maxChars) {
    return text;
  }
  return text.slice(0, maxChars) + "...";
}

/**
 * Create a search-optimized text from snippet data
 * Combines title, description, and content for better semantic matching
 */
export function createEmbeddingText(
  title: string,
  description: string | null,
  content: string
): string {
  const parts = [title];

  if (description) {
    parts.push(description);
  }

  parts.push(content);

  return prepareTextForEmbedding(parts.join("\n\n"));
}

/**
 * Generate text using OpenAI chat completion (for topic extraction)
 * Uses gpt-4o-mini for cost efficiency
 */
export async function generateText(
  prompt: string,
  options: { maxTokens?: number } = {}
): Promise<string> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: options.maxTokens || 100,
    temperature: 0,
  });

  return response.choices[0]?.message?.content || "";
}
