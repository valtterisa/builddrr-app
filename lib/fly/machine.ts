import { z } from "zod";

// Default API base URL in case environment variable is not set
export const FLY_API_BASE =
  process.env.FLY_API_BASE || "https://api.machines.dev";

// Types
export const MachineConfigSchema = z.object({
  name: z.string(),
  region: z.string(),
  image: z.string(),
  config_version: z.number().optional(),
  guest: z.object({
    cpu_kind: z.enum(["shared", "performance"]),
    cpus: z.number().optional(),
    memory_mb: z.number().optional(),
    kernel_args: z.array(z.string()).optional(),
  }),
  env: z.record(z.string()).optional(),
  services: z
    .array(
      z.object({
        protocol: z.enum(["tcp", "udp"]),
        internal_port: z.number(),
        concurrency: z
          .object({
            type: z.enum(["connections", "requests"]).optional(),
            soft_limit: z.number().optional(),
            hard_limit: z.number().optional(),
          })
          .optional(),
        ports: z
          .array(
            z.object({
              port: z.number().optional(),
              start_port: z.number().optional(),
              end_port: z.number().optional(),
              handlers: z.array(z.string()).optional(),
              force_https: z.boolean().optional(),
              http_options: z
                .object({
                  compress: z.boolean().optional(),
                  h2_backend: z.boolean().optional(),
                  response: z
                    .object({
                      headers: z.record(z.string()).optional(),
                      pristine: z.boolean().optional(),
                    })
                    .optional(),
                })
                .optional(),
              tls_options: z
                .object({
                  alpn: z.array(z.string()).optional(),
                  default_self_signed: z.boolean().optional(),
                  versions: z.array(z.string()).optional(),
                })
                .optional(),
              proxy_proto_options: z
                .object({
                  version: z.string().optional(),
                })
                .optional(),
            })
          )
          .optional(),
        autostart: z.boolean().optional(),
        autostop: z
          .union([z.boolean(), z.enum(["off", "stop", "suspend"])])
          .optional(),
        min_machines_running: z.number().optional(),
      })
    )
    .optional(),
  mounts: z
    .array(
      z.object({
        volume: z.string(),
        path: z.string(),
        name: z.string().optional(),
        extend_threshold_percent: z.number().optional(),
        add_size_gb: z.number().optional(),
        size_gb_limit: z.number().optional(),
        encrypted: z.boolean().optional(),
      })
    )
    .optional(),
  processes: z
    .array(
      z.object({
        entrypoint: z.array(z.string()).optional(),
        cmd: z.array(z.string()).optional(),
        env: z.record(z.string()).optional(),
        env_from: z.array(z.any()).optional(),
        exec: z.array(z.string()).optional(),
        user: z.string().optional(),
        ignore_app_secrets: z.boolean().optional(),
        secrets: z
          .array(
            z.object({
              env_var: z.string(),
              name: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  restart: z
    .object({
      policy: z.enum(["no", "on-failure", "always"]),
      max_retries: z.number().optional(),
    })
    .optional(),
  schedule: z.enum(["hourly", "daily", "weekly", "monthly"]).optional(),
  standbys: z.array(z.string()).optional(),
  statics: z
    .array(
      z.object({
        guest_path: z.string(),
        url_prefix: z.string(),
        tigris_bucket: z.string().optional(),
        index_document: z.string().optional(),
      })
    )
    .optional(),
  stop_config: z
    .object({
      signal: z.string().optional(),
      timeout: z.number().optional(),
    })
    .optional(),
  files: z
    .array(
      z.object({
        guest_path: z.string(),
        raw_value: z.string(),
      })
    )
    .optional(),
});

export type MachineConfig = z.infer<typeof MachineConfigSchema>;

// Helper function to make authenticated API calls
async function flyApiRequest(endpoint: string, options: RequestInit = {}) {
  const FLY_API_TOKEN = process.env.FLY_API_TOKEN;

  // Comprehensive check for API token
  if (!FLY_API_TOKEN) {
    console.error("FLY_API_TOKEN environment variable is not set");
    throw new Error(
      "FLY_API_TOKEN is not set. Please configure your environment variables."
    );
  }

  if (!endpoint) {
    throw new Error("API endpoint not specified");
  }

  // Ensure we have the right content type and stringify JSON body if needed
  const headers = {
    "Authorization": `Bearer ${FLY_API_TOKEN}`,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Make sure endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  // Construct URL - make sure no double slashes or other issues
  const url = `${FLY_API_BASE.replace(/\/+$/, "")}${formattedEndpoint}`;

  // Debug log for request
  console.log(`Making Fly.io API request to: ${url}`);
  console.log(`Request method: ${options.method || "GET"}`);
  console.log(`Request headers:`, {
    ...headers,
    "Authorization": headers.Authorization ? "Bearer [REDACTED]" : "None", // Don't log the actual token
  });

  if (options.body && typeof options.body === "string") {
    try {
      // Log the parsed body to check for issues
      const parsedBody = JSON.parse(options.body);
      console.log("Request body:", parsedBody);

      // Double check that config is not empty when it's a POST request
      if (
        (options.method === "POST" || options.method === "PATCH") &&
        (!parsedBody || Object.keys(parsedBody).length === 0)
      ) {
        console.warn("Warning: Empty request body for POST/PATCH request");
      }
    } catch (e) {
      console.error(
        "Error parsing request body:",
        e,
        "Raw body:",
        options.body
      );
    }
  } else if (
    (options.method === "POST" || options.method === "PATCH") &&
    !options.body
  ) {
    console.error("ERROR: Missing request body for POST/PATCH request");
    throw new Error(
      "Config object is required for POST/PATCH requests to Fly.io API"
    );
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    console.log(
      `Executing fetch to ${url} with method ${options.method || "GET"}`
    );
    const response = await fetch(url, fetchOptions);
    console.log(`Response status: ${response.status}`);

    // Get response as text first for proper error logging
    const responseText = await response.text();
    console.log(
      `Response text: ${responseText.substring(0, 200)}${responseText.length > 200 ? "..." : ""}`
    );

    let responseData;

    try {
      // Try to parse as JSON if possible
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.log("Response is not JSON:", responseText);
      // If it's not valid JSON, use text response
      responseData = { text: responseText };
    }

    if (!response.ok) {
      console.error(`Fly.io API error (${response.status}):`, responseData);
      throw new Error(
        `Fly.io API error: ${response.status} ${JSON.stringify(responseData)}`
      );
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Fly API request failed:", error.message);
      throw error;
    }
    console.error("Unknown error during API request:", error);
    throw new Error("Unknown error during API request");
  }
}

// Create a new Fly.io app
export async function createApp(appName: string) {
  try {
    // Check if FLY_API_TOKEN is available
    if (!process.env.FLY_API_TOKEN) {
      throw new Error(
        "FLY_API_TOKEN environment variable is missing - required for creating Fly.io apps"
      );
    }

    console.log(`Creating a new Fly.io app: ${appName}`);

    const response = await flyApiRequest("/v1/apps", {
      method: "POST",
      body: JSON.stringify({
        app_name: appName,
        org_slug: process.env.FLY_ORG_SLUG || "personal",
      }),
    });

    console.log(`App creation response:`, JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    // Provide more specific error message for unauthorized errors
    if (
      error instanceof Error &&
      error.message.includes("403") &&
      error.message.includes("unauthorized")
    ) {
      console.error(
        "Error creating Fly.io app: Your API token does not have permission to create apps"
      );
      throw new Error(
        "Your Fly.io API token does not have permission to create apps. Please check your token has the correct scope and organization access."
      );
    }

    console.error("Error creating Fly.io app:", error);
    throw error;
  }
}

// Create a new machine in a specific app
export async function createMachine(config: MachineConfig, appName?: string) {
  try {
    // Validate config with schema
    MachineConfigSchema.parse(config);

    // Make sure we have a proper config object
    if (!config || Object.keys(config).length === 0) {
      throw new Error("Empty machine configuration provided");
    }

    // Make sure config is valid
    if (!config.name || !config.region || !config.image || !config.guest) {
      throw new Error(
        "Missing required fields in machine configuration: name, region, image, or guest"
      );
    }

    if (!appName) {
      throw new Error("appName is required for creating a machine on Fly.io");
    }
    const targetApp = appName;

    // Add the config version required by Fly.io API
    const machineConfig = {
      ...config,
      config_version: 2, // This is required by the Fly.io API v1
    };

    // Wrap the config object as required by the Fly.io API
    // The API expects { config: {...} }
    const requestBody = {
      config: machineConfig,
    };

    // Explicitly stringify the config to ensure it's properly formatted
    const configJson = JSON.stringify(requestBody);

    // Log the actual request we're sending
    console.log(
      `Sending machine creation request to: ${FLY_API_BASE}/v1/apps/${targetApp}/machines`
    );
    console.log("Request body:", configJson);

    // Make the API request with the stringified config
    const response = await flyApiRequest(`/v1/apps/${targetApp}/machines`, {
      method: "POST",
      body: configJson,
    });

    console.log(
      "Machine creation API response:",
      JSON.stringify(response, null, 2)
    );

    // Verify that we have a valid machine ID in the response
    if (!response || !response.id) {
      console.error("Invalid machine response:", response);
      throw new Error("Machine created but no valid ID returned in response");
    }

    // Return the full response with the machine ID
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format validation error
      const formattedError = error.format();
      console.error("Invalid machine config:", formattedError);
      throw new Error(
        `Invalid machine configuration: ${JSON.stringify(formattedError)}`
      );
    }
    throw error;
  }
}

// Interface for defining files to be included in a machine configuration
// This is used when updating a machine's config with files
// Note: There is no direct /files endpoint in the Fly.io API, but we can include
// files in the machine config when creating or updating a machine
export interface MachineFile {
  guest_path: string; // Absolute path in the machine
  raw_value: string; // Base64 encoded file contents
}

// Get machine details from a specific app
export async function getMachine(machineId: string, appName?: string) {
  if (!appName) {
    throw new Error("appName is required for getting a machine on Fly.io");
  }
  const targetApp = appName;
  return flyApiRequest(`/v1/apps/${targetApp}/machines/${machineId}`);
}

// List all machines in an app
export async function listMachines(appName?: string) {
  if (!appName) {
    throw new Error("appName is required for listing machines on Fly.io");
  }
  const targetApp = appName;
  return flyApiRequest(`/v1/apps/${targetApp}/machines`);
}

// Restart a machine in a specific app
export async function restartMachine(machineId: string, appName?: string) {
  if (!appName) {
    throw new Error("appName is required for restarting a machine on Fly.io");
  }
  const targetApp = appName;
  return flyApiRequest(`/v1/apps/${targetApp}/machines/${machineId}/restart`, {
    method: "POST",
    body: JSON.stringify({ config: {} }),
  });
}

// Stop a machine in a specific app
export async function stopMachine(machineId: string, appName?: string) {
  if (!appName) {
    throw new Error("appName is required for stopping a machine on Fly.io");
  }
  const targetApp = appName;
  return flyApiRequest(`/v1/apps/${targetApp}/machines/${machineId}/stop`, {
    method: "POST",
    body: JSON.stringify({ config: {} }),
  });
}

// Delete a machine from a specific app
export async function deleteMachine(machineId: string, appName?: string) {
  if (!appName) {
    throw new Error("appName is required for deleting a machine on Fly.io");
  }
  const targetApp = appName;
  return flyApiRequest(`/v1/apps/${targetApp}/machines/${machineId}`, {
    method: "DELETE",
  });
}

// Update machine configuration in a specific app
export async function updateMachine(
  machineId: string,
  config: Partial<MachineConfig>,
  appName?: string
) {
  if (!appName) {
    throw new Error("appName is required for updating a machine on Fly.io");
  }
  const targetApp = appName;
  return flyApiRequest(`/v1/apps/${targetApp}/machines/${machineId}`, {
    method: "PATCH",
    body: JSON.stringify(config),
  });
}

// Write files to a machine by updating its configuration
export async function updateMachineWithFiles(
  machineId: string,
  files: MachineFile[],
  appName?: string
) {
  try {
    if (!appName) {
      throw new Error(
        "appName is required for updating machine files on Fly.io"
      );
    }
    const targetApp = appName;
    console.log(
      `Adding ${files.length} files to machine ${machineId} in app ${targetApp}`
    );

    // Get the current machine config first
    const machineData = await getMachine(machineId, targetApp);

    if (!machineData || !machineData.config) {
      throw new Error("Failed to get machine configuration");
    }

    // Update the machine config with the new files
    const updatedConfig = {
      ...machineData.config,
      files: files,
    };

    // Update the machine with the new config
    const response = await flyApiRequest(
      `/v1/apps/${targetApp}/machines/${machineId}`,
      {
        method: "POST",
        body: JSON.stringify({
          config: updatedConfig,
        }),
      }
    );

    console.log("Machine update response:", JSON.stringify(response, null, 2));

    return { success: true, data: response };
  } catch (error) {
    console.error("Error updating machine with files:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error adding files",
    };
  }
}
