"use server";

import { systemPrompt } from "@/lib/prompts/system";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { redis } from "@/lib/redis";
import type { builddrrOperation, StreamingChunk } from "@/lib/types";
import { createRepoFromTemplate, uploadFilesToRepo } from "@/lib/github";

export type Operation = {
  operation: "write" | "update" | "delete" | "code" | "rename" | "dependency";
  path?: string;
  newPath?: string; // For rename operations
  content?: string;
  dependency?: string;
};

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

// Get user from Supabase
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Get chat messages for a user and app
export async function getChatMessages(
  userId: string,
  appName: string
): Promise<ChatMessage[]> {
  if (!userId || !appName) return [];

  try {
    const chatKey = `chat:${userId}:${appName}`;
    const messages = await redis.lrange(chatKey, 0, -1);

    if (!messages || messages.length === 0) return [];

    const parsedMessages: ChatMessage[] = [];

    for (let i = 0; i < messages.length; i++) {
      try {
        let msg: string;

        // Handle different data types from Redis
        if (typeof messages[i] === "string") {
          msg = messages[i] as string;
        } else if (messages[i] && typeof messages[i] === "object") {
          // If it's already an object, try to stringify it
          msg = JSON.stringify(messages[i]);
        } else {
          msg = String(messages[i]);
        }

        if (!msg || msg.trim() === "") continue;

        // Try to parse as JSON
        let parsed;
        try {
          parsed = JSON.parse(msg);
        } catch (jsonError) {
          // If JSON parsing fails, treat it as a plain text message
          console.log(
            `Message ${i} is not JSON, treating as plain text:`,
            msg.substring(0, 100)
          );
          parsed = {
            id: `legacy-${Date.now()}-${i}`,
            content: msg,
            isUser: false,
            timestamp: new Date().toISOString(),
          };
        }

        parsedMessages.push({
          id: parsed.id || `generated-${Date.now()}-${i}`,
          content: parsed.content || "",
          isUser: !!parsed.isUser,
          timestamp:
            typeof parsed.timestamp === "string"
              ? parsed.timestamp
              : new Date(parsed.timestamp || Date.now()).toISOString(),
        });
      } catch (parseError) {
        console.error(
          `Failed to parse message at index ${i}:`,
          parseError,
          "Raw message:",
          messages[i]
        );
        // Skip this message but continue with the others
      }
    }

    return parsedMessages;
  } catch (error) {
    console.error("Redis error in getChatMessages:", error);
    return [];
  }
}

// Save a chat message
export async function sendChatMessage(
  userId: string,
  appName: string,
  message: string,
  isUser: boolean = true
): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  if (!userId || !appName || !message) {
    return { success: false, error: "Missing required parameters" };
  }

  try {
    const chatKey = `chat:${userId}:${appName}`;
    const timestamp = new Date().toISOString();

    const messageObj: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isUser,
      timestamp,
    };

    const messageString = JSON.stringify(messageObj);

    // Validate JSON can be parsed (sanity check)
    try {
      JSON.parse(messageString);
    } catch (parseError) {
      console.error("Invalid JSON in message object:", parseError);
      return { success: false, error: "Generated invalid JSON" };
    }

    // Add timeout to Redis operation
    try {
      await Promise.race([
        redis.rpush(chatKey, messageString),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Redis message save timeout")),
            5000
          )
        ),
      ]);
    } catch (timeoutError) {
      console.error("Redis rpush timed out:", timeoutError);
      return {
        success: false,
        message: messageObj,
        error: "Redis operation timed out",
      };
    }

    return { success: true, message: messageObj };
  } catch (error) {
    console.error("Redis error in sendChatMessage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save message",
    };
  }
}

// Read VFS from Redis
export async function getVirtualFileSystem(
  userId: string,
  appName: string
): Promise<Record<string, string> | null> {
  if (!userId || !appName) return null;

  try {
    const vfsKey = `vfs:${userId}:${appName}`;
    const vfsData = await redis.get(vfsKey);

    if (!vfsData) return null;
    return JSON.parse(vfsData.toString());
  } catch (error) {
    console.error("Redis error in getVirtualFileSystem:", error);
    return null;
  }
}

// Update VFS in Redis
export async function updateVirtualFileSystem(
  userId: string,
  appName: string,
  files: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  if (!userId || !appName || !files) {
    return { success: false, error: "Missing required parameters" };
  }

  try {
    const vfsKey = `vfs:${userId}:${appName}`;
    await redis.set(vfsKey, JSON.stringify(files));
    return { success: true };
  } catch (error) {
    console.error("Redis error in updateVirtualFileSystem:", error);
    return { success: false, error: "Failed to update virtual file system" };
  }
}


// Update files in fly.io
async function deployPreview(
  files: Record<string, string>,
  appName: string,
  machineId: string
) {
  // Convert files object to array of { path, content }
  const normalizedFiles = Object.entries(files).map(([path, content]) => ({
    guest_path: `/app/${path}`,
    raw_value: Buffer.from(content, "utf-8").toString("base64"),
  }));

  console.log("[deployPreview] normalizedFiles:", normalizedFiles);
  console.log("[deployPreview] appName:", appName);
  console.log("[deployPreview] machineId:", machineId);
  if (!normalizedFiles.length || !appName || !machineId) {
    return { error: "Missing required fields" };
  }
  try {
    const FLY_API_TOKEN = process.env.FLY_API_TOKEN!;
    const machine = await fetch(
      `https://api.machines.dev/v1/apps/${appName}/machines`,
      {
        headers: {
          Authorization: `Bearer ${FLY_API_TOKEN}`,
        },
      }
    );
    const machineData = await machine.json();
    const machineConfig = machineData.find(
      (m: any) => m.id === machineId
    )?.config;
    if (!machineConfig) {
      return { error: "Machine not found" };
    }
    machineConfig.files = normalizedFiles;
    const updateRes = await fetch(
      `https://api.machines.dev/v1/apps/${appName}/machines/${machineId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FLY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config: machineConfig }),
      }
    );
    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      throw new Error(`Fly API error: ${updateRes.status} ${errorText}`);
    }
    const data = await updateRes.json();
    return { machine: data, machineId, appName };
  } catch (err: any) {
    return { error: err?.message || err };
  }
}

export async function* generateAIResponseStream(
  prompt: string,
  appName: string,
  machineId: string
): AsyncGenerator<
  | { type: "analysis"; content: string }
  | { type: "progress"; status: string; files?: string[] }
  | { type: "error"; error: string }
  | { type: "warning"; message: string },
  void,
  unknown
> {
  const result = streamText({
    system: systemPrompt,
    prompt: prompt,
    temperature: 0,
    model: anthropic("claude-sonnet-4-20250514"),
    maxTokens: 16000,
    onError: ({ error }) => {
      console.error("AI Stream Error:", error);
    },
    onFinish: ({ finishReason, usage }) => {
      console.log("AI Stream Finished:", { finishReason, usage });
    },
  });

  const reader = result.textStream.getReader();
  let buffer = "";
  const collectedFiles: Record<string, string> = {};
  const MAX_BLOCK_SIZE = 1024 * 1024; // 1MB per block
  let unexpectedContentBuffer = "";
  let foundCodeBlock = false;
  let inMarkdownSection = false;
  let markdownBuffer = "";

  // Regex for <builddrr-code>...</builddrr-code>
  const codeBlockRegex = /<builddrr-code\s*>([\s\S]*?)<\/builddrr-code\s*>/gi;
  // Regex for <builddrr-write file="...">...</builddrr-write>
  const writeBlockRegex =
    /<builddrr-write\s+file="([^"]+)">([\s\S]*?)<\/builddrr-write\s*>/gi;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;

    console.log("📝 [generateAIResponseStream] Received chunk:", value.substring(0, 50) + "...");

    // Check if we're entering a markdown section (before <builddrr-code>)
    if (!inMarkdownSection && !buffer.includes("<builddrr-code")) {
      inMarkdownSection = true;
      console.log("📝 [generateAIResponseStream] Entered markdown section");
    }

    // If we find a <builddrr-code> block, process the markdown that came before it
    if (inMarkdownSection && buffer.includes("<builddrr-code")) {
      const codeStartIndex = buffer.indexOf("<builddrr-code");
      const markdownContent = buffer.substring(0, codeStartIndex).trim();

      if (markdownContent) {
        console.log("📝 [generateAIResponseStream] Yielding markdown before code block:", markdownContent.substring(0, 100) + "...");
        yield { type: "analysis", content: markdownContent };
      }

      inMarkdownSection = false;
      console.log("📝 [generateAIResponseStream] Exited markdown section, entered code section");
    }

    // Stream markdown content immediately as it comes in
    if (inMarkdownSection) {
      // Yield the new content immediately for real-time streaming
      const newContent = value;
      if (newContent.trim()) {
        console.log("📝 [generateAIResponseStream] Yielding new content:", newContent.substring(0, 50) + "...");
        yield { type: "analysis", content: newContent };
      }
    }

    // Extract all <builddrr-code> blocks
    let codeMatch;
    let foundInThisChunk = false;
    while ((codeMatch = codeBlockRegex.exec(buffer)) !== null) {
      foundCodeBlock = true;
      foundInThisChunk = true;
      const codeContent = codeMatch[1];
      // Extract all <builddrr-write> blocks inside this code block
      let writeMatch;
      while ((writeMatch = writeBlockRegex.exec(codeContent)) !== null) {
        const file = writeMatch[1];
        let content = writeMatch[2];

        // Show user-friendly feedback for each file being created
        const fileName = file.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || 'component';
        const friendlyName = fileName.charAt(0).toUpperCase() + fileName.slice(1);

        yield {
          type: "analysis",
          content: `\n\n**📝 Creating ${friendlyName}...**\n\n`
        };

        if (content.length > MAX_BLOCK_SIZE) {
          content = content.slice(0, MAX_BLOCK_SIZE);
          console.warn(`[generateAIResponseStream] File block for ${file} exceeded max size and was truncated.`);
          // Don't yield warning to chat - just log it
        }
        collectedFiles[file.startsWith("/") ? file.substring(1) : file] =
          content;
      }
      writeBlockRegex.lastIndex = 0;
    }
    // Remove processed <builddrr-code> blocks from buffer
    buffer = buffer.replace(codeBlockRegex, "");
    codeBlockRegex.lastIndex = 0;

    // Optionally, handle unexpected content outside tags
    if (
      buffer.length > 10000 &&
      !buffer.match(/<builddrr-code/)
    ) {
      unexpectedContentBuffer += buffer.slice(0, 500);
      buffer = buffer.slice(-500); // keep last 500 chars
    }
  }

  // After stream ends, check for any remaining markdown content
  if (inMarkdownSection && markdownBuffer.trim().length > 0) {
    const content = markdownBuffer.trim();
    if (content && content.length > 10) {
      yield { type: "analysis", content };
    }
  }

  // After stream ends, check for any remaining complete blocks in buffer
  let codeMatch;
  while ((codeMatch = codeBlockRegex.exec(buffer)) !== null) {
    foundCodeBlock = true;
    const codeContent = codeMatch[1];
    let writeMatch;
    while ((writeMatch = writeBlockRegex.exec(codeContent)) !== null) {
      const file = writeMatch[1];
      let content = writeMatch[2];
      if (content.length > MAX_BLOCK_SIZE) {
        content = content.slice(0, MAX_BLOCK_SIZE);
        console.warn(`[generateAIResponseStream] File block for ${file} exceeded max size and was truncated.`);
      }
      collectedFiles[file.startsWith("/") ? file.substring(1) : file] = content;
    }
    writeBlockRegex.lastIndex = 0;
  }

  // Warn if no <builddrr-code> block was found
  if (!foundCodeBlock) {
    console.warn(`[generateAIResponseStream] No <builddrr-code> block found in the stream.`);
    // Don't yield warning to chat - just log it
  }

  // Warn if any unprocessed content remains
  if (buffer.trim().length > 0) {
    console.warn(`[generateAIResponseStream] Unprocessed content at end of stream: ${buffer.slice(0, 200)}${buffer.length > 200 ? "..." : ""}`);
    // Don't yield warning to chat - just log it
  }
  if (unexpectedContentBuffer.trim().length > 0) {
    console.warn(`[generateAIResponseStream] Unexpected content outside tags: ${unexpectedContentBuffer.slice(0, 200)}${unexpectedContentBuffer.length > 200 ? "..." : ""}`);
    // Don't yield warning to chat - just log it
  }

  // After streaming, deploy if files were collected
  if (Object.keys(collectedFiles).length > 0) {
    console.log(`[generateAIResponseStream] Deploying ${Object.keys(collectedFiles).length} files:`, Object.keys(collectedFiles));

    // Create user-friendly component names
    const friendlyComponents = Object.keys(collectedFiles).map(file => {
      const fileName = file.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || 'component';
      return fileName.charAt(0).toUpperCase() + fileName.slice(1);
    });

    yield {
      type: "analysis",
      content: `\n\n**🚀 Deploying your website...**\n\nBuilding: ${friendlyComponents.join(', ')}\n\n`
    };

    yield {
      type: "progress",
      status: "deploying",
      files: Object.keys(collectedFiles),
    };
    try {
      const deployResult = await deployPreview(
        collectedFiles,
        appName,
        machineId
      );
      if (deployResult.error) {
        yield { type: "error", error: deployResult.error };
      } else {
        yield {
          type: "progress",
          status: "deployed",
          files: Object.keys(collectedFiles),
        };

        // Add final summary
        yield {
          type: "analysis",
          content: `\n\n**✅ Your website is ready!**\n\nI've created a beautiful website with:\n${friendlyComponents.map(component => `- ${component}`).join('\n')}\n\nYour website is now live and ready to view! 🎉\n\n`
        };
      }
      // Upload files to GitHub. Not awaited so it doesn't block the thread.
      createRepoFromTemplate(appName);
      const repoName = `builddrr-user-site-${appName}`;

      uploadFilesToRepo(repoName, collectedFiles);
    } catch (err: any) {
      yield { type: "error", error: err?.message || String(err) };
    }
  } else {
    console.log(
      `[generateAIResponseStream] No files collected, skipping deployment`
    );
    yield {
      type: "warning",
      message: "I couldn't create any website components. Please try asking again with more specific details about what you'd like me to build for you."
    };
  }
}

// Debug function to check Redis messages (remove after debugging)
export async function debugRedisMessages(userId: string, appName: string) {
  try {
    const chatKey = `chat:${userId}:${appName}`;
    console.log("🔍 [DEBUG] Checking Redis key:", chatKey);

    const messages = await redis.lrange(chatKey, 0, -1);
    console.log("📥 [DEBUG] Found", messages.length, "messages in Redis");

    messages.forEach((msg, index) => {
      try {
        let msgString: string;

        // Handle different data types from Redis
        if (typeof msg === "string") {
          msgString = msg;
        } else if (msg && typeof msg === "object") {
          // If it's already an object, try to stringify it
          msgString = JSON.stringify(msg);
        } else {
          msgString = String(msg);
        }

        const parsed = JSON.parse(msgString);
        console.log(`📝 [DEBUG] Message ${index}:`, {
          id: parsed.id,
          content: parsed.content?.substring(0, 50) + "...",
          isUser: parsed.isUser,
          timestamp: parsed.timestamp,
        });
      } catch (error) {
        console.log(`❌ [DEBUG] Failed to parse message ${index}:`, error);
        console.log(`❌ [DEBUG] Raw message type:`, typeof msg);
        console.log(`❌ [DEBUG] Raw message:`, msg);
      }
    });

    return messages.length;
  } catch (error) {
    console.error("💥 [DEBUG] Redis debug error:", error);
    return 0;
  }
}
