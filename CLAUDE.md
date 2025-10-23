# 🚀 Codex7 - Claude Code Instructions

> **The truly open-source documentation MCP server**
>
> Building what context7 *pretends* to be - transparent, self-hostable, community-driven 💜

---

## 🎯 Project Mission

**Codex7** is a fully open-source, self-hostable MCP server that provides up-to-date documentation and code examples for LLMs and AI code editors. This project exists to expose "open-source washing" and build what the community actually needs.

### Why Codex7 Exists

Context7 claims to be open-source but only open-sources a thin API wrapper (~430 lines) while hiding:
- ❌ Proprietary documentation indexing
- ❌ Closed-source backend API
- ❌ Unknown LLM processing
- ❌ Hidden trust scoring algorithms
- ❌ Opaque data retention policies

**Codex7 is different:**
- ✅ Truly open-source indexing pipeline
- ✅ Transparent documentation processing
- ✅ Self-hostable backend (not just the client)
- ✅ No proprietary API dependencies
- ✅ Community owns the data
- ✅ Privacy-first architecture

See [GitHub Issue #824](https://github.com/upstash/context7/issues/824) for the full context.

---

## 🏗️ Project Structure

This is a **pnpm monorepo** with microservices architecture:

```
codex7/
├── packages/
│   ├── 📦 shared/              # Shared types, utils, storage interfaces
│   ├── 📡 mcp-server/          # MCP server (stdio/HTTP)
│   ├── 🌐 api/                 # REST API (Express)
│   ├── 🎨 web/                 # React + Vite dashboard
│   ├── 🔍 indexer/             # Document processing service
│   ├── 💾 storage-postgres/    # PostgreSQL + pgvector adapter
│   ├── 💾 storage-sqlite/      # SQLite adapter (future)
│   └── 💾 storage-qdrant/      # Qdrant adapter (future)
├── docs/                       # Comprehensive documentation
├── scripts/                    # Setup & deployment scripts
├── deployments/                # Docker & cloud configs
└── examples/                   # Usage examples
```

---

## 🛠️ Tech Stack

### Core Technologies
- **Package Manager**: pnpm (monorepo support)
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20+ LTS
- **Testing**: Vitest
- **Documentation**: TSDoc

### Service Stack
- **MCP Server**: @modelcontextprotocol/sdk
- **REST API**: Express.js
- **Web UI**: React 18 + Vite
- **Indexer**: Custom TypeScript

### Data & Libraries
- **Database**: PostgreSQL 16 + pgvector (primary), SQLite + sqlite-vec (lightweight)
- **Reactive**: RxJS
- **Error Handling**: @jenova-marie/ts-rust-result
- **Logging**: @jenova-marie/wonder-logger (beautiful structured logs!)
- **Embeddings**: OpenAI API (configurable)
- **LLM**: Claude SDK (future intelligent reranking)

### Infrastructure
- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: AWS EC2 (self-hosted)
- **Reverse Proxy**: nginx
- **SSL**: Let's Encrypt

---

## 📋 Development Principles

### Code Standards
1. ✨ **TypeScript-first** - Strong typing, no `any`
2. 🧪 **Test-driven** - Write tests first, aim for >80% coverage
3. 📝 **Document everything** - TSDoc for all public APIs
4. 🔒 **Security-first** - Encryption, least privilege, input validation
5. 🎨 **Beautiful code** - ESLint + Prettier configured
6. 💜 **Community-focused** - Clear, welcoming, emoji-rich!

### Emoji Usage 🎨

**We LOVE emojis!** Use them liberally in:
- 📝 Documentation (see `docs/EMOJI_GUIDE.md`)
- 💬 Git commits (e.g., `✨ feat: add semantic search`)
- 🐛 Issue titles
- 🔀 Pull request descriptions
- 📖 Code comments (where appropriate)

**Common emoji patterns:**
- 🚀 Launches, deployments, getting started
- ✨ New features
- 🐛 Bug fixes
- 📝 Documentation
- 🧪 Tests
- 🔒 Security
- 💜 Community love!

### Architecture Patterns

#### Storage Adapter Pattern
All database operations go through the `DocumentStore` interface:

```typescript
interface DocumentStore {
  indexDocument(doc: Document): Promise<void>
  semanticSearch(query: string, limit: number): Promise<Document[]>
  exactSearch(filters: Filters): Promise<Document[]>
}
```

**Current adapters:**
- ✅ PostgreSQL + pgvector (primary, best for self-hosting)
- 🔜 SQLite + sqlite-vec (lightweight)
- 🔜 Qdrant (high-scale)

#### Microservices Communication
- Services communicate via REST API
- Indexer uses job queue (BullMQ + Redis)
- Shared types in `@codex7/shared`
- Each service is independently deployable

---

## 🎯 Current Phase: Foundation (Phase 0)

### Immediate Goals (Days 1-2)
- [x] ✅ Create PLAN.md
- [x] ✅ Create README.md
- [x] ✅ Create CLAUDE.md (you are here!)
- [ ] 🏗️ Initialize pnpm workspace
- [ ] 📦 Setup shared package with types
- [ ] 🔧 Configure TypeScript, ESLint, Prettier
- [ ] 🧪 Setup Vitest
- [ ] 🐳 Create base Dockerfiles
- [ ] 🔄 Setup GitHub Actions CI
- [ ] 🤝 Create CONTRIBUTING.md & CODE_OF_CONDUCT.md

### Next Phase: MVP (Days 3-5)
See `PLAN.md` for complete roadmap.

---

## 💻 Development Workflow

### Setup Development Environment

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Start infrastructure (Postgres, Redis)
docker-compose up -d

# Run migrations
pnpm --filter @codex7/storage-postgres migrate

# Start all services in dev mode
pnpm dev

# Or start individual services
pnpm --filter @codex7/mcp-server dev
pnpm --filter @codex7/api dev
pnpm --filter @codex7/web dev
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run tests for specific package
pnpm --filter @codex7/mcp-server test

# Watch mode during development
pnpm test --watch
```

### Code Quality

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Formatting
pnpm format

# All checks (runs in CI)
pnpm check-all
```

---

## 🔑 Key Architectural Decisions

### 1. **Database: PostgreSQL + pgvector**
- **Why**: Best balance of self-hosting ease + semantic search capability
- **Vector search**: ~85-90% as good as specialized DBs
- **Benefits**: Single dependency, ACID compliance, mature ecosystem
- **Alternative**: SQLite for lightweight deployments (via adapter)

### 2. **Context7-Compatible API**
- **Decision**: Support their MCP tools (`resolve-library-id`, `get-library-docs`)
- **Why**: Migration path for users fleeing context7
- **Plus**: Add extensions (`search-documentation`, `get-versions`, etc.)

### 3. **Microservices Architecture**
- **Why**: Independent scaling, clear separation of concerns
- **Deployment**: Docker Compose for simplicity, K8s-ready for scale
- **Development**: Can work on services independently

### 4. **OpenAI Embeddings (Configurable)**
- **MVP**: OpenAI API for quality embeddings
- **Future**: Local models (transformers.js) for privacy
- **Design**: Pluggable embedding providers

---

## 📚 Documentation Philosophy

All documentation should be:
- 🎨 **Emoji-rich** - Make it delightful to read!
- 📖 **Comprehensive** - Cover all use cases
- 🚀 **Actionable** - Clear steps, not just theory
- 💡 **Insightful** - Explain the "why", not just "how"
- 🤝 **Welcoming** - Assume good intent, be helpful

### Documentation Files
- `README.md` - Project overview, quick start
- `PLAN.md` - Comprehensive implementation plan
- `CLAUDE.md` - This file! AI assistant instructions
- `CONTRIBUTING.md` - How to contribute
- `docs/GETTING_STARTED.md` - Installation guide
- `docs/ARCHITECTURE.md` - System design deep dive
- `docs/SELF_HOSTING.md` - Deployment guide
- `docs/EMOJI_GUIDE.md` - Emoji usage patterns
- See `PLAN.md` for full documentation strategy

---

## 🤝 Community Focus

### Core Values
- 💜 **Welcoming** - Everyone is welcome to contribute
- 🌍 **Inclusive** - Diverse perspectives make better software
- 🙏 **Respectful** - Assume good intent, be kind
- 🎉 **Celebratory** - Recognize contributions publicly
- 📖 **Transparent** - Open decision-making process

### Community Channels
- 💬 **Slack**: Real-time chat, support (coming soon)
- 💭 **GitHub Discussions**: Long-form Q&A, RFCs
- 🐦 **Twitter/X**: Updates, tips, highlights
- 📝 **Blog**: Technical deep-dives, tutorials

### Contribution Recognition
- 🏅 Contributors listed in README
- 🌟 Monthly contributor highlights
- 📝 Blog posts about significant contributions
- 💎 Early access to new features

---

## 🔒 Security Best Practices

### Code Security
- ✅ Input validation on all API endpoints
- ✅ Parameterized SQL queries (no string concatenation)
- ✅ XSS protection in web UI
- ✅ CORS properly configured
- ✅ Rate limiting per API key
- ✅ No secrets in code (use env vars)

### Data Security
- ✅ Embeddings encrypted at rest
- ✅ TLS/SSL for all connections
- ✅ JWT-based authentication
- ✅ Audit logging for sensitive operations
- ✅ Least privilege database access

### Dependency Security
- ✅ GitHub Actions security scanning
- ✅ Regular dependency updates
- ✅ Snyk/Dependabot integration
- ✅ Container image scanning

---

## 🐳 Deployment

### Local Development
```bash
docker-compose up -d
pnpm dev
```

### Production (AWS EC2)
```bash
# Run automated setup script
curl -fsSL https://raw.githubusercontent.com/jenova-marie/codex7/main/scripts/setup-prod.sh | bash

# Or manually
docker-compose -f docker-compose.prod.yml up -d
```

See `docs/SELF_HOSTING.md` for comprehensive deployment guide.

---

## 🎯 Success Metrics

### Technical
- ✅ Test coverage >80%
- ⚡ API response time <500ms p95
- 🔍 Search relevance >90% (user feedback)
- 🐳 Docker images <500MB per service

### Community
- ⭐ 1,000 GitHub stars (Month 1)
- 👥 20 contributors (Month 1)
- 💬 500 Slack members (Quarter 1)

### Impact
- 📚 100+ libraries indexed (seed data)
- 🌍 Multiple self-hosted instances
- 🎉 Migration stories from context7

---

## 📖 Key References

### Internal Documentation
- `PLAN.md` - Complete project plan
- `QUESTIONS.md` - Architecture decisions
- `docs/ARCHITECTURE.md` - System design
- `docs/EMOJI_GUIDE.md` - Emoji conventions

### External Resources
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)

### Context7 Analysis
- [Issue #824](https://github.com/upstash/context7/issues/824) - Why codex7 exists
- [Context7 GitHub](https://github.com/upstash/context7) - What we're improving upon

---

## 💡 Working with Claude Code

### Best Practices
1. 🎯 **Be specific** - Clear tasks get better results
2. 📝 **Reference files** - Use `@filename` to provide context
3. 🧪 **Test-first** - Ask for tests alongside implementation
4. 📚 **Document** - Request TSDoc comments for APIs
5. 🔍 **Review** - Check generated code, ask questions
6. 🎨 **Emoji** - Remind me to use emojis liberally!

### Common Commands
```
"Add emojis to the documentation"
"Write tests for the storage adapter"
"Create a new MCP tool for semantic search"
"Update PLAN.md with our progress"
"Review this code for security issues"
"Generate TSDoc comments for this module"
```

---

## 🚀 Current Status

**Phase**: 🏗️ Foundation (Phase 0)
**Timeline**: Days 1-2 of implementation
**Next Milestone**: Complete monorepo setup, begin MVP

---

## 💜 Remember

- **This is our 3rd MCP server** - We know what we're doing!
- **Community is everything** - Build for them, with them
- **Transparency wins** - Show what real open-source looks like
- **Emojis make everything better** - Use them everywhere! 🎨✨
- **Have fun** - Building cool stuff with the community is a joy!

---

**Made with 💜 by Jenova Marie**

*"Building what context7 pretends to be - truly open, truly transparent, truly community-driven"* ✨

---

## 🎨 Quick Reference

### Project Emojis
| Emoji | Meaning |
|-------|---------|
| 🚀 | Launch, deployment, getting started |
| 📦 | Packages, dependencies |
| 📡 | MCP server |
| 🌐 | API, web services |
| 🎨 | UI, design, emojis! |
| 🔍 | Indexer, search |
| 💾 | Storage, database |
| ✨ | New features |
| 🐛 | Bug fixes |
| 🧪 | Tests |
| 📝 | Documentation |
| 🔒 | Security |
| 💜 | Community, love |
| 🎉 | Celebrations |
| 🤝 | Collaboration |

### Commit Message Prefixes
```
✨ feat: New feature
🐛 fix: Bug fix
📝 docs: Documentation
🧪 test: Tests
🔥 perf: Performance
♻️ refactor: Code refactoring
🎨 style: Formatting, UI
🔒 security: Security improvements
🔧 chore: Maintenance
```

---

**Let's build something amazing! 🚀✨💜**
- I don't like you EVER pushing a branch w/o explicit permission
- DON'T make any git commits unless explicitly instructed to do so.
- Your iris-mcp team name is "team-codex7"  **Use it** in all iris-mcp tools that require a fromTeam.