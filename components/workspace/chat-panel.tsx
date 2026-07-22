"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { MessageList, type ChatMessage } from "@/components/workspace/message-list";
import { PromptComposer } from "@/components/site/prompt-composer";
import { TopUpModal } from "@/components/billing/top-up-modal";
import { Button } from "@/components/ui/button";
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
  const send = useMutation((api as any).messages.send);
  const { assertCanGenerate, refetch, balance } = useGenerationAccess();
  const [topUpOpen, setTopUpOpen] = useState(false);

  const handle = async (text: string) => {
    if (!assertCanGenerate()) {
      setTopUpOpen(true);
      return;
    }
    try {
      await send({ projectId, content: text });
      await triggerGeneration(projectId);
      await refetch();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not send message";
      if (message.toLowerCase().includes("limit reached")) {
        setTopUpOpen(true);
        return;
      }
      toast.error(message);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages ?? []} />
      <div className="border-t border-border/60 p-3">
        {typeof balance === "number" && balance <= 2 ? (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span>
              {balance === 0
                ? "No generations left."
                : `${balance} generation${balance === 1 ? "" : "s"} left.`}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7"
              onClick={() => setTopUpOpen(true)}
            >
              Top up
            </Button>
          </div>
        ) : null}
        <PromptComposer
          onSubmit={handle}
          pending={busy}
          placeholder="Ask for changes: copy, sections, colors, a blog…"
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
