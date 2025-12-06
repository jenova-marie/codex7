# Codex7 MCP - توثيق أكواد محدث لأي أمر برمجي

[![Website](https://img.shields.io/badge/Website-codex7.com-blue)](https://codex7.com) [![smithery badge](https://smithery.ai/badge/@upstash/codex7-mcp)](https://smithery.ai/server/@upstash/codex7-mcp) [<img alt="Install in VS Code (npx)" src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Codex7%20MCP&color=0098FF">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22codex7%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40upstash%2Fcodex7-mcp%40latest%22%5D%7D)

## ❌ بدون Codex7

تعتمد النماذج اللغوية الكبيرة على معلومات قديمة أو عامة حول المكتبات التي تستخدمها. مما يؤدي إلى:

- ❌ أمثلة أكواد قديمة مبنية على بيانات تدريب مضى عليها وقت طويل
- ❌ واجهات برمجة تطبيقات وهمية غير موجودة
- ❌ إجابات عامة لنسخ قديمة من الحزم

## ✅ مع Codex7

يستخرج Codex7 MCP التوثيق والأمثلة البرمجية المحدثة مباشرة من المصدر — ويضعها في طلبك للنموذج.

أضف `use codex7` إلى طلبك في Cursor:

```txt
أنشئ مشروع Next.js بسيط باستخدام app router. use codex7
```

```txt
أنشئ سكربت لحذف الصفوف التي تكون فيها المدينة فارغة "" باستخدام بيانات اعتماد PostgreSQL. use codex7
```

يقوم Codex7 بجلب الأمثلة المحدثة والتوثيق المناسب مباشرة إلى السياق.

- 1️⃣ اكتب طلبك بشكل طبيعي
- 2️⃣ أخبر النموذج بـ `use codex7`
- 3️⃣ احصل على أكواد تعمل مباشرة

لا حاجة للتنقل بين التبويبات، لا واجهات برمجة تطبيقات وهمية، لا أكواد قديمة.

## 🛠️ البدء

### المتطلبات

- Node.js إصدار 18.0.0 أو أعلى
- Cursor، Windsurf، Claude Desktop أو أي عميل MCP آخر

### التثبيت عبر Smithery

لتثبيت Codex7 MCP Server تلقائيًا لـ Claude Desktop:

```bash
npx -y @smithery/cli install @upstash/codex7-mcp --client claude
```

### التثبيت في Cursor

اذهب إلى: `Settings` -> `Cursor Settings` -> `MCP` -> `Add new global MCP server`

أو أضف هذا إلى ملف `~/.cursor/mcp.json`:

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

### التثبيت باستخدام Bun

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

### التثبيت باستخدام Deno

```json
{
  "mcpServers": {
    "codex7": {
      "command": "deno",
      "args": ["run", "--allow-env", "--allow-net", "npm:@upstash/codex7-mcp"]
    }
  }
}
```

### التثبيت في Windsurf

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

### التثبيت في VS Code

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

### التثبيت في Zed

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

### التثبيت في Claude Code

```sh
claude mcp add codex7 -- npx -y @upstash/codex7-mcp@latest
```

### التثبيت في Claude Desktop

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

### التثبيت في BoltAI

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

### التثبيت في Copilot Coding Agent

أضف التكوين التالي إلى قسم `mcp` في ملف إعدادات Copilot Coding Agent الخاص بك Repository->Settings->Copilot->Coding agent->MCP configuration:

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

لمزيد من المعلومات، راجع [التوثيق الرسمي على GitHub](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/agents/copilot-coding-agent/extending-copilot-coding-agent-with-mcp).

### باستخدام Docker

**Dockerfile:**

```Dockerfile
FROM node:18-alpine
WORKDIR /app
RUN npm install -g @upstash/codex7-mcp@latest
CMD ["codex7-mcp"]
```

**بناء الصورة:**

```bash
docker build -t codex7-mcp .
```

**التهيئة داخل العميل:**

```json
{
  "mcpServers": {
    "Codex7": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "codex7-mcp"],
      "transportType": "stdio"
    }
  }
}
```

### التثبيت في Windows

```json
{
  "mcpServers": {
    "github.com/upstash/codex7-mcp": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@upstash/codex7-mcp@latest"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### المتغيرات البيئية

```json
{
  "mcpServers": {
    "codex7": {
      "command": "npx",
      "args": ["-y", "@upstash/codex7-mcp@latest"],
      "env": {
        "DEFAULT_MINIMUM_TOKENS": "10000"
      }
    }
  }
}
```

### الأدوات المتوفرة

- `resolve-library-id`: يحول اسم مكتبة عام إلى معرف متوافق مع Codex7.
- `get-library-docs`: يستخرج التوثيق حسب المعرف.
  - `codex7CompatibleLibraryID`: مطلوب
  - `topic`: موضوع معين مثل "routing"
  - `tokens`: الحد الأعلى لعدد الرموز

## التطوير

```bash
bun i
bun run build
```

**التهيئة المحلية:**

```json
{
  "mcpServers": {
    "codex7": {
      "command": "npx",
      "args": ["tsx", "/path/to/folder/codex7-mcp/src/index.ts"]
    }
  }
}
```

**الاختبار باستخدام MCP Inspector:**

```bash
npx -y @modelcontextprotocol/inspector npx @upstash/codex7-mcp@latest
```

## استكشاف الأخطاء

### ERR_MODULE_NOT_FOUND

استخدم `bunx` بدلاً من `npx`.

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

### مشاكل في ESM

جرّب إضافة:

```json
{
  "command": "npx",
  "args": ["-y", "--node-options=--experimental-vm-modules", "@upstash/codex7-mcp@1.0.6"]
}
```

### أخطاء عميل MCP

1. أزل `@latest`
2. جرّب `bunx`
3. جرّب `deno`
4. تأكد أنك تستخدم Node v18 أو أحدث

## إخلاء مسؤولية

المشاريع المدرجة في Codex7 مساهم بها من المجتمع، ولا يمكن ضمان دقتها أو أمانها بشكل كامل. الرجاء الإبلاغ عن أي محتوى مريب باستخدام زر "الإبلاغ".

## Codex7 في الإعلام

- [Better Stack: "أداة مجانية تجعل Cursor أذكى 10x"](https://youtu.be/52FC3qObp9E)
- [Cole Medin: "أفضل MCP Server لمساعدين الذكاء الاصطناعي البرمجيين"](https://www.youtube.com/watch?v=G7gK8H6u7Rs)
- [Codex7 + SequentialThinking: هل هذا AGI؟](https://www.youtube.com/watch?v=-ggvzyLpK6o)
- [تحديث جديد من Codex7 MCP](https://www.youtube.com/watch?v=CTZm6fBYisc)
- [إعداد Codex7 في VS Code](https://www.youtube.com/watch?v=-ls0D-rtET4)
- [Codex7: MCP جديد سيغير البرمجة](https://www.youtube.com/watch?v=PS-2Azb-C3M)
- [Cline & RooCode + Codex7: قوة مضاعفة](https://www.youtube.com/watch?v=qZfENAPMnyo)
- [أفضل 5 MCP Servers لتجربة برمجة ساحرة](https://www.youtube.com/watch?v=LqTQi8qexJM)

## سجل النجوم

[![Star History Chart](https://api.star-history.com/svg?repos=upstash/codex7&type=Date)](https://www.star-history.com/#upstash/codex7&Date)

## الترخيص

MIT
