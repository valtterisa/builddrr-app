import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; path: string[] } }
) {
  const { id: machineId, path } = params;
  const fullPath = path.join("/");

  if (!machineId) {
    return NextResponse.json(
      { error: "Machine ID is required" },
      { status: 400 }
    );
  }

  console.log(`Proxying request to machine ${machineId}, path: /${fullPath}`);

  // Create a response with fly-replay header
  const response = new NextResponse(null, {
    status: 307, // Temporary redirect
    headers: {
      "Location": `https://plain-nextjs-app.fly.dev/${fullPath}`,
      "fly-replay": `app=plain-nextjs-app;instance=${machineId}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });

  return response;
}

// Handle all HTTP methods
export { GET as POST, GET as PUT, GET as DELETE, GET as PATCH };

// Make this route dynamic
export const dynamic = "force-dynamic";
