import express from "express";
import { createMcpRouter } from "./http.js";
import { createMcpServer } from "./server.js";
import { LocalRepo } from "./repo/local.js";
import { GitHubRepo } from "./repo/github.js";

const token = process.env.MCP_AUTH_TOKEN;
if (!token) {
  console.error("MCP_AUTH_TOKEN est requis. Définissez un jeton long et aléatoire avant de démarrer.");
  process.exit(1);
}
const repo = process.env.GITHUB_TOKEN ? new GitHubRepo() : new LocalRepo(process.cwd());
const app = express();
app.use("/mcp", createMcpRouter({
  token,
  createServer: () => createMcpServer({
    repo,
    siteBaseUrl: process.env.SITE_BASE_URL ?? "https://amon-tour.com",
    edgeBaseUrl: process.env.EDGE_BASE_URL,
    tourNinja: { proxyUrl: process.env.TOUR_NINJA_PROXY_URL ?? `${process.env.SITE_BASE_URL ?? "https://amon-tour.com"}/api/proxy/tours` },
  }),
}));
const port = Number(process.env.PORT ?? 5100);
app.listen(port, () => console.log(`CMS MCP Amon Tour prêt sur http://localhost:${port}/mcp`));