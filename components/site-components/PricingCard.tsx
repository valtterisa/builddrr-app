import React from "react";
import { FieldLabel } from "@measured/puck";

export function PricingCard({ planName, price, features }) {
  // Assume features is a newline-separated string.
  const featureList = features.split("\n").filter((f) => f.trim() !== "");
  return (
    <div className="border border-gray-200 rounded-lg shadow-lg p-6 text-center">
      <h3 className="text-2xl font-bold mb-4">{planName}</h3>
      <p className="text-4xl font-extrabold mb-4">${price}</p>
      <ul className="text-gray-600 mb-4">
        {featureList.map((feature, idx) => (
          <li key={idx} className="mb-2">
            {feature}
          </li>
        ))}
      </ul>
      <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Choose Plan
      </button>
    </div>
  );
}

export const pricingCardConfig = {
  fields: {
    planName: { type: "text" },
    price: { type: "text" },
    features: { type: "textarea" },
  },
  defaultProps: {
    planName: "Basic",
    price: "19",
    features: "Feature A\nFeature B\nFeature C",
  },
  render: ({ planName, price, features }) => (
    <PricingCard planName={planName} price={price} features={features} />
  ),
};
