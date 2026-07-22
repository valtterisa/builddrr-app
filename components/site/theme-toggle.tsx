"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { setThemeCookie, type AppTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active: AppTheme =
    mounted && resolvedTheme === "dark" ? "dark" : "light";

  const select = (theme: AppTheme) => {
    setThemeCookie(theme);
    setTheme(theme);
  };

  return (
    <div className="flex h-full items-center border-r border-border px-2.5">
      <div
        role="group"
        aria-label="Color theme"
        className="inline-flex h-8 border border-border"
      >
        <button
          type="button"
          aria-label="Switch to light mode"
          aria-pressed={active === "light"}
          onClick={() => select("light")}
          className={cn(
            "inline-flex h-full cursor-pointer items-center gap-1.5 px-2.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
            active === "light"
              ? "bg-[#0d0f14] text-white"
              : "bg-white text-[#0d0f14]/55 hover:text-[#0d0f14]"
          )}
        >
          <Sun className="size-3.5 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Light</span>
        </button>
        <button
          type="button"
          aria-label="Switch to dark mode"
          aria-pressed={active === "dark"}
          onClick={() => select("dark")}
          className={cn(
            "inline-flex h-full cursor-pointer items-center gap-1.5 border-l border-border px-2.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
            active === "dark"
              ? "bg-[#0d0f14] text-white"
              : "bg-white text-[#0d0f14]/55 hover:text-[#0d0f14]"
          )}
        >
          <Moon className="size-3.5 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Dark</span>
        </button>
      </div>
    </div>
  );
}
