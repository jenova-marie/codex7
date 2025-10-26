-- Create IVFFlat index for embedding similarity search
-- Using cosine distance (best for normalized OpenAI embeddings)
-- lists = sqrt(row_count) ≈ 274 for ~75k documents
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 274);

-- Note: After inserting data, you may want to adjust 'lists' dynamically:
-- DROP INDEX documents_embedding_idx;
-- CREATE INDEX documents_embedding_idx ON documents
--   USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = GREATEST(FLOOR(SQRT((SELECT COUNT(*) FROM documents))), 10));
