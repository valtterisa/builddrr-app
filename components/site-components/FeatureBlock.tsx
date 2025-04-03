import React from "react";
import { FieldLabel } from "@measured/puck";

// FeatureBlock component: renders a grid of features
export function FeatureBlock({ features = [] }) {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-white shadow-lg rounded-lg p-6 transition transform hover:-translate-y-1 hover:shadow-2xl"
            >
              <img
                src={feature.iconUrl}
                alt="Feature icon"
                className="w-16 h-16 mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Puck configuration for FeatureBlock using an array field
export const featureBlockConfig = {
  fields: {
    features: {
      type: "array",
      arrayFields: {
        iconUrl: {
          type: "custom",
          label: "Icon URL",
          render: ({ name, onChange, value }) => (
            <FieldLabel label="Icon URL">
              <input
                defaultValue={value}
                name={name}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://example.com/icon.png"
                className="border border-gray-300 p-2 w-full rounded"
              />
            </FieldLabel>
          ),
        },
        title: { type: "text", label: "Feature Title" },
        description: { type: "textarea", label: "Feature Description" },
      },
    },
  },
  defaultProps: {
    features: [
      {
        iconUrl: "https://example.com/icon1.png",
        title: "Amazing Feature 1",
        description:
          "This feature allows you to do amazing things effortlessly.",
      },
      {
        iconUrl: "https://example.com/icon2.png",
        title: "Amazing Feature 2",
        description:
          "Another cool feature that enhances your overall experience.",
      },
      {
        iconUrl: "https://example.com/icon3.png",
        title: "Amazing Feature 3",
        description:
          "Experience the power of this feature for ultimate efficiency.",
      },
    ],
  },
  render: ({ features }) => <FeatureBlock features={features} />,
};
