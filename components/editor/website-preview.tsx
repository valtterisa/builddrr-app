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
          position: relative !important;
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
    setShowToolbar(false);
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
      setShowToolbar(false);
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

      checkActiveFormats(element);

      const selection = iframe.contentWindow.getSelection();
      if (selection && selection.rangeCount === 0) {
        const range = iframe.contentDocument!.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      element.contentEditable = "false";
    }
  };

  const checkActiveFormats = useCallback(
    (element: HTMLElement) => {
      if (!element || element.tagName === "IMG") return;

      try {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

        const selection = iframe.contentWindow.getSelection();
        let isBold = false;
        let isItalic = false;
        let isUnderline = false;

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let node: Node | null = range.commonAncestorContainer;

          while (node && node !== element.parentElement) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const style = iframe.contentWindow.getComputedStyle(
                node as Element
              );
              if (
                style.fontWeight === "bold" ||
                parseInt(style.fontWeight, 10) >= 700
              ) {
                isBold = true;
              }
              if (style.fontStyle === "italic") {
                isItalic = true;
              }
              if (style.textDecorationLine.includes("underline")) {
                isUnderline = true;
              }
            }
            if (isBold && isItalic && isUnderline) break;
            if (node === element) break;
            node = node.parentNode;
          }

          if (!isBold || !isItalic || !isUnderline) {
            const elementStyle = iframe.contentWindow.getComputedStyle(element);
            if (
              !isBold &&
              (elementStyle.fontWeight === "bold" ||
                parseInt(elementStyle.fontWeight, 10) >= 700)
            ) {
              isBold = true;
            }
            if (!isItalic && elementStyle.fontStyle === "italic") {
              isItalic = true;
            }
            if (
              !isUnderline &&
              elementStyle.textDecorationLine.includes("underline")
            ) {
              isUnderline = true;
            }
          }
        } else {
          const style = iframe.contentWindow.getComputedStyle(element);
          isBold =
            style.fontWeight === "bold" ||
            parseInt(style.fontWeight, 10) >= 700;
          isItalic = style.fontStyle === "italic";
          isUnderline = style.textDecorationLine.includes("underline");
        }

        setActiveFormats({
          bold: isBold,
          italic: isItalic,
          underline: isUnderline,
        });
      } catch (error) {
        console.error("Error checking active formats:", error);
        setDebugInfo(`Error checking formats: ${error}`);
      }
    },
    [selectedElement]
  );

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

      checkActiveFormats(selectedElement);

      setTimeout(() => {
        selectedElement.dispatchEvent(
          new Event("input", { bubbles: true, cancelable: true })
        );
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
        addEditModeListeners();
      } else {
        saveChanges();
        iframeBody.classList.remove("editor-active");
        removeEditModeListeners();
      }
    } else {
      // Log if conditions aren't met
    }
    return () => {
      if (
        isEditorReady &&
        iframe &&
        iframe.contentDocument &&
        iframe.contentDocument.body
      ) {
        iframe.contentDocument.body.classList.remove("editor-active");
        removeEditModeListeners();
      }
    };
  }, [isEditMode, isEditorReady, saveChanges]);

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
      if (el.closest("script, style, noscript, svg")) return;

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
