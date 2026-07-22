import { Suspense, type ReactNode } from "react";
import { MarketingLayout } from "@/components/site/marketing-layout";

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <MarketingLayout>
      <div className="border-b border-border px-6 py-10 md:px-8 md:py-14">
        <div className="mx-auto w-full max-w-md border border-border bg-card/40">
          <div className="border-b border-border px-6 py-5 md:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Account
            </p>
          </div>
          <div className="px-6 py-8 md:px-8">
            <Suspense
              fallback={
                <p className="text-sm text-muted-foreground">Loading…</p>
              }
            >
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
