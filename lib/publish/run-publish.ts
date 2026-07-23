import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import * as box from "@/lib/box/client";
import {
  addDomain,
  cloudflareConfigured,
  deletePagesProject,
  ensurePagesProject,
  getCloudflareConfig,
  getProjectPublishInfo,
} from "@/lib/cloudflare/pages";
import { AppError } from "@/lib/errors";
import {
  isRetryableBoxError,
  isRetryableCloudflareError,
  isRetryableWranglerError,
  withRetry,
} from "@/lib/publish/retry";
import {
  generateFlorasHostname,
  isFlorasHostname,
  pagesProjectName,
} from "@/lib/publish/types";

export async function runPublish(projectId: string, token: string) {
  const project = await fetchQuery(
    (api as any).projects.get,
    { projectId },
    { token }
  );
  if (!project) return;

  const boxId =
    typeof project.boxId === "string" ? project.boxId : undefined;
  if (!boxId) {
    await fetchMutation(
      (api as any).projects.setPublishError,
      {
        projectId,
        error: new AppError(
          "publish",
          "Publish requires a sandbox. Generate the site first."
        ).message,
      },
      { token }
    );
    return;
  }

  if (!box.boxConfigured()) {
    await fetchMutation(
      (api as any).projects.setPublishError,
      { projectId, error: new AppError("config").message },
      { token }
    );
    return;
  }

  if (!cloudflareConfigured()) {
    await fetchMutation(
      (api as any).projects.setPublishError,
      { projectId, error: new AppError("config").message },
      { token }
    );
    return;
  }

  const name = pagesProjectName(projectId);
  let createdProjectThisRun = false;
  let committed = false;

  try {
    await fetchMutation(
      (api as any).projects.setPublishStatus,
      { projectId, status: "publishing" },
      { token }
    );

    await withRetry(() => box.ensureBoxReady(boxId), {
      attempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 8000,
      label: "ensureBoxReady",
      retryable: isRetryableBoxError,
    });

    const ensured = await withRetry(() => ensurePagesProject(name), {
      attempts: 3,
      initialDelayMs: 800,
      maxDelayMs: 6000,
      label: "ensurePagesProject",
      retryable: isRetryableCloudflareError,
    });
    createdProjectThisRun = ensured.created;

    await box.buildSite(boxId);
    await box.assertDistPresent(boxId);

    const creds = getCloudflareConfig();
    await withRetry(
      () =>
        box.deployDistWithWrangler(boxId, {
          projectName: name,
          apiToken: creds.apiToken,
          accountId: creds.accountId,
        }),
      {
        attempts: 3,
        initialDelayMs: 1500,
        maxDelayMs: 10000,
        label: "deployDistWithWrangler",
        retryable: isRetryableWranglerError,
      }
    );

    await withRetry(() => getProjectPublishInfo(name), {
      attempts: 4,
      initialDelayMs: 500,
      maxDelayMs: 4000,
      label: "getProjectPublishInfo",
      retryable: isRetryableCloudflareError,
    });

    const existingSubdomain =
      typeof project.cfSubdomain === "string" ? project.cfSubdomain : "";
    const florasHost = isFlorasHostname(existingSubdomain)
      ? existingSubdomain
      : generateFlorasHostname();

    await withRetry(() => addDomain(name, florasHost), {
      attempts: 3,
      initialDelayMs: 800,
      maxDelayMs: 6000,
      label: "addFlorasSubdomain",
      retryable: isRetryableCloudflareError,
    });

    await withRetry(
      () =>
        fetchMutation(
          (api as any).projects.setPublished,
          {
            projectId,
            cfProjectName: name,
            cfSubdomain: florasHost,
            publishedUrl: `https://${florasHost}`,
            publishedAt: Date.now(),
          },
          { token }
        ),
      {
        attempts: 2,
        initialDelayMs: 300,
        maxDelayMs: 1500,
        label: "setPublished",
        retryable: () => true,
      }
    );
    committed = true;
  } catch (error) {
    if (createdProjectThisRun && !committed) {
      await withRetry(() => deletePagesProject(name), {
        attempts: 3,
        initialDelayMs: 500,
        maxDelayMs: 4000,
        label: "deletePagesProject",
        retryable: isRetryableCloudflareError,
      }).catch((rollbackError) => {
        console.error("Failed to roll back Cloudflare project", rollbackError);
      });
    }

    const appError = AppError.from(error);
    console.error("Publish failed", {
      projectId,
      code: appError.code,
      detail: appError.detail,
    });
    await fetchMutation(
      (api as any).projects.setPublishError,
      { projectId, error: appError.message },
      { token }
    ).catch(() => {});
  } finally {
    await box.scrubCfEnv(boxId).catch(() => {});
  }
}
