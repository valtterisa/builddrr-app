"use server";

import { systemPrompt } from "@/lib/prompts/system";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { generateServerFiles } from "@/lib/server";

export async function generateAIResponse(prompt: string): Promise<void> {
  try {
    // Removed await from streamText based on user input
    const result = streamText({
      system: systemPrompt,
      prompt: prompt,
      temperature: 0,
      model: anthropic("claude-3-7-sonnet-20250219"),
      maxTokens: 2000,
      onError: ({ error }) => {
        console.error("AI Stream Error:", error);
      },
      onFinish: ({ finishReason, usage }) => {
        console.log("AI Stream Finished:", { finishReason, usage });
      },
    });

    const reader = result.textStream.getReader();
    // Removed TextDecoder based on user input
    let buffer = "";

    const siteforgeWriteRegex =
      /<siteforge-write file="([^"]+)">([\s\S]*?)<\/siteforge-write>/;
    const siteforgeCodeRegex = /<siteforge-code>([\s\S]*?)<\/siteforge-code>/;
    const siteforgeAddDependencyRegex =
      /<siteforge-add-dependency name="([^"]+)"\/>/;

    console.log("Starting incremental processing of AI stream...");

    while (true) {
      // Assuming reader.read() resolves correctly without await on streamText
      // check if value is string. Also add other file tag processings. Like siteforge-update, siteforge-delete, etc.
      const { done, value } = await reader.read(); // value is treated as string
      if (done) {
        processBuffer();
        if (buffer.trim().length > 0) {
          console.warn("Remaining unprocessed buffer content at end:", buffer);
        }
        break;
      }
      console.log("Received value:", value);
      buffer += value;
      processBuffer();
    }

    console.log("Incremental processing complete.");

    function processBuffer() {
      let changed = true;
      while (changed) {
        changed = false;
        buffer = buffer.trimStart();

        const writeMatch = buffer.match(siteforgeWriteRegex);
        if (writeMatch && buffer.startsWith(writeMatch[0])) {
          const fullMatch = writeMatch[0];
          try {
            // console.log("Processing write block:", writeMatch[1]); // Optional: uncomment for debug
            generateServerFiles(fullMatch);
          } catch (e) {
            console.error(
              `Error processing write block for ${writeMatch[1]}:`,
              e
            );
          }
          buffer = buffer.substring(fullMatch.length);
          changed = true;
          continue;
        }

        const codeMatch = buffer.match(siteforgeCodeRegex);
        if (codeMatch && buffer.startsWith(codeMatch[0])) {
          const fullMatch = codeMatch[0];
          try {
            // console.log("Processing code block..."); // Optional: uncomment for debug
            generateServerFiles(fullMatch);
          } catch (e) {
            console.error(`Error processing code block:`, e);
          }
          buffer = buffer.substring(fullMatch.length);
          changed = true;
          continue;
        }

        const depMatch = buffer.match(siteforgeAddDependencyRegex);
        if (depMatch && buffer.startsWith(depMatch[0])) {
          const fullMatch = depMatch[0];
          try {
            // console.log("Processing dependency tag:", depMatch[1]); // Optional: uncomment for debug
            generateServerFiles(fullMatch);
          } catch (e) {
            console.error(`Error processing dependency ${depMatch[1]}:`, e);
          }
          buffer = buffer.substring(fullMatch.length);
          changed = true;
          continue;
        }
      }
    }
  } catch (error) {
    console.error("Error in generateAIResponse:", error);
    throw new Error("Failed during AI response generation or processing.");
  }
}
