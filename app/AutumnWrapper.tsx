"use client";

import { AutumnProvider } from "autumn-js/react";
import type { ReactNode } from "react";

export function AutumnWrapper({ children }: { children: ReactNode }) {
  return (
    <AutumnProvider includeCredentials>{children}</AutumnProvider>
  );
}
