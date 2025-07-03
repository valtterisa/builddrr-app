import { NextRequest, NextResponse } from "next/server";
import { getWebsite, updateWebsite } from "@/lib/database";
import { revalidatePath } from "next/cache";
import { Vercel } from "@vercel/sdk";

export async function POST(req: NextRequest) {
  try {
    const { websiteId } = await req.json();
    if (!websiteId) {
      return NextResponse.json({ error: "Missing websiteId" }, { status: 400 });
    }

    // Fetch website data
    const website = await getWebsite(websiteId);
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }
    if (!website.app_name) {
      return NextResponse.json(
        { error: "Website app_name missing" },
        { status: 400 }
      );
    }
    if (!website.content || typeof website.content !== "object") {
      return NextResponse.json(
        { error: "Website content missing or invalid" },
        { status: 400 }
      );
    }

    // Prepare files for Vercel deployment
    const files = Object.entries(website.content).map(([file, data]) => ({
      file,
      data: Buffer.from(data as string), // Vercel SDK expects Buffer
    }));
    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files to deploy" },
        { status: 400 }
      );
    }

    // Deploy to Vercel using the SDK
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    if (!VERCEL_TOKEN) {
      return NextResponse.json(
        { error: "VERCEL_TOKEN not set" },
        { status: 500 }
      );
    }
    const vercel = new Vercel({ bearerToken: VERCEL_TOKEN });
    const deployment = await vercel.deployments.createProject({
      name: website.app_name,
      files,
      projectSettings: { framework: null },
      target: "production",
    });

    // Update website record
    const vercelUrl = `https://${website.app_name}.vercel.app`;
    await updateWebsite(websiteId, {
      status: "deployed",
      last_deployed: new Date().toISOString(),
      primary_url: vercelUrl,
    });
    revalidatePath("/dashboard/website/all");
    revalidatePath(`/website/editor/${websiteId}`);

    return NextResponse.json({
      url: vercelUrl,
      status: "deployed",
      message: "Website deployed successfully to Vercel.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
