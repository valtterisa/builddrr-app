import WebsiteEditor from "@/components/editor/website-editor";

export default async function EditorPage({
  params,
}: {
  params: { id: string };
}) {
  // probably fetch the real url here from db based on website id?
  // Connect website to user id and show all websites on the user id on my websites page.
  const { id } = await params;
  console.log(id);

  return (
    <div className="flex flex-col h-screen">
      <WebsiteEditor id={id} />
    </div>
  );
}
