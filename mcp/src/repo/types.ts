export interface ContentRepo {
  readTree(): Promise<{ sha: string; files: Map<string, string> }>;
  commit(
    changes: Map<string, string | null>,
    opts: { message: string; branch?: string; createPr?: { title: string; body: string }; author?: string },
  ): Promise<{ sha: string; url: string; branch: string; prUrl?: string }>;
  uploadBinary(path: string, base64: string, message: string): Promise<{ sha: string; url: string }>;
  getStatus(): Promise<{
    headSha: string;
    lastCommit: { message: string; date: string; url: string };
    ciRuns: Array<{ name: string; status: string; conclusion: string | null; url: string; createdAt: string }>;
  }>;
}