"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { THEME_STORAGE_KEY, type AppTheme } from "@/lib/theme";

export function ThemeProviderWrapper({
  children,
  defaultTheme,
}: {
  children: ReactNode;
  defaultTheme: AppTheme;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
