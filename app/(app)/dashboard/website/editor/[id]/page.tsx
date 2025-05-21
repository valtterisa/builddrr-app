import WebsiteEditor from "@/components/editor/website-editor";

export default async function EditorPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-screen">
      <WebsiteEditor id={id} />
    </div>
  );
}
