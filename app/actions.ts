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

    console.log("result: ", result)

    const fullText = await result.text
    return {
      id: generateId(),
      fullText,
      // For compatibility with client components that might expect a stream
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(fullText))
          controller.close()
        },
      }),
    }
  } catch (error) {
    console.error("Error generating response:", error)
    const errorMessage = "An error occurred while generating the response."

    return {
      error: errorMessage
    }
  }
}
