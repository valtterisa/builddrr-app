import { after } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { runPublish } from "@/lib/publish/run-publish";
import {
  publishAcceptedSchema,
  publishRequestSchema,
} from "@/lib/publish/types";
import { cloudflareConfigured } from "@/lib/cloudflare/pages";
import { boxConfigured } from "@/lib/box/client";
import { AppError } from "@/lib/errors";

export const maxDuration = 300;
export const runtime = "nodejs";

function errorJson(error: AppError, status: number) {
  return Response.json({ error: error.message, code: error.code }, { status });
}

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return errorJson(new AppError("auth"), 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorJson(new AppError("unknown"), 400);
  }

  const parsed = publishRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(new AppError("unknown"), 400);
  }

  const { projectId } = parsed.data;

  const project = await fetchQuery(
    (api as any).projects.get,
    { projectId },
    { token }
  );

  if (!project) {
    return errorJson(new AppError("not_found"), 404);
  }

  if (!project.boxId) {
    return errorJson(
      new AppError(
        "publish",
        "Publish requires a sandbox. Generate the site first."
      ),
      400
    );
  }

  if (!boxConfigured() || !cloudflareConfigured()) {
    return errorJson(new AppError("config"), 503);
  }

  after(() => runPublish(projectId, token));

  const accepted = publishAcceptedSchema.parse({ ok: true as const });
  return Response.json(accepted, { status: 202 });
}
