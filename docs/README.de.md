# Codex7 MCP - Aktuelle Dokumentation für jeden Prompt

[![Website](https://img.shields.io/badge/Website-codex7.com-blue)](https://codex7.com) [![smithery badge](https://smithery.ai/badge/@upstash/codex7-mcp)](https://smithery.ai/server/@upstash/codex7-mcp) [<img alt="In VS Code installieren (npx)" src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Codex7%20MCP&color=0098FF">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22codex7%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40upstash%2Fcodex7-mcp%40latest%22%5D%7D)

## ❌ Ohne Codex7

KI-Sprachmodelle (LLMs) greifen auf veraltete oder allgemeine Informationen über die von dir verwendeten Bibliotheken zurück. Das Ergebnis:

- ❌ Codebeispiele sind veraltet und basieren auf Trainingsdaten, die Jahre alt sind
- ❌ Halluzinierte APIs, die gar nicht existieren
- ❌ Generische Antworten für alte Paketversionen

## ✅ Mit Codex7

Codex7 MCP holt aktuelle, versionsspezifische Dokumentationen und Codebeispiele direkt aus der Quelle und fügt sie in deinen Prompt ein.

Füge `use codex7` zu deinem Prompt in Cursor hinzu:

```txt
Erstelle ein einfaches Next.js-Projekt mit dem App Router. use codex7
```

```txt
Erstelle ein Skript zum Löschen der Zeilen, in denen die Stadt "" ist, mit PostgreSQL-Anmeldedaten. use codex7
```

Codex7 holt aktuelle Codebeispiele und Dokumentationen direkt in den Kontext deines LLMs.

- 1️⃣ Schreibe deinen Prompt auf natürliche Weise
- 2️⃣ Weise das LLM an, codex7 zu verwenden, mit `use codex7`
- 3️⃣ Erhalte funktionierende Codeantworten

Kein Tab-Switching, keine halluzinierten APIs, die nicht existieren, keine veralteten Code-Generierungen.

## 🛠️ Erste Schritte

### Anforderungen

- Node.js >= v18.0.0
- Cursor, Windsurf, Claude Desktop oder ein anderer MCP-Client

### Installation über Smithery

Um den Codex7 MCP Server für Claude Desktop automatisch über [Smithery](https://smithery.ai/server/@upstash/codex7-mcp) zu installieren:

```bash
npx -y @smithery/cli install @upstash/codex7-mcp --client claude
```

### Installation in Cursor

Gehe zu: `Einstellungen` -> `Cursor-Einstellungen` -> `MCP` -> `Neuen globalen MCP-Server hinzufügen`

Der empfohlene Ansatz ist die folgende Konfiguration in deine Cursor-Datei `~/.cursor/mcp.json` einzufügen. Siehe die [Cursor MCP Dokumentation](https://docs.cursor.com/context/model-context-protocol) für mehr Informationen.

```json
{
  "mcpServers": {
    "codex7": {
      "command": "npx",
      "args": ["-y", "@upstash/codex7-mcp@latest"]
    }
  }
}
```

<details>
<summary>Alternative: Bun verwenden</summary>

```json
{
  "mcpServers": {
    "codex7": {
      "command": "bunx",
      "args": ["-y", "@upstash/codex7-mcp@latest"]
    }
  }
}
```

</details>

<details>
<summary>Alternative: Deno verwenden</summary>

```json
{
  "mcpServers": {
    "codex7": {
      "command": "deno",
      "args": ["run", "--allow-net", "npm:@upstash/codex7-mcp"]
    }
  }
}
```

</details>

### Installation in Windsurf

Füge dies zu deiner Windsurf MCP-Konfigurationsdatei hinzu. Siehe die [Windsurf MCP Dokumentation](https://docs.windsurf.com/windsurf/mcp) für mehr Informationen.

```json
{
  "mcpServers": {
    "codex7": {
      "command": "npx",
      "args": ["-y", "@upstash/codex7-mcp@latest"]
    }
  }
}
```

### Installation in VS Code

[<img alt="In VS Code installieren (npx)" src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Codex7%20MCP&color=0098FF">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22codex7%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40upstash%2Fcodex7-mcp%40latest%22%5D%7D)
[<img alt="In VS Code Insiders installieren (npx)" src="https://img.shields.io/badge/VS_Code_Insiders-VS_Code_Insiders?style=flat-square&label=Install%20Codex7%20MCP&color=24bfa5">](https://insiders.vscode.dev/redirect?url=vscode-insiders%3Amcp%2Finstall%3F%7B%22name%22%3A%22codex7%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40upstash%2Fcodex7-mcp%40latest%22%5D%7D)

Füge dies zu deiner VS Code MCP-Konfigurationsdatei hinzu. Siehe die [VS Code MCP Dokumentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) für mehr Informationen.

```json
{
  "servers": {
    "Codex7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/codex7-mcp@latest"]
    }
  }
}
```

### Installation in Zed

Es kann über [Zed Extensions](https://zed.dev/extensions?query=Codex7) installiert werden oder du kannst dies zu deiner Zed `settings.json` hinzufügen. Siehe die [Zed Context Server Dokumentation](https://zed.dev/docs/assistant/context-servers) für mehr Informationen.

```json
{
  "context_servers": {
    "Codex7": {
      "command": {
        "path": "npx",
        "args": ["-y", "@upstash/codex7-mcp@latest"]
      },
      "settings": {}
    }
  }
}
```

### Installation in Claude Code

Führe diesen Befehl aus. Siehe die [Claude Code MCP Dokumentation](https://docs.anthropic.com/de/docs/claude-code/mcp) für mehr Informationen.

```sh
claude mcp add codex7 -- npx -y @upstash/codex7-mcp@latest
```

### Installation in Claude Desktop

Füge dies zu deiner Claude Desktop `claude_desktop_config.json` Datei hinzu. Siehe die [Claude Desktop MCP Dokumentation](https://modelcontextprotocol.io/quickstart/user) für mehr Informationen.

```json
{
  "mcpServers": {
    "Codex7": {
      "command": "npx",
      "args": ["-y", "@upstash/codex7-mcp@latest"]
    }
  }
}
```

### Installation im Copilot Coding Agent

Füge die folgende Konfiguration zum Abschnitt `mcp` deiner Copilot Coding Agent-Konfigurationsdatei hinzu (Repository->Settings->Copilot->Coding agent->MCP configuration):

```json
{
  "mcpServers": {
    "codex7": {
      "type": "http",
      "url": "https://mcp.codex7.com/mcp",
      "tools": ["get-library-docs", "resolve-library-id"]
    }
  }
}
```

Weitere Informationen findest du in der [offiziellen GitHub-Dokumentation](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/agents/copilot-coding-agent/extending-copilot-coding-agent-with-mcp).

### Docker verwenden

Wenn du den MCP-Server lieber in einem Docker-Container ausführen möchtest:

1.  **Docker-Image erstellen:**

    Erstelle zunächst ein `Dockerfile` im Projekt-Root (oder an einem Ort deiner Wahl):

    <details>
    <summary>Klicke, um den Dockerfile-Inhalt zu sehen</summary>

    ```Dockerfile
    FROM node:18-alpine

    WORKDIR /app

    # Installiere die neueste Version global
    RUN npm install -g @upstash/codex7-mcp@latest

    # Port freigeben, falls nötig (optional, abhängig von der MCP-Client-Interaktion)
    # EXPOSE 3000

    # Standardbefehl zum Ausführen des Servers
    CMD ["codex7-mcp"]
    ```

    </details>

    Baue dann das Image mit einem Tag (z.B. `codex7-mcp`). **Stelle sicher, dass Docker Desktop (oder der Docker-Daemon) läuft.** Führe den folgenden Befehl in dem Verzeichnis aus, in dem du das `Dockerfile` gespeichert hast:

    ```bash
    docker build -t codex7-mcp .
    ```

2.  **Konfiguriere deinen MCP-Client:**

    Aktualisiere die Konfiguration deines MCP-Clients, um den Docker-Befehl zu verwenden.

    _Beispiel für eine cline_mcp_settings.json:_

    ```json
    {
      "mcpServers": {
        "Сontext7": {
          "autoApprove": [],
          "disabled": false,
          "timeout": 60,
          "command": "docker",
          "args": ["run", "-i", "--rm", "codex7-mcp"],
          "transportType": "stdio"
        }
      }
    }
    ```

    _Hinweis: Dies ist eine Beispielkonfiguration. Bitte beziehe dich auf die spezifischen Beispiele für deinen MCP-Client (wie Cursor, VS Code usw.), die weiter oben in dieser README beschrieben sind, um die Struktur anzupassen (z.B. `mcpServers` vs `servers`). Stelle außerdem sicher, dass der Bildname in `args` mit dem beim `docker build`-Befehl verwendeten Tag übereinstimmt._

### Verfügbare Tools

- `resolve-library-id`: Löst einen allgemeinen Bibliotheksnamen in eine Codex7-kompatible Bibliotheks-ID auf.
  - `libraryName` (erforderlich)
- `get-library-docs`: Ruft die Dokumentation für eine Bibliothek mit einer Codex7-kompatiblen Bibliotheks-ID ab.
  - `codex7CompatibleLibraryID` (erforderlich)
  - `topic` (optional): Fokussiert die Dokumentation auf ein bestimmtes Thema (z.B. "routing", "hooks")
  - `tokens` (optional, Standard 10000): Maximale Anzahl von zurückzugebenden Tokens. Werte unter 10000 werden automatisch auf 10000 erhöht.

## Entwicklung

Klone das Projekt und installiere die Abhängigkeiten:

```bash
bun i
```

Bauen:

```bash
bun run build
```

### Lokales Konfigurationsbeispiel

```json
{
  "mcpServers": {
    "codex7": {
      "command": "npx",
      "args": ["tsx", "/pfad/zum/ordner/codex7-mcp/src/index.ts"]
    }
  }
}
```

### Testen mit MCP Inspector

```bash
npx -y @modelcontextprotocol/inspector npx @upstash/codex7-mcp@latest
```

## Fehlerbehebung

### ERR_MODULE_NOT_FOUND

Wenn du diesen Fehler siehst, versuche `bunx` anstelle von `npx` zu verwenden.

```json
{
  "mcpServers": {
    "codex7": {
      "command": "bunx",
      "args": ["-y", "@upstash/codex7-mcp@latest"]
    }
  }
}
```

Dies löst häufig Probleme bei der Modulauflösung, besonders in Umgebungen, in denen `npx` Pakete nicht ordnungsgemäß installiert oder auflöst.

### ESM-Auflösungsprobleme

Wenn du einen Fehler wie `Error: Cannot find module 'uriTemplate.js'` bekommst, versuche mit dem Flag `--experimental-vm-modules` auszuführen:

```json
{
  "mcpServers": {
    "codex7": {
      "command": "npx",
      "args": ["-y", "--node-options=--experimental-vm-modules", "@upstash/codex7-mcp@1.0.6"]
    }
  }
}
```

### MCP-Client-Fehler

1. Versuche, `@latest` aus dem Paketnamen zu entfernen.

2. Versuche, `bunx` als Alternative zu verwenden.

3. Versuche, `deno` als Alternative zu verwenden.

4. Stelle sicher, dass du Node v18 oder höher verwendest, um native Fetch-Unterstützung mit `npx` zu haben.

## Haftungsausschluss

Codex7-Projekte werden von der Community beigetragen, und obwohl wir uns bemühen, eine hohe Qualität aufrechtzuerhalten, können wir die Genauigkeit, Vollständigkeit oder Sicherheit aller Bibliotheksdokumentationen nicht garantieren. Die in Codex7 aufgeführten Projekte werden von ihren jeweiligen Eigentümern entwickelt und gepflegt, nicht von Codex7. Wenn du auf verdächtige, unangemessene oder potenziell schädliche Inhalte stößt, verwende bitte die Schaltfläche "Melden" auf der Projektseite, um uns sofort zu benachrichtigen. Wir nehmen alle Berichte ernst und werden gemeldete Inhalte umgehend überprüfen, um die Integrität und Sicherheit unserer Plattform zu gewährleisten. Durch die Nutzung von Codex7 erkennst du an, dass du dies nach eigenem Ermessen und auf eigenes Risiko tust.

## Codex7 in den Medien

- [Better Stack: "Free Tool Makes Cursor 10x Smarter"](https://youtu.be/52FC3qObp9E)
- [Cole Medin: "This is Hands Down the BEST MCP Server for AI Coding Assistants"](https://www.youtube.com/watch?v=G7gK8H6u7Rs)
- [Income stream surfers: "Codex7 + SequentialThinking MCPs: Is This AGI?"](https://www.youtube.com/watch?v=-ggvzyLpK6o)
- [Julian Goldie SEO: "Codex7: New MCP AI Agent Update"](https://www.youtube.com/watch?v=CTZm6fBYisc)
- [JeredBlu: "Context 7 MCP: Get Documentation Instantly + VS Code Setup"](https://www.youtube.com/watch?v=-ls0D-rtET4)
- [Income stream surfers: "Codex7: The New MCP Server That Will CHANGE AI Coding"](https://www.youtube.com/watch?v=PS-2Azb-C3M)

## Verlauf der Sterne

[![Stern-Historien-Diagramm](https://api.star-history.com/svg?repos=upstash/codex7&type=Date)](https://www.star-history.com/#upstash/codex7&Date)

## Lizenz

MIT
