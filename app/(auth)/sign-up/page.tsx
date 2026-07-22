import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthFormFromParams } from "@/components/auth/auth-form-from-params";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create a Floras account and turn one sentence into a production-ready Astro site.",
  alternates: { canonical: "/sign-up" },
};

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <AuthFormFromParams flow="signUp" />
    </AuthPageShell>
  );
}
