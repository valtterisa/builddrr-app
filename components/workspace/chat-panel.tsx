"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { MessageList, type ChatMessage } from "@/components/workspace/message-list";
import { PromptComposer } from "@/components/site/prompt-composer";
import { TopUpModal } from "@/components/billing/top-up-modal";
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
  const { assertCanGenerate, refetch, balance } = useGenerationAccess();
  const [topUpOpen, setTopUpOpen] = useState(false);

  const defaultModelId = resolveAgentModelId(project?.modelId ?? null);

  const handle = async (text: string, modelId: AgentModelId) => {
    if (!assertCanGenerate()) {
      setTopUpOpen(true);
      return;
    }
    try {
      await setModel({ projectId, modelId });
      await send({ projectId, content: text });
      await triggerGeneration(projectId);
      await refetch();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not send message";
      if (
        message.toLowerCase().includes("limit reached") ||
        message.toLowerCase().includes("credit")
      ) {
        setTopUpOpen(true);
        return;
      }
      toast.error(message);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages ?? []} />
      <div className="border-t border-border p-3">
        {typeof balance === "number" && balance <= 1 ? (
          <div className="mb-2 flex items-center justify-between gap-2 border border-border bg-card/40 px-3 py-2 text-xs text-muted-foreground">
            <span>
              {balance < 0.05
                ? "AI credits depleted."
                : `${formatCredits(balance)} AI credits left.`}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 font-mono text-[10px] uppercase tracking-[0.14em]"
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
      <TopUpModal
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        onPurchased={() => {
          void refetch();
        }}
      />
    </div>
  );
}
