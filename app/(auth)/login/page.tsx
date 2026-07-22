import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthFormFromParams } from "@/components/auth/auth-form-from-params";

export default function LoginPage() {
  return (
    <AuthPageShell>
      <AuthFormFromParams flow="signIn" />
    </AuthPageShell>
  );
}
