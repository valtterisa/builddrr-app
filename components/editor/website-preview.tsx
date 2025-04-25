"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import FloatingToolbar, {
  ActiveFormats,
  ToolbarPosition,
} from "./floating-toolbar";

interface EditorChange {
  targetId: string;
  type: "style" | "attribute" | "content";
  payload: {
    name: string;
    value: string;
  };
}

interface IframeEditorProps {
  initialUrl?: string;
  isEditMode: boolean;
}

export default function WebsitePreview({
  initialUrl = "http://localhost:3000/test", // @TODO: Make this dynamic
  isEditMode,
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
  const [activeTextColor, setActiveTextColor] = useState<string | null>(null); // State for active text color
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [elementType, setElementType] = useState<string>("");
  const [pendingChanges, setPendingChanges] = useState<EditorChange[]>([]);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);

  const closeToolbar = useCallback(() => {
    setShowToolbar(false);
  }, []);

  const getStorageKey = useCallback(() => `editorChanges-${url}`, [url]);

  const applyStoredChanges = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument || isApplyingChanges) return;

    setIsApplyingChanges(true);
    const storageKey = getStorageKey();
    const storedChangesJson = localStorage.getItem(storageKey);

    if (storedChangesJson) {
      try {
        const changes: EditorChange[] = JSON.parse(storedChangesJson);
        changes.forEach((change) => {
          const element = iframe.contentDocument?.querySelector(
            `[data-editor-id="${change.targetId}"]`
          ) as HTMLElement | null;
          if (element) {
            try {
              if (change.type === "style") {
                element.style.setProperty(
                  change.payload.name,
                  change.payload.value
                );
              } else if (change.type === "attribute") {
                element.setAttribute(change.payload.name, change.payload.value);
              } else if (change.type === "content") {
                element.innerHTML = change.payload.value;
              }
            } catch (applyError) {
              console.error(
                `Error applying change to ${change.targetId}:`,
                applyError,
                change
              );
            }
          } else {
            console.warn(
              `Element with ID ${change.targetId} not found for applying change.`
            );
          }
        });
      } catch (e) {
        console.error("Error parsing or applying stored changes:", e);
        localStorage.removeItem(storageKey);
      }
    }
    setIsApplyingChanges(false);
  }, [getStorageKey, isApplyingChanges]);

  const initializeEditor = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
      setDebugInfo("Iframe or contentDocument not available");
      return;
    }

    setIsEditorReady(true);

    try {
      const existingStyle =
        iframe.contentDocument.getElementById("editor-styles");
      if (existingStyle) {
        existingStyle.remove();
      }

      const style = iframe.contentDocument.createElement("style");
      style.id = "editor-styles";
      style.textContent = `
        .editor-active [data-editable="true"] {
          cursor: pointer !important;
        }
        
        .editor-active [data-editable="true"].hover-active {
          outline: 2px dashed #7c3aed !important;
          outline-offset: 2px !important;
        }
        
        .editor-active [data-editable="true"].focus-active {
          outline: 2px solid #7c3aed !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1) !important;
        }
        
        .editor-active [data-editable="true"].hover-active::before {
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
           opacity: 1 !important; 
           transition: opacity 0.2s ease !important;
           pointer-events: none !important;
           z-index: 1000 !important;
        }

        .editor-active [data-editable="true"]::before {
           opacity: 0 !important;
           pointer-events: none !important;
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
           transition: opacity 0.2s ease !important;
           z-index: 1000 !important;
        }
      `;
      iframe.contentDocument.head.appendChild(style);

      applyStoredChanges();
      makeElementsEditable();

      if (isEditMode) {
        iframe.contentDocument.body.classList.add("editor-active");
        addEditModeListeners();
        // Add selection change listener here as well for initial load
        iframe.contentDocument.addEventListener(
          "selectionchange",
          handleSelectionChange
        );
      } else {
        iframe.contentDocument.body.classList.remove("editor-active");
      }
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
  };

  const addEditModeListeners = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const editableElements = iframe.contentDocument.querySelectorAll(
      '[data-editable="true"]'
    );
    editableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      if (!(htmlElement as any).__clickListenerAttached) {
        htmlElement.addEventListener("click", handleElementClick);
        (htmlElement as any).__clickListenerAttached = true;
      }
      if (htmlElement.hasAttribute("data-editable-text")) {
        htmlElement.addEventListener("input", handleElementInput);
      }
      htmlElement.addEventListener("mouseenter", handleMouseEnter);
      htmlElement.addEventListener("mouseleave", handleMouseLeave);
    });

    iframe.contentDocument.addEventListener("click", handleDocumentClick);
    // Add listener for selection changes
    iframe.contentDocument.addEventListener(
      "selectionchange",
      handleSelectionChange
    );
  };

  const removeEditModeListeners = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const editableElements = iframe.contentDocument.querySelectorAll(
      '[data-editable="true"]'
    );
    editableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.removeEventListener("click", handleElementClick);
      (htmlElement as any).__clickListenerAttached = false;
      if (htmlElement.hasAttribute("data-editable-text")) {
        htmlElement.contentEditable = "false";
        htmlElement.removeEventListener("input", handleElementInput);
      }
      htmlElement.removeEventListener("mouseenter", handleMouseEnter);
      htmlElement.removeEventListener("mouseleave", handleMouseLeave);

      htmlElement.classList.remove("hover-active", "focus-active");
    });
    iframe.contentDocument.removeEventListener("click", handleDocumentClick);
    // Remove listener for selection changes
    iframe.contentDocument.removeEventListener(
      "selectionchange",
      handleSelectionChange
    );
  };

  const handleElementClick = (e: Event) => {
    if (!isEditMode) return;
    const element = e.currentTarget as HTMLElement;
    e.preventDefault();
    e.stopPropagation();
    handleElementSelection(element);
  };

  const handleDocumentClick = (e: Event) => {
    if (!isEditMode) return;
    const target = e.target as HTMLElement;
    if (
      !target.hasAttribute("data-editable") &&
      !target.closest('[data-toolbar="true"]')
    ) {
      if (
        selectedElement &&
        selectedElement.hasAttribute("data-editable-text")
      ) {
        selectedElement.contentEditable = "false";
      }
      setSelectedElement(null);
    }
  };

  const recordChange = useCallback(
    (
      targetId: string,
      type: EditorChange["type"],
      name: string,
      value: string
    ) => {
      if (isApplyingChanges) return;
      setPendingChanges((prev) => {
        const lastChange = prev[prev.length - 1];
        if (
          lastChange &&
          lastChange.targetId === targetId &&
          lastChange.payload.name === name &&
          lastChange.payload.value === value
        ) {
          return prev;
        }
        const newChange: EditorChange = {
          targetId,
          type,
          payload: { name, value },
        };
        return [...prev, newChange];
      });
    },
    [isApplyingChanges]
  );

  const handleElementInput = useCallback(
    (e: Event) => {
      if (!isEditMode || isApplyingChanges) return;
      const element = e.target as HTMLElement;
      const editorId = element.getAttribute("data-editor-id");
      if (editorId) {
        recordChange(editorId, "content", "innerHTML", element.innerHTML);
      }
    },
    [isEditMode, isApplyingChanges, recordChange]
  );

  const handleElementSelection = (element: HTMLElement) => {
    if (!isEditMode || !element) return;

    if (selectedElement && selectedElement !== element) {
      if (selectedElement.hasAttribute("data-editable-text")) {
        selectedElement.contentEditable = "false";
      }
    }

    setSelectedElement(element);
    const elementTypeLower = element.tagName.toLowerCase();
    setElementType(elementTypeLower);

    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    const iframeRect = iframe.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const toolbarHeight = 40;

    setToolbarPosition({
      top: elementRect.top + iframeRect.top - toolbarHeight - 10,
      left: elementRect.left + elementRect.width / 2 + iframeRect.left - 150,
    });

    setShowToolbar(true);
    setDebugInfo(`Selected element: ${elementTypeLower}`);

    if (element.tagName !== "IMG") {
      if (element.hasAttribute("data-editable-text")) {
        element.contentEditable = "true";
      } else {
        element.contentEditable = "false";
      }

      iframe.contentWindow.focus();
      element.focus();

      // Initial check when element is selected
      checkActiveFormats();

      const selection = iframe.contentWindow.getSelection();
      if (selection && selection.rangeCount === 0) {
        const range = iframe.contentDocument!.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      element.contentEditable = "false";
      // Reset formats if image is selected
      setActiveFormats({ bold: false, italic: false, underline: false });
      setActiveTextColor(null);
    }
  };

  // Converts RGB color format to HEX format
  const rgbToHex = useCallback((rgb: string | null): string | null => {
    if (!rgb) return null;
    // Check if the color is already in hex format
    if (rgb.startsWith("#")) return rgb;

    // Extract RGB values from the format "rgb(r, g, b)" or "rgba(r, g, b, a)"
    const rgbMatch = rgb.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
    );
    if (!rgbMatch) return rgb; // Return original if format doesn't match

    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);

    // Convert to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  }, []);

  // Renamed and updated checkActiveFormats
  const checkActiveFormats = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;

    try {
      const selection = win.getSelection();
      if (!selection || selection.rangeCount === 0) {
        // If no selection, maybe reset or use element's style? For now, reset.
        setActiveFormats({ bold: false, italic: false, underline: false });
        setActiveTextColor(null);
        return;
      }

      // Check basic formats using queryCommandState
      const isBold = doc.queryCommandState("bold");
      const isItalic = doc.queryCommandState("italic");
      const isUnderline = doc.queryCommandState("underline");

      setActiveFormats({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
      });

      // Check text color - try first with queryCommandValue for more accurate results
      let color: string | null = null;
      try {
        // Try to get color using queryCommandValue first
        const foreColor = doc.queryCommandValue("foreColor");
        if (foreColor && foreColor !== "false") {
          color = foreColor.toString();
        }
      } catch (e) {
        // Fallback to computed style if queryCommandValue fails
        console.log("Error getting text color with queryCommandValue:", e);
      }

      // If queryCommandValue didn't work, use getComputedStyle as fallback
      if (!color || color === "false") {
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        // If selection is in a text node, get its parent element
        if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentElement as HTMLElement;
        }
        // Ensure we have an element node to check style
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          color = win.getComputedStyle(node as Element).color;
        }
      }

      // Convert RGB format to HEX for consistency and better UI display
      const normalizedColor = rgbToHex(color);
      setActiveTextColor(normalizedColor);
    } catch (error) {
      console.error("Error checking active formats:", error);
      setDebugInfo(`Error checking formats: ${error}`);
      // Reset on error
      setActiveFormats({ bold: false, italic: false, underline: false });
      setActiveTextColor(null);
    }
  }, [rgbToHex]); // Added rgbToHex as dependency

  // Handler for the selectionchange event
  const handleSelectionChange = useCallback(() => {
    if (!isEditMode) return;
    // Check formats whenever the selection changes
    checkActiveFormats();
  }, [isEditMode, checkActiveFormats]);

  const formatText = (command: string, value = "") => {
    if (!isEditMode) return;
    const iframe = iframeRef.current;
    if (
      !selectedElement ||
      !iframe ||
      !iframe.contentDocument ||
      selectedElement.tagName === "IMG"
    )
      return;

    if (!selectedElement.hasAttribute("data-editable-text")) return;
    selectedElement.contentEditable = "true";

    try {
      iframe.contentWindow?.focus();
      selectedElement.focus();

      const selection = iframe.contentWindow?.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        if (iframe.contentDocument) {
          const range = iframe.contentDocument.createRange();
          range.selectNodeContents(selectedElement);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }

      if (iframe.contentDocument) {
        setDebugInfo(`Executing command: ${command}`);

        const result = iframe.contentDocument.execCommand(
          command,
          false,
          value
        );

        if (!result) {
          console.warn(`Command ${command} failed`);
          setDebugInfo(`Command ${command} failed`);
          toast({
            title: "Formatting Error",
            description: `Could not apply ${command} formatting. The browser denied the command.`,
            variant: "destructive",
          });
        } else {
          setDebugInfo(
            `Applied ${command} ${value ? `with value ${value}` : ""}`
          );
        }
      }

      // Re-check formats immediately after applying command
      checkActiveFormats();

      setTimeout(() => {
        selectedElement.dispatchEvent(
          new Event("input", { bubbles: true, cancelable: true })
        );
        // Check again after input event potentially changes things
        checkActiveFormats();
      }, 0);
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

  const setBackgroundColor = (color: string) => {
    if (!isEditMode || !selectedElement) return;
    const editorId = selectedElement.getAttribute("data-editor-id");
    if (editorId) {
      try {
        selectedElement.style.backgroundColor = color;
        setDebugInfo(`Applied background color: ${color}`);
        recordChange(editorId, "style", "backgroundColor", color);
      } catch (error) {
        setDebugInfo(`Error applying background color: ${error}`);
      }
    }
  };

  const setBackgroundImage = (urlValue: string) => {
    if (!isEditMode || !selectedElement) return;
    const editorId = selectedElement.getAttribute("data-editor-id");
    if (editorId) {
      try {
        const bgImageValue = `url(${urlValue})`;
        selectedElement.style.backgroundImage = bgImageValue;
        selectedElement.style.backgroundSize = "cover";
        selectedElement.style.backgroundPosition = "center";
        setDebugInfo(`Applied background image: ${urlValue}`);
        recordChange(editorId, "style", "backgroundImage", bgImageValue);
      } catch (error) {
        setDebugInfo(`Error applying background image: ${error}`);
      }
    }
  };

  const setLink = (urlValue: string) => {
    if (!isEditMode) return;
    formatText("createLink", urlValue);
  };

  const setAltTag = (alt: string) => {
    if (!isEditMode || !selectedElement || selectedElement.tagName !== "IMG")
      return;
    const editorId = selectedElement.getAttribute("data-editor-id");
    if (editorId) {
      try {
        (selectedElement as HTMLImageElement).alt = alt;
        setDebugInfo(`Set alt text: ${alt}`);
        recordChange(editorId, "attribute", "alt", alt);
        toast({
          title: "Alt Text Updated",
          description: "The image alt text has been updated successfully.",
        });
      } catch (error) {
        setDebugInfo(`Error setting alt text: ${error}`);
      }
    }
  };

  const saveChanges = useCallback(() => {
    if (pendingChanges.length === 0) {
      return;
    }

    const storageKey = getStorageKey();
    const storedChangesJson = localStorage.getItem(storageKey);
    let existingChanges: EditorChange[] = [];
    if (storedChangesJson) {
      try {
        existingChanges = JSON.parse(storedChangesJson);
      } catch (e) {
        console.error("Error parsing existing changes from localStorage:", e);
      }
    }

    const changesMap = new Map<string, EditorChange>();
    existingChanges.forEach((change) => {
      const key = `${change.targetId}-${change.payload.name}`;
      changesMap.set(key, change);
    });
    pendingChanges.forEach((change) => {
      const key = `${change.targetId}-${change.payload.name}`;
      changesMap.set(key, change);
    });

    const mergedChanges = Array.from(changesMap.values());

    try {
      localStorage.setItem(storageKey, JSON.stringify(mergedChanges));
      toast({
        title: "Changes Saved",
        description: "Your edits have been saved locally.",
      });
      setPendingChanges([]);
    } catch (e) {
      console.error("Error saving changes to localStorage:", e);
      toast({
        title: "Save Error",
        description: "Could not save changes.",
        variant: "destructive",
      });
    }
  }, [pendingChanges, getStorageKey]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (
      isEditorReady &&
      iframe &&
      iframe.contentDocument &&
      iframe.contentDocument.body
    ) {
      const iframeBody = iframe.contentDocument.body;
      if (isEditMode) {
        iframeBody.classList.add("editor-active");
        addEditModeListeners(); // This already adds the selectionchange listener
      } else {
        saveChanges();
        iframeBody.classList.remove("editor-active");
        removeEditModeListeners(); // This already removes the selectionchange listener
      }
    } else {
      // Log if conditions aren't met
      // console.log("useEffect [isEditMode, isEditorReady]: Conditions not met", { isEditorReady, iframeExists: !!iframe, docExists: !!iframe?.contentDocument, bodyExists: !!iframe?.contentDocument?.body });
    }
    // No need for explicit return cleanup for listeners added/removed in add/removeEditModeListeners
    // The dependency array ensures this effect runs when isEditMode or isEditorReady changes.
  }, [
    isEditMode,
    isEditorReady,
    saveChanges,
    addEditModeListeners,
    removeEditModeListeners,
  ]); // Added add/remove listeners to dependencies

  // Listen for image change events from the MediaLibrary
  useEffect(() => {
    const handleImageChanged = (event: CustomEvent) => {
      const { url, editorId } = event.detail;
      if (url && editorId) {
        recordChange(editorId, "attribute", "src", url);
        // Also update alt text if not already set
        const iframe = iframeRef.current;
        if (iframe && iframe.contentDocument) {
          const imgElement = iframe.contentDocument.querySelector(
            `[data-editor-id="${editorId}"]`
          ) as HTMLImageElement | null;
          if (imgElement && !imgElement.alt) {
            // Extract filename from URL for basic alt text
            const filename = url.split("/").pop()?.split(".")[0] || "";
            const altText = filename.replace(/[-_]/g, " ");
            imgElement.alt = altText;
            recordChange(editorId, "attribute", "alt", altText);
          }
        }
      }
    };

    document.addEventListener(
      "imageChanged",
      handleImageChanged as EventListener
    );

    return () => {
      document.removeEventListener(
        "imageChanged",
        handleImageChanged as EventListener
      );
    };
  }, [recordChange]);

  useEffect(() => {
    setUrl(inputUrl);
    setShowToolbar(false);
    setDebugInfo("");
  }, [inputUrl]);

  useEffect(() => {
    const iframe = iframeRef.current;
    const handleLoad = () => {
      setDebugInfo("Iframe loaded, initializing editor...");
      setTimeout(() => {
        initializeEditor();
      }, 500);
    };

    if (iframe) {
      iframe.addEventListener("load", handleLoad);
      if (
        iframe.contentDocument &&
        iframe.contentDocument.readyState === "complete"
      ) {
        handleLoad();
      }
    }

    return () => {
      iframe?.removeEventListener("load", handleLoad);
    };
  }, [url]);

  const makeElementsEditable = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    const doc = iframe.contentDocument;
    const textEditableTags = new Set([
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "span",
      "li",
      "button",
      "a",
    ]);
    const selectableElementsSelector =
      "h1, h2, h3, h4, h5, h6, p, span, section, header, nav, footer, li, div, button, a, img";
    const selectableElements = doc.querySelectorAll(selectableElementsSelector);
    let elementCounter = 0;

    selectableElements.forEach((el) => {
      if (el.closest("script, style, noscript")) return;

      const htmlEl = el as HTMLElement;
      const tagNameLower = htmlEl.tagName.toLowerCase();

      const editorId = `editor-${Date.now()}-${elementCounter++}`;
      htmlEl.setAttribute("data-editor-id", editorId);

      htmlEl.setAttribute("data-editable", "true");
      htmlEl.setAttribute("data-editable-tag", tagNameLower);

      if (textEditableTags.has(tagNameLower)) {
        htmlEl.setAttribute("data-editable-type", "text");
        htmlEl.contentEditable = "false";
        htmlEl.setAttribute("data-editable-text", "true");
        htmlEl.draggable = false;
      } else {
        htmlEl.setAttribute(
          "data-editable-type",
          tagNameLower === "img" ? "image" : "block"
        );
        htmlEl.contentEditable = "false";
      }

      htmlEl.addEventListener("blur", handleElementBlur);

      (htmlEl as any).__clickListenerAttached = false;
    });
  };

  let currentHoveredElement: HTMLElement | null = null;
  const handleMouseEnter = (e: Event) => {
    const htmlEl = e.currentTarget as HTMLElement;
    if (currentHoveredElement && currentHoveredElement !== htmlEl) {
      currentHoveredElement.classList.remove("hover-active");
    }
    htmlEl.classList.add("hover-active");
    currentHoveredElement = htmlEl;
  };
  const handleMouseLeave = (e: Event) => {
    const htmlEl = e.currentTarget as HTMLElement;
    htmlEl.classList.remove("hover-active");
    if (currentHoveredElement === htmlEl) {
      currentHoveredElement = null;
    }
  };
  const handleElementBlur = (e: Event) => {
    const htmlEl = e.currentTarget as HTMLElement;
    htmlEl.classList.remove("focus-active");
  };

  return (
    <div className="flex flex-col h-full w-full gap-4">
      {isEditMode && (
        <FloatingToolbar
          show={showToolbar}
          position={toolbarPosition}
          activeFormats={activeFormats}
          activeTextColor={activeTextColor} // Pass the active text color
          elementType={elementType}
          selectedElement={selectedElement}
          onFormatText={formatText}
          onSetBackgroundColor={setBackgroundColor}
          onSetBackgroundImage={setBackgroundImage}
          onSetLink={setLink}
          onSetAltTag={setAltTag}
          onClose={closeToolbar}
        />
      )}

      <div className="relative w-full h-full border rounded-lg overflow-hidden">
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
          key={url}
          src={url}
          className="w-full h-full"
          sandbox="allow-same-origin allow-forms allow-scripts"
        />
      </div>
    </div>
  );
}
