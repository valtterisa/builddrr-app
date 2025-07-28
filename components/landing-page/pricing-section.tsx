"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Basic",
    description: "Perfect for personal projects and small websites",
    price: {
      monthly: "$9",
      yearly: "$7",
    },
    features: [
      "1 website",
      "5 pages",
      "Basic templates",
      "Email support",
      "Mobile responsive",
    ],
  },
  {
    name: "Pro",
    description: "Ideal for growing businesses and professionals",
    price: {
      monthly: "$29",
      yearly: "$23",
    },
    features: [
      "5 websites",
      "Unlimited pages",
      "Premium templates",
      "Priority support",
      "Custom domain",
      "SEO tools",
      "Analytics",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    price: {
      monthly: "$99",
      yearly: "$79",
    },
    features: [
      "Unlimited websites",
      "Unlimited pages",
      "Custom templates",
      "24/7 support",
      "Custom domain",
      "Advanced SEO",
      "API access",
      "Team collaboration",
      "White-label",
    ],
  },
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

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
            Choose the perfect plan for your needs. All plans include a 7-day
            free trial.
          </p>
          <div className="inline-flex items-center bg-white rounded-full shadow-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`w-1/2 h-16 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={` w-1/2 h-16 px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Yearly <span className="text-purple-200 ml-1">(Save 20%)</span>
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
              className={`relative flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 ${
                plan.popular ? "border-purple-200" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold">
                    {plan.price[billingCycle]}
                  </span>
                  <span className="text-gray-500">/{billingCycle}</span>
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
                className={`mt-8 w-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                }`}
              >
                Start for Free
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
