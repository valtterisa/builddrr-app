"use server";

import { systemPrompt } from "@/lib/prompts/system";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

interface Operation {
  operation: "write" | "update" | "delete" | "code" | "dependency";
  path?: string;
  content?: string;
  dependency?: string;
}

export async function generateAIResponse(prompt: string): Promise<Operation[]> {
  const operations: Operation[] = [];

  try {
    const result = await streamText({
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
    const decoder = new TextDecoder();
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

      // buffer += value.trim();
      buffer += value;

      processBuffer();
    }

    console.log(
      "Incremental processing complete. Found operations:",
      operations.length
    );
    return operations;

    // --- Updated processBuffer Function ---
    function processBuffer() {
      let changed = true;
      while (changed) {
        changed = false;
        // No need to trim start here, as indexOf will find the first match

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

        // If an earliest match was found, process it
        if (earliestMatch !== null) {
          operations.push({
            operation: earliestMatch.type,
            ...earliestMatch.data,
          });
          console.log(`Parsed ${earliestMatch.type} operation.`);
          // Remove the processed part (including text before the match) from the buffer
          buffer = buffer.substring(earliestMatch.index + earliestMatch.length);
          changed = true; // Indicate a change was made, loop again
        }
        // If no match found in this pass, changed remains false, loop terminates
      }
    }

    // Helper function to find the first match and its index
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
    // --- End Updated processBuffer Function ---
  } catch (error) {
    console.error("Error in generateAIResponse:", error);
    return [];
  }
}
