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
    console.log(`Starting deployment for website ID: ${websiteId}`);

    // Step 1: Get website details from database to retrieve the app_name (slug)
    const website = await getWebsite(websiteId);

    if (!website) {
      throw new Error(`Website with ID ${websiteId} not found`);
    }

    if (!website.app_name) {
      throw new Error(
        `Website with ID ${websiteId} has no app_name (slug) configured`
      );
    }

    // Update status to "deploying" to indicate deployment in progress
    await updateWebsite(websiteId, {
      status: "deploying",
    });
    console.log(`Website status updated to "deploying"`);

    const appName = website.app_name;
    console.log(`Retrieved app name: ${appName} for website ID: ${websiteId}`);

    // Step 2: Call the deployment API
    console.log(`Calling deploy API with slug=${appName}`);
    const deployResponse = await fetch(`http://localhost:3001/api/deploy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug: appName }),
    });

    if (!deployResponse.ok) {
      const errorText = await deployResponse
        .text()
        .catch(() => "Unknown error");
      // Update status to reflect deployment failure
      await updateWebsite(websiteId, {
        status: "failed",
      });
      console.log(`Website status updated to "failed" due to deployment error`);
      throw new Error(
        `Deploy API returned status ${deployResponse.status}: ${errorText}`
      );
    }

    // Check content type to ensure it's JSON
    const contentType = deployResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // Update status to reflect deployment failure
      await updateWebsite(websiteId, {
        status: "failed",
      });
      console.log(
        `Website status updated to "failed" due to invalid response format`
      );
      throw new Error(
        `Deploy API did not return JSON. Content type: ${contentType}`
      );
    }

    const deployData = await deployResponse.json();
    console.log("Deploy API response:", deployData);

    // Step 3: Update website record with latest deployment info
    await updateWebsite(websiteId, {
      status: "deployed", // Update status to "deployed" after successful deployment
      last_deployed: new Date().toISOString(),
    });

    console.log(
      `Website record updated with latest deployment timestamp and status "deployed"`
    );

    // Step 4: Revalidate paths to reflect changes in UI
    revalidatePath("/dashboard/website/all");
    revalidatePath(`/website/editor/${websiteId}`);

    return {
      success: true,
      data: {
        url: website.primary_url || deployData.url,
        status: "deployed",
        message: "Website deployed successfully",
      },
    };
  } catch (error) {
    console.error("Error in deployWebsite:", error);
    // Ensure status is updated to "failed" on any uncaught exceptions
    try {
      await updateWebsite(websiteId, {
        status: "failed",
      });
      console.log(`Website status updated to "failed" due to unhandled error`);
    } catch (updateError) {
      console.error(
        "Failed to update website status to 'failed':",
        updateError
      );
    }

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
