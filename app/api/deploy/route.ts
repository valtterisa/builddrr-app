import { NextResponse } from "next/server";
import Cloudflare from "cloudflare";

export async function PUT(req: Request) {
  const { user } = await req.json();

  const client = new Cloudflare({
    apiToken: process.env.CLOUDFLARE_ACCOUNT_TOKEN!,
  });

  const workerScript = `
  export default {
  async fetch(request, env, ctx) {
    return new Response(env.MESSAGE, { status: 200 });
  }
};`;

  try {
    await client.workers.scripts.update(`${user.id}-builddrr-prod`, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID!,
      metadata: {
        main_module: "worker.js",
      },
      files: {
        "worker.js": new File([workerScript], "worker.js", {
          type: "application/javascript+module",
        }),
        // [scriptFileName]: await toFile(Buffer.from(scriptContent), scriptFileName, {
        //   type: 'application/javascript+module',
        // }),
      },
    });

    return NextResponse.json({ message: "Script updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update script", details: error },
      { status: 500 }
    );
  }
}
