import { fetchMutation } from "convex/nextjs";
import { withPreviewProject } from "@/lib/api/with-preview-project";
import { api } from "@/convex/_generated/api";
import { asProjectId } from "@/lib/convex/ids";
import { startPreview } from "@/lib/box/client";
import { appErrorResponse, AppError } from "@/lib/errors";

export const maxDuration = 800;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const ctx = await withPreviewProject(req);
  if (ctx instanceof Response) return ctx;

  try {
    const previewUrl = await startPreview(ctx.boxId);
    if (previewUrl !== ctx.previewUrl) {
      await fetchMutation(
        api.projects.setPreview,
        {
          projectId: asProjectId(ctx.projectId),
          previewUrl,
        },
        { token: ctx.token }
      );
    }
    return Response.json({ ok: true as const, previewUrl });
  } catch (err) {
    const error = AppError.from(err);
    console.error("[preview:start] failed:", error.detail ?? error.message);
    return appErrorResponse(
      err instanceof AppError
        ? err
        : new AppError("preview", "Couldn't start the sandbox. Please try again.")
    );
  }
}
