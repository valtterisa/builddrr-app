import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const FLY_API_TOKEN = process.env.FLY_API_TOKEN;
  const appName = "plain-nextjs-app"; // Replace with your Fly.io app name
  const { machineId } = await req.json();

  if (!FLY_API_TOKEN) {
    return NextResponse.json(
      { error: "Fly.io API token is not set" },
      { status: 500 }
    );
  }

  if (!machineId) {
    return NextResponse.json(
      { error: "Machine ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.machines.dev/v1/apps/${appName}/machines/${machineId}/start`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FLY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to start machine", details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Machine starting initiated" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error },
      { status: 500 }
    );
  }
}
