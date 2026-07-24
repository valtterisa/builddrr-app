import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { asProjectId } from "@/lib/convex/ids";
import {
  addDomain,
  cloudflareConfigured,
  getDomain,
  removeDomain,
} from "@/lib/cloudflare/pages";
import { AppError } from "@/lib/errors";
import {
  isRetryableCloudflareError,
  withRetry,
} from "@/lib/publish/retry";
import {
  domainsResponseSchema,
  parseHostname,
  type DomainsResponse,
} from "@/lib/publish/types";

type ProjectDoc = {
  publishStatus?: string;
  cfProjectName?: string;
  publishedUrl?: string;
  customDomain?: string;
};

function emptyResponse(project: ProjectDoc): DomainsResponse {
  return domainsResponseSchema.parse({
    publishedUrl: project.publishedUrl ?? null,
    cfProjectName: project.cfProjectName ?? null,
    domain: null,
  });
}

async function loadProject(projectId: string, token: string) {
  const project = await fetchQuery(
    api.projects.get,
    { projectId: asProjectId(projectId) },
    { token }
  );
  if (!project) {
    throw new AppError("not_found", "Project not found.");
  }
  return project as ProjectDoc;
}

function requireCloudflare() {
  if (!cloudflareConfigured()) {
    throw new AppError(
      "config",
      "Publishing is not configured right now."
    );
  }
}

export async function getCustomDomain(
  projectId: string,
  token: string
): Promise<DomainsResponse> {
  const project = await loadProject(projectId, token);

  if (
    project.publishStatus !== "published" ||
    !project.cfProjectName ||
    !project.customDomain
  ) {
    return emptyResponse(project);
  }

  requireCloudflare();

  const domain = await withRetry(
    () => getDomain(project.cfProjectName!, project.customDomain!),
    {
      attempts: 3,
      initialDelayMs: 500,
      maxDelayMs: 4000,
      label: "getDomain",
      retryable: isRetryableCloudflareError,
    }
  );

  if (domain) {
    await fetchMutation(
      api.projects.setCustomDomain,
      {
        projectId: asProjectId(projectId),
        domain: domain.name,
        status: domain.status,
        error: domain.errorMessage,
        updatedAt: Date.now(),
      },
      { token }
    ).catch(() => {});
  }

  return domainsResponseSchema.parse({
    publishedUrl: project.publishedUrl ?? null,
    cfProjectName: project.cfProjectName ?? null,
    domain,
  });
}

export async function connectCustomDomain(
  projectId: string,
  domainInput: string,
  token: string
): Promise<DomainsResponse> {
  const project = await loadProject(projectId, token);

  if (project.publishStatus !== "published" || !project.cfProjectName) {
    throw new AppError(
      "domain",
      "Publish the site before connecting a domain."
    );
  }

  requireCloudflare();

  const hostname = parseHostname(domainInput);
  const cfProjectName = project.cfProjectName;
  let domainAdded = false;

  try {
    if (project.customDomain && project.customDomain !== hostname) {
      await withRetry(() => removeDomain(cfProjectName, project.customDomain!), {
        attempts: 3,
        initialDelayMs: 500,
        maxDelayMs: 4000,
        label: "removeDomainBeforeReplace",
        retryable: isRetryableCloudflareError,
      });
      await fetchMutation(
        api.projects.clearCustomDomain,
        { projectId: asProjectId(projectId) },
        { token }
      );
    }

    const domain = await withRetry(() => addDomain(cfProjectName, hostname), {
      attempts: 3,
      initialDelayMs: 800,
      maxDelayMs: 6000,
      label: "addDomain",
      retryable: isRetryableCloudflareError,
    });
    domainAdded = true;

    try {
      await fetchMutation(
        api.projects.setCustomDomain,
        {
          projectId: asProjectId(projectId),
          domain: domain.name,
          status: domain.status,
          error: domain.errorMessage,
          updatedAt: Date.now(),
        },
        { token }
      );
    } catch (convexError) {
      await withRetry(() => removeDomain(cfProjectName, hostname), {
        attempts: 3,
        initialDelayMs: 500,
        maxDelayMs: 4000,
        label: "compensateRemoveDomain",
        retryable: isRetryableCloudflareError,
      }).catch(() => {});
      throw convexError;
    }

    return domainsResponseSchema.parse({
      publishedUrl: project.publishedUrl ?? null,
      cfProjectName,
      domain,
    });
  } catch (error) {
    if (domainAdded) {
      await removeDomain(cfProjectName, hostname).catch(() => {});
    }
    throw error;
  }
}

export async function disconnectCustomDomain(
  projectId: string,
  token: string
): Promise<DomainsResponse> {
  const project = await loadProject(projectId, token);

  if (!project.cfProjectName || !project.customDomain) {
    return emptyResponse(project);
  }

  requireCloudflare();

  await withRetry(
    () => removeDomain(project.cfProjectName!, project.customDomain!),
    {
      attempts: 3,
      initialDelayMs: 500,
      maxDelayMs: 4000,
      label: "removeDomain",
      retryable: isRetryableCloudflareError,
    }
  );

  await withRetry(
    () =>
      fetchMutation(
        api.projects.clearCustomDomain,
        { projectId: asProjectId(projectId) },
        { token }
      ),
    {
      attempts: 2,
      initialDelayMs: 300,
      maxDelayMs: 1500,
      label: "clearCustomDomain",
      retryable: () => true,
    }
  );

  return domainsResponseSchema.parse({
    publishedUrl: project.publishedUrl ?? null,
    cfProjectName: project.cfProjectName ?? null,
    domain: null,
  });
}
