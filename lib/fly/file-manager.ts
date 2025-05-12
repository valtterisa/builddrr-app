import { MachineConfig, MachineFile, updateMachineWithFiles } from "./machine";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type FileOperation = {
  path: string;
  content: string;
  operation: "create" | "update" | "delete";
};

export async function updateMachineFiles(
  machineId: string,
  files: FileOperation[]
) {
  try {
    // Use server client with auth for RLS compliance
    const supabase = await createServerClient();

    // Get website details from Supabase using machine_id
    const { data: website, error: fetchError } = await supabase
      .from("websites")
      .select("*")
      .eq("machine_id", machineId)
      .single();

    if (fetchError || !website) {
      console.error("Website with machine_id not found error:", fetchError);
      throw new Error("Machine not found");
    }

    console.log(
      "Website found:",
      website.id,
      "machine_id:",
      website.machine_id,
      "app_name:",
      website.app_name
    );

    // Get the app name from the website record
    const appName = website.app_name;
    if (!appName) {
      throw new Error(
        "appName is required for updating machine files on Fly.io"
      );
    }

    // Wait a bit to ensure the machine is fully initialized
    console.log("Waiting for machine to initialize fully...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Separate operations by type
    const createOrUpdateFiles = files.filter(
      (file) => file.operation !== "delete"
    );

    const deleteFiles = files.filter((file) => file.operation === "delete");

    // Ensure all parent directories exist before file upload
    for (const file of createOrUpdateFiles) {
      const dirPath = file.path.includes("/")
        ? `/app/${file.path.substring(0, file.path.lastIndexOf("/"))}`
        : "/app";
      if (dirPath && dirPath !== "/app") {
        // Check if directory exists, if not, create it
        try {
          const checkResult = await executeCommand(
            machineId,
            `[ -d '${dirPath}' ] && echo 'exists' || echo 'missing'`,
            appName
          );
          if (
            !checkResult ||
            !checkResult.stdout ||
            !checkResult.stdout.includes("exists")
          ) {
            console.log(`Directory ${dirPath} does not exist. Creating...`);
            await executeCommand(machineId, `mkdir -p '${dirPath}'`, appName);
          }
        } catch (err) {
          console.warn(`Could not verify or create directory ${dirPath}:`, err);
        }
      }
    }

    // Handle create/update operations using machine config update
    if (createOrUpdateFiles.length > 0) {
      // Convert our file operations to Fly.io MachineFile format
      const machineFiles: MachineFile[] = createOrUpdateFiles.map((file) => ({
        guest_path: `/app/${file.path}`,
        raw_value: Buffer.from(file.content).toString("base64"),
      }));

      // Log each file being uploaded
      for (const file of createOrUpdateFiles) {
        const guestPath = `/app/${file.path}`;
        const preview = file.content.slice(0, 100);
        console.log(`Uploading file to machine: ${guestPath}`);
        console.log(`Content preview (first 100 chars): ${preview}`);
      }

      console.log(
        `Updating ${machineFiles.length} files on machine ${machineId} in app ${appName}`
      );
      const result = await updateMachineWithFiles(
        machineId,
        machineFiles,
        appName
      );

      // Log the result of the update
      console.log(
        "updateMachineWithFiles result:",
        JSON.stringify(result, null, 2)
      );

      if (!result.success) {
        throw new Error(`Failed to update machine files: ${result.error}`);
      }
    }

    // Handle delete operations separately using shell commands
    if (deleteFiles.length > 0) {
      console.log(
        `Deleting ${deleteFiles.length} files on machine ${machineId}`
      );

      for (const file of deleteFiles) {
        try {
          console.log(`Deleting file: ${file.path}`);
          await executeCommand(machineId, `rm -f /app/${file.path}`, appName);
        } catch (err) {
          console.error(`Error deleting file ${file.path}:`, err);
          // Continue with other files even if one fails
        }
      }
    }

    // Update website status
    await supabase
      .from("websites")
      .update({
        status: "running",
        updated_at: new Date().toISOString(),
      })
      .eq("machine_id", machineId);

    return { success: true };
  } catch (error) {
    console.error("Error updating machine files:", error);
    return { success: false, error: (error as Error).message };
  }
}

async function executeCommand(
  machineId: string,
  command: string,
  appName: string,
  retries = 3,
  delay = 2000
) {
  console.log(`Executing command on machine ${machineId}: ${command}`);

  if (!appName) {
    throw new Error("appName is required for executing commands on Fly.io");
  }

  // Retry loop
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `${process.env.FLY_API_BASE}/v1/apps/${appName}/machines/${machineId}/exec`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: ["sh", "-c", command],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `Command failed (attempt ${attempt}/${retries}): ${response.status} - ${errorText}`
        );

        // If this is our last attempt, throw the error
        if (attempt === retries) {
          throw new Error(`Failed to execute command: ${response.statusText}`);
        }

        // Wait before retrying
        console.log(`Waiting ${delay / 1000} seconds before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Increase delay for next attempt (exponential backoff)
        delay *= 2;
        continue;
      }

      return response.json();
    } catch (error) {
      // If this is our last attempt, rethrow the error
      if (attempt === retries) {
        throw error;
      }

      console.warn(
        `Error executing command (attempt ${attempt}/${retries}): ${error instanceof Error ? error.message : "Unknown error"}`
      );

      // Wait before retrying
      console.log(`Waiting ${delay / 1000} seconds before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next attempt (exponential backoff)
      delay *= 2;
    }
  }

  // This should never be reached due to the throws above, but TypeScript needs it
  throw new Error(`Failed to execute command after ${retries} attempts`);
}

export async function getMachineFiles(
  machineId: string,
  path: string = "/app",
  appName: string
) {
  try {
    const result = await executeCommand(
      machineId,
      `find ${path} -type f -exec cat {} \\;`,
      appName
    );
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteMachineFiles(
  machineId: string,
  paths: string[],
  appName: string
) {
  try {
    const commands = paths.map((path) => `rm -rf /app/${path}`);
    await executeCommand(machineId, commands.join(" && "), appName);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
