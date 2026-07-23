export type ThinkingEffort = "low" | "medium" | "high" | "xhigh";

export function anthropicThinkingOptions(effort: ThinkingEffort = "low") {
  return {
    anthropic: {
      thinking: {
        type: "adaptive" as const,
        display: "summarized" as const,
      },
      effort,
    },
  };
}
