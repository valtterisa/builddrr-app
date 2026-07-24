import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { asProjectId } from "@/lib/convex/ids";
import { deleteFlorasCname } from "@/lib/cloudflare/dns";
import {
  cloudflareConfigured,
  deletePagesProject,
} from "@/lib/cloudflare/pages";
import { AppError } from "@/lib/errors";
import {
  isRetryableCloudflareError,
  withRetry,
} from "@/lib/publish/retry";
import { isFlorasHostname, pagesProjectName } from "@/lib/publish/types";

export async function runUnpublish(projectId: string, token: string) {
  if (!cloudflareConfigured()) {
    throw new AppError("config");
  }

  const project = await fetchQuery(
    api.projects.get,
    { projectId: asProjectId(projectId) },
    { token }
  );
  if (!project) {
    throw new AppError("not_found", "Project not found.");
  }

  const cfProjectName =
    typeof project.cfProjectName === "string" && project.cfProjectName
      ? project.cfProjectName
      : pagesProjectName(projectId);

  const florasHost =
    typeof project.cfSubdomain === "string" ? project.cfSubdomain : "";

  const hasPublishState =
    project.publishStatus === "published" ||
    Boolean(project.cfProjectName) ||
    Boolean(project.publishedUrl) ||
    isFlorasHostname(florasHost);

  if (!hasPublishState) {
    await fetchMutation(
      api.projects.clearPublished,
      { projectId: asProjectId(projectId) },
      { token }
    );
    return;
  }

  await withRetry(() => deletePagesProject(cfProjectName), {
    attempts: 3,
    initialDelayMs: 500,
    maxDelayMs: 4000,
    label: "deletePagesProject",
    retryable: isRetryableCloudflareError,
  });

  if (isFlorasHostname(florasHost)) {
    await withRetry(() => deleteFlorasCname(florasHost), {
      attempts: 3,
      initialDelayMs: 500,
      maxDelayMs: 4000,
      label: "deleteFlorasCname",
      retryable: isRetryableCloudflareError,
    });
  }

  await withRetry(
    () =>
      fetchMutation(
        api.projects.clearPublished,
        { projectId: asProjectId(projectId) },
        { token }
      ),
    {
      attempts: 2,
      initialDelayMs: 300,
      maxDelayMs: 1500,
      label: "clearPublished",
      retryable: () => true,
    }
  );
}
