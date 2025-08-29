"use server";

import { Vercel } from "@vercel/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  createDomain,
  updateDomain,
  findDomainByName,
} from "@/lib/supabase/domains";
import { createAppAuth } from "@octokit/auth-app";
import { Sandbox } from "@vercel/sandbox";
import ms from "ms";

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN!,
});

// Vercel's current IP addresses for A/AAAA records (updated as of 2024)
const VERCEL_IPS = {
  A: ["76.76.19.19", "76.223.126.88"],
  AAAA: ["2600:1f18:147f:e850::2", "2600:1f18:147f:e851::2"],
};

interface DomainRequest {
  projectId: string;
  domain: string;
  redirect?: string;
  redirectStatusCode?: 301 | 302 | 307 | 308;
  gitBranch?: string;
  websiteId?: string;
}

interface VerificationRequest {
  projectId: string;
  domain: string;
  websiteId?: string;
}

function isApexDomain(domain: string): boolean {
  // Apex domain has exactly 2 parts (e.g., example.com)
  // Subdomain has 3+ parts (e.g., www.example.com, api.example.com)
  const parts = domain.split(".");
  return parts.length === 2;
}

function validateDomain(domain: string): boolean {
  const domainRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

type RedirectStatusCode = 301 | 302 | 307 | 308;

// Check if Vercel project exists
export async function checkProjectExists(projectId: string) {
  try {
    // Get all projects and find the one we want
    const projects = await vercel.projects.getProjects({
      teamId: process.env.VERCEL_TEAM_ID!,
      slug: process.env.VERCEL_TEAM_SLUG!,
    });

    const project = projects.projects.find((p) => p.name === projectId);

    if (project) {
      return { exists: true, project };
    } else {
      return { exists: false, project: null };
    }
  } catch (error) {
    console.error("Error checking project existence:", error);
    return { exists: false, project: null };
  }
}

// Create Vercel project
export async function createVercelProject({
  projectName,
  gitRepo,
  framework = "nextjs",
}: {
  projectName: string;
  gitRepo: string;
  framework?: string;
}) {
  try {
    const project = await vercel.projects.createProject({
      teamId: process.env.VERCEL_TEAM_ID!,
      slug: process.env.VERCEL_TEAM_SLUG!,
      requestBody: {
        name: projectName,
        framework: framework as any,
        gitRepository: {
          repo: gitRepo,
          type: "github",
        },
      },
    });

    return { success: true, project };
  } catch (error) {
    console.error("Create Vercel project error:", error);
    throw error;
  }
}

// Deploy project to Vercel
export async function deployToVercel({
  projectName,
  gitRepo,
  gitOrg = "builddrr-user-sites",
  branch = "main",
}: {
  projectName: string;
  gitRepo: string;
  gitOrg?: string;
  branch?: string;
}) {
  try {
    const deployment = await vercel.deployments.createDeployment({
      teamId: process.env.VERCEL_TEAM_ID!,
      slug: process.env.VERCEL_TEAM_SLUG!,
      forceNew: "1",
      requestBody: {
        name: projectName,
        target: "production",
        gitSource: {
          type: "github",
          repo: gitRepo,
          ref: branch,
          org: gitOrg,
        },
      },
    });

    return { success: true, deployment };
  } catch (error) {
    console.error("Deploy to Vercel error:", error);
    throw error;
  }
}

// Ensure project exists and is deployed before adding custom domain
// This function only runs when users add custom domains, not for free domains
async function ensureProjectDeployment(projectId: string, websiteId?: string) {
  const { exists } = await checkProjectExists(projectId);

  if (!exists) {
    // Project doesn't exist, create and deploy it to Vercel for custom domain support
    const gitRepo = `builddrr-user-sites/${projectId}`;

    await createVercelProject({
      projectName: projectId,
      gitRepo,
    });

    await deployToVercel({
      projectName: projectId,
      gitRepo,
    });

    console.log(
      `Created and deployed Vercel project for custom domain: ${projectId}`
    );
  }

  return true;
}

// Add custom domain to Vercel project
// This triggers Vercel deployment only when users add custom domains
// Free domains remain on Cloudflare
export async function addDomainToProject({
  projectId,
  domain,
  redirect,
  redirectStatusCode,
  websiteId,
}: DomainRequest) {
  try {
    if (!projectId || !domain) {
      throw new Error("projectId and domain are required");
    }

    // Get user for Supabase operations
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate domain format
    if (!validateDomain(domain)) {
      throw new Error("Invalid domain format");
    }

    // Validate redirect status code if provided
    if (
      redirectStatusCode &&
      ![301, 302, 307, 308].includes(redirectStatusCode)
    ) {
      throw new Error(
        "Invalid redirect status code. Must be 301, 302, 307, or 308"
      );
    }

    // Ensure project exists and is deployed before adding domain
    await ensureProjectDeployment(projectId, websiteId);

    // If redirect is provided but no status code, default to 307
    const statusCode =
      redirect && !redirectStatusCode ? 307 : redirectStatusCode;

    // Add to Vercel
    const result = await vercel.projects.addProjectDomain({
      idOrName: projectId,
      requestBody: {
        name: domain,
        redirect: redirect || undefined,
        redirectStatusCode: statusCode as RedirectStatusCode | undefined,
      },
    });

    // Save to Supabase if websiteId provided
    let supabaseDomain = null;
    if (websiteId) {
      const { domain: dbDomain, error: dbError } = await createDomain(
        {
          website_id: websiteId,
          domain: domain,
          project_id: projectId,
          status: result.verified ? "active" : "pending",
          is_verified: result.verified,
          ssl: result.verified,
        },
        user.id
      );

      if (dbError) {
        console.warn("Failed to save domain to Supabase:", dbError);
      } else {
        supabaseDomain = dbDomain;
      }
    }

    return {
      success: true,
      domain: result.name,
      verified: result.verified,
      redirect: result.redirect || null,
      redirectStatusCode: result.redirectStatusCode || null,
      verification: result.verification || [],
      supabaseDomain,
    };
  } catch (error) {
    console.error("Add domain error:", error);

    if (error instanceof Error) {
      if (error.message.includes("already_exists")) {
        throw new Error("Domain already exists in project");
      }
      if (error.message.includes("invalid_domain")) {
        throw new Error("Invalid domain name");
      }
      if (error.message.includes("forbidden")) {
        throw new Error("Insufficient permissions to add domain");
      }
    }

    throw error;
  }
}

// Get DNS verification requirements for external domain
export async function getDomainVerificationInfo({
  projectId,
  domain,
}: {
  projectId: string;
  domain: string;
}) {
  try {
    if (!projectId || !domain) {
      throw new Error("projectId and domain are required");
    }

    // Validate domain format
    if (!validateDomain(domain)) {
      throw new Error("Invalid domain format");
    }

    let domainInfo;
    let domainConfig;

    try {
      domainInfo = await vercel.projects.getProjectDomain({
        idOrName: projectId,
        domain,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not_found")) {
        throw new Error("Domain not found in project. Add it first.");
      }
      throw error;
    }

    try {
      domainConfig = await vercel.domains.getDomainConfig({
        domain,
      });
    } catch (error) {
      console.warn("Could not fetch domain config:", error);
      domainConfig = { configuredBy: "EXTERNAL", misconfigured: false };
    }

    const isApex = isApexDomain(domain);
    const requiredRecords = [];

    if (isApex) {
      // Apex domain needs A and AAAA records
      VERCEL_IPS.A.forEach((ip) => {
        requiredRecords.push({
          type: "A",
          name: "@",
          value: ip,
          ttl: 3600,
        });
      });

      VERCEL_IPS.AAAA.forEach((ip) => {
        requiredRecords.push({
          type: "AAAA",
          name: "@",
          value: ip,
          ttl: 3600,
        });
      });
    } else {
      // Subdomain uses CNAME
      const subdomain = domain.split(".").slice(0, -2).join(".");
      requiredRecords.push({
        type: "CNAME",
        name: subdomain || domain.split(".")[0],
        value: "cname.vercel-dns.com",
        ttl: 3600,
      });
    }

    // Add TXT record for verification if needed
    if (domainInfo.verification && domainInfo.verification.length > 0) {
      domainInfo.verification.forEach((verification) => {
        requiredRecords.push({
          type: "TXT",
          name: "_vercel",
          value: verification.value,
          ttl: 3600,
        });
      });
    }

    return {
      domain: domainInfo.name,
      verified: domainInfo.verified,
      isApexDomain: isApex,
      verification: domainInfo.verification || [],
      dnsRecords: {
        required: requiredRecords,
        current:
          domainConfig.configuredBy === "VERCEL"
            ? "Managed by Vercel"
            : "External DNS",
        instructions: isApex
          ? "Add A and AAAA records for apex domain pointing to Vercel"
          : "Add CNAME record for subdomain pointing to cname.vercel-dns.com",
      },
      misconfigured: domainConfig.misconfigured || false,
      acceptedChallenges: domainConfig.acceptedChallenges || [],
    };
  } catch (error) {
    console.error("Domain verification GET error:", error);
    throw error;
  }
}

// Verify domain after DNS setup
export async function verifyDomainSetup({
  projectId,
  domain,
  websiteId,
}: VerificationRequest) {
  try {
    if (!projectId || !domain) {
      throw new Error("projectId and domain are required");
    }

    // Get user for Supabase operations
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Validate domain format
    if (!validateDomain(domain)) {
      throw new Error("Invalid domain format");
    }

    const result = await vercel.projects.verifyProjectDomain({
      idOrName: projectId,
      domain,
    });

    // Update in Supabase if websiteId provided
    if (websiteId) {
      const { domain: dbDomain } = await findDomainByName(
        domain,
        websiteId,
        user.id
      );
      if (dbDomain) {
        await updateDomain(
          dbDomain.id,
          {
            is_verified: result.verified,
            status: result.verified ? "active" : "pending",
            ssl: result.verified,
            verification_method: result.verified ? "dns" : undefined,
          },
          user.id
        );
      }
    }

    return {
      success: true,
      domain,
      verified: result.verified,
      message: result.verified
        ? "Domain verified successfully"
        : "Domain verification is still pending. DNS changes may take time to propagate.",
    };
  } catch (error) {
    console.error("Domain verification POST error:", error);

    if (error instanceof Error) {
      if (error.message.includes("not_found")) {
        throw new Error("Domain not found in project");
      }
      if (error.message.includes("forbidden")) {
        throw new Error("Insufficient permissions to verify domain");
      }
    }

    throw error;
  }
}

export async function deploySandboxAndStopExisting(appName: string) {
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    installationId: process.env.GITHUB_APP_INSTALLATION_ID!,
  });

  // Get the installation access token (not a JWT)
  const { token } = await auth({ type: "installation" });

  // check database if there is a sandbox and then check if its running.
  const supabase = await createClient();
  const { data } = await supabase
    .from("preview_environments")
    .select("sandbox_id")
    .eq("app_name", appName)
    .single();

  // if (data) {
  //   const { sandbox_id } = data;

  //   const sandbox = await getSandboxStatus(sandbox_id);
  //   // If there is existing running sandbox we stop it.
  //   if (sandbox.success) {
  //     const sandbox = await Sandbox.get({
  //       teamId: process.env.VERCEL_TEAM_ID!,
  //       projectId: process.env.VERCEL_SANDBOX_TEMPLATE_PROJECT_ID!,
  //       token: process.env.VERCEL_TOKEN!,
  //       sandboxId: sandbox_id,
  //     });

  //     if (sandbox.status === "running") {
  //       await sandbox.stop();
  //     }
  //   }
  // }

  console.log("🔍 [DEBUG] Creating new sandbox");

  const sandbox = await Sandbox.create({
    teamId: process.env.VERCEL_TEAM_ID!,
    projectId: process.env.VERCEL_SANDBOX_TEMPLATE_PROJECT_ID!,
    token: process.env.VERCEL_TOKEN!,
    source: {
      url: `https://github.com/builddrr-user-sites/${appName}.git`,
      type: "git",
      username: "x-access-token",
      password: token, // Github App installation token
    },
    resources: { vcpus: 2 },
    timeout: ms("5m"),
    ports: [3000],
    runtime: "node22",
  });

  console.log(
    "🔍 [DEBUG] Sandbox repo",
    `https://github.com/builddrr-user-sites/${appName}.git`
  );

  console.log("🔍 [DEBUG] Running install");
  const install = await sandbox.runCommand({
    cmd: "npm",
    args: ["install", "--loglevel", "info"],
  });

  if (install.exitCode != 0) {
    process.exit(1);
  }

  console.log("🔍 [DEBUG] Running start");
  await sandbox.runCommand({
    cmd: "npm",
    args: ["run", "dev"],
    detached: true,
  });

  console.log("🔍 [DEBUG] Sandbox created", sandbox);

  // save the sandbox id to database so we know what sandbox to stop before updating files.
  await supabase
    .from("preview_environments")
    .update({ sandbox_id: sandbox.sandboxId })
    .eq("app_name", appName);

  await new Promise((resolve) => setTimeout(resolve, 500));
  const url = sandbox.domain(3000);
  console.log("🔍 [DEBUG] Sandbox created", url);

  return { url: url, sandboxId: sandbox.sandboxId };
}

export async function getSandboxStatus(sandboxId: string) {
  try {
    const sandbox = await Sandbox.get({
      teamId: process.env.VERCEL_TEAM_ID!,
      projectId: process.env.VERCEL_SANDBOX_TEMPLATE_PROJECT_ID!,
      token: process.env.VERCEL_TOKEN!,
      sandboxId: sandboxId,
    });
    return {
      success: true,
      status: sandbox.status,
      url: sandbox.domain(3000),
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to get sandbox status",
    };
  }
}
