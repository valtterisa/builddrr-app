import { createClient } from "./server";

export interface DomainData {
  id?: string;
  website_id: string;
  domain: string;
  project_id?: string;
  status?: "pending" | "active" | "error" | "verifying";
  is_primary?: boolean;
  is_verified?: boolean;
  ssl?: boolean;
  verification_method?: string;
  verification_token?: string;
  dns_records?: any;
}

export interface WebsiteData {
  id?: string;
  user_id?: string;
  name: string;
  display_name?: string;
  description?: string;
  project_id?: string;
  status?: string;
  primary_url?: string;
}

/**
 * Get all domains for a user
 */
export async function getUserDomains(userId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("domains")
      .select(
        `
        *,
        websites!inner(
          id,
          name,
          display_name,
          project_id,
          user_id
        )
      `
      )
      .eq("websites.user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user domains:", error);
      return { domains: [], error: error.message };
    }

    return { domains: data || [], error: null };
  } catch (error) {
    console.error("Unexpected error in getUserDomains:", error);
    return { domains: [], error: "Failed to fetch domains" };
  }
}

/**
 * Get all domains for a specific website
 */
export async function getWebsiteDomains(websiteId: string, userId: string) {
  try {
    const supabase = await createClient();

    // First verify user owns the website
    const { data: website, error: websiteError } = await supabase
      .from("websites")
      .select("id")
      .eq("id", websiteId)
      .eq("user_id", userId)
      .single();

    if (websiteError || !website) {
      return { domains: [], error: "Website not found or access denied" };
    }

    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .eq("website_id", websiteId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching website domains:", error);
      return { domains: [], error: error.message };
    }

    return { domains: data || [], error: null };
  } catch (error) {
    console.error("Unexpected error in getWebsiteDomains:", error);
    return { domains: [], error: "Failed to fetch website domains" };
  }
}

/**
 * Create a new domain
 */
export async function createDomain(domainData: DomainData, userId: string) {
  try {
    const supabase = await createClient();

    // Verify user owns the website
    const { data: website, error: websiteError } = await supabase
      .from("websites")
      .select("id, project_id")
      .eq("id", domainData.website_id)
      .eq("user_id", userId)
      .single();

    if (websiteError || !website) {
      return { domain: null, error: "Website not found or access denied" };
    }

    // Use website's project_id if not provided
    const finalDomainData = {
      ...domainData,
      project_id: domainData.project_id || website.project_id,
      status: domainData.status || "pending",
      is_verified: domainData.is_verified || false,
      ssl: domainData.ssl || false,
    };

    const { data, error } = await supabase
      .from("domains")
      .insert(finalDomainData)
      .select()
      .single();

    if (error) {
      console.error("Error creating domain:", error);
      return { domain: null, error: error.message };
    }

    return { domain: data, error: null };
  } catch (error) {
    console.error("Unexpected error in createDomain:", error);
    return { domain: null, error: "Failed to create domain" };
  }
}

/**
 * Update a domain
 */
export async function updateDomain(
  domainId: string,
  updates: Partial<DomainData>,
  userId: string
) {
  try {
    const supabase = await createClient();

    // Verify user owns the domain through website ownership
    const { data: domain, error: verifyError } = await supabase
      .from("domains")
      .select(
        `
        id,
        websites!inner(user_id)
      `
      )
      .eq("id", domainId)
      .eq("websites.user_id", userId)
      .single();

    if (verifyError || !domain) {
      return { domain: null, error: "Domain not found or access denied" };
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("domains")
      .update(updateData)
      .eq("id", domainId)
      .select()
      .single();

    if (error) {
      console.error("Error updating domain:", error);
      return { domain: null, error: error.message };
    }

    return { domain: data, error: null };
  } catch (error) {
    console.error("Unexpected error in updateDomain:", error);
    return { domain: null, error: "Failed to update domain" };
  }
}

/**
 * Delete a domain
 */
export async function deleteDomain(domainId: string, userId: string) {
  try {
    const supabase = await createClient();

    // Verify user owns the domain through website ownership
    const { data: domain, error: verifyError } = await supabase
      .from("domains")
      .select(
        `
        id,
        domain,
        project_id,
        websites!inner(user_id)
      `
      )
      .eq("id", domainId)
      .eq("websites.user_id", userId)
      .single();

    if (verifyError || !domain) {
      return { success: false, error: "Domain not found or access denied" };
    }

    const { error } = await supabase
      .from("domains")
      .delete()
      .eq("id", domainId);

    if (error) {
      console.error("Error deleting domain:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      error: null,
      deletedDomain: {
        id: domain.id,
        domain: domain.domain,
        project_id: domain.project_id,
      },
    };
  } catch (error) {
    console.error("Unexpected error in deleteDomain:", error);
    return { success: false, error: "Failed to delete domain" };
  }
}

/**
 * Find a domain by name and website
 */
export async function findDomainByName(
  domainName: string,
  websiteId: string,
  userId: string
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("domains")
      .select(
        `
        *,
        websites!inner(user_id)
      `
      )
      .eq("domain", domainName)
      .eq("website_id", websiteId)
      .eq("websites.user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error finding domain:", error);
      return { domain: null, error: error.message };
    }

    return { domain: data, error: null };
  } catch (error) {
    console.error("Unexpected error in findDomainByName:", error);
    return { domain: null, error: "Failed to find domain" };
  }
}

/**
 * Get all websites for a user
 */
export async function getUserWebsites(userId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("websites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user websites:", error);
      return { websites: [], error: error.message };
    }

    return { websites: data || [], error: null };
  } catch (error) {
    console.error("Unexpected error in getUserWebsites:", error);
    return { websites: [], error: "Failed to fetch websites" };
  }
}

/**
 * Update website information
 */
export async function updateWebsite(
  websiteId: string,
  updates: Partial<WebsiteData>,
  userId: string
) {
  try {
    const supabase = await createClient();

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("websites")
      .update(updateData)
      .eq("id", websiteId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating website:", error);
      return { website: null, error: error.message };
    }

    if (!data) {
      return { website: null, error: "Website not found" };
    }

    return { website: data, error: null };
  } catch (error) {
    console.error("Unexpected error in updateWebsite:", error);
    return { website: null, error: "Failed to update website" };
  }
}
