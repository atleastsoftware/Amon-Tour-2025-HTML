/**
 * Test de production : construit le bundle réel (`npm run edge:build`), le démarre avec `npm run edge:start`
   * sur une copie temporaire du dépôt, puis prouve : commit MCP → reconstruction → HTML servi modifié.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function freePort(): Promise<number> {
  return new Promise((resolve) => { const s = net.createServer(); s.listen(0, () => { const p = (s.address() as net.AddressInfo).port; s.close(() => resolve(p)); }); });
}

test("bundle de production : commit MCP → rebuild → HTML mis à jour", { timeout: 180_000 }, async () => {
  execFileSync("npm", ["run", "-s", "edge:build"], { cwd: repoRoot, stdio: "inherit" });
  assert.ok(fs.existsSync(path.join(repoRoot, "edge/dist/server.js")));

  // Copie temporaire du dépôt (contenu + médias) pour ne jamais toucher au vrai content/.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "amon-edge-prod-"));
  for (const dir of ["content", "media"]) fs.cpSync(path.join(repoRoot, dir), path.join(tmp, dir), { recursive: true });
  execFileSync("git", ["init", "-q", "-b", "main"], { cwd: tmp });
  execFileSync("git", ["-c", "user.email=test@amon-tour.com", "-c", "user.name=test", "add", "-A"], { cwd: tmp });
  execFileSync("git", ["-c", "user.email=test@amon-tour.com", "-c", "user.name=test", "commit", "-qm", "seed"], { cwd: tmp });

  const port = await freePort();
  const token = "prod-test-token";
  const env = { ...process.env, PORT: String(port), REPO_ROOT: tmp, MCP_AUTH_TOKEN: token, MCP_ALLOW_PATH_TOKEN: "true", NODE_ENV: "test", MCP_LOCAL_GIT_COMMIT: "1", GIT_AUTHOR_NAME: "test", GIT_AUTHOR_EMAIL: "test@amon-tour.com", GIT_COMMITTER_NAME: "test", GIT_COMMITTER_EMAIL: "test@amon-tour.com" };
  // Aucun appel DB dans ce test : adresse fictive, jamais la base réelle héritée.
  (env as any).DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
  delete (env as any).NEON_DATABASE_URL; delete (env as any).GITHUB_TOKEN; delete (env as any).GITHUB_REPO;
  // Même binaire que edge:start, sans processus npm intermédiaire qui laisse un enfant orphelin.
  const child = spawn(process.execPath, ["edge/dist/server.js"], { cwd: repoRoot, env, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  child.stdout.on("data", (d) => { logs += d; }); child.stderr.on("data", (d) => { logs += d; });
  try {
    const base = `http://127.0.0.1:${port}`;
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      try { if ((await fetch(`${base}/mcp/health`)).ok) break; } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.ok(logs.includes("MCP CMS monté"), `le MCP doit être monté dans le bundle de production\n${logs}`);
    const before = await (await fetch(`${base}/tours`)).text();
    assert.match(before, /<title>Private Tours in Krabi \| Amon Tour Thailand<\/title>/);
    assert.equal((await fetch(`${base}/tour/abc123`)).status, 200, "/tour/:token doit être servi");

    const client = new Client({ name: "prod-test", version: "1.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp/t/${token}`)));
    const res: any = await client.callTool({ name: "update_seo", arguments: { page: "tours", lang: "en", seo: { title: "Titre prod test" }, commitMessage: "cms(seo): prod test" } });
    assert.ok(!res.isError, JSON.stringify(res.content));
    await client.close();

    const after = await (await fetch(`${base}/tours`)).text();
    assert.match(after, /<title>Titre prod test<\/title>/, "le HTML servi doit refléter le commit");
    const log = execFileSync("git", ["log", "--oneline"], { cwd: tmp }).toString();
    assert.match(log, /cms\(seo\): prod test/);
    assert.ok(!fs.existsSync(path.join(repoRoot, "site/dist/.prod-test")), "le vrai dépôt ne doit pas être modifié");
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => child.kill("SIGKILL"), 3000);
        child.once("exit", () => { clearTimeout(timer); resolve(); });
        child.kill("SIGTERM");
      });
    }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
