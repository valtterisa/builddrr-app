import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";

interface EditOptions {
  textColor?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  borderColor?: string;
  hoverColor?: string;
  url?: string;
  src?: string;
  alt?: string;
  customClasses?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderlined?: boolean;
  marginX?: string;
  marginY?: string;
  paddingX?: string;
  paddingY?: string;
  content?: string;
}

type ColorName =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";

const tailwindColors: Record<ColorName, string[]> = {
  slate: [
    "#f8fafc",
    "#f1f5f9",
    "#e2e8f0",
    "#cbd5e1",
    "#94a3b8",
    "#64748b",
    "#475569",
    "#334155",
    "#1e293b",
    "#0f172a",
  ],
  gray: [
    "#f9fafb",
    "#f3f4f6",
    "#e5e7eb",
    "#d1d5db",
    "#9ca3af",
    "#6b7280",
    "#4b5563",
    "#374151",
    "#1f2937",
    "#111827",
  ],
  zinc: [
    "#fafafa",
    "#f4f4f5",
    "#e4e4e7",
    "#d4d4d8",
    "#a1a1aa",
    "#71717a",
    "#52525b",
    "#3f3f46",
    "#27272a",
    "#18181b",
  ],
  neutral: [
    "#fafafa",
    "#f5f5f5",
    "#e5e5e5",
    "#d4d4d4",
    "#a3a3a3",
    "#737373",
    "#525252",
    "#404040",
    "#262626",
    "#171717",
  ],
  stone: [
    "#fafaf9",
    "#f5f5f4",
    "#e7e5e4",
    "#d6d3d1",
    "#a8a29e",
    "#78716c",
    "#57534e",
    "#44403c",
    "#292524",
    "#1c1917",
  ],
  red: [
    "#fef2f2",
    "#fee2e2",
    "#fecaca",
    "#fca5a5",
    "#f87171",
    "#ef4444",
    "#dc2626",
    "#b91c1c",
    "#991b1b",
    "#7f1d1d",
  ],
  orange: [
    "#fff7ed",
    "#ffedd5",
    "#fed7aa",
    "#fdba74",
    "#fb923c",
    "#f97316",
    "#ea580c",
    "#c2410c",
    "#9a3412",
    "#7c2d12",
  ],
  amber: [
    "#fffbeb",
    "#fef3c7",
    "#fde68a",
    "#fcd34d",
    "#fbbf24",
    "#f59e0b",
    "#d97706",
    "#b45309",
    "#92400e",
    "#78350f",
  ],
  yellow: [
    "#fefce8",
    "#fef9c3",
    "#fef08a",
    "#fde047",
    "#facc15",
    "#eab308",
    "#ca8a04",
    "#a16207",
    "#854d0e",
    "#713f12",
  ],
  lime: [
    "#f7fee7",
    "#ecfccb",
    "#d9f99d",
    "#bef264",
    "#a3e635",
    "#84cc16",
    "#65a30d",
    "#4d7c0f",
    "#3f6212",
    "#365314",
  ],
  green: [
    "#f0fdf4",
    "#dcfce7",
    "#bbf7d0",
    "#86efac",
    "#4ade80",
    "#22c55e",
    "#16a34a",
    "#15803d",
    "#166534",
    "#14532d",
  ],
  emerald: [
    "#ecfdf5",
    "#d1fae5",
    "#a7f3d0",
    "#6ee7b7",
    "#34d399",
    "#10b981",
    "#059669",
    "#047857",
    "#065f46",
    "#064e3b",
  ],
  teal: [
    "#f0fdfa",
    "#ccfbf1",
    "#99f6e4",
    "#5eead4",
    "#2dd4bf",
    "#14b8a6",
    "#0d9488",
    "#0f766e",
    "#115e59",
    "#134e4a",
  ],
  cyan: [
    "#ecfeff",
    "#cffafe",
    "#a5f3fc",
    "#67e8f9",
    "#22d3ee",
    "#06b6d4",
    "#0891b2",
    "#0e7490",
    "#155e75",
    "#164e63",
  ],
  sky: [
    "#f0f9ff",
    "#e0f2fe",
    "#bae6fd",
    "#7dd3fc",
    "#38bdf8",
    "#0ea5e9",
    "#0284c7",
    "#0369a1",
    "#075985",
    "#0c4a6e",
  ],
  blue: [
    "#eff6ff",
    "#dbeafe",
    "#bfdbfe",
    "#93c5fd",
    "#60a5fa",
    "#3b82f6",
    "#2563eb",
    "#1d4ed8",
    "#1e40af",
    "#1e3a8a",
  ],
  indigo: [
    "#eef2ff",
    "#e0e7ff",
    "#c7d2fe",
    "#a5b4fc",
    "#818cf8",
    "#6366f1",
    "#4f46e5",
    "#4338ca",
    "#3730a3",
    "#312e81",
  ],
  violet: [
    "#f5f3ff",
    "#ede9fe",
    "#ddd6fe",
    "#c4b5fd",
    "#a78bfa",
    "#8b5cf6",
    "#7c3aed",
    "#6d28d9",
    "#5b21b6",
    "#4c1d95",
  ],
  purple: [
    "#faf5ff",
    "#f3e8ff",
    "#e9d5ff",
    "#d8b4fe",
    "#c084fc",
    "#a855f7",
    "#9333ea",
    "#7e22ce",
    "#6b21a8",
    "#581c87",
  ],
  fuchsia: [
    "#fdf4ff",
    "#fae8ff",
    "#f5d0fe",
    "#f0abfc",
    "#e879f9",
    "#d946ef",
    "#c026d3",
    "#a21caf",
    "#86198f",
    "#701a75",
  ],
  pink: [
    "#fdf2f8",
    "#fce7f3",
    "#fbcfe8",
    "#f9a8d4",
    "#f472b6",
    "#ec4899",
    "#db2777",
    "#be185d",
    "#9d174d",
    "#831843",
  ],
  rose: [
    "#fff1f2",
    "#ffe4e6",
    "#fecdd3",
    "#fda4af",
    "#fb7185",
    "#f43f5e",
    "#e11d48",
    "#be123c",
    "#9f1239",
    "#881337",
  ],
};

interface EditPanelProps {
  selectedElement: HTMLElement | null;
  onSaveChanges: () => void;
  setSelectedElement: (element: HTMLElement | null) => void;
}

function EditPanel({
  selectedElement,
  setSelectedElement,
  onSaveChanges,
}: EditPanelProps) {
  const [showModal, setShowModal] = useState(true);
  const [editOptions, setEditOptions] = useState<EditOptions>({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState<"basic" | "custom">(
    "basic"
  );
  const [selectedColorGroup, setSelectedColorGroup] =
    useState<ColorName>("gray");
  const [customColor, setCustomColor] = useState<string>("#000000");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  console.log(selectedElement);

  const handleOptionChange = (
    option: keyof EditOptions,
    value: string | boolean
  ) => {
    setEditOptions((prev) => ({ ...prev, [option]: value }));
    setUnsavedChanges(true);
  };

  const saveChanges = () => {
    if (selectedElement) {
      // Apply changes to the element
      if (editOptions.textColor)
        selectedElement.style.color = editOptions.textColor;
      if (editOptions.backgroundColor)
        selectedElement.style.backgroundColor = editOptions.backgroundColor;
      if (editOptions.fontSize)
        selectedElement.style.fontSize = editOptions.fontSize;
      if (editOptions.fontWeight)
        selectedElement.style.fontWeight = editOptions.fontWeight;
      if (editOptions.textAlign)
        selectedElement.style.textAlign = editOptions.textAlign;
      if (editOptions.content)
        selectedElement.textContent = editOptions.content;
      if (editOptions.customClasses)
        selectedElement.className = editOptions.customClasses;

      onSaveChanges();
      setUnsavedChanges(false);
    }
  };

  const handleDiscard = () => {
    setEditOptions({});
    setSelectedElement(null);
  };

  return (
    <>
      {showModal && selectedElement && (
        <div className="w-80">
          <div className="p-4 space-y-4">
            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm">Content</label>
              <input
                type="text"
                value={
                  editOptions.content || selectedElement?.textContent || ""
                }
                onChange={(e) => handleOptionChange("content", e.target.value)}
                className="w-full p-2 rounded border border-gray-300"
                placeholder="Enter content..."
              />
            </div>

            {/* Margin */}
            <div className="space-y-2">
              <label className="text-sm">Margin</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center  rounded px-2">
                  <span className="text-lg">↔</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editOptions.marginX?.replace(/[^0-9]/g, "") || "0"}
                    onChange={(e) =>
                      handleOptionChange("marginX", e.target.value)
                    }
                    className="w-full p-2 bg-transparent outline-none border-none"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1 flex items-center  rounded px-2">
                  <span className="text-lg">↕</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editOptions.marginY?.replace(/[^0-9]/g, "") || "0"}
                    onChange={(e) =>
                      handleOptionChange("marginY", e.target.value)
                    }
                    className="w-full p-2 bg-transparent outline-none border-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Padding */}
            <div className="space-y-2">
              <label className="text-sm">Padding</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center  rounded px-2">
                  <span className="text-lg">↔</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editOptions.paddingX?.replace(/[^0-9]/g, "") || "0"}
                    onChange={(e) =>
                      handleOptionChange("paddingX", e.target.value)
                    }
                    className="w-full p-2 bg-transparent outline-none border-none"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1 flex items-center  rounded px-2">
                  <span className="text-lg">↕</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editOptions.paddingY?.replace(/[^0-9]/g, "") || "0"}
                    onChange={(e) =>
                      handleOptionChange("paddingY", e.target.value)
                    }
                    className="w-full p-2 bg-transparent outline-none border-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-sm">Font size</label>
              <select
                value={editOptions.fontSize || ""}
                onChange={(e) => handleOptionChange("fontSize", e.target.value)}
                className="w-full p-2   rounded border-none"
              >
                <option value="12px">XS (12px)</option>
                <option value="14px">SM (14px)</option>
                <option value="16px">Base (16px)</option>
                <option value="18px">LG (18px)</option>
                <option value="20px">XL (20px)</option>
                <option value="24px">2XL (24px)</option>
                <option value="30px">3XL (30px)</option>
                <option value="36px">4XL (36px)</option>
                <option value="48px">5XL (48px)</option>
                <option value="60px">6XL (60px)</option>
              </select>
            </div>

            {/* Font Weight */}
            <div className="space-y-2">
              <label className="text-sm">Font weight</label>
              <select
                value={editOptions.fontWeight || ""}
                onChange={(e) =>
                  handleOptionChange("fontWeight", e.target.value)
                }
                className="w-full p-2   rounded border-none"
              >
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="700">Bold (700)</option>
              </select>
            </div>

            {/* Color */}
            <div className="space-y-2 relative">
              <label className="text-sm">Color</label>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center gap-2 w-full p-2 border border-gray-300 rounded"
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: editOptions.textColor || "#000000",
                    }}
                  />
                  <span className="flex-1 text-left">
                    {editOptions.textColor || "Select color"}
                  </span>
                  <svg
                    className={`w-4 h-4 transform ${
                      showColorPicker ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Color Picker Dropdown */}
              {showColorPicker && (
                <div className="absolute left-0 right-0 mt-1 z-40 border border-gray-300 rounded shadow-lg bg-white">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-300">
                    <button
                      onClick={() => setActiveColorTab("basic")}
                      className={`flex-1 px-4 py-2 text-sm ${
                        activeColorTab === "basic"
                          ? "bg-gray-200"
                          : "text-gray-400 hover:"
                      }`}
                    >
                      Basic Colors
                    </button>
                    <button
                      onClick={() => setActiveColorTab("custom")}
                      className={`flex-1 px-4 py-2 text-sm ${
                        activeColorTab === "custom"
                          ? ""
                          : "text-gray-400 hover:"
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {/* Basic Colors Tab */}
                  {activeColorTab === "basic" && (
                    <div className="p-2">
                      {/* Color Groups */}
                      <div className="flex gap-1 flex-wrap mb-2">
                        {Object.keys(tailwindColors).map((colorName) => (
                          <button
                            key={colorName}
                            onClick={() =>
                              setSelectedColorGroup(colorName as ColorName)
                            }
                            className={`px-2 py-1 text-xs rounded ${
                              selectedColorGroup === (colorName as ColorName)
                                ? "bg-blue-600"
                                : " hover:bg-gray-200"
                            }`}
                          >
                            {colorName}
                          </button>
                        ))}
                      </div>

                      {/* Color Shades */}
                      <div className="grid grid-cols-10 gap-1">
                        {selectedColorGroup &&
                          tailwindColors[selectedColorGroup].map(
                            (color: string, index: number) => (
                              <button
                                key={`${selectedColorGroup}-${index}`}
                                onClick={() => {
                                  handleOptionChange("textColor", color);
                                  setCustomColor(color);
                                  setShowColorPicker(false);
                                }}
                                className={`w-6 h-6 rounded border-2 ${
                                  editOptions.textColor === color
                                    ? "border-white"
                                    : "border-transparent"
                                }`}
                                style={{ backgroundColor: color }}
                                title={`${selectedColorGroup}-${index + 1}00`}
                              />
                            )
                          )}
                      </div>
                    </div>
                  )}

                  {/* Custom Color Tab */}
                  {activeColorTab === "custom" && (
                    <div className="p-4">
                      <div className="space-y-4">
                        {/* Color Preview and Picker */}
                        <HexColorPicker
                          color={customColor}
                          onChange={(color) => {
                            setCustomColor(color);
                            handleOptionChange("textColor", color);
                          }}
                        />

                        {/* Hex Input */}
                        <div className="flex gap-2">
                          <div
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: customColor }}
                          />
                          <input
                            type="text"
                            value={customColor}
                            onChange={(e) => {
                              const color = e.target.value;
                              if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                                setCustomColor(color);
                                handleOptionChange("textColor", color);
                              }
                            }}
                            placeholder="#000000"
                            className="flex-1 p-2  rounded text-sm font-mono"
                          />
                        </div>

                        {/* Apply Button */}
                        <button
                          onClick={() => {
                            handleOptionChange("textColor", customColor);
                            setShowColorPicker(false);
                          }}
                          className="w-full py-2 bg-blue-600  rounded hover:bg-blue-700"
                        >
                          Apply Color
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Alignment */}
            <div className="space-y-2">
              <label className="text-sm">Alignment</label>
              <div className="flex gap-1">
                {["left", "center", "right", "justify"].map((align) => (
                  <button
                    key={align}
                    onClick={() => handleOptionChange("textAlign", align)}
                    className={`flex-1 p-2  rounded ${
                      editOptions.textAlign === align ? "bg-gray-200" : ""
                    }`}
                  >
                    <svg
                      className="w-5 h-5 mx-auto"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d={
                          align === "left"
                            ? "M3 6h18v2H3V6zm0 5h12v2H3v-2zm0 5h18v2H3v-2z"
                            : align === "center"
                            ? "M3 6h18v2H3V6zm3 5h12v2H6v-2zm-3 5h18v2H3v-2z"
                            : align === "right"
                            ? "M3 6h18v2H3V6zm6 5h12v2H9v-2zm-6 5h18v2H3v-2z"
                            : "M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"
                        }
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Section */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm"
              >
                <svg
                  className={`w-4 h-4 transform ${
                    showAdvanced ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M19 9l-7 7-7-7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Advanced
              </button>
              {showAdvanced && selectedElement && (
                <div className="mt-2 p-3  rounded">
                  <input
                    type="text"
                    value={
                      editOptions.customClasses || selectedElement.className
                    }
                    onChange={(e) =>
                      handleOptionChange("customClasses", e.target.value)
                    }
                    className="w-full p-2 bg-[#1E1E1E]  rounded border-none font-mono text-sm"
                    placeholder="Enter Tailwind classes..."
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleDiscard}
                className="flex-1 px-4 py-2 text-sm rounded hover:bg-gray-200"
              >
                Discard
              </button>
              <button
                onClick={saveChanges}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!unsavedChanges}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditPanel;
