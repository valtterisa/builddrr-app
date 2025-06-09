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
You are builddrr, a professional AI frontend engineer. A user is asking to update their website code.

Current project files:
${Object.keys(currentFiles)
  .map((path) => `- ${path}`)
  .join("\n")}

Based on the user's request, determine which files need to be updated, created, renamed, or deleted.
When responding, use the format:

<builddrr-code>
<builddrr-write file="/path/to/file.tsx">
// Complete file content here
</builddrr-write>

<builddrr-delete file="/path/to/delete.tsx"/>

<builddrr-rename file="/path/to/old.tsx" newPath="/path/to/new.tsx"/>

<builddrr-add-dependency>
package-name
</builddrr-add-dependency>
</builddrr-code>

Always provide complete file content for written or updated files, not just changes.
Respond ONLY with the <builddrr-code> block and file operations.
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

    // Extract the <builddrr-code> block
    const codeMatch = buffer.match(
      /<builddrr-code>([\s\S]*?)<\/builddrr-code>/
    );
    if (codeMatch && codeMatch[1]) {
      const codeBlock = codeMatch[1].trim();

      // Extract write operations
      const writeMatches = [
        ...codeBlock.matchAll(
          /<builddrr-write file="([^"]+)">([\s\S]*?)<\/builddrr-write>/g
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
        ...codeBlock.matchAll(/<builddrr-delete file="([^"]+)"\/>/g),
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
          /<builddrr-rename file="([^"]+)" newPath="([^"]+)"\/>/g
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
          /<builddrr-add-dependency>([\s\S]*?)<\/builddrr-add-dependency>/g
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

export type builddrrOperation =
  | { type: "write"; path: string; content: string }
  | { type: "delete"; path: string }
  | { type: "rename"; oldPath: string; newPath: string }
  | { type: "dependency"; dependency: string };

export async function generateAIResponse(
  prompt: string,
  onOperationParsed?: (op: builddrrOperation) => void
): Promise<{
  files: Record<string, string>;
  deletes: string[];
  renames: { oldPath: string; newPath: string }[];
  dependencies: string[];
  operations: builddrrOperation[];
}> {
  const files: Record<string, string> = {};
  const deletes: string[] = [];
  const renames: { oldPath: string; newPath: string }[] = [];
  const dependencies: string[] = [];
  const operations: builddrrOperation[] = [];

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

  // Regexes for all operation types
  const writeRegex =
    /<builddrr-write file="([^"]+)">([\s\S]*?)<\/builddrr-write>/;
  const deleteRegex = /<builddrr-delete file="([^"]+)"\s*\/>/;
  const renameRegex = /<builddrr-rename file="([^"]+)" newPath="([^"]+)"\s*\/>/;
  const depRegex =
    /<builddrr-add-dependency>([\s\S]*?)<\/builddrr-add-dependency>/;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;

    // Keep extracting as long as we find any operation
    let matched = true;
    while (matched) {
      matched = false;

      // Write
      const writeMatch = writeRegex.exec(buffer);
      if (writeMatch) {
        const path = writeMatch[1].startsWith("/")
          ? writeMatch[1].substring(1)
          : writeMatch[1];
        const content = writeMatch[2].trim();
        files[path] = content;
        const op: builddrrOperation = { type: "write", path, content };
        operations.push(op);
        if (onOperationParsed) onOperationParsed(op);
        buffer = buffer.slice(writeMatch.index + writeMatch[0].length);
        matched = true;
        continue;
      }

      // Delete
      const deleteMatch = deleteRegex.exec(buffer);
      if (deleteMatch) {
        const path = deleteMatch[1].startsWith("/")
          ? deleteMatch[1].substring(1)
          : deleteMatch[1];
        deletes.push(path);
        const op: builddrrOperation = { type: "delete", path };
        operations.push(op);
        if (onOperationParsed) onOperationParsed(op);
        buffer = buffer.slice(deleteMatch.index + deleteMatch[0].length);
        matched = true;
        continue;
      }

      // Rename
      const renameMatch = renameRegex.exec(buffer);
      if (renameMatch) {
        const oldPath = renameMatch[1].startsWith("/")
          ? renameMatch[1].substring(1)
          : renameMatch[1];
        const newPath = renameMatch[2].startsWith("/")
          ? renameMatch[2].substring(1)
          : renameMatch[2];
        renames.push({ oldPath, newPath });
        const op: builddrrOperation = { type: "rename", oldPath, newPath };
        operations.push(op);
        if (onOperationParsed) onOperationParsed(op);
        buffer = buffer.slice(renameMatch.index + renameMatch[0].length);
        matched = true;
        continue;
      }

      // Dependency (can be multiline)
      const depMatch = depRegex.exec(buffer);
      if (depMatch) {
        const deps = depMatch[1]
          .split("\n")
          .map((d) => d.trim())
          .filter(Boolean);
        for (const dependency of deps) {
          dependencies.push(dependency);
          const op: builddrrOperation = { type: "dependency", dependency };
          operations.push(op);
          if (onOperationParsed) onOperationParsed(op);
        }
        buffer = buffer.slice(depMatch.index + depMatch[0].length);
        matched = true;
        continue;
      }
    }
  }

  // Optionally, handle any remaining partial blocks in buffer here (rare, unless AI output is malformed)

  return { files, deletes, renames, dependencies, operations };
}

export async function processChatMessage(
  userId: string,
  appName: string,
  message: string
): Promise<{ success: boolean; operations?: string[]; error?: string }> {
  try {
    // Save the user message and get current VFS in parallel
    const [savedMessage, currentVFSRaw] = await Promise.all([
      sendChatMessage(userId, appName, message, true),
      getVirtualFileSystem(userId, appName),
    ]);
    const currentVFS = currentVFSRaw || {};

    if (!savedMessage.success) {
      console.error("❌ Failed to save user message:", savedMessage.error);
    }

    // Run AI to generate file updates
    const {
      files: updatedVFS,
      deletes,
      renames,
      dependencies,
      operations,
    } = await generateAIResponse(message);

    // Apply operations to VFS
    const updatedFiles = [];
    const deletedFiles = [];
    const renamedFiles = [];
    const addedDependencies = [];

    console.log("📝 Applying operations to VFS");
    for (const op of operations) {
      switch (op.type) {
        case "write":
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
          if (op.oldPath && op.newPath) {
            const oldPath = op.oldPath.startsWith("/")
              ? op.oldPath.substring(1)
              : op.oldPath;
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

    // Save assistant response (no need to await, can be fire-and-forget)
    const responseMessage =
      operations.length === 0
        ? "No changes were made to your website."
        : [
            operations.filter((op) => op.type === "write").length > 0
              ? `Updated ${operations.filter((op) => op.type === "write").length} file(s)`
              : "",
            operations.filter((op) => op.type === "delete").length > 0
              ? `Deleted ${operations.filter((op) => op.type === "delete").length} file(s)`
              : "",
            operations.filter((op) => op.type === "rename").length > 0
              ? `Renamed ${operations.filter((op) => op.type === "rename").length} file(s)`
              : "",
            operations.filter((op) => op.type === "dependency").length > 0
              ? `Added ${operations.filter((op) => op.type === "dependency").length} dependenc${operations.filter((op) => op.type === "dependency").length > 1 ? "ies" : "y"}`
              : "",
          ]
            .filter(Boolean)
            .join(", ") + ".";

    sendChatMessage(userId, appName, responseMessage, false); // fire-and-forget

    return {
      success: true,
      operations: operations.map((op) => op.type),
    };
  } catch (error) {
    // Only catch actionable errors
    try {
      await sendChatMessage(
        userId,
        appName,
        "Sorry, I encountered an error processing your request.",
        false
      );
    } catch {}
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Message processing failed.",
    };
  }
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
  // MOve the deploy-preview api route here? We just need to pass update machine with the files
  let result;
  try {
    result = await fetch("/api/deploy-preview", {
      method: "POST",
      body: JSON.stringify({ files, userId }),
    });
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
