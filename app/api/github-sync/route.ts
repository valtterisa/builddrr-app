import { NextRequest, NextResponse } from "next/server";
import {
  createRepoFromTemplate,
  uploadFilesToRepo,
  RepoFile,
} from "@/lib/github";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appName, files } = body as { appName?: string; files?: RepoFile[] };

    if (!appName || !files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Missing appName or files" },
        { status: 400 }
      );
    }

    // 1. Create repo from template
    const repoUrl = await createRepoFromTemplate(appName);
    const repoName = `builddrr-user-site-${appName}`;

    // 2. Upload files
    await uploadFilesToRepo(repoName, files);

    return NextResponse.json({ repoUrl });
  } catch (error: any) {
    console.error("GitHub sync error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
