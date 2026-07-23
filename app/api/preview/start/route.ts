import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import { boxConfigured, startPreview } from "@/lib/box/client";
import { AppError } from "@/lib/errors";

export const maxDuration = 800;
export const runtime = "nodejs";

const requestSchema = z.object({
  projectId: z.string().min(1),
});

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return Response.json({ error: "Not authenticated", code: "auth" }, { status: 401 });
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
    return Response.json(
      { error: "No sandbox for this project yet.", code: "preview" },
      { status: 400 }
    );
  }

  try {
    const previewUrl = await startPreview(project.boxId);
    if (previewUrl !== project.previewUrl) {
      await fetchMutation(
        (api as any).projects.setPreview,
        { projectId: parsed.data.projectId, previewUrl },
        { token }
      );
    }
    return Response.json({ ok: true as const, previewUrl });
  } catch (err) {
    const error = err instanceof AppError ? err : AppError.from(err);
    console.error("preview start failed:", error.detail ?? error.message, err);
    return Response.json(
      {
        error:
          err instanceof AppError
            ? error.message
            : "Couldn't start the sandbox. Please try again.",
        code: err instanceof AppError ? error.code : "preview",
      },
      { status: 500 }
    );
  }
}
