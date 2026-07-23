import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import {
  boxConfigured,
  getBoxState,
  probePublicPreview,
} from "@/lib/box/client";
import { AppError } from "@/lib/errors";

export const runtime = "nodejs";

const LIVE_STATES = new Set(["ready", "idle", "running"]);

const querySchema = z.object({
  projectId: z.string().min(1),
});

export async function GET(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return Response.json({ error: "Not authenticated", code: "auth" }, { status: 401 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    projectId: url.searchParams.get("projectId") ?? "",
  });
  if (!parsed.success) {
    return Response.json(
      { error: "projectId required", code: "unknown" },
      { status: 400 }
    );
  }

  if (!boxConfigured()) {
    return Response.json(
      { error: "Sandbox is not configured.", code: "config" },
      { status: 503 }
    );
  }

  const project = await fetchQuery(
    (api as any).projects.get,
    { projectId: parsed.data.projectId },
    { token }
  );

  if (!project) {
    return Response.json({ error: "Not found", code: "not_found" }, { status: 404 });
  }

  if (!project.boxId) {
    return Response.json({
      state: null as string | null,
      boxId: null as string | null,
      previewOk: false,
    });
  }

  try {
    const state = await getBoxState(project.boxId);
    const previewUrl =
      typeof project.previewUrl === "string" ? project.previewUrl : null;
    const previewOk =
      LIVE_STATES.has(state) && previewUrl
        ? await probePublicPreview(previewUrl)
        : false;
    return Response.json({ state, boxId: project.boxId, previewOk });
  } catch (err) {
    const error = err instanceof AppError ? err : AppError.from(err);
    console.error("preview status failed:", error.detail);
    return Response.json(
      {
        error:
          err instanceof AppError
            ? error.message
            : "Couldn't read sandbox status.",
        code: err instanceof AppError ? error.code : "preview",
      },
      { status: 500 }
    );
  }
}
