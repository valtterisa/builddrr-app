import WebsiteEditor from "@/components/editor/website-editor";

export default async function EditorPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

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

  const machine = await response.json();

  return (
    <div className="flex flex-col h-screen">
      <WebsiteEditor id={id} machine={machine} />
    </div>
  );
}
