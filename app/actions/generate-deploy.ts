"use server";

import { revalidatePath } from "next/cache";
import { generateAppName, parseAIResponse } from "@/lib/utils";
import { createAppAndAssignMachine } from "@/lib/fly";

type GenerateDeployResult = {
  success: boolean;
  machine?: any; // @TODO: Define the type of the machine
  error?: string;
};

/**
 * Server action to generate a website from a prompt and deploy it to Fly.io
 *
 * @param userId The authenticated user ID
 * @param prompt The user's prompt for AI website generation
 * @returns Result with website and deployment information
 */
export async function generateAndDeployWebsite(
  userId: string,
  prompt: string
): Promise<GenerateDeployResult> {
  try {
    console.log(
      `Starting website generation for user ${userId} with prompt: ${prompt}`
    );

    // 1. Generate website content with AI (using mock data for now)
    console.log("Getting mock AI content...");
    // const aiResponse = await generateAIResponse(prompt); // COMMENTED OUT: Real AI generation
    const aiResponse = await getMockAIResponse(); // USING MOCK RESPONSE

    if (!aiResponse) {
      throw new Error("Failed to generate website content");
    }

    const files = await parseAIResponse(aiResponse);

    if (files.length === 0) {
      throw new Error("No valid file operations found in AI response");
    }

    console.log(`Found ${files.length} file operations in AI response`);

    const appName = generateAppName(userId);
    if (
      !appName ||
      appName.length < 3 ||
      appName.length > 30 ||
      !/^[a-z0-9-]+$/.test(appName) ||
      appName.startsWith("-") ||
      appName.endsWith("-")
    ) {
      throw new Error(`Generated app name '${appName}' is invalid for Fly.io`);
    }

    console.log(`Creating new Fly.io app: ${appName}`);

    // returns machine: {}
    const result = await createAppAndAssignMachine(userId, appName, files);

    if (!result.success || !result.machine) {
      throw new Error("Failed to create app and assign machine");
    }

    const machineId = result.machine.machine_id;
    const url = result.machine.url;

    console.log(`Machine ID: ${machineId}, App: ${appName}`);

    // 7. Revalidate relevant paths to update UI
    revalidatePath("/dashboard/website/all");
    revalidatePath(`/dashboard/website/editor/${appName}`);

    console.log("Website deployment completed");

    return {
      success: result.success,
      machine: result.machine,
    };
  } catch (error) {
    console.error("Error in generateAndDeployWebsite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
