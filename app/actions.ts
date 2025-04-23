"use server"

import { systemPrompt } from "@/lib/prompts/system"
import { anthropic } from "@ai-sdk/anthropic"
import { streamText, generateId } from "ai"

export async function generateAIResponse(prompt: string) {

  try {
    // Generate the streaming response
    const result = streamText({
      system: systemPrompt,
      prompt: prompt,
      temperature: 0,
      model: anthropic("claude-3-7-sonnet-20250219"),
      maxTokens: 1000,
      onError: ({ error }) => {
        console.error("Error:", error);
      },

      onFinish: ({ finishReason }) => {
        console.log("Finished with reason:", finishReason);
      },
      onStepFinish: (stepResult) => {
        console.log("Step finished:", stepResult);
      }
    });

    const reader = result.textStream.getReader();

    // gather value to one or return it and stream to generateFiles.
    // Streaming works now.
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break
      }
      console.log(value)
    }

  } catch (error) {
    console.error("Error generating response:", error)
    const errorMessage = "An error occurred while generating the response."

    return {
      error: errorMessage
    }
  }
}
