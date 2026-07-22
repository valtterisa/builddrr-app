"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthForm, type AuthFlow } from "@/components/auth/auth-form";
import type { AgentModelId } from "@/lib/ai/models";

export type AuthModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: string | null;
  modelId?: AgentModelId | null;
  flow?: AuthFlow;
};

export function AuthModal({
  open,
  onOpenChange,
  prompt = null,
  modelId = null,
  flow = "signUp",
}: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="gap-1 border-b border-border px-6 py-5 pr-12 text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Account
          </p>
          <DialogTitle className="sr-only">
            {flow === "signUp" ? "Create an account" : "Sign in to continue"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {prompt
              ? "Create an account or sign in to start generating your site."
              : "Create an account or sign in to continue."}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-6">
          <AuthForm
            key={`${flow}-${prompt ?? "auth"}-${modelId ?? "default"}`}
            flow={flow}
            pendingPrompt={prompt}
            pendingModelId={modelId}
            variant="modal"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
