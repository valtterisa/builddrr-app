import { generateText } from "ai";

import { openai } from "@ai-sdk/openai";

import { systemPrompt } from "@/lib/prompts/system";

export default async function generateWebsite(prompt: string) {
    // Generate content using AI

    const { text } = await generateText({
        system: systemPrompt,
        prompt: prompt,

        model: openai("gpt-4o"),
    });

    const generatedContent = text;

    return generatedContent.trim();
}
