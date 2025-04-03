import React from "react";
import { FieldLabel } from "@measured/puck";

export function Testimonial({ avatarUrl, name, quote }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
      <img
        src={avatarUrl}
        alt={name}
        className="w-16 h-16 rounded-full mx-auto mb-4"
      />
      <p className="italic text-gray-700 mb-2">"{quote}"</p>
      <p className="font-bold text-gray-900">{name}</p>
    </div>
  );
}

export const testimonialConfig = {
  fields: {
    avatarUrl: {
      type: "custom",
      render: ({ name, onChange, value }) => (
        <FieldLabel label="Avatar URL">
          <input
            defaultValue={value}
            name={name}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="border border-gray-300 p-2 w-full rounded"
          />
        </FieldLabel>
      ),
    },
    name: { type: "text" },
    quote: { type: "textarea" },
  },
  defaultProps: {
    avatarUrl: "https://example.com/default-avatar.jpg",
    name: "Jane Doe",
    quote: "This product changed my life!",
  },
  render: ({ avatarUrl, name, quote }) => (
    <Testimonial avatarUrl={avatarUrl} name={name} quote={quote} />
  ),
};
