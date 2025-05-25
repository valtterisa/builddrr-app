"use server";

import { systemPrompt } from "@/lib/prompts/system";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { redis } from "@/lib/redis";

interface Operation {
  operation: "write" | "update" | "delete" | "code" | "dependency";
  path?: string;
  content?: string;
  dependency?: string;
}

export async function generateAIResponse(prompt: string): Promise<Operation[]> {
  const operations: Operation[] = [];

  try {
    const result = streamText({
      system: systemPrompt,
      prompt: prompt,
      temperature: 0,
      model: anthropic("claude-3-7-sonnet-20250219"),
      maxTokens: 4000, // Increased tokens as input example is large
      onError: ({ error }) => {
        console.error("AI Stream Error:", error);
      },
      onFinish: ({ finishReason, usage }) => {
        console.log("AI Stream Finished:", { finishReason, usage });
      },
    });

    const reader = result.textStream.getReader();
    let buffer = "";

    const siteforgeWriteRegex =
      /<siteforge-write file="([^"]+)">([\s\S]*?)<\/siteforge-write>/;
    const siteforgeUpdateRegex =
      /<siteforge-update file="([^"]+)">([\s\S]*?)<\/siteforge-update>/;
    const siteforgeDeleteRegex = /<siteforge-delete file="([^"]+)"\/>/;
    const siteforgeCodeRegex = /<siteforge-code>([\s\S]*?)<\/siteforge-code>/;
    const siteforgeAddDependencyRegex =
      /<siteforge-add-dependency name="([^"]+)"\/>/;

    console.log(
      "Starting incremental processing of AI stream for operations..."
    );

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        processBuffer();
        if (buffer.trim().length > 0) {
          console.warn("Remaining unprocessed buffer content at end:", buffer);
        }
        break;
      }

      buffer += value;

      processBuffer();
    }

    console.log(
      "Incremental processing complete. Found operations:",
      operations.length
    );
    return operations;

    function processBuffer() {
      let changed = true;
      while (changed) {
        changed = false;

        // Find the index of the first occurrence of each tag
        const writeMatchInfo = findFirstMatch(buffer, siteforgeWriteRegex);
        const updateMatchInfo = findFirstMatch(buffer, siteforgeUpdateRegex);
        const deleteMatchInfo = findFirstMatch(buffer, siteforgeDeleteRegex);
        const codeMatchInfo = findFirstMatch(buffer, siteforgeCodeRegex);
        const depMatchInfo = findFirstMatch(
          buffer,
          siteforgeAddDependencyRegex
        );

        // Find the earliest match among all tags
        let earliestMatch: {
          index: number;
          length: number;
          type: Operation["operation"];
          data: any;
        } | null = null;

        const matches = [
          {
            type: "write" as const,
            info: writeMatchInfo,
            dataExtractor: (m: RegExpMatchArray) => ({
              path: m[1],
              content: m[2].trim(),
            }),
          },
          {
            type: "update" as const,
            info: updateMatchInfo,
            dataExtractor: (m: RegExpMatchArray) => ({
              path: m[1],
              content: m[2].trim(),
            }),
          },
          {
            type: "delete" as const,
            info: deleteMatchInfo,
            dataExtractor: (m: RegExpMatchArray) => ({ path: m[1] }),
          },
          {
            type: "code" as const,
            info: codeMatchInfo,
            dataExtractor: (m: RegExpMatchArray) => ({
              content: m[1].trim(),
              path: "generated-code.tsx",
            }),
          },
          {
            type: "dependency" as const,
            info: depMatchInfo,
            dataExtractor: (m: RegExpMatchArray) => ({ dependency: m[1] }),
          },
        ];

        for (const matchAttempt of matches) {
          if (matchAttempt.info) {
            if (
              earliestMatch === null ||
              matchAttempt.info.index < earliestMatch.index
            ) {
              earliestMatch = {
                index: matchAttempt.info.index,
                length: matchAttempt.info.match[0].length,
                type: matchAttempt.type,
                data: matchAttempt.dataExtractor(matchAttempt.info.match),
              };
            }
          }
        }

        if (earliestMatch !== null) {
          operations.push({
            operation: earliestMatch.type,
            ...earliestMatch.data,
          });
          console.log(`Parsed ${earliestMatch.type} operation.`);
          buffer = buffer.substring(earliestMatch.index + earliestMatch.length);
          changed = true;
        }
      }
    }

    function findFirstMatch(
      text: string,
      regex: RegExp
    ): { match: RegExpMatchArray; index: number } | null {
      const match = text.match(regex);
      if (match && match.index !== undefined) {
        return { match, index: match.index };
      }
      return null;
    }
  } catch (error) {
    console.error("Error in generateAIResponse:", error);
    return [];
  }
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Chat message functions
export async function getChatMessages(userId: string, appName: string) {
  if (!userId || !appName) {
    return [];
  }

  try {
    const chatKey = `chat:${userId}:${appName}`;
    const messages = await redis.lrange(chatKey, 0, -1);

    if (!messages || messages.length === 0) {
      return [];
    }

    return messages.map((msg) => {
      const parsed = JSON.parse(msg.toString());
      return {
        id: parsed.id || Date.now().toString(),
        content: parsed.content,
        isUser: parsed.isUser,
        timestamp: new Date(parsed.timestamp),
      };
    });
  } catch (error) {
    console.error("Error fetching chat messages from Redis:", error);
    return [];
  }
}

export async function sendChatMessage(
  userId: string,
  appName: string,
  message: string,
  isUser: boolean = true
) {
  if (!userId || !appName || !message) {
    return { success: false, error: "Missing required parameters" };
  }

  try {
    const chatKey = `chat:${userId}:${appName}`;
    const timestamp = new Date().toISOString();

    const messageObj = {
      id: Date.now().toString(),
      content: message,
      isUser,
      timestamp,
    };

    await redis.rpush(chatKey, JSON.stringify(messageObj));
    return { success: true, message: messageObj };
  } catch (error) {
    console.error("Error saving chat message to Redis:", error);
    return { success: false, error: "Failed to save message" };
  }
}

export async function processChatMessage(
  userId: string,
  appName: string,
  message: string
) {
  // Save the user message
  await sendChatMessage(userId, appName, message, true);

  // Process the message (in a real app, this would involve AI/LLM processing)
  // Here we're just sending back a simple response
  const response = `I've received your message: "${message}". What would you like to do next?`;

  // Save the assistant's response
  return await sendChatMessage(userId, appName, response, false);
}

export async function getVirtualFileSystem(userId: string, appName: string) {
  if (!userId || !appName) {
    return null;
  }

  try {
    const vfsKey = `vfs:${userId}:${appName}`;
    const vfsData = await redis.get(vfsKey);

    if (!vfsData) {
      return null;
    }

    return JSON.parse(vfsData.toString());
  } catch (error) {
    console.error("Error fetching VFS from Redis:", error);
    return null;
  }
}

export async function updateVirtualFileSystem(
  userId: string,
  appName: string,
  files: any
) {
  if (!userId || !appName || !files) {
    return { success: false, error: "Missing required parameters" };
  }

  try {
    const vfsKey = `vfs:${userId}:${appName}`;
    await redis.set(vfsKey, JSON.stringify(files));
    return { success: true };
  } catch (error) {
    console.error("Error updating VFS in Redis:", error);
    return { success: false, error: "Failed to update virtual file system" };
  }
}
