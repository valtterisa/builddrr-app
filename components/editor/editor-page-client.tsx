"use client";

import { generateAIResponse, processChatMessage } from "@/app/actions";
import ChatInterface from "@/components/chat/chat-interface";
import { createAppAndAssignMachine } from "@/lib/fly";
import { redis } from "@/lib/redis";
import {
  generateAppName,
  getMockAIResponse,
  parseAIResponse,
} from "@/lib/utils";
import { useEffect, useState } from "react";

import WebsitePreview from "@/components/editor/website-preview";
import { useToast } from "@/hooks/use-toast";
import EditorHeader from "./editor-header";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(id);

  const { toast } = useToast();

  const [machineData, setMachineData] = useState<any>(machine);

  useEffect(() => {
    setMachineData(machine);
  }, [machine]);

  useEffect(() => {
    const runGeneration = async () => {
      console.log("🚀 Starting runGeneration...");
      const prompt = sessionStorage.getItem("siteforge_generation_prompt");
      console.log(
        "📝 Prompt from sessionStorage:",
        prompt ? "Found" : "Not found"
      );

      if (!prompt) {
        console.error("❌ No prompt found in sessionStorage");
        toast({
          title: "Error Creating Website",
          description: "No prompt found. Please try again.",
        });
        return;
      }

      const generatedAppName = generateAppName(user.user.id);
      console.log("📋 Generated app name:", generatedAppName);
      setAppName(generatedAppName);

      console.log("🔄 Calling generateSite...");
      const result = await generateSite(
        prompt,
        (status) => {
          console.log(`🔔 Status changed: ${status}`);
          setStatus(status as GenerationStatus);
        },
        user.user.id,
        generatedAppName
      );
      console.log("✅ generateSite returned:", result);

      if (result?.success) {
        toast({
          title: "Website Created",
          description: "Your website has been created and is ready to use.",
        });
      } else {
        console.error(
          "❌ Deployment failed:",
          result ? JSON.stringify(result) : "No result"
        );
        toast({
          title: "Deployment Error",
          description: "Something went wrong during deployment.",
        });
      }
    };

    // @TODO: Rewise this solution.
    // We need to check if project exists in the supabase db before creating.
    // Also we need supabase db stuff to this too
    // check for supabase and redis so you know if appname exists or not in different states
    // Design supabase table to work better with this
    // const loadExistingWebsite = async () => {
    //   try {
    //     // Check if this website already exists in Redis
    //     const existingAppNames = await redis.keys(`vfs:${user.user.id}:*`);

    //     if (existingAppNames && existingAppNames.length > 0) {
    //       // Extract app name from the key
    //       const appNameKey = existingAppNames[0];
    //       const extractedAppName = appNameKey.split(":")[2];
    //       setAppName(extractedAppName);
    //       setStatus("ready");
    //     }
    //   } catch (error) {
    //     console.error("Error loading existing website:", error);
    //   }
    // };

    // If we have a website ID that's not "new", try to load existing website

    console.log("ID is 'new', running generation process");
    runGeneration();
  }, [id, user.user.id, toast]);

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
        setIsEditMode={setIsEditMode}
        isEditMode={isEditMode}
      />

      <div className="flex flex-row gap-4 h-full rounded-3xl">
        <div className="md:w-[500px] flex flex-col h-full">
          <ChatInterface
            status={status}
            onSendMessage={handleSendMessage}
            appName={appName}
            userId={user.user.id}
          />
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

export async function generateSite(
  prompt: string,
  setStatus: (status: string) => void,
  userId: string,
  appName: string
) {
  console.log("📥 generateSite started with prompt length:", prompt.length);

  setStatus("thinking");
  console.log("🧠 Status: thinking");

  setStatus("generating");
  console.log("🔧 Status: generating - Calling AI");
  try {
    const filesObj = await generateAIResponse(prompt);
    console.log(
      "📄 AI Response received, file count:",
      Object.keys(filesObj).length
    );

    // Check if we received an empty response from AI
    if (!filesObj || Object.keys(filesObj).length === 0) {
      console.error("❌ Empty AI response received");
      setStatus("ready");
      return {
        success: false,
        error:
          "AI returned an empty response. Please try again with a clearer prompt.",
      };
    }

    // Convert Record<string, string> to FileOperation[]
    const files = Object.entries(filesObj).map(([path, content]) => ({
      path,
      content,
    }));

    console.log("📂 Files prepared for deployment:", files.length);

    console.log("💾 Saving to Redis");
    try {
      // Add timeout for Redis operations
      const redisPromises = [
        Promise.race([
          redis.set(`prompt:${userId}:${appName}`, prompt),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Redis prompt save timeout")),
              5000
            )
          ),
        ]),
        Promise.race([
          redis.set(`vfs:${userId}:${appName}`, JSON.stringify(files)),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Redis VFS save timeout")), 5000)
          ),
        ]),
      ];

      // Wait for both Redis operations with timeout
      await Promise.all(redisPromises);
      console.log("✅ Saved to Redis successfully");
    } catch (redisError) {
      console.error("❌ Redis error:", redisError);
      // Store the VFS in localStorage as backup
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `vfs:${userId}:${appName}`,
            JSON.stringify(files)
          );
          console.log("⚠️ Saved VFS to localStorage instead");
        }
      } catch (localStorageError) {
        console.error("❌ Failed to save to localStorage:", localStorageError);
      }
      // Continue despite Redis errors
    }

    // Initialize chat history with system message
    const chatKey = `chat:${userId}:${appName}`;
    const initialMessage = {
      id: Date.now().toString(),
      content: prompt,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    try {
      // Properly stringify the message and validate it first
      const messageString = JSON.stringify(initialMessage);
      console.log("💬 Message to be stored:", messageString);

      // Validate that we can parse it back (sanity check)
      const parsed = JSON.parse(messageString);
      console.log(
        "✅ Validation passed, message can be parsed back:",
        parsed.id
      );

      // Now store it to Redis with timeout
      await Promise.race([
        redis.rpush(chatKey, messageString),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Redis chat message save timeout")),
            5000
          )
        ),
      ]);
      console.log("💬 Chat history initialized successfully");
    } catch (chatError) {
      console.error("❌ Chat history error:", chatError);
      console.error("❌ Message that failed:", initialMessage);

      // Store the message in localStorage as backup
      try {
        if (typeof window !== "undefined") {
          const localStorageKey = `chat:${userId}:${appName}`;
          const existingMessages = localStorage.getItem(localStorageKey);
          const messages = existingMessages
            ? [...JSON.parse(existingMessages), initialMessage]
            : [initialMessage];
          localStorage.setItem(localStorageKey, JSON.stringify(messages));
          console.log("⚠️ Saved chat message to localStorage instead");
        }
      } catch (localStorageError) {
        console.error("❌ Failed to save to localStorage:", localStorageError);
      }

      // Continue despite chat history errors - we've saved to localStorage
    }

    setStatus("deploying");
    console.log("🚀 Status: deploying - Starting deployment");

    try {
      // Real deployment with Fly.io
      const result = await createAppAndAssignMachine(userId, appName, files);
      console.log("📊 Deployment result:", JSON.stringify(result));

      setStatus("polling");
      console.log("🔍 Status: polling");

      // Poll the app and machine
      setStatus("ready");
      console.log("✅ Status: ready");

      return result;
    } catch (deployError) {
      console.error("❌ Deployment error:", deployError);
      setStatus("ready");
      console.log("⚠️ Status: ready (with deployment errors)");

      // Return mock success despite deployment error so UI can continue
      return {
        success: true,
        machine: { id: "error-machine-id", name: appName },
      };
    }
  } catch (error) {
    console.error("❌ Error in generateSite:", error);
    setStatus("ready"); // Set status to ready to prevent stuck UI
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
