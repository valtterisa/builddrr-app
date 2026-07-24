import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { asMessageId, asProjectId } from "@/lib/convex/ids";
import { buildSiteAgent } from "@/lib/ai/agent";
import { resolveAgentModelId } from "@/lib/ai/models";
import * as box from "@/lib/box/client";
import { resolveStreamingAssistantId } from "@/lib/generate/resolve-assistant";
import { AppError } from "@/lib/errors";
import type { SitePlan } from "@/lib/schema/site";

export async function runGeneration(projectId: string, token: string) {
  const pid = asProjectId(projectId);
  const project = await fetchQuery(
    api.projects.get,
    { projectId: pid },
    { token }
  );
  if (!project) return;

  const claimed = await fetchMutation(
    api.projects.claimGeneration,
    { projectId: pid },
    { token }
  );
  if (!claimed) return;

  const history = await fetchQuery(
    api.messages.list,
    { projectId: pid },
    { token }
  );

  const existingId = resolveStreamingAssistantId(
    history as Array<{ _id: string; role: string; status: string }>
  );
  const assistantId =
    existingId ??
    (await fetchMutation(
      api.messages.createAssistant,
      { projectId: pid },
      { token }
    ));

  try {
    if (!box.boxConfigured()) {
      throw new AppError("config");
    }

    let boxId = project.boxId as string | undefined;
    if (!boxId) {
      await fetchMutation(
        api.projects.setStatus,
        { projectId: pid, status: "provisioning" },
        { token }
      );
      const created = await box.createSandbox(project.name);
      boxId = created.boxId;
      await fetchMutation(
        api.projects.setBox,
        {
          projectId: pid,
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
          api.projects.setBox,
          { projectId: pid, boxId, boxSubdomain: subdomain },
          { token }
        );
      }
    }

    await fetchMutation(
      api.projects.setStatus,
      { projectId: pid, status: "generating" },
      { token }
    );

    const me = await fetchQuery(api.users.me, {}, { token });
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
      onStep: async (step) => {
        await fetchMutation(
          api.messages.addStep,
          { messageId: asMessageId(assistantId), step },
          { token }
        );
      },
      onPlan: async (plan) => {
        await fetchMutation(
          api.projects.setPlan,
          { projectId: pid, plan },
          { token }
        );
      },
      onPreview: async (url) => {
        await fetchMutation(
          api.projects.setPreview,
          { projectId: pid, previewUrl: url },
          { token }
        );
      },
    });

    const convo = (
      history as Array<{ role: string; content: string; status: string }>
    )
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          m.status === "complete" &&
          m.content.trim().length > 0
      )
      .map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

    const result = await agent.generate({ messages: convo });

    const reasoningText =
      typeof result.reasoningText === "string" ? result.reasoningText.trim() : "";
    if (reasoningText) {
      await fetchMutation(
        api.messages.setReasoning,
        { messageId: asMessageId(assistantId), reasoning: reasoningText },
        { token }
      );
    }

    await fetchMutation(
      api.messages.finish,
      {
        messageId: asMessageId(assistantId),
        content: result.text || "Done.",
        status: "complete",
      },
      { token }
    );
    await fetchMutation(
      api.projects.setStatus,
      { projectId: pid, status: "ready" },
      { token }
    );
  } catch (err) {
    const error = AppError.from(err);
    console.error("Generation failed:", error.detail);
    await fetchMutation(
      api.messages.finish,
      {
        messageId: asMessageId(assistantId),
        content: error.message,
        status: "error",
      },
      { token }
    );
    await fetchMutation(
      api.projects.setError,
      { projectId: pid, error: error.message },
      { token }
    );
  }
}
