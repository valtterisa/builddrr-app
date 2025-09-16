import { Horizontal, Vertical } from "@/components/layout/panels";
import { TabContent, TabItem } from "@/components/tabs";
import { Chat } from "./chat";
import { Preview } from "./preview";
import { EditorHeader } from "./editor-header";

export default async function EditorPageClient() {
  return (
    <>
      <div className="flex flex-col-reverse md:flex-col h-screen max-h-screen overflow-hidden p-2">
        <ul className="flex space-x-5 font-mono text-sm tracking-tight px-1 py-2 md:hidden">
          <TabItem tabId="chat">Chat</TabItem>
          <TabItem tabId="preview">Preview</TabItem>
        </ul>

        {/* Mobile layout tabs taking the whole space*/}
        <div className="flex flex-1 w-full overflow-hidden pt-2 md:hidden">
          <TabContent tabId="chat" className="flex-1">
            <Chat className="flex-1 overflow-hidden" />
          </TabContent>
          <TabContent tabId="preview" className="flex-1">
            <Preview className="flex-1 overflow-hidden" />
          </TabContent>
        </div>

        <EditorHeader />

        {/* Desktop layout with horizontal and vertical panels */}
        <div className="hidden flex-1 w-full min-h-0 overflow-hidden pt-2 md:flex">
          <Horizontal
            defaultLayout={[30, 70]}
            left={<Chat className="flex-1 overflow-hidden w-full" />}
            right={
              <Vertical
                defaultLayout={[100, 0, 0]}
                top={<Preview className="flex-1 overflow-hidden w-full" />}
                middle={undefined}
                bottom={undefined}
              />
            }
          />
        </div>
      </div>
    </>
  );
}
