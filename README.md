<div align="center">

<img src="assets/codex7-logo.png" alt="Codex7 Logo" width="200"/>

# 🚀 Codex7

> **The _truly_ open-source documentation MCP server**
>
> Built with 💜 by the community, for the community

[![Build Status](https://img.shields.io/github/actions/workflow/status/jenova-marie/codex7/ci.yml?branch=main&style=flat-square)](https://github.com/jenova-marie/codex7/actions)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Slack](https://img.shields.io/badge/Slack-Join%20Us-purple.svg?style=flat-square)](https://codex7.slack.com)

</div>

---

## ✨ What is Codex7?

**Codex7** provides up-to-date documentation and code examples for LLMs and AI code editors - **without proprietary APIs or black boxes**.

Unlike alternatives that claim to be "open-source" while hiding their entire indexing infrastructure behind closed APIs, Codex7 is **transparent from top to bottom**:

- ✅ **Fully open indexing pipeline** - See exactly how docs are processed
- ✅ **Self-hostable backend** - Run everything on your infrastructure
- ✅ **No proprietary dependencies** - Works completely offline
- ✅ **Community-owned data** - Documentation index built by developers
- ✅ **Privacy-first** - Your queries never leave your infrastructure
- ✅ **Context7-compatible** - Drop-in replacement for existing tools

---

## 🎯 Why Codex7 Exists

Context7 markets itself as open-source but only provides a thin API wrapper (~430 lines) while hiding:

- ❌ How documentation is indexed and parsed
- ❌ What LLM generates the summaries
- ❌ How trust scores are calculated
- ❌ Data retention policies
- ❌ Rate limiting beyond "you'll get 429 errors"

**This is open-source washing.** Their permissive license on the client is meaningless when you can't run the system without their proprietary backend at `https://context7.com/api`.

Codex7 is the **real open-source alternative** - transparent, self-hostable, and community-driven.

Read the full story: [GitHub Issue #824](https://github.com/upstash/context7/issues/824)

---

## 🚀 Quick Start

### 🐳 Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/jenova-marie/codex7.git
cd codex7

# Copy and configure environment
cp .env.example .env
# Edit .env with your OpenAI API key

# Start all services
docker-compose up -d

# Verify installation
curl http://localhost:3000/health
```

### 🛠️ Manual Installation

```bash
# Prerequisites: Node.js 20+, pnpm, PostgreSQL 16+

# Install dependencies
pnpm install

# Setup database
pnpm --filter @codex7/storage-postgres migrate

# Seed with sample data
pnpm run seed

# Start development servers
pnpm dev
```

### 🔌 Configure Claude Desktop

Add to your Claude Desktop MCP config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "codex7": {
      "command": "docker",
      "args": ["exec", "-i", "codex7-mcp-server", "node", "dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://codex7:password@postgres:5432/codex7"
      }
    }
  }
}
```

---

## 🌟 Features

### Current (MVP)
- ✅ **MCP Server** - Context7-compatible tool interface
- ✅ **Semantic Search** - Vector-based documentation retrieval
- ✅ **GitHub Indexing** - Automatically index docs from repositories
- ✅ **Web Scraping** - Index documentation websites
- ✅ **Version Support** - Track multiple library versions
- ✅ **Web Dashboard** - Manage documentation sources
- ✅ **REST API** - HTTP interface for integrations
- ✅ **Self-Hosting** - Complete Docker deployment

### Coming Soon
- 🔜 **LLM Librarian** - Intelligent document reranking
- 🔜 **Local Embeddings** - Privacy-focused local models
- 🔜 **PDF Support** - Index PDF documentation
- 🔜 **Auto-Updates** - GitHub webhooks for freshness
- 🔜 **Public Registry** - Community-contributed docs
- 🔜 **SQLite Adapter** - Lightweight deployments

---

## 🏗️ Architecture

Codex7 is a **microservices-based monorepo** with full transparency:

```
┌─────────────────────────────────────┐
│         Users / LLMs / AIs          │
└──────────────┬──────────────────────┘
               │
        ┌──────▼───────┐
        │  MCP Server  │  (stdio/HTTP)
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │   REST API   │  (Express)
        └───┬──────┬───┘
            │      │
    ┌───────▼──┐   └────────┐
    │ Search   │            │
    │ Service  │      ┌─────▼──────┐
    └────┬─────┘      │   Web UI   │
         │            └────────────┘
    ┌────▼─────┐
    │ Storage  │
    │ Adapter  │
    └────┬─────┘
         │
    ┌────▼──────────┐
    │  PostgreSQL   │
    │  + pgvector   │
    └───────────────┘

    ┌───────────────┐
    │    Indexer    │  (Background)
    │    Service    │
    └───┬───────────┘
        │
    ┌───▼─────────────────┐
    │  GitHub │ Web │ PDF │
    │ Scraper │Scrape│Parse│
    └─────────────────────┘
```

### Tech Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20+
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Database**: PostgreSQL 16 + pgvector
- **API Framework**: Express.js
- **Web UI**: React 18 + Vite
- **MCP SDK**: @modelcontextprotocol/sdk
- **Embeddings**: OpenAI API (configurable)
- **Logging**: @jenova-marie/wonder-logger
- **Error Handling**: @jenova-marie/ts-rust-result
- **Deployment**: Docker + Docker Compose

---

## 📚 Documentation

- 🏁 [Getting Started](docs/GETTING_STARTED.md) - Installation & setup
- 🏗️ [Architecture](docs/ARCHITECTURE.md) - System design deep dive
- 🐳 [Self-Hosting Guide](docs/SELF_HOSTING.md) - Deploy to your infrastructure
- 🔧 [Configuration](docs/CONFIGURATION.md) - Environment variables & settings
- 🔌 [API Reference](docs/API_REFERENCE.md) - REST API documentation
- 🛠️ [MCP Tools](docs/MCP_TOOLS.md) - MCP tool reference
- 📚 [Adding Documentation](docs/ADDING_DOCS.md) - Index new libraries
- 🎨 [Emoji Guide](docs/EMOJI_GUIDE.md) - Our emoji conventions
- 🤝 [Contributing](CONTRIBUTING.md) - Join the project!

---

## 🤝 Community

Join our growing community of developers building the future of transparent documentation!

- 💬 [Slack Workspace](https://codex7.slack.com) - Real-time chat & support
- 💭 [GitHub Discussions](https://github.com/jenova-marie/codex7/discussions) - Q&A and ideas
- 🐦 [Twitter/X](https://twitter.com/codex7_oss) - Updates & announcements
- 📝 [Blog](https://codex7.dev/blog) - Technical articles & tutorials

### Contributing

We welcome contributions of all kinds! Whether you're:

- 🐛 Reporting bugs
- ✨ Suggesting features
- 📝 Improving documentation
- 💻 Submitting code
- 🎨 Designing UI/UX
- 🌍 Adding translations

Check out our [Contributing Guide](CONTRIBUTING.md) to get started!

### Contributors

Thanks to all our amazing contributors! 💜

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- This section is auto-generated -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 🎨 Emoji Guide

We **love** emojis! They make our project delightful and help scan documentation quickly. Here's a quick reference:

| Emoji | Usage | Emoji | Usage |
|-------|-------|-------|-------|
| 🚀 | Launch, deploy | 📦 | Packages |
| ✨ | New features | 🐛 | Bug fixes |
| 📝 | Documentation | 🧪 | Tests |
| 🔒 | Security | 💜 | Community |
| 🎉 | Celebrations | 🤝 | Collaboration |
| 🔧 | Configuration | 🌐 | API, web |

See our full [Emoji Guide](docs/EMOJI_GUIDE.md) for detailed usage patterns!

---

## 🗺️ Roadmap

### Phase 1: MVP ✅ (In Progress)
- [x] PostgreSQL + pgvector storage
- [x] GitHub repository indexing
- [x] MCP server with context7-compatible tools
- [x] Basic web UI
- [x] REST API
- [ ] Docker deployment
- [ ] Production documentation

### Phase 2: Enhancement 🔜
- [ ] Web scraping for docs sites
- [ ] PDF documentation support
- [ ] LLM librarian for intelligent reranking
- [ ] Automatic re-indexing via webhooks
- [ ] Extended MCP tools
- [ ] Advanced security features

### Phase 3: Scale & Community 🌟
- [ ] Public documentation registry
- [ ] Community contribution workflow
- [ ] SQLite storage adapter
- [ ] Qdrant storage adapter
- [ ] Hosted version (optional)
- [ ] Enterprise features

See [PLAN.md](PLAN.md) for the complete roadmap!

---

## 🐳 Self-Hosting

Codex7 is designed for easy self-hosting. We provide:

- 🐳 **Docker Compose** - One-command deployment
- 📜 **Setup Scripts** - Automated installation
- 📊 **Monitoring** - Prometheus + Grafana dashboards
- 🔒 **SSL/TLS** - Automated Let's Encrypt setup
- 📖 **Documentation** - Comprehensive deployment guides

### Quick Deploy to AWS EC2

```bash
# SSH into your EC2 instance
ssh ubuntu@your-ec2-ip

# Run automated setup
curl -fsSL https://raw.githubusercontent.com/jenova-marie/codex7/main/scripts/setup-prod.sh | bash

# That's it! 🎉
```

See our [Self-Hosting Guide](docs/SELF_HOSTING.md) for detailed instructions.

---

## 🔒 Security

Security is a top priority for Codex7. We implement:

- ✅ Encryption at rest and in transit
- ✅ JWT-based authentication
- ✅ Rate limiting per API key
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Regular security audits
- ✅ Dependency scanning

Found a security issue? Please report it responsibly to **security@codex7.dev** or see our [Security Policy](SECURITY.md).

---

## 📊 Status

- **Phase**: 🏗️ Foundation (Phase 0)
- **Version**: 0.1.0-alpha
- **Status**: In active development
- **Target MVP**: Q1 2025

---

## 📄 License

**AGPL v3 License** - see [LICENSE](LICENSE) file for details.

Codex7 is licensed under the GNU Affero General Public License v3 (AGPL v3) to ensure it remains truly open source while preventing proprietary derivatives.

### What This Means for You

✅ **Use it freely** - Deploy in your organization, modify as needed
✅ **Build on top** - Create proprietary products using the API
✅ **Self-host privately** - No obligation to share your deployment
⚠️ **Share improvements** - If you modify and offer as SaaS, share your changes

### Why AGPL v3?

Unlike permissive licenses (MIT, Apache) that allow companies to create proprietary forks, **AGPL v3 ensures improvements flow back to the community**. This is especially important for network services - the "SaaS loophole" is closed.

**Need proprietary use?** We offer [commercial licensing](COMMERCIAL.md) for:
- Embedding in proprietary products
- SaaS deployments without source sharing
- Enterprise features and support

See [COMMERCIAL.md](COMMERCIAL.md) for details on our dual-licensing model.

**Unlike context7**, our license actually means something because you can run the entire system! 🚀

---

## 🙏 Acknowledgments

- **Context7** - For showing us what not to do with open-source
- **MCP Community** - For building an amazing protocol
- **PostgreSQL** - For pgvector and rock-solid reliability
- **All Contributors** - For making this project possible 💜

---

## 💬 Support

Need help? Have questions?

- 📖 Check our [Documentation](docs/GETTING_STARTED.md)
- 💬 Join our [Slack](https://codex7.slack.com)
- 🐛 [Open an issue](https://github.com/jenova-marie/codex7/issues)
- 💭 [Start a discussion](https://github.com/jenova-marie/codex7/discussions)

---

## 🌟 Star History

If you find Codex7 useful, please star the repository! It helps others discover the project.

[![Star History Chart](https://api.star-history.com/svg?repos=jenova-marie/codex7&type=Date)](https://star-history.com/#jenova-marie/codex7&Date)

---

<div align="center">

**Made with 💜 by [Jenova Marie](https://github.com/jenova-marie) and the Codex7 community**

*"Building what context7 pretends to be - truly open, truly transparent, truly community-driven"* ✨

[⭐ Star us on GitHub](https://github.com/jenova-marie/codex7) • [💬 Join Slack](https://codex7.slack.com) • [📖 Read the Docs](docs/GETTING_STARTED.md)

</div>
