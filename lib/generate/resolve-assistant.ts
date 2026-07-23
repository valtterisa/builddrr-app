import type { Id } from "@/convex/_generated/dataModel";

type HistoryMessage = {
  _id: string;
  role: string;
  status: string;
};

export function resolveStreamingAssistantId(
  history: HistoryMessage[]
): Id<"messages"> | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const message = history[i];
    if (message?.role === "assistant" && message.status === "streaming") {
      return message._id as Id<"messages">;
    }
  }
  return null;
}
