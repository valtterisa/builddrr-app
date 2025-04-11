import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import EditPanel from "./edit-panel";

interface WebsitePreviewProps {
  onContentChange: (content: string) => void;
  initialContent?: string;
}

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
  advanced?: string;
}

// Add type definition for the color groups
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

// Mock API endpoints
const mockApi = {
  updateContent: async (content: string) => {
    console.log("Mock API: updateContent called with body:", content);
    // Uncomment this when ready to use real API
    // const response = await fetch("/api/update-content", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ content }),
    // });
    // return response.json();
    return { success: true };
  },
  saveChanges: async (changes: any) => {
    console.log("Mock API: saveChanges called with body:", changes);
    // Uncomment this when ready to use real API
    // const response = await fetch("/api/save-changes", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(changes),
    // });
    // return response.json();
    return { success: true };
  },
  getContent: async () => {
    console.log("Mock API: getContent called");
    // Uncomment this when ready to use real API
    // const response = await fetch("/api/get-content");
    // return response.json();
    return { content: "" };
  },
};

export function WebsitePreview({
  onContentChange,
  initialContent,
}: WebsitePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [editOptions, setEditOptions] = useState<EditOptions>({});
  const [showModal, setShowModal] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedColorGroup, setSelectedColorGroup] =
    useState<ColorName>("gray");
  const [customColor, setCustomColor] = useState<string>("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState<"basic" | "custom">(
    "basic"
  );

  const handleElementClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.hasAttribute("contenteditable")) {
      setSelectedElement(target);

      // Extract margin and padding values from Tailwind classes
      const getValueFromClass = (prefix: string) => {
        const classList = Array.from(target.classList);
        const matchingClass = classList.find((cls) => cls.startsWith(prefix));
        if (!matchingClass) return "0";
        // Extract the numeric value after the prefix (e.g., "px-4" -> "4")
        const value = matchingClass.replace(prefix, "");
        return value;
      };

      setEditOptions({
        textColor: target.style.color || "",
        backgroundColor: target.style.backgroundColor || "",
        fontSize: target.style.fontSize || "",
        fontFamily: target.style.fontFamily || "",
        fontWeight: target.style.fontWeight || "",
        textAlign: target.style.textAlign || "",
        padding: target.style.padding || "",
        margin: target.style.margin || "",
        borderRadius: target.style.borderRadius || "",
        borderColor: target.style.borderColor || "",
        hoverColor: target.getAttribute("data-hover-color") || "",
        url: target.getAttribute("href") || "",
        src: target.getAttribute("src") || "",
        alt: target.getAttribute("alt") || "",
        customClasses: target.className || "",
        isBold: target.style.fontWeight === "bold",
        isItalic: target.style.fontStyle === "italic",
        isUnderlined: target.style.textDecoration === "underline",
        marginX: getValueFromClass("mx-"),
        marginY: getValueFromClass("my-"),
        paddingX: getValueFromClass("px-"),
        paddingY: getValueFromClass("py-"),
        content: target.textContent || "",
      });
      setShowModal(true);
    }
  };

  const handleOptionChange = (
    option: keyof EditOptions,
    value: string | boolean
  ) => {
    if (selectedElement) {
      setEditOptions((prev) => ({ ...prev, [option]: value }));

      // Apply changes immediately
      switch (option) {
        case "textColor":
          selectedElement.style.color = value as string;
          break;
        case "backgroundColor":
          selectedElement.style.backgroundColor = value as string;
          break;
        case "fontSize":
          selectedElement.style.fontSize = value as string;
          break;
        case "fontWeight":
          selectedElement.style.fontWeight = value as string;
          break;
        case "textAlign":
          selectedElement.style.textAlign = value as string;
          break;
        case "content":
          selectedElement.textContent = value as string;
          break;
        case "customClasses":
          selectedElement.className = value as string;
          break;
        case "marginX":
          const marginX = parseInt(value as string);
          if (!isNaN(marginX)) {
            // Remove existing margin classes
            selectedElement.classList.remove(
              "mx-0",
              "mx-1",
              "mx-2",
              "mx-3",
              "mx-4",
              "mx-5",
              "mx-6",
              "mx-7",
              "mx-8",
              "mx-9",
              "mx-10",
              "ml-0",
              "ml-1",
              "ml-2",
              "ml-3",
              "ml-4",
              "ml-5",
              "ml-6",
              "ml-7",
              "ml-8",
              "ml-9",
              "ml-10",
              "mr-0",
              "mr-1",
              "mr-2",
              "mr-3",
              "mr-4",
              "mr-5",
              "mr-6",
              "mr-7",
              "mr-8",
              "mr-9",
              "mr-10"
            );
            // Add the new margin class
            selectedElement.classList.add(`mx-${marginX}`);
          }
          break;
        case "marginY":
          const marginY = parseInt(value as string);
          if (!isNaN(marginY)) {
            // Remove existing margin classes
            selectedElement.classList.remove(
              "my-0",
              "my-1",
              "my-2",
              "my-3",
              "my-4",
              "my-5",
              "my-6",
              "my-7",
              "my-8",
              "my-9",
              "my-10",
              "mt-0",
              "mt-1",
              "mt-2",
              "mt-3",
              "mt-4",
              "mt-5",
              "mt-6",
              "mt-7",
              "mt-8",
              "mt-9",
              "mt-10",
              "mb-0",
              "mb-1",
              "mb-2",
              "mb-3",
              "mb-4",
              "mb-5",
              "mb-6",
              "mb-7",
              "mb-8",
              "mb-9",
              "mb-10"
            );
            // Add the new margin class
            selectedElement.classList.add(`my-${marginY}`);
          }
          break;
        case "paddingX":
          const paddingX = parseInt(value as string);
          if (!isNaN(paddingX)) {
            // Remove existing padding classes
            selectedElement.classList.remove(
              "px-0",
              "px-1",
              "px-2",
              "px-3",
              "px-4",
              "px-5",
              "px-6",
              "px-7",
              "px-8",
              "px-9",
              "px-10",
              "pl-0",
              "pl-1",
              "pl-2",
              "pl-3",
              "pl-4",
              "pl-5",
              "pl-6",
              "pl-7",
              "pl-8",
              "pl-9",
              "pl-10",
              "pr-0",
              "pr-1",
              "pr-2",
              "pr-3",
              "pr-4",
              "pr-5",
              "pr-6",
              "pr-7",
              "pr-8",
              "pr-9",
              "pr-10"
            );
            // Add the new padding class
            selectedElement.classList.add(`px-${paddingX}`);
          }
          break;
        case "paddingY":
          const paddingY = parseInt(value as string);
          if (!isNaN(paddingY)) {
            // Remove existing padding classes
            selectedElement.classList.remove(
              "py-0",
              "py-1",
              "py-2",
              "py-3",
              "py-4",
              "py-5",
              "py-6",
              "py-7",
              "py-8",
              "py-9",
              "py-10",
              "pt-0",
              "pt-1",
              "pt-2",
              "pt-3",
              "pt-4",
              "pt-5",
              "pt-6",
              "pt-7",
              "pt-8",
              "pt-9",
              "pt-10",
              "pb-0",
              "pb-1",
              "pb-2",
              "pb-3",
              "pb-4",
              "pb-5",
              "pb-6",
              "pb-7",
              "pb-8",
              "pb-9",
              "pb-10"
            );
            // Add the new padding class
            selectedElement.classList.add(`py-${paddingY}`);
          }
          break;
      }
      setUnsavedChanges(true);
    }
  };

  const applyChanges = () => {
    if (selectedElement) {
      // Apply basic styles
      selectedElement.style.color = editOptions.textColor || "";
      selectedElement.style.backgroundColor = editOptions.backgroundColor || "";
      selectedElement.style.fontSize = editOptions.fontSize || "";
      selectedElement.style.fontFamily = editOptions.fontFamily || "";
      selectedElement.style.fontWeight = editOptions.isBold ? "bold" : "";
      selectedElement.style.fontStyle = editOptions.isItalic ? "italic" : "";
      selectedElement.style.textDecoration = editOptions.isUnderlined
        ? "underline"
        : "";
      selectedElement.style.textAlign = editOptions.textAlign || "";
      selectedElement.style.padding = editOptions.padding || "";
      selectedElement.style.margin = editOptions.margin || "";
      selectedElement.style.borderRadius = editOptions.borderRadius || "";
      selectedElement.style.borderColor = editOptions.borderColor || "";

      // Apply special attributes
      if (selectedElement.tagName === "A") {
        selectedElement.setAttribute("href", editOptions.url || "#");
      }
      if (selectedElement.tagName === "IMG") {
        selectedElement.setAttribute("src", editOptions.src || "");
        selectedElement.setAttribute("alt", editOptions.alt || "");
      }

      // Apply hover color
      selectedElement.setAttribute(
        "data-hover-color",
        editOptions.hoverColor || ""
      );

      // Apply custom Tailwind classes
      if (editOptions.customClasses) {
        selectedElement.className = editOptions.customClasses;
      }

      setUnsavedChanges(false);
    }
  };

  const saveChanges = async () => {
    if (selectedElement) {
      const changes = {
        elementId: selectedElement.id,
        changes: editOptions,
        timestamp: new Date().toISOString(),
      };

      console.log("Saving changes:", changes);

      try {
        // Mock API call
        await mockApi.saveChanges(changes);
        console.log("Changes saved successfully");
        setUnsavedChanges(false);
        setShowModal(false);
      } catch (error) {
        console.error("Error saving changes:", error);
      }
    }
  };

  // Add this function to get Tailwind classes from inline styles
  const getTailwindClasses = (element: HTMLElement) => {
    const styles = window.getComputedStyle(element);
    const classes = [];

    // Font size
    const fontSize = styles.fontSize;
    if (fontSize) {
      const size = parseInt(fontSize);
      if (size === 12) classes.push("text-xs");
      else if (size === 14) classes.push("text-sm");
      else if (size === 16) classes.push("text-base");
      else if (size === 18) classes.push("text-lg");
      else if (size === 20) classes.push("text-xl");
      else if (size === 24) classes.push("text-2xl");
      else if (size === 30) classes.push("text-3xl");
      else if (size === 36) classes.push("text-4xl");
      else if (size === 48) classes.push("text-5xl");
      else if (size === 60) classes.push("text-6xl");
    }

    // Font weight
    const fontWeight = styles.fontWeight;
    if (fontWeight === "400") classes.push("font-normal");
    else if (fontWeight === "500") classes.push("font-medium");
    else if (fontWeight === "600") classes.push("font-semibold");
    else if (fontWeight === "700") classes.push("font-bold");

    // Text alignment
    const textAlign = styles.textAlign;
    if (textAlign === "left") classes.push("text-left");
    else if (textAlign === "center") classes.push("text-center");
    else if (textAlign === "right") classes.push("text-right");
    else if (textAlign === "justify") classes.push("text-justify");

    // Margins and padding
    const margin = parseInt(styles.margin);
    if (margin) classes.push(`m-${margin / 4}`);

    const padding = parseInt(styles.padding);
    if (padding) classes.push(`p-${padding / 4}`);

    return classes.join(" ");
  };

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument;

      if (doc) {
        doc.open();
        doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            [contenteditable] {
              position: relative;
              min-height: 1em;
              min-width: 1em;
            }
              [contenteditable]:hover {
                outline: 2px dashed #3b82f6;
                outline-offset: 2px;
              }
              [contenteditable]:focus {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
          </style>
        </head>
        <body class="bg-white">
          <div class="min-h-screen">
            <header class="bg-white shadow-sm">
              <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div class="text-2xl font-bold text-blue-600" contenteditable>Logo</div>
                <div class="hidden md:flex space-x-8">
                      <a href="#" class="text-gray-600 hover:text-blue-600" contenteditable>Home</a>
                      <a href="#" class="text-gray-600 hover:text-blue-600" contenteditable>About</a>
                      <a href="#" class="text-gray-600 hover:text-blue-600" contenteditable>Services</a>
                      <a href="#" class="text-gray-600 hover:text-blue-600" contenteditable>Contact</a>
                </div>
              </nav>
            </header>

            <main>
                  <section class="bg-gradient-to-r from-blue-500 to-blue-700  py-20">
                <div class="container mx-auto px-4 text-center">
                      <h1 class="text-4xl md:text-6xl font-bold mb-6" contenteditable>Welcome to Our Website</h1>
                      <p class="text-xl mb-8 max-w-2xl mx-auto" contenteditable>We create beautiful and functional websites that help businesses grow online.</p>
                      <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors" contenteditable>Get Started</button>
                </div>
              </section>

              <section class="py-16 bg-gray-50">
                <div class="container mx-auto px-4">
                      <h2 class="text-3xl font-bold text-center mb-12" contenteditable>Our Services</h2>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                          <h3 class="text-xl font-semibold mb-2" contenteditable>Web Design</h3>
                          <p class="text-gray-600" contenteditable>Create stunning websites that convert visitors into customers.</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                          <h3 class="text-xl font-semibold mb-2" contenteditable>Digital Marketing</h3>
                          <p class="text-gray-600" contenteditable>Reach your target audience and grow your business online.</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                          <h3 class="text-xl font-semibold mb-2" contenteditable>SEO Optimization</h3>
                          <p class="text-gray-600" contenteditable>Improve your search rankings and get more organic traffic.</p>
                    </div>
                  </div>
                </div>
              </section>
            </main>

                <footer class="bg-gray-900  py-12">
              <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                        <h3 class="text-xl font-bold mb-4" contenteditable>About Us</h3>
                        <p class="text-gray-400" contenteditable>We are a team of passionate developers and designers creating beautiful websites.</p>
                  </div>
                  <div>
                        <h3 class="text-xl font-bold mb-4" contenteditable>Contact</h3>
                    <ul class="space-y-2 text-gray-400">
                          <li contenteditable>123 Business Street</li>
                          <li contenteditable>City, State 12345</li>
                          <li contenteditable>info@example.com</li>
                          <li contenteditable>(123) 456-7890</li>
                    </ul>
                  </div>
                </div>
                <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
                      <p contenteditable>&copy; 2024 Your Company. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </body>
      </html>
    `);
        doc.close();

        // Add click event listener
        doc.addEventListener("click", handleElementClick);

        // Initial load - mock API call
        mockApi.getContent().then(({ content }) => {
          if (content) {
            doc.body.innerHTML = content;
          }
        });
      }
    }
  }, []);

  return (
    <div className="w-full h-full flex">
      <div className="flex-1">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          src="about:blank"
        />
      </div>
      {/* Edit Panel */}
      <EditPanel
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        onSaveChanges={applyChanges}
      />
    </div>
  );
}
