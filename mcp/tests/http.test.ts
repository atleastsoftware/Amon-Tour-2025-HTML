import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import { createMcpRouter } from "../src/http.js";
import { createMcpServer } from "../src/server.js";
import { LocalRepo } from "../src/repo/local.js";

async function start(allowPathToken = false) {
  const app = express();
  app.use("/mcp", createMcpRouter({ token: "test", allowPathToken, createServer: () => createMcpServer({
    repo: new LocalRepo(process.cwd()), tourNinja: { proxyUrl: "http://invalid.local" },
  }) }));
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return { server, url: `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}/mcp` };
}

test("HTTP refuse un mauvais jeton et expose les outils", async (t) => {
  const fixture = await start(); t.after(() => fixture.server.close());
  const bad = await fetch(fixture.url, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  assert.equal(bad.status, 401);
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream", authorization: "Bearer test" };
  const init = await fetch(fixture.url, { method: "POST", headers, body: JSON.stringify({
    jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1" } },
  }) });
  assert.equal(init.status, 200);
  const listed = await fetch(fixture.url, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }) });
  assert.equal(listed.status, 200);
  assert.match(await listed.text(), /list_pages/);
});

test("le jeton dans l'URL est désactivé par défaut", async (t) => {
  const fixture = await start(); t.after(() => fixture.server.close());
  const response = await fetch(`${fixture.url}/t/test`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(response.status, 401);
});

test("le jeton dans l'URL fonctionne uniquement après opt-in", async (t) => {
  const fixture = await start(true); t.after(() => fixture.server.close());
  const response = await fetch(`${fixture.url}/t/test`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "test", version: "1" } },
    }),
  });
  assert.equal(response.status, 200);
});

test("une suppression sans confirmation explicite est refusée", async (t) => {
  const fixture = await start(); t.after(() => fixture.server.close());
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream", authorization: "Bearer test" };
  const response = await fetch(fixture.url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: "delete_page", arguments: { page: "tours" } },
    }),
  });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /confirm|required|invalid/i);
});