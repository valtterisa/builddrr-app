import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const machineId = params.id;

  if (!machineId) {
    return NextResponse.json(
      { error: "Machine ID is required" },
      { status: 400 }
    );
  }

  // Create a response with fly-replay header
  const response = new NextResponse(null, {
    status: 307, // Temporary redirect
    headers: {
      "fly-replay": `app=plain-nextjs-app;instance=${machineId};region=arn`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });

  return response;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle post requests the same way
  return GET(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle put requests the same way
  return GET(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle delete requests the same way
  return GET(request, { params });
}

// Define all HTTP methods to proxy
export const dynamic = "force-dynamic";
