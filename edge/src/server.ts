import path from "node:path";
import { fileURLToPath } from "node:url";
import type express from "express";
import { createEdgeApp } from "./app.js";
import { GitHubContentProvider, LocalContentProvider } from "./contentProvider.js";
import { buildSite } from "../../site/src/build.js";
import { createMcpRouter } from "../../mcp/src/http.js";
import { createMcpServer } from "../../mcp/src/server.js";
import { LocalRepo } from "../../mcp/src/repo/local.js";
import { GitHubRepo } from "../../mcp/src/repo/github.js";

const here = path.dirname(fileURLToPath(import.meta.url));
// En production (edge/dist/server.js bundlé) comme en dev (edge/src/server.ts), la racine du dépôt est deux niveaux au-dessus.
// REPO_ROOT permet de pointer vers une copie (tests de production).
const repoRoot = process.env.REPO_ROOT ? path.resolve(process.env.REPO_ROOT) : path.resolve(here, "../..");
const distDir = path.join(repoRoot, "site/dist");
async function main() {
  const provider = process.env.GITHUB_TOKEN && process.env.GITHUB_REPO
    ? new GitHubContentProvider({
        repoRoot, token: process.env.GITHUB_TOKEN, repository: process.env.GITHUB_REPO,
        branch: process.env.GITHUB_BRANCH || "main",
      })
    : new LocalContentProvider(repoRoot);
  // Serveur MCP (CMS) monté sur /mcp. En production il écrit dans GitHub ; sans GITHUB_TOKEN il
  // écrit dans le dépôt local et déclenche une reconstruction immédiate (mode développement).
  let mcpRouter: express.Router | undefined;
  let onLocalCommit: (() => Promise<void>) | undefined;
  if (process.env.MCP_AUTH_TOKEN) {
    try {
      const useGitHub = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
      const baseRepo = useGitHub ? new GitHubRepo() : new LocalRepo(repoRoot);
      const repo = useGitHub ? baseRepo : new Proxy(baseRepo, {
        get(target, prop, receiver) {
          const value = Reflect.get(target, prop, receiver);
          if (prop !== "commit" && prop !== "uploadBinary") return typeof value === "function" ? value.bind(target) : value;
          return async (...args: any[]) => { const out = await value.apply(target, args); await onLocalCommit?.(); return out; };
        },
      });
      const siteBaseUrl = process.env.SITE_BASE_URL ?? "https://amon-tour.com";
      const edgeBaseUrl = process.env.EDGE_BASE_URL ?? `http://127.0.0.1:${Number(process.env.PORT) || 5000}`;
      mcpRouter = createMcpRouter({
        token: process.env.MCP_AUTH_TOKEN,
        createServer: () => createMcpServer({ repo, siteBaseUrl, edgeBaseUrl, tourNinja: { proxyUrl: `${edgeBaseUrl}/api/proxy/tours` } }),
      });
      console.log(`MCP CMS monté sur /mcp (dépôt ${useGitHub ? process.env.GITHUB_REPO : "local"})`);
    } catch (error: any) {
      console.warn("Routeur MCP indisponible :", error?.message ?? error);
    }
  } else {
    console.warn("MCP_AUTH_TOKEN absent : le CMS MCP n'est pas exposé.");
  }
  const syncAndBuild = async (force = false) => {
    const sync = await provider.sync();
    if (!sync.changed && !force) return;
    await buildSite(provider.getContent(), { outDir: distDir });
  };
  onLocalCommit = () => syncAndBuild(true);
  await syncAndBuild(true);
  if (provider instanceof GitHubContentProvider) {
    const interval = Math.max(1, Number(process.env.CONTENT_SYNC_INTERVAL_MIN) || 10) * 60_000;
    setInterval(() => syncAndBuild().catch((error) => console.error("Synchronisation périodique impossible :", error)), interval).unref();
  }
  const port = Number(process.env.PORT) || 5000;
  createEdgeApp({ distDir, repoRoot, contentProvider: provider, mcpRouter }).listen(port, "0.0.0.0", () => {
    console.log(`Edge Amon Tour en écoute sur 0.0.0.0:${port}`);
  });
}
main().catch((error) => {
  console.error("Démarrage edge impossible :", error);
  process.exitCode = 1;
});