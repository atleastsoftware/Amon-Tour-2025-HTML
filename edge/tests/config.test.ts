import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCTION_REPOSITORY, validateProductionConfiguration } from "../src/config.js";

const valid = {
  NODE_ENV: "production",
  MCP_AUTH_TOKEN: "mcp-test",
  GITHUB_TOKEN: "github-test",
  GITHUB_REPO: PRODUCTION_REPOSITORY,
  GITHUB_BRANCH: "main",
} as NodeJS.ProcessEnv;

test("la production refuse les secrets GitHub/MCP manquants", () => {
  assert.throws(() => validateProductionConfiguration({ NODE_ENV: "production" }), /MCP_AUTH_TOKEN.*GITHUB_TOKEN.*GITHUB_REPO/);
});

test("la production verrouille le dépôt HTML et main", () => {
  assert.throws(() => validateProductionConfiguration({ ...valid, GITHUB_REPO: "atleastsoftware/Amon-Tour-2025" }), /Amon-Tour-2025-HTML/);
  assert.throws(() => validateProductionConfiguration({ ...valid, GITHUB_BRANCH: "preview" }), /main/);
  assert.doesNotThrow(() => validateProductionConfiguration(valid));
});