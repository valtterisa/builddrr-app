"use client";

import ChatInterface from "@/components/chat/chat-interface";

import { useEffect, useState, useCallback } from "react";

import WebsitePreview from "@/components/editor/website-preview";
import { useToast } from "@/hooks/use-toast";
import EditorHeader from "./editor-header";
import {
  getChatMessages,
  sendChatMessage,
} from "@/app/actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DevMode from "./dev-mode";
import { useEditorStore } from "@/lib/editor-store";
import type { EditorState } from "@/lib/editor-store";
import { useChatStreamStore } from "@/lib/chat-stream-store";
import { useStreamingChat } from "@/hooks/use-streaming-chat";

export default function EditorPageClient({
  id,
  user,
  machine,
}: {
  id: string;
  user: any;
  machine: any;
}) {
  const [appName, setAppName] = useState<string>(id);
  const isEditMode = useEditorStore((s: EditorState) => s.isEditMode);
  const setEditMode = useEditorStore((s: EditorState) => s.setEditMode);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(id);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);

  const { toast } = useToast();

  const [machineData, setMachineData] = useState<any>(machine);

  // Zustand chat state
  const { setMessages, addMessage, streamedContent } = useChatStreamStore();

  // Streaming chat hook
  const { sendMessage: sendStreamingMessage, isLoading: isStreamingLoading } =
    useStreamingChat();

  // Editor store for reload trigger
  const triggerReload = useEditorStore((s: EditorState) => s.triggerReload);

  // Get the actual user ID from the user object structure
  const userId = user?.id;

  // Callback for when AI finishes streaming
  const handleAIFinish = useCallback(() => {
    console.log("🎯 [EditorPageClient] AI finished, triggering iframe reload");
    console.log("🎯 [EditorPageClient] Current reload trigger value:", useEditorStore.getState().reloadTrigger);
    triggerReload();
    console.log("🎯 [EditorPageClient] Reload trigger called, new value:", useEditorStore.getState().reloadTrigger);

    // Clear loading state after a delay to allow iframe to load
    setTimeout(() => {
      console.log("🎯 [EditorPageClient] Clearing loading state");
      useEditorStore.getState().setLoading(false);
    }, 3000);
  }, [triggerReload]);

  // Debug logging for props and state
  useEffect(() => {
    console.log("🔍 [EditorPageClient] Props and state:", {
      id,
      appName,
      userId,
      hasUser: !!user,
      userData: user?.data,
    });
  }, [id, appName, userId, user]);

  // Hydrate Zustand from Redis on mount
  useEffect(() => {
    if (userId && id) {
      getChatMessages(userId, id)
        .then((messages) => {
          console.log("Chat messages loaded:", messages.length, "messages");
          setMessages(messages);
        })
        .catch((error) => {
          console.error("Failed to load chat messages:", error);
        });
    }
  }, [userId, id, setMessages]);

  useEffect(() => {
    console.log("🔄 [EditorPageClient] Setting machine data:", machine);
    setMachineData(machine);
  }, [machine]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      console.log("🚀 [handleSendMessage] Starting message processing:", message.substring(0, 50) + "...");

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
          console.log("✅ [handleSendMessage] User message saved to Redis");
        }
      }

      // Step 1: Stream the analysis to chat interface and trigger deployment via backend
      console.log("🌊 [handleSendMessage] Starting streaming process...");
      await sendStreamingMessage(message, id, machine.id);

      // Step 2: Get the final streamed content and save it as an AI message
      const finalStreamedContent = useChatStreamStore.getState().streamedContent;
      console.log("📝 [handleSendMessage] Final streamed content length:", finalStreamedContent?.length || 0);
      console.log("📝 [handleSendMessage] Final streamed content preview:", finalStreamedContent?.substring(0, 100) + "...");

      if (finalStreamedContent && finalStreamedContent.trim()) {
        console.log("💾 [handleSendMessage] Saving AI response to chat history");
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
            console.log("✅ [handleSendMessage] AI message saved to Redis");
          }
        }

        // Clear the streamed content after saving it
        useChatStreamStore.getState().clearStreamedContent();
        console.log("🗑️ [handleSendMessage] Cleared streamed content");
      } else {
        console.warn("⚠️ [handleSendMessage] No streamed content found, using fallback message");
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
            console.log("✅ [handleSendMessage] Fallback AI message saved to Redis");
          }
        }
      }

      // Clear auto-processing state
      setIsAutoProcessing(false);
      console.log("🏁 [handleSendMessage] Message processing completed");
    },
    [
      userId,
      id,
      machine?.id,
      addMessage,
      sendChatMessage,
      sendStreamingMessage,
    ]
  );

  // Debug logging for ChatInterface props
  useEffect(() => {
    console.log("🔍 [EditorPageClient] ChatInterface props:", {
      appName,
      userId,
      hasOnSendMessage: !!handleSendMessage,
      isAutoProcessing,
    });
  }, [appName, userId, handleSendMessage, isAutoProcessing]);

  useEffect(() => {
    // Only run when user and machine are loaded
    if (!userId || !machine?.id) {
      console.log(
        "⏳ [EditorPageClient] Waiting for user and machine to load...",
        {
          hasUser: !!userId,
          hasMachine: !!machine?.id,
        }
      );
      return;
    }

    console.log("🔍 [EditorPageClient] Checking for auto-trigger prompt...", {
      hasUser: !!userId,
      hasMachine: !!machine?.id,
      hasAutoTriggered,
      isAutoProcessing,
    });

    const prompt = sessionStorage.getItem("builddrr_generation_prompt");

    if (prompt && !hasAutoTriggered) {
      console.log(
        "🔄 [EditorPageClient] Auto-triggering AI creation with prompt:",
        prompt.substring(0, 50) + "..."
      );

      // Set flags to prevent multiple triggers and show loading
      setHasAutoTriggered(true);
      setIsAutoProcessing(true);

      // Clear the prompt from sessionStorage to prevent re-triggering
      sessionStorage.removeItem("builddrr_generation_prompt");
      console.log("🗑️ [EditorPageClient] Cleared prompt from sessionStorage");

      // Automatically send the prompt to trigger AI creation
      console.log(
        "🚀 [EditorPageClient] Calling handleSendMessage for auto-trigger"
      );
      handleSendMessage(prompt);

      toast({
        title: "Creating Your Website",
        description:
          "AI is analyzing your requirements and building your site...",
      });
      console.log("📢 [EditorPageClient] Showed toast notification");
    } else if (!prompt && !hasAutoTriggered) {
      // If no prompt exists, show a welcome message and suggest starting
      console.log(
        "👋 [EditorPageClient] No prompt found, checking if welcome message needed"
      );

      setHasAutoTriggered(true);

      // Only show welcome message if there are no existing messages
      const existingMessages = useChatStreamStore.getState().messages;
      if (existingMessages.length === 0) {
        console.log("👋 [EditorPageClient] No existing messages, showing welcome message");

        const welcomeMsg = {
          id: Date.now().toString(),
          content:
            "👋 Welcome to Builddrr! I'm your AI website builder. Tell me what kind of website you'd like to create, and I'll build it for you in real-time. For example: 'Create a landing page for a coffee shop' or 'Build a portfolio website for a photographer'.",
          isUser: false,
          timestamp: new Date().toISOString(),
        };

        console.log("💬 [EditorPageClient] Adding welcome message to chat");
        addMessage(welcomeMsg);
        if (userId && id) {
          console.log("💾 [EditorPageClient] Saving welcome message to Redis");
          sendChatMessage(userId, id, welcomeMsg.content, false);
        }
      } else {
        console.log("⏭️ [EditorPageClient] Existing messages found, skipping welcome message");
      }
    } else {
      console.log("⏭️ [EditorPageClient] Skipping auto-trigger:", {
        hasPrompt: !!prompt,
        hasUser: !!userId,
        hasMachine: !!machine?.id,
        hasAutoTriggered,
        isAutoProcessing,
      });
    }
  }, [
    userId,
    machine?.id,
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

      <div className="flex flex-row gap-4 h-full ">
        <div className="md:w-[500px] flex flex-col h-full border-r border-gray-200">
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
              <TabsTrigger className="hover:bg-gray-100" value="dev">
                Design
              </TabsTrigger>
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
