"use server";

import { systemPrompt } from "@/lib/prompts/system";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { redis } from "@/lib/redis";

interface Operation {
  operation: "write" | "update" | "delete" | "code" | "rename" | "dependency";
  path?: string;
  newPath?: string; // For rename operations
  content?: string;
  dependency?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
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
        const msg = messages[i].toString();
        // Skip empty messages
        if (!msg || msg.trim() === "") continue;

        const parsed = JSON.parse(msg);
        parsedMessages.push({
          id: parsed.id || `generated-${Date.now()}-${i}`,
          content: parsed.content || "",
          isUser: !!parsed.isUser,
          timestamp: new Date(parsed.timestamp || Date.now()),
        });
      } catch (parseError) {
        console.error(`Failed to parse message at index ${i}:`, parseError);
        console.error("Message content:", messages[i].toString());
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
      timestamp: new Date(timestamp),
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

// Generate file updates based on user message
export async function generateFileUpdates(
  message: string,
  currentFiles: Record<string, string>
): Promise<Operation[]> {
  try {
    // Create a system prompt that enhances the original one but focuses on updates
    const fileUpdatePrompt = `
You are SiteForge, a professional AI frontend engineer. A user is asking to update their website code.

Current project files:
${Object.keys(currentFiles)
  .map((path) => `- ${path}`)
  .join("\n")}

Based on the user's request, determine which files need to be updated, created, renamed, or deleted.
When responding, use the format:

<siteforge-code>
<siteforge-write file="/path/to/file.tsx">
// Complete file content here
</siteforge-write>

<siteforge-delete file="/path/to/delete.tsx"/>

<siteforge-rename file="/path/to/old.tsx" newPath="/path/to/new.tsx"/>

<siteforge-add-dependency>
package-name
</siteforge-add-dependency>
</siteforge-code>

Always provide complete file content for written or updated files, not just changes.
Respond ONLY with the <siteforge-code> block and file operations.
`;

    const result = streamText({
      system: fileUpdatePrompt,
      prompt: message,
      temperature: 0,
      model: anthropic("claude-sonnet-4-20250514"),
      maxTokens: 64000,
      onError: ({ error }) => {
        console.error("AI Stream Error:", error);
      },
      onFinish: ({ finishReason, usage }) => {
        console.log("AI Stream Finished:", { finishReason, usage });
      },
    });

    const reader = result.textStream.getReader();
    let buffer = "";
    const operations: Operation[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
    }

    // Extract the <siteforge-code> block
    const codeMatch = buffer.match(
      /<siteforge-code>([\s\S]*?)<\/siteforge-code>/
    );
    if (codeMatch && codeMatch[1]) {
      const codeBlock = codeMatch[1].trim();

      // Extract write operations
      const writeMatches = [
        ...codeBlock.matchAll(
          /<siteforge-write file="([^"]+)">([\s\S]*?)<\/siteforge-write>/g
        ),
      ];
      for (const match of writeMatches) {
        operations.push({
          operation: "write",
          path: match[1],
          content: match[2].trim(),
        });
      }

      // Extract delete operations
      const deleteMatches = [
        ...codeBlock.matchAll(/<siteforge-delete file="([^"]+)"\/>/g),
      ];
      for (const match of deleteMatches) {
        operations.push({
          operation: "delete",
          path: match[1],
        });
      }

      // Extract rename operations
      const renameMatches = [
        ...codeBlock.matchAll(
          /<siteforge-rename file="([^"]+)" newPath="([^"]+)"\/>/g
        ),
      ];
      for (const match of renameMatches) {
        operations.push({
          operation: "rename",
          path: match[1],
          newPath: match[2],
        });
      }

      // Extract dependency operations
      const depMatches = [
        ...codeBlock.matchAll(
          /<siteforge-add-dependency>([\s\S]*?)<\/siteforge-add-dependency>/g
        ),
      ];
      for (const match of depMatches) {
        const deps = match[1]
          .trim()
          .split("\n")
          .filter((dep) => dep.trim() !== "");
        for (const dep of deps) {
          operations.push({
            operation: "dependency",
            dependency: dep.trim(),
          });
        }
      }
    }

    return operations;
  } catch (error) {
    console.error("Error generating file updates:", error);
    return [];
  }
}

// Initial website generation
export async function generateAIResponse(
  prompt: string
): Promise<Record<string, string>> {
  try {
    const fileUpdates: Record<string, string> = {};
    const operations: Operation[] = [];

    const result = streamText({
      system: systemPrompt,
      prompt: prompt,
      temperature: 0,
      model: anthropic("claude-sonnet-4-20250514"),
      maxTokens: 64000,
      onError: ({ error }) => {
        console.error("AI Stream Error:", error);
      },
      onFinish: ({ finishReason, usage }) => {
        console.log("AI Stream Finished:", { finishReason, usage });
      },
    });

    const reader = result.textStream.getReader();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
    }

    console.log("🔄 Generated buffer:", buffer);

    // Extract the <siteforge-code> block
    const codeMatch = buffer.match(
      /<siteforge-code>([\s\S]*?)<\/siteforge-code>/
    );
    if (codeMatch && codeMatch[1]) {
      const codeBlock = codeMatch[1].trim();

      // Extract write operations
      const writeMatches = [
        ...codeBlock.matchAll(
          /<siteforge-write file="([^"]+)">([\s\S]*?)<\/siteforge-write>/g
        ),
      ];
      for (const match of writeMatches) {
        const path = match[1].startsWith("/")
          ? match[1].substring(1)
          : match[1];
        fileUpdates[path] = match[2].trim();
      }

      // For initial generation, we ignore delete, rename, and dependency operations
    }

    console.log("🔄 Generated file updates:", fileUpdates);

    return fileUpdates;
  } catch (error) {
    console.error("Error in generateAIResponse:", error);
    return {};
  }
}

export async function processChatMessage(
  userId: string,
  appName: string,
  message: string
): Promise<{ success: boolean; operations?: string[]; error?: string }> {
  try {
    console.log(`🔄 Processing chat message for ${userId}:${appName}`);

    // Save the user message
    const savedMessage = await sendChatMessage(userId, appName, message, true);
    if (!savedMessage.success) {
      console.error("❌ Failed to save user message:", savedMessage.error);
    } else {
      console.log("✅ User message saved successfully");
    }

    // Get current VFS
    console.log("📂 Getting current virtual file system");
    const currentVFS = (await getVirtualFileSystem(userId, appName)) || {};
    console.log(`📄 Found ${Object.keys(currentVFS).length} files in VFS`);

    // Run AI to generate file updates
    console.log("🧠 Generating file updates with AI");
    const operations = await generateFileUpdates(message, currentVFS);
    console.log(`✅ Generated ${operations.length} operations`);

    // Apply operations to VFS
    const updatedFiles = [];
    const deletedFiles = [];
    const renamedFiles = [];
    const addedDependencies = [];

    console.log("📝 Applying operations to VFS");
    for (const op of operations) {
      switch (op.operation) {
        case "write":
        case "update":
        case "code":
          if (op.path && op.content) {
            const path = op.path.startsWith("/")
              ? op.path.substring(1)
              : op.path;
            currentVFS[path] = op.content;
            updatedFiles.push(path);
          }
          break;
        case "delete":
          if (op.path) {
            const path = op.path.startsWith("/")
              ? op.path.substring(1)
              : op.path;
            delete currentVFS[path];
            deletedFiles.push(path);
          }
          break;
        case "rename":
          if (op.path && op.newPath) {
            const oldPath = op.path.startsWith("/")
              ? op.path.substring(1)
              : op.path;
            const newPath = op.newPath.startsWith("/")
              ? op.newPath.substring(1)
              : op.newPath;

            if (currentVFS[oldPath]) {
              currentVFS[newPath] = currentVFS[oldPath];
              delete currentVFS[oldPath];
              renamedFiles.push(`${oldPath} -> ${newPath}`);
            }
          }
          break;
        case "dependency":
          if (op.dependency) {
            const pkgJsonPath = "package.json";
            let pkgJson: {
              dependencies?: Record<string, string>;
              [key: string]: any;
            } = {};

            if (currentVFS[pkgJsonPath]) {
              try {
                pkgJson = JSON.parse(currentVFS[pkgJsonPath]);
              } catch (e) {
                console.error("Error parsing package.json:", e);
              }
            }

            pkgJson.dependencies = pkgJson.dependencies || {};
            pkgJson.dependencies[op.dependency] = "*";
            currentVFS[pkgJsonPath] = JSON.stringify(pkgJson, null, 2);
            addedDependencies.push(op.dependency);
          }
          break;
      }
    }

    console.log("📊 Operation summary:");
    console.log(`- Updated: ${updatedFiles.length} files`);
    console.log(`- Deleted: ${deletedFiles.length} files`);
    console.log(`- Renamed: ${renamedFiles.length} files`);
    console.log(`- Added dependencies: ${addedDependencies.length}`);

    // Save the updated VFS
    console.log("💾 Saving updated VFS");
    await updateVirtualFileSystem(userId, appName, currentVFS);

    // Create a meaningful response message based on operations
    let responseMessage = "";

    if (operations.length === 0) {
      responseMessage = "No changes were made to your website.";
    } else {
      const writeOps = operations.filter(
        (op) =>
          op.operation === "write" ||
          op.operation === "update" ||
          op.operation === "code"
      );
      const deleteOps = operations.filter((op) => op.operation === "delete");
      const renameOps = operations.filter((op) => op.operation === "rename");
      const depOps = operations.filter((op) => op.operation === "dependency");

      const parts = [];

      if (writeOps.length > 0) {
        parts.push(
          `Updated ${writeOps.length} file${writeOps.length > 1 ? "s" : ""}`
        );
      }

      if (deleteOps.length > 0) {
        parts.push(
          `Deleted ${deleteOps.length} file${deleteOps.length > 1 ? "s" : ""}`
        );
      }

      if (renameOps.length > 0) {
        parts.push(
          `Renamed ${renameOps.length} file${renameOps.length > 1 ? "s" : ""}`
        );
      }

      if (depOps.length > 0) {
        parts.push(
          `Added ${depOps.length} dependenc${depOps.length > 1 ? "ies" : "y"}`
        );
      }

      responseMessage = `${parts.join(", ")}.`;
    }

    // Save assistant response
    console.log("💬 Saving assistant response");
    const assistantResponse = await sendChatMessage(
      userId,
      appName,
      responseMessage,
      false
    );
    if (!assistantResponse.success) {
      console.error(
        "❌ Failed to save assistant response:",
        assistantResponse.error
      );
    }

    console.log("✅ Chat message processed successfully");
    return {
      success: true,
      operations: operations.map((op) => op.operation),
    };
  } catch (error) {
    console.error("processChatMessage error:", error);

    // Send error message to chat
    try {
      const errorMsg = "Sorry, I encountered an error processing your request.";
      console.log("⚠️ Saving error message to chat");
      await sendChatMessage(userId, appName, errorMsg, false);
    } catch (chatError) {
      console.error("Failed to save error message to chat:", chatError);
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Message processing failed.",
    };
  }
}
