---
name: Testing the CMS MCP locally
description: Quirks when exercising the MCP server against a throwaway copy of content/ (before production cutover)
---
Run the edge server on a copy (`REPO_ROOT=<copie> PORT=<port> MCP_AUTH_TOKEN=… MCP_LOCAL_GIT_COMMIT=1`) with a git identity configured in that copy; otherwise every write fails at `git commit` ("Author identity unknown"), and a no-op write fails with "nothing to commit".

**Why:** Local mode commits with the copy's git config; GitHub mode has neither constraint. `node_modules` may also lack `@octokit/rest` / MCP SDK after a fresh task container — run `npm install` first. A bare `.mjs` client under /tmp cannot resolve the SDK; place it under the workspace.

**How to apply:** Use `scripts/migration/mcp-pack-check.mjs` (self-restoring for menu/footer/theme/annonces/static/translations; leaves a blog category+tag, a test media and an inactive image override). Production MCP at amon-tour.com/mcp only exists after the site cutover; before that `/mcp/health` returns the old SPA.
