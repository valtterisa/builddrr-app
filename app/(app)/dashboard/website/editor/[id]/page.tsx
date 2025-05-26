import { checkAppExists } from "@/lib/fly";
import { createClient } from "@/lib/supabase/server";
import EditorPageClient from "../../../../../../components/editor/editor-page-client";

export default async function EditorPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  let machine: any;
  const appExists = await checkAppExists(id);

  if (appExists === true) {
    const response = await fetch(
      `${process.env.FLY_API_BASE}/v1/apps/${id}/machines`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
        },
      }
    );

    machine = await response.json();
  }

  return <EditorPageClient id={id} user={user} machine={machine} />;
}
