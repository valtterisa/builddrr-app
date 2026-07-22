import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  let rand = randomString(16);
  let appName = `floras-preview-${userPart}-${rand}`;
  // Remove any non-alphanumeric or dash, and ensure no leading/trailing dash
  appName = appName.replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
  // Enforce length and no leading/trailing dash
  if (appName.length > 30) appName = appName.slice(0, 30);
  if (appName.length < 3) appName = appName + randomString(3 - appName.length);
  appName = appName.replace(/^-+|-+$/g, "");
  return appName;
}
