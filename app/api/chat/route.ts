import { type ChatUIMessage } from "@/components/chat/types";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "ai";
import { tools } from "@/lib/ai/tools";
import prompt from "./prompt.md";
import { anthropic } from "@ai-sdk/anthropic";
import { checkRemainingChatUsage, trackAICall } from "@/lib/ai-usage-tracker";

export async function POST(req: Request) {
  const { messages, appName } = await req.json();
  try {
  } catch (_) {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Enforce usage limits before invoking the model
  const { hasRemainingUsage } = await checkRemainingChatUsage();
  if (!hasRemainingUsage) {
    return new Response(
      JSON.stringify({ error: "AI usage limit reached for your plan." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // best-effort usage tracking (don’t block response)
  trackAICall().catch(() => {});

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      originalMessages: messages,
      execute: ({ writer }) => {
        const result = streamText({
          model: anthropic("claude-sonnet-4-20250514"),
          system: prompt,
          messages: convertToModelMessages(
            messages.map((message: ChatUIMessage) => {
              message.parts = message.parts.map((part: any) => {
                if (part.type === "data-report-errors") {
                  return {
                    type: "text",
                    text:
                      `There are errors in the generated code. This is the summary of the errors we have:\n` +
                      `\`\`\`${part.data.summary}\`\`\`\n` +
                      (part.data.paths?.length
                        ? `The following files may contain errors:\n` +
                          `\`\`\`${part.data.paths?.join("\n")}\`\`\`\n`
                        : "") +
                      `Fix the errors reported.`,
                  };
                }
                return part;
              });
              return message;
            })
          ),
          stopWhen: stepCountIs(5),
          tools: tools({ writer, appName }),
          onError: (error) => {
            console.error("[/api/chat] AI error", error);
          },
        });
        result.consumeStream();
        writer.merge(
          result.toUIMessageStream({
            sendReasoning: true,
            sendStart: false,
            messageMetadata: () => ({
              model: "claude-sonnet-4-20250514",
            }),
          })
        );
      },
    }),
  });
}
