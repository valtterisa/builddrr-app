import { getFlyRegistryUrl } from "@/lib/utils";
import { FileOperation } from "@/lib/types";

/**
 * Here we define all the routes to the backend API. U
 * 1. Create a new app and assign a machine to it -> createAppAndAssignMachine
 * 2. Update a machine files -> updateMachineWithFiles
 * 3. Start a machine -> startMachine
 * 4. Stop a machine -> stopMachine
 * 5. Restart a machine -> restartMachine
 * 6. Delete a machine -> deleteMachine
 * 7. Get a machine by id -> getMachineById
 * 8. Get all machines for a user -> getMachinesByUserId
 * 9. Get all machines for a website -> getMachinesByWebsiteId
 */

/**
 * Assign a machine to a user's website
 * @param userId User ID
 * @param websiteName Website name
 * @param files File operations to add to the machine
 * @returns Machine data
 */
export async function createAppAndAssignMachine(
  userId: string,
  appName: string,
  files?: FileOperation[]
) {
  try {
    // Check if FLY_API_TOKEN is set
    if (!process.env.FLY_API_TOKEN) {
      console.error("FLY_API_TOKEN environment variable is not set");
      throw new Error(
        "FLY_API_TOKEN is not set. Please configure your environment variables."
      );
    }

    let imageTag = `${getFlyRegistryUrl(appName)}:latest`;

    // Call to backend to create app and machines
    const response = await fetch(process.env.PREVIEW_DEPLOY_URL!, {
      method: "POST",
      body: JSON.stringify({
        imageTag: imageTag,
        appName: appName,
        websiteName: appName,
        userId: userId,
        files: files,
      }),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.PREVIEW_DEPLOY_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to deploy preview: ${response.statusText}`);
    }

    const machine = await response.json();

    console.log("Machine created:", machine);

    // Return the machine data that will be used in the website record
    return {
      success: true,
      data: {
        machine_id: machine.id,
        app_name: appName,
        name: appName,
        region: "arn",
        status: "creating",
        user_id: userId,
      },
    };
  } catch (error) {
    console.error("Error assigning machine:", error);
    return { success: false, error: (error as Error).message };
  }
}
