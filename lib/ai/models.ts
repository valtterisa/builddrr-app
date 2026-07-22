export const AGENT_MODELS = [
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    hint: "Fast · balanced",
    provider: "anthropic" as const,
  },
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    hint: "Strong · agents",
    provider: "anthropic" as const,
  },
  {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    hint: "Max · long-horizon",
    provider: "anthropic" as const,
  },
] as const;

export type AgentModelId = (typeof AGENT_MODELS)[number]["id"];

export const DEFAULT_AGENT_MODEL_ID: AgentModelId = "claude-sonnet-5";

export function getAgentModel(id: AgentModelId) {
  return AGENT_MODELS.find((model) => model.id === id) ?? AGENT_MODELS[0];
}

export function isAgentModelId(value: string | undefined | null): value is AgentModelId {
  return AGENT_MODELS.some((model) => model.id === value);
}

export function resolveAgentModelId(
  value: string | undefined | null
): AgentModelId {
  if (isAgentModelId(value)) return value;
  const fromEnv = process.env.AGENT_MODEL?.trim();
  if (isAgentModelId(fromEnv)) return fromEnv;
  return DEFAULT_AGENT_MODEL_ID;
}
