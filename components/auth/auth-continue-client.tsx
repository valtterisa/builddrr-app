"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

function ContinueAuthenticated() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const prompt = params.get("prompt")?.trim() ?? "";
    const nextPath = params.get("next");

    if (prompt) {
      router.replace(`/dashboard?prompt=${encodeURIComponent(prompt)}`);
      return;
    }

    if (nextPath?.startsWith("/") && !nextPath.startsWith("//")) {
      router.replace(nextPath);
      return;
    }

    router.replace("/dashboard");
  }, [params, router]);

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
