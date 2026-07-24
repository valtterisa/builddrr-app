import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import {
  projectStatus,
  publishStatus,
  domainStatus,
  sitePlanValidator,
} from "./schema";
import {
  projectDocValidator,
  requireOwnedProject,
} from "./lib/auth";
import { authedMutation } from "./lib/customFunctions";

export const create = authedMutation({
  args: {
    prompt: v.string(),
    name: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const name = args.name?.trim() || deriveName(args.prompt);
    const projectId = await ctx.db.insert("projects", {
      userId: ctx.userId,
      name,
      initialPrompt: args.prompt,
      modelId: args.modelId,
      status: "draft",
      publishStatus: "idle",
    });

    await ctx.db.insert("messages", {
      projectId,
      userId: ctx.userId,
      role: "user",
      content: args.prompt,
      status: "complete",
    });

    return projectId;
  },
});

export const list = query({
  args: {},
  returns: v.array(projectDocValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  returns: v.union(projectDocValidator, v.null()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return null;
    return project;
  },
});

export const remove = authedMutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    for (const m of msgs) await ctx.db.delete(m._id);
    await ctx.db.delete(args.projectId);
    return null;
  },
});

export const setModel = authedMutation({
  args: { projectId: v.id("projects"), modelId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, { modelId: args.modelId });
    return null;
  },
});

const STALE_BUSY_MS = 15 * 60 * 1000;

function isBusyStale(busyAt: number | undefined): boolean {
  return typeof busyAt === "number" && Date.now() - busyAt > STALE_BUSY_MS;
}

function isGenerationBusy(project: {
  status: string;
  publishStatus?: string;
  busyAt?: number;
}): boolean {
  const genBusy =
    project.status === "provisioning" || project.status === "generating";
  const pubBusy = project.publishStatus === "publishing";
  if (!genBusy && !pubBusy) return false;
  return !isBusyStale(project.busyAt);
}

export const claimGeneration = authedMutation({
  args: { projectId: v.id("projects") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const { project } = await requireOwnedProject(ctx, args.projectId);
    if (isGenerationBusy(project)) return false;
    await ctx.db.patch(args.projectId, {
      status: project.boxId ? "generating" : "provisioning",
      busyAt: Date.now(),
      error: undefined,
    });
    return true;
  },
});

export const claimPublish = authedMutation({
  args: { projectId: v.id("projects") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const { project } = await requireOwnedProject(ctx, args.projectId);
    if (isGenerationBusy(project)) return false;
    if (!project.boxId) return false;
    await ctx.db.patch(args.projectId, {
      publishStatus: "publishing",
      busyAt: Date.now(),
      publishError: undefined,
    });
    return true;
  },
});

export const resetBusy = authedMutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { project } = await requireOwnedProject(ctx, args.projectId);
    const nextStatus =
      project.status === "provisioning" || project.status === "generating"
        ? project.boxId
          ? "ready"
          : "draft"
        : project.status;
    const nextPublish =
      project.publishStatus === "publishing"
        ? project.publishedUrl
          ? "published"
          : "error"
        : project.publishStatus;
    await ctx.db.patch(args.projectId, {
      status: nextStatus,
      publishStatus: nextPublish,
      busyAt: undefined,
      ...(project.publishStatus === "publishing" && !project.publishedUrl
        ? { publishError: "Publish was cancelled." }
        : {}),
      ...(project.status === "provisioning" || project.status === "generating"
        ? { error: undefined }
        : {}),
    });
    return null;
  },
});

export const setStatus = authedMutation({
  args: { projectId: v.id("projects"), status: projectStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    const busy =
      args.status === "provisioning" || args.status === "generating";
    await ctx.db.patch(args.projectId, {
      status: args.status,
      busyAt: busy ? Date.now() : undefined,
    });
    return null;
  },
});

export const setBox = authedMutation({
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

export const setPreview = authedMutation({
  args: { projectId: v.id("projects"), previewUrl: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, { previewUrl: args.previewUrl });
    return null;
  },
});

export const setPlan = authedMutation({
  args: { projectId: v.id("projects"), plan: sitePlanValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, { plan: args.plan });
    return null;
  },
});

export const setError = authedMutation({
  args: { projectId: v.id("projects"), error: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, {
      status: "error",
      error: args.error,
      busyAt: undefined,
    });
    return null;
  },
});

export const setPublishStatus = authedMutation({
  args: {
    projectId: v.id("projects"),
    status: publishStatus,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, {
      publishStatus: args.status,
      busyAt: args.status === "publishing" ? Date.now() : undefined,
      ...(args.status === "publishing" ? { publishError: undefined } : {}),
    });
    return null;
  },
});

export const setPublished = authedMutation({
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
      busyAt: undefined,
    });
    return null;
  },
});

export const setPublishError = authedMutation({
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
      busyAt: undefined,
    });
    return null;
  },
});

export const clearPublished = authedMutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedProject(ctx, args.projectId);
    await ctx.db.patch(args.projectId, {
      publishStatus: "idle",
      busyAt: undefined,
      cfProjectName: undefined,
      cfSubdomain: undefined,
      publishedUrl: undefined,
      publishedAt: undefined,
      publishError: undefined,
      customDomain: undefined,
      customDomainStatus: undefined,
      customDomainError: undefined,
      customDomainUpdatedAt: undefined,
    });
    return null;
  },
});

export const setCustomDomain = authedMutation({
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

export const clearCustomDomain = authedMutation({
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
