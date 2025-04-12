"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import FloatingToolbar, {
  ActiveFormats,
  ToolbarPosition,
} from "./floating-toolbar";

interface IframeEditorProps {
  initialUrl?: string;
}

export default function WebsitePreview({
  initialUrl = "/preview", // @TODO: Make this dynamic
}: IframeEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({
    top: 0,
    left: 0,
  });
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    underline: false,
  });
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [elementType, setElementType] = useState<string>("");

  // Initialize the editor when iframe loads
  const initializeEditor = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
      setDebugInfo("Iframe or contentDocument not available");
      return;
    }

    setIsEditorReady(true);

    try {
      // First, remove any existing editor styles to avoid duplication
      const existingStyle =
        iframe.contentDocument.getElementById("editor-styles");
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add styles to highlight editable elements
      const style = iframe.contentDocument.createElement("style");
      style.id = "editor-styles";
      style.textContent = `
        [data-editable="true"] {
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          position: relative !important;
        }
        
        [data-editable="true"].hover-active {
          outline: 2px dashed #7c3aed !important;
          outline-offset: 2px !important;
          background-color: rgba(124, 58, 237, 0.05) !important;
        }
        
        [data-editable="true"].focus-active {
          outline: 2px solid #7c3aed !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1) !important;
        }
        
        [data-editable="true"]::before {
          content: attr(data-editable-tag) !important;
          font-weight: 400 !important;
          position: absolute !important;
          top: -20px !important;
          left: 0 !important;
          background: rgba(124, 58, 237, 0.9) !important;
          color: white !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-size: 10px !important;
          opacity: 0 !important;
          transition: opacity 0.2s ease !important;
          pointer-events: none !important;
          z-index: 1000 !important;
        }
        
        [data-editable="true"].hover-active::before {
          opacity: 1 !important;
        }
      `;
      iframe.contentDocument.head.appendChild(style);


      // Re-query elements after cloning
      const editableElements = iframe.contentDocument.querySelectorAll(
        '[data-editable="true"]'
      );
      editableElements.forEach((element) => {
        element.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleElementSelection(element as HTMLElement);
        });
      });

      // Add click handler to the document to close toolbar when clicking outside
      iframe.contentDocument.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        if (!target.hasAttribute("data-editable")) {
          setShowToolbar(false);
        }
      });
    } catch (error) {
      console.error("Error initializing editor:", error);
      setDebugInfo(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      toast({
        title: "Editor Initialization Error",
        description: "Could not initialize editor. Try reloading the page.",
        variant: "destructive",
      });
    }
  }, []);

  // Handle element selection
  const handleElementSelection = useCallback((element: HTMLElement) => {
    if (!element) return;

    setSelectedElement(element);
    setElementType(element.tagName.toLowerCase());

    // Get element position
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeRect = iframe.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // Position toolbar directly above the element
    const toolbarHeight = 40; // Approximate height

    setToolbarPosition({
      top: elementRect.top + iframeRect.top - toolbarHeight - 10,
      left: elementRect.left + elementRect.width / 2 + iframeRect.left - 150, // Approximate width / 2
    });

    setShowToolbar(true);
    setDebugInfo(`Selected element: ${element.tagName.toLowerCase()}`);

    // Only check text formatting for non-image elements
    if (element.tagName !== "IMG") {
      checkActiveFormats(element);

      // Focus the element
      element.focus();

      // Create a selection range if there isn't one
      if (iframe.contentWindow?.getSelection()?.rangeCount === 0) {
        const range = iframe.contentDocument!.createRange();
        range.selectNodeContents(element);
        const selection = iframe.contentWindow?.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }, []);

  // Check which formats are currently active for the selected element
  const checkActiveFormats = useCallback((element: HTMLElement) => {
    if (!element || element.tagName === "IMG") return;

    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) return;

      setActiveFormats({
        bold: iframe.contentDocument.queryCommandState("bold"),
        italic: iframe.contentDocument.queryCommandState("italic"),
        underline: iframe.contentDocument.queryCommandState("underline"),
      });
    } catch (error) {
      console.error("Error checking active formats:", error);
    }
  }, []);

  // Format text
  const formatText = (command: string, value = "") => {
    if (
      !selectedElement ||
      !iframeRef.current?.contentDocument ||
      selectedElement.tagName === "IMG"
    )
      return;

    try {
      // Focus the element to ensure it's the active editing target
      selectedElement.focus();

      // Create a selection if there isn't one
      const iframe = iframeRef.current;
      const selection = iframe.contentWindow?.getSelection();

      if (!selection || selection.rangeCount === 0) {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentDocument) {
          const range = iframe.contentDocument.createRange();
          range.selectNodeContents(selectedElement);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }

      // Execute command in the iframe's document
      if (iframe.contentDocument) {
        const result = iframe.contentDocument.execCommand(
          command,
          false,
          value
        );

        if (!result) {
          console.warn(`Command ${command} failed`);
          setDebugInfo(`Command ${command} failed`);
        } else {
          setDebugInfo(
            `Applied ${command} ${value ? `with value ${value}` : ""}`
          );
        }
      }

      // Update active formats
      checkActiveFormats(selectedElement);
    } catch (error) {
      console.error(`Error applying format ${command}:`, error);
      setDebugInfo(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      toast({
        title: "Formatting Error",
        description: `Could not apply ${command} formatting.`,
        variant: "destructive",
      });
    }
  };

  // Handle URL change
  useEffect(() => {
    setUrl(inputUrl);
    setShowToolbar(false);
    setDebugInfo("");
  }, [inputUrl]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setDebugInfo("Iframe loaded, initializing editor...");
    setTimeout(() => {
      initializeEditor(); // Initialize editor styles
      makeElementsEditable(); // Mark elements as editable
    }, 500); // Give the iframe a moment to fully render
  };

  // Apply background color
  const setBackgroundColor = (color: string) => {
    if (selectedElement) {
      try {
        selectedElement.style.backgroundColor = color;
        setDebugInfo(`Applied background color: ${color}`);
      } catch (error) {
        setDebugInfo(`Error applying background color: ${error}`);
      }
    }
  };

  // Set background image
  const setBackgroundImage = (url: string) => {
    if (selectedElement) {
      try {
        selectedElement.style.backgroundImage = `url(${url})`;
        selectedElement.style.backgroundSize = "cover";
        selectedElement.style.backgroundPosition = "center";
        setDebugInfo(`Applied background image: ${url}`);
      } catch (error) {
        setDebugInfo(`Error applying background image: ${error}`);
      }
    }
  };

  // Set link
  const setLink = (url: string) => {
    formatText("createLink", url);
  };

  // Set alt tag for image
  const setAltTag = (alt: string) => {
    if (selectedElement && selectedElement.tagName === "IMG") {
      try {
        (selectedElement as HTMLImageElement).alt = alt;
        setDebugInfo(`Set alt text: ${alt}`);
        toast({
          title: "Alt Text Updated",
          description: "The image alt text has been updated successfully.",
        });
      } catch (error) {
        setDebugInfo(`Error setting alt text: ${error}`);
      }
    }
  };

  // Close toolbar
  const closeToolbar = () => {
    setShowToolbar(false);
  };

  // Make elements in the canvas editable
  const makeElementsEditable = () => {
    const iframe = iframeRef.current; // Ensure iframeRef is defined
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;

    // Select all relevant elements inside the iframe
    const editableElements = doc.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, span, section, header, nav, footer, li, div, button, a, img"
    );

    let currentHoveredElement: HTMLElement | null = null; // Track the currently hovered element

    editableElements.forEach((el) => {
      // Skip elements that shouldn't be editable
      if (el.closest("script, style, noscript, svg")) return;

      // Make element editable
      el.setAttribute("data-editable", "true");
      // Here we can add more types of editable elements
      el.setAttribute("data-editable-type", "text");
      el.setAttribute("data-editable-tag", el.tagName.toLowerCase());

      // Add hover and focus event listeners
      el.addEventListener("mouseenter", () => {
        // Remove hover styles from the previously hovered element
        if (currentHoveredElement && currentHoveredElement !== el) {
          currentHoveredElement.classList.remove("hover-active");
        }

        // Add hover style to the current element
        el.classList.add("hover-active");
        currentHoveredElement = el as HTMLElement; // Update the currently hovered element
      });

      el.addEventListener("mouseleave", () => {
        // Remove hover style from the current element
        el.classList.remove("hover-active");
        if (currentHoveredElement === el) {
          currentHoveredElement = null; // Reset the currently hovered element
        }
      });

      el.addEventListener("focus", () => {
        // Remove focus styles from all other elements
        editableElements.forEach((otherEl) => {
          if (otherEl !== el) {
            otherEl.classList.remove("focus-active");
          }
        });
        el.classList.add("focus-active");
      });

      el.addEventListener("blur", () => {
        el.classList.remove("focus-active");
      });
    });

    console.log(`Made ${editableElements.length} elements editable`);
  };

  console.log("Debug: ", debugInfo);

  return (
    <div className="flex flex-col h-full w-full gap-4">
      {/* Floating Toolbar */}
      <FloatingToolbar
        show={showToolbar}
        position={toolbarPosition}
        activeFormats={activeFormats}
        elementType={elementType}
        selectedElement={selectedElement}
        onFormatText={formatText}
        onSetBackgroundColor={setBackgroundColor}
        onSetBackgroundImage={setBackgroundImage}
        onSetLink={setLink}
        onSetAltTag={setAltTag}
        onClose={closeToolbar}
      />

      {/* Iframe Container */}
      <div className="relative w-full h-full border rounded-lg overflow-hidden">
        {/* Sometimes "loads" infinitely for no reason @TODO: Fix */}
        {!isEditorReady && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <p className="mb-2">Loading editor...</p>
              <p className="text-sm text-muted-foreground">
                Click on any text element to edit it.
              </p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full"
          onLoad={handleIframeLoad}
          sandbox="allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}
