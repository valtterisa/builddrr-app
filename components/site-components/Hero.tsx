import React from "react";
import { FieldLabel } from "@measured/puck";

export function Hero({ title, subtitle, backgroundImage }) {
  return (
    <div
      className="bg-cover bg-center text-black text-center py-20 px-4"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-lg">{subtitle}</p>
    </div>
  );
}

export const heroConfig = {
  fields: {
    title: { type: "text" },
    subtitle: { type: "text" },
    backgroundImage: {
      type: "custom",
      render: ({ name, onChange, value }) => (
        <FieldLabel label="Background Image URL">
          <input
            defaultValue={value}
            name={name}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/hero.jpg"
            className="border border-gray-300 p-2 w-full rounded"
          />
        </FieldLabel>
      ),
    },
  },
  defaultProps: {
    title: "Welcome to Our Site",
    subtitle: "We create awesome experiences",
    backgroundImage: "https://example.com/default-hero.jpg",
  },
  render: ({ title, subtitle, backgroundImage }) => (
    <Hero title={title} subtitle={subtitle} backgroundImage={backgroundImage} />
  ),
};
