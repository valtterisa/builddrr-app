import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import {
  agentStep,
  domainStatus,
  messageRole,
  messageStatus,
  projectStatus,
  publishStatus,
} from "../schema";

export type AuthedCtx = (QueryCtx | MutationCtx) & { userId: Id<"users"> };

export async function requireAuthUserId(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function requireOwnedProject(
  ctx: AuthedCtx | (QueryCtx | MutationCtx),
  projectId: Id<"projects">
): Promise<{ userId: Id<"users">; project: Doc<"projects"> }> {
  const userId =
    "userId" in ctx && ctx.userId
      ? ctx.userId
      : await requireAuthUserId(ctx);
  const project = await ctx.db.get(projectId);
  if (!project || project.userId !== userId) throw new Error("Not found");
  return { userId, project };
}

export async function requireOwnedMessage(
  ctx: (MutationCtx & { userId?: Id<"users"> }) | MutationCtx,
  messageId: Id<"messages">
): Promise<{ userId: Id<"users">; message: Doc<"messages"> }> {
  const userId =
    "userId" in ctx && ctx.userId
      ? ctx.userId
      : await requireAuthUserId(ctx);
  const message = await ctx.db.get(messageId);
  if (!message || message.userId !== userId) throw new Error("Not found");
  return { userId, message };
}

export const projectDocValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  userId: v.id("users"),
  name: v.string(),
  initialPrompt: v.string(),
  modelId: v.optional(v.string()),
  status: projectStatus,
  busyAt: v.optional(v.number()),
  boxId: v.optional(v.string()),
  boxSubdomain: v.optional(v.string()),
  previewUrl: v.optional(v.string()),
  plan: v.optional(v.any()),
  error: v.optional(v.string()),
  publishStatus: v.optional(publishStatus),
  cfProjectName: v.optional(v.string()),
  cfSubdomain: v.optional(v.string()),
  publishedUrl: v.optional(v.string()),
  publishedAt: v.optional(v.number()),
  publishError: v.optional(v.string()),
  customDomain: v.optional(v.string()),
  customDomainStatus: v.optional(domainStatus),
  customDomainError: v.optional(v.string()),
  customDomainUpdatedAt: v.optional(v.number()),
});

export const messageDocValidator = v.object({
  _id: v.id("messages"),
  _creationTime: v.number(),
  projectId: v.id("projects"),
  userId: v.id("users"),
  role: messageRole,
  content: v.string(),
  reasoning: v.optional(v.string()),
  steps: v.optional(v.array(agentStep)),
  thoughtDurationMs: v.optional(v.number()),
  status: messageStatus,
});
