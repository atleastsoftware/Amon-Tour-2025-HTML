import { Octokit } from "@octokit/rest";
import type { ContentRepo } from "./types.js";

export class GitHubRepo implements ContentRepo {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private branch: string;
  private blobs = new Map<string, string>();

  constructor(opts: { token?: string; repo?: string; branch?: string } = {}) {
    const token = opts.token ?? process.env.GITHUB_TOKEN;
    const full = opts.repo ?? process.env.GITHUB_REPO;
    if (!token) throw new Error("GITHUB_TOKEN is required");
    if (!full?.includes("/")) throw new Error("GITHUB_REPO must be owner/name");
    [this.owner, this.repo] = full.split("/", 2);
    this.branch = opts.branch ?? process.env.GITHUB_BRANCH ?? "main";
    this.octokit = new Octokit({ auth: token });
  }

  private async head(branch: string) {
    return (await this.octokit.git.getRef({ owner: this.owner, repo: this.repo, ref: `heads/${branch}` })).data.object.sha;
  }

  async readTree(branch = this.branch) {
    const sha = await this.head(branch);
    const commit = await this.octokit.git.getCommit({ owner: this.owner, repo: this.repo, commit_sha: sha });
    const tree = await this.octokit.git.getTree({ owner: this.owner, repo: this.repo, tree_sha: commit.data.tree.sha, recursive: "true" });
    const wanted = tree.data.tree.filter((e) => e.type === "blob" && e.path &&
      (e.path.startsWith("content/") || e.path === "media/manifest.json"));
    const files = new Map<string, string>();
    await Promise.all(wanted.map(async (e) => {
      let text = this.blobs.get(e.sha!);
      if (text === undefined) {
        const blob = await this.octokit.git.getBlob({ owner: this.owner, repo: this.repo, file_sha: e.sha! });
        text = Buffer.from(blob.data.content, blob.data.encoding as BufferEncoding).toString("utf8");
        this.blobs.set(e.sha!, text);
      }
      files.set(e.path!, text);
    }));
    return { sha, files };
  }

  async commit(changes: Map<string, string | null>, opts: { message: string; branch?: string; createPr?: { title: string; body: string }; author?: string }) {
    const branch = opts.branch ?? this.branch;
    if (opts.createPr) {
      const base = await this.head(this.branch);
      await this.octokit.git.createRef({ owner: this.owner, repo: this.repo, ref: `refs/heads/${branch}`, sha: base });
    }
    let result!: { sha: string; url: string };
    for (let attempt = 0; attempt < 2; attempt++) {
      const parent = await this.head(branch);
      const parentCommit = await this.octokit.git.getCommit({ owner: this.owner, repo: this.repo, commit_sha: parent });
      const entries = await Promise.all(Array.from(changes).map(async ([path, value]) => {
        if (value === null) return { path, mode: "100644" as const, type: "blob" as const, sha: null };
        const blob = await this.octokit.git.createBlob({ owner: this.owner, repo: this.repo, content: value, encoding: "utf-8" });
        return { path, mode: "100644" as const, type: "blob" as const, sha: blob.data.sha };
      }));
      const tree = await this.octokit.git.createTree({ owner: this.owner, repo: this.repo, base_tree: parentCommit.data.tree.sha, tree: entries });
      const author = opts.author ? { name: opts.author, email: "mcp@amon-tour.com" } : undefined;
      const commit = await this.octokit.git.createCommit({ owner: this.owner, repo: this.repo, message: opts.message, tree: tree.data.sha, parents: [parent], author });
      try {
        await this.octokit.git.updateRef({ owner: this.owner, repo: this.repo, ref: `heads/${branch}`, sha: commit.data.sha, force: false });
        result = { sha: commit.data.sha, url: commit.data.html_url };
        break;
      } catch (e: any) {
        if (e.status !== 422 || attempt === 1) throw e;
      }
    }
    let prUrl: string | undefined;
    if (opts.createPr) {
      const pr = await this.octokit.pulls.create({ owner: this.owner, repo: this.repo, head: branch, base: this.branch, ...opts.createPr });
      prUrl = pr.data.html_url;
    }
    return { ...result, branch, prUrl };
  }

  async uploadBinary(path: string, base64: string, message: string) {
    const parent = await this.head(this.branch);
    const current = await this.octokit.git.getCommit({ owner: this.owner, repo: this.repo, commit_sha: parent });
    const blob = await this.octokit.git.createBlob({ owner: this.owner, repo: this.repo, content: base64, encoding: "base64" });
    const tree = await this.octokit.git.createTree({ owner: this.owner, repo: this.repo, base_tree: current.data.tree.sha,
      tree: [{ path, mode: "100644", type: "blob", sha: blob.data.sha }] });
    const commit = await this.octokit.git.createCommit({ owner: this.owner, repo: this.repo, message, tree: tree.data.sha, parents: [parent] });
    await this.octokit.git.updateRef({ owner: this.owner, repo: this.repo, ref: `heads/${this.branch}`, sha: commit.data.sha, force: false });
    return { sha: commit.data.sha, url: commit.data.html_url };
  }

  async getStatus() {
    const headSha = await this.head(this.branch);
    const commit = await this.octokit.repos.getCommit({ owner: this.owner, repo: this.repo, ref: headSha });
    const runs = await this.octokit.actions.listWorkflowRunsForRepo({ owner: this.owner, repo: this.repo, branch: this.branch, per_page: 20 });
    return {
      headSha,
      lastCommit: { message: commit.data.commit.message, date: commit.data.commit.committer?.date ?? "", url: commit.data.html_url },
      ciRuns: runs.data.workflow_runs.map((r) => ({ name: r.name ?? "", status: r.status ?? "", conclusion: r.conclusion, url: r.html_url, createdAt: r.created_at })),
    };
  }

  async getCommitHistory(limit = 20) {
    const commits = await this.octokit.repos.listCommits({ owner: this.owner, repo: this.repo, sha: this.branch, path: "content", per_page: limit });
    return commits.data.map((c) => ({ sha: c.sha, message: c.commit.message, date: c.commit.committer?.date, url: c.html_url }));
  }
}