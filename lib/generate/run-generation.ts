import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { buildSiteAgent } from "@/lib/ai/agent";
import { resolveAgentModelId } from "@/lib/ai/models";
import * as box from "@/lib/box/client";
import { resolveStreamingAssistantId } from "@/lib/generate/resolve-assistant";
import { AppError } from "@/lib/errors";
import type { SitePlan } from "@/lib/schema/site";

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

  const existingId = resolveStreamingAssistantId(
    history as Array<{ _id: string; role: string; status: string }>
  );
  const assistantId =
    existingId ??
    (await fetchMutation(
      (api as any).messages.createAssistant,
      { projectId },
      { token }
    ));

  try {
    if (!box.boxConfigured()) {
      throw new AppError("config");
    }

    let boxId = project.boxId as string | undefined;
    if (!boxId) {
      await fetchMutation(
        (api as any).projects.setStatus,
        { projectId, status: "provisioning" },
        { token }
      );
      const created = await box.createSandbox(project.name);
      boxId = created.boxId;
      await fetchMutation(
        (api as any).projects.setBox,
        {
          projectId,
          boxId: created.boxId,
          boxSubdomain: created.subdomain,
        },
        { token }
      );
    } else {
      await box.ensureBoxReady(boxId);
      if (
        typeof project.boxSubdomain !== "string" ||
        !project.boxSubdomain.trim()
      ) {
        const subdomain = await box.getBoxSubdomain(boxId);
        await fetchMutation(
          (api as any).projects.setBox,
          { projectId, boxId, boxSubdomain: subdomain },
          { token }
        );
      }
    }

    await fetchMutation(
      (api as any).projects.setStatus,
      { projectId, status: "generating" },
      { token }
    );

    const me = await fetchQuery((api as any).users.me, {}, { token });
    const modelId = resolveAgentModelId(
      typeof project.modelId === "string" ? project.modelId : null
    );
    const previewUrl =
      typeof project.previewUrl === "string" ? project.previewUrl : null;
    const sitePlan =
      project.plan && typeof project.plan === "object"
        ? (project.plan as SitePlan)
        : null;

    const agent = buildSiteAgent({
      boxId,
      projectId,
      token,
      modelId,
      customerId: typeof me?.id === "string" ? me.id : undefined,
      hasPreview: Boolean(previewUrl),
      previewUrl,
      sitePlan,
      projectName: typeof project.name === "string" ? project.name : undefined,
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

    const reasoningText =
      typeof result.reasoningText === "string" ? result.reasoningText.trim() : "";
    if (reasoningText) {
      await fetchMutation(
        (api as any).messages.setReasoning,
        { messageId: assistantId, reasoning: reasoningText },
        { token }
      );
    }

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
    const error = AppError.from(err);
    console.error("Generation failed:", error.detail);
    await fetchMutation(
      (api as any).messages.finish,
      {
        messageId: assistantId,
        content: error.message,
        status: "error",
      },
      { token }
    );
    await fetchMutation(
      (api as any).projects.setError,
      { projectId, error: error.message },
      { token }
    );
  }
}
