"use client";

import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthModal } from "@/components/auth/auth-modal";
import { PromptComposer } from "@/components/site/prompt-composer";
import { useCreateSite } from "@/lib/hooks/use-create-site";
import { useGenerationAccess } from "@/lib/hooks/use-generation-access";
import { triggerGeneration } from "@/lib/generate/trigger-generation";

const SUGGESTIONS = [
  "A landing page for a solar-panel installer",
  "A minimal portfolio for a product designer",
  "A launch page with a blog for an indie coffee roaster",
  "A waitlist page for a developer tool",
];

export function LandingComposer() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const createSite = useCreateSite();
  const { assertCanGenerate, refetch } = useGenerationAccess();
  const [pending, setPending] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const startGeneration = async (text: string) => {
    if (!assertCanGenerate()) {
      toast.error("Generation limit reached. Upgrade your plan to continue.");
      return;
    }
    setPending(true);
    try {
      const id = await createSite({ prompt: text });
      await triggerGeneration(id);
      await refetch();
      router.push(`/build/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start generation");
      setPending(false);
    }
  };

  const handle = async (text: string) => {
    if (!isAuthenticated) {
      setPendingPrompt(text);
      setAuthOpen(true);
      return false;
    }
    await startGeneration(text);
  };

  return (
    <>
      <PromptComposer
        onSubmit={handle}
        suggestions={SUGGESTIONS}
        pending={pending}
        autoFocus
      />
      <AuthModal
        open={authOpen}
        onOpenChange={(open) => {
          setAuthOpen(open);
          if (!open) setPendingPrompt(null);
        }}
        prompt={pendingPrompt}
      />
    </>
  );
}
