import { after } from "next/server";
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

export const maxDuration = 300;
export const runtime = "nodejs";

const requestSchema = z.object({
  projectId: z.string().min(1),
});

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    console.info("[preview:stop] unauthorized");
    return Response.json({ error: "Not authenticated", code: "auth" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    console.info("[preview:stop] invalid json");
    return Response.json({ error: "Invalid JSON", code: "unknown" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    console.info("[preview:stop] missing projectId");
    return Response.json(
      { error: "projectId required", code: "unknown" },
      { status: 400 }
    );
  }

  if (!boxConfigured()) {
    console.info("[preview:stop] skipped — box not configured", {
      projectId: parsed.data.projectId,
    });
    return Response.json({ ok: true as const, skipped: true });
  }

  const project = await fetchQuery(
    (api as any).projects.get,
    { projectId: parsed.data.projectId },
    { token }
  );

  if (!project?.boxId) {
    console.info("[preview:stop] skipped — no boxId", {
      projectId: parsed.data.projectId,
    });
    return Response.json({ ok: true as const, skipped: true });
  }

  const boxId = project.boxId as string;
  const projectId = parsed.data.projectId;

  try {
    const state = await getBoxState(boxId);
    console.info("[preview:stop] state", { projectId, boxId, state });
    if (
      state === BoxStateEnum.Archived ||
      state === BoxStateEnum.Archiving
    ) {
      console.info("[preview:stop] skipped — already stopping/stopped", {
        boxId,
        state,
      });
      return Response.json({ ok: true as const, skipped: true });
    }

    // keepalive/beacon dies if we block on scrub+stop — finish after response.
    after(() =>
      stopSandbox(boxId)
        .then(() => {
          console.info("[preview:stop] background ok", { projectId, boxId });
        })
        .catch((err) => {
          const error = err instanceof AppError ? err : AppError.from(err);
          console.error("[preview:stop] background failed", {
            projectId,
            boxId,
            detail: error.detail,
            message: error.message,
          });
        })
    );

    console.info("[preview:stop] accepted", { projectId, boxId });
    return Response.json({ ok: true as const }, { status: 202 });
  } catch (err) {
    const error = err instanceof AppError ? err : AppError.from(err);
    console.error("[preview:stop] failed", {
      projectId,
      boxId,
      detail: error.detail,
      message: error.message,
    });
    return Response.json({ ok: true as const, skipped: true });
  }
}
