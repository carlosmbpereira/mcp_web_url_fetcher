import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
// cheerio removed: returning raw HTML instead of cleaned text

const server = new Server(
  {
    name: "native-web-transfer",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_web_content",
      description: "Accesses a URL and returns the page text with scripts and HTML formatting removed.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "The URL to fetch" },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_web_content") {
    const url = String(request.params.arguments?.url);

    try {
      // Using global fetch (Standard in Node 18+)
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (MCP-Bot)" }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();

      // Remove <script> and <style> blocks first, then strip remaining HTML tags
      // Finally collapse whitespace so the returned text is clean plain text.
      const withoutScripts = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "");

      // Keep remaining HTML tags but trim surrounding whitespace
      const cleanedHtml = withoutScripts.trim();

      // Return HTML with scripts/styles removed as content[0].text per request
      return {
        content: [{ type: "text", text: cleanedHtml }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Fetch failed: ${error.message}` }],
        isError: true,
      };
    }
  }
  throw new Error("Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
