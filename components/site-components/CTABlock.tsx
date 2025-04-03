import React from "react";
import { FieldLabel } from "@measured/puck";

export function CTABlock({ ctaText, buttonText, buttonUrl }) {
  return (
    <div className="bg-gray-100 py-10 px-4 text-center">
      <p className="text-xl font-medium mb-4">{ctaText}</p>
      <a
        href={buttonUrl}
        className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        {buttonText}
      </a>
    </div>
  );
}

export const ctaBlockConfig = {
  fields: {
    ctaText: { type: "text" },
    buttonText: { type: "text" },
    buttonUrl: {
      type: "custom",
      render: ({ name, onChange, value }) => (
        <FieldLabel label="Button URL">
          <input
            defaultValue={value}
            name={name}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/signup"
            className="border border-gray-300 p-2 w-full rounded"
          />
        </FieldLabel>
      ),
    },
  },
  defaultProps: {
    ctaText: "Get started with our product now!",
    buttonText: "Sign Up",
    buttonUrl: "https://example.com/signup",
  },
  render: ({ ctaText, buttonText, buttonUrl }) => (
    <CTABlock ctaText={ctaText} buttonText={buttonText} buttonUrl={buttonUrl} />
  ),
};
