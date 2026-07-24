import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { AppError, appErrorResponse } from "@/lib/errors";
import {
  connectCustomDomain,
  disconnectCustomDomain,
  getCustomDomain,
} from "@/lib/publish/run-domain";
import {
  domainAddRequestSchema,
  domainDeleteRequestSchema,
  domainGetQuerySchema,
} from "@/lib/publish/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return appErrorResponse(new AppError("auth"), 401);
  }

  const url = new URL(req.url);
  const parsed = domainGetQuerySchema.safeParse({
    projectId: url.searchParams.get("projectId") ?? "",
  });
  if (!parsed.success) {
    return Response.json(
      { error: "projectId required", code: "unknown" },
      { status: 400 }
    );
  }

  try {
    const data = await getCustomDomain(parsed.data.projectId, token);
    return Response.json(data);
  } catch (error) {
    return appErrorResponse(error);
  }
}

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

  const parsed = domainAddRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "projectId and domain required", code: "unknown" },
      { status: 400 }
    );
  }

  try {
    const data = await connectCustomDomain(
      parsed.data.projectId,
      parsed.data.domain,
      token
    );
    return Response.json(data);
  } catch (error) {
    return appErrorResponse(error);
  }
}

export async function DELETE(req: Request) {
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

  const parsed = domainDeleteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "projectId required", code: "unknown" },
      { status: 400 }
    );
  }

  try {
    const data = await disconnectCustomDomain(parsed.data.projectId, token);
    return Response.json(data);
  } catch (error) {
    return appErrorResponse(error);
  }
}
