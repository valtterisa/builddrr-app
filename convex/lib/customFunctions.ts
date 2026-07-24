import { customMutation } from "convex-helpers/server/customFunctions";
import { mutation } from "../_generated/server";
import { requireAuthUserId } from "./auth";

export const authedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const userId = await requireAuthUserId(ctx);
    return { ctx: { ...ctx, userId }, args };
  },
});
