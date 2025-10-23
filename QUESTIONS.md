# Codex7 Architecture Questions

## Status

### ✅ Decided Questions

- ✅ **Question 1**: Database/Vector Store Strategy → **DECISION: PostgreSQL + pgvector with adapter pattern**
  - Documented in: Initial planning discussions

- ✅ **Question 6**: Embedding Model Strategy → **DECISION: OpenAI text-embedding-3-small**
  - Model: text-embedding-3-small (1536 dimensions)
  - Cost: $0.02 per 1M tokens
  - Rationale: Industry standard, reasonable cost, high quality
  - Future: Can add local models via adapter pattern
  - Documented in: `docs/DATABASE_DESIGN.md`

- ✅ **Question 8**: API Design → **DECISION: Context7-compatible core + extensions**
  - Core tools: `resolve-library-id`, `get-library-docs` (100% compatible)
  - Extensions planned: `search-documentation`, `get-library-versions`, etc.
  - Documented in: `PLAN.md` Phase 1.3

- ✅ **Question 9**: Processing Pipeline → **DECISION: Hybrid structural chunking**
  - Strategy: Chunk by markdown headers with 512 token max size
  - Hierarchy preservation: Stored in `hierarchy TEXT[]` column
  - Metadata: parent_doc_id, chunk_index, source_url, has_code, code_language
  - Deduplication: SHA-256 content hashing to reuse embeddings
  - Documented in: `docs/DATABASE_DESIGN.md` section "Document Chunking Strategy"

- ✅ **Question 10 (NEW)**: Unified vs Separate Schema → **DECISION: Unified schema for all source types**
  - Single `documents` table handles GitHub, web, PDF sources
  - Source-type discrimination via `source_type` enum field
  - Type-specific metadata stored in `metadata` JSONB column
  - Benefits: Fast vector search (no UNION), cross-source deduplication, simpler API
  - Documented in: `docs/DATABASE_DESIGN.md` section "Unified Schema for Multiple Source Types"

- ✅ **Question 11 (REVISED)**: LlamaIndex/RAG Frameworks → **DECISION: Hybrid approach for Phase 0**
  - **USE** LlamaIndex.TS for: document loaders, text splitting, code block detection, metadata extraction
  - **KEEP CUSTOM**: database schema, storage adapter, MCP interface, query logic, vector index config
  - Rationale: Battle-tested chunking (solves edge cases) + maintain architectural control
  - Best of both worlds: proven components + custom architecture
  - Documented in: `docs/DATABASE_DESIGN.md` section "LlamaIndex.TS Integration (Phase 0)"

- ✅ **Question 12 (NEW)**: Document Count Target → **DECISION: 75,000 documents for Phase 1 MVP**
  - Target: 75k documents on t3.medium (4GB RAM)
  - Memory usage: ~2GB (comfortable headroom of 2GB)
  - Scaling path: 75k (t3.medium) → 150k (t3.large) → 500k+ (t3.xlarge)
  - Rationale: Sweet spot between 50k-100k range suggested by user
  - Documented in: `docs/DATABASE_DESIGN.md` capacity estimates

- ✅ **Question 13 (NEW)**: IVFFlat Configuration → **DECISION: Dynamic lists based on document count**
  - Formula: `lists = sqrt(total_documents)`
  - Phase 1 (75k docs): `lists = 274`
  - Probes: `20` (better recall, 90-95%)
  - REINDEX required when scaling beyond initial target
  - Documented in: `docs/DATABASE_DESIGN.md` IVFFlat section

- ✅ **Question 14 (NEW)**: Schema Simplification → **DECISION: Remove parent_doc_id for MVP**
  - Remove self-referential FK (unused in MVP)
  - Keep `hierarchy TEXT[]` for breadcrumb trails
  - Can add back in Phase 2 if use case emerges
  - Rationale: YAGNI principle - no queries use it
  - Documented in: `docs/DATABASE_DESIGN.md` schema

- ✅ **Question 15 (NEW)**: Partial Indexes → **DECISION: Add source-specific partial indexes for Phase 0**
  - GitHub: index on `source_path` WHERE `source_type = 'github'`
  - PDF: index on page number WHERE `source_type = 'pdf'`
  - Code: index on `code_language` WHERE `has_code = TRUE`
  - Benefits: Fast cross-source search + fast source-specific queries
  - Documented in: `docs/DATABASE_DESIGN.md` indexes section

- ✅ **Question 16 (REVISED)**: Migration Management → **DECISION: Drizzle ORM for schema + migrations**
  - Use Drizzle ORM (user has existing killer code for TS model + pg migrations!)
  - Type-safe schema definitions in TypeScript
  - Automatic migration generation with `drizzle-kit push`
  - Critical requirement: pgvector extension MUST be enabled BEFORE schema creation
  - Documented in: `docs/DATABASE_DESIGN.md` migration strategy

- ✅ **Question 17 (NEW)**: Connection Pooling → **DECISION: Add pgbouncer in Phase 1**
  - pgbouncer for connection pooling (transaction mode)
  - Reduce `max_connections` to 50 (from 100)
  - Reduce `work_mem` to 16MB (from 50MB) for more concurrency
  - Documented in: `docs/DATABASE_DESIGN.md` PostgreSQL configuration

- ✅ **Question 18 (NEW)**: Deduplication Strategy → **DECISION: API cost savings (Phase 1), true deduplication (Phase 2)**
  - Phase 1: Hash content, reuse embeddings if duplicate (saves API cost, not storage)
  - Monitor actual duplication rate during indexing
  - Phase 2: If >25% duplication, add separate `embeddings` table with JOIN
  - Documented in: `docs/DATABASE_DESIGN.md` deduplication section

## ⏳ Remaining Questions (Need Decisions)

### 2. Documentation Sources Priority
Which source types should we prioritize for MVP vs. future phases?

**Options:**
- [ ] GitHub repos with /docs folders (like context7 does)
- [ ] General web pages (documentation sites)
- [ ] PDF documentation files
- [ ] API reference sites (Swagger/OpenAPI)
- [ ] Internal/private documentation repositories
- [ ] YouTube tutorials/video transcripts

**MVP Recommendation:** Start with GitHub repos + web pages, as these cover 80% of use cases.

**Additional Context for Decision:**
- **GitHub repos** are easiest to implement (GitHub API, structured markdown)
- **Web pages** require HTML→Markdown conversion and sitemap discovery
- **PDFs** need OCR/text extraction, more complex
- Context7 focuses on GitHub repos only - we could differentiate by supporting web docs too
- Storage schema supports all via `source_type` and `source_url` columns

**Impact on Implementation:**
- Determines what scrapers to build in Phase 1.2 (Indexer Service)
- Affects initial seed data selection (100+ popular libraries goal)

---

### 3. LLM "Librarian" Feature Design
How should the intelligent document selection/ranking work?

**Sub-questions:**
- Should this be optional (for cost control)?
- Use Claude API exclusively or allow pluggable LLM providers?
- When does it activate?
  - All queries (expensive but accurate)
  - Only complex queries (need to define "complex")
  - User-toggled feature
- What's the workflow?
  - Option A: Vector search → LLM reranks top N results
  - Option B: LLM generates search query → Vector search → Return
  - Option C: Agentic (LLM can iteratively search/refine)

**Cost consideration:** Claude API calls for every query could get expensive for self-hosters.

**Additional Context for Decision:**
- This is a **Phase 2 feature** per PLAN.md (not needed for MVP)
- Can be fully optional/pluggable - users without API keys get vector search only
- **Recommendation**: Implement basic vector search first, add LLM reranking in Phase 2
- Schema already supports this via `metadata JSONB` for storing relevance scores

**Can defer this decision** until after MVP is functional.

---

### 4. Public vs Private Data Management
How do we handle the public documentation repository?

**Sub-questions:**
- **Submission workflow:**
  - Open GitHub PRs to add documentation sources?
  - Web form submission with admin approval?
  - Automated discovery + quality checks?

- **Quality control:**
  - Who approves public submissions?
  - Automated quality scoring?
  - Community voting/ranking?

- **Distribution:**
  - Central database that self-hosted instances can sync from?
  - Docker image with pre-indexed popular libraries?
  - Optional "seed data" download?

- **Private instances:**
  - Authentication: Built-in auth vs. reverse proxy (nginx)?
  - Multi-tenancy support or single-user only?
  - Separate databases per tenant?

**Additional Context for Decision:**

**For MVP (Phase 1):**
- **Submission**: Manual PR-based workflow (add library config to `seed-libraries.json`)
- **Quality**: Manual approval by maintainers (like Homebrew formula PRs)
- **Distribution**: SQL dump file of popular libraries (downloadable, importable)
- **Authentication**: Assume reverse proxy (nginx) - don't build auth into MVP
- **Multi-tenancy**: Single database, optional read-only public mode

**For Phase 3 (Production):**
- **Submission**: Web form + automated validation + admin approval queue
- **Quality**: `trust_score` algorithm (GitHub stars, downloads, update frequency)
- **Distribution**: Sync API endpoint (partial sync by library, not full dump)
- **Authentication**: Optional built-in JWT auth for hosted version
- **Multi-tenancy**: Database-per-tenant OR row-level security

**Critical decisions needed for Phase 1:**
1. **Seed data format**: JSON config file → indexer processes → SQL dump for distribution?
2. **Authentication**: Explicitly document "use nginx" or build minimal API key auth?

**Can partially defer** - Focus on single-user self-hosted MVP, add multi-tenancy later.

---

### 5. Monetization/Sustainability Path
How could this project sustain itself long-term?

**Options:**
- Hosted version (codex7.com) with premium features
- Enterprise features:
  - SSO/SAML integration
  - Advanced analytics
  - SLA guarantees
  - Priority support
- Consulting/support services for self-hosters
- GitHub Sponsors / Open Collective donations
- Commercial license for enterprise (dual-license model)

**Question:** What's your vision here? Pure OSS? Sustainable open-source business?

**Additional Context for Decision:**
- **Not critical for MVP** - Build great OSS first, monetization later
- **Community trust is paramount** - Any monetization must preserve open-source core
- Successful models: GitLab (open-core), Sentry (hosted + self-hosted), Cal.com (AGPL + hosted)
- Recommendation: MIT license core + optional hosted service (like Supabase model)

**Can defer this decision** - Focus on building something people love first.

---

---

### 7. Indexing Strategy
How do we keep documentation up-to-date?

**Options:**
- **On-demand**: Index when first requested (slow initial query)
- **Background jobs**: Periodic re-indexing (cron/scheduler)
- **Webhook triggers**: GitHub webhooks notify us of doc updates
- **Manual refresh**: Admin can trigger re-index via web UI

**For GitHub sources:**
- Track git commit SHA to detect changes
- Watch releases for version updates

**For web sources:**
- ETags / Last-Modified headers
- Content hash comparison
- Sitemap.xml monitoring

**Additional Context for Decision:**

**For MVP (Phase 1):**
- **Initial indexing**: Manual trigger via CLI or web UI
- **Change detection**: Store `git_commit_sha` in `versions` table
- **Re-indexing**: Background job checks for changes daily/weekly
- **Implementation**: Simple cron job + BullMQ queue for processing

**For Phase 2+:**
- **GitHub webhooks**: Real-time updates when docs change
- **Smart scheduling**: More frequent checks for popular libraries
- **Incremental updates**: Only re-index changed files (using content_hash)

**Critical decisions needed for Phase 1:**
1. **Job queue**: Use BullMQ (requires Redis) or simpler pg-boss (Postgres-only)?
2. **Check frequency**: Daily? Weekly? Configurable per library?
3. **Initial seed**: Process all 100+ libraries at once or batch them?

**Database already supports this:**
- `versions.git_commit_sha` - Detect GitHub changes
- `documents.content_hash` - Detect content changes
- `versions.indexed_at` - Track when last indexed
- `libraries.metadata` - Store webhook configs, check frequency, etc.

---


---

## Summary: What Needs Decisions?

### 🚨 Critical for Phase 1 MVP
1. **Question 2** - Documentation Sources Priority
   - Decision needed: GitHub repos only? Or add web scraping?
   - Impact: Determines indexer implementation scope

2. **Question 7** - Indexing Strategy (partial)
   - Decision needed: BullMQ vs pg-boss? Check frequency?
   - Impact: Job queue architecture

3. **Question 4** - Authentication (partial)
   - Decision needed: Build minimal API key auth or assume nginx?
   - Impact: API security model

### ⏳ Can Defer (Phase 2+)
- **Question 3** - LLM Librarian (Phase 2 feature)
- **Question 4** - Multi-tenancy, sync API (Phase 3)
- **Question 5** - Monetization (Long-term)

### ✅ Already Decided
- Question 1: PostgreSQL + pgvector ✅
- Question 6: OpenAI text-embedding-3-small ✅
- Question 8: Context7-compatible + extensions ✅
- Question 9: Hybrid structural chunking ✅
- Question 10: Unified schema for all source types ✅
- Question 11: No LlamaIndex for MVP (custom pipeline) ✅

## Next Steps
1. ✅ Decide on database strategy
2. ✅ Update QUESTIONS.md with context (this update)
3. ⏳ **Discuss database design** with user
4. ⏳ Make final decisions on Questions 2, 4, and 7
5. ⏳ Begin Phase 1 implementation

---

## Notes
- Keep self-hosting as the #1 priority
- Balance feature richness with simplicity
- MVP should be functional with minimal dependencies
