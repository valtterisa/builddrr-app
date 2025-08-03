"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthModal, User } from "@/components/auth-modal";

const plans = [
  {
    name: "Free",
    description: "Perfect for personal projects and small websites",
    price: {
      monthly: "Free",
      yearly: "Free",
    },
    features: [
      "1 website",
      "3 AI Questions",
      "Email support",
      "Chat to edit"
    ],
    polarProductId: "20800f87-e007-4cea-a836-93f87f00ea40", // Free Plan
  },
  {
    name: "Pro",
    description: "Ideal for growing businesses and professionals",
    price: {
      monthly: "$19",
      yearly: "$15",
    },
    features: [
      "3 websites",
      "10 AI Questions ",
      "Priority support",
      "Design mode",
    ],
    popular: true,
    polarProductId: "bcde8f52-3a0a-444e-b7fa-65f2b7b97801", // Pro Plan
  },
  {
    name: "Enterprise",
    description: "For large businesses and teams",
    price: {
      monthly: "Custom",
      yearly: "Custom",
    },
    features: [
      "Unlimited websites",
      "Unlimited AI Questions",
      "Priority support",
      "Design mode",
    ],
    polarProductId: "custom-plan-id", // Custom Plan
  },
];

export default function Pricing({ user }: { user: User | null }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  // Fetch current subscription from polar.sh
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/polar-subscription?externalId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentSubscription(data.subscription);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    fetchSubscription();
  }, [user]);

  const handleCheckout = async (plan: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // For Enterprise plan, open email instead of checkout
    if (plan.name === "Enterprise") {
      const subject = encodeURIComponent("Enterprise Plan Inquiry");
      const body = encodeURIComponent(`Hi,\n\nI'm interested in the Enterprise plan for Builddrr.\n\nPlease provide more information about pricing and features.\n\nBest regards,\n${user.user_metadata?.full_name || user.email}`);
      window.location.href = `mailto:sales@builddrr.com?subject=${subject}&body=${body}`;
      return;
    }

    setLoading(plan.name);
    try {
      const response = await fetch("/api/polar-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: plan.polarProductId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else if (response.status === 401) {
        // User is not authenticated, redirect to login
        window.location.href = "/login";
      } else {
        const errorText = await response.text();
        console.error("Failed to create checkout:", errorText);
        // Show user-friendly error message
        alert("Unable to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Unable to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleAuthSuccess = (user: User) => {
    setShowAuthModal(false);
  };

  const isCurrentPlan = (plan: any) => {
    if (!currentSubscription) {
      return false;
    }

    const isCurrent = currentSubscription.product?.id === plan.polarProductId;
    return isCurrent;
  };

  const getCurrentPlanDisplay = (plan: any) => {
    if (isCurrentPlan(plan)) {
      return (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm font-medium px-4 py-1 rounded-full">
          Current Plan
        </div>
      );
    }
    return null;
  };

  const getButtonText = (plan: any) => {
    if (plan.name === "Enterprise") {
      return "Contact Sales";
    }
    if (isCurrentPlan(plan)) {
      return "Current Plan";
    }
    return loading === plan.name ? "Redirecting..." : "Get Started";
  };

  const getButtonVariant = (plan: any) => {
    if (isCurrentPlan(plan)) {
      return "bg-green-50 text-green-600 hover:bg-green-100 border-green-200";
    }
    if (plan.popular) {
      return "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700";
    }
    return "bg-purple-50 text-purple-600 hover:bg-purple-100";
  };

  return (
    <section className="py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your needs.
          </p>
          <div className="inline-flex items-center bg-white rounded-full shadow-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`w-1/2 h-16 px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === "monthly"
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:text-purple-600"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={` w-1/2 h-16 px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === "yearly"
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:text-purple-600"
                }`}
            >
              Yearly
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 ${plan.popular ? "border-purple-200" : ""
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              {getCurrentPlanDisplay(plan)}
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold">
                    {plan.price[billingCycle]}
                  </span>
                  {plan.price[billingCycle] !== "Free" && plan.name !== "Enterprise" && <span className="text-gray-500">/{billingCycle}</span>}
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => handleCheckout(plan)}
                disabled={loading === plan.name}
                className={`mt-8 w-full ${getButtonVariant(plan)}`}
              >
                {getButtonText(plan)}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </section>
  );
}
