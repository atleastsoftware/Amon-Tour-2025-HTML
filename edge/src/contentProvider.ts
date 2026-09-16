import fs from "node:fs";
import path from "node:path";
import { Octokit } from "@octokit/rest";
import { fsSource, loadContent, type SiteContent } from "../../site/src/content.js";
import { explainGitHubError } from "../../mcp/src/repo/github.js";

export interface ContentVersion { sha: string; source: string; syncedAt: string; syncError?: string }
export interface ContentProvider {
  getContent(): SiteContent;
  getVersion(): ContentVersion;
  sync(): Promise<{ changed: boolean; sha: string }>;
}

export class LocalContentProvider implements ContentProvider {
  private content: SiteContent;
  private version: ContentVersion;
  constructor(private repoRoot: string) {
    this.content = loadContent(fsSource(path.join(repoRoot, "content")));
    this.version = { sha: "local", source: "local", syncedAt: new Date().toISOString() };
  }
  getContent() { return this.content; }
  getVersion() { return this.version; }
  async sync() {
    this.content = loadContent(fsSource(path.join(this.repoRoot, "content")));
    this.version.syncedAt = new Date().toISOString();
    return { changed: false, sha: this.version.sha };
  }
}

export class GitHubContentProvider implements ContentProvider {
  private content: SiteContent;
  private version: ContentVersion;
  private blobs = new Map<string, string>();
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private branch: string;
  private contentDir: string;
  private mediaDir: string;
  constructor(opts: { repoRoot: string; token: string; repository: string; branch?: string; cacheDir?: string }) {
    [this.owner, this.repo] = opts.repository.split("/");
    if (!this.owner || !this.repo) throw new Error("GITHUB_REPO doit être au format owner/name");
    this.branch = opts.branch || "main";
    this.contentDir = path.join(opts.cacheDir || path.join(opts.repoRoot, "edge/.cache"), "content");
    this.mediaDir = path.join(opts.repoRoot, "media");
    this.octokit = new Octokit({ auth: opts.token });
    const local = fs.existsSync(path.join(this.contentDir, "site.json"))
      ? this.contentDir : path.join(opts.repoRoot, "content");
    this.content = loadContent(fsSource(local));
    this.version = { sha: "cache", source: `github:${opts.repository}@${this.branch}`, syncedAt: new Date(0).toISOString() };
  }
  getContent() { return this.content; }
  getVersion() { return this.version; }
  async sync() {
    try {
      const ref = await this.octokit.git.getRef({ owner: this.owner, repo: this.repo, ref: `heads/${this.branch}` });
      const sha = ref.data.object.sha;
      if (sha === this.version.sha) {
        this.version = { source: this.version.source, sha, syncedAt: new Date().toISOString() };
        return { changed: false, sha };
      }
      const tree = await this.octokit.git.getTree({ owner: this.owner, repo: this.repo, tree_sha: sha, recursive: "true" });
      const files = tree.data.tree.filter((e) => e.type === "blob"
        && (e.path?.startsWith("content/") || e.path?.startsWith("media/")));
      fs.mkdirSync(this.contentDir, { recursive: true });
      for (const entry of files) {
        const isContent = entry.path!.startsWith("content/");
        const rel = entry.path!.slice(isContent ? "content/".length : "media/".length);
        const key = entry.path!;
        const root = isContent ? this.contentDir : this.mediaDir;
        if (this.blobs.get(key) === entry.sha && fs.existsSync(path.join(root, rel))) continue;
        const blob = await this.octokit.git.getBlob({ owner: this.owner, repo: this.repo, file_sha: entry.sha! });
        const bytes = blob.data.encoding === "base64"
          ? Buffer.from(blob.data.content.replace(/\n/g, ""), "base64") : Buffer.from(blob.data.content);
        const dest = path.join(root, rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, bytes);
        this.blobs.set(key, entry.sha!);
      }
      // Supprimer du cache les contenus retirés du dépôt pour éviter les pages fantômes.
      const expectedContent = new Set(files.filter((entry) => entry.path!.startsWith("content/"))
        .map((entry) => entry.path!.slice("content/".length)));
      const removeDeleted = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) removeDeleted(full);
          else {
            const rel = path.relative(this.contentDir, full).split(path.sep).join("/");
            if (!expectedContent.has(rel)) fs.unlinkSync(full);
          }
        }
      };
      removeDeleted(this.contentDir);
      this.content = loadContent(fsSource(this.contentDir));
      this.version = { source: this.version.source, sha, syncedAt: new Date().toISOString() };
      return { changed: true, sha };
    } catch (error) {
      const explained = explainGitHubError(error, "la synchronisation du site");
      this.version = { ...this.version, syncError: explained.message };
      console.error("Échec de synchronisation GitHub, conservation de la version précédente :", explained.message);
      return { changed: false, sha: this.version.sha };
    }
  }
}