import Stripe from "stripe";

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// Update the PLANS object with hardcoded price IDs
export const PLANS = {
  PRO: {
    name: "Pro",
    yearly: {
      price: 29,
      // Hardcoded price ID for yearly subscription
      priceId: "price_1OvXYZABCDEFGHIJKLMNOPQR", // Replace with your actual yearly price ID
      interval: "year",
    },
    monthly: {
      price: 5,
      // Hardcoded price ID for monthly subscription
      priceId: "price_1OvXYZABCDEFGHIJKLMNOPQS", // Replace with your actual monthly price ID
      interval: "month",
    },
    features: [
      "Custom domains",
      "Contact forms",
      "Testimonials section",
      "Basic analytics",
      "Email integrations",
    ],
  },
};

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({
    email,
    name,
    metadata: {
      source: "website-generator",
    },
  });
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}

export async function updateSubscription(
  subscriptionId: string,
  priceId: string
) {
  return stripe.subscriptions.retrieve(subscriptionId).then((subscription) => {
    return stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
    });
  });
}
