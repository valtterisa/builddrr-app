import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { agentStep, messageStatus } from "./schema";

export const list = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return [];
    return await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: { projectId: v.id("projects"), content: v.string() },
  returns: v.object({ assistantId: v.id("messages") }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");

    await ctx.db.insert("messages", {
      projectId: args.projectId,
      userId,
      role: "user",
      content: args.content,
      status: "complete",
    });

    const assistantId = await ctx.db.insert("messages", {
      projectId: args.projectId,
      userId,
      role: "assistant",
      content: "",
      steps: [],
      status: "streaming",
    });

    return { assistantId };
  },
});

export const createAssistant = mutation({
  args: { projectId: v.id("projects") },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");

    return await ctx.db.insert("messages", {
      projectId: args.projectId,
      userId,
      role: "assistant",
      content: "",
      steps: [],
      status: "streaming",
    });
  },
});

export const addStep = mutation({
  args: { messageId: v.id("messages"), step: agentStep },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.userId !== userId) throw new Error("Not found");
    const steps = [...(msg.steps ?? []), args.step];
    await ctx.db.patch(args.messageId, { steps });
    return null;
  },
});

export const setReasoning = mutation({
  args: {
    messageId: v.id("messages"),
    reasoning: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.messageId, { reasoning: args.reasoning });
    return null;
  },
});

export const setContent = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.messageId, { content: args.content });
    return null;
  },
});

export const finish = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    status: messageStatus,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.userId !== userId) throw new Error("Not found");
    const thoughtDurationMs = Math.max(0, Date.now() - msg._creationTime);
    await ctx.db.patch(args.messageId, {
      content: args.content,
      status: args.status,
      thoughtDurationMs,
    });
    return null;
  },
});
