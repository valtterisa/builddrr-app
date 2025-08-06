import { NextResponse } from "next/server";
import Cloudflare from "cloudflare";

export async function PUT(req: Request) {
  const { user } = await req.json();

  const client = new Cloudflare({
    apiToken: process.env.CLOUDFLARE_ACCOUNT_TOKEN!,
  });

  // Test worker script content
  const workerScript = `
export default {
  async fetch(request, env, ctx) {
    return new Response("Hello from Cloudflare Worker!", {
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
`;

  try {
    await client.workers.scripts.update(`${user.id}-builddrr-prod`, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
      metadata: {
        main_module: "worker.js",
      },
      files: [
        {
          name: "worker.js",
          content: workerScript,
          type: "application/javascript+module",
        },
      ] as any,
    });

    return NextResponse.json({ message: "Script updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update script", details: error },
      { status: 500 }
    );
  }
}
