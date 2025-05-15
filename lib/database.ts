import { createClient } from "@/lib/supabase/server";
import type { PostgrestError } from "@supabase/supabase-js";

// Type definitions
export type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  avatar_url?: string;
  website?: string;
  plan: "starter" | "pro" | "enterprise";
};

export type Website = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  description?: string;
  content: any; // JSON content of the website
  published: boolean;
  template_id?: string;
  custom_domain?: string;
  settings?: any; // JSON settings
  visits: number;
  plan: "starter" | "pro" | "enterprise";
  machine_id?: string;
  app_name?: string;
  status?: string;
  url?: string;
  last_deployed?: string;
  repository_url?: string;
};

export type Domain = {
  id: string;
  created_at: string;
  updated_at: string;
  website_id: string;
  name: string;
  status: "pending" | "active" | "error";
  ssl: boolean;
  dns_records?: any; // JSON DNS records
};

export type Integration = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  website_id?: string;
  type: string;
  provider: string;
  name: string;
  config: any; // JSON configuration
  status: "active" | "pending" | "error";
};

export type Asset = {
  id: string;
  created_at: string;
  updated_at: string;
  website_id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  metadata?: any; // JSON metadata
};

// Error handling
export class DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;

  constructor(message: string, postgrestError?: PostgrestError) {
    super(message);
    this.name = "DatabaseError";

    if (postgrestError) {
      this.code = postgrestError.code;
      this.details = postgrestError.details;
      this.hint = postgrestError.hint;
    }
  }
}

// Helper function to handle database errors
function handleError(error: any, customMessage: string): never {
  console.error(`Database error: ${customMessage}`, error);

  if (error?.code === "PGRST301") {
    throw new DatabaseError("Row not found", error);
  }

  if (error?.code) {
    throw new DatabaseError(`${customMessage}: ${error.message}`, error);
  }

  throw new DatabaseError(customMessage);
}

// Profiles
export async function getProfile(userId: string): Promise<Profile> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (error) {
    return handleError(error, `Failed to get profile for user ${userId}`);
  }
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (error) {
    return handleError(error, `Failed to update profile for user ${userId}`);
  }
}

export async function upsertProfile(
  profile: Partial<Profile> & { id: string }
): Promise<Profile> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .upsert(profile)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (error) {
    return handleError(
      error,
      `Failed to upsert profile for user ${profile.id}`
    );
  }
}

// Websites
export async function getWebsites(userId: string): Promise<Website[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("websites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Website[];
  } catch (error) {
    return handleError(error, `Failed to get websites for user ${userId}`);
  }
}

export async function getWebsite(websiteId: string): Promise<Website> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .single();

    if (error) throw error;
    return data as Website;
  } catch (error) {
    return handleError(error, `Failed to get website ${websiteId}`);
  }
}

export async function createWebsite(
  userId: string,
  websiteData: Partial<Website>
): Promise<Website> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("websites")
      .insert([
        {
          user_id: userId,
          visits: 0,
          published: false,
          plan: "starter",
          ...websiteData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Website;
  } catch (error) {
    return handleError(error, `Failed to create website for user ${userId}`);
  }
}

export async function updateWebsite(
  websiteId: string,
  updates: Partial<Website>
): Promise<Website> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("websites")
      .update(updates)
      .eq("id", websiteId)
      .select()
      .single();

    if (error) throw error;
    return data as Website;
  } catch (error) {
    return handleError(error, `Failed to update website ${websiteId}`);
  }
}

export async function deleteWebsite(websiteId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("websites")
      .delete()
      .eq("id", websiteId);

    if (error) throw error;
    return true;
  } catch (error) {
    return handleError(error, `Failed to delete website ${websiteId}`);
  }
}

export async function incrementWebsiteVisits(websiteId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("increment_website_visits", {
      website_id: websiteId,
    });

    if (error) throw error;
  } catch (error) {
    console.error(
      `Failed to increment visits for website ${websiteId}:`,
      error
    );
    // Don't throw here to prevent breaking the application flow for a non-critical operation
  }
}

// Domains
export async function getDomains(websiteId: string): Promise<Domain[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .eq("website_id", websiteId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Domain[];
  } catch (error) {
    return handleError(error, `Failed to get domains for website ${websiteId}`);
  }
}

export async function getDomain(domainId: string): Promise<Domain> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .eq("id", domainId)
      .single();

    if (error) throw error;
    return data as Domain;
  } catch (error) {
    return handleError(error, `Failed to get domain ${domainId}`);
  }
}

export async function createDomain(
  websiteId: string,
  domainData: Partial<Domain>
): Promise<Domain> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("domains")
      .insert([
        {
          website_id: websiteId,
          status: "pending",
          ssl: false,
          ...domainData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Domain;
  } catch (error) {
    return handleError(
      error,
      `Failed to create domain for website ${websiteId}`
    );
  }
}

export async function updateDomain(
  domainId: string,
  updates: Partial<Domain>
): Promise<Domain> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("domains")
      .update(updates)
      .eq("id", domainId)
      .select()
      .single();

    if (error) throw error;
    return data as Domain;
  } catch (error) {
    return handleError(error, `Failed to update domain ${domainId}`);
  }
}

export async function deleteDomain(domainId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("domains")
      .delete()
      .eq("id", domainId);

    if (error) throw error;
    return true;
  } catch (error) {
    return handleError(error, `Failed to delete domain ${domainId}`);
  }
}

// Integrations
export async function getIntegrations(
  userId: string,
  websiteId?: string
): Promise<Integration[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("integrations").select("*").eq("user_id", userId);

    if (websiteId) {
      query = query.eq("website_id", websiteId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data as Integration[];
  } catch (error) {
    return handleError(error, `Failed to get integrations for user ${userId}`);
  }
}

export async function getIntegration(
  integrationId: string
): Promise<Integration> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("id", integrationId)
      .single();

    if (error) throw error;
    return data as Integration;
  } catch (error) {
    return handleError(error, `Failed to get integration ${integrationId}`);
  }
}

export async function createIntegration(
  userId: string,
  integrationData: Partial<Integration>
): Promise<Integration> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("integrations")
      .insert([
        {
          user_id: userId,
          status: "pending",
          ...integrationData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Integration;
  } catch (error) {
    return handleError(
      error,
      `Failed to create integration for user ${userId}`
    );
  }
}

export async function updateIntegration(
  integrationId: string,
  updates: Partial<Integration>
): Promise<Integration> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("integrations")
      .update(updates)
      .eq("id", integrationId)
      .select()
      .single();

    if (error) throw error;
    return data as Integration;
  } catch (error) {
    return handleError(error, `Failed to update integration ${integrationId}`);
  }
}

export async function deleteIntegration(
  integrationId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("integrations")
      .delete()
      .eq("id", integrationId);

    if (error) throw error;
    return true;
  } catch (error) {
    return handleError(error, `Failed to delete integration ${integrationId}`);
  }
}

// Assets
export async function getAssets(websiteId: string): Promise<Asset[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("website_id", websiteId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Asset[];
  } catch (error) {
    return handleError(error, `Failed to get assets for website ${websiteId}`);
  }
}

export async function getAsset(assetId: string): Promise<Asset> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("id", assetId)
      .single();

    if (error) throw error;
    return data as Asset;
  } catch (error) {
    return handleError(error, `Failed to get asset ${assetId}`);
  }
}

export async function createAsset(
  websiteId: string,
  assetData: Partial<Asset>
): Promise<Asset> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assets")
      .insert([
        {
          website_id: websiteId,
          ...assetData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Asset;
  } catch (error) {
    return handleError(
      error,
      `Failed to create asset for website ${websiteId}`
    );
  }
}

export async function updateAsset(
  assetId: string,
  updates: Partial<Asset>
): Promise<Asset> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assets")
      .update(updates)
      .eq("id", assetId)
      .select()
      .single();

    if (error) throw error;
    return data as Asset;
  } catch (error) {
    return handleError(error, `Failed to update asset ${assetId}`);
  }
}

export async function deleteAsset(assetId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("assets").delete().eq("id", assetId);

    if (error) throw error;
    return true;
  } catch (error) {
    return handleError(error, `Failed to delete asset ${assetId}`);
  }
}

