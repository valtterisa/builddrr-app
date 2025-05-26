import { getWebsitesForUser, Website } from "@/lib/database";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "../../../components/editor/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  let websites: Website[] = [];
  let error: string | null = null;

  if (userError || !user) {
    error = userError?.message || "User not authenticated";
  } else {
    try {
      websites = await getWebsitesForUser(user.id);
    } catch (err) {
      error =
        typeof err === "string"
          ? err
          : err && typeof err === "object" && "message" in err
            ? (err as any).message
            : "Failed to fetch websites";
    }
  }

  return <DashboardClient websites={websites} error={error} />;
}
