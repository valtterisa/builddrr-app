"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { toast } from "sonner";
import { useCreateSite } from "@/lib/hooks/use-create-site";
import { triggerGeneration } from "@/lib/generate/trigger-generation";
import {
  isAgentModelId,
  resolveAgentModelId,
} from "@/lib/ai/models";

function ContinueAuthenticated() {
  const router = useRouter();
  const params = useSearchParams();
  const createSite = useCreateSite();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const prompt = params.get("prompt")?.trim() ?? "";
      const nextPath = params.get("next");
      const modelParam = params.get("modelId");
      const modelId = resolveAgentModelId(
        modelParam && isAgentModelId(modelParam) ? modelParam : null
      );

      try {
        if (prompt) {
          const id = await createSite({ prompt, modelId });
          await triggerGeneration(id);
          if (!cancelled) router.replace(`/build/${id}`);
          return;
        }

        if (
          nextPath?.startsWith("/") &&
          !nextPath.startsWith("//") &&
          !cancelled
        ) {
          router.replace(nextPath);
          return;
        }

        if (!cancelled) router.replace("/dashboard");
      } catch {
        if (!cancelled) {
          setError("Could not finish signing in. Try again from the dashboard.");
          toast.error("Could not finish signing in.");
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [createSite, params, router]);

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        {error}{" "}
        <button
          type="button"
          className="underline underline-offset-4"
          onClick={() => router.replace("/dashboard")}
        >
          Go to dashboard
        </button>
      </p>
    );
  }

  return <p className="text-sm text-muted-foreground">Finishing sign-in…</p>;
}

export function AuthContinueClient() {
  const router = useRouter();

  return (
    <>
      <AuthLoading>
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </AuthLoading>
      <Unauthenticated>
        <p className="text-sm text-muted-foreground">
          Sign-in link expired or invalid.{" "}
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => router.replace("/login")}
          >
            Try again
          </button>
        </p>
      </Unauthenticated>
      <Authenticated>
        <ContinueAuthenticated />
      </Authenticated>
    </>
  );
}
