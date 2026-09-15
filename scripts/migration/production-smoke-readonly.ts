import { validateProductionConfiguration } from "../../edge/src/config.js";
import { GitHubRepo } from "../../mcp/src/repo/github.js";

const requiredSecrets = ["MCP_AUTH_TOKEN", "GITHUB_TOKEN", "DATABASE_URL"] as const;
const optionalSecrets = ["SENDGRID_API_KEY", "TOUR_NINJA_SYNC_TOKEN", "TOUR_NINJA_API_KEY"] as const;

function presence(name: string) {
  return process.env[name] ? "present" : "missing";
}

for (const name of requiredSecrets) console.log(`${name}=${presence(name)}`);
for (const name of optionalSecrets) console.log(`${name}=${presence(name)}`);
console.log(`GITHUB_REPO=${process.env.GITHUB_REPO === "atleastsoftware/Amon-Tour-2025-HTML" ? "expected" : "missing_or_unexpected"}`);
console.log(`GITHUB_BRANCH=${(process.env.GITHUB_BRANCH || "main") === "main" ? "expected" : "unexpected"}`);

const missing = requiredSecrets.filter((name) => !process.env[name]);
if (!process.env.GITHUB_REPO) missing.push("GITHUB_REPO" as (typeof requiredSecrets)[number]);
if (missing.length) {
  console.error(`READINESS=blocked_missing_configuration count=${missing.length}`);
  process.exitCode = 2;
} else {
  validateProductionConfiguration({ ...process.env, NODE_ENV: "production" });
  const status = await new GitHubRepo().getStatus();
  console.log(`GITHUB_READ=ok head=${status.headSha}`);
  console.log(`GITHUB_ACTIONS_READ=ok runs=${status.ciRuns.length}`);
  console.log("READINESS=configuration_valid");
}