import type { Id } from "@/convex/_generated/dataModel";

export function asProjectId(id: string): Id<"projects"> {
  return id as Id<"projects">;
}

export function asMessageId(id: string): Id<"messages"> {
  return id as Id<"messages">;
}
