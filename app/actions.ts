"use server";

import { systemPrompt } from "@/lib/prompts/system";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { redis } from "@/lib/redis";

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
        const msg = messages[i].toString();
        if (!msg || msg.trim() === "") continue;
        const parsed = JSON.parse(msg);
        parsedMessages.push({
          id: parsed.id || `generated-${Date.now()}-${i}`,
          content: parsed.content || "",
          isUser: !!parsed.isUser,
          timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : new Date(parsed.timestamp || Date.now()).toISOString(),
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

  // Convert Record<string, string> to FileOperation[]
  const files = Object.entries(filesObj).map(([path, content]) => ({
    path,
    content,
  }));

  try {
    return await deployPreview(files, appName, machineId);
  } catch (deployError) {
    return {
      success: true,
      machine: { id: "error-machine-id", name: appName },
    };
  }
}

// Update files in fly.io
async function deployPreview(files: any[], appName: string, machineId: string) {

  const normalizedFiles = Array.isArray(files) ? files : files ? [files] : [];

  if (!normalizedFiles.length || !appName || !machineId) {
    return { error: "Missing required fields" }
  }

  try {
    const filesPayload = normalizedFiles.map(
      (file: { path: string; content: string }) => ({
        guest_path: file.path,
        raw_value: Buffer.from(file.content, "utf-8").toString("base64"),
      })
    );
    const FLY_API_TOKEN = process.env.FLY_API_TOKEN!;

    // Get specific machine, copy config, update config, continue
    // This should be correct only thing is can this be called from the action? answer is no i think
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
      return { error: "Machine not found" }
    }

    // Update config
    machineConfig.files = filesPayload;

    const updateRes = await fetch(
      `https://api.machines.dev/v1/apps/${appName}/machines/${machineId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FLY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: machineConfig,
        }),
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

export async function* generateStream(prompt: string, appName: string, machineId: string): AsyncGenerator<{ type: 'analysis' | 'done', content?: string, result?: any }, void, unknown> {
  const result = streamText({
    system: systemPrompt,
    prompt,
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

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;
    if (value) buffer += value;

    // Stream <code-analysis> block
    while (true) {
      if (!inBlock) {
        const startIdx = buffer.indexOf("<code-analysis>");
        if (startIdx !== -1) {
          inBlock = true;
          buffer = buffer.slice(startIdx + "<code-analysis>".length);
        } else {
          // No block start yet, wait for more data
          break;
        }
      }
      if (inBlock) {
        const endIdx = buffer.indexOf("</code-analysis>");
        if (endIdx !== -1) {
          // End of block found, yield up to end
          const chunk = buffer.slice(0, endIdx);
          if (chunk) yield { type: 'analysis', content: chunk };
          buffer = buffer.slice(endIdx + "</code-analysis>".length);
          inBlock = false;
          codeBlockStarted = true;
          codeBuffer += buffer; // Start buffering the rest for code
          buffer = "";
          break;
        } else {
          // No end yet, yield all and wait for more
          if (buffer) {
            yield { type: 'analysis', content: buffer };
            buffer = "";
          }
          break;
        }
      }
    }
    // After <code-analysis>, buffer the rest for code processing
    if (codeBlockStarted && buffer) {
      codeBuffer += buffer;
      buffer = "";
    }
  }

  // After streaming, process <builddrr-code> blocks
  let deployResult = null;
  const codeMatch = codeBuffer.match(/<builddrr-code>([\s\S]*?)<\/builddrr-code>/);
  if (codeMatch && codeMatch[1]) {
    // You can parse and deploy here, e.g.:
    // deployResult = await deployPreview(...)
    // For now, just return the code block
    deployResult = codeMatch[1].trim();
  }
  yield { type: 'done', result: deployResult };
}

export async function* generateFileUpdatesStream(message: string, currentFiles: Record<string, string>): AsyncGenerator<{ type: 'analysis' | 'done', content?: string, operations?: Operation[] }, void, unknown> {
  const fileUpdatePrompt = `
You are builddrr, a professional AI frontend engineer. A user is asking to update their website code.

Current project files:
${Object.keys(currentFiles)
      .map((path) => `- ${path}`)
      .join("\n")}

Based on the user's request, first narrate your reasoning and plan in a <code-analysis>...</code-analysis> block (markdown, conversational, detailed). Then, determine which files need to be updated, created, renamed, or deleted. When responding, use the format:

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

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    done = streamDone;
    if (value) buffer += value;

    // Stream <code-analysis> block
    while (true) {
      if (!inBlock) {
        const startIdx = buffer.indexOf("<code-analysis>");
        if (startIdx !== -1) {
          inBlock = true;
          buffer = buffer.slice(startIdx + "<code-analysis>".length);
        } else {
          // No block start yet, wait for more data
          break;
        }
      }
      if (inBlock) {
        const endIdx = buffer.indexOf("</code-analysis>");
        if (endIdx !== -1) {
          // End of block found, yield up to end
          const chunk = buffer.slice(0, endIdx);
          if (chunk) yield { type: 'analysis', content: chunk };
          buffer = buffer.slice(endIdx + "</code-analysis>".length);
          inBlock = false;
          codeBlockStarted = true;
          codeBuffer += buffer; // Start buffering the rest for code
          buffer = "";
          break;
        } else {
          // No end yet, yield all and wait for more
          if (buffer) {
            yield { type: 'analysis', content: buffer };
            buffer = "";
          }
          break;
        }
      }
    }
    // After <code-analysis>, buffer the rest for code processing
    if (codeBlockStarted && buffer) {
      codeBuffer += buffer;
      buffer = "";
    }
  }

  // After streaming, process <builddrr-code> blocks
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
  yield { type: 'done', operations };
}

