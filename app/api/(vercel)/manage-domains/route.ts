// app/api/(vercel)/manage-domains/route.ts
import { Vercel } from "@vercel/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserDomains,
  createDomain,
  updateDomain,
  deleteDomain,
  findDomainByName,
} from "@/lib/supabase/domains";

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN!,
});

interface DomainRequest {
  projectId: string;
  domain: string;
  redirect?: string;
  redirectStatusCode?: 301 | 302 | 307 | 308;
  gitBranch?: string;
  websiteId?: string; // Added for Supabase integration
}

type RedirectStatusCode = 301 | 302 | 307 | 308;

// Get all domains for a project (also returns Supabase domains)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const domain = searchParams.get("domain");
    const websiteId = searchParams.get("websiteId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // Get user for Supabase operations
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (domain) {
      // Validate domain format
      const domainRegex =
        /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(domain)) {
        return NextResponse.json(
          { error: "Invalid domain format" },
          { status: 400 }
        );
      }

      // Get specific domain from Vercel
      try {
        const result = await vercel.projects.getProjectDomain({
          idOrName: projectId,
          domain,
        });

        // Also try to get from Supabase if user is authenticated and websiteId provided
        let supabaseDomain = null;
        if (user && websiteId) {
          const { domain: dbDomain } = await findDomainByName(
            domain,
            websiteId,
            user.id
          );
          supabaseDomain = dbDomain;
        }

        return NextResponse.json({
          domain: result.name,
          verified: result.verified,
          redirect: result.redirect || null,
          redirectStatusCode: result.redirectStatusCode || null,
          gitBranch: result.gitBranch || null,
          verification: result.verification || [],
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          supabaseDomain,
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes("not_found")) {
          return NextResponse.json(
            { error: "Domain not found in project" },
            { status: 404 }
          );
        }
        throw error;
      }
    } else {
      // Get all domains for project from Vercel
      const result = await vercel.projects.getProjectDomains({
        idOrName: projectId,
      });

      // Also get domains from Supabase if user is authenticated
      let supabaseDomains = [];
      if (user) {
        const { domains } = await getUserDomains(user.id);
        // Filter domains for this project
        supabaseDomains = domains.filter((d) => d.project_id === projectId);
      }

      return NextResponse.json({
        domains: result.domains.map((d) => ({
          name: d.name,
          verified: d.verified,
          redirect: d.redirect || null,
          redirectStatusCode: d.redirectStatusCode || null,
          gitBranch: d.gitBranch || null,
          verification: d.verification || [],
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
        pagination: result.pagination,
        supabaseDomains,
      });
    }
  } catch (error) {
    console.error("Get domains error:", error);

    if (error instanceof Error && error.message.includes("not_found")) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get domains",
      },
      { status: 500 }
    );
  }
}

// Add domain to project (also saves to Supabase)
export async function POST(request: NextRequest) {
  try {
    const {
      projectId,
      domain,
      redirect,
      redirectStatusCode,
      websiteId,
    }: DomainRequest = await request.json();

    if (!projectId || !domain) {
      return NextResponse.json(
        { error: "projectId and domain are required" },
        { status: 400 }
      );
    }

    // Get user for Supabase operations
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Validate domain format
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // Validate redirect status code if provided
    if (
      redirectStatusCode &&
      ![301, 302, 307, 308].includes(redirectStatusCode)
    ) {
      return NextResponse.json(
        {
          error: "Invalid redirect status code. Must be 301, 302, 307, or 308",
        },
        { status: 400 }
      );
    }

    // If redirect is provided but no status code, default to 307
    const statusCode =
      redirect && !redirectStatusCode ? 307 : redirectStatusCode;

    // Add to Vercel
    const result = await vercel.projects.addProjectDomain({
      idOrName: projectId,
      requestBody: {
        name: domain,
        redirect: redirect || undefined,
        redirectStatusCode: statusCode as RedirectStatusCode | undefined,
      },
    });

    // Save to Supabase if user is authenticated and websiteId provided
    let supabaseDomain = null;
    if (user && websiteId) {
      const { domain: dbDomain, error: dbError } = await createDomain(
        {
          website_id: websiteId,
          domain: domain,
          project_id: projectId,
          status: result.verified ? "active" : "pending",
          is_verified: result.verified,
          ssl: result.verified, // Assume SSL when verified
        },
        user.id
      );

      if (dbError) {
        console.warn("Failed to save domain to Supabase:", dbError);
      } else {
        supabaseDomain = dbDomain;
      }
    }

    return NextResponse.json({
      success: true,
      domain: result.name,
      verified: result.verified,
      redirect: result.redirect || null,
      redirectStatusCode: result.redirectStatusCode || null,
      verification: result.verification || [],
      supabaseDomain,
    });
  } catch (error) {
    console.error("Add domain error:", error);

    // Handle specific domain addition errors
    if (error instanceof Error) {
      if (error.message.includes("already_exists")) {
        return NextResponse.json(
          { error: "Domain already exists in project" },
          { status: 409 }
        );
      }
      if (error.message.includes("invalid_domain")) {
        return NextResponse.json(
          { error: "Invalid domain name" },
          { status: 400 }
        );
      }
      if (error.message.includes("forbidden")) {
        return NextResponse.json(
          { error: "Insufficient permissions to add domain" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to add domain",
      },
      { status: 500 }
    );
  }
}

// Update domain configuration (also updates Supabase)
export async function PATCH(request: NextRequest) {
  try {
    const {
      projectId,
      domain,
      redirect,
      redirectStatusCode,
      gitBranch,
      websiteId,
    }: DomainRequest = await request.json();

    if (!projectId || !domain) {
      return NextResponse.json(
        { error: "projectId and domain are required" },
        { status: 400 }
      );
    }

    // Get user for Supabase operations
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Validate domain format
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // Validate redirect status code if provided
    if (
      redirectStatusCode &&
      ![301, 302, 307, 308].includes(redirectStatusCode)
    ) {
      return NextResponse.json(
        {
          error: "Invalid redirect status code. Must be 301, 302, 307, or 308",
        },
        { status: 400 }
      );
    }

    // Update in Vercel
    const result = await vercel.projects.updateProjectDomain({
      idOrName: projectId,
      domain,
      requestBody: {
        redirect: redirect || undefined,
        redirectStatusCode: redirectStatusCode as
          | RedirectStatusCode
          | undefined,
        gitBranch: gitBranch || undefined,
      },
    });

    // Update in Supabase if user is authenticated and websiteId provided
    if (user && websiteId) {
      const { domain: dbDomain } = await findDomainByName(
        domain,
        websiteId,
        user.id
      );
      if (dbDomain) {
        await updateDomain(
          dbDomain.id,
          {
            status: result.verified ? "active" : "pending",
            is_verified: result.verified,
            ssl: result.verified,
          },
          user.id
        );
      }
    }

    return NextResponse.json({
      success: true,
      domain: result.name,
      updated: true,
      redirect: result.redirect || null,
      redirectStatusCode: result.redirectStatusCode || null,
      gitBranch: result.gitBranch || null,
    });
  } catch (error) {
    console.error("Update domain error:", error);

    // Handle specific domain update errors
    if (error instanceof Error) {
      if (error.message.includes("not_found")) {
        return NextResponse.json(
          { error: "Domain not found in project" },
          { status: 404 }
        );
      }
      if (error.message.includes("forbidden")) {
        return NextResponse.json(
          { error: "Insufficient permissions to update domain" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update domain",
      },
      { status: 500 }
    );
  }
}

// Remove domain from project (also removes from Supabase)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const domain = searchParams.get("domain");
    const websiteId = searchParams.get("websiteId");

    if (!projectId || !domain) {
      return NextResponse.json(
        { error: "projectId and domain are required" },
        { status: 400 }
      );
    }

    // Get user for Supabase operations
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Validate domain format
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // Remove from Vercel
    await vercel.projects.removeProjectDomain({
      idOrName: projectId,
      domain,
    });

    // Remove from Supabase if user is authenticated and websiteId provided
    if (user && websiteId) {
      const { domain: dbDomain } = await findDomainByName(
        domain,
        websiteId,
        user.id
      );
      if (dbDomain) {
        await deleteDomain(dbDomain.id, user.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Domain ${domain} removed from project`,
      domain,
    });
  } catch (error) {
    console.error("Remove domain error:", error);

    // Handle specific domain removal errors
    if (error instanceof Error) {
      if (error.message.includes("not_found")) {
        return NextResponse.json(
          { error: "Domain not found in project" },
          { status: 404 }
        );
      }
      if (error.message.includes("forbidden")) {
        return NextResponse.json(
          { error: "Insufficient permissions to remove domain" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to remove domain",
      },
      { status: 500 }
    );
  }
}
