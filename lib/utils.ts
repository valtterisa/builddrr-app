import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFlyRegistryUrl(appName: string): string {
  return `registry.fly.io/${appName}`;
}

/**
 * Create a unique app name for a user's website
 * @param userId User ID
 * @returns A unique app name valid for Fly.io
 */
export function randomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateAppName(userId: string): string {
  // Use only lowercase alphanumeric for userId
  let userPart = userId
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()
    .slice(0, 8);
  if (!userPart) userPart = randomString(6);
  let rand = randomString(8);
  let appName = `app-${userPart}-${rand}`;
  // Remove any non-alphanumeric or dash, and ensure no leading/trailing dash
  appName = appName.replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
  // Enforce length and no leading/trailing dash
  if (appName.length > 30) appName = appName.slice(0, 30);
  if (appName.length < 3) appName = appName + randomString(3 - appName.length);
  appName = appName.replace(/^-+|-+$/g, "");
  return appName;
}

import { FileOperation } from "./types";

// Helper function to parse AI-generated content into file operations
export async function parseAIResponse(
  aiResponse: string
): Promise<FileOperation[]> {
  const fileOperations: FileOperation[] = [];

  // Extract <siteforge-write> blocks
  const fileBlockRegex =
    /<siteforge-write file="([^"]+)">([\s\S]*?)<\/siteforge-write>/g;
  let match;

  while ((match = fileBlockRegex.exec(aiResponse)) !== null) {
    const filePath = match[1];
    let content = match[2].trim();

    // Clean up any extra indentation or formatting
    content = content.replace(/^\s+/gm, "");

    // No need to escape content anymore since we're using base64 encoding
    // when writing to Fly.io machines

    fileOperations.push({
      path: filePath.startsWith("/") ? filePath.substring(1) : filePath,
      content: content,
    });
  }

  // Extract dependencies if present
  const dependencyRegex =
    /<siteforge-add-dependency>([\s\S]*?)<\/siteforge-add-dependency>/g;
  let depMatch;

  if ((depMatch = dependencyRegex.exec(aiResponse)) !== null) {
    const dependencies = depMatch[1].trim().split("\n");

    // Create or update package.json with the dependencies
    fileOperations.push({
      path: "package.json",
      content: JSON.stringify(
        {
          dependencies: dependencies.reduce(
            (acc, dep) => {
              acc[dep.trim()] = "latest";
              return acc;
            },
            {} as Record<string, string>
          ),
        },
        null,
        2
      ),
    });
  }

  return fileOperations;
}
