"use client";

import ChatInterface from "@/components/chat/chat-interface";

import { useEffect, useState, useCallback } from "react";

import WebsitePreview from "@/components/editor/website-preview";
import { useToast } from "@/hooks/use-toast";
import EditorHeader from "./editor-header";
import { getChatMessages, sendChatMessage } from "@/app/actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DevMode from "./dev-mode";
import { useEditorStore } from "@/lib/editor-store";
import type { EditorState } from "@/lib/editor-store";
import { useChatStreamStore } from "@/lib/chat-stream-store";
import { useStreamingChat } from "@/hooks/use-streaming-chat";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { checkRepoExists } from "@/lib/github";

export default function EditorPageClient({
  id,
  user,
}: {
  id: string;
  user: any;
}) {
  const isEditMode = useEditorStore((s: EditorState) => s.isEditMode);
  const setEditMode = useEditorStore((s: EditorState) => s.setEditMode);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);

  const { toast } = useToast();

  // Zustand chat state
  const { setMessages, addMessage } = useChatStreamStore();

  // Streaming chat hook
  const { sendMessage: sendStreamingMessage } = useStreamingChat();

  // Editor store for reload trigger
  const triggerReload = useEditorStore((s: EditorState) => s.triggerReload);

  // Get the actual user ID from the user object structure
  const userId = user?.id;

  // Callback for when AI finishes streaming
  const handleAIFinish = useCallback(() => {
    triggerReload();
    setTimeout(() => {
      useEditorStore.getState().setLoading(false);
    }, 3000);
  }, [triggerReload]);

  // Hydrate Zustand from Redis on mount
  useEffect(() => {
    if (userId && id) {
      getChatMessages(userId, id)
        .then((messages) => {
          setMessages(messages);
        })
        .catch((error) => {
          console.error("Failed to load chat messages:", error);
        });
    }
  }, [userId, id, setMessages]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      const userMsg = {
        id: Date.now().toString(),
        content: message,
        isUser: true,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);

      if (userId && id) {
        const saveResult = await sendChatMessage(
          userId,
          id,
          userMsg.content,
          true
        );
        if (!saveResult.success) {
          console.error("Failed to save user message:", saveResult.error);
        } else {
        }
      }

      // Check if repo exists before sending message
      let repoExists = false;
      try {
        repoExists = await checkRepoExists(id);
      } catch (error) {
        console.warn(
          "Failed to check repo existence, assuming it doesn't exist:",
          error
        );
        repoExists = false;
      }

      // Step 1: Stream the analysis to chat interface and trigger deployment via backend
      await sendStreamingMessage(message, id, repoExists);

      // Step 2: Get the final streamed content and save it as an AI message
      const finalStreamedContent =
        useChatStreamStore.getState().streamedContent;

      if (finalStreamedContent && finalStreamedContent.trim()) {
        const aiMsg = {
          id: Date.now().toString(),
          content: finalStreamedContent,
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        addMessage(aiMsg);

        if (userId && id) {
          const aiSaveResult = await sendChatMessage(
            userId,
            id,
            aiMsg.content,
            false
          );
          if (!aiSaveResult.success) {
            console.error("Failed to save AI message:", aiSaveResult.error);
          } else {
          }
        }

        // Clear the streamed content after saving it
        useChatStreamStore.getState().clearStreamedContent();
      } else {
        // Fallback message if no content was streamed
        const aiMsg = {
          id: Date.now().toString(),
          content: "Analysis completed and site deployed.",
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        addMessage(aiMsg);

        if (userId && id) {
          const aiSaveResult = await sendChatMessage(
            userId,
            id,
            aiMsg.content,
            false
          );
          if (!aiSaveResult.success) {
            console.error("Failed to save AI message:", aiSaveResult.error);
          } else {
          }
        }
      }

      // Clear auto-processing state
      setIsAutoProcessing(false);
    },
    [userId, id, addMessage, sendChatMessage, sendStreamingMessage]
  );

  useEffect(() => {
    // Only run when user is loaded
    if (!userId) {
      return;
    }

    const prompt = sessionStorage.getItem("builddrr_generation_prompt");

    if (prompt && !hasAutoTriggered) {
      // Set flags to prevent multiple triggers and show loading
      setHasAutoTriggered(true);
      setIsAutoProcessing(true);

      // Clear the prompt from sessionStorage to prevent re-triggering
      sessionStorage.removeItem("builddrr_generation_prompt");

      // Automatically send the prompt to trigger AI creation
      handleSendMessage(prompt);

      toast({
        title: "Creating Your Website",
        description:
          "AI is analyzing your requirements and building your site...",
      });
    } else if (!prompt && !hasAutoTriggered) {
      // If no prompt exists, just set the flag to prevent re-running
      setHasAutoTriggered(true);
    }
  }, [
    userId,
    hasAutoTriggered,
    handleSendMessage,
    toast,
    addMessage,
    sendChatMessage,
  ]);

  useEffect(() => {
    if (isEditMode) {
      setActiveTab("dev");
    } else {
      setActiveTab("chat");
    }
  }, [isEditMode]);

  return (
    <div className="flex flex-col h-full">
      <EditorHeader id={id} />

      <div className="flex flex-row h-full ">
        {/* Desktop/Tablet chat sidebar */}
        <div className="hidden md:flex md:w-[500px] flex-col h-full border-r border-gray-200">
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
            <TabsList className="items-start justify-start gap-1 rounded-none bg-white border-b border-gray-200">
              <TabsTrigger className="hover:bg-gray-100" value="chat">
                Chat
              </TabsTrigger>
              {/* <TabsTrigger className="hover:bg-gray-100" value="dev">
                Design
              </TabsTrigger> */}
            </TabsList>
            <TabsContent
              value="chat"
              className="h-full flex-1 mt-0 flex flex-col"
              asChild
            >
              <ChatInterface
                onSendMessage={handleSendMessage}
                onAIFinish={handleAIFinish}
                appName={id}
                userId={userId}
                isAutoProcessing={isAutoProcessing}
              />
            </TabsContent>
            <TabsContent
              value="dev"
              className="h-full flex-1 mt-0 flex flex-col"
              asChild
            >
              <DevMode />
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex flex-col flex-1 min-w-0 h-full bg-background">
          <WebsitePreview
            isEditMode={isEditMode}
            initialUrl={undefined}
            id={id}
          />
        </div>
      </div>
      {/* Mobile chat drawer with swipeable grabber */}
      <Drawer shouldScaleBackground={false} snapPoints={[0.4, 0.7, 0.95]}>
        <DrawerTrigger asChild>
          <div className="md:hidden fixed bottom-1 left-0 right-0 z-40 flex justify-center">
            <div className="h-10 px-4 rounded-full bg-muted/90 border shadow-sm flex items-center gap-2 active:scale-[0.99] transition">
              <div className="h-1.5 w-12 bg-muted-foreground/40 rounded-full" />
              <span className="text-xs text-muted-foreground">Chat</span>
            </div>
          </div>
        </DrawerTrigger>
        <DrawerContent className="md:hidden h-[100dvh] p-0">
          <DrawerTitle className="sr-only">Editor Chat</DrawerTitle>
          <div className="flex flex-col h-full">
            <div className="px-4 py-2 border-b">
              <div className="text-sm font-medium">Chat</div>
            </div>
            <div className="flex-1 min-h-0 p-2">
              <ChatInterface
                className="h-full"
                onSendMessage={handleSendMessage}
                onAIFinish={handleAIFinish}
                appName={id}
                userId={userId}
                isAutoProcessing={isAutoProcessing}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
