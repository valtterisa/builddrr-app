import fs from "fs/promises";
import path from "path";

export async function getProjectContext(projectId: string): Promise<string> {
  // Example: list files and show key file contents
  const projectPath = path.join(process.cwd(), "projects", projectId);
  let context = "";
  try {
    const files = await fs.readdir(projectPath);
    context += `Files: ${files.join(", ")}`;
    // Optionally, include contents of key files
    for (const file of files) {
      if (file.match(/\.(tsx?|json|md)$/)) {
        const content = await fs.readFile(path.join(projectPath, file), "utf8");
        context += `\nFile: ${file}\n${content.slice(0, 1000)}\n---`;
      }
    }
  } catch (e) {
    context += "(Could not load project files)";
  }
  return context;
}
