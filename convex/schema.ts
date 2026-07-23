import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const projectStatus = v.union(
  v.literal("draft"),
  v.literal("provisioning"),
  v.literal("generating"),
  v.literal("ready"),
  v.literal("error")
);

export const messageRole = v.union(
  v.literal("user"),
  v.literal("assistant"),
  v.literal("system")
);

export const messageStatus = v.union(
  v.literal("streaming"),
  v.literal("complete"),
  v.literal("error")
);

export const agentStep = v.object({
  kind: v.string(),
  label: v.string(),
  detail: v.optional(v.string()),
});

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    customInstructions: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    initialPrompt: v.string(),
    modelId: v.optional(v.string()),
    status: projectStatus,
    boxId: v.optional(v.string()),
    previewUrl: v.optional(v.string()),
    plan: v.optional(v.any()),
    error: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: messageRole,
    content: v.string(),
    reasoning: v.optional(v.string()),
    steps: v.optional(v.array(agentStep)),
    status: messageStatus,
  }).index("by_project", ["projectId"]),
});
