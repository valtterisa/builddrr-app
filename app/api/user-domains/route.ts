import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserDomains, getUserWebsites } from "@/lib/supabase/domains";

// Get all domains for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeWebsites = searchParams.get("includeWebsites") === "true";

    // Get domains
    const { domains, error: domainsError } = await getUserDomains(user.id);

    if (domainsError) {
      return NextResponse.json({ error: domainsError }, { status: 500 });
    }

    // Optionally include websites data
    let websites = [];
    if (includeWebsites) {
      const { websites: userWebsites, error: websitesError } =
        await getUserWebsites(user.id);
      if (!websitesError) {
        websites = userWebsites;
      }
    }

    return NextResponse.json({
      domains: domains.map((domain) => ({
        id: domain.id,
        name: domain.domain,
        status: domain.status || (domain.is_verified ? "active" : "pending"),
        websiteId: domain.website_id,
        websiteName:
          domain.websites?.display_name || domain.websites?.name || "Unknown",
        ssl: domain.ssl || domain.is_verified,
        verified: domain.is_verified,
        createdAt: domain.created_at,
        projectId: domain.project_id,
      })),
      websites: websites.map((website) => ({
        id: website.id,
        name: website.display_name || website.name,
        url: website.primary_url || `https://builddrr.app/${website.name}`,
        projectId: website.project_id,
      })),
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
