import type { ReactNode } from "react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { MarketingAtmosphere } from "@/components/site/marketing-atmosphere";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="astro-shell relative min-h-[100dvh] bg-transparent">
      <MarketingAtmosphere />
      <div className="relative z-0 flex min-h-[100dvh] flex-col border-b border-border">
        <div className="relative mx-auto flex w-full min-h-[100dvh] max-w-6xl flex-1 flex-col border-x border-border bg-background/80 dark:bg-background/85">
          <SiteNav />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}
