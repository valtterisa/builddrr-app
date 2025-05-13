const GITLAB_API_URL = "https://gitlab.com/api/v4";

export class GitlabApi {
  constructor(
    private token: string,
    private projectId: string
  ) {}

  private headers() {
    return {
      "Content-Type": "application/json",
      "PRIVATE-TOKEN": this.token,
    };
  }

  async getFile(filePath: string, branch = "main") {
    const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(this.projectId)}/repository/files/${encodeURIComponent(filePath)}?ref=${branch}`;
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) throw new Error(`Failed to get file: ${res.statusText}`);
    return res.json();
  }

  async createOrUpdateFile(
    filePath: string,
    content: string,
    branch = "main",
    commitMessage = "Update via API"
  ) {
    // Try to get the file to see if it exists
    let method = "POST";
    let url = `${GITLAB_API_URL}/projects/${encodeURIComponent(this.projectId)}/repository/files/${encodeURIComponent(filePath)}`;
    try {
      await this.getFile(filePath, branch);
      method = "PUT";
    } catch (e) {
      // File does not exist, will create
    }
    const res = await fetch(url, {
      method,
      headers: this.headers(),
      body: JSON.stringify({
        branch,
        content,
        commit_message: commitMessage,
        encoding: "text",
      }),
    });
    if (!res.ok)
      throw new Error(`Failed to create/update file: ${res.statusText}`);
    return res.json();
  }
}

// --- New helper for forking and updating a repo ---

export async function forkTemplateRepo(
  token: string,
  templateProjectId: string,
  namespace: string,
  newRepoName: string
) {
  const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(templateProjectId)}/fork`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "PRIVATE-TOKEN": token,
    },
    body: JSON.stringify({
      namespace_path: namespace,
      name: newRepoName,
      path: newRepoName,
    }),
  });
  if (!res.ok) throw new Error(`Failed to fork repo: ${res.statusText}`);
  return res.json();
}

export async function addFilesToRepo(
  token: string,
  projectId: string,
  files: { path: string; content: string }[],
  branch = "main"
) {
  const api = new GitlabApi(token, projectId);
  for (const file of files) {
    await api.createOrUpdateFile(
      file.path,
      file.content,
      branch,
      "AI-generated update"
    );
  }
}
