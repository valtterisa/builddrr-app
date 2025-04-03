import React from "react";
import { FieldLabel } from "@measured/puck";

export function Footer({ footerText }) {
  return (
    <footer className="bg-gray-800 text-white py-4 text-center">
      <p className="text-sm">{footerText}</p>
    </footer>
  );
}

export const footerConfig = {
  fields: {
    footerText: { type: "text" },
  },
  defaultProps: {
    footerText: "© 2025 My Company. All rights reserved.",
  },
  render: ({ footerText }) => <Footer footerText={footerText} />,
};
