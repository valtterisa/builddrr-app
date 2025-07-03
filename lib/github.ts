import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

const auth = createAppAuth({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
  clientId: process.env.GITHUB_APP_CLIENT_ID!,
  clientSecret: process.env.GITHUB_APP_CLIENT_SECRET!,
});

// Retrieve JSON Web Token (JWT) to authenticate as app
const appAuthentication = await auth({ type: "app" });

const octokit = new Octokit({
  auth: appAuthentication.token,
});

const ORG = "builddrr-user-sites";
const TEMPLATE_REPO = "https://github.com/valtterisa/plain-nextjs-app";

export async function createRepoFromTemplate(appName: string): Promise<string> {
  const repoName = `builddrr-user-site-${appName}`;
  const { data } = await octokit.repos.createUsingTemplate({
    template_owner: ORG,
    template_repo: TEMPLATE_REPO,
    owner: ORG,
    name: repoName,
    private: true,
  });
  return data.html_url;
}

export type RepoFile = {
  path: string;
  content: string;
  message?: string;
};

export async function uploadFilesToRepo(
  repo: string,
  files: RepoFile[]
): Promise<void> {
  for (const file of files) {
    await octokit.repos.createOrUpdateFileContents({
      owner: ORG,
      repo,
      path: file.path,
      message: file.message || `Add ${file.path}`,
      content: Buffer.from(file.content).toString("base64"),
    });
  }
}
