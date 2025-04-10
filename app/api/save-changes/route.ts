import { NextResponse } from "next/server";
import { FileChange } from "@/lib/file-tracker";
import { VirtualFileSystem } from "@/lib/virtual-fs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { changes, currentFile } = body;

    // Get the virtual file system instance
    const vfs = VirtualFileSystem.getInstance();

    // Process each change
    for (const change of changes) {
      const { path, content, operation } = change;

      switch (operation) {
        case "update":
          vfs.updateFile(path, content);
          break;
        case "create":
          vfs.createFile(path, content, "html");
          break;
        case "delete":
          vfs.deleteFile(path);
          break;
      }
    }

    // Save the current state
    vfs.saveToLocalStorage();

    // Log the changes for debugging
    console.log("Processed changes:", {
      currentFile,
      changes: changes.map((change: FileChange) => ({
        path: change.path,
        operation: change.operation,
        timestamp: new Date(change.timestamp).toISOString(),
      })),
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Changes saved successfully",
      currentFile,
      changesCount: changes.length,
    });
  } catch (error) {
    console.error("Error saving changes:", error);
    return NextResponse.json(
      { error: "Failed to save changes" },
      { status: 500 }
    );
  }
}
