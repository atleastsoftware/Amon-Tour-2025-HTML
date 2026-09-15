import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ContentRepo } from "./types.js";

const exec = promisify(execFile);

export class LocalRepo implements ContentRepo {
  constructor(private rootDir: string) {}

  private async git(args: string[]) {
    return (await exec("git", ["-C", this.rootDir, ...args])).stdout.trim();
  }

  async readTree() {
    const files = new Map<string, string>();
    const walk = async (rel: string) => {
      const dir = path.join(this.rootDir, rel);
      try {
        for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
          const child = path.posix.join(rel, entry.name);
          if (entry.isDirectory()) await walk(child);
          else if (rel === "content" || rel.startsWith("content/") || child === "media/manifest.json") {
            files.set(child, await fs.readFile(path.join(this.rootDir, child), "utf8"));
          }
        }
      } catch (error: any) {
        if (error.code !== "ENOENT") throw error;
      }
    };
    await walk("content");
    try { files.set("media/manifest.json", await fs.readFile(path.join(this.rootDir, "media/manifest.json"), "utf8")); } catch {}
    let sha = "local";
    try { sha = await this.git(["rev-parse", "HEAD"]); } catch {}
    return { sha, files };
  }

  async commit(changes: Map<string, string | null>, opts: { message: string; branch?: string }) {
    const paths: string[] = [];
    for (const [rel, value] of Array.from(changes)) {
      if (!rel.startsWith("content/") && rel !== "media/manifest.json") throw new Error(`Chemin non autorisé: ${rel}`);
      const file = path.join(this.rootDir, rel);
      paths.push(rel);
      if (value === null) await fs.rm(file, { force: true });
      else {
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, value);
      }
    }
    let sha = `local-${Date.now()}`;
    if (process.env.MCP_LOCAL_GIT_COMMIT === "1" && paths.length) {
      await this.git(["add", "-A", "--", ...paths]);
      await this.git(["commit", "-m", opts.message]);
      sha = await this.git(["rev-parse", "HEAD"]);
    }
    return { sha, url: `file://${this.rootDir}`, branch: opts.branch ?? "local" };
  }

  async uploadBinary(rel: string, base64: string, message: string) {
    if (!rel.startsWith("media/uploads/")) throw new Error("Les médias doivent être placés dans media/uploads/");
    const file = path.join(this.rootDir, rel);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, Buffer.from(base64, "base64"));
    if (process.env.MCP_LOCAL_GIT_COMMIT === "1") {
      await this.git(["add", "--", rel]);
      await this.git(["commit", "-m", message]);
    }
    let sha = "local";
    try { sha = await this.git(["rev-parse", "HEAD"]); } catch {}
    return { sha, url: `file://${file}` };
  }

  async getStatus() {
    let headSha = "local", message = "Local working tree", date = new Date().toISOString(), url = `file://${this.rootDir}`;
    try {
      headSha = await this.git(["rev-parse", "HEAD"]);
      message = await this.git(["log", "-1", "--format=%s"]);
      date = await this.git(["log", "-1", "--format=%cI"]);
    } catch {}
    return { headSha, lastCommit: { message, date, url }, ciRuns: [] };
  }

  async getCommitHistory(limit = 20) {
    try {
      const output = await this.git(["log", `-${limit}`, "--format=%H%x09%s%x09%cI", "--", "content"]);
      return output.split("\n").filter(Boolean).map((line) => {
        const [sha, message, date] = line.split("\t");
        return { sha, message, date, url: `file://${this.rootDir}` };
      });
    } catch {
      return [];
    }
  }
}