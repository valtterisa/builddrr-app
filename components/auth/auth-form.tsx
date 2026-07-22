"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSite } from "@/lib/hooks/use-create-site";
import { triggerGeneration } from "@/lib/generate/trigger-generation";
import {
  DEFAULT_AGENT_MODEL_ID,
  type AgentModelId,
} from "@/lib/ai/models";
import { cn } from "@/lib/utils";

export type AuthFlow = "signIn" | "signUp";
type AuthMethod = "password" | "magic";

export type AuthFormProps = {
  flow: AuthFlow;
  pendingPrompt?: string | null;
  pendingModelId?: AgentModelId | null;
  nextPath?: string | null;
  variant?: "page" | "modal";
  className?: string;
};

function buildAuthHref(
  path: "/login" | "/sign-up",
  opts: {
    prompt?: string | null;
    nextPath?: string | null;
    modelId?: string | null;
  }
) {
  const params = new URLSearchParams();
  if (opts.prompt) params.set("prompt", opts.prompt);
  if (opts.nextPath) params.set("next", opts.nextPath);
  if (opts.modelId) params.set("modelId", opts.modelId);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

function buildMagicRedirectTo(opts: {
  prompt?: string | null;
  nextPath?: string | null;
  modelId?: AgentModelId | null;
}) {
  if (opts.prompt || opts.nextPath || opts.modelId) {
    const params = new URLSearchParams();
    if (opts.prompt) params.set("prompt", opts.prompt);
    if (opts.nextPath) params.set("next", opts.nextPath);
    if (opts.modelId) params.set("modelId", opts.modelId);
    return `/auth/continue?${params.toString()}`;
  }
  return "/dashboard";
}

export function AuthForm({
  flow,
  pendingPrompt = null,
  pendingModelId = null,
  nextPath = null,
  variant = "page",
  className,
}: AuthFormProps) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const createSite = useCreateSite();
  const [method, setMethod] = useState<AuthMethod>("password");
  const [loading, setLoading] = useState(false);
  const [magicSentTo, setMagicSentTo] = useState<string | null>(null);
  const [prompt] = useState(pendingPrompt);
  const [modelId] = useState<AgentModelId>(
    pendingModelId ?? DEFAULT_AGENT_MODEL_ID
  );

  async function finishAuthenticated() {
    if (prompt) {
      const id = await createSite({ prompt, modelId });
      await triggerGeneration(id);
      router.push(`/build/${id}`);
      return;
    }
    if (nextPath?.startsWith("/") && !nextPath.startsWith("//")) {
      router.push(nextPath);
      return;
    }
    router.push("/dashboard");
  }

  async function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("flow", flow);
    setLoading(true);
    try {
      await signIn("password", formData);
      await finishAuthenticated();
    } catch {
      toast.error("Authentication failed. Check your email and password.");
      setLoading(false);
    }
  }

  async function onMagicSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    if (!email) {
      toast.error("Enter your email address.");
      return;
    }

    setLoading(true);
    try {
      formData.set(
        "redirectTo",
        buildMagicRedirectTo({
          prompt,
          nextPath,
          modelId: pendingModelId,
        })
      );
      const result = await signIn("resend", formData);
      if (result.signingIn) {
        await finishAuthenticated();
        return;
      }
      setMagicSentTo(email);
      toast.success("Magic link sent. Check your email.");
    } catch {
      toast.error("Could not send magic link. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const isModal = variant === "modal";
  const isSignUp = flow === "signUp";
  const switchHref = buildAuthHref(isSignUp ? "/login" : "/sign-up", {
    prompt,
    nextPath,
    modelId: pendingModelId,
  });

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex flex-col",
          isModal ? "text-left" : "items-start text-left"
        )}
      >
        {!isModal ? (
          <div className="mb-6">
            <Logo />
          </div>
        ) : null}
        <h1
          className={cn(
            "font-semibold tracking-tight",
            isModal ? "text-xl" : "text-2xl md:text-3xl"
          )}
        >
          {magicSentTo
            ? "Check your email"
            : isSignUp
              ? "Create your account"
              : "Welcome back"}
        </h1>
        <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
          {magicSentTo
            ? `We sent a sign-in link to ${magicSentTo}. Open it to continue.`
            : prompt
              ? "Sign in to start building your site."
              : "Generate sites with a live preview."}
        </p>
      </div>

      {magicSentTo ? (
        <div className="mt-8 flex flex-col gap-4">
          <Button
            type="button"
            variant="brand"
            size="lg"
            className="w-full"
            onClick={() => {
              setMagicSentTo(null);
              setMethod("magic");
            }}
          >
            Use a different email
          </Button>
          <button
            type="button"
            onClick={() => {
              setMagicSentTo(null);
              setMethod("password");
            }}
            className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Use password instead
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 border border-border">
            <button
              type="button"
              onClick={() => setMethod("password")}
              className={cn(
                "cursor-pointer px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                method === "password"
                  ? "bg-foreground text-background"
                  : "bg-transparent text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMethod("magic")}
              className={cn(
                "cursor-pointer border-l border-border px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                method === "magic"
                  ? "bg-foreground text-background"
                  : "bg-transparent text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              Magic link
            </button>
          </div>

          {method === "password" ? (
            <form
              onSubmit={onPasswordSubmit}
              className="mt-6 flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@studio.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete={
                    isSignUp ? "new-password" : "current-password"
                  }
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                variant="brand"
                size="lg"
                disabled={loading}
                className="mt-1 w-full"
              >
                {loading
                  ? prompt
                    ? "Starting…"
                    : "Please wait…"
                  : isSignUp
                    ? "Create account"
                    : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onMagicSubmit} className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@studio.com"
                />
              </div>
              <Button
                type="submit"
                variant="brand"
                size="lg"
                disabled={loading}
                className="mt-1 w-full"
              >
                {loading ? "Sending…" : "Email magic link"}
              </Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                We’ll email you a one-click link. No password needed.
              </p>
            </form>
          )}
        </>
      )}

      {!magicSentTo ? (
        <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "New to Floras?"}{" "}
          <Link
            href={switchHref}
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground underline underline-offset-4 transition-colors hover:text-brand"
          >
            {isSignUp ? "Sign in" : "Create one"}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
