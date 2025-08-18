// app/api/domain-purchase/route.ts
import { Vercel } from "@vercel/sdk";
import { NextRequest, NextResponse } from "next/server";

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN!,
});

interface PurchaseDomainRequest {
  domain: string;
  expectedPrice: number;
  projectId?: string;
}

// Check domain availability and price
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json(
        { error: "domain parameter is required" },
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

    // Check availability and pricing in one call
    const domainInfo = await vercel.domains.checkDomain({
      domain,
    });

    return NextResponse.json({
      domain,
      available: domainInfo.available,
      price: domainInfo.price || null,
      period: domainInfo.period || null,
      currency: domainInfo.currency || "USD",
    });
  } catch (error) {
    console.error("Domain check error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to check domain",
      },
      { status: 500 }
    );
  }
}

// Purchase domain
export async function POST(request: NextRequest) {
  try {
    const { domain, expectedPrice, projectId }: PurchaseDomainRequest =
      await request.json();

    if (!domain || expectedPrice === undefined) {
      return NextResponse.json(
        { error: "domain and expectedPrice are required" },
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

    const result = await vercel.domains.buyDomain({
      requestBody: {
        name: domain,
        expectedPrice,
      },
    });

    let addedToProject = false;
    // Optionally add to project after purchase
    if (projectId) {
      try {
        await vercel.projects.addProjectDomain({
          idOrName: projectId,
          requestBody: {
            name: domain,
          },
        });
        addedToProject = true;
      } catch (projectError) {
        console.warn("Failed to add domain to project:", projectError);
        // Continue without failing the whole request
      }
    }

    return NextResponse.json({
      success: true,
      domain: result.domain?.name || domain,
      purchased: true,
      addedToProject,
    });
  } catch (error) {
    console.error("Domain purchase error:", error);

    // Handle specific domain purchase errors
    if (error instanceof Error) {
      if (error.message.includes("insufficient_funds")) {
        return NextResponse.json(
          { error: "Insufficient funds to purchase domain" },
          { status: 402 }
        );
      }
      if (error.message.includes("domain_not_available")) {
        return NextResponse.json(
          { error: "Domain is not available for purchase" },
          { status: 409 }
        );
      }
      if (error.message.includes("price_mismatch")) {
        return NextResponse.json(
          {
            error:
              "Price has changed. Please check current price and try again",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to purchase domain",
      },
      { status: 500 }
    );
  }
}
