import { getAuthUserId } from "@convex-dev/auth/server";
import { components } from "./_generated/api";
import { Autumn } from "@useautumn/convex";

export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
  identify: async (ctx: any) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const identity = await ctx.auth.getUserIdentity();

    return {
      customerId: userId,
      customerData: {
        name: (identity?.name as string | undefined) ?? "",
        email: (identity?.email as string | undefined) ?? "",
      },
    };
  },
});

export const {
  track,
  cancel,
  query,
  attach,
  check,
  checkout,
  usage,
  setupPayment,
  createCustomer,
  listProducts,
  billingPortal,
  createReferralCode,
  redeemReferralCode,
  createEntity,
  getEntity,
} = autumn.api();
