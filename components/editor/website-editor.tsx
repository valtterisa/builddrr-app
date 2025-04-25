"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { ComponentLibrary } from "@/components/component-library";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Save,
  Plus,
  MoveUp,
  MoveDown,
  Undo,
  Redo,
  Smartphone,
  Monitor,
  Menu,
  Rocket,
  Settings,
  WandSparkles,
  ChevronLeft,
  Edit,
  Eye,
  Image,
} from "lucide-react";

import type { ComponentType } from "@/components/component-library";
import { useMobile } from "@/hooks/use-mobile";
import WebsitePreview from "./website-preview";
import { VirtualFileSystem } from "@/lib/virtual-fs";
import Link from "next/link";
import { MediaLibraryModal } from "../media-library/media-library-modal";

type ViewportSize = "desktop" | "mobile";

export function WebsiteEditor() {
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<
    number | null
  >(null);
  const [history, setHistory] = useState<ComponentType[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const vfs = VirtualFileSystem.getInstance();

  const isMobile = useMobile();

  useEffect(() => {
    vfs.loadFromLocalStorage();
  }, []);

  const addComponent = (component: ComponentType) => {
    const newComponents = [...components, component];
    setComponents(newComponents);
    addToHistory(newComponents);
  };

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

  const addToHistory = (newComponents: ComponentType[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newComponents]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents([...history[historyIndex - 1]]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents([...history[historyIndex + 1]]);
    }
  };

  useEffect(() => {
    if (history.length === 0 && components.length > 0) {
      setHistory([[...components]]);
      setHistoryIndex(0);
    }
  }, [components, history]);

  const getViewportWidth = () => {
    switch (viewportSize) {
      case "mobile":
        return "w-[375px]";
      case "desktop":
      default:
        return "w-full";
    }
  };

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

  const [IsMediaModalOpen, setIsMediaModalOpen] = useState(false)
  // Handle image selection from media library
  const handleMediaSelection = (imageUrl: string | null) => {
    if (imageUrl) {
      // // For img elements, change the src
      // (selectedElement as HTMLImageElement).src = imageUrl;
      // if (selectedElement?.getAttribute("data-editor-id")) {
      //   const editorId = selectedElement.getAttribute("data-editor-id")!;
      //   // This is handled via the website-preview component to record changes
      //   const event = new CustomEvent("imageChanged", {
      //     detail: { url: imageUrl, editorId },
      //   });
      //   document.dispatchEvent(event);
      // }
    }
  };

  const renderComponentLibrarySidebar = () => {
    const content = (
      <div className="rounded h-full w-fit flex flex-col">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-fit mb-4">
              <Plus className="h-4 w-4" />
              <DialogHeader className="hidden">
                <DialogTitle>Component Library</DialogTitle>
              </DialogHeader>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader>
              <DialogTitle>Component Library</DialogTitle>
            </DialogHeader>
            <ComponentLibrary onSelectComponent={addComponent} />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-fit mb-4">
              <Settings className="h-4 w-4" />
              <DialogHeader className="hidden">
                <DialogTitle>Component Library</DialogTitle>
              </DialogHeader>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader>
              <DialogTitle>Component Library</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-fit mb-4">
              <WandSparkles className="h-4 w-4" />
              <DialogHeader className="hidden">
                <DialogTitle>Component Library</DialogTitle>
              </DialogHeader>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <ComponentLibrary onSelectComponent={addComponent} />
          </DialogContent>
        </Dialog>
        <MediaLibraryModal open={IsMediaModalOpen} onOpenChange={setIsMediaModalOpen} onSelectImage={handleMediaSelection}
          title={
            "Select Image"
          } />

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
                className={`p-2 border rounded-md cursor-pointer flex justify-between items-center transition-all ${selectedComponentIndex === index
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
      </div>
    );

    return isMobile ? (
      <Sheet open={leftSidebarOpen} onOpenChange={setLeftSidebarOpen}>
        <SheetContent side="bottom" className="w-full" title="Website Editor">
          {content}
        </SheetContent>
      </Sheet>
    ) : (
      <div
        className={`border-r bg-muted/20 p-4 flex flex-col md:rounded-none rounded-t-lg ${leftSidebarOpen ? "" : "w-0 overflow-hidden"
          }`}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="h-14 border-b flex items-center px-4 gap-2">
        <Link href="/create">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to setup
          </Button>
        </Link>

        <Button
          variant={isEditMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsEditMode(!isEditMode)}
          title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
        >
          {isEditMode ? (
            <Eye className="h-4 w-4 mr-1" />
          ) : (
            <Edit className="h-4 w-4 mr-1" />
          )}
          Edit
        </Button>

        <div className="flex items-center space-x-2 ml-auto">
          <Button variant="outline" size="sm" onClick={handleUndo}>
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleRedo}>
            <Redo className="h-4 w-4 mr-1" />
            Redo
          </Button>
          <Button
            variant={viewportSize === "desktop" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewportSize("desktop")}
            title="Desktop view"
          >
            <Monitor className="h-4 w-4" />
          </Button>

          <Button
            variant={viewportSize === "mobile" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewportSize("mobile")}
            title="Mobile view"
          >
            <Smartphone className="h-4 w-4" />
          </Button>

          {isEditMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditMode(false);
              }}
            >
              <Save className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Save Changes</span>
            </Button>
          )}
          <Button size="sm">
            <Rocket className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Go Live</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {renderComponentLibrarySidebar()}

        <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center">
          <div className={`transition-all duration-300 ${getViewportWidth()}`}>
            <WebsitePreview isEditMode={isEditMode} />
          </div>
        </div>
      </div>

      {isMobile && (
        <div className="h-14 border-t flex items-center justify-around px-4 bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleUndo}>
            <Undo className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRedo}>
            <Redo className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default WebsiteEditor;
