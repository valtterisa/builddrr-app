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

console.log("App authentication:", appAuthentication.token);


const octokit = new Octokit({
  auth: appAuthentication.token,
});

const ORG = "builddrr-user-sites";
const TEMPLATE_REPO = "https://github.com/valtterisa/plain-nextjs-app";

export async function createRepoFromTemplate(appName: string): Promise<string> {
  const repoName = `builddrr-user-site-${appName}`;
  const { data } = await octokit.repos.createUsingTemplate({
    template_owner: "valtterisa",
    template_repo: TEMPLATE_REPO,
    owner: ORG,
    name: repoName,
    private: true,
  });
  return data.html_url;
}

// Read more: https://octokit.github.io/rest.js/v22/#repos-create-or-update-file-contents
export async function uploadFilesToRepo(
  repo: string,
  files: Record<string, string> = {}
): Promise<void> {
  for (const [path, content] of Object.entries(files)) {
    await octokit.repos.createOrUpdateFileContents({
      owner: ORG,
      repo: repo,
      path: path,
      message: `Add ${path}`,
      content: Buffer.from(content).toString("base64"),
      committer: {
        name: "Builddrr Deploy Bot",
        email: "deploy-bot@builddrr.com",
        date: new Date().toISOString(),
      },
      author: {
        name: "Builddrr Deploy Bot",
        email: "deploy-bot@builddrr.com",
        date: new Date().toISOString(),
      },
    });
  }
}
