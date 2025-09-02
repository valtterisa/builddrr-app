"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState, useReducer } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  useEditorStore,
  addEditorElement,
  buildClassName,
  replaceClassInGroup,
} from "@/lib/editor-store";
import { useChatStreamStore } from "@/lib/chat-stream-store";
import type { EditorState, EditorElement } from "@/lib/editor-store";
import { deploySandboxAndStopExisting } from "@/lib/vercel/vercel";
import { Monitor, RefreshCw, Smartphone } from "lucide-react";

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
  // Sandbox state
  sandboxUrl: string | null;
  sandboxId: string | null;
  isSandboxLoading: boolean;
  sandboxError: string | null;
  deploymentStep: string;
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
  | { type: "SET_ACTIVE_TEXT_COLOR"; value: string | null }
  | { type: "SET_SANDBOX_URL"; value: string | null }
  | { type: "SET_SANDBOX_ID"; value: string | null }
  | { type: "SET_SANDBOX_LOADING"; value: boolean }
  | { type: "SET_SANDBOX_ERROR"; value: string | null }
  | { type: "SET_DEPLOYMENT_STEP"; value: string };

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
  // Sandbox state
  sandboxUrl: null,
  sandboxId: null,
  isSandboxLoading: true,
  sandboxError: null,
  deploymentStep: "Initializing...",
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
    case "SET_SANDBOX_URL":
      return { ...state, sandboxUrl: action.value };
    case "SET_SANDBOX_ID":
      return { ...state, sandboxId: action.value };
    case "SET_SANDBOX_LOADING":
      return { ...state, isSandboxLoading: action.value };
    case "SET_SANDBOX_ERROR":
      return { ...state, sandboxError: action.value };
    case "SET_DEPLOYMENT_STEP":
      return { ...state, deploymentStep: action.value };
    default:
      return state;
  }
}

export default function WebsitePreview({
  initialUrl,
  isEditMode,
  id,
}: IframeEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [iframeNonce, setIframeNonce] = useState(0);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [deploymentAttempted, setDeploymentAttempted] = useState(false);

  // Update URL when initialUrl changes (e.g., when deployment URL becomes available)
  useEffect(() => {
    if (initialUrl && initialUrl !== url) {
      console.log(
        "🔄 [WebsitePreview] Updating URL from:",
        url,
        "to:",
        initialUrl
      );
      setUrl(initialUrl);
    }
  }, [initialUrl, url]);
  const [editorState, dispatch] = useReducer(editorReducer, initialEditorState);

  const selectElement = useEditorStore((s: EditorState) => s.selectElement);
  const elements = useEditorStore((s: EditorState) => s.elements);
  const reloadTrigger = useEditorStore((s: EditorState) => s.reloadTrigger);
  const isLoading = useEditorStore((s: EditorState) => s.isLoading);
  const setLoading = useEditorStore((s: EditorState) => s.setLoading);

  // Chat streaming state and deployment URL from stream
  const isStreaming = useChatStreamStore((s) => s.isStreaming);
  const deploymentUrl = useChatStreamStore((s) => s.deploymentUrl);

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

  const previewUrl =
    url || editorState.sandboxUrl || deploymentUrl || initialUrl;
  const iframeSrc = previewUrl
    ? `${previewUrl}${previewUrl.includes("?") ? "&" : "?"}v=${iframeNonce}`
    : undefined;

  // Initialize sandbox deployment and polling
  const initializeSandbox = useCallback(async () => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    try {
      dispatch({ type: "SET_SANDBOX_LOADING", value: true });
      dispatch({ type: "SET_SANDBOX_ERROR", value: null });
      dispatch({
        type: "SET_DEPLOYMENT_STEP",
        value: "Creating sandbox environment...",
      });

      // Call the server action to deploy sandbox and stop existing sandbox if there is one.
      // We should probably have some flag to see if new files are in or user just went to dashboard and came in again.
      const { url, sandboxId } = await deploySandboxAndStopExisting(id);
      dispatch({ type: "SET_SANDBOX_ID", value: sandboxId });

      if (!isMounted) return;

      dispatch({
        type: "SET_DEPLOYMENT_STEP",
        value: "Waiting for sandbox to be ready...",
      });

      // Start polling for sandbox status
      pollInterval = setInterval(async () => {
        try {
          // Get sandbox status using the API route
          const statusResponse = await fetch("/api/sandbox-status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sandboxId, id }),
          });

          if (!statusResponse.ok) {
            throw new Error("Failed to fetch sandbox status");
          }

          const result = await statusResponse.json();

          if (result.success) {
            const status = result.status;

            if (isMounted) {
              if (status === "running") {
                dispatch({ type: "SET_SANDBOX_URL", value: result.url || url });
                dispatch({ type: "SET_SANDBOX_LOADING", value: false });
                clearInterval(pollInterval);
                toast({
                  title: "Sandbox Ready!",
                  description: "Your development environment is now available.",
                });
              } else if (status === "failed") {
                clearInterval(pollInterval);
                dispatch({
                  type: "SET_SANDBOX_ERROR",
                  value: "Sandbox deployment failed. Please try again.",
                });
                dispatch({ type: "SET_SANDBOX_LOADING", value: false });
              } else {
                // Update the step to show current status
                const statusMessages = {
                  pending: "Sandbox is being created...",
                  running: "Sandbox is starting up...",
                  stopping: "Sandbox is stopping...",
                  stopped: "Sandbox has stopped...",
                  failed: "Sandbox deployment failed",
                };
                dispatch({
                  type: "SET_DEPLOYMENT_STEP",
                  value:
                    statusMessages[status as keyof typeof statusMessages] ||
                    `Sandbox status: ${status}...`,
                });
              }
            }
          } else {
            throw new Error(result.error || "Failed to get sandbox status");
          }
        } catch (error) {
          // Error getting status, continue polling
          console.log("Error getting sandbox status, continuing to poll...");
          if (isMounted) {
            dispatch({
              type: "SET_DEPLOYMENT_STEP",
              value: "Checking sandbox status...",
            });
          }
        }
      }, 2000); // Poll every 2 seconds

      // Set a timeout to stop polling after 5 minutes
      setTimeout(
        () => {
          if (isMounted && editorState.isSandboxLoading) {
            clearInterval(pollInterval);
            dispatch({
              type: "SET_SANDBOX_ERROR",
              value: "Sandbox deployment timed out. Please try again.",
            });
            dispatch({ type: "SET_SANDBOX_LOADING", value: false });
          }
        },
        5 * 60 * 1000
      );
    } catch (error) {
      if (isMounted) {
        console.error("Failed to deploy sandbox:", error);
        dispatch({
          type: "SET_SANDBOX_ERROR",
          value:
            error instanceof Error ? error.message : "Failed to deploy sandbox",
        });
        dispatch({ type: "SET_SANDBOX_LOADING", value: false });
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [id]);

  // Retry function for sandbox deployment
  const retrySandbox = useCallback(() => {
    dispatch({ type: "SET_SANDBOX_ERROR", value: null });
    dispatch({ type: "SET_SANDBOX_LOADING", value: true });
    dispatch({ type: "SET_DEPLOYMENT_STEP", value: "Initializing..." });
    initializeSandbox();
  }, [initializeSandbox]);

  // Initialize sandbox on mount only if not streaming and no incoming deployment URL.
  // Add small delay to avoid racing with AI flow that will create/reuse sandbox and emit URL.
  useEffect(() => {
    if (!hasMounted) return;
    if (isStreaming) return; // AI flow will handle it and provide URL
    if (deploymentUrl) return; // URL will be used for preview
    if (editorState.sandboxUrl || editorState.sandboxError) return;

    const timer = setTimeout(() => {
      // Re-check before initializing to avoid races
      if (!useChatStreamStore.getState().isStreaming && !deploymentUrl) {
        initializeSandbox();
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [
    hasMounted,
    isStreaming,
    deploymentUrl,
    editorState.sandboxUrl,
    editorState.sandboxError,
    initializeSandbox,
  ]);

  // Function to reload the iframe
  const reloadIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe && previewUrl) {
      // Force reload via nonce bump to avoid cache and ensure latest build
      setIframeNonce((n) => n + 1);
    }
  }, [previewUrl]);

  const handleManualRefresh = useCallback(async () => {
    // Ask the server for the current status and URL; allow resolving by app id if sandboxId missing
    if (editorState.sandboxId || id) {
      try {
        const statusResponse = await fetch("/api/sandbox-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sandboxId: editorState.sandboxId, id }),
        });
        if (statusResponse.ok) {
          const result = await statusResponse.json();
          if (result.success && result.url) {
            if (result.url !== url) {
              setUrl(result.url);
              setIframeNonce((n) => n + 1);
            } else {
              reloadIframe();
            }
            toast({
              title: "Refreshing preview",
              description: "Reloading sandbox iframe",
            });
            return;
          }
        }
      } catch (e) {
        // fall through to generic path
      }
    }

    if (editorState.sandboxUrl || deploymentUrl) {
      reloadIframe();
      toast({
        title: "Refreshing preview",
        description: "Reloading sandbox iframe",
      });
    } else {
      toast({
        title: "Sandbox not ready",
        description: "Attempting to initialize sandbox...",
      });
      retrySandbox();
    }
  }, [
    editorState.sandboxId,
    editorState.sandboxUrl,
    deploymentUrl,
    reloadIframe,
    retrySandbox,
    toast,
    id,
    url,
  ]);

  // React to external reload triggers from the editor (e.g., after AI finishes)
  useEffect(() => {
    if (reloadTrigger > 0) {
      handleManualRefresh();
    }
  }, [reloadTrigger, handleManualRefresh]);

  // When deployment URL changes, stage it as pending and swap only when sandbox is running
  useEffect(() => {
    if (!deploymentUrl) return;
    setPendingUrl(deploymentUrl);
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/sandbox-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) return;
        const result = await res.json();
        if (
          !cancelled &&
          result?.success &&
          result.status === "running" &&
          result.url
        ) {
          // Only switch when running to avoid flashing a broken preview
          if (result.url !== url) {
            setUrl(result.url);
            setIframeNonce((n) => n + 1);
          } else {
            // Same URL, force refresh to pick up new build
            setIframeNonce((n) => n + 1);
          }
          setPendingUrl(null);
        }
      } catch (_) {
        // ignore one-off failures
      }
    };
    // Poll a few times quickly, then back off
    const i1 = setInterval(poll, 1500);
    const timeout = setTimeout(() => {
      clearInterval(i1);
      if (!cancelled && pendingUrl) {
        // If still pending after grace period, try one final poll
        poll();
      }
    }, 10000);
    return () => {
      cancelled = true;
      clearInterval(i1);
      clearTimeout(timeout);
    };
  }, [deploymentUrl, id, pendingUrl, url]);

  // Keep-alive ping while preview is visible to reduce auto-stop likelihood
  useEffect(() => {
    if (!url && !editorState.sandboxUrl) return;
    let isActive = true;
    const ping = async () => {
      try {
        await fetch("/api/sandbox-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, sandboxId: editorState.sandboxId }),
        });
      } catch (_) {}
    };
    const interval = setInterval(() => {
      if (isActive) ping();
    }, 60000); // 60s
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [id, url, editorState.sandboxUrl, editorState.sandboxId]);

  // If server ensures/returns a sandbox URL before write, trust it immediately when stream reports deployed
  // The hook already stores deploymentUrl from the stream, which flows here.

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    // Initialize editor when iframe loads
    // EDITOR DISABLED: if (editorState.iframeReady) {
    //   initializeEditor();
    // }
  }, [editorState.iframeReady]);

  // If we have no URL at all, show loading; otherwise always show the last working preview and overlay a status banner
  const showOnlyLoader = !previewUrl;

  // Adopt sandboxUrl as the active url if none is set yet
  useEffect(() => {
    if (!url && editorState.sandboxUrl) {
      setUrl(editorState.sandboxUrl);
    }
  }, [url, editorState.sandboxUrl]);

  // const getStorageKey = useCallback(() => `editorChanges-${url}`, [url]);

  // const applyStoredChanges = useCallback(() => {
  //   const iframe = iframeRef.current;
  //   if (!iframe || !iframe.contentDocument || editorState.isApplyingChanges)
  //     return;

  //   dispatch({ type: "SET_APPLYING_CHANGES", value: true });
  //   const storageKey = getStorageKey();
  //   const storedChangesJson = localStorage.getItem(storageKey);

  //   if (storedChangesJson) {
  //     try {
  //       const changes: EditorChange[] = JSON.parse(storedChangesJson);
  //       changes.forEach((change) => {
  //         const element = iframe.contentDocument?.querySelector(
  //           `[data-editor-id="${change.targetId}"]`
  //         ) as HTMLElement | null;
  //         if (element) {
  //           try {
  //             if (change.type === "style") {
  //               element.style.setProperty(
  //                 change.payload.name,
  //                 change.payload.value
  //               );
  //             } else if (change.type === "attribute") {
  //               element.setAttribute(change.payload.name, change.payload.value);
  //             } else if (change.type === "content") {
  //               element.innerHTML = change.payload.value;
  //             }
  //           } catch (applyError) {
  //             console.error(
  //               `Error applying change to ${change.targetId}:`,
  //               applyError,
  //               change
  //             );
  //           }
  //         } else {
  //           console.warn(
  //             `Element with ID ${change.targetId} not found for applying change.`
  //           );
  //         }
  //       });
  //     } catch (e) {
  //       console.error("Error parsing or applying stored changes:", e);
  //       localStorage.removeItem(storageKey);
  //     }
  //   }
  //   dispatch({ type: "SET_APPLYING_CHANGES", value: false });
  // }, [getStorageKey, editorState.isApplyingChanges]);

  const injectEditorStyles = (doc: Document) => {
    let style = doc.getElementById(
      "editor-selection-styles"
    ) as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement("style");
      style.id = "editor-selection-styles";
      doc.head.appendChild(style);
    }
    style.textContent = `
      .editor-selected, .editor-hover {
        outline: 2px dotted #c078f3 !important;
        outline-offset: 2px !important;
        background: rgba(192, 120, 243, 0.08) !important;
      }
      /* Remove old outline when selected/hovered */
      .editor-selected.hover-active,
      .editor-hover.hover-active,
      .editor-selected.focus-active,
      .editor-hover.focus-active {
        outline: 2px dotted #c078f3 !important;
        box-shadow: none !important;
      }
      /* Hide old outline for all .editor-selected/.editor-hover */
      .editor-selected,
      .editor-hover {
        box-shadow: none !important;
      }
    `;
  };

  // EDITOR DISABLED: const initializeEditor = () => {
  // const iframe = iframeRef.current;
  // if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
  //   console.log("Iframe or contentDocument not available");
  //   return;
  // }

  // if (!iframe.contentDocument.body) {
  //   console.warn("iframe.contentDocument.body is null");
  //   return;
  // }

  // try {
  //   const existingStyle =
  //     iframe.contentDocument.getElementById("editor-styles");
  //   if (existingStyle) {
  //     existingStyle.remove();
  //   }

  //   const style = iframe.contentDocument.createElement("style");
  //   style.id = "editor-styles";
  //   style.textContent = `
  //     .editor-active [data-editable="true"] {
  //       cursor: pointer !important;
  //     }

  //     .editor-active [data-editable="true"].hover-active {
  //       outline: 2px dashed #7c3aed !important;
  //       outline-offset: 2px !important;
  //     }

  //     .editor-active [data-editable="true"].focus-active {
  //       outline: 2px dotted #7c3aed !important;
  //       outline-offset: 2px !important;
  //       box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1) !important;
  //     }

  //     .editor-active [data-editable="true"].hover-active::before {
  //        content: attr(data-editable-tag) !important;
  //        font-weight: 400 !important;
  //        position: absolute !important;
  //        top: -20px !important;
  //        left: 0 !important;
  //        background: rgba(124, 58, 237, 0.9) !important;
  //        color: white !important;
  //        padding: 2px 6px !important;
  //        border-radius: 4px !important;
  //        font-size: 10px !important;
  //        pointer-events: none !important;
  //        z-index: 1000 !important;
  //     }

  //     .editor-active [data-editable="true"]::before {
  //        pointer-events: none !important;
  //        content: attr(data-editable-tag) !important;
  //        font-weight: 400 !important;
  //        position: absolute !important;
  //        top: -20px !important;
  //        left: 0 !important;
  //        background: rgba(124, 58, 237, 0.9) !important;
  //        color: white !important;
  //        padding: 2px 6px !important;
  //        border-radius: 4px !important;
  //        font-size: 10px !important;
  //        z-index: 1000 !important;
  //     }
  //   `;
  //   iframe.contentDocument.head.appendChild(style);

  //   injectEditorStyles(iframe.contentDocument);

  //   applyStoredChanges();
  //   makeElementsEditable();

  //   if (isEditMode) {
  //     iframe.contentDocument.body.classList.add("editor-active");
  //     addAllEventListeners();
  //     // Add selection change listener here as well for initial load
  //     if (
  //       typeof eventHandlersRef.current?.handleSelectionChange === "function"
  //     ) {
  //       iframe.contentDocument.addEventListener(
  //         "selectionchange",
  //         eventHandlersRef.current.handleSelectionChange
  //       );
  //     }
  //   } else {
  //     iframe.contentDocument.body.classList.remove("editor-active");
  //   }
  // } catch (error) {
  //   console.error("Error initializing editor:", error);

  //   toast({
  //     title: "Editor Initialization Error",
  //     description: "Could not initialize editor. Try reloading the page.",
  //     variant: "destructive",
  //   });
  // }
  // };

  // EDITOR DISABLED: // Move all handler function declarations above addAllEventListeners
  // const handleElementClick = (e: Event) => {
  //   if (!isEditMode) return;
  //   const element = e.currentTarget as HTMLElement;
  //   const editorId = element.getAttribute("data-editor-id");
  //   if (editorId) {
  //     selectElement(editorId);
  //     handleElementSelection(element);
  //   }
  // };

  // EDITOR DISABLED: const handleDocumentClick = (e: Event) => {
  //   if (!isEditMode) return;
  //   const target = e.target as HTMLElement;
  //   if (
  //     !target.hasAttribute("data-editable") &&
  //     !target.closest('[data-toolbar="true"]')
  //   ) {
  //     if (
  //       editorState.selectedElement &&
  //       editorState.selectedElement.hasAttribute("data-editable-text")
  //     ) {
  //       editorState.selectedElement.contentEditable = "false";
  //     }
  //     dispatch({ type: "SET_SELECTED_ELEMENT", value: null });
  //   }
  // };

  // EDITOR DISABLED: const handleElementInput = (e: Event) => {
  //   if (!isEditMode || editorState.isApplyingChanges) return;
  //   const element = e.target as HTMLElement;
  //   const editorId = element.getAttribute("data-editor-id");
  //   if (editorId) {
  //     recordChange(editorId, "content", "innerHTML", element.innerHTML);
  //   }
  // };

  // EDITOR DISABLED: const handleMouseEnter = (e: Event) => {
  //   const htmlEl = e.currentTarget as HTMLElement;
  //   if (currentHoveredElement && currentHoveredElement !== htmlEl) {
  //     currentHoveredElement.classList.remove("hover-active");
  //   }
  //   htmlEl.classList.add("hover-active");
  //   currentHoveredElement = htmlEl;
  // };
  // const handleMouseLeave = (e: Event) => {
  //   const htmlEl = e.currentTarget as HTMLElement;
  //   htmlEl.classList.remove("hover-active");
  //   if (currentHoveredElement === htmlEl) {
  //     currentHoveredElement = null;
  //   }
  // };
  // const handleElementBlur = (e: Event) => {
  //   const htmlEl = e.currentTarget as HTMLElement;
  //   htmlEl.classList.remove("focus-active");
  // };
  // const handleSelectionChange = (e: Event) => {
  //   if (!isEditMode) return;
  // };

  // EDITOR DISABLED: // Move recordChange and checkActiveFormats above addAllEventListeners and handler declarations
  // const recordChange = useCallback(
  //   (
  //     targetId: string,
  //     type: EditorChange["type"],
  //     name: string,
  //     value: string
  //   ) => {
  //     if (editorState.isApplyingChanges) return;
  //     dispatch({
  //       type: "ADD_PENDING_CHANGE",
  //       value: { targetId, type, payload: { name, value } },
  //     });
  //   },
  //   [editorState.isApplyingChanges]
  // );

  // EDITOR DISABLED: // Centralized add event listeners
  // const addAllEventListeners = useCallback(() => {
  //   const iframe = iframeRef.current;
  //   if (!iframe || !iframe.contentDocument) return;
  //   const doc = iframe.contentDocument;
  //   const editableElements = doc.querySelectorAll('[data-editable="true"]');

  //   // Create handlers if not already
  //   if (!eventHandlersRef.current) {
  //     eventHandlersRef.current = {
  //       handleElementClick,
  //       handleDocumentClick,
  //       handleElementInput,
  //       handleMouseEnter,
  //       handleMouseLeave,
  //       handleElementBlur,
  //       handleSelectionChange,
  //     };
  //   }
  //   const handlers = eventHandlersRef.current;
  //   if (!handlers) return;

  //   editableElements.forEach((element) => {
  //     const htmlElement = element as HTMLElement;
  //     if (!(htmlElement as any).__clickListenerAttached) {
  //       htmlElement.addEventListener("click", handlers.handleElementClick);
  //       (htmlElement as any).__clickListenerAttached = true;
  //       }
  //     if (htmlElement.hasAttribute("data-editable-text")) {
  //       htmlElement.addEventListener("input", handlers.handleElementInput);
  //     }
  //     htmlElement.addEventListener("mouseenter", handlers.handleMouseEnter);
  //     htmlElement.addEventListener("mouseleave", handlers.handleMouseLeave);
  //     htmlElement.addEventListener("blur", handlers.handleElementBlur);
  //   });

  //   if (typeof handlers.handleDocumentClick === "function") {
  //     doc.addEventListener("click", handlers.handleDocumentClick);
  //   }
  //   if (typeof handlers.handleSelectionChange === "function") {
  //     doc.addEventListener("selectionchange", handlers.handleSelectionChange);
  //   }
  // }, [
  //   isEditMode,
  //   editorState.isApplyingChanges,
  //   editorState.selectedElement,
  //   recordChange,
  //   selectElement,
  // ]);

  // EDITOR DISABLED: // Centralized remove event listeners
  // const removeAllEventListeners = useCallback(() => {
  //   const iframe = iframeRef.current;
  //   if (!iframe || !iframe.contentDocument) return;
  //   const doc = iframe.contentDocument;
  //   const editableElements = doc.querySelectorAll('[data-editable="true"]');
  //   const handlers = eventHandlersRef.current;
  //   if (!handlers) return;

  //   editableElements.forEach((element) => {
  //     const htmlElement = element as HTMLElement;
  //     htmlElement.removeEventListener("click", handlers.handleElementClick);
  //     (htmlElement as any).__clickListenerAttached = false;
  //     if (htmlElement.hasAttribute("data-editable-text")) {
  //       htmlElement.removeEventListener("input", handlers.handleElementInput);
  //     }
  //     htmlElement.removeEventListener("mouseenter", handlers.handleMouseEnter);
  //     htmlElement.removeEventListener("mouseleave", handlers.handleMouseLeave);
  //     htmlElement.removeEventListener("blur", handlers.handleElementBlur);
  //     htmlElement.classList.remove("hover-active", "focus-active");
  //   });
  //   if (typeof handlers.handleDocumentClick === "function") {
  //     doc.removeEventListener("click", handlers.handleDocumentClick);
  //   }
  //   if (typeof handlers.handleSelectionChange === "function") {
  //     doc.removeEventListener(
  //       "selectionchange",
  //       handlers.handleSelectionChange
  //     );
  //   }
  // }, []);

  // EDITOR DISABLED: // useEffect to add/remove listeners based on iframeReady and isEditMode
  // useEffect(() => {
  //   if (editorState.iframeReady && isEditMode) {
  //     makeElementsEditable();
  //     addAllEventListeners();
  //   } else if (editorState.iframeReady && !isEditMode) {
  //     removeAllEventListeners();
  //     // Set all contentEditable to false when leaving edit mode
  //     const iframe = iframeRef.current;
  //     if (iframe && iframe.contentDocument) {
  //       const editableElements = iframe.contentDocument.querySelectorAll(
  //         '[data-editable-text="true"]'
  //       );
  //       editableElements.forEach((el) => {
  //         (el as HTMLElement).contentEditable = "false";
  //       });
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [editorState.iframeReady, isEditMode]);

  // EDITOR DISABLED: // Helper to add/remove tag badge
  // function addTagBadge(element: HTMLElement, tag: string) {
  //   if (element.querySelector(".editor-tag-badge")) return;
  //   const badge = document.createElement("div");
  //   badge.className = "editor-tag-badge";
  //   badge.textContent = tag;
  //   badge.style.position = "absolute";
  //   badge.style.top = "-18px";
  //   badge.style.left = "0";
  //   badge.style.background = "#c078f3";
  //   badge.style.color = "#fff";
  //   badge.style.fontSize = "11px";
  //   badge.style.fontWeight = "bold";
  //   badge.style.padding = "2px 8px";
  //   badge.style.borderRadius = "6px";
  //   badge.style.zIndex = "1001";
  //   badge.style.pointerEvents = "none";
  //   badge.style.boxShadow = "0 1px 4px 0 rgba(0,0,0,0.04)";
  //   if (getComputedStyle(element).position === "static") {
  //     element.style.position = "relative";
  //   }
  //   element.appendChild(badge);
  // }
  // function removeTagBadge(element: HTMLElement) {
  //   const badge = element.querySelector(".editor-tag-badge");
  //   if (badge) badge.remove();
  // }

  // EDITOR DISABLED: // Update handleElementSelection to add the badge
  // const handleElementSelection = (element: HTMLElement) => {
  //   if (!isEditMode || !element) return;
  //   const iframe = iframeRef.current;
  //   if (iframe && iframe.contentDocument) {
  //     const allEditable = iframe.contentDocument.querySelectorAll(
  //       '[data-editable-text="true"]'
  //     );
  //     allEditable.forEach((s) => {
  //       const el = s as HTMLElement;
  //       el.classList.remove("editor-selected");
  //       el.classList.remove("hover-active");
  //       el.classList.remove("focus-active");
  //       removeTagBadge(el);
  //     });
  //   }
  //   if (
  //     editorState.selectedElement &&
  //     editorState.selectedElement !== element
  //   ) {
  //     if (editorState.selectedElement.hasAttribute("data-editable-text")) {
  //       editorState.selectedElement.contentEditable = "false";
  //       removeTagBadge(editorState.selectedElement);
  //     }
  //   }
  //   dispatch({ type: "SET_SELECTED_ELEMENT", value: element });
  //   if (!iframe) return;
  //   if (
  //     iframe &&
  //     iframe.contentDocument &&
  //     element.hasAttribute("data-editable-text")
  //   ) {
  //     element.classList.add("editor-selected");
  //       addTagBadge(element, element.tagName.toLowerCase());
  //     }
  //   if (element.tagName !== "IMG") {
  //     if (element.hasAttribute("data-editable-text")) {
  //       element.contentEditable = "true";
  //     } else {
  //       element.contentEditable = "false";
  //     }
  //     setAllTextEditable(element);
  //     iframe?.contentWindow?.focus();
  //     element.focus();
  //     const selection = iframe?.contentWindow?.getSelection();
  //     if (selection && selection.rangeCount === 0) {
  //       const range = iframe.contentDocument!.createRange();
  //       range.selectNodeContents(element);
  //       selection.removeAllRanges();
  //       selection.addRange(range);
  //     }
  //   } else {
  //     element.contentEditable = "false";
  //   }
  // };

  // Move currentHoveredElement above its first use
  let currentHoveredElement: HTMLElement | null = null;

  // EDITOR DISABLED: // Move makeElementsEditable above its first use
  // const makeElementsEditable = () => {
  //   const iframe = iframeRef.current;
  //   if (!iframe || !iframe.contentDocument) return;
  //   const doc = iframe.contentDocument;
  //   injectEditorStyles(doc);
  //   const textEditableTags = new Set([
  //     "h1",
  //     "h2",
  //     "h3",
  //     "h4",
  //     "h5",
  //     "h6",
  //     "p",
  //     "span",
  //     "li",
  //     "button",
  //     "a",
  //   ]);
  //   const selectableElementsSelector =
  //     "h1, h2, h3, h4, h5, h6, p, span, li, button, a, img";
  //   const selectableElements = doc.querySelectorAll(selectableElementsSelector);

  //   selectableElements.forEach((el) => {
  //     if (el.closest("script, style, noscript")) return;

  //     const htmlEl = el as HTMLElement;
  //     const tagNameLower = htmlEl.tagName.toLowerCase();

  //     // Only assign a new editorId if not already present
  //     let editorId = htmlEl.getAttribute("data-editor-id");
  //     if (!editorId) {
  //       editorId = crypto.randomUUID();
  //       htmlEl.setAttribute("data-editor-id", editorId);
  //       // Store tagName in Zustand elements map
  //       if (textEditableTags.has(tagNameLower)) {
  //         addEditorElement(editorId, tagNameLower);
  //       }
  //     }

  //     htmlEl.setAttribute("data-editable", "true");
  //     htmlEl.setAttribute("data-editable-tag", tagNameLower);

  //     if (textEditableTags.has(tagNameLower)) {
  //       htmlEl.setAttribute("data-editable-type", "text");
  //       htmlEl.contentEditable = "false";
  //       htmlEl.setAttribute("data-editable-text", "true");
  //       htmlEl.draggable = false;
  //     } else {
  //       htmlEl.setAttribute(
  //         "data-editable-type",
  //         tagNameLower === "img" ? "image" : "block"
  //       );
  //       htmlEl.contentEditable = "false";
  //     }

  //     htmlEl.addEventListener("blur", handleElementBlur);

  //     (htmlEl as any).__clickListenerAttached = false;
  //   });

  //   // Update hover listeners in makeElementsEditable for tag badge logic
  //   const hoverableElements = doc.querySelectorAll(
  //     "h1, h2, h3, h4, h5, h6, p, span, li, button, a, img"
  //   );
  //   hoverableElements.forEach((el) => {
  //     const htmlEl = el as HTMLElement;
  //     htmlEl.addEventListener("mouseenter", () => {
  //       if (isEditMode && !htmlEl.classList.contains("editor-selected")) {
  //         htmlEl.classList.remove("hover-active");
  //         htmlEl.classList.remove("focus-active");
  //         htmlEl.classList.add("editor-hover");
  //         addTagBadge(htmlEl, htmlEl.tagName.toLowerCase());
  //       }
  //     });
  //     htmlEl.addEventListener("mouseleave", () => {
  //         htmlEl.classList.remove("editor-hover");
  //         // Only remove the badge if this is not the selected element
  //         if (!htmlEl.classList.contains("editor-selected")) {
  //           removeTagBadge(htmlEl);
  //         }
  //       });
  //     });
  //   };

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

  // EDITOR DISABLED: // Poll for preview when AI stops streaming or on page load/refresh
  // useEffect(() => {
  //   if (!hasMounted) return;

  //   // Reset state when starting new poll
  //   dispatch({ type: "SET_IFRAME_READY", value: false });
  //   dispatch({ type: "SET_IFRAME_ERROR", value: null });

  //   // Start polling
  // }, [hasMounted, isStreaming, reloadTrigger]);

  // EDITOR DISABLED: // Add event listener for iframe load
  // useEffect(() => {
  //   const iframe = iframeRef.current;
  //   if (!iframe) return;

  //   iframe.addEventListener("load", handleIframeLoad);

  //   return () => {
  //     iframe.removeEventListener("load", handleIframeLoad);
  //   };
  // }, [handleIframeLoad]);

  // EDITOR DISABLED: useEffect(() => {
  //   const iframe = iframeRef.current;
  //   if (!iframe || !iframe.contentDocument) return;
  //   const els = elements as Record<string, EditorElement>;
  //   Object.entries(els).forEach(([id, element]) => {
  //     const el = iframe.contentDocument!.querySelector(
  //       `[data-editor-id='${id}']`
  //     );
  //     if (el) {
  //       // Merge style-generated classes and custom/manual classes
  //       const styleClasses = buildClassName(element);
  //       const customClasses = element.className || "";
  //       const merged = (styleClasses + " " + customClasses).trim();
  //       if (merged) {
  //         el.className = merged;
  //       }
  //     }
  //   });
  // }, [elements, editorState.iframeReady]);

  // EDITOR DISABLED: // Remove highlight from all elements when edit mode is turned off
  // useEffect(() => {
  //   if (!isEditMode) {
  //     const iframe = iframeRef.current;
  //     if (iframe && iframe.contentDocument) {
  //       const allEditable = iframe.contentDocument.querySelectorAll(
  //         '[data-editable-text="true"]'
  //       );
  //       allEditable.forEach((s) => {
  //         const el = s as HTMLElement;
  //         el.classList.remove("editor-selected");
  //         el.classList.remove("editor-hover");
  //         removeTagBadge(el);
  //       });
  //     }
  //   }
  // }, [isEditMode]);

  // EDITOR DISABLED: // Add this effect to sync DOM className to store on selection
  // useEffect(() => {
  //   if (!editorState.selectedElement) return;
  //   const el = editorState.selectedElement;
  //   const editorId = el.getAttribute("data-editor-id");
  //   if (!editorId) return;
  //   const className = el.className || "";
  //   useEditorStore.getState().setElementClass(editorId, className);
  // }, [editorState.selectedElement]);

  // EDITOR DISABLED: // Reload iframe when trigger changes
  // useEffect(() => {
  //   console.log("🔍 [WebsitePreview] Reload trigger effect:", {
  //     reloadTrigger,
  //     hasReloadIframe: !!reloadIframe,
  //     hasSetLoading: !!setLoading,
  //     previewUrl,
  //   });

  //   if (reloadTrigger > 0) {
  //     console.log(
  //       "🔄 [WebsitePreview] Reload trigger detected, reloading iframe"
  //     );
  //     setLoading(true);

  //     // Reset iframe ready state to force re-initialization
  //     dispatch({ type: "SET_IFRAME_READY", value: false });
  //     dispatch({ type: "SET_IFRAME_ERROR", value: null });

  //       reloadIframe();

  //     // Clear loading after a short delay to allow iframe to load
  //     const timer = setTimeout(() => {
  //       console.log("🔄 [WebsitePreview] Clearing loading state");
  //       setLoading(false);
  //     }, 3000); // Increased timeout for better reliability

  //     return () => clearTimeout(timer);
  //   }
  // }, [reloadTrigger, reloadIframe, setLoading, previewUrl]);

  // if (!editorState.iframeReady) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-3xl p-8">
  //       <div className="text-center max-w-md">
  //         <h3 className="text-xl font-medium mb-2">Website Preview</h3>
  //         <p className="text-gray-500 mb-4">
  //           {editorState.iframeError
  //             ? `Error loading preview: ${editorState.iframeError}`
  //             : "Your website is being generated. The preview will appear here once it's ready."}
  //         </p>
  //         <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col h-full w-full gap-4 rounded-3xl">
      <div className="relative w-full h-full overflow-hidden flex flex-col">
        <div className="w-full h-full bg-white rounded-t-lg shadow-lg overflow-hidden border border-gray-200 flex flex-col min-h-0">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600 border border-gray-200 truncate">
                {pendingUrl
                  ? `${previewUrl || "/"} → (updating...)`
                  : previewUrl || "/"}
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <Button
                  size="sm"
                  variant={viewport === "desktop" ? "default" : "secondary"}
                  onClick={() => setViewport("desktop")}
                >
                  <Monitor />
                </Button>
                <Button
                  size="sm"
                  variant={viewport === "mobile" ? "default" : "secondary"}
                  onClick={() => setViewport("mobile")}
                >
                  <Smartphone />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleManualRefresh}
                >
                  <RefreshCw />
                </Button>
              </div>
            </div>
          </div>

          <div className="relative flex-1 min-h-0">
            {showOnlyLoader ? (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center max-w-md">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-500 mb-1">Preparing preview...</p>
                  <p className="text-gray-600 text-sm">
                    {editorState.deploymentStep}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-start justify-center overflow-auto custom-scrollbar">
                <div
                  className={`${
                    viewport === "mobile" ? "h-full w-[390px]" : "h-full w-full"
                  } transition-[width] duration-300 ease-in-out`}
                >
                  <iframe
                    ref={iframeRef}
                    key={iframeSrc || "preview"}
                    src={iframeSrc}
                    className="w-full h-full border-0 focus:outline-none"
                    onError={() => {
                      console.error("Failed to load preview");
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
