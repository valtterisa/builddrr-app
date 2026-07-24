"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { Menu } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import type { DashboardProject } from "@/components/dashboard/types";
import { cn } from "@/lib/utils";

type DashboardChromeValue = {
  resetKey: number;
  onNewChat: () => void;
};

const DashboardChromeContext = createContext<DashboardChromeValue | null>(null);

export function useDashboardChrome(): DashboardChromeValue {
  const value = useContext(DashboardChromeContext);
  if (!value) {
    throw new Error("useDashboardChrome must be used within DashboardShell");
  }
  return value;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const projects = useQuery(api.projects.list, {}) as
    | DashboardProject[]
    | undefined;
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const onNewChat = useCallback(() => {
    setResetKey((k) => k + 1);
    setMobileOpen(false);
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  }, [pathname, router]);

  const chrome = useMemo(
    () => ({ resetKey, onNewChat }),
    [resetKey, onNewChat]
  );

  return (
    <DashboardChromeContext.Provider value={chrome}>
      <div className="flex h-[100dvh] overflow-hidden bg-background">
        <div className="hidden h-full md:flex">
          <DashboardSidebar
            projects={projects}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((v) => !v)}
            onNewChat={onNewChat}
          />
        </div>

        <div
          className={cn(
            "fixed inset-0 z-50 bg-background/70 backdrop-blur-sm md:hidden",
            mobileOpen ? "block" : "hidden"
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 h-full md:hidden",
            "transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <DashboardSidebar
            projects={projects}
            collapsed={false}
            onToggleCollapsed={() => setMobileOpen(false)}
            onNewChat={onNewChat}
          />
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="flex h-14 items-center border-b border-border px-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-9 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <span className="ml-2 text-sm font-medium">Floras</span>
          </div>

          <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardChromeContext.Provider>
  );
}
