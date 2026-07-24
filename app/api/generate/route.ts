import { runGeneration } from "@/lib/generate/run-generation";
import {
  acceptBackgroundWork,
  withGenerateAccess,
} from "@/lib/api/with-generate-access";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const ctx = await withGenerateAccess(req, {
    busyStatuses: ["provisioning", "generating", "publishing"],
    noPlanMessage: "Pro plan required to generate sites.",
  });
  if (ctx instanceof Response) return ctx;
  return acceptBackgroundWork(() => runGeneration(ctx.projectId, ctx.token));
}
