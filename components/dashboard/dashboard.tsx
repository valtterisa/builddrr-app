"use client";

import { Suspense } from "react";
import { DashboardPrompt } from "@/components/dashboard/dashboard-prompt";
import { useDashboardChrome } from "@/components/dashboard/dashboard-shell";

export function Dashboard() {
  const { resetKey } = useDashboardChrome();
  return (
    <Suspense fallback={null}>
      <DashboardPrompt resetKey={resetKey} />
    </Suspense>
  );
}
