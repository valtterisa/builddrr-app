import { createClient } from "@/lib/supabase/server";
import type { PostgrestError } from "@supabase/supabase-js";

// Type definitions
export type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  referral_code: string | null;
  referred_by: string | null; // UUID reference to another profile
};

export type WebsiteUser = {
  website_id: string;
  user_id: string;
  role: "owner" | "admin" | "editor" | "viewer";
  created_at: string;
};

export type Website = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  description: string | null;
  content: any; // JSON content of the website
  published: boolean;
  template_id: string | null;
  primary_url: string | null;
  settings?: any; // JSON settings
  machine_id: string | null;
  app_name: string | null;
  status: string;
  preview_url: string | null;
  last_deployed: string | null;
  repository_url: string | null;
  deleted_at: string | null;
  subdomain: string | null;
  primary_domain: string | null;
};

export type Domain = {
  id: string;
  website_id: string | null;
  domain: string;
  is_custom: boolean;
  is_primary: boolean;
  verified: boolean;
  created_at: string;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  billing_period: "monthly" | "yearly" | null;
  is_active: boolean;
  created_at: string;
};

export type Subscription = {
  id: string;
  website_id: string | null;
  plan_id: string | null;
  stripe_subscription_id: string | null;
  billing_period: "monthly" | "yearly" | null;
  status: "active" | "canceled" | "trialing" | "past_due";
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  canceled_at: string | null;
  trial_end: string | null;
  created_at: string;
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

export type DatabaseError = {
  name: string;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

export function createDatabaseError(
  message: string,
  postgrestError?: PostgrestError
): DatabaseError {
  return {
    name: "DatabaseError",
    message,
    code: postgrestError?.code,
    details: postgrestError?.details,
    hint: postgrestError?.hint,
  };
}

// Helper function to handle database errors
function handleError(error: any, customMessage: string): never {
  console.error(`Database error: ${customMessage}`, error);

  if (error?.code === "PGRST301") {
    throw createDatabaseError("Row not found", error);
  }

  if (error?.code) {
    throw createDatabaseError(`${customMessage}: ${error.message}`, error);
  }

  throw createDatabaseError(customMessage);
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
export async function getWebsitesForUser(userId: string): Promise<Website[]> {
  try {
    const supabase = await createClient();

    // 1. Get all website_ids for this user from website_users
    const { data: websiteUserRows, error: websiteUserError } = await supabase
      .from("website_users")
      .select("website_id, user_id")
      .eq("user_id", userId);

    if (websiteUserError) {
      console.error("Failed to get website_users:", websiteUserError);
      return [];
    }

    const websiteIds = (websiteUserRows ?? []).map(
      (row: { website_id: string }) => row.website_id
    );

    if (websiteIds.length === 0) return [];

    // 2. Get all websites with those IDs
    const { data, error } = await supabase
      .from("websites")
      .select("*")
      .in("id", websiteIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to get websites:", error);
      return [];
    }

    // Ensure data is serialized into plain objects
    return JSON.parse(JSON.stringify(data)) as Website[];
  } catch (error) {
    console.error(`Failed to get websites for user ${userId}:`, error);
    return [];
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

    if (error) {
      console.error("Failed to get website:", error);
      throw error;
    }

    // Ensure data is serialized into a plain object
    return JSON.parse(JSON.stringify(data)) as Website;
  } catch (error) {
    console.error(`Failed to get website with ID ${websiteId}:`, error);
    throw error;
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
          published: false,
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

// Website Users/Team Members
export async function getWebsiteUsers(
  websiteId: string
): Promise<(WebsiteUser & { profile: Profile })[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("website_users")
      .select(
        `
        *,
        profile:user_id (*)
      `
      )
      .eq("website_id", websiteId);

    if (error) throw error;

    return data.map((item) => ({
      website_id: item.website_id,
      user_id: item.user_id,
      role: item.role as WebsiteUser["role"],
      created_at: item.created_at,
      profile: item.profile as Profile,
    }));
  } catch (error) {
    return handleError(error, `Failed to get users for website ${websiteId}`);
  }
}

export async function getUserWebsites(
  userId: string
): Promise<(WebsiteUser & { website: Website })[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("website_users")
      .select(
        `
        *,
        website:website_id (*)
      `
      )
      .eq("user_id", userId);

    if (error) throw error;

    return data.map((item) => ({
      website_id: item.website_id,
      user_id: item.user_id,
      role: item.role as WebsiteUser["role"],
      created_at: item.created_at,
      website: item.website as Website,
    }));
  } catch (error) {
    return handleError(error, `Failed to get websites for user ${userId}`);
  }
}

export async function addWebsiteUser(
  websiteId: string,
  userId: string,
  role: WebsiteUser["role"] = "admin"
): Promise<WebsiteUser> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("website_users")
      .insert([
        {
          website_id: websiteId,
          user_id: userId,
          role,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as WebsiteUser;
  } catch (error) {
    console.error(
      `Failed to add user ${userId} to website ${websiteId} with role ${role}:`,
      error
    );
    return handleError(
      error,
      `Failed to add user ${userId} to website ${websiteId}`
    );
  }
}

export async function updateWebsiteUserRole(
  websiteId: string,
  userId: string,
  role: WebsiteUser["role"]
): Promise<WebsiteUser> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("website_users")
      .update({ role })
      .eq("website_id", websiteId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as WebsiteUser;
  } catch (error) {
    return handleError(
      error,
      `Failed to update role for user ${userId} on website ${websiteId}`
    );
  }
}

export async function removeWebsiteUser(
  websiteId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("website_users")
      .delete()
      .eq("website_id", websiteId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    return handleError(
      error,
      `Failed to remove user ${userId} from website ${websiteId}`
    );
  }
}

export async function getWebsiteUserRole(
  websiteId: string,
  userId: string
): Promise<WebsiteUser["role"] | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("website_users")
      .select("role")
      .eq("website_id", websiteId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data ? (data.role as WebsiteUser["role"]) : null;
  } catch (error) {
    return handleError(
      error,
      `Failed to get role for user ${userId} on website ${websiteId}`
    );
  }
}

export async function canUserAccessWebsite(
  websiteId: string,
  userId: string,
  requiredRole?: WebsiteUser["role"][]
): Promise<boolean> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("website_users")
      .select("role")
      .eq("website_id", websiteId)
      .eq("user_id", userId);

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    if (!data) return false;

    if (!requiredRole) return true;

    return requiredRole.includes(data.role as WebsiteUser["role"]);
  } catch (error) {
    console.error(`Error checking website access: ${error}`);
    return false;
  }
}

export async function transferWebsiteOwnership(
  websiteId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<boolean> {
  try {
    // Begin transaction
    const supabase = await createClient();

    // 1. Verify current user is owner
    const { data: currentOwnerData, error: ownerError } = await supabase
      .from("website_users")
      .select("role")
      .eq("website_id", websiteId)
      .eq("user_id", currentOwnerId)
      .single();

    if (ownerError) throw ownerError;
    if (currentOwnerData.role !== "owner") {
      throw new Error("Only the website owner can transfer ownership");
    }

    // 2. Check if new owner is already a team member
    const { data: newOwnerExists, error: checkError } = await supabase
      .from("website_users")
      .select("user_id")
      .eq("website_id", websiteId)
      .eq("user_id", newOwnerId)
      .maybeSingle();

    if (checkError) throw checkError;

    // Start transaction operations

    // 3. Set new owner's role to "owner"
    if (newOwnerExists) {
      const { error: updateError } = await supabase
        .from("website_users")
        .update({ role: "owner" })
        .eq("website_id", websiteId)
        .eq("user_id", newOwnerId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("website_users")
        .insert({
          website_id: websiteId,
          user_id: newOwnerId,
          role: "owner",
        });

      if (insertError) throw insertError;
    }

    // 4. Demote current owner to admin
    const { error: demoteError } = await supabase
      .from("website_users")
      .update({ role: "admin" })
      .eq("website_id", websiteId)
      .eq("user_id", currentOwnerId);

    if (demoteError) throw demoteError;

    // 5. Update the actual website record
    const { error: websiteError } = await supabase
      .from("websites")
      .update({ user_id: newOwnerId })
      .eq("id", websiteId);

    if (websiteError) throw websiteError;

    return true;
  } catch (error) {
    return handleError(
      error,
      `Failed to transfer ownership of website ${websiteId} from ${currentOwnerId} to ${newOwnerId}`
    );
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
