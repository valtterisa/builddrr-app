"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState, useReducer } from "react";
import { toast } from "@/components/ui/use-toast";
import { useEditorStore, addEditorElement } from "@/lib/editor-store";
import type { EditorState, EditorElement } from "@/lib/editor-store";

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
  id: string;
  machine: any;
}

interface EditorReducerState {
  iframeReady: boolean;
  iframeError: string | null;
  isEditorReady: boolean;
  debugInfo: string;
  elementType: string;
  pendingChanges: EditorChange[];
  isApplyingChanges: boolean;
  canMakeStandalone: boolean;
  canRemoveStandalone: boolean;
  selectedElement: HTMLElement | null;
  activeTextColor: string | null;
}

type EditorReducerAction =
  | { type: "SET_IFRAME_READY"; value: boolean }
  | { type: "SET_IFRAME_ERROR"; value: string | null }
  | { type: "SET_EDITOR_READY"; value: boolean }
  | { type: "SET_DEBUG_INFO"; value: string }
  | { type: "SET_ELEMENT_TYPE"; value: string }
  | { type: "SET_PENDING_CHANGES"; value: EditorChange[] }
  | { type: "ADD_PENDING_CHANGE"; value: EditorChange }
  | { type: "CLEAR_PENDING_CHANGES" }
  | { type: "SET_APPLYING_CHANGES"; value: boolean }
  | { type: "SET_CAN_MAKE_STANDALONE"; value: boolean }
  | { type: "SET_CAN_REMOVE_STANDALONE"; value: boolean }
  | { type: "SET_SELECTED_ELEMENT"; value: HTMLElement | null }
  | { type: "SET_ACTIVE_TEXT_COLOR"; value: string | null };

const initialEditorState: EditorReducerState = {
  iframeReady: false,
  iframeError: null,
  isEditorReady: false,
  debugInfo: "",
  elementType: "",
  pendingChanges: [],
  isApplyingChanges: false,
  canMakeStandalone: false,
  canRemoveStandalone: false,
  selectedElement: null,
  activeTextColor: null,
};

function editorReducer(
  state: EditorReducerState,
  action: EditorReducerAction
): EditorReducerState {
  switch (action.type) {
    case "SET_IFRAME_READY":
      return { ...state, iframeReady: action.value };
    case "SET_IFRAME_ERROR":
      return { ...state, iframeError: action.value };
    case "SET_EDITOR_READY":
      return { ...state, isEditorReady: action.value };
    case "SET_DEBUG_INFO":
      return { ...state, debugInfo: action.value };
    case "SET_ELEMENT_TYPE":
      return { ...state, elementType: action.value };
    case "SET_PENDING_CHANGES":
      return { ...state, pendingChanges: action.value };
    case "ADD_PENDING_CHANGE":
      return {
        ...state,
        pendingChanges: [...state.pendingChanges, action.value],
      };
    case "CLEAR_PENDING_CHANGES":
      return { ...state, pendingChanges: [] };
    case "SET_APPLYING_CHANGES":
      return { ...state, isApplyingChanges: action.value };
    case "SET_CAN_MAKE_STANDALONE":
      return { ...state, canMakeStandalone: action.value };
    case "SET_CAN_REMOVE_STANDALONE":
      return { ...state, canRemoveStandalone: action.value };
    case "SET_SELECTED_ELEMENT":
      return { ...state, selectedElement: action.value };
    case "SET_ACTIVE_TEXT_COLOR":
      return { ...state, activeTextColor: action.value };
    default:
      return state;
  }
}

export default function WebsitePreview({
  initialUrl,
  isEditMode,
  id,
  machine,
}: IframeEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [url] = useState(initialUrl);
  const [editorState, dispatch] = useReducer(editorReducer, initialEditorState);

  const selectElement = useEditorStore((s: EditorState) => s.selectElement);

  const elements = useEditorStore((s: EditorState) => s.elements);

  // Store handler references for clean removal
  const eventHandlersRef = useRef<{
    handleElementClick: EventListener;
    handleDocumentClick: EventListener;
    handleElementInput: EventListener;
    handleMouseEnter: EventListener;
    handleMouseLeave: EventListener;
    handleElementBlur: EventListener;
    handleSelectionChange: EventListener;
  } | null>(null);

  // Add hasMounted to prevent SSR hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Get a preview URL - use real machine URL, mock URL, or API preview endpoint
  const getPreviewUrl = useCallback(() => {
    // If we have a machine with a URL property, use it
    if (machine && machine.ipv4) {
      return `http://${machine.ipv4}`;
    }

    // If we have an initial URL that's not "new", use the preview endpoint
    if (initialUrl && initialUrl !== "new") {
      return `/api/preview/${initialUrl}`;
    }

    // Return null if no valid URL can be determined
    return null;
  }, [machine, initialUrl]);

  const previewUrl = getPreviewUrl();

  // Render fallback content when no URL is available
  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-3xl p-8">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-medium mb-2">Website Preview</h3>
          <p className="text-gray-500 mb-4">
            {editorState.iframeError
              ? `Error loading preview: ${editorState.iframeError}`
              : "Your website is being generated. The preview will appear here once it's ready."}
          </p>
          <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  const getStorageKey = useCallback(() => `editorChanges-${url}`, [url]);

  const applyStoredChanges = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument || editorState.isApplyingChanges)
      return;

    dispatch({ type: "SET_APPLYING_CHANGES", value: true });
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
    dispatch({ type: "SET_APPLYING_CHANGES", value: false });
  }, [getStorageKey, editorState.isApplyingChanges]);

  const initializeEditor = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
      console.log("Iframe or contentDocument not available");
      return;
    }

    if (!iframe.contentDocument.body) {
      console.warn("iframe.contentDocument.body is null");
      return;
    }

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
           pointer-events: none !important;
           z-index: 1000 !important;
        }

        .editor-active [data-editable="true"]::before {
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
           z-index: 1000 !important;
        }
      `;
      iframe.contentDocument.head.appendChild(style);

      applyStoredChanges();
      makeElementsEditable();

      if (isEditMode) {
        iframe.contentDocument.body.classList.add("editor-active");
        addAllEventListeners();
        // Add selection change listener here as well for initial load
        if (
          typeof eventHandlersRef.current?.handleSelectionChange === "function"
        ) {
          iframe.contentDocument.addEventListener(
            "selectionchange",
            eventHandlersRef.current.handleSelectionChange
          );
        }
      } else {
        iframe.contentDocument.body.classList.remove("editor-active");
      }
    } catch (error) {
      console.error("Error initializing editor:", error);

      toast({
        title: "Editor Initialization Error",
        description: "Could not initialize editor. Try reloading the page.",
        variant: "destructive",
      });
    }
  };

  // Move all handler function declarations above addAllEventListeners
  const handleElementClick = (e: Event) => {
    if (!isEditMode) return;
    const element = e.currentTarget as HTMLElement;
    const editorId = element.getAttribute("data-editor-id");
    if (editorId) {
      selectElement(editorId);
      handleElementSelection(element);
    }
  };

  const handleDocumentClick = (e: Event) => {
    if (!isEditMode) return;
    const target = e.target as HTMLElement;
    if (
      !target.hasAttribute("data-editable") &&
      !target.closest('[data-toolbar="true"]')
    ) {
      if (
        editorState.selectedElement &&
        editorState.selectedElement.hasAttribute("data-editable-text")
      ) {
        editorState.selectedElement.contentEditable = "false";
      }
      dispatch({ type: "SET_SELECTED_ELEMENT", value: null });
    }
  };

  const handleElementInput = (e: Event) => {
    if (!isEditMode || editorState.isApplyingChanges) return;
    const element = e.target as HTMLElement;
    const editorId = element.getAttribute("data-editor-id");
    if (editorId) {
      recordChange(editorId, "content", "innerHTML", element.innerHTML);
    }
  };

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
  const handleSelectionChange = (e: Event) => {
    if (!isEditMode) return;
  };

  // Move recordChange and checkActiveFormats above addAllEventListeners and handler declarations
  const recordChange = useCallback(
    (
      targetId: string,
      type: EditorChange["type"],
      name: string,
      value: string
    ) => {
      if (editorState.isApplyingChanges) return;
      dispatch({
        type: "ADD_PENDING_CHANGE",
        value: { targetId, type, payload: { name, value } },
      });
    },
    [editorState.isApplyingChanges]
  );

  // Centralized add event listeners
  const addAllEventListeners = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;
    const editableElements = doc.querySelectorAll('[data-editable="true"]');

    // Create handlers if not already
    if (!eventHandlersRef.current) {
      eventHandlersRef.current = {
        handleElementClick,
        handleDocumentClick,
        handleElementInput,
        handleMouseEnter,
        handleMouseLeave,
        handleElementBlur,
        handleSelectionChange,
      };
    }
    const handlers = eventHandlersRef.current;
    if (!handlers) return;

    editableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      if (!(htmlElement as any).__clickListenerAttached) {
        htmlElement.addEventListener("click", handlers.handleElementClick);
        (htmlElement as any).__clickListenerAttached = true;
      }
      if (htmlElement.hasAttribute("data-editable-text")) {
        htmlElement.addEventListener("input", handlers.handleElementInput);
      }
      htmlElement.addEventListener("mouseenter", handlers.handleMouseEnter);
      htmlElement.addEventListener("mouseleave", handlers.handleMouseLeave);
      htmlElement.addEventListener("blur", handlers.handleElementBlur);
    });

    if (typeof handlers.handleDocumentClick === "function") {
      doc.addEventListener("click", handlers.handleDocumentClick);
    }
    if (typeof handlers.handleSelectionChange === "function") {
      doc.addEventListener("selectionchange", handlers.handleSelectionChange);
    }
  }, [
    isEditMode,
    editorState.isApplyingChanges,
    editorState.selectedElement,
    recordChange,
    selectElement,
  ]);

  // Centralized remove event listeners
  const removeAllEventListeners = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;
    const editableElements = doc.querySelectorAll('[data-editable="true"]');
    const handlers = eventHandlersRef.current;
    if (!handlers) return;

    editableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.removeEventListener("click", handlers.handleElementClick);
      (htmlElement as any).__clickListenerAttached = false;
      if (htmlElement.hasAttribute("data-editable-text")) {
        htmlElement.removeEventListener("input", handlers.handleElementInput);
      }
      htmlElement.removeEventListener("mouseenter", handlers.handleMouseEnter);
      htmlElement.removeEventListener("mouseleave", handlers.handleMouseLeave);
      htmlElement.removeEventListener("blur", handlers.handleElementBlur);
      htmlElement.classList.remove("hover-active", "focus-active");
    });
    if (typeof handlers.handleDocumentClick === "function") {
      doc.removeEventListener("click", handlers.handleDocumentClick);
    }
    if (typeof handlers.handleSelectionChange === "function") {
      doc.removeEventListener(
        "selectionchange",
        handlers.handleSelectionChange
      );
    }
  }, []);

  // useEffect to add/remove listeners based on iframeReady and isEditMode
  useEffect(() => {
    if (editorState.iframeReady && isEditMode) {
      makeElementsEditable();
      addAllEventListeners();
    } else if (editorState.iframeReady && !isEditMode) {
      removeAllEventListeners();
      // Set all contentEditable to false when leaving edit mode
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const editableElements = iframe.contentDocument.querySelectorAll(
          '[data-editable-text="true"]'
        );
        editableElements.forEach((el) => {
          (el as HTMLElement).contentEditable = "false";
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState.iframeReady, isEditMode]);

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

    if (
      editorState.selectedElement &&
      editorState.selectedElement !== element
    ) {
      if (editorState.selectedElement.hasAttribute("data-editable-text")) {
        editorState.selectedElement.contentEditable = "false";
      }
    }

    dispatch({ type: "SET_SELECTED_ELEMENT", value: element });

    if (!iframe) return;
    if (
      iframe &&
      iframe.contentDocument &&
      element.hasAttribute("data-editable-text")
    ) {
      // Add focus-active to the selected editable element
      element.classList.add("focus-active");
    }

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
    }
  };

  // Move currentHoveredElement above its first use
  let currentHoveredElement: HTMLElement | null = null;

  // Move makeElementsEditable above its first use
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
      "h1, h2, h3, h4, h5, h6, p, span, li, button, a, img";
    const selectableElements = doc.querySelectorAll(selectableElementsSelector);

    selectableElements.forEach((el) => {
      if (el.closest("script, style, noscript")) return;

      const htmlEl = el as HTMLElement;
      const tagNameLower = htmlEl.tagName.toLowerCase();

      // Only assign a new editorId if not already present
      let editorId = htmlEl.getAttribute("data-editor-id");
      if (!editorId) {
        editorId = crypto.randomUUID();
        htmlEl.setAttribute("data-editor-id", editorId);
        // Store tagName in Zustand elements map
        if (textEditableTags.has(tagNameLower)) {
          addEditorElement(editorId, tagNameLower);
        }
      }

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

  // Poll preview endpoint until ready
  useEffect(() => {
    let cancelled = false;
    if (!url) return;
    dispatch({ type: "SET_IFRAME_READY", value: false });
    dispatch({ type: "SET_IFRAME_ERROR", value: null });
    const checkReady = async () => {
      try {
        const res = await fetch(`/api/preview/${url}/`, { method: "GET" });
        if (res.status === 200) {
          if (!cancelled) {
            dispatch({ type: "SET_IFRAME_READY", value: true });
            // Initialize editor after iframe is ready
            setTimeout(() => {
              if (!cancelled) initializeEditor();
            }, 500);
          }
        } else if (res.status === 202) {
          // Not ready, poll again
          setTimeout(checkReady, 1500);
        } else {
          const data = await res.json().catch(() => ({}));
          if (!cancelled)
            dispatch({
              type: "SET_IFRAME_ERROR",
              value: data.error || `Error: ${res.status}`,
            });
        }
      } catch (err: any) {
        if (!cancelled)
          dispatch({
            type: "SET_IFRAME_ERROR",
            value: err.message || "Unknown error",
          });
      }
    };
    checkReady();
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Add event listener for iframe load
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      // Initialize editor when iframe loads
      if (editorState.iframeReady) {
        initializeEditor();
      }
    };

    iframe.addEventListener("load", handleIframeLoad);

    return () => {
      iframe.removeEventListener("load", handleIframeLoad);
    };
  }, [editorState.iframeReady]);

  // Sync className from store to DOM
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const els = elements as Record<string, EditorElement>;
    Object.entries(els).forEach(([id, { className }]) => {
      const el = iframe.contentDocument!.querySelector(
        `[data-editor-id='${id}']`
      );
      if (el) {
        // Only set className if the store has a non-empty value
        if (typeof className === "string" && className.trim() !== "") {
          el.className += " " + className;
        }
        // If className is empty, undefined, or null, do nothing (preserve existing classes)
      }
    });
  }, [elements, editorState.iframeReady]);

  if (!editorState.iframeReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-3xl p-8">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-medium mb-2">Website Preview</h3>
          <p className="text-gray-500 mb-4">Loading website preview...</p>
          <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full gap-4 rounded-3xl">
      <div className="relative w-full h-full overflow-hidden">
        {editorState.iframeError && (
          <div className="w-full h-full bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <p className="mb-2 text-red-500">{editorState.iframeError}</p>
            </div>
          </div>
        )}
        {!editorState.iframeReady && (
          <div className="w-full h-full bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

              <p className="text-gray-600 font-medium">
                Waiting for website to be ready...
              </p>

              {/* Simple animated dots */}
              <div className="flex justify-center space-x-1 mt-3">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        {editorState.iframeReady && (
          <iframe
            ref={iframeRef}
            key={`url-${url}`}
            src={`http://localhost:3000/api/preview/${url}`}
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts"
          />
        )}
      </div>
    </div>
  );
}
