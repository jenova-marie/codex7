# Retrieval-Time Reranking

This document covers strategies for improving what snippets agents actually receive when querying documentation.

## Current Codex7 Local Retrieval

```
Query → Embed (OpenAI) → Vector search (Qdrant cosine) → Return top K
```

No reranking. Results ordered purely by vector similarity.

## The Problem

Vector similarity alone has limitations:
- Semantically similar != most useful for the query
- Code quality not considered
- Formatting/structure ignored
- No distinction between explanatory text vs. working examples

## Reranking Strategies

### 1. Pre-computed Snippet Scores (Indexing Time)

Score each snippet during indexing, store with the snippet, use at retrieval.

| Metric | What to measure | How |
|--------|----------------|-----|
| **Code presence** | Does snippet contain code blocks? | Regex detection |
| **Code completeness** | Is it a full example or fragment? | Heuristics (imports, function defs) |
| **Formatting quality** | Headers, lists, structure | Markdown parsing |
| **Information density** | Ratio of content to boilerplate | Token analysis |
| **Freshness** | How recent is the source? | File modification time |

**Pros**: Fast at retrieval, no LLM cost
**Cons**: Static, not query-aware

### 2. LLM Reranker (Retrieval Time)

After vector search returns top K, use LLM to rerank based on query relevance.

```
Vector search → Top 20 candidates → LLM scores each for query → Return top 5
```

**Pros**: Query-aware, high quality
**Cons**: Adds latency, LLM API cost per query

### 3. Hybrid Search

Combine vector similarity with keyword matching (BM25).

```
final_score = (vector_score * α) + (bm25_score * β)
```

**Pros**: Catches exact keyword matches vectors might miss
**Cons**: Requires additional index (e.g., Elasticsearch, Qdrant sparse vectors)

### 4. Cross-Encoder Reranking

Use a cross-encoder model to score query-document pairs.

```
Vector search → Top 20 → Cross-encoder(query, doc) → Rerank → Top 5
```

Models: `cross-encoder/ms-marco-MiniLM-L-6-v2`, Cohere Rerank

**Pros**: More accurate than bi-encoder similarity
**Cons**: Slower than pre-computed scores

## Context7's Approach

Context7 uses a 5-metric reranking system at retrieval time:

| Metric | Purpose |
|--------|---------|
| **Question relevance** | Does snippet answer the query? |
| **Code quality** | Syntax correctness, completeness |
| **Formatting** | Structure, readability |
| **Metadata** | Context about the snippet |
| **Initialization** | Setup instructions present? |

These are combined with configurable weights to produce a final ranking.

## Recommended Implementation for Codex7

### Phase 1: Pre-computed Scores (Low effort)

Add to `local_snippets` table:
```sql
quality_score REAL  -- 0.0 to 1.0
has_code BOOLEAN
code_block_count INTEGER
```

Score during indexing:
```typescript
function scoreSnippet(snippet: Snippet): number {
  let score = 0.5; // baseline
  if (snippet.codeBlocks.length > 0) score += 0.2;
  if (snippet.codeBlocks.length > 2) score += 0.1;
  if (snippet.content.length > 500) score += 0.1;
  if (snippet.description) score += 0.1;
  return Math.min(score, 1.0);
}
```

Retrieval ranking:
```typescript
final_score = (vector_similarity * 0.7) + (quality_score * 0.3)
```

### Phase 2: Query-Aware Reranking (Medium effort)

After vector search, use LLM to score top candidates:

```typescript
async function rerankWithLLM(query: string, snippets: Snippet[]): Promise<Snippet[]> {
  const prompt = `Score each snippet 1-10 for relevance to: "${query}"`;
  const scores = await llm.score(prompt, snippets);
  return snippets.sort((a, b) => scores[b.id] - scores[a.id]);
}
```

### Phase 3: Cross-Encoder (Higher effort)

Integrate Cohere Rerank or local cross-encoder model for production-grade reranking.

## Trade-offs

| Approach | Latency | Cost | Quality |
|----------|---------|------|---------|
| Vector only | ~50ms | Low | Baseline |
| Pre-computed scores | ~50ms | Low | +10-15% |
| LLM reranker | ~500ms | Medium | +25-30% |
| Cross-encoder | ~200ms | Low (local) | +20-25% |

## References

- [Cohere Rerank](https://cohere.com/rerank)
- [Sentence Transformers Cross-Encoders](https://www.sbert.net/docs/cross_encoder/usage.html)
- [Qdrant Hybrid Search](https://qdrant.tech/documentation/concepts/hybrid-queries/)
- [RAG Reranking Patterns](https://www.pinecone.io/learn/series/rag/rerankers/)
