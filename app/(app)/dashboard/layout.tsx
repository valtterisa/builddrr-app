import { ReactNode } from "react";
import { DashboardShell } from "@/components/editor/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
