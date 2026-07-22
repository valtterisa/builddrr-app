import Resend from "@auth/core/providers/resend";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password,
    Resend({
      from: process.env.AUTH_EMAIL_FROM ?? "Floras <onboarding@resend.dev>",
    }),
  ],
});
