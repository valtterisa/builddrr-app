import React, { useState } from "react";
import { FieldLabel } from "@measured/puck";

// Beautiful responsive Header component
export function Header({ logoUrl, title, navItems }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="h-10 w-10 mr-3" />
          )}
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          {navItems &&
            navItems.map((item, index) => (
              <a
                key={index}
                href={item.url}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
        </nav>
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <nav className="md:hidden bg-white shadow-md">
          <ul className="px-4 py-2">
            {navItems &&
              navItems.map((item, index) => (
                <li key={index} className="border-b border-gray-200">
                  <a
                    href={item.url}
                    className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

// Puck configuration for the Header component
export const headerConfig = {
  fields: {
    logoUrl: {
      type: "custom",
      render: ({ name, onChange, value }) => (
        <FieldLabel label="Logo URL">
          <input
            defaultValue={value}
            name={name}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="border border-gray-300 p-2 w-full rounded"
          />
        </FieldLabel>
      ),
    },
    title: { type: "text" },
    // Use a textarea to edit nav items in JSON format
    navItems: {
      type: "textarea",
      label: "Navigation Items (JSON)",
    },
  },
  defaultProps: {
    logoUrl: "https://example.com/logo.png",
    title: "My Beautiful Site",
    navItems: JSON.stringify(
      [
        { label: "Home", url: "/" },
        { label: "About", url: "/about" },
        { label: "Contact", url: "/contact" },
      ],
      null,
      2
    ),
  },
  render: ({ logoUrl, title, navItems }) => {
    let navItemsParsed = [];
    try {
      navItemsParsed = JSON.parse(navItems);
    } catch (error) {
      console.error("Invalid JSON for navItems", error);
    }
    return <Header logoUrl={logoUrl} title={title} navItems={navItemsParsed} />;
  },
};
