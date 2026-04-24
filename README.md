# Web Transfer MCP Server

A simple and efficient Model Context Protocol (MCP) server that allows AI models to fetch and "read" content from any URL. It uses Node.js native `fetch` for networking and `cheerio` for intelligent HTML parsing to minimize token usage.

## 🚀 Features
- **Native Fetch:** No external HTTP libraries like Axios (requires Node.js 18+).
- **Smart Parsing:** Automatically strips scripts, styles, and navigation elements to deliver clean, relevant text.
- **Token Efficient:** Capped output to prevent context window overflow.
- **Easy Integration:** Fully compatible with Claude Desktop and other MCP clients.

## 🛠️ Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** Typically bundled with Node.js

## 📦 Installation

1. **Clone or create the project directory:**
   ```bash
   mkdir web-mcp-server
   cd web-mcp-server
   ```

2. **Initialize and install dependencies:**
   ```bash
   npm init -y
   npm install @modelcontextprotocol/sdk cheerio
   npm install -D typescript @types/node
   ```

3. **Initialize TypeScript:**
   ```bash
   npx tsc --init --target es2022 --module esnext --moduleResolution node --outDir dist
   ```

4. **Add the Source:**
   Create `index.ts` and paste your server code into it.

5. **Build the project:**
   ```bash
   npx tsc
   ```

## ⚙️ Configuration
To use this with Claude Desktop, add the following to your configuration file:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "web-transfer": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/web-mcp-server/dist/index.js"]
    }
  }
}
```
> **Note:** Replace `/ABSOLUTE/PATH/TO/` with the actual absolute path on your machine.

## 🛠️ Usage
Once connected, the model will have access to the `fetch_web_content` tool. You can ask:

- "Can you summarize the content of https://example.com?"
- "Read this article and tell me the main points: https://techcrunch.com/..."

## 🏗️ Technical Details
- **Protocol:** MCP (Model Context Protocol)
- **Transport:** Stdio
- **Parser:** Cheerio (Strips `<script>`, `<style>`, `<nav>`, `<footer>`, `<header>`, and `<svg>`)
- **Limit:** Output is currently capped at 15,000 characters to ensure stability within LLM context windows.

## 📄 License
MIT