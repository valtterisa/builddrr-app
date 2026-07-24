import { after } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { asProjectId } from "@/lib/convex/ids";
import { runPublish } from "@/lib/publish/run-publish";
import { runUnpublish } from "@/lib/publish/run-unpublish";
import {
  publishAcceptedSchema,
  publishRequestSchema,
} from "@/lib/publish/types";
import { cloudflareConfigured } from "@/lib/cloudflare/pages";
import { boxConfigured } from "@/lib/box/client";
import { getAccess } from "@/lib/billing/get-access";
import { AppError, appErrorResponse } from "@/lib/errors";

export const maxDuration = 300;
export const runtime = "nodejs";

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

  const parsed = publishRequestSchema.safeParse(body);
  if (!parsed.success) {
    return appErrorResponse(new AppError("unknown"), 400);
  }

  const { projectId } = parsed.data;
  const pid = asProjectId(projectId);

  const project = await fetchQuery(api.projects.get, { projectId: pid }, { token });

  if (!project) {
    return appErrorResponse(new AppError("not_found"), 404);
  }

  if (!project.boxId) {
    return appErrorResponse(
      new AppError(
        "publish",
        "Publish requires a sandbox. Generate the site first."
      ),
      400
    );
  }

  if (
    project.status === "provisioning" ||
    project.status === "generating" ||
    project.publishStatus === "publishing"
  ) {
    return Response.json(
      { error: "Project is busy", code: "busy" },
      { status: 409 }
    );
  }

  if (!boxConfigured() || !cloudflareConfigured()) {
    return appErrorResponse(new AppError("config"), 503);
  }

  const me = await fetchQuery(api.users.me, {}, { token });
  if (!me?.id) {
    return appErrorResponse(new AppError("auth"), 401);
  }

  const access = await getAccess(me.id);
  if (!access.hasPaidPlan) {
    return Response.json(
      { error: "Pro plan required to publish sites.", code: "NO_PLAN" },
      { status: 402 }
    );
  }

  after(() => runPublish(projectId, token));

  const accepted = publishAcceptedSchema.parse({ ok: true as const });
  return Response.json(accepted, { status: 202 });
}

export async function DELETE(req: Request) {
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

  const parsed = publishRequestSchema.safeParse(body);
  if (!parsed.success) {
    return appErrorResponse(new AppError("unknown"), 400);
  }

  if (!cloudflareConfigured()) {
    return appErrorResponse(new AppError("config"), 503);
  }

  try {
    await runUnpublish(parsed.data.projectId, token);
    return Response.json({ ok: true as const });
  } catch (error) {
    const appError = AppError.from(error);
    console.error("Unpublish failed", {
      projectId: parsed.data.projectId,
      code: appError.code,
      detail: appError.detail,
    });
    return appErrorResponse(appError);
  }
}
