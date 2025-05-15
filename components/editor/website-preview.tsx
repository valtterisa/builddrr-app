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
  initialUrl = "/test",
  isEditMode,
}: IframeEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [url] = useState(initialUrl);
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
  const [canMakeStandalone, setCanMakeStandalone] = useState(false);
  const [canRemoveStandalone, setCanRemoveStandalone] = useState(false);

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
          outline: 2px dotted #7c3aed !important;
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
    // Always select the clicked element, even if it's a span inside another element
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

  // Utility: Recursively set contentEditable="true" on all child elements with data-editable-text="true"
  function setAllTextEditable(root: HTMLElement) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (node) => {
        if (
          (node as HTMLElement).getAttribute &&
          (node as HTMLElement).getAttribute("data-editable-text") === "true"
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      },
    });
    let node = walker.nextNode();
    while (node) {
      (node as HTMLElement).contentEditable = "true";
      node = walker.nextNode();
    }
  }

  // Utility: Unwrap a span if it has no styles left
  function unwrapIfNoStyle(span: HTMLElement) {
    if (
      span.tagName === "SPAN" &&
      !span.style.fontWeight &&
      !span.style.fontStyle &&
      !span.style.textDecoration &&
      !span.style.color &&
      !span.style.fontSize
    ) {
      const parent = span.parentNode;
      while (span.firstChild) {
        parent?.insertBefore(span.firstChild, span);
      }
      parent?.removeChild(span);
    }
  }

  // Utility: For a text node, wrap a range (start, end) in a span with style
  function wrapTextRange(
    textNode: Text,
    start: number,
    end: number,
    styleProp: string,
    styleValue: string
  ) {
    const doc = textNode.ownerDocument;
    const span = doc.createElement("span");
    if (styleProp === "fontWeight") span.style.fontWeight = styleValue;
    if (styleProp === "fontStyle") span.style.fontStyle = styleValue;
    if (styleProp === "textDecoration") span.style.textDecoration = styleValue;
    if (styleProp === "color") span.style.color = styleValue;
    const text = textNode.data;
    const before = text.slice(0, start);
    const middle = text.slice(start, end);
    const after = text.slice(end);
    const frag = doc.createDocumentFragment();
    if (before) frag.appendChild(doc.createTextNode(before));
    span.appendChild(doc.createTextNode(middle));
    frag.appendChild(span);
    if (after) frag.appendChild(doc.createTextNode(after));
    textNode.parentNode?.replaceChild(frag, textNode);
  }

  const handleElementSelection = (element: HTMLElement) => {
    if (!isEditMode || !element) return;

    // Remove focus from all editable elements before setting new selection
    const iframe = iframeRef.current;
    if (iframe && iframe.contentDocument) {
      const allEditable = iframe.contentDocument.querySelectorAll(
        '[data-editable-text="true"]'
      );
      allEditable.forEach((s) => s.classList.remove("focus-active"));
    }

    if (selectedElement && selectedElement !== element) {
      if (selectedElement.hasAttribute("data-editable-text")) {
        selectedElement.contentEditable = "false";
      }
    }

    setSelectedElement(element);
    setDebugInfo(
      `Selected element: ${element.tagName}, id: ${element.getAttribute("data-editor-id")}, contentEditable: ${element.contentEditable}`
    );
    console.log("Selected element:", element);
    const elementTypeLower = element.tagName.toLowerCase();
    setElementType(elementTypeLower);

    if (!iframe) return;
    if (
      iframe &&
      iframe.contentDocument &&
      element.hasAttribute("data-editable-text")
    ) {
      // Add focus-active to the selected editable element
      element.classList.add("focus-active");
      // Update activeFormats state based on the element's styles
      setActiveFormats({
        bold:
          element.style.fontWeight === "700" ||
          element.style.fontWeight === "bold",
        italic: element.style.fontStyle === "italic",
        underline: element.style.textDecoration.includes("underline"),
      });
      setActiveTextColor(element.style.color || null);
    }

    const iframeRect = iframe?.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const toolbarHeight = 40;

    setToolbarPosition({
      top: elementRect.top + (iframeRect?.top ?? 0) - toolbarHeight - 10,
      left:
        elementRect.left +
        elementRect.width / 2 +
        (iframeRect?.left ?? 0) -
        150,
    });

    setShowToolbar(true);
    setDebugInfo(
      (prev) =>
        prev +
        ` | Toolbar shown at (${toolbarPosition.top}, ${toolbarPosition.left})`
    );

    if (element.tagName !== "IMG") {
      if (element.hasAttribute("data-editable-text")) {
        element.contentEditable = "true";
      } else {
        element.contentEditable = "false";
      }
      // Make all child text spans editable
      setAllTextEditable(element);

      iframe?.contentWindow?.focus();
      element.focus();

      const selection = iframe?.contentWindow?.getSelection();
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

  // Remove focus from all editable elements when toolbar is closed
  useEffect(() => {
    if (!showToolbar) {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const allEditable = iframe.contentDocument.querySelectorAll(
          '[data-editable-text="true"]'
        );
        allEditable.forEach((s) => s.classList.remove("focus-active"));
      }
    }
  }, [showToolbar]);

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

  // Utility to update or create a <style> tag for a given element by data-editor-id
  const updateElementStyleTag = (
    editorId: string,
    styleObj: Record<string, string>
  ) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    let styleTag = iframe.contentDocument.getElementById(
      `style-for-${editorId}`
    ) as HTMLStyleElement | null;
    const selector = `[data-editor-id="${editorId}"]`;
    const styleString = Object.entries(styleObj)
      .map(
        ([k, v]) =>
          `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}: ${v};`
      )
      .join(" ");
    const css = `${selector} { ${styleString} }`;
    if (!styleTag) {
      styleTag = iframe.contentDocument.createElement("style");
      styleTag.id = `style-for-${editorId}`;
      iframe.contentDocument.head.appendChild(styleTag);
    }
    styleTag.textContent = css;
  };

  // Utility to get current style object from <style> tag for an element
  const getElementStyleObj = (editorId: string): Record<string, string> => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return {};
    const styleTag = iframe.contentDocument.getElementById(
      `style-for-${editorId}`
    ) as HTMLStyleElement | null;
    if (!styleTag || !styleTag.textContent) return {};
    const match = styleTag.textContent.match(/\{([^}]*)\}/);
    if (!match) return {};
    return Object.fromEntries(
      match[1]
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const [k, v] = s.split(":").map((x) => x.trim());
          return [k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v];
        })
    );
  };

  const setElementStyle = (property: string, value: string) => {
    if (!isEditMode || !selectedElement) return;
    const editorId = selectedElement.getAttribute("data-editor-id");
    if (editorId) {
      try {
        // Get current style object from <style> tag
        const styleObj = getElementStyleObj(editorId);
        // Remove property if value is default
        const shouldRemove =
          (property === "fontWeight" && value === "normal") ||
          (property === "fontStyle" && value === "normal") ||
          (property === "textDecoration" && value === "none") ||
          (property === "color" &&
            (!value || value === "initial" || value === "inherit")) ||
          (property === "fontSize" &&
            (!value || value === "initial" || value === "inherit"));
        if (shouldRemove) {
          delete styleObj[property];
        } else {
          styleObj[property] = value;
        }
        updateElementStyleTag(editorId, styleObj);
        setDebugInfo(`Applied ${property}: ${value}`);
        recordChange(editorId, "style", property, value);
      } catch (error) {
        setDebugInfo(`Error applying ${property}: ${error}`);
      }
    }
  };

  const setBackgroundColor = (color: string) => {
    setElementStyle("backgroundColor", color);
  };

  const setBackgroundImage = (urlValue: string) => {
    setElementStyle("backgroundImage", `url(${urlValue})`);
    setElementStyle("backgroundSize", "cover");
    setElementStyle("backgroundPosition", "center");
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
    setShowToolbar(false);
    setDebugInfo("");
  }, []);

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

  const toggleStyleOnSelection = (styleProp: string, styleValue: string) => {
    if (!isEditMode || !selectedElement) return;
    // Apply style directly to the selected element
    if (styleProp === "fontWeight") {
      selectedElement.style.fontWeight =
        selectedElement.style.fontWeight === styleValue ? "" : styleValue;
    } else if (styleProp === "fontStyle") {
      selectedElement.style.fontStyle =
        selectedElement.style.fontStyle === styleValue ? "" : styleValue;
    } else if (styleProp === "textDecoration") {
      selectedElement.style.textDecoration =
        selectedElement.style.textDecoration === styleValue ? "" : styleValue;
    } else if (styleProp === "color") {
      selectedElement.style.color =
        selectedElement.style.color === styleValue ? "" : styleValue;
    }
    // Also apply to all descendant spans with !important
    const spans = selectedElement.querySelectorAll("span");
    spans.forEach((span) => {
      if (styleProp === "fontWeight") {
        span.style.setProperty("font-weight", styleValue, "important");
      } else if (styleProp === "fontStyle") {
        span.style.setProperty("font-style", styleValue, "important");
      } else if (styleProp === "textDecoration") {
        span.style.setProperty("text-decoration", styleValue, "important");
      } else if (styleProp === "color") {
        span.style.setProperty("color", styleValue, "important");
      }
    });
    // Unwrap spans that have no formatting left
    spans.forEach((span) => {
      const style = span.style;
      if (
        !style.fontWeight &&
        !style.fontStyle &&
        !style.textDecoration &&
        !style.color &&
        !style.fontSize
      ) {
        const parent = span.parentNode;
        while (span.firstChild) {
          parent?.insertBefore(span.firstChild, span);
        }
        parent?.removeChild(span);
      }
    });
    selectedElement.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true })
    );
  };

  const formatText = (command: string, value = "") => {
    if (!isEditMode) return;
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;
    const win = iframe.contentWindow;
    const sel = win.getSelection();
    const hasSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed;

    // Helper to visually focus the span
    const visuallyFocusSpan = (span: HTMLElement) => {
      // Remove focus-active from all spans first
      const allSpans = iframe.contentDocument!.querySelectorAll(
        'span[data-editable-text="true"]'
      );
      allSpans.forEach((s) => s.classList.remove("focus-active"));
      // Add focus-active to the current span
      span.classList.add("focus-active");
    };

    if (hasSelection) {
      const range = sel!.getRangeAt(0);
      // Only operate on text selections
      if (
        range.startContainer === range.endContainer &&
        range.startContainer.nodeType === Node.TEXT_NODE &&
        range.startOffset !== range.endOffset
      ) {
        // Prevent wrapping whitespace-only selections
        const selectedText = range.toString();
        if (selectedText.trim().length === 0) {
          setDebugInfo("Cannot style: selection is only whitespace.");
          return;
        }
        // Check if already inside a span
        let parent: Node | null = range.startContainer.parentNode;
        let span: HTMLElement | null = null;
        while (parent && parent !== iframe.contentDocument.body) {
          if (
            parent.nodeType === Node.ELEMENT_NODE &&
            (parent as HTMLElement).tagName === "SPAN" &&
            (parent as HTMLElement).getAttribute("data-editable-text") ===
              "true"
          ) {
            span = parent as HTMLElement;
            break;
          }
          parent = parent.parentNode;
        }

        // If not inside a span, wrap in a new span
        if (!span) {
          span = iframe.contentDocument.createElement("span");
          span.setAttribute("data-editable", "true");
          span.setAttribute("data-editable-type", "text");
          span.setAttribute("data-editable-text", "true");
          span.setAttribute("data-editor-id", `editor-span-${Date.now()}`);
          span.style.display = "inline";
          try {
            range.surroundContents(span);
            // Reselect the new span
            sel!.removeAllRanges();
            const newRange = iframe.contentDocument.createRange();
            newRange.selectNodeContents(span);
            sel!.addRange(newRange);
          } catch (e) {
            setDebugInfo(
              "Could not wrap selection: " +
                (e instanceof Error ? e.message : String(e))
            );
            return;
          }
        }

        // Now apply the style to the span
        if (command === "bold") {
          span.style.fontWeight =
            span.style.fontWeight === "700" ? "400" : "700";
        } else if (command === "italic") {
          span.style.fontStyle =
            span.style.fontStyle === "italic" ? "normal" : "italic";
        } else if (command === "underline") {
          span.style.textDecoration =
            span.style.textDecoration === "underline" ? "none" : "underline";
        } else if (command === "color") {
          span.style.color = value;
        }
        // ... handle other styles as needed

        // Update selection and toolbar
        setSelectedElement(span);
        handleElementSelection(span);
        visuallyFocusSpan(span);
        return;
      }
    }

    // If no text selection but selectedElement is a standalone span, style it
    if (
      selectedElement &&
      selectedElement.tagName === "SPAN" &&
      selectedElement.getAttribute("data-editable-text") === "true"
    ) {
      if (command === "bold") {
        selectedElement.style.fontWeight =
          selectedElement.style.fontWeight === "700" ? "400" : "700";
      } else if (command === "italic") {
        selectedElement.style.fontStyle =
          selectedElement.style.fontStyle === "italic" ? "normal" : "italic";
      } else if (command === "underline") {
        selectedElement.style.textDecoration =
          selectedElement.style.textDecoration === "underline"
            ? "none"
            : "underline";
      } else if (command === "color") {
        selectedElement.style.color = value;
      }
      visuallyFocusSpan(selectedElement);
      return;
    }

    // Fallback: if not a text selection, apply to selectedElement as before
    if (selectedElement) {
      if (command === "bold") {
        toggleStyleOnSelection(
          "fontWeight",
          selectedElement.style.fontWeight === "700" ? "400" : "700"
        );
        return;
      }
      if (command === "italic") {
        toggleStyleOnSelection("fontStyle", "italic");
        return;
      }
      if (command === "underline") {
        toggleStyleOnSelection("textDecoration", "underline");
        return;
      }
      if (command === "color") {
        toggleStyleOnSelection("color", value);
        return;
      }
    }
  };

  // Detect if selection can be made standalone
  const checkCanMakeStandalone = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
      setCanMakeStandalone(false);
      setCanRemoveStandalone(false);
      return;
    }
    const win = iframe.contentWindow;
    const sel = win.getSelection();
    let isInsideStandalone = false;
    let isStandaloneSpanFocused = false;
    // These are null on first click. Why?
    if (
      selectedElement &&
      selectedElement.tagName === "SPAN" &&
      selectedElement.getAttribute("data-editable-text") === "true"
    ) {
      isStandaloneSpanFocused = true;
    }
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setCanMakeStandalone(false);
      setCanRemoveStandalone(isStandaloneSpanFocused);
      console.log("setCanRemoveStandalone 1:", isStandaloneSpanFocused);
      return;
    }
    const range = sel.getRangeAt(0);
    if (
      range.startContainer === range.endContainer &&
      range.startContainer.nodeType === Node.TEXT_NODE &&
      range.startOffset !== range.endOffset
    ) {
      // Check if the selected text is already inside a span[data-editable-text="true"]
      let parent: Node | null = range.startContainer.parentNode;
      while (parent && parent !== iframe.contentDocument.body) {
        if (
          parent.nodeType === Node.ELEMENT_NODE &&
          (parent as HTMLElement).tagName === "SPAN" &&
          (parent as HTMLElement).getAttribute("data-editable-text") === "true"
        ) {
          isInsideStandalone = true;
          break;
        }
        parent = parent.parentNode;
      }
      setCanMakeStandalone(!isInsideStandalone);
      setCanRemoveStandalone(isInsideStandalone || isStandaloneSpanFocused);
      console.log(
        "setCanRemoveStandalone 2:",
        isStandaloneSpanFocused || isInsideStandalone
      );
    } else {
      setCanMakeStandalone(false);
      setCanRemoveStandalone(isStandaloneSpanFocused);
      console.log("setCanRemoveStandalone 3:", isStandaloneSpanFocused);
    }
  }, [selectedElement]);

  // Function to remove standalone span (unwrap)
  const removeStandaloneSpan = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;
    // If selectedElement is a standalone span, unwrap it
    if (
      selectedElement &&
      selectedElement.tagName === "SPAN" &&
      selectedElement.getAttribute("data-editable-text") === "true"
    ) {
      const standaloneSpan = selectedElement;
      const parentNode = standaloneSpan.parentNode;
      if (!parentNode) return;
      // Save selection offsets if possible
      let startOffset = 0;
      let selectionLength = 0;
      const win = iframe.contentWindow;
      const sel = win.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const spanRange = iframe.contentDocument.createRange();
        spanRange.selectNodeContents(standaloneSpan);
        const preSelectionRange = spanRange.cloneRange();
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        startOffset = preSelectionRange.toString().length;
        selectionLength = range.toString().length;
      }
      // Replace the span with its children
      let firstUnwrappedElement: HTMLElement | null = null;
      while (standaloneSpan.firstChild) {
        const child = standaloneSpan.firstChild;
        parentNode.insertBefore(child, standaloneSpan);
        if (!firstUnwrappedElement && child.nodeType === Node.ELEMENT_NODE) {
          firstUnwrappedElement = child as HTMLElement;
        }
      }
      parentNode.removeChild(standaloneSpan);
      // Restore selection if possible
      if (startOffset !== 0 || selectionLength !== 0) {
        const walker = iframe.contentDocument.createTreeWalker(
          parentNode,
          NodeFilter.SHOW_TEXT,
          null
        );
        let charCount = 0;
        let foundStart = false;
        let startNode: Text | null = null;
        let endNode: Text | null = null;
        let startOffsetInNode = 0;
        let endOffsetInNode = 0;
        while (walker.nextNode()) {
          const node = walker.currentNode as Text;
          const nextCharCount = charCount + node.length;
          if (
            !foundStart &&
            startOffset >= charCount &&
            startOffset < nextCharCount
          ) {
            startNode = node;
            startOffsetInNode = startOffset - charCount;
            foundStart = true;
          }
          if (foundStart && startOffset + selectionLength <= nextCharCount) {
            endNode = node;
            endOffsetInNode = startOffset + selectionLength - charCount;
            break;
          }
          charCount = nextCharCount;
        }
        if (startNode && endNode) {
          const newRange = iframe.contentDocument.createRange();
          newRange.setStart(startNode, startOffsetInNode);
          newRange.setEnd(endNode, endOffsetInNode);
          const win = iframe.contentWindow;
          const sel = win.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(newRange);
        }
      }
      setDebugInfo("Removed standalone span");
      // Select the parent or first unwrapped element to keep toolbar open
      if (firstUnwrappedElement) {
        setSelectedElement(firstUnwrappedElement);
        handleElementSelection(firstUnwrappedElement);
      } else if (parentNode instanceof HTMLElement) {
        setSelectedElement(parentNode);
        handleElementSelection(parentNode);
      } else {
        setSelectedElement(null);
      }
      checkCanMakeStandalone();
      return;
    }
    // Fallback: previous logic (selection inside span)
    const win = iframe.contentWindow;
    const sel = win.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (
      range.startContainer === range.endContainer &&
      range.startContainer.nodeType === Node.TEXT_NODE &&
      range.startOffset !== range.endOffset
    ) {
      // Find the nearest parent span[data-editable-text="true"]
      let parent: Node | null = range.startContainer.parentNode;
      let standaloneSpan: HTMLElement | null = null;
      while (parent && parent !== iframe.contentDocument.body) {
        if (
          parent.nodeType === Node.ELEMENT_NODE &&
          (parent as HTMLElement).tagName === "SPAN" &&
          (parent as HTMLElement).getAttribute("data-editable-text") === "true"
        ) {
          standaloneSpan = parent as HTMLElement;
          break;
        }
        parent = parent.parentNode;
      }
      if (standaloneSpan) {
        // Save selection offsets relative to the span
        const spanRange = iframe.contentDocument.createRange();
        spanRange.selectNodeContents(standaloneSpan);
        const preSelectionRange = spanRange.cloneRange();
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const startOffset = preSelectionRange.toString().length;
        const selectionLength = range.toString().length;

        // Replace the span with its children
        const parentNode = standaloneSpan.parentNode;
        while (standaloneSpan.firstChild) {
          parentNode?.insertBefore(standaloneSpan.firstChild, standaloneSpan);
        }
        parentNode?.removeChild(standaloneSpan);

        // Restore selection
        const walker = iframe.contentDocument.createTreeWalker(
          parentNode!,
          NodeFilter.SHOW_TEXT,
          null
        );
        let charCount = 0;
        let foundStart = false;
        let startNode: Text | null = null;
        let endNode: Text | null = null;
        let startOffsetInNode = 0;
        let endOffsetInNode = 0;
        while (walker.nextNode()) {
          const node = walker.currentNode as Text;
          const nextCharCount = charCount + node.length;
          if (
            !foundStart &&
            startOffset >= charCount &&
            startOffset < nextCharCount
          ) {
            startNode = node;
            startOffsetInNode = startOffset - charCount;
            foundStart = true;
          }
          if (foundStart && startOffset + selectionLength <= nextCharCount) {
            endNode = node;
            endOffsetInNode = startOffset + selectionLength - charCount;
            break;
          }
          charCount = nextCharCount;
        }
        if (startNode && endNode) {
          const newRange = iframe.contentDocument.createRange();
          newRange.setStart(startNode, startOffsetInNode);
          newRange.setEnd(endNode, endOffsetInNode);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        setDebugInfo("Removed standalone span");
        checkCanMakeStandalone();
      }
    }
  }, [checkCanMakeStandalone, selectedElement]);

  // Listen for selection changes to update canMakeStandalone
  useEffect(() => {
    if (!isEditMode) return;
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;
    const win = iframe.contentWindow;
    const handler = () => checkCanMakeStandalone();
    win.document.addEventListener("selectionchange", handler);
    return () => {
      win.document.removeEventListener("selectionchange", handler);
    };
  }, [isEditMode, checkCanMakeStandalone]);

  // Function to wrap selection in a span
  const wrapSelectionInSpan = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;
    const win = iframe.contentWindow;
    const sel = win.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (
      range.startContainer === range.endContainer &&
      range.startContainer.nodeType === Node.TEXT_NODE &&
      range.startOffset !== range.endOffset
    ) {
      // Prevent wrapping whitespace-only selections
      const selectedText = range.toString();
      if (selectedText.trim().length === 0) {
        setDebugInfo("Cannot make standalone: selection is only whitespace.");
        return;
      }
      // Check if the selected text is already inside a span[data-editable-text="true"]
      let parent: Node | null = range.startContainer.parentNode;
      while (parent && parent !== iframe.contentDocument.body) {
        if (
          parent.nodeType === Node.ELEMENT_NODE &&
          (parent as HTMLElement).tagName === "SPAN" &&
          (parent as HTMLElement).getAttribute("data-editable-text") === "true"
        ) {
          setDebugInfo("Selection is already inside a standalone span.");
          return;
        }
        parent = parent.parentNode;
      }
      const span = iframe.contentDocument.createElement("span");
      span.setAttribute("data-editable", "true");
      span.setAttribute("data-editable-type", "text");
      span.setAttribute("data-editable-text", "true");
      span.setAttribute("data-editor-id", `editor-span-${Date.now()}`);
      span.style.display = "inline";
      try {
        range.surroundContents(span);
        // Select the new span
        sel.removeAllRanges();
        const newRange = iframe.contentDocument.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
        // Trigger selection logic
        handleElementSelection(span);
        setDebugInfo("Wrapped selection in span");
      } catch (e) {
        setDebugInfo(
          "Could not wrap selection: " +
            (e instanceof Error ? e.message : String(e))
        );
      }
    }
  }, [handleElementSelection]);

  // Add useEffect to call checkCanMakeStandalone when selectedElement changes
  useEffect(() => {
    checkCanMakeStandalone();
  }, [selectedElement, checkCanMakeStandalone]);

  return (
    <div className="flex flex-col h-full w-full gap-4">
      {isEditMode && (
        <FloatingToolbar
          show={showToolbar}
          position={toolbarPosition}
          activeFormats={activeFormats}
          activeTextColor={activeTextColor}
          setActiveTextColor={setActiveTextColor}
          elementType={elementType}
          selectedElement={selectedElement}
          onFormatText={formatText}
          onSetBackgroundColor={setBackgroundColor}
          onSetBackgroundImage={setBackgroundImage}
          onSetLink={setLink}
          onSetAltTag={setAltTag}
          onClose={closeToolbar}
          onRemoveStandalone={removeStandaloneSpan}
          canRemoveStandalone={canRemoveStandalone}
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
          key={`url-${url}`}
          src={url}
          className="w-full h-full"
          sandbox="allow-same-origin allow-forms allow-scripts"
        />
      </div>
    </div>
  );
}
