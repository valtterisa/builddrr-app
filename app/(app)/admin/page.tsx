import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

const ADMIN_EMAIL = "savonen.emppu@gmail.com";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const serviceSupabase = await createServiceClient();

  // Fetch website count using service client to bypass RLS
  const { count: websiteCount, error: websiteError } = await serviceSupabase
    .from("websites")
    .select("*", { count: "exact", head: true });

  if (websiteError) {
    console.error("Error fetching website count:", websiteError);
  }

  // Fetch ALL preview environments using service client to bypass RLS
  const { data: previewEnvironments, error: previewError } =
    await serviceSupabase.from("preview_environments").select("*");

  if (previewError) {
    console.error("Error fetching preview environments:", previewError);
  }

  return (
    <AdminClient
      websiteCount={websiteCount || 0}
      previewEnvironments={previewEnvironments || []}
    />
  );
}
