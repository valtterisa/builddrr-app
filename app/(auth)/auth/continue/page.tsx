import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthContinueClient } from "@/components/auth/auth-continue-client";

export default function AuthContinuePage() {
  return (
    <AuthPageShell>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Signing you in
        </h1>
        <AuthContinueClient />
      </div>
    </AuthPageShell>
  );
}
