import { Vercel } from "@vercel/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findDomainByName, updateDomain } from "@/lib/supabase/domains";

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN!,
});

// Vercel's current IP addresses for A/AAAA records (updated as of 2024)
const VERCEL_IPS = {
  A: ["76.76.19.19", "76.223.126.88"],
  AAAA: ["2600:1f18:147f:e850::2", "2600:1f18:147f:e851::2"],
};

interface VerificationRequest {
  projectId: string;
  domain: string;
  websiteId?: string; // Added for Supabase integration
}

function isApexDomain(domain: string): boolean {
  // Apex domain has exactly 2 parts (e.g., example.com)
  // Subdomain has 3+ parts (e.g., www.example.com, api.example.com)
  const parts = domain.split(".");
  return parts.length === 2;
}

// Get DNS verification requirements for external domain
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const domain = searchParams.get("domain");

    if (!projectId || !domain) {
      return NextResponse.json(
        { error: "projectId and domain are required" },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    let domainInfo;
    let domainConfig;

    try {
      domainInfo = await vercel.projects.getProjectDomain({
        idOrName: projectId,
        domain,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not_found")) {
        return NextResponse.json(
          { error: "Domain not found in project. Add it first." },
          { status: 404 }
        );
      }
      throw error;
    }

    try {
      domainConfig = await vercel.domains.getDomainConfig({
        domain,
      });
    } catch (error) {
      console.warn("Could not fetch domain config:", error);
      domainConfig = { configuredBy: "EXTERNAL", misconfigured: false };
    }

    const isApex = isApexDomain(domain);
    const requiredRecords = [];

    if (isApex) {
      // Apex domain needs A and AAAA records
      VERCEL_IPS.A.forEach((ip) => {
        requiredRecords.push({
          type: "A",
          name: "@",
          value: ip,
          ttl: 3600,
        });
      });

      VERCEL_IPS.AAAA.forEach((ip) => {
        requiredRecords.push({
          type: "AAAA",
          name: "@",
          value: ip,
          ttl: 3600,
        });
      });
    } else {
      // Subdomain uses CNAME
      const subdomain = domain.split(".").slice(0, -2).join(".");
      requiredRecords.push({
        type: "CNAME",
        name: subdomain || domain.split(".")[0],
        value: "cname.vercel-dns.com",
        ttl: 3600,
      });
    }

    // Add TXT record for verification if needed
    if (domainInfo.verification && domainInfo.verification.length > 0) {
      domainInfo.verification.forEach((verification) => {
        requiredRecords.push({
          type: "TXT",
          name: "_vercel",
          value: verification.value,
          ttl: 3600,
        });
      });
    }

    return NextResponse.json({
      domain: domainInfo.name,
      verified: domainInfo.verified,
      isApexDomain: isApex,
      verification: domainInfo.verification || [],
      dnsRecords: {
        required: requiredRecords,
        current:
          domainConfig.configuredBy === "VERCEL"
            ? "Managed by Vercel"
            : "External DNS",
        instructions: isApex
          ? "Add A and AAAA records for apex domain pointing to Vercel"
          : "Add CNAME record for subdomain pointing to cname.vercel-dns.com",
      },
      misconfigured: domainConfig.misconfigured || false,
      acceptedChallenges: domainConfig.acceptedChallenges || [],
    });
  } catch (error) {
    console.error("Domain verification GET error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get verification info",
      },
      { status: 500 }
    );
  }
}

// Verify domain after DNS setup (also updates Supabase)
export async function POST(request: NextRequest) {
  try {
    const { projectId, domain, websiteId }: VerificationRequest =
      await request.json();

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

    const result = await vercel.projects.verifyProjectDomain({
      idOrName: projectId,
      domain,
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
            is_verified: result.verified,
            status: result.verified ? "active" : "pending",
            ssl: result.verified,
            verification_method: result.verified ? "dns" : undefined,
          },
          user.id
        );
      }
    }

    return NextResponse.json({
      success: true,
      domain,
      verified: result.verified,
      message: result.verified
        ? "Domain verified successfully"
        : "Domain verification is still pending. DNS changes may take time to propagate.",
      verification: result.verification || [],
    });
  } catch (error) {
    console.error("Domain verification POST error:", error);

    // Handle specific verification errors
    if (error instanceof Error) {
      if (error.message.includes("not_found")) {
        return NextResponse.json(
          { error: "Domain not found in project" },
          { status: 404 }
        );
      }
      if (error.message.includes("forbidden")) {
        return NextResponse.json(
          { error: "Insufficient permissions to verify domain" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to verify domain",
      },
      { status: 500 }
    );
  }
}
