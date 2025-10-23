# Codex7 Architecture Questions

## Status
- ✅ **Question 1**: Database/Vector Store Strategy → **DECISION: PostgreSQL + pgvector with adapter pattern**

## Remaining Questions

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

---

### 6. Embedding Model Strategy
How do we generate vector embeddings?

**Options:**
- **Claude API**: High quality, but costs $$ per million tokens
- **OpenAI Embeddings API**: Industry standard, reasonable cost
- **Local model**:
  - Transformers.js (runs in Node)
  - sentence-transformers (requires Python)
  - ONNX models
- **Configurable**: Let users choose their provider

**Trade-offs:**
- Quality vs. Cost vs. Self-hosting simplicity
- Model size: Small (fast, less accurate) vs. Large (slow, more accurate)

**MVP Recommendation:** Support OpenAI embeddings API with option to add local models later.

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

---

### 8. API Design
Should we exactly match context7's API or extend it?

**Context7 API (from MCP):**
- `resolve-library-id`: Library name → Library ID
- `get-library-docs`: Library ID + topic → Documentation

**Potential extensions:**
- `search-documentation`: Free-form semantic search
- `get-library-versions`: List available versions
- `suggest-related`: "Users who viewed X also viewed Y"
- `get-code-examples`: Filter to just code snippets
- `check-freshness`: When was this doc last updated?

**Question:** Start with 100% compatibility, or add extensions from day 1?

---

### 9. Processing Pipeline
How do we chunk and process documentation?

**Challenges:**
- Code examples vs. prose text (different chunking strategies)
- Markdown structure preservation
- Cross-references between docs
- Multi-language documentation (i18n)

**Options:**
- **Simple**: Fixed-size chunks (e.g., 512 tokens)
- **Structural**: Chunk by headers, preserving hierarchy
- **Semantic**: LLM-based intelligent chunking
- **Hybrid**: Structure-aware with size limits

**Metadata to store per chunk:**
- Parent document
- Section hierarchy (h1 > h2 > h3)
- Code language (if code block)
- Version/platform specific?

---

## Next Steps
1. ✅ Decide on database strategy
2. ⏳ Discuss and decide on questions 2-9
3. ⏳ Create PLAN.md with architectural decisions
4. ⏳ Begin implementation

---

## Notes
- Keep self-hosting as the #1 priority
- Balance feature richness with simplicity
- MVP should be functional with minimal dependencies
