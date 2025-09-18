import { getOrCreateUserWebsite, saveWebsiteContent } from "./actions";
import { EditClient } from "@/components/editor/edit-client";

export default async function EditPage() {
  const res = await getOrCreateUserWebsite();

  const data = res?.content || {};

  const previewId = res?.id || "";

  async function onPublish(id: string, json: any) {
    "use server";
    await saveWebsiteContent(id, json);
  }

  return <EditClient previewId={previewId} onPublish={onPublish} data={data} />;
}
