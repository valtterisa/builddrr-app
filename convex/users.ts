import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { authedMutation } from "./lib/customFunctions";

const MAX_NAME_LENGTH = 80;
const MAX_INSTRUCTIONS_LENGTH = 4000;

const userMeValidator = v.object({
  id: v.string(),
  name: v.string(),
  email: v.string(),
  customInstructions: v.string(),
});

export const me = query({
  args: {},
  returns: v.union(userMeValidator, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      id: userId as string,
      name: user.name ?? user.email ?? "",
      email: user.email ?? "",
      customInstructions: user.customInstructions ?? "",
    };
  },
});

export const updateProfile = authedMutation({
  args: {
    name: v.optional(v.string()),
    customInstructions: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(ctx.userId);
    if (!user) throw new Error("User not found");

    const patch: {
      name?: string;
      customInstructions?: string;
    } = {};

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length === 0) throw new Error("Name cannot be empty");
      if (name.length > MAX_NAME_LENGTH) {
        throw new Error(`Name must be ${MAX_NAME_LENGTH} characters or fewer`);
      }
      patch.name = name;
    }

    if (args.customInstructions !== undefined) {
      const instructions = args.customInstructions.trim();
      if (instructions.length > MAX_INSTRUCTIONS_LENGTH) {
        throw new Error(
          `Custom instructions must be ${MAX_INSTRUCTIONS_LENGTH} characters or fewer`
        );
      }
      patch.customInstructions = instructions;
    }

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(ctx.userId, patch);
    }

    return null;
  },
});
