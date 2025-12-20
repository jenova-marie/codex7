#!/usr/bin/env node

import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchLibraries, fetchLibraryDocumentation } from "./lib/api.js";
import { formatSearchResults } from "./lib/utils.js";
import { SearchResponse } from "./lib/types.js";
import {
  searchLocalLibraries,
  isLocalLibrary,
  fetchLocalDocumentation,
  fetchLocalDocument,
  isLocalStorageConfigured,
} from "./lib/local-api.js";
import { createServer } from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Command } from "commander";
import { IncomingMessage } from "http";

/** Minimum allowed tokens for documentation retrieval */
const MINIMUM_TOKENS = 1000;
/** Default tokens when none specified */
const DEFAULT_TOKENS = 5000;
/** Default HTTP server port */
const DEFAULT_PORT = 3000;

// Parse CLI arguments using commander
const program = new Command()
  .option("--transport <stdio|http>", "transport type", "stdio")
  .option("--port <number>", "port for HTTP transport", DEFAULT_PORT.toString())
  .option("--api-key <key>", "API key for authentication (or set CONTEXT7_API_KEY env var)")
  .allowUnknownOption() // let MCP Inspector / other wrappers pass through extra flags
  .parse(process.argv);

const cliOptions = program.opts<{
  transport: string;
  port: string;
  apiKey?: string;
}>();

// Validate transport option
const allowedTransports = ["stdio", "http"];
if (!allowedTransports.includes(cliOptions.transport)) {
  console.error(
    `Invalid --transport value: '${cliOptions.transport}'. Must be one of: stdio, http.`
  );
  process.exit(1);
}

// Transport configuration
const TRANSPORT_TYPE = (cliOptions.transport || "stdio") as "stdio" | "http";

// Disallow incompatible flags based on transport
const passedPortFlag = process.argv.includes("--port");
const passedApiKeyFlag = process.argv.includes("--api-key");

if (TRANSPORT_TYPE === "http" && passedApiKeyFlag) {
  console.error(
    "The --api-key flag is not allowed when using --transport http. Use header-based auth at the HTTP layer instead."
  );
  process.exit(1);
}

if (TRANSPORT_TYPE === "stdio" && passedPortFlag) {
  console.error("The --port flag is not allowed when using --transport stdio.");
  process.exit(1);
}

// HTTP port configuration
const CLI_PORT = (() => {
  const parsed = parseInt(cliOptions.port, 10);
  return isNaN(parsed) ? undefined : parsed;
})();

function getClientIp(req: IncomingMessage): string | undefined {
  // Check both possible header casings
  const forwardedFor = req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"];

  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const ipList = ips.split(",").map((ip) => ip.trim());

    // Find the first public IP address
    for (const ip of ipList) {
      const plainIp = ip.replace(/^::ffff:/, "");
      if (
        !plainIp.startsWith("10.") &&
        !plainIp.startsWith("192.168.") &&
        !/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(plainIp)
      ) {
        return plainIp;
      }
    }
    // If all are private, use the first one
    return ipList[0].replace(/^::ffff:/, "");
  }

  // Fallback: use remote address, strip IPv6-mapped IPv4
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress.replace(/^::ffff:/, "");
  }
  return undefined;
}

// Function to create a new server instance with all tools registered
function createServerInstance(clientIp?: string, apiKey?: string) {
  const server = new McpServer(
    {
      name: "Codex7",
      version: "1.0.13",
    },
    {
      instructions:
        "Use this server to retrieve up-to-date documentation and code examples for any library.",
    }
  );

  // Register Codex7 tools
  server.registerTool(
    "resolve-library-id",
    {
      title: "Resolve Codex7 Library ID",
      description: `Resolves a package/product name to a Codex7-compatible library ID and returns a list of matching libraries.

IMPORTANT: Each result includes a "Use Tool" field indicating which tool to call:
- "get-local-docs": For local libraries indexed by Codex7
- "get-library-docs": For remote libraries via Context7 API

Always check the "Use Tool" field and call the appropriate tool for that library.

Selection Process:
1. Analyze the query to understand what library/package the user is looking for
2. Return the most relevant match based on:
- Name similarity to the query (exact matches prioritized)
- Description relevance to the query's intent
- Documentation coverage (prioritize libraries with higher Code Snippet counts)
- Trust score (consider libraries with scores of 7-10 more authoritative)

Response Format:
- Return the selected library ID in a clearly marked section
- Note which tool to use based on the "Use Tool" field
- If multiple good matches exist, acknowledge this but proceed with the most relevant one
- If no good matches exist, clearly state this and suggest query refinements

For ambiguous queries, request clarification before proceeding with a best-guess match.`,
      inputSchema: {
        libraryName: z
          .string()
          .describe("Library name to search for and retrieve a Codex7-compatible library ID."),
      },
    },
    async ({ libraryName }) => {
      // Check local libraries first
      let localResults: SearchResponse = { results: [] };
      if (isLocalStorageConfigured()) {
        try {
          localResults = await searchLocalLibraries(libraryName);
        } catch (error) {
          console.error(`Local search failed: ${error}`);
        }
      }

      // Then check remote
      const remoteResponse: SearchResponse = await searchLibraries(libraryName, clientIp, apiKey);

      // Add tool/source to remote results
      const remoteResultsWithTool = remoteResponse.results.map((result) => ({
        ...result,
        tool: "get-library-docs" as const,
        source: "remote" as const,
      }));

      // Merge results: local first (higher trust), then remote
      const mergedResponse: SearchResponse = {
        results: [...localResults.results, ...remoteResultsWithTool],
        error: remoteResponse.error,
      };

      if (!mergedResponse.results || mergedResponse.results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: mergedResponse.error
                ? mergedResponse.error
                : "Failed to retrieve library documentation data from Codex7",
            },
          ],
        };
      }

      const resultsText = formatSearchResults(mergedResponse);

      // Add note about local libraries if any found
      const localNote =
        localResults.results.length > 0
          ? `\n\nNote: ${localResults.results.length} local library/libraries found (marked with trust score 10).\n`
          : "";

      return {
        content: [
          {
            type: "text",
            text: `Available Libraries (top matches):${localNote}

Each result includes:
- Library ID: Codex7-compatible identifier (format: /org/project)
- Use Tool: Which tool to call (get-local-docs or get-library-docs)
- Source: Where the library is stored (local or remote)
- Description: Short summary
- Code Snippets: Number of available code examples
- Trust Score: Authority indicator

IMPORTANT: Always check the "Use Tool" field to know which tool to call for each library.

----------

${resultsText}`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "get-library-docs",
    {
      title: "Get Library Docs",
      description:
        "Fetches up-to-date documentation for a library. You must call 'resolve-library-id' first to obtain the exact Codex7-compatible library ID required to use this tool, UNLESS the user explicitly provides a library ID in the format '/org/project' or '/org/project/version' in their query.",
      inputSchema: {
        codex7CompatibleLibraryID: z
          .string()
          .describe(
            "Exact Codex7-compatible library ID (e.g., '/mongodb/docs', '/vercel/next.js', '/supabase/supabase', '/vercel/next.js/v14.3.0-canary.87') retrieved from 'resolve-library-id' or directly from user query in the format '/org/project' or '/org/project/version'."
          ),
        topic: z
          .string()
          .optional()
          .describe("Topic to focus documentation on (e.g., 'hooks', 'routing')."),
        tokens: z
          .preprocess((val) => (typeof val === "string" ? Number(val) : val), z.number())
          .transform((val) => (val < MINIMUM_TOKENS ? MINIMUM_TOKENS : val))
          .optional()
          .describe(
            `Maximum number of tokens of documentation to retrieve (default: ${DEFAULT_TOKENS}). Higher values provide more context but consume more tokens.`
          ),
      },
    },
    async ({ codex7CompatibleLibraryID, tokens = DEFAULT_TOKENS, topic = "" }) => {
      // Check if this is a local library - redirect to get-local-docs
      if (isLocalStorageConfigured()) {
        try {
          const isLocal = await isLocalLibrary(codex7CompatibleLibraryID);
          if (isLocal) {
            return {
              content: [
                {
                  type: "text",
                  text: `This is a local library. Use 'get-local-docs' tool instead for enhanced local documentation access.

Call: get-local-docs({ libraryId: "${codex7CompatibleLibraryID}", topic: "${topic || "your topic"}" })`,
                },
              ],
            };
          }
        } catch (error) {
          console.error(`Local library check failed: ${error}`);
        }
      }

      // Remote API only
      const fetchDocsResponse = await fetchLibraryDocumentation(
        codex7CompatibleLibraryID,
        {
          tokens,
          topic,
        },
        clientIp,
        apiKey
      );

      if (!fetchDocsResponse) {
        return {
          content: [
            {
              type: "text",
              text: "Documentation not found or not finalized for this library. This might have happened because you used an invalid Codex7-compatible library ID. To get a valid Codex7-compatible library ID, use the 'resolve-library-id' with the package name you wish to retrieve documentation for.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: fetchDocsResponse,
          },
        ],
      };
    }
  );

  // Register get-local-docs tool for local libraries
  server.registerTool(
    "get-local-docs",
    {
      title: "Get Local Docs",
      description: `Fetches documentation for a LOCAL library indexed by Codex7.

IMPORTANT: Only use this tool when resolve-library-id returns "tool": "get-local-docs"

For remote Context7 libraries, use 'get-library-docs' instead.

Parameters:
- libraryId: The library ID from resolve-library-id (required)
- path: Document path to fetch (e.g., 'README.md', 'docs/api.md') - returns full document
- topics: Topic filter array (e.g., ['routing', 'auth']) - pre-filters snippets by topic
- topic: Semantic search query within filtered results
- tokens: Maximum tokens to return (default: 5000)

Usage:
- To get a specific document: use 'path' parameter
- To filter by topics: use 'topics' array (from resolve-library-id Topics field)
- To search semantically: use 'topic' string for free-form search
- Combine both: topics filter + topic query for focused results
- Start with README.md to understand library structure`,
      inputSchema: {
        libraryId: z.string().describe("Library ID in /org/project format from resolve-library-id"),
        path: z.string().optional().describe("Document path: 'README.md' or 'docs/api.md'"),
        topics: z.array(z.string()).optional().describe("Filter by topics: ['routing', 'auth'] (from Topics field)"),
        topic: z.string().optional().describe("Semantic search query within filtered results"),
        tokens: z
          .preprocess((val) => (typeof val === "string" ? Number(val) : val), z.number())
          .transform((val) => (val < MINIMUM_TOKENS ? MINIMUM_TOKENS : val))
          .optional()
          .describe(
            `Maximum number of tokens of documentation to retrieve (default: ${DEFAULT_TOKENS}).`
          ),
      },
    },
    async ({ libraryId, path, topics, topic = "", tokens = DEFAULT_TOKENS }) => {
      // Validate: must be local library
      if (!isLocalStorageConfigured()) {
        return {
          content: [
            {
              type: "text",
              text: "Local storage is not configured. Use 'get-library-docs' for remote Context7 libraries.",
            },
          ],
        };
      }

      const isLocal = await isLocalLibrary(libraryId);
      if (!isLocal) {
        return {
          content: [
            {
              type: "text",
              text: `This library is not locally indexed. Use 'get-library-docs' for remote Context7 libraries.

Call: get-library-docs({ codex7CompatibleLibraryID: "${libraryId}", topic: "${topic || "your topic"}" })`,
            },
          ],
        };
      }

      // If path provided, fetch specific document
      if (path) {
        const doc = await fetchLocalDocument(libraryId, path, { tokens });
        if (!doc) {
          return {
            content: [
              {
                type: "text",
                text: `Document not found: ${path}

Use resolve-library-id to see available documents for this library.`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `# ${doc.title}\n\nSource: ${path}\n\n${doc.content}`,
            },
          ],
        };
      }

      // Otherwise, use topic-based snippet search (with optional topics filter)
      const fetchDocsResponse = await fetchLocalDocumentation(libraryId, { topics, topic, tokens });

      if (!fetchDocsResponse) {
        return {
          content: [
            {
              type: "text",
              text: "No documentation found for this local library.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: fetchDocsResponse,
          },
        ],
      };
    }
  );

  return server;
}

async function main() {
  const transportType = TRANSPORT_TYPE;

  if (transportType === "http") {
    // Get initial port from environment or use default
    const initialPort = CLI_PORT ?? DEFAULT_PORT;
    // Keep track of which port we end up using
    let actualPort = initialPort;
    const httpServer = createServer(async (req, res) => {
      const pathname = new URL(req.url || "/", "http://localhost").pathname;

      // Set CORS headers for all responses
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, MCP-Session-Id, MCP-Protocol-Version, X-Codex7-API-Key, Codex7-API-Key, X-API-Key, Authorization"
      );
      res.setHeader("Access-Control-Expose-Headers", "MCP-Session-Id");

      // Handle preflight OPTIONS requests
      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      // Function to extract header value safely, handling both string and string[] cases
      const extractHeaderValue = (value: string | string[] | undefined): string | undefined => {
        if (!value) return undefined;
        return typeof value === "string" ? value : value[0];
      };

      // Extract Authorization header and remove Bearer prefix if present
      const extractBearerToken = (
        authHeader: string | string[] | undefined
      ): string | undefined => {
        const header = extractHeaderValue(authHeader);
        if (!header) return undefined;

        // If it starts with 'Bearer ', remove that prefix
        if (header.startsWith("Bearer ")) {
          return header.substring(7).trim();
        }

        // Otherwise return the raw value
        return header;
      };

      // Check headers in order of preference
      const apiKey =
        extractBearerToken(req.headers.authorization) ||
        extractHeaderValue(req.headers["Codex7-API-Key"]) ||
        extractHeaderValue(req.headers["X-API-Key"]) ||
        extractHeaderValue(req.headers["codex7-api-key"]) ||
        extractHeaderValue(req.headers["x-api-key"]) ||
        extractHeaderValue(req.headers["Codex7_API_Key"]) ||
        extractHeaderValue(req.headers["X_API_Key"]) ||
        extractHeaderValue(req.headers["codex7_api_key"]) ||
        extractHeaderValue(req.headers["x_api_key"]);

      try {
        // Extract client IP address using socket remote address (most reliable)
        const clientIp = getClientIp(req);

        // Create new server instance for each request
        const requestServer = createServerInstance(clientIp, apiKey);

        if (pathname === "/mcp") {
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
          });
          res.on("close", () => {
            transport.close();
            requestServer.close();
          });
          await requestServer.connect(transport);
          await transport.handleRequest(req, res);
        } else if (pathname === "/ping") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "ok", message: "pong" }));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not found", status: 404 }));
        }
      } catch (error) {
        console.error("Error handling request:", error);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error", status: 500 }));
        }
      }
    });

    // Function to attempt server listen with port fallback
    const startServer = (port: number, maxAttempts = 10) => {
      httpServer.once("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE" && port < initialPort + maxAttempts) {
          console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
          startServer(port + 1, maxAttempts);
        } else {
          console.error(`Failed to start server: ${err.message}`);
          process.exit(1);
        }
      });

      httpServer.listen(port, () => {
        actualPort = port;
        console.error(
          `Codex7 Documentation MCP Server running on ${transportType.toUpperCase()} at http://localhost:${actualPort}/mcp`
        );
      });
    };

    // Start the server with initial port
    startServer(initialPort);
  } else {
    // Stdio transport - this is already stateless by nature
    const apiKey = cliOptions.apiKey || process.env.CONTEXT7_API_KEY;
    const server = createServerInstance(undefined, apiKey);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Codex7 Documentation MCP Server running on stdio");
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
