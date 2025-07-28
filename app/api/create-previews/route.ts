import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_EMAIL = "savonen.emppu@gmail.com";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Types
export interface FlyApp {
  ID: string;
  Name: string;
  InternalNumericID: number;
  State: string;
  Status: string;
  Deployed: boolean;
  Hostname: string;
  org_slug?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FlyMachine {
  id: string;
  app_id: string;
  name: string;
  state: string;
  region: string;
  instance_id: string;
  private_ip: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppsOptions {
  count: number;
  orgSlug: string;
  image: string;
}

export interface CreateAppsResult {
  appNames: string[];
}

// Admin authentication function
async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    // Extract the token
    const token = authHeader.substring(7);

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return false;
    }

    // Check if user is admin
    return user.email === ADMIN_EMAIL;
  } catch (error) {
    console.error("Admin verification error:", error);
    return false;
  }
}

// Fly.io command execution
async function executeFlyCommand(
  command: string,
  args: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("fly", [command, ...args], (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`fly ${command} failed: ${stderr || error.message}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

function flyLaunch(appName: string): Promise<string> {
  const image = "docker.io/valzuxxx/plain-nextjs-app:latest";
  return new Promise((resolve, reject) => {
    const cmd = "fly";
    const args = [
      "launch",
      "--config",
      "fly.toml",
      "--name",
      appName,
      "--image",
      image,
      "--yes",
      "--detach",
      "--now",
      // "--build-only",
      "--ha=false",
      "--volume",
      "user_volume:/app/data",
      "--volume-initial-size",
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

// Create multiple Fly.io apps
async function createApps(
  options: CreateAppsOptions
): Promise<CreateAppsResult> {
  const { count } = options;
  if (count < 1 || count > 100) {
    throw new Error("count must be between 1 and 100");
  }
  const appNames: string[] = [];
  for (let i = 0; i < count; i++) {
    const appName = `builddrr-preview-${randomUUID().replace(/-/g, "")}`;
    await flyLaunch(appName);
    appNames.push(appName);
  }
  return { appNames };
}

// Get all apps from Fly.io
async function getAllApps(appNames: string[]): Promise<FlyApp[]> {
  try {
    const output = await executeFlyCommand("apps", ["list", "--json"]);
    const allApps = JSON.parse(output);

    console.log("All apps:", allApps);
    console.log("App names:", appNames);

    const filteredApps = allApps.filter((app: FlyApp) =>
      appNames.includes(app.Name)
    );

    console.log(
      `Found ${filteredApps.length} apps out of ${allApps.length} total apps`
    );
    return filteredApps;
  } catch (error) {
    console.error("Failed to get apps:", error);
    return [];
  }
}

// Get machines for a specific app
async function getAppMachines(appId: string): Promise<FlyMachine[]> {
  try {
    const output = await executeFlyCommand("machines", [
      "list",
      "--app",
      appId,
      "--json",
    ]);
    const machines = JSON.parse(output);
    return machines.map((machine: any) => ({
      id: machine.id,
      app_id: appId,
      name: machine.name,
      state: machine.state,
      region: machine.region,
      instance_id: machine.instance_id,
      private_ip: machine.private_ip,
      created_at: machine.created_at,
      updated_at: machine.updated_at,
    }));
  } catch (error) {
    console.error(`Failed to get machines for app ${appId}:`, error);
    return [];
  }
}

// Sync to preview environments
async function syncToPreviewEnvironments(appNames: string[]): Promise<void> {
  console.log("🔗 Using Supabase client...");

  try {
    // Test the connection first
    console.log("🧪 Testing Supabase connection...");
    const { data, error: testError } = await supabase
      .from("preview_environments")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ Supabase connection test failed:", testError);
      throw new Error(`Supabase connection failed: ${testError.message}`);
    }

    console.log("✅ Supabase connection successful");

    const apps = await getAllApps(appNames);
    console.log("Apps:", apps);

    for (const app of apps) {
      const machines = await getAppMachines(app.ID);

      if (machines.length > 0) {
        const machine = machines[0];

        console.log(
          `📝 Syncing machine ${machine.name} for app ${app.Name}...`
        );

        const { error } = await supabase.from("preview_environments").upsert(
          {
            app_name: app.Name,
            machine_id: machine.id,
            status: "non-active",
            mapping: {
              app_id: app.ID,
              machine_name: machine.name,
              machine_state: machine.state,
              region: machine.region,
              instance_id: machine.instance_id,
              private_ip: machine.private_ip,
              org_slug: app.org_slug,
              created_at: machine.created_at,
              updated_at: machine.updated_at,
            },
          },
          {
            onConflict: "app_name,machine_id",
          }
        );

        if (error) {
          console.error(
            `❌ Failed to sync machine ${machine.name} for app ${app.Name}:`,
            error
          );
          console.error("Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
        } else {
          console.log(`✅ Synced machine: ${machine.name} (app: ${app.Name})`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Failed to sync to preview_environments:", error);
    throw error;
  }
}

// Next.js API route handler
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminAccess(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { count } = body;

    const orgSlug = "personal";
    const image = "docker.io/valzuxxx/plain-nextjs-app:latest";

    // If creating new apps
    if (count && orgSlug && image) {
      console.log("🚀 Creating new Fly.io apps...");
      console.log(
        `Creating ${count} apps in org ${orgSlug} with image ${image}`
      );

      const createResult = await createApps({ count, orgSlug, image });
      console.log("Created apps:", createResult.appNames);

      // Wait a bit for apps to be fully created
      console.log("⏳ Waiting for apps to be fully created...");
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Sync the newly created apps
      console.log("🔄 Syncing newly created apps to Supabase...");
      await syncToPreviewEnvironments(createResult.appNames);

      return NextResponse.json({
        success: true,
        message: "Apps created and synced successfully!",
        createdApps: createResult.appNames,
      });
    }

    return NextResponse.json(
      {
        error:
          "Either provide count/orgSlug/image to create apps, or appNames to sync existing apps",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create/sync apps",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
