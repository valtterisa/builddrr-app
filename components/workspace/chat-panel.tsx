"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { asMessageId, asProjectId } from "@/lib/convex/ids";
import { toast } from "sonner";
import { MessageList, type ChatMessage } from "@/components/workspace/message-list";
import {
  PromptComposer,
  type ComposerMode,
} from "@/components/site/prompt-composer";
import {
  BillingGateModals,
  useBillingGates,
} from "@/components/billing/billing-gates";
import { Button } from "@/components/ui/button";
import { formatCredits } from "@/lib/billing/constants";
import {
  DEFAULT_AGENT_MODEL_ID,
  resolveAgentModelId,
  type AgentModelId,
} from "@/lib/ai/models";
import { triggerAsk, triggerGeneration } from "@/lib/generate/trigger-api";
import { errorCode, userFacingError } from "@/lib/errors";

function ChatBillingBanner({
  billingReady,
  hasPaidPlan,
  balance,
  onUpgrade,
  onTopUp,
}: {
  billingReady: boolean;
  hasPaidPlan: boolean;
  balance: number | null;
  onUpgrade: () => void;
  onTopUp: () => void;
}) {
  if (billingReady && !hasPaidPlan) {
    return (
      <div className="mb-2 flex items-center justify-between gap-2 border border-border bg-card/40 px-3 py-2 text-xs text-muted-foreground">
        <span>Pro plan required to chat with the AI.</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 rounded-none font-mono text-[10px] uppercase tracking-[0.14em]"
          onClick={onUpgrade}
        >
          Get Pro
        </Button>
      </div>
    );
  }
  if (typeof balance === "number" && balance <= 1) {
    return (
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
          onClick={onTopUp}
        >
          Top up
        </Button>
      </div>
    );
  }
  return null;
}

export function ChatPanel({
  projectId,
  project,
  busy,
  defaultMode = "build",
}: {
  projectId: string;
  project?: {
    modelId?: string;
    previewUrl?: string;
    busyAt?: number;
  } | null;
  busy: boolean;
  defaultMode?: ComposerMode;
}) {
  const pid = asProjectId(projectId);
  const messages = useQuery(api.messages.list, { projectId: pid }) as
    | ChatMessage[]
    | undefined;
  const send = useMutation(api.messages.send);
  const setModel = useMutation(api.projects.setModel);
  const abandonTurn = useMutation(api.messages.abandonStreamingTurn);
  const resetBusy = useMutation(api.projects.resetBusy);
  const gates = useBillingGates();
  const [mode, setMode] = useState<ComposerMode>(defaultMode);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const defaultModelId = resolveAgentModelId(project?.modelId ?? null);
  const streaming = (messages ?? []).some((m) => m.status === "streaming");
  const pending = busy || streaming || submitting;
  const stuckMs =
    typeof project?.busyAt === "number" ? Date.now() - project.busyAt : 0;
  const showReset = busy && stuckMs > 2 * 60 * 1000;

  useEffect(() => {
    if (streaming) setSubmitting(false);
  }, [streaming]);

  const handle = async (
    text: string,
    modelId: AgentModelId,
    nextMode: ComposerMode
  ): Promise<boolean> => {
    if (!gates.allowOrPrompt()) return false;

    setSubmitting(true);
    let assistantId: string | undefined;
    try {
      await setModel({ projectId: pid, modelId });
      const sent = (await send({ projectId: pid, content: text, modelId })) as {
        assistantId: string;
      };
      assistantId = sent.assistantId;
      if (nextMode === "ask") {
        await triggerAsk(projectId);
      } else {
        await triggerGeneration(projectId);
      }
      void gates.refetch();
      return true;
    } catch (e) {
      if (assistantId) {
        try {
          await abandonTurn({ messageId: asMessageId(assistantId) });
        } catch {
        }
      }
      setSubmitting(false);
      if (gates.handleDenyCode(errorCode(e))) return false;
      toast.error(userFacingError(e, "Could not send message"));
      return false;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages ?? []} />
      <div className="border-t border-border p-3">
        {showReset ? (
          <div className="mb-2 flex items-center justify-between gap-2 border border-border bg-card/40 px-3 py-2 text-xs text-muted-foreground">
            <span>Looks stuck. Reset so you can try again.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={resetting}
              className="h-7 rounded-none font-mono text-[10px] uppercase tracking-[0.14em]"
              onClick={async () => {
                setResetting(true);
                try {
                  await resetBusy({ projectId: pid });
                  toast.success("Reset. You can send again.");
                } catch (e) {
                  toast.error(userFacingError(e, "Could not reset"));
                } finally {
                  setResetting(false);
                }
              }}
            >
              {resetting ? "Resetting…" : "Reset"}
            </Button>
          </div>
        ) : null}
        <ChatBillingBanner
          billingReady={gates.billingReady}
          hasPaidPlan={gates.hasPaidPlan}
          balance={gates.balance}
          onUpgrade={gates.openUpgrade}
          onTopUp={gates.openTopUp}
        />
        <PromptComposer
          key={defaultModelId}
          onSubmit={handle}
          pending={pending}
          mode={mode}
          onModeChange={setMode}
          defaultMode={defaultMode}
          defaultModelId={
            project === undefined ? DEFAULT_AGENT_MODEL_ID : defaultModelId
          }
        />
      </div>
      <BillingGateModals
        upgradeOpen={gates.upgradeOpen}
        topUpOpen={gates.topUpOpen}
        onUpgradeOpenChange={gates.setUpgradeOpen}
        onTopUpOpenChange={gates.setTopUpOpen}
        onPurchased={() => void gates.refetch()}
      />
    </div>
  );
}
