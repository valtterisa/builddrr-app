import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { buildSiteAgent } from "@/lib/ai/agent";
import * as box from "@/lib/box/client";

export async function runGeneration(projectId: string, token: string) {
  const project = await fetchQuery(
    (api as any).projects.get,
    { projectId },
    { token }
  );
  if (!project) return;

  const history = await fetchQuery(
    (api as any).messages.list,
    { projectId },
    { token }
  );

  const assistantId = await fetchMutation(
    (api as any).messages.createAssistant,
    { projectId },
    { token }
  );

  try {
    if (!box.boxConfigured()) {
      throw new Error(
        "BOX_API_KEY is not configured. Add it to .env.local to enable sandbox previews."
      );
    }

    let boxId = project.boxId as string | undefined;
    if (!boxId) {
      await fetchMutation(
        (api as any).projects.setStatus,
        { projectId, status: "provisioning" },
        { token }
      );
      boxId = await box.createSandbox(project.name);
      await fetchMutation(
        (api as any).projects.setBox,
        { projectId, boxId },
        { token }
      );
    }

    await fetchMutation(
      (api as any).projects.setStatus,
      { projectId, status: "generating" },
      { token }
    );

    const me = await fetchQuery((api as any).users.me, {}, { token });

    const agent = buildSiteAgent({
      boxId,
      hasPreview: Boolean(project.previewUrl),
      customInstructions:
        typeof me?.customInstructions === "string"
          ? me.customInstructions
          : undefined,
      onStep: (step) =>
        fetchMutation(
          (api as any).messages.addStep,
          { messageId: assistantId, step },
          { token }
        ),
      onPlan: (plan) =>
        fetchMutation(
          (api as any).projects.setPlan,
          { projectId, plan },
          { token }
        ),
      onPreview: (url) =>
        fetchMutation(
          (api as any).projects.setPreview,
          { projectId, previewUrl: url },
          { token }
        ),
    });

    const convo = (history as Array<{ role: string; content: string }>)
      .filter((m) => m.content)
      .map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

    const result = await agent.generate({ messages: convo });

    await fetchMutation(
      (api as any).messages.finish,
      {
        messageId: assistantId,
        content: result.text || "Done.",
        status: "complete",
      },
      { token }
    );
    await fetchMutation(
      (api as any).projects.setStatus,
      { projectId, status: "ready" },
      { token }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await fetchMutation(
      (api as any).messages.finish,
      {
        messageId: assistantId,
        content: `Something went wrong: ${message}`,
        status: "error",
      },
      { token }
    );
    await fetchMutation(
      (api as any).projects.setError,
      { projectId, error: message },
      { token }
    );
  }
}
