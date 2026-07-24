import { runAsk } from "@/lib/generate/run-ask";
import {
  acceptBackgroundWork,
  withGenerateAccess,
} from "@/lib/api/with-generate-access";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const ctx = await withGenerateAccess(req, {
    busyStatuses: ["provisioning", "generating", "publishing"],
    noPlanMessage: "Pro plan required to ask Floras.",
  });
  if (ctx instanceof Response) return ctx;
  return acceptBackgroundWork(() => runAsk(ctx.projectId, ctx.token));
}
