"use server";

import { systemPrompt } from "@/lib/prompts/system";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { redis } from "@/lib/redis";
import { createRepoFromTemplate, uploadFilesToRepo } from "@/lib/github";
import { deploySandboxAndStopExisting } from "@/lib/vercel/vercel";

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

    console.log(
      "📝 [generateAIResponseStream] Received chunk:",
      value.substring(0, 50) + "..."
    );

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
        // AGGRESSIVE code filtering - block ALL code patterns
        const filteredMarkdown = markdownContent
          .replace(/```[\s\S]*?```/g, "")
          .replace(/`[^`]*`/g, "")
          .replace(/<builddrr-code[\s\S]*?<\/builddrr-code>/gi, "")
          .replace(/<builddrr-write[\s\S]*?<\/builddrr-write>/gi, "")
          .replace(/function\s*\(/gi, "")
          .replace(/const\s+\w+\s*=/gi, "")
          .replace(/let\s+\w+\s*=/gi, "")
          .replace(/var\s+\w+\s*=/gi, "")
          .replace(/import\s+.*?from/gi, "")
          .replace(/export\s+/gi, "")
          .replace(/return\s+/gi, "")
          .replace(/console\.log/gi, "")
          .replace(/React\./gi, "")
          .replace(/useState/gi, "")
          .replace(/useEffect/gi, "")
          .replace(/className=/gi, "")
          .replace(/onClick=/gi, "")
          .replace(/style=/gi, "");

        // Only show content if it doesn't contain ANY code patterns
        if (
          filteredMarkdown.trim() &&
          !filteredMarkdown.match(/[{}()\[\]]/) && // No brackets
          !filteredMarkdown.match(/[;=]/) && // No semicolons or equals
          !filteredMarkdown.includes("function") &&
          !filteredMarkdown.includes("const") &&
          !filteredMarkdown.includes("let") &&
          !filteredMarkdown.includes("var") &&
          !filteredMarkdown.includes("import") &&
          !filteredMarkdown.includes("export") &&
          !filteredMarkdown.includes("return") &&
          !filteredMarkdown.includes("console") &&
          !filteredMarkdown.includes("React") &&
          !filteredMarkdown.includes("useState") &&
          !filteredMarkdown.includes("useEffect") &&
          !filteredMarkdown.includes("className") &&
          !filteredMarkdown.includes("onClick") &&
          !filteredMarkdown.includes("style")
        ) {
          console.log(
            "📝 [generateAIResponseStream] Yielding filtered markdown before code block:",
            filteredMarkdown.substring(0, 100) + "..."
          );
          yield { type: "analysis", content: filteredMarkdown };
        }
      }

      inMarkdownSection = false;
      console.log(
        "📝 [generateAIResponseStream] Exited markdown section, entered code section"
      );
    }

    // Stream markdown content immediately as it comes in (filter out code blocks)
    if (inMarkdownSection) {
      // Yield the new content immediately for real-time streaming
      const newContent = value;
      if (newContent.trim()) {
        // AGGRESSIVE code filtering - block ALL code patterns
        const filteredContent = newContent
          .replace(/```[\s\S]*?```/g, "")
          .replace(/`[^`]*`/g, "")
          .replace(/<builddrr-code[\s\S]*?<\/builddrr-code>/gi, "")
          .replace(/<builddrr-write[\s\S]*?<\/builddrr-write>/gi, "")
          .replace(/function\s*\(/gi, "")
          .replace(/const\s+\w+\s*=/gi, "")
          .replace(/let\s+\w+\s*=/gi, "")
          .replace(/var\s+\w+\s*=/gi, "")
          .replace(/import\s+.*?from/gi, "")
          .replace(/export\s+/gi, "")
          .replace(/return\s+/gi, "")
          .replace(/console\.log/gi, "")
          .replace(/React\./gi, "")
          .replace(/useState/gi, "")
          .replace(/useEffect/gi, "")
          .replace(/className=/gi, "")
          .replace(/onClick=/gi, "")
          .replace(/style=/gi, "");

        // Only show content if it doesn't contain ANY code patterns
        if (
          filteredContent.trim() &&
          !filteredContent.match(/[{}()\[\]]/) && // No brackets
          !filteredContent.match(/[;=]/) && // No semicolons or equals
          !filteredContent.includes("function") &&
          !filteredContent.includes("const") &&
          !filteredContent.includes("let") &&
          !filteredContent.includes("var") &&
          !filteredContent.includes("import") &&
          !filteredContent.includes("export") &&
          !filteredContent.includes("return") &&
          !filteredContent.includes("console") &&
          !filteredContent.includes("React") &&
          !filteredContent.includes("useState") &&
          !filteredContent.includes("useEffect") &&
          !filteredContent.includes("className") &&
          !filteredContent.includes("onClick") &&
          !filteredContent.includes("style")
        ) {
          console.log(
            "📝 [generateAIResponseStream] Yielding filtered content:",
            filteredContent.substring(0, 50) + "..."
          );
          yield { type: "analysis", content: filteredContent };
        }
      }
    } else if (!foundCodeBlock) {
      // If we're not in a code block and haven't found one yet, stream the content
      // This handles the initial markdown content before any code blocks
      if (value.trim()) {
        // AGGRESSIVE code filtering - block ALL code patterns
        const filteredContent = value
          .replace(/```[\s\S]*?```/g, "")
          .replace(/`[^`]*`/g, "")
          .replace(/<builddrr-code[\s\S]*?<\/builddrr-code>/gi, "")
          .replace(/<builddrr-write[\s\S]*?<\/builddrr-write>/gi, "")
          .replace(/function\s*\(/gi, "")
          .replace(/const\s+\w+\s*=/gi, "")
          .replace(/let\s+\w+\s*=/gi, "")
          .replace(/var\s+\w+\s*=/gi, "")
          .replace(/import\s+.*?from/gi, "")
          .replace(/export\s+/gi, "")
          .replace(/return\s+/gi, "")
          .replace(/console\.log/gi, "")
          .replace(/React\./gi, "")
          .replace(/useState/gi, "")
          .replace(/useEffect/gi, "")
          .replace(/className=/gi, "")
          .replace(/onClick=/gi, "")
          .replace(/style=/gi, "");

        // Only show content if it doesn't contain ANY code patterns
        if (
          filteredContent.trim() &&
          !filteredContent.match(/[{}()\[\]]/) && // No brackets
          !filteredContent.match(/[;=]/) && // No semicolons or equals
          !filteredContent.includes("function") &&
          !filteredContent.includes("const") &&
          !filteredContent.includes("let") &&
          !filteredContent.includes("var") &&
          !filteredContent.includes("import") &&
          !filteredContent.includes("export") &&
          !filteredContent.includes("return") &&
          !filteredContent.includes("console") &&
          !filteredContent.includes("React") &&
          !filteredContent.includes("useState") &&
          !filteredContent.includes("useEffect") &&
          !filteredContent.includes("className") &&
          !filteredContent.includes("onClick") &&
          !filteredContent.includes("style")
        ) {
          console.log(
            "📝 [generateAIResponseStream] Yielding filtered initial content:",
            filteredContent.substring(0, 50) + "..."
          );
          yield { type: "analysis", content: filteredContent };
        }
      }
    }

    // Extract all <builddrr-code> blocks (but don't show code to user)
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
        const fileName =
          file.split("/").pop()?.replace(".tsx", "").replace(".ts", "") ||
          "component";
        const friendlyName =
          fileName.charAt(0).toUpperCase() + fileName.slice(1);

        // Only yield user-friendly text, not the actual code
        yield {
          type: "analysis",
          content: `\n\n**📝 Creating ${friendlyName}...**\n\n`,
        };

        if (content.length > MAX_BLOCK_SIZE) {
          content = content.slice(0, MAX_BLOCK_SIZE);
          console.warn(
            `[generateAIResponseStream] File block for ${file} exceeded max size and was truncated.`
          );
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
    if (buffer.length > 10000 && !buffer.match(/<builddrr-code/)) {
      unexpectedContentBuffer += buffer.slice(0, 500);
      buffer = buffer.slice(-500); // keep last 500 chars
    }
  }

  // After stream ends, check for any remaining markdown content (filter out code blocks)
  if (inMarkdownSection && markdownBuffer.trim().length > 0) {
    const content = markdownBuffer.trim();
    // AGGRESSIVE code filtering - block ALL code patterns
    const filteredContent = content
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]*`/g, "")
      .replace(/<builddrr-code[\s\S]*?<\/builddrr-code>/gi, "")
      .replace(/<builddrr-write[\s\S]*?<\/builddrr-write>/gi, "")
      .replace(/function\s*\(/gi, "")
      .replace(/const\s+\w+\s*=/gi, "")
      .replace(/let\s+\w+\s*=/gi, "")
      .replace(/var\s+\w+\s*=/gi, "")
      .replace(/import\s+.*?from/gi, "")
      .replace(/export\s+/gi, "")
      .replace(/return\s+/gi, "")
      .replace(/console\.log/gi, "")
      .replace(/React\./gi, "")
      .replace(/useState/gi, "")
      .replace(/useEffect/gi, "")
      .replace(/className=/gi, "")
      .replace(/onClick=/gi, "")
      .replace(/style=/gi, "");

    // Only show content if it doesn't contain ANY code patterns
    if (
      filteredContent &&
      filteredContent.trim().length > 10 &&
      !filteredContent.match(/[{}()\[\]]/) && // No brackets
      !filteredContent.match(/[;=]/) && // No semicolons or equals
      !filteredContent.includes("function") &&
      !filteredContent.includes("const") &&
      !filteredContent.includes("let") &&
      !filteredContent.includes("var") &&
      !filteredContent.includes("import") &&
      !filteredContent.includes("export") &&
      !filteredContent.includes("return") &&
      !filteredContent.includes("console") &&
      !filteredContent.includes("React") &&
      !filteredContent.includes("useState") &&
      !filteredContent.includes("useEffect") &&
      !filteredContent.includes("className") &&
      !filteredContent.includes("onClick") &&
      !filteredContent.includes("style")
    ) {
      yield { type: "analysis", content: filteredContent.trim() };
    }
  }

  // After stream ends, check for any remaining complete blocks in buffer (silently collect files)
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
        console.warn(
          `[generateAIResponseStream] File block for ${file} exceeded max size and was truncated.`
        );
      }
      collectedFiles[file.startsWith("/") ? file.substring(1) : file] = content;
    }
    writeBlockRegex.lastIndex = 0;
  }

  // Warn if no <builddrr-code> block was found
  if (!foundCodeBlock) {
    console.warn(
      `[generateAIResponseStream] No <builddrr-code> block found in the stream.`
    );
    // Don't yield warning to chat - just log it
  }

  // Warn if any unprocessed content remains
  if (buffer.trim().length > 0) {
    console.warn(
      `[generateAIResponseStream] Unprocessed content at end of stream: ${buffer.slice(0, 200)}${buffer.length > 200 ? "..." : ""}`
    );
    // Don't yield warning to chat - just log it
  }
  if (unexpectedContentBuffer.trim().length > 0) {
    console.warn(
      `[generateAIResponseStream] Unexpected content outside tags: ${unexpectedContentBuffer.slice(0, 200)}${unexpectedContentBuffer.length > 200 ? "..." : ""}`
    );
    // Don't yield warning to chat - just log it
  }

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
        await createRepoFromTemplate(appName);
      } else {
        console.log(
          `[generateAIResponseStream] Repo already exists for ${appName}, skipping creation`
        );
      }

      await uploadFilesToRepo(appName, collectedFiles);
      console.log("🔍 [DEBUG] Deploying sandbox and stopping existing");
      const { url } = await deploySandboxAndStopExisting(appName);
      if (url) {
        yield {
          type: "progress",
          status: "deployed",
          url: url,
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
