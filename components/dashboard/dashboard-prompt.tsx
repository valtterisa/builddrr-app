"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/page-header";
import { PromptComposer } from "@/components/site/prompt-composer";
import { useCreateSite } from "@/lib/hooks/use-create-site";
import { triggerGeneration } from "@/lib/generate/trigger-generation";

export function DashboardPrompt() {
  const router = useRouter();
  const createSite = useCreateSite();
  const [pending, setPending] = useState(false);

  const handle = async (text: string) => {
    setPending(true);
    try {
      const id = await createSite({ prompt: text });
      await triggerGeneration(id);
      router.push(`/build/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start generation");
      setPending(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="What are we building today?"
        description="Describe a site and Builddrr generates it in a live sandbox."
        size="section"
      />
      <div className="mt-8">
        <PromptComposer onSubmit={handle} pending={pending} autoFocus />
      </div>
    </div>
  );
}
