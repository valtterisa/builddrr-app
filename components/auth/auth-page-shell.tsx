import { Suspense, type ReactNode } from "react";
import { MarketingLayout } from "@/components/site/marketing-layout";

function AuthFloralPanel() {
  return (
    <div
      aria-hidden
      className="relative hidden min-h-[28rem] overflow-hidden border-b border-border bg-[color-mix(in_srgb,var(--atmosphere)_88%,var(--brand)_12%)] md:block md:min-h-full md:border-b-0 md:border-r"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 45% 55%, var(--atmosphere-spot), transparent 70%)",
        }}
      />
      <img
        src="/brand/logo-mark.png"
        alt=""
        draggable={false}
        className="absolute left-1/2 top-1/2 h-[55%] w-auto max-w-[70%] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-sm"
      />
    </div>
  );
}

function AuthFloralMobile() {
  return (
    <div
      aria-hidden
      className="relative flex h-40 items-center justify-center overflow-hidden border-b border-border bg-[color-mix(in_srgb,var(--atmosphere)_88%,var(--brand)_12%)] md:hidden"
    >
      <img
        src="/brand/logo-mark.png"
        alt=""
        draggable={false}
        className="relative z-[1] h-[70%] w-auto object-contain"
      />
    </div>
  );
}

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <MarketingLayout>
      <div className="flex flex-1 flex-col border-b border-border">
        <AuthFloralMobile />
        <div className="grid flex-1 md:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,28rem)]">
          <AuthFloralPanel />
          <div className="flex flex-col justify-center bg-card/40 px-6 py-10 md:px-8 md:py-14">
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
