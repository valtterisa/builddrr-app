import { fetchMutation, fetchQuery } from "convex/nextjs";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { api } from "@/convex/_generated/api";
import { withAutumnModel } from "@/lib/billing/with-autumn-model";
import { resolveAgentModelId } from "@/lib/ai/models";
import { resolveStreamingAssistantId } from "@/lib/generate/resolve-assistant";
import { anthropicThinkingOptions } from "@/lib/ai/anthropic-options";

export const ASK_INSTRUCTIONS = `You are Floras — a sharp product partner that helps people figure out what website to build before they generate one.

Your job in ASK mode:
- Answer questions about site structure, sections, copy tone, audience, and visual direction
- Help refine a brief into a clear one-sentence build prompt
- Suggest concrete options when the user is stuck
- Stay concise: short paragraphs, optional bullets, no fluff

Do not claim you already built a site. Do not invent live URLs. Do not run tools or provision infrastructure. When they are ready to generate, tell them to switch to Build mode and send the brief.`;

export async function runAsk(projectId: string, token: string) {
  const project = await fetchQuery(
    (api as any).projects.get,
    { projectId },
    { token }
  );
  if (!project) return;

  const me = await fetchQuery((api as any).users.me, {}, { token });
  if (!me?.id) return;

  const history = await fetchQuery(
    (api as any).messages.list,
    { projectId },
    { token }
  );

  const convo = (
    history as Array<{ role: string; content: string; status: string }>
  )
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        m.status === "complete" &&
        m.content.trim().length > 0
    )
    .slice(-24)
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    }));

  if (convo.length === 0 || convo[convo.length - 1]?.role !== "user") {
    return;
  }

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

  const modelId = resolveAgentModelId(
    typeof project.modelId === "string" ? project.modelId : null
  );

  try {
    const result = streamText({
      model: withAutumnModel(anthropic(modelId), me.id),
      system: ASK_INSTRUCTIONS,
      messages: convo,
      providerOptions: anthropicThinkingOptions("medium"),
    });

    let full = "";
    let reasoning = "";
    let lastContentPatch = 0;
    let lastReasoningPatch = 0;

    for await (const part of result.stream) {
      if (part.type === "error") {
        const message =
          part.error instanceof Error
            ? part.error.message
            : typeof part.error === "string"
              ? part.error
              : "Ask stream failed";
        throw new Error(message);
      }
      if (part.type === "reasoning-delta") {
        reasoning += part.text;
        const now = Date.now();
        if (now - lastReasoningPatch >= 120) {
          lastReasoningPatch = now;
          await fetchMutation(
            (api as any).messages.setReasoning,
            { messageId: assistantId, reasoning },
            { token }
          );
        }
      } else if (part.type === "text-delta") {
        full += part.text;
        const now = Date.now();
        if (now - lastContentPatch >= 120) {
          lastContentPatch = now;
          await fetchMutation(
            (api as any).messages.setContent,
            { messageId: assistantId, content: full },
            { token }
          );
        }
      }
    }

    const reasoningText =
      reasoning.trim() || ((await result.reasoningText) ?? "").trim();
    if (reasoningText) {
      await fetchMutation(
        (api as any).messages.setReasoning,
        { messageId: assistantId, reasoning: reasoningText },
        { token }
      );
    }

    const finalText = full || (await result.text) || "Done.";
    await fetchMutation(
      (api as any).messages.finish,
      {
        messageId: assistantId,
        content: finalText,
        status: "complete",
      },
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
  }
}
