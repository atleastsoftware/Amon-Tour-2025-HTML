import test from "node:test";
import assert from "node:assert/strict";
import { explainGitHubError, GitHubRepo } from "../src/repo/github.js";

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

test("les erreurs GitHub du CMS expliquent les actions correctives sans exposer le jeton", () => {
  const token = "secret-ne-doit-pas-apparaitre";
  for (const [status, expected] of [
    [401, /GITHUB_TOKEN est rejeté.*HTTP 401/],
    [403, /Permissions GitHub insuffisantes.*HTTP 403/],
    [404, /Dépôt GitHub inaccessible.*HTTP 404/],
  ] as const) {
    const message = explainGitHubError({ status, message: `failure ${token}` }, "le test").message;
    assert.match(message, expected);
    assert.doesNotMatch(message, new RegExp(token));
  }
});