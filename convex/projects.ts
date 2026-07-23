import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { projectStatus, publishStatus, domainStatus } from "./schema";

export const create = mutation({
  args: {
    prompt: v.string(),
    name: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const name = args.name?.trim() || deriveName(args.prompt);
    const projectId = await ctx.db.insert("projects", {
      userId,
      name,
      initialPrompt: args.prompt,
      modelId: args.modelId,
      status: "ready",
      publishStatus: "idle",
    });

    await ctx.db.insert("messages", {
      projectId,
      userId,
      role: "user",
      content: args.prompt,
      status: "complete",
    });

    await ctx.db.insert("messages", {
      projectId,
      userId,
      role: "assistant",
      content: "",
      steps: [],
      status: "streaming",
    });

    return projectId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return null;
    return project;
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const m of msgs) await ctx.db.delete(m._id);
    await ctx.db.delete(args.projectId);
    return null;
  },
});

async function requireOwnedProject(
  ctx: MutationCtx,
  projectId: Id<"projects">
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const project = await ctx.db.get(projectId);
  if (!project || project.userId !== userId) throw new Error("Not found");
  return { userId, project };
}

export const setStatus = mutation({
  args: { projectId: v.id("projects"), status: projectStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, { status: args.status });
    return null;
  },
});

export const setBox = mutation({
  args: {
    projectId: v.id("projects"),
    boxId: v.string(),
    boxSubdomain: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, {
      boxId: args.boxId,
      ...(args.boxSubdomain ? { boxSubdomain: args.boxSubdomain } : {}),
    });
    return null;
  },
});

export const setPreview = mutation({
  args: { projectId: v.id("projects"), previewUrl: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, { previewUrl: args.previewUrl });
    return null;
  },
});

export const setPlan = mutation({
  args: { projectId: v.id("projects"), plan: v.any() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, { plan: args.plan });
    return null;
  },
});

export const setError = mutation({
  args: { projectId: v.id("projects"), error: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, { status: "error", error: args.error });
    return null;
  },
});

export const setModel = mutation({
  args: { projectId: v.id("projects"), modelId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, { modelId: args.modelId });
    return null;
  },
});

export const setPublishStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: publishStatus,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, {
      publishStatus: args.status,
      ...(args.status === "publishing" ? { publishError: undefined } : {}),
    });
    return null;
  },
});

export const setPublished = mutation({
  args: {
    projectId: v.id("projects"),
    cfProjectName: v.string(),
    cfSubdomain: v.string(),
    publishedUrl: v.string(),
    publishedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, {
      publishStatus: "published",
      cfProjectName: args.cfProjectName,
      cfSubdomain: args.cfSubdomain,
      publishedUrl: args.publishedUrl,
      publishedAt: args.publishedAt,
      publishError: undefined,
    });
    return null;
  },
});

export const setPublishError = mutation({
  args: {
    projectId: v.id("projects"),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { project } = await requireOwnedProject(ctx, args.projectId);
    const wasPublished = project.publishStatus === "published";
    await ctx.db.patch(args.projectId, {
      publishStatus: wasPublished ? "published" : "error",
      publishError: args.error,
    });
    return null;
  },
});

export const setCustomDomain = mutation({
  args: {
    projectId: v.id("projects"),
    domain: v.string(),
    status: domainStatus,
    error: v.optional(v.string()),
    updatedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, {
      customDomain: args.domain,
      customDomainStatus: args.status,
      customDomainError: args.error,
      customDomainUpdatedAt: args.updatedAt,
    });
    return null;
  },
});

export const clearCustomDomain = mutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, {
      customDomain: undefined,
      customDomainStatus: undefined,
      customDomainError: undefined,
      customDomainUpdatedAt: undefined,
    });
    return null;
  },
});

function deriveName(prompt: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, " ");
  const words = cleaned.split(" ").slice(0, 6).join(" ");
  return words.length > 48 ? words.slice(0, 48) + "…" : words || "Untitled site";
}
