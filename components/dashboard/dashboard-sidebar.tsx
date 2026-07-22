"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import {
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Search,
  Settings,
  SquarePen,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCredits } from "@/lib/billing/constants";
import { useGenerationAccess } from "@/lib/hooks/use-generation-access";
import { cn } from "@/lib/utils";
import type { DashboardProject } from "@/components/dashboard/types";

type Me = {
  id: string;
  name: string;
  email: string;
};

export function DashboardSidebar({
  projects,
  collapsed,
  onToggleCollapsed,
  onNewChat,
}: {
  projects: DashboardProject[] | undefined;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNewChat: () => void;
}) {
  const { signOut } = useAuthActions();
  const me = useQuery((api as any).users.me, {}) as Me | null | undefined;
  const { balance, hasPaidPlan, billingReady } = useGenerationAccess();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!projects) return undefined;
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, query]);

  const displayName = me?.name?.trim() || me?.email?.split("@")[0] || "Account";
  const initials = displayName.slice(0, 2).toUpperCase();
  const creditLabel = formatCredits(balance);

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[56px]" : "w-[260px]"
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "justify-between gap-2 px-3"
        )}
      >
        {!collapsed ? <Logo href="/dashboard" className="text-[16px]" /> : null}
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="inline-flex size-8 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>

      <div className={cn("flex flex-col gap-1 border-b border-sidebar-border p-2", collapsed && "items-center")}>
        <button
          type="button"
          onClick={onNewChat}
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-2 bg-foreground px-3 text-sm font-medium text-background transition-[filter] hover:brightness-110 active:scale-[0.98]",
            collapsed ? "size-9 justify-center px-0" : "w-full"
          )}
          aria-label="New chat"
        >
          <SquarePen className="size-4 shrink-0" />
          {!collapsed ? <span>New chat</span> : null}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {!collapsed ? (
          <div className="px-3 pt-3 pb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Recent chats
            </p>
            <label htmlFor="dashboard-chat-search" className="sr-only">
              Search chats
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="dashboard-chat-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="h-8 w-full border border-border bg-background pr-3 pl-8 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
        ) : null}

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2" aria-label="Recent chats">
          {filtered === undefined ? (
            <p
              className={cn(
                "px-2 py-3 text-sm text-muted-foreground",
                collapsed && "sr-only"
              )}
            >
              Loading…
            </p>
          ) : filtered.length === 0 ? (
            <p
              className={cn(
                "px-2 py-3 text-sm text-muted-foreground",
                collapsed && "sr-only"
              )}
            >
              {query ? "No matches" : "No chats yet"}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {filtered.map((project) => (
                <li key={project._id}>
                  <Link
                    href={`/build/${project._id}`}
                    title={project.name}
                    className={cn(
                      "group flex items-center gap-2 px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <MessageSquare className="size-3.5 shrink-0 opacity-60" />
                    {!collapsed ? (
                      <span className="truncate">{project.name}</span>
                    ) : (
                      <span className="sr-only">{project.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>

      <div className="mt-auto border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 px-2 py-2 text-left transition-colors hover:bg-sidebar-accent",
                collapsed && "justify-center px-0"
              )}
            >
              <Avatar className="size-7 rounded-none">
                <AvatarFallback className="rounded-none bg-muted font-mono text-[10px] tracking-wide text-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed ? (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {displayName}
                  </span>
                  {hasPaidPlan && balance != null ? (
                    <span className="shrink-0 border border-border px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                      {creditLabel}
                    </span>
                  ) : null}
                </>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed ? "center" : "start"}
            side="top"
            className="w-56 rounded-none"
          >
            <DropdownMenuLabel className="px-2 py-2 font-normal">
              <p className="truncate text-sm font-medium text-foreground">
                {displayName}
              </p>
              <p className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
                {!billingReady
                  ? "…"
                  : !hasPaidPlan
                    ? "No Pro plan"
                    : `${creditLabel} credit`}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/account" className="cursor-pointer gap-2">
                <Settings className="size-4" />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => void signOut()}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
