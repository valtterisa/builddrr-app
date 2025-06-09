import { createApps } from "@/lib/fly";
import { NextResponse } from "next/server";
import { getUser } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  //   Only allow admin to make this request
  const user = await getUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await createApps({
      count: 20,
      orgSlug: "personal",
      image: "docker.io/valzuxxx/plain-nextjs-app:latest",
    });

    // fetch the apps and details from fly.io
    const apps = await fetch(
      `${process.env.FLY_API_BASE}/v1/apps?org_slug=personal`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    const appsData = await apps.json();

    const supabase = await createClient();

    // get machines for each app and put to supabase
    for (const app of appsData.apps) {
      const machineResponse = await fetch(
        `${process.env.FLY_API_BASE}/v1/apps/${app.name}/machines`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      const machineData = await machineResponse.json();
      await supabase.from("preview_environments").insert({
        app_name: app.name,
        machine_id: machineData[0].id,
        status: "non-active",
      });
    }

    return NextResponse.json(
      { ok: true, message: "Apps created" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to create apps", details: error },
      { status: 500 }
    );
  }
}
