# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Codex7 MCP is a Model Context Protocol server that provides up-to-date documentation and code examples for libraries. It fetches documentation from codex7.com and makes it available to LLM-powered coding assistants.

## Development Commands

```bash
# Install dependencies (uses bun)
bun i

# Build TypeScript to dist/
bun run build

# Run the server (HTTP transport)
bun run start

# Run directly from source
bun run dist/index.js --transport stdio --api-key YOUR_KEY

# Format code
bun run format

# Lint and auto-fix
bun run lint

# Check linting without fixing
bun run lint:check

# Build MCP bundle for desktop extension
bun run pack-mcpb
```

## Architecture

### Entry Point and Transport Layer (`src/index.ts`)
The MCP server supports two transport modes:
- **stdio**: For local CLI usage, reads API key from `--api-key` flag or `CONTEXT7_API_KEY` env var
- **http**: For remote connections, provides endpoints at `/mcp` (StreamableHTTP), `/sse` (SSE), and `/messages` (POST for SSE sessions)

The server creates a new `McpServer` instance per request (for HTTP) or per session (for stdio), registering two tools:
- `resolve-library-id`: Searches for libraries and returns Codex7-compatible IDs
- `get-library-docs`: Fetches documentation for a specific library ID

### API Layer (`src/lib/api.ts`)
Communicates with `codex7.com/api/v1/`:
- `searchLibraries()`: Search endpoint returning matching libraries
- `fetchLibraryDocumentation()`: Fetch docs by library ID with optional topic filter and token limit

Supports HTTP/HTTPS proxy via standard environment variables (`HTTPS_PROXY`, `https_proxy`, etc.).

### Supporting Modules
- `src/lib/types.ts`: TypeScript interfaces for `SearchResult`, `SearchResponse`, `DocumentState`
- `src/lib/utils.ts`: Formatting functions for search results
- `src/lib/encryption.ts`: Client IP encryption for rate limiting (AES-256-CBC)

## Key Configuration

- **Minimum tokens**: 1000 (values below this are auto-increased)
- **Default tokens**: 5000
- **Default HTTP port**: 3000 (auto-increments if in use)

## API Key Handling

For HTTP transport, API keys are extracted from headers in this priority order:
1. `Authorization: Bearer <key>`
2. `Codex7-API-Key` / `X-API-Key` (various casings)

For stdio transport, use `--api-key` flag or `CONTEXT7_API_KEY` environment variable.

## Auto-invoke Rule

Add to your CLAUDE.md or equivalent rules file to auto-invoke Codex7:
```
Always use codex7 when I need code generation, setup or configuration steps, or
library/API documentation.
```
