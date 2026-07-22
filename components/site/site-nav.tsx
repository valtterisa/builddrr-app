"use client";

import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";

export function SiteNav() {
  const { signOut } = useAuthActions();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="grid h-14 grid-cols-[1fr_auto] items-stretch">
        <div className="flex items-center border-r border-border px-5">
          <Logo />
        </div>

        <div className="flex items-stretch">
          <ThemeToggle />
          <Unauthenticated>
            <Link
              href="/login"
              className="hidden items-center border-r border-border px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center bg-brand px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-foreground transition-[filter] hover:brightness-110 active:scale-[0.98]"
            >
              Start building
            </Link>
          </Unauthenticated>
          <Authenticated>
            <Link
              href="/dashboard"
              className="inline-flex items-center border-r border-border px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/account"
              className="hidden items-center border-r border-border px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground sm:inline-flex"
            >
              Account
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex cursor-pointer items-center px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              Sign out
            </button>
          </Authenticated>
        </div>
      </div>
    </header>
  );
}
