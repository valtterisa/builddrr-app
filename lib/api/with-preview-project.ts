import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { asProjectId } from "@/lib/convex/ids";
import { boxConfigured } from "@/lib/box/client";
import { appErrorResponse, AppError } from "@/lib/errors";

const requestSchema = z.object({
  projectId: z.string().min(1),
});

export type PreviewProject = {
  projectId: string;
  boxId: string;
  previewUrl?: string;
  token: string;
};

export async function withPreviewProject(
  req: Request
): Promise<PreviewProject | Response> {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return appErrorResponse(new AppError("auth"), 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON", code: "unknown" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "projectId required", code: "unknown" },
      { status: 400 }
    );
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
    return Response.json(
      { error: "No sandbox for this project yet.", code: "preview" },
      { status: 400 }
    );
  }

  return {
    projectId: parsed.data.projectId,
    boxId: project.boxId,
    previewUrl:
      typeof project.previewUrl === "string" ? project.previewUrl : undefined,
    token,
  };
}
