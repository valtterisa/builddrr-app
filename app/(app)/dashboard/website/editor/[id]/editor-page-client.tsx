"use client";

import { generateAIResponse, processChatMessage } from "@/app/actions";
import ChatInterface from "@/components/chat/chat-interface";
import WebsiteEditor from "@/components/editor/website-editor";
import { toast } from "@/hooks/use-toast";
import { createAppAndAssignMachine } from "@/lib/fly";
import { redis } from "@/lib/redis";
import {
  generateAppName,
  getMockAIResponse,
  parseAIResponse,
} from "@/lib/utils";
import { useEffect, useState } from "react";

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
}: {
  id: string;
  user: any;
  machine: any;
}) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [appName, setAppName] = useState<string>("");

  useEffect(() => {
    const runGeneration = async () => {
      const prompt = sessionStorage.getItem("siteforge_generation_prompt");
      if (!prompt) {
        toast({
          title: "Error Creating Website",
          description: "No prompt found. Please try again.",
        });
        return;
      }

      const generatedAppName = generateAppName(user.user.id);
      setAppName(generatedAppName);

      const result = await generateSite(
        prompt,
        (status) => setStatus(status as GenerationStatus),
        user.user.id,
        generatedAppName
      );

      if (result?.success) {
        toast({
          title: "Website Created",
          description: "Your website has been created and is ready to use.",
        });
      } else {
        toast({
          title: "Deployment Error",
          description: "Something went wrong during deployment.",
        });
      }
    };

    // @TODO: Rewise this solution.
    // We need to check if project exists in the supabase db before creating.
    // Also we need supabase db stuff to this too
    const loadExistingWebsite = async () => {
      try {
        // Check if this website already exists in Redis
        const existingAppNames = await redis.keys(`vfs:${user.user.id}:*`);

        if (existingAppNames && existingAppNames.length > 0) {
          // Extract app name from the key
          const appNameKey = existingAppNames[0];
          const extractedAppName = appNameKey.split(":")[2];
          setAppName(extractedAppName);
          setStatus("ready");
        }
      } catch (error) {
        console.error("Error loading existing website:", error);
      }
    };

    // If we have a website ID that's not "new", try to load existing website
    if (id !== "new") {
      loadExistingWebsite();
    } else {
      runGeneration();
    }
  }, [id, user.user.id]);

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
    <div className="flex flex-row gap-4 h-full rounded-3xl">
      <div className="md:w-[500px] flex flex-col h-full">
        <ChatInterface
          status={status}
          onSendMessage={handleSendMessage}
          appName={appName}
          userId={user.user.id}
        />
      </div>
      <div className="flex-1">
        <WebsiteEditor
          id={id}
          user={user.user}
          machine={machine}
          appName={appName}
        />
      </div>
    </div>
  );
}

export async function generateSite(
  prompt: string,
  setStatus: (status: string) => void,
  userId: string,
  appName: string
) {
  setStatus("thinking");

  setStatus("generating");
  //   const aiResponse = await generateAIResponse(prompt);
  const aiResponse = await getMockAIResponse(); // USING MOCK RESPONSE
  const files = await parseAIResponse(aiResponse);

  console.log("files: ", files);

  await redis.set(`prompt:${userId}:${appName}`, prompt);
  await redis.set(`vfs:${userId}:${appName}`, JSON.stringify(files));

  // Initialize chat history with system message
  const chatKey = `chat:${userId}:${appName}`;
  const initialMessage = {
    content: prompt,
    isUser: true,
    timestamp: new Date().toISOString(),
  };
  await redis.rpush(chatKey, JSON.stringify(initialMessage));

  setStatus("deploying");
  const result = await createAppAndAssignMachine(userId, appName, files);

  setStatus("polling");

  // Poll the app and machine
  setStatus("ready");

  return result;
}
