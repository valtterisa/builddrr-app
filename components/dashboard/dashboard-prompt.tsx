"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PromptComposer } from "@/components/site/prompt-composer";
import { useCreateSite } from "@/lib/hooks/use-create-site";
import { triggerGeneration } from "@/lib/generate/trigger-generation";
import type { AgentModelId } from "@/lib/ai/models";

export function DashboardPrompt() {
  const router = useRouter();
  const createSite = useCreateSite();
  const [pending, setPending] = useState(false);

  const handle = async (text: string, modelId: AgentModelId) => {
    setPending(true);
    try {
      const id = await createSite({ prompt: text, modelId });
      await triggerGeneration(id);
      router.push(`/build/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start generation");
      setPending(false);
    }
  };

  return (
    <section className="border-b border-border">
      <div className="border-b border-border px-6 py-8 md:px-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          What are we building today?
        </h1>
        <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
          Describe a site and Builddrr generates it in a live sandbox.
        </p>
      </div>
      <div className="px-6 py-8 md:px-8 md:py-10">
        <div className="mx-auto w-full max-w-2xl">
          <PromptComposer onSubmit={handle} pending={pending} autoFocus />
        </div>
      </div>
    </section>
  );
}
