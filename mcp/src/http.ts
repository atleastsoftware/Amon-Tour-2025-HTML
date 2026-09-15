import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function createMcpRouter(options: { token: string; allowPathToken?: boolean; createServer: () => McpServer }): express.Router {
  const router = express.Router();
  router.use(express.json({ limit: "7mb" }));
  router.use((_, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, mcp-session-id, mcp-protocol-version");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");
    next();
  });
  router.options("*", (_, res) => res.sendStatus(204));
  router.get("/health", (_, res) => res.json({ ok: true, service: "amon-tour-cms-mcp" }));
  router.get("/.well-known/mcp.json", (_, res) => res.json({ name: "Amon Tour CMS", version: "1.0.0", transport: "streamable-http" }));

  const authorized = (req: express.Request) => {
    const bearer = req.get("authorization");
    return bearer === `Bearer ${options.token}` ||
      (options.allowPathToken === true && req.params.token === options.token);
  };
  const handler = async (req: express.Request, res: express.Response) => {
    if (!authorized(req)) {
      res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null });
      return;
    }
    const server = options.createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => { void transport.close(); void server.close(); });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      if (!res.headersSent) res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: String(error) }, id: null });
    }
  };
  router.all("/", handler);
  router.all("/t/:token", handler);
  return router;
}