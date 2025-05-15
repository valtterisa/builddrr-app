"use server";

import { createAppAndAssignMachine } from "@/lib/fly/machine-manager";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type FileOperation = {
  path: string;
  content: string;
};

// Create site
export async function createWebsite(
  userId: string,
  websiteName: string,
  files?: FileOperation[]
) {
  try {
    console.log(`Creating website for user ${userId} with name ${websiteName}`);

    // 1. Get a Fly.io machine assigned to this user
    console.log("Assigning Fly.io machine...");
    const machineResult = await createAppAndAssignMachine(
      userId,
      websiteName,
      files
    );

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
