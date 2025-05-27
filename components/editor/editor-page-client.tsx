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
  setStatus("generating");

  let filesObj: Record<string, string> = {};
  try {
    const { files } = await generateAIResponse(prompt);
    if (!files || Object.keys(files).length === 0) {
      setStatus("ready");
      return {
        success: false,
        error:
          "AI returned an empty response. Please try again with a clearer prompt.",
      };
    }
  } catch (aiError) {
    setStatus("ready");
    return {
      success: false,
      error: aiError instanceof Error ? aiError.message : String(aiError),
    };
  }

  // Convert Record<string, string> to FileOperation[]
  const files = Object.entries(filesObj).map(([path, content]) => ({
    path,
    content,
  }));

  // Save to Redis in parallel
  setStatus("deploying");
  try {
    await Promise.all([
      (async () => {
        try {
          await Promise.race([
            redis.set(`prompt:${userId}:${appName}`, prompt),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Redis prompt save timeout")),
                5000
              )
            ),
          ]);
        } catch (err) {
          console.error("❌ Redis prompt error:", err);
        }
      })(),
      (async () => {
        try {
          await Promise.race([
            redis.set(`vfs:${userId}:${appName}`, JSON.stringify(files)),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Redis VFS save timeout")),
                5000
              )
            ),
          ]);
        } catch (err) {
          console.error("❌ Redis VFS error:", err);
        }
      })(),
    ]);
  } catch (redisError) {
    // Only log, don't fallback to localStorage unless both fail
    console.error("❌ Redis error:", redisError);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`vfs:${userId}:${appName}`, JSON.stringify(files));
      } catch (localStorageError) {
        console.error("❌ Failed to save to localStorage:", localStorageError);
      }
    }
  }

  // Chat history initialization
  const chatKey = `chat:${userId}:${appName}`;
  const initialMessage = {
    id: Date.now().toString(),
    content: prompt,
    isUser: true,
    timestamp: new Date().toISOString(),
  };
  try {
    const messageString = JSON.stringify(initialMessage);
    JSON.parse(messageString); // Sanity check
    await Promise.race([
      redis.rpush(chatKey, messageString),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Redis chat message save timeout")),
          5000
        )
      ),
    ]);
  } catch (chatError) {
    console.error("❌ Chat history error:", chatError);
    if (typeof window !== "undefined") {
      try {
        const localStorageKey = `chat:${userId}:${appName}`;
        const existingMessages = localStorage.getItem(localStorageKey);
        const messages = existingMessages
          ? [...JSON.parse(existingMessages), initialMessage]
          : [initialMessage];
        localStorage.setItem(localStorageKey, JSON.stringify(messages));
      } catch (localStorageError) {
        console.error("❌ Failed to save to localStorage:", localStorageError);
      }
    }
  }

  // Deploy (keep as is, but error handling is now more targeted)
  let result;
  try {
    result = await createAppAndAssignMachine(userId, appName, files);
    setStatus("polling");
    setStatus("ready");
    return result;
  } catch (deployError) {
    setStatus("ready");
    return {
      success: true,
      machine: { id: "error-machine-id", name: appName },
    };
  }
}
