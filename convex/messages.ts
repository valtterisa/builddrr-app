import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { agentStep, messageStatus } from "./schema";
import {
  messageDocValidator,
  requireOwnedMessage,
  requireOwnedProject,
} from "./lib/auth";
import { authedMutation } from "./lib/customFunctions";

export const list = query({
  args: { projectId: v.id("projects") },
  returns: v.array(messageDocValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return [];
    return await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .take(200);
  },
});

export const send = authedMutation({
  args: {
    projectId: v.id("projects"),
    content: v.string(),
    modelId: v.optional(v.string()),
  },
  returns: v.object({ assistantId: v.id("messages") }),
  handler: async (ctx, args) => {
    const { userId, project } = await requireOwnedProject(ctx, args.projectId);

    if (
      project.status === "provisioning" ||
      project.status === "generating" ||
      project.publishStatus === "publishing"
    ) {
      throw new Error("Project is busy");
    }

    const recent = await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(8);
    if (recent.some((m) => m.status === "streaming")) {
      throw new Error("A turn is already in progress");
    }

    if (args.modelId) {
      await ctx.db.patch(args.projectId, { modelId: args.modelId });
    }

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

export const abandonStreamingTurn = authedMutation({
  args: { messageId: v.id("messages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { message } = await requireOwnedMessage(ctx, args.messageId);
    if (message.status !== "streaming") return null;
    await ctx.db.patch(args.messageId, {
      content: "Could not start. Try again.",
      status: "error",
    });
    return null;
  },
});

export const createAssistant = authedMutation({
  args: { projectId: v.id("projects") },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const { userId } = await requireOwnedProject(ctx, args.projectId);

    const recent = await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(8);
    if (recent.some((m) => m.status === "streaming")) {
      throw new Error("A turn is already in progress");
    }

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

export const addStep = authedMutation({
  args: { messageId: v.id("messages"), step: agentStep },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { message: msg } = await requireOwnedMessage(ctx, args.messageId);
    const steps = [...(msg.steps ?? []), args.step];
    await ctx.db.patch(args.messageId, { steps });
    return null;
  },
});

export const setReasoning = authedMutation({
  args: {
    messageId: v.id("messages"),
    reasoning: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedMessage(ctx, args.messageId);
    await ctx.db.patch(args.messageId, { reasoning: args.reasoning });
    return null;
  },
});

export const setContent = authedMutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnedMessage(ctx, args.messageId);
    await ctx.db.patch(args.messageId, { content: args.content });
    return null;
  },
});

export const finish = authedMutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    status: messageStatus,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { message: msg } = await requireOwnedMessage(ctx, args.messageId);
    const thoughtDurationMs = Math.max(0, Date.now() - msg._creationTime);
    await ctx.db.patch(args.messageId, {
      content: args.content,
      status: args.status,
      thoughtDurationMs,
    });
    return null;
  },
});
