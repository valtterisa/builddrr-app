import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Helper to download a repo zip
async function downloadRepo({
  repo,
  branch = "main",
}: {
  repo: string;
  branch?: string;
}) {
  const url = `https://github.com/${repo}/archive/refs/heads/${branch}.zip`;
  const response = await axios.get(url, { responseType: "arraybuffer" });

  if (response.status !== 200) {
    throw new Error("Failed to download repo");
  }

  return Buffer.from(response.data);
}

export async function POST(req: NextRequest) {
  try {
    const { repo, branch } = await req.json();
    if (!repo)
      return NextResponse.json({ error: "Missing repo" }, { status: 400 });

    const zipBuffer = await downloadRepo({
      repo,
      branch,
    });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=${repo.replace("/", "-")}.zip`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
