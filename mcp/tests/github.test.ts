import test from "node:test";
import assert from "node:assert/strict";
import { GitHubRepo } from "../src/repo/github.js";

test("GitHubRepo verrouille dépôt et branche en production", () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    assert.throws(
      () => new GitHubRepo({ token: "test", repo: "atleastsoftware/Amon-Tour-2025", branch: "main" }),
      /Amon-Tour-2025-HTML/,
    );
    assert.throws(
      () => new GitHubRepo({ token: "test", repo: "atleastsoftware/Amon-Tour-2025-HTML", branch: "preview" }),
      /main/,
    );
    assert.doesNotThrow(
      () => new GitHubRepo({ token: "test", repo: "atleastsoftware/Amon-Tour-2025-HTML", branch: "main" }),
    );
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});