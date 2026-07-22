"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { MessageList, type ChatMessage } from "@/components/workspace/message-list";
import { PromptComposer } from "@/components/site/prompt-composer";
import { TopUpModal } from "@/components/billing/top-up-modal";
import { UpgradeProModal } from "@/components/billing/upgrade-pro-modal";
import { Button } from "@/components/ui/button";
import { formatCredits } from "@/lib/billing/constants";
import {
  DEFAULT_AGENT_MODEL_ID,
  resolveAgentModelId,
  type AgentModelId,
} from "@/lib/ai/models";
import { useGenerationAccess } from "@/lib/hooks/use-generation-access";
import { triggerGeneration } from "@/lib/generate/trigger-generation";

export function ChatPanel({
  projectId,
  busy,
}: {
  projectId: string;
  busy: boolean;
}) {
  const messages = useQuery((api as any).messages.list, { projectId }) as
    | ChatMessage[]
    | undefined;
  const project = useQuery((api as any).projects.get, { projectId }) as
    | { modelId?: string }
    | null
    | undefined;
  const send = useMutation((api as any).messages.send);
  const setModel = useMutation((api as any).projects.setModel);
  const { getDenyReason, refetch, balance, hasPaidPlan, billingReady } =
    useGenerationAccess();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const defaultModelId = resolveAgentModelId(project?.modelId ?? null);

  const handle = async (text: string, modelId: AgentModelId) => {
    const reason = getDenyReason();
    if (reason === "no_plan") {
      setUpgradeOpen(true);
      return;
    }
    if (reason === "no_credits") {
      setTopUpOpen(true);
      return;
    }
    try {
      await setModel({ projectId, modelId });
      await send({ projectId, content: text });
      await triggerGeneration(projectId);
      await refetch();
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "NO_PLAN") {
        setUpgradeOpen(true);
        return;
      }
      if (
        err.code === "NO_CREDITS" ||
        err.message.toLowerCase().includes("credit")
      ) {
        setTopUpOpen(true);
        return;
      }
      toast.error(err.message || "Could not send message");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages ?? []} />
      <div className="border-t border-border p-3">
        {billingReady && !hasPaidPlan ? (
          <div className="mb-2 flex items-center justify-between gap-2 border border-border bg-card/40 px-3 py-2 text-xs text-muted-foreground">
            <span>Pro plan required to chat with the AI.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 rounded-none font-mono text-[10px] uppercase tracking-[0.14em]"
              onClick={() => setUpgradeOpen(true)}
            >
              Get Pro
            </Button>
          </div>
        ) : typeof balance === "number" && balance <= 1 ? (
          <div className="mb-2 flex items-center justify-between gap-2 border border-border bg-card/40 px-3 py-2 text-xs text-muted-foreground">
            <span>
              {balance < 0.05
                ? "Out of credit."
                : `${formatCredits(balance)} credit left.`}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 rounded-none font-mono text-[10px] uppercase tracking-[0.14em]"
              onClick={() => setTopUpOpen(true)}
            >
              Top up
            </Button>
          </div>
        ) : null}
        <PromptComposer
          key={defaultModelId}
          onSubmit={handle}
          pending={busy}
          defaultModelId={
            project === undefined ? DEFAULT_AGENT_MODEL_ID : defaultModelId
          }
          placeholder="Ask for changes: copy, sections, colors, a blog…"
          submitLabel="Send"
          pendingLabel="Sending…"
        />
      </div>
      <UpgradeProModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        onPurchased={() => void refetch()}
      />
      <TopUpModal
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        onPurchased={() => void refetch()}
      />
    </div>
  );
}
