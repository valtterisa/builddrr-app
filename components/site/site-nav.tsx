"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { cn } from "@/lib/utils";

const navLinkClass =
  "font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground";

const ctaClass =
  "inline-flex items-center justify-center bg-brand font-mono text-[11px] uppercase tracking-[0.14em] text-brand-foreground transition-[filter] hover:brightness-110 active:scale-[0.98]";

export function SiteNav() {
  const { signOut } = useAuthActions();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onResize = () => {
      if (window.matchMedia("(min-width: 640px)").matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="relative z-50 grid h-14 grid-cols-[1fr_auto] items-stretch bg-background/90 backdrop-blur-md">
        <div className="flex items-center border-r border-border px-4 md:px-5">
          <Logo />
        </div>

        <div className="flex items-stretch">
          <ThemeToggle />

          <div className="hidden items-stretch sm:flex">
            <Unauthenticated>
              <Link
                href="/login"
                className={cn(
                  "inline-flex items-center border-r border-border px-4",
                  navLinkClass
                )}
              >
                Sign in
              </Link>
              <Link href="/sign-up" className={cn("px-4", ctaClass)}>
                Start building
              </Link>
            </Unauthenticated>
            <Authenticated>
              <Link
                href="/dashboard"
                className={cn(
                  "inline-flex items-center border-r border-border px-4",
                  navLinkClass
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/account"
                className={cn(
                  "inline-flex items-center border-r border-border px-4",
                  navLinkClass
                )}
              >
                Account
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className={cn(
                  "inline-flex cursor-pointer items-center px-4",
                  navLinkClass
                )}
              >
                Sign out
              </button>
            </Authenticated>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex cursor-pointer items-center justify-center px-4 text-muted-foreground transition-colors hover:bg-card hover:text-foreground active:scale-[0.98] sm:hidden"
          >
            {open ? (
              <X className="size-5" strokeWidth={1.5} aria-hidden />
            ) : (
              <Menu className="size-5" strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Dismiss menu"
            onClick={close}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-[2px] sm:hidden"
          />
          <div
            id={menuId}
            className="fixed inset-x-0 top-14 z-50 border-t border-b border-border bg-background sm:hidden"
          >
            <nav className="flex w-full flex-col" aria-label="Mobile">
              <Unauthenticated>
                <Link
                  href="/login"
                  onClick={close}
                  className={cn(
                    "border-b border-border px-5 py-5",
                    navLinkClass
                  )}
                >
                  Sign in
                </Link>
                <div className="p-5">
                  <Link
                    href="/sign-up"
                    onClick={close}
                    className={cn("w-full px-4 py-4", ctaClass)}
                  >
                    Start building
                  </Link>
                </div>
              </Unauthenticated>
              <Authenticated>
                <Link
                  href="/dashboard"
                  onClick={close}
                  className={cn(
                    "border-b border-border px-5 py-5",
                    navLinkClass
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/account"
                  onClick={close}
                  className={cn(
                    "border-b border-border px-5 py-5",
                    navLinkClass
                  )}
                >
                  Account
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    void signOut();
                  }}
                  className={cn(
                    "cursor-pointer px-5 py-5 text-left",
                    navLinkClass
                  )}
                >
                  Sign out
                </button>
              </Authenticated>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
