export const PRODUCTION_REPOSITORY = "atleastsoftware/Amon-Tour-2025-HTML";

export function validateProductionConfiguration(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV !== "production") return;
  const required = ["MCP_AUTH_TOKEN", "GITHUB_TOKEN", "GITHUB_REPO"] as const;
  const missing = required.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Configuration de production incomplète : ${missing.join(", ")} requis`);
  if (env.GITHUB_REPO !== PRODUCTION_REPOSITORY) {
    throw new Error(`GITHUB_REPO doit cibler exclusivement ${PRODUCTION_REPOSITORY}`);
  }
  if ((env.GITHUB_BRANCH || "main") !== "main") {
    throw new Error("GITHUB_BRANCH doit être main en production");
  }
}