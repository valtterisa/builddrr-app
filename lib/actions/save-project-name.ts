"use server";

import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@ai-sdk/anthropic";

export async function generateProjectName(userPrompt: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: anthropic("claude-3-haiku-20240307"),
      prompt: `Based on this user request: "${userPrompt}"

Generate a short, descriptive, and professional website name (2-4 words max) that captures the essence of what the user wants to build. The name should be:
- Memorable and brandable
- Professional sounding
- Related to the website's purpose
- Easy to type and remember
- No special characters, just letters, numbers, and spaces

Examples:
- "Make a website for my coffee shop" → "Coffee Corner"
- "Create a portfolio for my photography" → "Photo Portfolio"
- "Build a landing page for my startup" → "Startup Landing"
- "Make a blog about cooking" → "Cooking Blog"

Respond with ONLY the website name, nothing else.`,
      maxTokens: 50,
      temperature: 0.7,
    });

    // Clean and validate the generated name
    const cleanedName = text
      .trim()
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .split("\n")[0] // Take only the first line
      .replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, hyphens
      .replace(/\s+/g, " ") // Normalize multiple spaces to single space
      .trim();

    // Ensure it's not too long and has minimum length
    const finalName = cleanedName.slice(0, 50);

    if (finalName.length < 2) {
      throw new Error("Generated name is too short");
    }

    return finalName;
  } catch (error) {
    console.error("AI name generation failed:", error);
    return "";
  }
}

export async function generateAndSaveProjectName(
  appName: string,
  userPrompt: string
): Promise<{ success: boolean; name?: string; error?: string }> {
  try {
    // Generate a user-friendly name using AI
    const generatedName = await generateProjectName(userPrompt);

    // Save the generated name to the database
    const supabase = await createClient();
    const { error } = await supabase
      .from("websites")
      .update({ display_name: generatedName })
      .eq("app_name", appName);

    if (error) {
      console.error("Failed to save project name:", error);
      return { success: false, error: "Failed to save project name" };
    }

    return { success: true, name: generatedName };
  } catch (error) {
    console.error("Error in generateAndSaveProjectName:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
