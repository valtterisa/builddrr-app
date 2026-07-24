import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { asProjectId } from "@/lib/convex/ids";
import { appErrorResponse, AppError } from "@/lib/errors";
import { boxConfigured, exportSiteZip } from "@/lib/box/client";

export const maxDuration = 300;
export const runtime = "nodejs";

const requestSchema = z.object({
  projectId: z.string().min(1),
});

function zipFilename(name: unknown, projectId: string): string {
  const raw = typeof name === "string" && name.trim() ? name.trim() : "site";
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${slug || "site"}-${projectId.slice(-6)}.zip`;
}

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return appErrorResponse(new AppError("auth"), 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return appErrorResponse(new AppError("unknown"), 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return appErrorResponse(new AppError("unknown"), 400);
  }

  if (!boxConfigured()) {
    return appErrorResponse(new AppError("config"), 503);
  }

  const project = await fetchQuery(
    api.projects.get,
    { projectId: asProjectId(parsed.data.projectId) },
    { token }
  );

  if (!project) {
    return appErrorResponse(new AppError("not_found"), 404);
  }

  if (!project.boxId || typeof project.boxId !== "string") {
    return appErrorResponse(
      new AppError(
        "preview",
        "Export requires a sandbox. Generate the site first."
      ),
      400
    );
  }

  try {
    const blob = await exportSiteZip(project.boxId);
    const filename = zipFilename(project.name, parsed.data.projectId);
    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const appError = AppError.from(error);
    console.error("Export failed", {
      projectId: asProjectId(parsed.data.projectId),
      code: appError.code,
      detail: appError.detail,
    });
    return appErrorResponse(
      error instanceof AppError
        ? error
        : new AppError("unknown", "Couldn't export the project. Please try again.")
    );
  }
}
