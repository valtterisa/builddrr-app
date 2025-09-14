"use server";

import { systemPrompt } from "@/lib/prompts/system";
import {
  getProjectContext,
  invalidateProjectContext,
} from "@/lib/project-context";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { redis } from "@/lib/redis";
import {
  checkRepoExists,
  createRepoFromTemplate,
  uploadFilesToRepo,
} from "@/lib/github";
import { ensureSandboxRunning } from "@/lib/vercel/vercel";
import { BuilddrrTagExtractor } from "@/lib/builddrr-tag-extractor";

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

export async function* generateAIResponseStream(
  prompt: string,
  appName: string,
  repoExists: boolean = false
): AsyncGenerator<
  | { type: "analysis"; content: string }
  | { type: "progress"; status: string; files?: string[]; url?: string }
  | { type: "error"; error: string }
  | { type: "warning"; message: string },
  void,
  unknown
> {
  // Build dynamic system prompt with optional project context
  let system = systemPrompt;
  try {
    const existsOnServerForContext = await checkRepoExists(appName);
    if (existsOnServerForContext) {
      const ctx = await getProjectContext(appName);
      if (ctx) {
        system = `${systemPrompt}\n\n---\n\nProject Context (trimmed):\n${ctx}`;
      }
    }
  } catch (_) {
    // If context assembly fails, fall back silently
  }

  const result = streamText({
    system,
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
  const MAX_BUFFER_SIZE = 200 * 1024; // 200KB max buffer size
  let processedContentLength = 0; // Track how much content we've processed
  let allExtractedTags: any[] = []; // Store all extracted tags for GitHub upload
  let lastProcessedContent = ""; // Track last processed content to prevent duplicates

  // Memory-efficient regex-based processing

  // Using htmlparser2-based filtering instead of regex

  // Check if content should be shown to user using htmlparser2-based filtering
  const shouldShowContent = (content: string): boolean => {
    return BuilddrrTagExtractor.shouldShowToUser(content);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;

    // Use regex to find complete builddrr tags efficiently
    const builddrrTagRegex = /<builddrr-write[^>]*file="([^"]+)"[^>]*>([\s\S]*?)<\/builddrr-write>/gi;
    let match;
    let lastIndex = 0;
    let cleanContent = "";

    // Find all complete builddrr tags in current buffer
    while ((match = builddrrTagRegex.exec(buffer)) !== null) {
      const [fullMatch, fileName, fileContent] = match;
      const startIndex = match.index;

      // Add content before the tag to clean content
      if (startIndex > lastIndex) {
        const beforeTag = buffer.substring(lastIndex, startIndex);
        if (beforeTag.trim() && !BuilddrrTagExtractor.hasTags(beforeTag)) {
          cleanContent += beforeTag;
        }
      }

      // Normalize file path (remove leading slash for consistency)
      const normalizedFileName = fileName.startsWith('/') ? fileName.substring(1) : fileName;

      // Process the file if we haven't seen it before
      if (!collectedFiles[normalizedFileName]) {
        collectedFiles[normalizedFileName] = fileContent;
        console.log(`📝 [generateAIResponseStream] Collected file: ${normalizedFileName}`);
        cleanContent += `📝 Creating ${normalizedFileName}...\n`;
      }

      lastIndex = startIndex + fullMatch.length;
    }

    // Add remaining content after last tag (only if it's not a partial builddrr tag)
    if (lastIndex < buffer.length) {
      const afterLastTag = buffer.substring(lastIndex);
      // Only add if it doesn't look like the start of a builddrr tag
      if (afterLastTag.trim() &&
        !BuilddrrTagExtractor.hasTags(afterLastTag) &&
        !afterLastTag.includes('<builddrr-')) {
        cleanContent += afterLastTag;
      }
    }

    // Only send NEW content to user (incremental streaming)
    if (cleanContent.trim()) {
      // Calculate only the NEW part of the content
      const newContent = lastProcessedContent
        ? cleanContent.substring(lastProcessedContent.length)
        : cleanContent;

      if (newContent.trim()) {
        const filteredContent = BuilddrrTagExtractor.filterContentForUser(newContent);
        if (filteredContent.trim() && shouldShowContent(filteredContent)) {
          console.log(
            "📝 [generateAIResponseStream] Yielding NEW content:",
            filteredContent.substring(0, 100) + "..."
          );
          yield { type: "analysis", content: filteredContent };
        }
      }

      lastProcessedContent = cleanContent; // Update to current content
    }

    // Smart buffer cleanup - remove processed content
    if (buffer.length > MAX_BUFFER_SIZE) {
      // Find the last complete builddrr tag to safely trim
      const lastTagIndex = buffer.lastIndexOf('</builddrr-write>');
      if (lastTagIndex > -1) {
        const processedLength = lastTagIndex + '</builddrr-write>'.length;
        processedContentLength += processedLength;
        buffer = buffer.substring(processedLength);
        console.log(
          `🧹 [generateAIResponseStream] Cleaned buffer, removed ${processedLength} chars`
        );
      } else {
        // If no complete tag found, keep last 50KB
        const keepFromIndex = Math.max(0, buffer.length - 50000);
        const removedLength = keepFromIndex - processedContentLength;
        processedContentLength = keepFromIndex;
        buffer = buffer.slice(keepFromIndex);
        console.log(
          `🧹 [generateAIResponseStream] Emergency buffer cleanup, removed ${removedLength} chars`
        );
      }
    }

    // Extract builddrr tags using the new extractor for GitHub upload
    const extractedTags = BuilddrrTagExtractor.extractTags(buffer);
    allExtractedTags.push(...extractedTags);
  }

  // After stream ends, process any remaining clean content
  if (buffer.trim()) {
    // Only send if it has NO builddrr tags
    if (!BuilddrrTagExtractor.hasTags(buffer)) {
      const filteredContent = BuilddrrTagExtractor.filterContentForUser(buffer);

      if (filteredContent && filteredContent.trim().length > 10 && shouldShowContent(filteredContent)) {
        yield { type: "analysis", content: filteredContent.trim() };
      }
    } else {
      console.log("🚫 [generateAIResponseStream] Skipping final content with builddrr tags");
    }
  }

  // After stream ends, check for any remaining complete blocks in buffer (silently collect files)
  const finalExtractedTags = BuilddrrTagExtractor.extractTags(buffer);
  const finalWriteTags = finalExtractedTags.filter(tag => tag.type === 'write' && tag.file);

  for (const tag of finalWriteTags) {
    const file = tag.file!;
    let content = tag.content;
    if (content.length > MAX_BLOCK_SIZE) {
      content = content.slice(0, MAX_BLOCK_SIZE);
      console.warn(
        `[generateAIResponseStream] File block for ${file} exceeded max size and was truncated.`
      );
    }
    collectedFiles[file.startsWith("/") ? file.substring(1) : file] = content;
  }

  // Log completion
  console.log(`[generateAIResponseStream] Stream completed. Collected ${Object.keys(collectedFiles).length} files.`);

  // After streaming, deploy if files were collected
  if (Object.keys(collectedFiles).length > 0) {
    console.log(
      `[generateAIResponseStream] Deploying ${Object.keys(collectedFiles).length} files:`,
      Object.keys(collectedFiles)
    );

    // Create user-friendly component names
    const friendlyComponents = Object.keys(collectedFiles).map((file) => {
      const fileName =
        file.split("/").pop()?.replace(".tsx", "").replace(".ts", "") ||
        "component";
      return fileName.charAt(0).toUpperCase() + fileName.slice(1);
    });

    yield {
      type: "analysis",
      content: `\n\n**🚀 Deploying your website...**\n\nBuilding: ${friendlyComponents.join(", ")}\n\n`,
    };

    yield {
      type: "progress",
      status: "deploying",
      files: Object.keys(collectedFiles),
    };
    try {
      // Only create repo if it doesn't already exist
      if (!repoExists) {
        const existsOnServer = await checkRepoExists(appName);
        if (!existsOnServer) {
          await createRepoFromTemplate(appName);
        } else {
          console.log(
            `[generateAIResponseStream] (server) Repo already exists for ${appName}, skipping creation`
          );
        }
      } else {
        console.log(
          `[generateAIResponseStream] Repo already exists for ${appName}, skipping creation`
        );
      }

      // Push changes to GitHub to keep repo as source of truth
      await uploadFilesToRepo(appName, collectedFiles);
      // Ensure sandbox running (pull from GitHub) and emit URL
      const ensure = await (
        await import("@/lib/vercel/vercel")
      ).ensureSandboxRunning(appName);
      // Invalidate context after deploy; next run rebuilds with fresh files
      try {
        await invalidateProjectContext(appName);
      } catch (_) { }
      if (ensure?.url) {
        yield {
          type: "progress",
          status: "deployed",
          url: ensure.url,
        };
      } else {
        // Add final summary
        yield {
          type: "analysis",
          content: `\n\n**✅ Your website is ready!**\n\nI've created a beautiful website with:\n${friendlyComponents.map((component) => `- ${component}`).join("\n")}\n\nYour website is now live and ready to view! 🎉\n\n`,
        };
      }
    } catch (err: any) {
      yield { type: "error", error: err?.message || String(err) };
    }
  } else {
    console.log(
      `[generateAIResponseStream] No files collected, skipping deployment`
    );
    yield {
      type: "warning",
      message:
        "I couldn't create any website components. Please try asking again with more specific details about what you'd like me to build for you.",
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
