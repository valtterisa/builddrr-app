"use server";

import {
  assignMachineToUser,
  getUserMachines,
  startUserMachine,
  stopUserMachine,
  deleteUserMachine,
  getMachineUrl,
} from "@/lib/fly/machine-manager";
import {
  updateMachineFiles,
  getMachineFiles,
  deleteMachineFiles,
  type FileOperation,
} from "@/lib/fly/file-manager";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function createWebsite(
  userId: string,
  websiteName: string,
  files?: FileOperation[]
) {
  try {
    console.log(`Creating website for user ${userId} with name ${websiteName}`);

    // 1. Get a Fly.io machine assigned to this user
    console.log("Assigning Fly.io machine...");
    const machineResult = await assignMachineToUser(userId, websiteName, files);

    if (!machineResult.success || !machineResult.data) {
      console.error("Error assigning machine:", machineResult.error);
      throw new Error(
        machineResult.error || "Failed to assign machine to user"
      );
    }

    console.log("Machine assigned successfully:", machineResult.data);

    // Create website record in Supabase
    try {
      // Use the server client with auth context for RLS compliance
      const supabase = await createServerClient();

      console.log("Creating website record with userId:", userId);
      const { data: website, error } = await supabase
        .from("websites")
        .insert({
          user_id: userId,
          name: websiteName,
          machine_id: machineResult.data.machine_id,
          app_name: machineResult.data.app_name,
          status: "creating",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating website record:", error);
        throw error;
      }

      return {
        success: true,
        data: {
          website,
          machine: machineResult.data,
        },
      };
    } catch (dbError) {
      console.error("Database error creating website:", dbError);

      // Even if the website record creation fails, we should return the machine info
      // so the client can still access the deployment
      return {
        success: true,
        data: {
          website: {
            id: `temp-${Date.now()}`, // Generate a temporary ID
            user_id: userId,
            name: websiteName,
            machine_id: machineResult.data.machine_id,
            status: "creating",
          },
          machine: machineResult.data,
        },
        warning: "Machine created but website record creation failed",
      };
    }
  } catch (error) {
    console.error("Error creating website:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getUserWebsites(userId: string) {
  try {
    // Get all websites for the user with their machine information
    const supabase = await createServerClient();

    const { data: websites, error } = await supabase
      .from("websites")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    console.log(`Found ${websites.length} websites for user ${userId}`);

    return { success: true, data: websites };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function startWebsite(userId: string, websiteId: string) {
  try {
    // Get website and verify ownership
    const supabase = await createServerClient();
    const { data: website, error: fetchError } = await supabase
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !website) {
      throw new Error("Website not found or unauthorized");
    }

    // Start the machine
    const result = await startUserMachine(userId, website.machine_id);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Update website status
    const { error: updateError } = await supabase
      .from("websites")
      .update({ status: "running" })
      .eq("id", websiteId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function stopWebsite(userId: string, websiteId: string) {
  try {
    // Get website and verify ownership
    const supabase = await createServerClient();
    const { data: website, error: fetchError } = await supabase
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !website) {
      throw new Error("Website not found or unauthorized");
    }

    // Stop the machine
    const result = await stopUserMachine(userId, website.machine_id);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Update website status
    const { error: updateError } = await supabase
      .from("websites")
      .update({ status: "stopped" })
      .eq("id", websiteId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteWebsite(userId: string, websiteId: string) {
  try {
    // Get website and verify ownership
    const supabase = await createServerClient();
    const { data: website, error: fetchError } = await supabase
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !website) {
      throw new Error("Website not found or unauthorized");
    }

    // Delete the machine
    const result = await deleteUserMachine(userId, website.machine_id);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Delete website record
    const { error: deleteError } = await supabase
      .from("websites")
      .delete()
      .eq("id", websiteId);

    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateWebsiteFiles(
  userId: string,
  websiteId: string,
  files: FileOperation[]
) {
  try {
    // Get website and verify ownership
    const supabase = await createServerClient();
    const { data: website, error: fetchError } = await supabase
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !website) {
      throw new Error("Website not found or unauthorized");
    }

    // Get machine_id directly from the website record
    const machineId = website.machine_id;

    if (!machineId) {
      throw new Error("Machine ID not found for this website");
    }

    // Update files on the machine
    const result = await updateMachineFiles(machineId, files);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Update website content in database
    const { error: updateError } = await supabase
      .from("websites")
      .update({
        content: {
          ...website.content,
          last_updated: new Date().toISOString(),
        },
      })
      .eq("id", websiteId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getWebsiteFiles(userId: string, websiteId: string) {
  try {
    // Get website and verify ownership
    const supabase = await createServerClient();
    const { data: website, error: fetchError } = await supabase
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !website) {
      throw new Error("Website not found or unauthorized");
    }

    // Get files from the machine
    const result = await getMachineFiles(website.machine_id);

    if (!result.success) {
      throw new Error(result.error);
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteWebsiteFiles(
  userId: string,
  websiteId: string,
  paths: string[]
) {
  try {
    // Get website and verify ownership
    const supabase = await createServerClient();
    const { data: website, error: fetchError } = await supabase
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !website) {
      throw new Error("Website not found or unauthorized");
    }

    // Delete files from the machine
    const result = await deleteMachineFiles(website.machine_id, paths);

    if (!result.success) {
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deployAIResponseToMachine(
  userId: string,
  websiteId: string,
  aiResponse: string
) {
  try {
    // Get website and verify ownership
    const supabase = await createServerClient();
    const { data: website, error: fetchError } = await supabase
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !website) {
      throw new Error("Website not found or unauthorized");
    }

    // Parse AI response to extract file operations
    const fileOperations = await parseAIResponse(aiResponse);

    if (fileOperations.length === 0) {
      throw new Error("No valid file operations found in AI response");
    }

    // Update files on the machine
    const result = await updateMachineFiles(website.machine_id, fileOperations);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Start the machine if it's not running
    if (website.status !== "running") {
      const startResult = await startUserMachine(userId, website.machine_id);

      if (!startResult.success) {
        throw new Error(startResult.error);
      }

      // Update website status
      await supabase
        .from("websites")
        .update({ status: "running" })
        .eq("id", websiteId);
    }

    // Get machine URL using the app name
    const machineUrl = getMachineUrl(website.app_name);

    // Update website with latest deployment info
    await supabase
      .from("websites")
      .update({
        last_deployed: new Date().toISOString(),
        url: machineUrl,
        content: {
          ...website.content,
          ai_response: aiResponse,
          last_updated: new Date().toISOString(),
        },
      })
      .eq("id", websiteId);

    return { success: true, data: { url: machineUrl } };
  } catch (error) {
    console.error("Error deploying AI response:", error);
    return { success: false, error: (error as Error).message };
  }
}

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
      operation: "create",
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
          name: "ai-generated-website",
          version: "1.0.0",
          private: true,
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
      operation: "create",
    });
  }

  return fileOperations;
}
