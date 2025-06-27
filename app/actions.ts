"use server";

import { systemPrompt } from "@/lib/prompts/system";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { redis } from "@/lib/redis";
import type { builddrrOperation, StreamingChunk } from "@/lib/types";

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
        if (typeof messages[i] === 'string') {
          msg = messages[i] as string;
        } else if (messages[i] && typeof messages[i] === 'object') {
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
          console.log(`Message ${i} is not JSON, treating as plain text:`, msg.substring(0, 100));
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
          timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : new Date(parsed.timestamp || Date.now()).toISOString(),
        });
      } catch (parseError) {
        console.error(`Failed to parse message at index ${i}:`, parseError, "Raw message:", messages[i]);
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
          setTimeout(() => reject(new Error("Redis message save timeout")), 5000)
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
        buffer = buffer.slice((writeMatch.index || 0) + writeMatch[0].length);
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
        buffer = buffer.slice((deleteMatch.index || 0) + deleteMatch[0].length);
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
        buffer = buffer.slice((renameMatch.index || 0) + renameMatch[0].length);
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
        buffer = buffer.slice((depMatch.index || 0) + depMatch[0].length);
        matched = true;
        continue;
      }
    }
  }

  return { files, deletes, renames, dependencies, operations };
}

export async function generateSite(
  prompt: string,
  userId: string,
  appName: string,
  machineId: string
) {
  console.log("📥 generateSite started with prompt length:", prompt.length);

  let filesObj: Record<string, string> = {};
  try {
    const { files } = await generateAIResponse(prompt);
    filesObj = files;
    if (!files || Object.keys(files).length === 0) {
      return {
        success: false,
        error:
          "AI returned an empty response. Please try again with a clearer prompt.",
      };
    }
  } catch (aiError) {
    return {
      success: false,
      error: aiError instanceof Error ? aiError.message : String(aiError),
    };
  }

  try {
    return await deployPreview(filesObj, appName, machineId);
  } catch (deployError) {
    return {
      success: true,
      machine: { id: "error-machine-id", name: appName },
    };
  }
}

// Update files in fly.io
async function deployPreview(files: Record<string, string>, appName: string, machineId: string) {

  // Convert files object to array of { path, content }
  const normalizedFiles = Object.entries(files).map(([path, content]) => ({
    guest_path: `/app/${path}`,
    raw_value: Buffer.from(content, "utf-8").toString("base64"),
  }));

  console.log("[deployPreview] normalizedFiles:", normalizedFiles);
  console.log("[deployPreview] appName:", appName);
  console.log("[deployPreview] machineId:", machineId);
  if (!normalizedFiles.length || !appName || !machineId) {
    return { error: "Missing required fields" }
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
    const machineConfig = machineData.find((m: any) => m.id === machineId)?.config;
    if (!machineConfig) {
      return { error: "Machine not found" }
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
    return { machine: data, machineId, appName }
  } catch (err: any) {
    return { error: err?.message || err }
  }
}


export async function* generateFileUpdatesStream(message: string, currentFiles: Record<string, string>): AsyncGenerator<{ type: 'analysis' | 'done', content?: string, operations?: Operation[] }, void, unknown> {
  console.log("[generateFileUpdatesStream] called with message:", message);
  console.log("[generateFileUpdatesStream] currentFiles keys:", Object.keys(currentFiles));
  const fileUpdatePrompt = `
You are builddrr, a professional AI frontend engineer. A user is asking to update their website code.

Current project files:
${Object.keys(currentFiles)
      .map((path) => `- ${path}`)
      .join("\n")}

Based on the user's request, first narrate your reasoning and plan in a <component-analysis>...</component-analysis> block (markdown, conversational, detailed). Then, determine which files need to be updated, created, renamed, or deleted. When responding, use the format:

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
  let inBlock = false;
  let done = false;
  let codeBuffer = "";
  let codeBlockStarted = false;

  console.log("[generateFileUpdatesStream] Streaming started");
  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;
    if (value) buffer += value;
    console.log("[generateFileUpdatesStream] Buffer so far:", buffer);

    // Stream <component-analysis> block
    while (true) {
      if (!inBlock) {
        const startIdx = buffer.indexOf("<component-analysis>");
        if (startIdx !== -1) {
          inBlock = true;
          buffer = buffer.slice(startIdx + "<component-analysis>".length);
          console.log("[generateFileUpdatesStream] <component-analysis> block started");
        } else {
          break;
        }
      }
      if (inBlock) {
        const endIdx = buffer.indexOf("</component-analysis>");
        if (endIdx !== -1) {
          const chunk = buffer.slice(0, endIdx);
          if (chunk) {
            console.log("[generateFileUpdatesStream] Yielding analysis chunk:", chunk);
            yield { type: 'analysis', content: chunk };
          }
          buffer = buffer.slice(endIdx + "</component-analysis>".length);
          inBlock = false;
          codeBlockStarted = true;
          codeBuffer += buffer;
          buffer = "";
          break;
        } else {
          if (buffer) {
            console.log("[generateFileUpdatesStream] Yielding analysis buffer:", buffer);
            yield { type: 'analysis', content: buffer };
            buffer = "";
          }
          break;
        }
      }
    }
    if (codeBlockStarted && buffer) {
      codeBuffer += buffer;
      buffer = "";
    }
  }
  console.log("[generateFileUpdatesStream] Streaming done. codeBuffer:", codeBuffer);
  const operations: Operation[] = [];
  const codeMatch = codeBuffer.match(/<builddrr-code>([\s\S]*?)<\/builddrr-code>/);
  if (codeMatch && codeMatch[1]) {
    const codeBlock = codeMatch[1].trim();
    // Extract write operations
    const writeMatches = [...codeBlock.matchAll(/<builddrr-write file="([^"]+)">([\s\S]*?)<\/builddrr-write>/g)];
    for (const match of writeMatches) {
      operations.push({ operation: "write", path: match[1], content: match[2].trim() });
    }
    // Extract delete operations
    const deleteMatches = [...codeBlock.matchAll(/<builddrr-delete file="([^"]+)"\/>/g)];
    for (const match of deleteMatches) {
      operations.push({ operation: "delete", path: match[1] });
    }
    // Extract rename operations
    const renameMatches = [...codeBlock.matchAll(/<builddrr-rename file="([^"]+)" newPath="([^"]+)"\/>/g)];
    for (const match of renameMatches) {
      operations.push({ operation: "rename", path: match[1], newPath: match[2] });
    }
    // Extract dependency operations
    const depMatches = [...codeBlock.matchAll(/<builddrr-add-dependency>([\s\S]*?)<\/builddrr-add-dependency>/g)];
    for (const match of depMatches) {
      const deps = match[1].trim().split("\n").filter((dep) => dep.trim() !== "");
      for (const dep of deps) {
        operations.push({ operation: "dependency", dependency: dep.trim() });
      }
    }
  }
  console.log("[generateFileUpdatesStream] Yielding done with operations:", operations);
  yield { type: 'done', operations };
}

export async function* generateAIResponseStream(
  prompt: string,
  appName: string,
  machineId: string
): AsyncGenerator<
  | { type: 'analysis'; content: string }
  | { type: 'progress'; status: string; files?: string[] }
  | { type: 'error'; error: string },
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
  let inAnalysisBlock = false;
  let inCodeBlock = false;
  let codeBuffer = "";
  let currentFile = null;
  const collectedFiles: Record<string, string> = {};

  // Regexes (tolerant to whitespace)
  const writeStart = /<builddrr-write\s+file="([^"]+)"\s*>/i;
  const writeEnd = /<\/builddrr-write>/i;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;

    // Stream <component-analysis> block
    while (true) {
      if (!inAnalysisBlock) {
        const startIdx = buffer.indexOf("<component-analysis>");
        if (startIdx !== -1) {
          inAnalysisBlock = true;
          buffer = buffer.slice(startIdx + "<component-analysis>".length);
        } else {
          break;
        }
      }
      if (inAnalysisBlock) {
        const endIdx = buffer.indexOf("</component-analysis>");
        if (endIdx !== -1) {
          const chunk = buffer.slice(0, endIdx);
          if (chunk) {
            yield { type: 'analysis', content: chunk };
          }
          buffer = buffer.slice(endIdx + "</component-analysis>".length);
          inAnalysisBlock = false;
        } else {
          if (buffer) {
            yield { type: 'analysis', content: buffer };
            buffer = "";
          }
          break;
        }
      }
    }

    // Robustly collect <builddrr-write> blocks in memory
    while (true) {
      if (!inCodeBlock) {
        const writeMatch = buffer.match(writeStart);
        if (writeMatch) {
          inCodeBlock = true;
          currentFile = writeMatch[1].startsWith("/") ? writeMatch[1].substring(1) : writeMatch[1];
          buffer = buffer.slice((writeMatch.index || 0) + writeMatch[0].length);
          codeBuffer = "";
        } else {
          break;
        }
      }
      if (inCodeBlock) {
        const endMatch = buffer.match(writeEnd);
        if (endMatch) {
          codeBuffer += buffer.slice(0, endMatch.index || 0);
          // Collect in memory
          if (typeof currentFile === 'string') {
            collectedFiles[currentFile] = codeBuffer.trim();
            console.log(`[AIResponseStream] Collected file: ${currentFile}, length: ${codeBuffer.length}`);
          }
          buffer = buffer.slice((endMatch.index || 0) + endMatch[0].length);
          inCodeBlock = false;
          currentFile = null;
          codeBuffer = "";
        } else {
          // Buffer is incomplete, wait for next chunk
          codeBuffer += buffer;
          buffer = "";
          break;
        }
      }
    }

    // Log any suspicious leftover buffer (not in code/analysis block)
    if (!inAnalysisBlock && !inCodeBlock && buffer.length > 1000) {
      console.warn('[AIResponseStream] Large unmatched buffer:', buffer.slice(0, 500));
      buffer = '';
    }
  }

  // After streaming is done, deploy all collected files
  console.log(`[AIResponseStream] Streaming completed. Total files collected: ${Object.keys(collectedFiles).length}`);
  console.log(`[AIResponseStream] Collected files:`, Object.keys(collectedFiles));

  if (Object.keys(collectedFiles).length > 0) {
    console.log(`[AIResponseStream] Starting deployment with ${Object.keys(collectedFiles).length} files`);
    yield { type: 'progress', status: 'deploying', files: Object.keys(collectedFiles) };
    try {
      const deployResult = await deployPreview(collectedFiles, appName, machineId);
      console.log(`[AIResponseStream] Deployment result:`, deployResult);
      if (deployResult.error) {
        yield { type: 'error', error: deployResult.error };
      } else {
        yield { type: 'progress', status: 'deployed', files: Object.keys(collectedFiles) };
      }
    } catch (err: any) {
      console.error(`[AIResponseStream] Deployment error:`, err);
      yield { type: 'error', error: err?.message || String(err) };
    }
  } else {
    console.log(`[AIResponseStream] No files collected, skipping deployment`);
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
        if (typeof msg === 'string') {
          msgString = msg;
        } else if (msg && typeof msg === 'object') {
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
          timestamp: parsed.timestamp
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

