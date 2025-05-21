"use server";

import {
  generateAppName,
  getFlyRegistryUrl,
  parseAIResponse,
} from "@/lib/utils";
import { FileOperation } from "@/lib/types";
import {
  addWebsiteUser,
  createWebsite,
  getWebsite,
  updateWebsite,
} from "./database";
import { revalidatePath } from "next/cache";

export type WebsiteCreationData = {
  name: string;
  description?: string;
  prompt?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  industry?: string;
  components?: string[];
  template?: string;
};

export type WebsiteCreationResult = {
  success: boolean;
  machine?: any;
  appName?: string;
  error?: string;
};

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

    const machine = await response.json();

    // Return the machine data that will be used in the website record
    return { machine: machine, success: true };
  } catch (error) {
    console.error("Error assigning machine:", error);
    return { success: false, error: (error as Error).message };
  }
}

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
 * Mock implementation of AI content generation
 */
async function getMockAIResponse(prompt: string): Promise<string> {
  // In production, this would call an actual AI service
  // For now, we'll use a mock response
  console.log("Using mock AI response for prompt:", prompt);

  // Using a hardcoded mock response
  const mockResponse = `
<siteforge-code>
<siteforge-write file="/components/site-components/header/header.tsx">
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Logo from "./logo";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Button className="bg-primary hover:bg-primary/90">Contact Us</Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col h-full">
              <div className="flex justify-end py-4">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetTrigger>
              </div>
              <div className="mt-auto py-6">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Contact Us
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
};

export default Header;
</siteforge-write>

<siteforge-write file="/components/site-components/header/logo.tsx">
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <motion.div
        className="text-2xl font-bold flex items-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <span className="text-primary">Bittive</span>
        <span className="text-secondary ml-1">Oy</span>
      </motion.div>
    </Link>
  );
};

export default Logo;
</siteforge-write>
</siteforge-code>`;

  return mockResponse;
}

/**
 * Unified function to handle website creation from any source
 * Works with both guided builder and AI prompt tool
 *
 * @param userId The authenticated user ID
 * @param data Website creation data from form or prompt
 * @returns Result with website and deployment information
 */
export async function createAndDeployWebsite(
  userId: string,
  data: WebsiteCreationData
): Promise<WebsiteCreationResult> {
  // Declare website variable outside try block so it's accessible in catch block
  let website: any = null;

  try {
    console.log(`Starting website creation for user ${userId}`);

    // Step 1: Create initial website record
    const appName = generateAppName(userId);
    const websiteInitialData = {
      name: data.name,
      description: data.description || "",
      published: false,
      app_name: appName,
      status: "creating", // Initial status is "creating"
      settings: {
        colors: data.colors,
        components: data.components,
        industry: data.industry,
      },
      template_id: data.template || null,
      subdomain: null,
      primary_domain: null,
    };

    // Create the initial website record
    website = await createWebsite(userId, websiteInitialData);

    if (!website) {
      throw new Error("Failed to create initial website record");
    }

    console.log(`Created initial website record with ID: ${website.id}`);

    //
    try {
      // 1. Fork repository with app name as slug
      console.log(`Calling fork API with slug=${appName}`);
      const forkResponse = await fetch(`http://localhost:3001/api/fork`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: appName }),
      });

      // Save the repository URL
      const repositoryUrl = `https://gitlab.com/bittive-group/${appName}`;
      console.log(`Setting repository URL: ${repositoryUrl}`);

      // Check if response is OK and contains JSON
      if (!forkResponse.ok) {
        console.warn(
          `Fork API returned status ${forkResponse.status}: ${forkResponse.statusText}`
        );
        console.warn("Continuing without fork data");
      } else {
        // Check content type to ensure it's JSON
        const contentType = forkResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const forkData = await forkResponse.json();
          console.log("Fork API response:", forkData);

          // Update website with repository URL immediately after successful fork
          try {
            await updateWebsite(website.id, {
              repository_url: repositoryUrl,
            });
            console.log(
              `Website record updated with repository URL: ${repositoryUrl}`
            );
          } catch (error) {
            console.error("Error updating website with repository URL:", error);
          }
        } else {
          console.warn(
            "Fork API did not return JSON. Content type:",
            contentType
          );
          console.warn("Continuing without fork data");
        }
      }

      // Generate custom domain
      const customDomain = `${appName}.siteforge.bittive.com`;
      console.log(`Setting custom domain: ${customDomain}`);

      // 2. Create pages with same slug
      console.log(`Calling pages-create API with slug=${appName}`);
      const pagesResponse = await fetch(
        `http://localhost:3001/api/pages-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slug: appName }),
        }
      );

      // Check if response is OK before parsing JSON
      if (!pagesResponse.ok) {
        console.warn(
          `Pages-create API returned status ${pagesResponse.status}: ${pagesResponse.statusText}`
        );
        console.warn("Continuing without pages data");
      } else {
        const contentType = pagesResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const pagesData = await pagesResponse.json();
          console.log("Pages-create API response:", pagesData);
        } else {
          console.warn(
            "Pages-create API did not return JSON. Content type:",
            contentType
          );
          console.warn("Continuing without pages data");
        }
      }

      // 3. Start wire-domain process (don't await the response)
      console.log(`Starting wire-domain process with slug=${appName}`);
      fetch(`http://localhost:3001/api/wire-domain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: appName }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `API returned status ${response.status}: ${response.statusText}`
            );
          }
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return response.json();
          }
          throw new Error(
            `API did not return JSON. Content type: ${contentType}`
          );
        })
        .then(async (data) => {
          console.log("Wire-domain API response (delayed):", data);

          // Update the website with custom domain if successful
          if (data.success) {
            try {
              const customDomain = `${appName}.siteforge.bittive.com`;
              console.log(
                `Updating website with custom domain: ${customDomain}`
              );

              await updateWebsite(website.id, {
                primary_url: customDomain,
              });

              console.log(
                `Website record updated with custom domain: ${customDomain}`
              );
              // // Revalidate paths to reflect the domain update in the UI
              // revalidatePath("/dashboard/website/all");
              // revalidatePath(`/website/editor/${website.id}`);
            } catch (error) {
              console.error(
                "Error updating website with custom domain:",
                error
              );
            }
          }
        })
        .catch((error) =>
          console.error("Error in wire-domain API call:", error)
        );

      console.log("Wire-domain process started (running in background)");
    } catch (error) {
      // Don't fail the whole process if API calls fail
      console.error("Error calling development APIs:", error);
    }

    // Step 1.6: Add the user as the admin in the website_users table
    try {
      console.log(`Adding user ${userId} as admin for website ${website.id}`);
      await addWebsiteUser(website.id, userId, "admin");
    } catch (error) {
      console.error(
        "Error adding user as admin in website_users table:",
        error
      );
      throw new Error("Failed to add user as admin in website_users table");
    }

    // Step 2: Generate website content
    let aiResponse;
    if (data.prompt) {
      // If prompt is provided, use AI to generate content
      console.log("Generating website content from prompt...");
      aiResponse = await getMockAIResponse(data.prompt);
    } else {
      // For guided builder, we could use a template-based approach or still use AI
      // with structured data from the form
      console.log("Generating website content from structured data...");
      const structuredPrompt = `Create a website for ${data.name} in the ${data.industry || "business"} industry.
      ${data.description ? `Description: ${data.description}` : ""}
      Components: ${data.components?.join(", ") || "standard website components"}`;

      aiResponse = await getMockAIResponse(structuredPrompt);
    }

    if (!aiResponse) {
      await updateWebsite(website.id, { status: "failed" });
      console.log(
        `Website status updated to "failed" due to content generation error`
      );
      throw new Error("Failed to generate website content");
    }

    // Step 3: Parse AI response to get file operations
    const files = await parseAIResponse(aiResponse);

    if (files.length === 0) {
      await updateWebsite(website.id, { status: "failed" });
      console.log(
        `Website status updated to "failed" due to invalid AI response`
      );
      throw new Error("No valid file operations found in AI response");
    }

    console.log(`Found ${files.length} file operations in AI response`);

    // Step 4: Update status to "deploying" before starting the deployment process
    await updateWebsite(website.id, { status: "deploying" });
    console.log(`Website status updated to "deploying"`);

    // Step 5: Deploy to Fly.io
    console.log(`Creating new Fly.io app: ${appName}`);

    const deployResult = await createAppAndAssignMachine(
      userId,
      appName,
      files
    );

    console.log("deployResult: ", deployResult);

    if (!deployResult.success) {
      await updateWebsite(website.id, { status: "failed" });
      console.error(
        "Failed to create app and assign machine: ",
        deployResult.error
      );
    }

    const machine = deployResult.machine.appMachines[0];

    const machineId = machine.id; // There is two machines fields in the response.
    const url = machine.url;

    console.log(`Deployed to Fly.io - Machine ID: ${machineId}, URL: ${url}`);

    // Step 6: Update website record with deployment info
    await updateWebsite(website.id, {
      preview_url: url, // @TODO: Use /api/preview-url endpoint.
      published: true,
      status: "preview",
      machine_id: machineId,
      last_deployed: new Date().toISOString(),
      repository_url: `https://gitlab.com/bittive-group/${appName}`, // Save GitLab repository URL
    });

    console.log(
      "Website record updated with deployment info and repository URL"
    );

    // Step 7: Revalidate paths
    revalidatePath("/dashboard/website/all");
    revalidatePath(`/website/editor/${appName}`);

    return {
      success: true,
      machine: machine,
      appName,
    };
  } catch (error) {
    console.error("Error in createAndDeployWebsite:", error);
    // Try to update website status to "failed" if we have a website ID
    try {
      // This requires checking if 'website' is defined within scope
      if (typeof website !== "undefined" && website && website.id) {
        await updateWebsite(website.id, { status: "failed" });
        console.log(
          `Website status updated to "failed" due to unhandled error`
        );
      }
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
