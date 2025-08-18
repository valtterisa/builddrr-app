"use server";

import Cloudflare from "cloudflare";

const client = new Cloudflare({
  apiToken: process.env.CLOUDFLARE_ACCOUNT_TOKEN!,
});

// Create a project
async function createProject(name: string) {
  const project = await client.pages.projects.create({
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    name: name,
    production_branch: "main",
    build_config: {
      build_command: "npx @cloudflare/next-on-pages@1",
      destination_dir: ".vercel/output/static",
    },
    source: {
      type: "github",
      config: {
        owner: "builddrr-user-sites",
        repo_name: name,
      },
    },
  });

  return project;
}

// create a deployment
async function createDeployment(name: string) {
  const deployment = await client.pages.projects.deployments.create(name, {
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
  });

  return deployment;
}

// add subdomain
async function addSubdomain(name: string) {
  const subdomain = await client.pages.projects.domains.create(name, {
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
    name: `${name}.builddrr.com`,
  });

  // add dns record
  await client.dns.records.create({
    zone_id: process.env.CLOUDFLARE_ZONE_ID!,
    type: "CNAME",
    name: `${name}.builddrr.com`,
    content: `${name}.pages.dev`,
    ttl: 1,
    proxied: false,
  });

  return subdomain;
}

// delete project
export async function deleteProject(name: string) {
  const project = await client.pages.projects.delete(name, {
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
  });

  return project;
}

export async function createSiteForUser(name: string) {
  try {
    const project = await createProject(name);
    const deployment = await createDeployment(name);
    const subdomain = await addSubdomain(name);
    return { ok: true, project, deployment, subdomain };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to create site" };
  }
}
