"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { ComponentLibrary } from "@/components/component-library";
import { ColorPicker } from "@/components/editor/color-picker";
import { ImageEditor } from "@/components/editor/image-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Save,
  Eye,
  Code,
  Layers,
  Settings,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Copy,
  Undo,
  Redo,
  Smartphone,
  Tablet,
  Monitor,
  Menu,
  PanelLeft,
  PanelRight,
  Download,
  Upload,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Image,
  PaintBucket,
  BoxIcon as ButtonIcon,
  WandSparkles,
  Rocket,
} from "lucide-react";

import type { ComponentType } from "@/components/component-library";
import { useMobile } from "@/hooks/use-mobile";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WebsitePreview } from "./website-preview";
import { FileTracker } from "@/lib/file-tracker";
import { VirtualFileSystem } from "@/lib/virtual-fs";

type ViewportSize = "desktop" | "tablet" | "mobile";
type EditModeType = "text" | "color" | "image" | "hover-color" | null;

// Define a new interface for button hover state
interface ButtonHoverState {
  element: HTMLButtonElement;
  normalClass: string;
  hoverClass: string;
}

// Define the structure for component edits
interface ComponentEdit {
  componentId: string;
  elementSelector: string; // CSS selector to find the element
  editType: "text" | "color" | "image" | "style";
  originalValue: string;
  currentValue: string;
  timestamp: number;
}

// Define the structure for the project data
interface ProjectData {
  components: ComponentType[];
  edits: ComponentEdit[];
  lastSaved: number;
}

// Add to the EditableField interface
interface EditableField {
  element: HTMLElement;
  type: "text" | "color" | "image" | "button";
  id: string;
  label: string;
  value: string;
  hoverState?: ButtonHoverState;
}

const predefinedColors = [
  { name: "Primary", value: "#3b82f6" },
  { name: "Secondary", value: "#6b7280" },
  { name: "Success", value: "#10b981" },
  { name: "Danger", value: "#ef4444" },
  { name: "Warning", value: "#f59e0b" },
  { name: "Info", value: "#3b82f6" },
  { name: "Dark", value: "#1f2937" },
  { name: "Light", value: "#f3f4f6" },
];

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
}

// Create a simplified version first to ensure exports work correctly
export function WebsiteEditor() {
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<
    number | null
  >(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [editMode, setEditMode] = useState<EditModeType>(null);
  const [history, setHistory] = useState<ComponentType[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [componentEdits, setComponentEdits] = useState<ComponentEdit[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [elementText, setElementText] = useState("");
  const [currentFile, setCurrentFile] = useState<string>("/index.html");
  const vfs = VirtualFileSystem.getInstance();
  const fileTracker = FileTracker.getInstance();

  // Update the editableFields state to include buttons
  const [editableFields, setEditableFields] = useState<{
    text: EditableField[];
    color: EditableField[];
    image: EditableField[];
    button: EditableField[];
  }>({
    text: [],
    color: [],
    image: [],
    button: [],
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const observerRef = useRef<MutationObserver | null>(null);
  const [editOptions, setEditOptions] = useState<EditOptions>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Initialize virtual file system
  useEffect(() => {
    vfs.loadFromLocalStorage();
  }, []);

  // Add this function to the component to force a refresh of editable elements
  const refreshEditableElements = () => {
    // Force a refresh of editable elements
    setTimeout(() => {
      makeElementsEditable();
      scanComponentForEditableFields();
    }, 200);
  };

  // Add component to the canvas
  const addComponent = (component: ComponentType) => {
    const newComponents = [...components, component];
    setComponents(newComponents);
    addToHistory(newComponents);

    // After adding a component, we need to make sure to mark its elements as editable
    refreshEditableElements();
  };

  // Remove component from the canvas
  const removeComponent = (index: number) => {
    const newComponents = components.filter((_, i) => i !== index);
    setComponents(newComponents);
    setSelectedComponentIndex(null);
    setEditableFields({ text: [], color: [], image: [], button: [] });
    addToHistory(newComponents);
  };

  // Move component up in the order
  const moveComponentUp = (index: number) => {
    if (index === 0) return;
    const newComponents = [...components];
    const temp = newComponents[index];
    newComponents[index] = newComponents[index - 1];
    newComponents[index - 1] = temp;
    setComponents(newComponents);
    setSelectedComponentIndex(index - 1);
    addToHistory(newComponents);
  };

  // Move component down in the order
  const moveComponentDown = (index: number) => {
    if (index === components.length - 1) return;
    const newComponents = [...components];
    const temp = newComponents[index];
    newComponents[index] = newComponents[index + 1];
    newComponents[index + 1] = temp;
    setComponents(newComponents);
    setSelectedComponentIndex(index + 1);
    addToHistory(newComponents);
  };

  // Duplicate component
  const duplicateComponent = (index: number) => {
    const newComponents = [...components];
    newComponents.splice(index + 1, 0, { ...components[index] });
    setComponents(newComponents);
    setSelectedComponentIndex(index + 1);
    addToHistory(newComponents);

    // After duplicating, make sure the new component's elements are editable
    refreshEditableElements();
  };

  // Scan the selected component for all editable fields
  const scanComponentForEditableFields = () => {
    if (!canvasRef.current || selectedComponentIndex === null) {
      setEditableFields({ text: [], color: [], image: [], button: [] });
      return;
    }

    // Get the component container
    const componentContainers = canvasRef.current.querySelectorAll(
      ".component-container"
    );
    if (
      !componentContainers ||
      componentContainers.length <= selectedComponentIndex
    ) {
      return;
    }

    const componentContainer = componentContainers[selectedComponentIndex];

    // Find all editable elements
    const textFields: EditableField[] = [];
    const colorFields: EditableField[] = [];
    const imageFields: EditableField[] = [];
    const buttonFields: EditableField[] = [];

    // Find text elements
    const textElements = componentContainer.querySelectorAll(
      '[data-editable="true"][data-editable-type="text"]'
    );
    textElements.forEach((el, index) => {
      const element = el as HTMLElement;

      // Skip buttons as they'll be handled separately
      if (element.tagName.toLowerCase() === "button") {
        return;
      }

      const tagName = element.tagName.toLowerCase();
      let label = `${tagName.charAt(0).toUpperCase() + tagName.slice(1)} ${
        index + 1
      }`;

      // Try to create a more descriptive label
      if (element.textContent) {
        const shortText = element.textContent.trim().substring(0, 20);
        label = shortText + (element.textContent.length > 20 ? "..." : "");
      }

      textFields.push({
        element,
        type: "text",
        id: `text-${index}`,
        label,
        value: element.innerHTML,
      });
    });

    // Find color elements
    const colorElements = componentContainer.querySelectorAll(
      '[data-editable="true"][data-editable-type="color"]'
    );
    colorElements.forEach((el, index) => {
      const element = el as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      // Skip buttons as they'll be handled separately
      if (tagName === "button") {
        return;
      }

      // Find background color class
      const bgClass = Array.from(element.classList).find((cls) =>
        cls.startsWith("bg-")
      );

      colorFields.push({
        element,
        type: "color",
        id: `color-${index}`,
        label: `${tagName} Background ${index + 1}`,
        value: bgClass || "",
      });
    });

    // Find image elements
    const imageElements = componentContainer.querySelectorAll(
      '[data-editable="true"][data-editable-type="image"]'
    );
    imageElements.forEach((el, index) => {
      const element = el as HTMLImageElement;

      imageFields.push({
        element,
        type: "image",
        id: `image-${index}`,
        label: `Image ${index + 1}`,
        value: element.src,
      });
    });

    // Find all buttons and make them editable with hover state
    const buttonElements = componentContainer.querySelectorAll("button");

    buttonElements.forEach((el, index) => {
      const element = el as HTMLButtonElement;

      // Extract current button classes
      const classList = Array.from(element.classList);
      const variantClass = classList.find(
        (cls) =>
          cls.startsWith("variant-") ||
          cls.includes("outline") ||
          cls.includes("default") ||
          cls.includes("secondary") ||
          cls.includes("destructive") ||
          cls.includes("ghost")
      );
      const bgClass = classList.find((cls) => cls.startsWith("bg-"));
      const hoverClass = classList.find((cls) => cls.startsWith("hover:bg-"));

      buttonFields.push({
        element,
        type: "button",
        id: `button-${index}`,
        label: `Button ${index + 1}`,
        value: element.textContent || `Button ${index + 1}`,
        hoverState: {
          element,
          normalClass: bgClass || variantClass || "",
          hoverClass: hoverClass || "",
        },
      });
    });

    // Add buttons to the editable fields
    setEditableFields({
      text: textFields,
      color: colorFields,
      image: imageFields,
      button: buttonFields,
    });
  };

  // Make elements in the canvas editable
  const makeElementsEditable = () => {
    if (!canvasRef.current) return;

    // First, handle all links specifically to ensure they're editable
    const linkElements = canvasRef.current.querySelectorAll("a");
    linkElements.forEach((el) => {
      el.setAttribute("data-editable", "true");
      el.setAttribute("data-editable-type", "text");
      el.classList.add("editable-element");

      // Add double-click event for inline editing
      el.addEventListener("dblclick", handleDoubleClick);

      // Prevent navigation when in edit mode
      el.addEventListener("click", (e) => {
        if (isEditing || e.target === selectedElement) {
          e.preventDefault();
        }
      });
    });

    // Handle all buttons specifically
    const buttonElements = canvasRef.current.querySelectorAll("button");
    buttonElements.forEach((el) => {
      // Make it editable for both text and as a button
      el.setAttribute("data-editable", "true");
      el.setAttribute("data-editable-type", "text");
      el.setAttribute("data-is-button", "true"); // Add this attribute to identify buttons
      el.classList.add("editable-element");

      // Add double-click event for inline editing
      el.addEventListener("dblclick", handleDoubleClick);

      // Prevent button action when in edit mode
      el.addEventListener("click", (e) => {
        if (isEditing || e.target === selectedElement) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    });

    // Find all other text elements and make them editable
    const textElements = canvasRef.current.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, span, li, label, div"
    );
    textElements.forEach((el) => {
      // Only make it editable if it has text content and no editable children
      if (
        el.textContent &&
        el.textContent.trim() !== "" &&
        !el.querySelector('[data-editable="true"]')
      ) {
        el.setAttribute("data-editable", "true");
        el.setAttribute("data-editable-type", "text");

        // Add hover effect to show it's editable
        el.classList.add("editable-element");

        // Add double-click event for inline editing
        el.addEventListener("dblclick", handleDoubleClick);
      }
    });

    // Find elements with background colors and make them editable
    const colorElements = canvasRef.current.querySelectorAll('[class*="bg-"]');
    colorElements.forEach((el) => {
      el.setAttribute("data-editable", "true");
      el.setAttribute("data-editable-type", "color");

      // Add hover effect to show it's editable
      el.classList.add("editable-element");
    });

    // Find all images and make them editable
    const imageElements = canvasRef.current.querySelectorAll("img");
    imageElements.forEach((el) => {
      el.setAttribute("data-editable", "true");
      el.setAttribute("data-editable-type", "image");

      // Add hover effect to show it's editable
      el.classList.add("editable-element");

      // Add a visual indicator for image editing
      const parent = el.parentElement;
      if (parent) {
        parent.style.position = parent.style.position || "relative";
      }
    });
  };

  // Handle double-click on text elements for inline editing
  const handleDoubleClick = (e: Event) => {
    const target = e.target as HTMLElement;
    const editableElement = target.closest(
      '[data-editable="true"]'
    ) as HTMLElement;

    if (
      editableElement &&
      editableElement.getAttribute("data-editable-type") === "text"
    ) {
      e.stopPropagation();
      e.preventDefault();

      // Make the element editable
      editableElement.contentEditable = "true";
      editableElement.focus();

      // Store original content
      if (!editableElement.getAttribute("data-original-text")) {
        editableElement.setAttribute(
          "data-original-text",
          editableElement.innerHTML
        );
      }

      // For links, store the href attribute
      if (editableElement.tagName.toLowerCase() === "a") {
        const href = (editableElement as HTMLAnchorElement).href;
        if (href) {
          editableElement.setAttribute("data-original-href", href);
        }
      }

      // Add editing class
      editableElement.classList.add("editing-active");

      // Set editing state
      setIsEditing(true);
      setSelectedElement(editableElement);
      setElementText(editableElement.innerHTML);

      // Handle blur event to save changes
      const handleBlur = () => {
        editableElement.contentEditable = "false";
        editableElement.classList.remove("editing-active");
        setIsEditing(false);

        // Record the edit
        recordTextEdit(editableElement);

        // For links, restore the href attribute if it was removed during editing
        if (editableElement.tagName.toLowerCase() === "a") {
          const originalHref =
            editableElement.getAttribute("data-original-href");
          if (originalHref && !(editableElement as HTMLAnchorElement).href) {
            (editableElement as HTMLAnchorElement).href = originalHref;
          }
        }

        // Remove event listener
        editableElement.removeEventListener("blur", handleBlur);

        // Update editable fields
        scanComponentForEditableFields();
      };

      editableElement.addEventListener("blur", handleBlur);
    }
  };

  // Update text from panel
  const updateElementText = (element: HTMLElement, newText: string) => {
    if (!element) return;

    // Update the element
    element.innerHTML = newText;

    // Record the edit
    if (element.getAttribute("data-editable-type") === "text") {
      recordTextEdit(element);
    }

    // Update editable fields
    scanComponentForEditableFields();
  };

  // Apply text style
  const applyTextStyle = (element: HTMLElement, style: string) => {
    if (!element) return;

    switch (style) {
      case "bold":
        element.style.fontWeight =
          element.style.fontWeight === "bold" ? "normal" : "bold";
        break;
      case "italic":
        element.style.fontStyle =
          element.style.fontStyle === "italic" ? "normal" : "italic";
        break;
      case "underline":
        element.style.textDecoration =
          element.style.textDecoration === "underline" ? "none" : "underline";
        break;
      case "align-left":
        element.style.textAlign = "left";
        break;
      case "align-center":
        element.style.textAlign = "center";
        break;
      case "align-right":
        element.style.textAlign = "right";
        break;
      case "align-justify":
        element.style.textAlign = "justify";
        break;
    }

    // Record the edit
    recordTextEdit(element);

    // Update editable fields
    scanComponentForEditableFields();
  };

  // Record a text edit
  const recordTextEdit = (element: HTMLElement) => {
    const componentIndex =
      selectedComponentIndex !== null ? selectedComponentIndex : -1;
    if (componentIndex >= 0) {
      const componentId = components[componentIndex].id;

      // Create a selector to find this element again
      const selector = createElementSelector(element);

      // Add to edits
      const newEdit: ComponentEdit = {
        componentId,
        elementSelector: selector,
        editType: "text",
        originalValue: element.getAttribute("data-original-text") || "",
        currentValue: element.innerHTML,
        timestamp: Date.now(),
      };

      // Update edits
      setComponentEdits((prev) => {
        // Remove any previous edits to this same element
        const filteredEdits = prev.filter(
          (edit) =>
            !(
              edit.componentId === componentId &&
              edit.elementSelector === selector &&
              edit.editType === "text"
            )
        );
        return [...filteredEdits, newEdit];
      });

      // Force a re-render
      setComponents([...components]);
    }
  };

  // Create a CSS selector to uniquely identify an element
  const createElementSelector = (element: HTMLElement): string => {
    // This is a simplified version - in a real app, you'd want a more robust selector
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const classes = Array.from(element.classList)
      .map((c) => `.${c}`)
      .join("");
    const index = Array.from(element.parentElement?.children || [])
      .filter((el) => el.tagName === element.tagName)
      .indexOf(element);

    return `${tagName}${id}${classes}:nth-of-type(${index + 1})`;
  };

  // Handle click on canvas elements to select them for editing
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Don't select if we're in a dialog or currently editing
    if ((e.target as HTMLElement).closest('[role="dialog"]') || isEditing)
      return;

    // Find the closest editable element
    const target = e.target as HTMLElement;
    const editableElement = target.closest(
      '[data-editable="true"]'
    ) as HTMLElement;

    if (editableElement) {
      e.stopPropagation();
      setSelectedElement(editableElement);

      // Determine the edit mode based on the element type
      const editableType = editableElement.dataset.editableType as EditModeType;
      setEditMode(editableType);

      // For text elements, update the text state
      if (editableType === "text") {
        setElementText(editableElement.innerHTML);
      }

      // Add a selection indicator
      document.querySelectorAll(".editing-active").forEach((el) => {
        el.classList.remove("editing-active");
      });
      editableElement.classList.add("editing-active");

      // Log for debugging
      console.log("Selected element:", editableElement);
      console.log("Edit mode:", editableType);
    } else {
      setSelectedElement(null);
      setEditMode(null);

      // Remove any active selection indicators
      document.querySelectorAll(".editing-active").forEach((el) => {
        el.classList.remove("editing-active");
      });
    }
  };

  // Add current state to history
  const addToHistory = (newComponents: ComponentType[]) => {
    // If we're not at the end of the history, truncate it
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newComponents]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo last action
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents([...history[historyIndex - 1]]);
    }
  };

  // Redo last undone action
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents([...history[historyIndex + 1]]);
    }
  };

  // Save project data
  const saveProject = async () => {
    try {
      // Get all changes from the file tracker
      const changes = fileTracker.getChanges();

      // Save to backend
      const response = await fetch("/api/save-changes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          changes,
          currentFile,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      // Clear changes after successful save
      fileTracker.clearChanges();
      vfs.saveToLocalStorage();

      // Also save as downloadable file
      const projectData = {
        files: vfs.listDirectory("/").files,
        lastSaved: Date.now(),
      };

      const projectJson = JSON.stringify(projectData);
      const blob = new Blob([projectJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "website-project.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  // Load project data
  const loadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string);
        // Clear existing files
        vfs.listDirectory("/").files.forEach((f) => vfs.deleteFile(f.path));
        // Add new files
        projectData.files.forEach((f: any) => {
          vfs.createFile(f.path, f.content, f.type);
        });
        vfs.saveToLocalStorage();
        refreshEditableElements();
      } catch (error) {
        console.error("Error loading project:", error);
      }
    };
    reader.readAsText(file);
  };

  // Handle content changes from the preview
  const handleContentChange = (content: string) => {
    vfs.updateFile(currentFile, content);
    vfs.saveToLocalStorage();
  };

  // Initialize history when components change
  useEffect(() => {
    if (history.length === 0 && components.length > 0) {
      setHistory([[...components]]);
      setHistoryIndex(0);
    }
  }, [components, history]);

  // Update element text state when selected element changes
  useEffect(() => {
    if (selectedElement && editMode === "text") {
      setElementText(selectedElement.innerHTML);
    }
  }, [selectedElement, editMode]);

  // Scan for editable fields when selected component changes
  useEffect(() => {
    scanComponentForEditableFields();
  }, [selectedComponentIndex]);

  // Set up mutation observer to detect DOM changes and make new elements editable
  useEffect(() => {
    if (!canvasRef.current) return;

    // Initial marking of elements as editable
    makeElementsEditable();

    // Set up mutation observer to detect when new elements are added
    if (!observerRef.current) {
      observerRef.current = new MutationObserver((mutations) => {
        let shouldUpdate = false;

        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            shouldUpdate = true;
          }
        });

        if (shouldUpdate) {
          makeElementsEditable();
          scanComponentForEditableFields();
        }
      });

      observerRef.current.observe(canvasRef.current, {
        childList: true,
        subtree: true,
      });
    }

    // Add CSS for editable elements
    const style = document.createElement("style");
    style.innerHTML = `
    .editable-element {
      transition: outline 0.2s ease;
      outline: 1px dashed transparent;
      outline-offset: 2px;
    }
    .editable-element:hover {
      cursor: pointer;
    }
    .editing-active {
      outline: 3px solid #9333ea !important;
      outline-offset: 2px;
    }
    [contenteditable="true"] {
      background-color: rgba(147, 51, 234, 0.1);
      padding: 2px;
      min-height: 1em;
    }
    [contenteditable="true"]:focus {
      outline: none;
    }
    /* Special styling for editable links */
    a.editable-element:hover {
      text-decoration: none;
      cursor: pointer;
    }
    a[contenteditable="true"] {
      text-decoration: none;
    }
    /* Special styling for editable buttons */
    button.editable-element:hover {
      cursor: pointer;
    }
    button[contenteditable="true"] {
      pointer-events: none;
    }
    button[contenteditable="true"] * {
      pointer-events: none;
    }
  `;
    document.head.appendChild(style);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      document.head.removeChild(style);
    };
  }, [canvasRef.current]);

  // Toggle sidebars based on screen size
  useEffect(() => {
    if (isMobile) {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
    } else {
      setLeftSidebarOpen(true);
      setRightSidebarOpen(true);
    }
  }, [isMobile]);

  // Set viewport width based on selected size
  const getViewportWidth = () => {
    switch (viewportSize) {
      case "mobile":
        return "w-[375px]";
      case "tablet":
        return "w-[768px]";
      case "desktop":
      default:
        return "w-full max-w-5xl";
    }
  };

  // Add state to track the index being dragged
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (
    index: number,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (
    index: number,
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
  };

  const handleDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const newComponents = Array.from(components);
    const [removed] = newComponents.splice(draggedIndex, 1);
    newComponents.splice(index, 0, removed);
    setComponents(newComponents);
    setSelectedComponentIndex(index);
    addToHistory(newComponents);
    setDraggedIndex(null);
  };

  // Render the component library sidebar
  const renderComponentLibrarySidebar = () => {
    const content = (
      <div className="h-full flex flex-col">
        <h2 className="text-lg font-bold mb-4">Components</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full mb-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Component
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader>
              <DialogTitle>Component Library</DialogTitle>
            </DialogHeader>
            <ComponentLibrary onSelectComponent={addComponent} />
          </DialogContent>
        </Dialog>

        <div className="flex-grow overflow-auto">
          <div className="space-y-2">
            {components.map((component, index) => (
              <div
                key={`${component.id}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(index, e)}
                onDragOver={(e) => handleDragOver(index, e)}
                onDrop={(e) => handleDrop(index, e)}
                onDragEnd={() => setDraggedIndex(null)}
                onClick={() => setSelectedComponentIndex(index)}
                className={`p-2 border rounded-md cursor-pointer flex justify-between items-center transition-all ${
                  selectedComponentIndex === index
                    ? "bg-primary/10 border-primary"
                    : "bg-white border-gray-200"
                } ${draggedIndex === index ? "shadow-lg" : "shadow-sm"}`}
              >
                <span className="truncate flex-1">{component.name}</span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveComponentUp(index);
                    }}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveComponentDown(index);
                    }}
                    disabled={index === components.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Save/Load */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1" onClick={saveProject}>
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={loadProject}
                className="hidden"
              />
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Load
              </Button>
            </label>
          </div>
        </div>
      </div>
    );

    return isMobile ? (
      <Sheet open={leftSidebarOpen} onOpenChange={setLeftSidebarOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          {content}
        </SheetContent>
      </Sheet>
    ) : (
      <div
        className={`border-r bg-muted/20 p-4 flex flex-col ${
          leftSidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        {content}
      </div>
    );
  };

  // Add a function to update button hover state
  const updateButtonHoverState = (
    element: HTMLButtonElement,
    normalClass: string,
    hoverClass: string
  ) => {
    // Remove existing background and hover classes
    const classList = Array.from(element.classList);
    const newClassList = classList.filter(
      (cls) => !cls.startsWith("bg-") && !cls.startsWith("hover:bg-")
    );

    // Add new classes
    if (normalClass) newClassList.push(normalClass);
    if (hoverClass) newClassList.push(hoverClass);

    element.className = newClassList.join(" ");

    // Record the edit and update
    recordTextEdit(element);
    scanComponentForEditableFields();
  };

  // Add a new function to render button editor
  const renderButtonFieldEditor = (field: EditableField) => {
    if (!field.hoverState) return null;

    const { normalClass, hoverClass } = field.hoverState;

    return (
      <div key={field.id} className="space-y-2 p-3 border rounded-md mb-2">
        <Label htmlFor={field.id}>{field.label}</Label>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-center">Normal</p>
            <Button
              variant="outline"
              size="sm"
              className={`w-full h-8 px-4 py-2 rounded-md transition-colors ${
                normalClass || "bg-primary text-primary-foreground"
              }`}
              onClick={() => {
                setSelectedElement(field.element);
                setEditMode("color");
              }}
            ></Button>
          </div>
          <div>
            <p className="text-center">Hover</p>
            <Button
              variant="outline"
              size="sm"
              className={`w-full h-8 px-4 py-2 rounded-md transition-colors ${
                hoverClass || "bg-primary text-primary-foreground"
              }`}
              onClick={() => {
                // Open color picker
                setSelectedElement(field.element);
                setEditMode("hover-color");
              }}
            ></Button>
          </div>
        </div>
      </div>
    );
  };

  // Render text field editor
  const renderTextFieldEditor = (field: EditableField) => {
    return (
      <div key={field.id} className="space-y-2 p-3 border rounded-md mb-2">
        <Label htmlFor={field.id}>{field.label}</Label>
        <Textarea
          id={field.id}
          value={field.value}
          onChange={(e) => updateElementText(field.element, e.target.value)}
          rows={2}
        />

        <div className="flex flex-wrap gap-1 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => applyTextStyle(field.element, "bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => applyTextStyle(field.element, "italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => applyTextStyle(field.element, "underline")}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => applyTextStyle(field.element, "align-left")}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => applyTextStyle(field.element, "align-center")}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => applyTextStyle(field.element, "align-right")}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {field.element.tagName.toLowerCase() === "a" && (
          <div className="mt-2">
            <Label htmlFor={`${field.id}-href`}>Link URL</Label>
            <Input
              id={`${field.id}-href`}
              value={(field.element as HTMLAnchorElement).href}
              onChange={(e) => {
                (field.element as HTMLAnchorElement).href = e.target.value;
                recordTextEdit(field.element);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // Render image field editor
  const renderImageFieldEditor = (field: EditableField) => {
    return (
      <div key={field.id} className="space-y-2 p-3 border rounded-md mb-2">
        <Label htmlFor={field.id}>{field.label}</Label>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-12 w-12 border rounded-md overflow-hidden">
            <img
              src={field.value || "/placeholder.svg"}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <Input
              id={field.id}
              value={field.value}
              onChange={(e) => {
                (field.element as HTMLImageElement).src = e.target.value;
                scanComponentForEditableFields();
              }}
              placeholder="Image URL"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor={`${field.id}-alt`}>Alt Text</Label>
            <Input
              id={`${field.id}-alt`}
              value={(field.element as HTMLImageElement).alt}
              onChange={(e) => {
                (field.element as HTMLImageElement).alt = e.target.value;
                scanComponentForEditableFields();
              }}
              placeholder="Alt text"
            />
          </div>
          <div>
            <Label htmlFor={`${field.id}-width`}>Width</Label>
            <Input
              id={`${field.id}-width`}
              type="number"
              value={
                (field.element as HTMLImageElement).width ||
                (field.element as HTMLImageElement).clientWidth
              }
              onChange={(e) => {
                const width = Number.parseInt(e.target.value);
                if (!isNaN(width)) {
                  (field.element as HTMLImageElement).width = width;
                  (
                    field.element as HTMLImageElement
                  ).style.width = `${width}px`;
                  scanComponentForEditableFields();
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render color field editor
  const renderColorFieldEditor = (field: EditableField) => {
    return (
      <div key={field.id} className="space-y-2 p-3 border rounded-md mb-2">
        <Label htmlFor={field.id}>{field.label}</Label>
        <div className="flex items-center gap-2">
          <div
            className={`h-6 w-6 rounded-md ${field.value}`}
            title={field.value}
          ></div>
          <span className="text-sm text-muted-foreground">{field.value}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-1"
          onClick={() => {
            setSelectedElement(field.element);
            setEditMode("color");
          }}
        >
          Edit Color
        </Button>
      </div>
    );
  };

  // Render the edit panel sidebar
  const renderEditPanelSidebar = () => {
    if (!selectedElement) return null;

    return (
      <div className="w-80 bg-white border-l border-gray-200 shadow-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Element</h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Text Formatting */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Text Formatting
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  handleOptionChange("isBold", !editOptions.isBold)
                }
                className={`p-2 rounded-md hover:bg-gray-100 ${
                  editOptions.isBold
                    ? "bg-gray-100 text-blue-600"
                    : "text-gray-600"
                }`}
                title="Bold"
              >
                <Bold className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  handleOptionChange("isItalic", !editOptions.isItalic)
                }
                className={`p-2 rounded-md hover:bg-gray-100 ${
                  editOptions.isItalic
                    ? "bg-gray-100 text-blue-600"
                    : "text-gray-600"
                }`}
                title="Italic"
              >
                <Italic className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  handleOptionChange("isUnderlined", !editOptions.isUnderlined)
                }
                className={`p-2 rounded-md hover:bg-gray-100 ${
                  editOptions.isUnderlined
                    ? "bg-gray-100 text-blue-600"
                    : "text-gray-600"
                }`}
                title="Underline"
              >
                <Underline className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Text Color
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleOptionChange("textColor", color.value)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    editOptions.textColor === color.value
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              <input
                type="color"
                value={editOptions.textColor || "#000000"}
                onChange={(e) =>
                  handleOptionChange("textColor", e.target.value)
                }
                className="w-6 h-6 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Background Color
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() =>
                    handleOptionChange("backgroundColor", color.value)
                  }
                  className={`w-6 h-6 rounded-full border-2 ${
                    editOptions.backgroundColor === color.value
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              <input
                type="color"
                value={editOptions.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  handleOptionChange("backgroundColor", e.target.value)
                }
                className="w-6 h-6 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Font Size
            </label>
            <select
              value={editOptions.fontSize || ""}
              onChange={(e) => handleOptionChange("fontSize", e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Default</option>
              <option value="12px">Small</option>
              <option value="16px">Medium</option>
              <option value="20px">Large</option>
              <option value="24px">Extra Large</option>
            </select>
          </div>

          {/* Text Align */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Text Align
            </label>
            <select
              value={editOptions.textAlign || ""}
              onChange={(e) => handleOptionChange("textAlign", e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Default</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          {/* Special Options for Links */}
          {selectedElement.tagName === "A" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">URL</label>
              <input
                type="text"
                value={editOptions.url || ""}
                onChange={(e) => handleOptionChange("url", e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          )}

          {/* Special Options for Images */}
          {selectedElement.tagName === "IMG" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editOptions.src || ""}
                  onChange={(e) => handleOptionChange("src", e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editOptions.alt || ""}
                  onChange={(e) => handleOptionChange("alt", e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Image description"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <button
              onClick={() => setSelectedElement(null)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
            <button
              onClick={applyChanges}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={saveChanges}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              disabled={!unsavedChanges}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleOptionChange = (
    option: keyof EditOptions,
    value: string | boolean
  ) => {
    if (
      typeof value === "boolean" &&
      (option === "isBold" ||
        option === "isItalic" ||
        option === "isUnderlined")
    ) {
      setEditOptions((prev) => ({ ...prev, [option]: value }));
    } else if (typeof value === "string") {
      setEditOptions((prev) => ({ ...prev, [option]: value }));
    }
    setUnsavedChanges(true);
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
        elementId: selectedElement.id || selectedElement.className,
        changes: editOptions,
        timestamp: new Date().toISOString(),
      };

      // Save changes to the virtual file system
      await vfs.saveChanges(changes);
      setUnsavedChanges(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="hidden sm:flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="h-4 w-4 mr-1" />
              Redo
            </Button>
          </div>
        </div>

        {/* Viewport size controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewportSize === "desktop" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewportSize("desktop")}
            title="Desktop view"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewportSize === "tablet" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewportSize("tablet")}
            title="Tablet view"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewportSize === "mobile" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewportSize("mobile")}
            title="Mobile view"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Code className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
          <Button size="sm" onClick={saveProject}>
            <Save className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button size="sm" onClick={saveProject}>
            <Rocket className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Deploy</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Component Library */}
        {renderComponentLibrarySidebar()}

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center">
          <div className={`transition-all duration-300 ${getViewportWidth()}`}>
            <WebsitePreview
              onContentChange={handleContentChange}
              initialContent={
                components.length > 0 ? components[0].component : undefined
              }
            />
          </div>
        </div>

        {/* Right sidebar - Edit Panel */}
        {renderEditPanelSidebar()}
      </div>

      {/* Mobile bottom toolbar */}
      {isMobile && (
        <div className="h-14 border-t flex items-center justify-around px-4 bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Eye className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Code className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Add a default export as well to ensure compatibility
export default WebsiteEditor;
