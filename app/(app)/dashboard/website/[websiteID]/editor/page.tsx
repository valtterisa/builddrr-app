import { createClient } from "@/lib/supabase/server";
import EditorPageClient from "@/components/editor/editor-page-client";

export default async function EditorPage({
  params,
}: {
  params: { teamID: string; websiteID: string };
}) {
  const { websiteID } = await params;

  console.log("🔍 [EditorPage] websiteID:", websiteID);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let machine: any;

  const response = await fetch(
    `${process.env.FLY_API_BASE}/v1/apps/${websiteID}/machines`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
      },
    }
  );

  const machineArray = await response.json();
  if (Array.isArray(machineArray) && machineArray.length > 0) {
    machine = machineArray[0];
  } else {
    console.error(
      "[ERROR] No machines found for app:",
      websiteID,
      machineArray
    );
  }

  return <EditorPageClient id={websiteID} user={user} machine={machine} />;
}
