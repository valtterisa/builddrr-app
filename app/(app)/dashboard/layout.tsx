import { ReactNode } from "react";
import { DashboardShell } from "@/components/editor/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
