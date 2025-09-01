import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

const ORG = "builddrr-user-sites";
const TEMPLATE_OWNER = "builddrr-user-sites";
const TEMPLATE_REPO = "plain-nextjs-app";

// Read more: https://github.com/orgs/community/discussions/26333
async function waitForRepoReady(
  octokit: Octokit,
  org: string,
  repo: string,
  timeout = 60000
) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await octokit.request(`GET /repos/${org}/${repo}`, {
        owner: org,
        repo,
      });
    } catch (e) {
      if (e instanceof Error && "status" in e && e.status !== 404) throw e;
      console.log(`Waiting for repository ${repo} to be ready...`);
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
}

// Set up Octokit with installation authentication
async function getOctokitAsInstallation() {
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    installationId: process.env.GITHUB_APP_INSTALLATION_ID!,
  });

  // Get the installation access token (not a JWT)
  const { token } = await auth({ type: "installation" });
  return new Octokit({ auth: token });
}

export async function checkRepoExists(appName: string): Promise<boolean> {
  try {
    const octokit = await getOctokitAsInstallation();
    await octokit.request(`GET /repos/${ORG}/${appName}`, {
      owner: ORG,
      repo: appName,
    });
    console.log(`Repository ${appName} already exists`);
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`Repository ${appName} does not exist`);
      return false;
    }
    console.error(`Error checking repository ${appName}:`, error);
    return false;
  }
}

export async function createRepoFromTemplate(appName: string): Promise<string> {
  console.log("Creating repo from template", TEMPLATE_REPO, appName);
  const octokit = await getOctokitAsInstallation();

  try {
    const { data } = await octokit.request(
      `POST /repos/${TEMPLATE_OWNER}/${TEMPLATE_REPO}/generate`,
      {
        owner: ORG,
        name: appName,
        private: true,
      }
    );

    console.log(
      `Repository ${appName} created successfully, waiting for it to be ready...`
    );
    await waitForRepoReady(octokit, ORG, appName);
    console.log(`Repository ${appName} is now ready for file uploads`);

    return data.html_url;
  } catch (error) {
    console.error(`Failed to create repository ${appName}:`, error);
    throw error;
  }
}

// Repository is now properly initialized with template content before file uploads

export async function uploadFilesToRepo(
  repo: string,
  files: Record<string, string> = {}
): Promise<void> {
  console.log("Uploading files to repo", repo);
  const octokit = await getOctokitAsInstallation();

  for (const [path, content] of Object.entries(files)) {
    try {
      // First, try to get the current file's SHA if it exists
      let currentSha: string | undefined;
      try {
        const fileResponse = await octokit.request(
          `GET /repos/${ORG}/${repo}/contents/${path}`,
          {
            owner: ORG,
            repo: repo,
            path: path,
          }
        );
        currentSha = fileResponse.data.sha;
        console.log(`File ${path} exists, current SHA: ${currentSha}`);
      } catch (fileError: any) {
        if (fileError.status === 404) {
          console.log(`File ${path} does not exist, will create new file`);
        } else {
          console.error(`Failed to get file ${path}:`, fileError);
        }
      }

      // Prepare the request payload
      const payload: any = {
        owner: ORG,
        repo: repo,
        path: path,
        message: currentSha ? `Update ${path}` : `Add ${path}`,
        content: Buffer.from(content).toString("base64"),
        committer: {
          name: "Builddrr Deploy Bot",
          email: "deploy-bot@builddrr.com",
        },
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      };

      // Add SHA if file exists (required for updates)
      if (currentSha) {
        payload.sha = currentSha;
      }

      await octokit.request(
        `PUT /repos/${ORG}/${repo}/contents/${path}`,
        payload
      );
      console.log(
        `Successfully ${currentSha ? "updated" : "uploaded"} ${path} to ${repo}`
      );
    } catch (error) {
      console.error(`Failed to upload ${path} to ${repo}:`, error);
    }
  }
}
