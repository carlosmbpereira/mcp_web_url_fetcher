import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as cheerio from "cheerio";

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
        name: "fetch_web_content",
        description: "Accesses a URL and returns the text-based content.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "The URL to scrape" },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "fetch_web_content") {
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
      const $ = cheerio.load(html);
      
      // Cleanup DOM to minimize tokens
      $("script, style, nav, footer, header, svg").remove();
      
      const cleanText = $("body")
        .text()
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 15000); // Increased limit slightly

      return {
        content: [{ type: "text", text: cleanText }],
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