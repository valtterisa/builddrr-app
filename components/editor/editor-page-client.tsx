"use client";

import { processChatMessage } from "@/app/actions";
import ChatInterface from "@/components/chat/chat-interface";

import { useEffect, useState } from "react";

import WebsitePreview from "@/components/editor/website-preview";
import { useToast } from "@/hooks/use-toast";
import EditorHeader from "./editor-header";
import { generateSite } from "@/app/actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DevMode from "./dev-mode";
import { useEditorStore } from "@/lib/editor-store";
import type { EditorState } from "@/lib/editor-store";

type GenerationStatus =
  | "idle"
  | "thinking"
  | "generating"
  | "deploying"
  | "polling"
  | "ready";

export default function EditorPageClient({
  id,
  user,
  machine,
  appExists,
}: {
  id: string;
  user: any;
  machine: any;
  appExists: boolean;
}) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [appName, setAppName] = useState<string>("");
  const isEditMode = useEditorStore((s: EditorState) => s.isEditMode);
  const setEditMode = useEditorStore((s: EditorState) => s.setEditMode);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(id);
  const [activeTab, setActiveTab] = useState<string>("chat");

  const { toast } = useToast();

  const [machineData, setMachineData] = useState<any>(machine);

  useEffect(() => {
    setMachineData(machine);
  }, [machine]);

  useEffect(() => {
    const prompt = sessionStorage.getItem("builddrr_generation_prompt");

    if (!prompt) {
      console.error("❌ No prompt found");
      toast({
        title: "Error Creating Website",
        description: "Please try again.",
      });
      return;
    }

    console.log("🔄 Calling generateSite...");

    // Generate site if app doesn't exist already.
    // Otherwise, just load the existing app.
    if (!appExists) {
      generateSite(
        prompt,
        (status) => {
          console.log(`🔔 Status changed: ${status}`);
          setStatus(status as GenerationStatus);
        },
        user.user.id,
        appName
      )
        .then((result) => {
          console.log("✅ generateSite returned:", result);
          toast({
            title: "Website Created",
            description: "Your website has been created and is ready to use.",
          });
        })
        .catch((error) => {
          console.error("❌ generateSite error:", error);
          toast({
            title: "Error Creating Website",
            description: "Something went wrong during deployment.",
          });
        });
    } else {
      // Load existing app
      // Fly.io boots up app automatically when request comes
      setStatus("deploying");
      // @TODO: Needs some health checks? Can it be in machine config?
    }
  }, [id, user]);

  useEffect(() => {
    if (isEditMode) {
      setActiveTab("dev");
    } else {
      setActiveTab("chat");
    }
  }, [isEditMode]);

  const handleSendMessage = async (message: string) => {
    try {
      // Process the message using server action
      if (appName) {
        const response = await processChatMessage(
          user.user.id,
          appName,
          message
        );
        return response;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <EditorHeader
        id={id}
        setIsEditMode={setEditMode}
        isEditMode={isEditMode}
      />

      <div className="flex flex-row gap-4 h-full rounded-3xl">
        <div className="md:w-[500px] flex flex-col h-full">
          <Tabs
            value={activeTab}
            onValueChange={(tab) => {
              setActiveTab(tab);
              setEditMode(tab === "dev");
            }}
            className="h-full flex flex-col"
            defaultValue="chat"
            orientation="vertical"
          >
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="dev">Design</TabsTrigger>
            </TabsList>
            <TabsContent
              value="chat"
              className="h-full flex-1 mt-0 flex flex-col"
              asChild
            >
              <ChatInterface
                status={status}
                onSendMessage={handleSendMessage}
                appName={appName}
                userId={user.user.id}
              />
            </TabsContent>
            <TabsContent
              value="dev"
              className="h-full flex-1 mt-0 flex flex-col"
              asChild
            >
              <DevMode
                show={true}
                position={{ top: 100, left: 100 }}
                activeFormats={{ bold: false, italic: false, underline: false }}
                elementType={"div"}
                selectedElement={null}
                onFormatText={() => {}}
                onSetBackgroundColor={() => {}}
                onSetBackgroundImage={() => {}}
                onSetLink={() => {}}
                onSetAltTag={() => {}}
                onClose={() => setEditMode(false)}
                activeTextColor={null}
                setActiveTextColor={() => {}}
                onRemoveStandalone={() => {}}
                canRemoveStandalone={false}
              />
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex flex-col flex-1 min-w-0 h-full bg-background rounded-3xl">
          <WebsitePreview
            isEditMode={isEditMode}
            initialUrl={websiteUrl || undefined}
            id={id}
            machine={machineData}
          />
        </div>
      </div>
    </div>
  );
}
