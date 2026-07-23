import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { z } from "zod";
import { api } from "@/convex/_generated/api";
import {
  BoxStateEnum,
  boxConfigured,
  getBoxState,
  stopSandbox,
} from "@/lib/box/client";
import { AppError } from "@/lib/errors";

export const maxDuration = 120;
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
    return Response.json({ ok: true as const, skipped: true });
  }

  const project = await fetchQuery(
    (api as any).projects.get,
    { projectId: parsed.data.projectId },
    { token }
  );

  if (!project?.boxId) {
    return Response.json({ ok: true as const, skipped: true });
  }

  try {
    const state = await getBoxState(project.boxId);
    if (
      state === BoxStateEnum.Archived ||
      state === BoxStateEnum.Archiving
    ) {
      return Response.json({ ok: true as const, skipped: true });
    }
    await stopSandbox(project.boxId);
    return Response.json({ ok: true as const });
  } catch (err) {
    const error = err instanceof AppError ? err : AppError.from(err);
    console.error("preview stop failed:", error.detail);
    return Response.json({ ok: true as const, skipped: true });
  }
}
