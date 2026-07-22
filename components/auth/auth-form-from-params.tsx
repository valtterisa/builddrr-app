"use client";

import { useSearchParams } from "next/navigation";
import { AuthForm, type AuthFlow } from "@/components/auth/auth-form";
import {
  isAgentModelId,
  type AgentModelId,
} from "@/lib/ai/models";

export function AuthFormFromParams({ flow }: { flow: AuthFlow }) {
  const params = useSearchParams();
  const modelParam = params.get("modelId");
  const pendingModelId: AgentModelId | null =
    modelParam && isAgentModelId(modelParam) ? modelParam : null;

  return (
    <AuthForm
      flow={flow}
      pendingPrompt={params.get("prompt")}
      pendingModelId={pendingModelId}
      nextPath={params.get("next")}
    />
  );
}
