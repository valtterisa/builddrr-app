"use server";

import { getWebsite, updateWebsite } from "./database";
import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";

/**
 * Delete a project by its ID (UUID).
 * This will call the backend /api/delete-project endpoint with the correct parameters.
 * @param id The website/project UUID
 * @returns Result of the deletion operation
 */
export async function deleteProjectById(id: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
}> {
  try {
    // Get the website/project from Supabase
    const website = await getWebsite(id);
    if (!website) {
      return { success: false, error: "Project not found" };
    }
    if (!website.app_name) {
      return { success: false, error: "Project app_name not found" };
    }

    // Prepare parameters for the backend API
    const gitlabRepo = `bittive-group/${website.app_name}`;
    const cloudflareProject = website.app_name;
    const slug = website.app_name;

    // Call the backend API endpoint
    const response = await fetch("http://localhost:3001/api/delete-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gitlabRepo, cloudflareProject, slug }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: "Failed to delete project. Try again later.",
        details: result.details,
      };
    }

    // Mark the website record as deleted in Supabase (set deleted_at to now)
    await updateWebsite(id, { deleted_at: new Date().toISOString() });

    return {
      success: true,
      message: result.message || "Project deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Unknown error",
    };
  }
}

/**
 * Deploy an existing website by its ID
 *
 * @param websiteId The website's unique identifier
 * @returns Deployment result with status and URL information
 */
export async function deployWebsite(websiteId: string): Promise<{
  success: boolean;
  data?: {
    url?: string;
    status?: string;
    message?: string;
  };
  error?: string;
}> {
  try {
    // Call the new deployment API route
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/deploy`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteId }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || "Deployment failed" };
    }
    return {
      success: true,
      data: {
        url: data.url,
        status: data.status,
        message: data.message,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if an app is available to be allocated to a user
 * @param appName The name of the app to check (slug)
 * @returns True if the app exists, false otherwise
 */
export async function checkAppAvailability(appName: string): Promise<boolean> {
  // Check supabase if app is allocated to a user
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("preview_environments")
    .select("*")
    .eq("app_name", appName)
    .eq("status", "active");

  // If data is null app does not exist
  if (!data) {
    return false;
  }

  // If data is not null app exists
  return true;
}

/**
 * Start a machine
 * @param appName The name of the app
 * @param machineId The ID of the machine to start
 * @returns True if the machine was started, false otherwise
 */
export async function startMachine(appName: string, machineId: string) {
  console.log("Starting machine", appName, machineId);
  try {
    const response = await fetch(
      `${process.env.FLY_API_BASE}/v1/apps/${appName}/machines/${machineId}/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
        },
      }
    );
    const data = await response.json();
    console.log("Machine started", data);

    const machineState = await fetch(
      `${process.env.FLY_API_BASE}/v1/apps/${appName}/machines/${machineId}/wait?state=started`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
        },
      }
    );
    const machineStateData = await machineState.json();
    console.log("Machine state", machineStateData);

    return { started: "ok" };
  } catch (error) {
    console.error("Error starting machine:", error);
    return { started: "error" };
  }
}

import { execFile } from "child_process";
import { randomUUID } from "crypto";

export interface CreateAppsOptions {
  count: number;
  orgSlug: string;
  image: string;
}

export interface CreateAppsResult {
  appNames: string[];
}

function flyLaunch(
  orgSlug: string,
  appName: string,
  image: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = "fly";
    const args = [
      "launch",
      "--config",
      "fly.toml",
      "--org",
      orgSlug,
      "--name",
      appName,
      "--now",
      "--image",
      image,
      "--yes",
      "--detach",
      "--ha=false",
      "--vm-cpu-kind",
      "shared",
      "--vm-memory",
      "512mb",
      "--vm-cpus",
      "1",
    ];
    execFile(cmd, args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`fly launch failed: ${stderr || error.message}`));
      } else {
        resolve(appName);
      }
    });
  });
}

export async function createApps(
  options: CreateAppsOptions
): Promise<CreateAppsResult> {
  const { count, orgSlug, image } = options;
  if (count < 1 || count > 100) {
    throw new Error("count must be between 1 and 100");
  }
  const appNames: string[] = [];
  for (let i = 0; i < count; i++) {
    const appName = `app-${randomUUID().replace(/-/g, "")}`;
    await flyLaunch(orgSlug, appName, image);
    appNames.push(appName);
  }
  return { appNames };
}
