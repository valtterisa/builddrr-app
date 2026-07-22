import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { AuthFormFromParams } from "@/components/auth/auth-form-from-params";

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <AuthFormFromParams flow="signUp" />
    </AuthPageShell>
  );
}
