"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import type { ComponentType } from "@/components/component-library";
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
  ChevronLeft,
  Edit,
  Eye,
  Image,
  Loader2,
  Menu,
  Monitor,
  MoveDown,
  MoveUp,
  Plus,
  Redo,
  Rocket,
  Save,
  Settings,
  Smartphone,
  Undo,
  WandSparkles,
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import WebsitePreview from "./website-preview";
import Link from "next/link";
import { MediaLibrary } from "../media-library/media-library";
import { useToast } from "@/hooks/use-toast";
import { deployWebsite, createAndDeployWebsite, startMachine } from "@/lib/fly";

type ViewportSize = "desktop" | "mobile";

export function WebsiteEditor({
  id,
  user,
  machine,
}: {
  id: string;
  user: any;
  machine?: any;
}) {
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<
    number | null
  >(null);
  const [history, setHistory] = useState<ComponentType[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(id);
  const [isLoading, setIsLoading] = useState(false);

  const isMobile = useMobile();
  const { toast } = useToast();

  const [machineData, setMachineData] = useState<any>(machine);

  const [userId] = useState<string | null>(user.id);

  // Guard to prevent double execution in Strict Mode
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    // Check if we have a defined machine
    if (machine) {
      return;
    }

    // On mount, check for generation steps in localStorage
    const prompt = localStorage.getItem("siteforge_generation_prompt");
    const appName = localStorage.getItem("siteforge_app_name");

    // If we have a prompt and appName and steps are not complete, start generation
    (async () => {
      if (prompt && appName) {
        const websiteData = {
          name: `AI Generated Website ${new Date().toLocaleDateString()}`,
          description: `Website generated from user prompt: ${prompt}`,
          prompt: prompt,
          colors: {
            primary: "#6366F1",
            secondary: "#8B5CF6",
            accent: "#EC4899",
          },
        };

        if (!userId) {
          toast({
            title: "Error",
            description: "Please login to create a website.",
            variant: "destructive",
          });
          return;
        }
        // Call createAndDeployWebsite
        console.log(
          "Creating and deploying website...",
          userId,
          websiteData,
          appName
        );
        const result = await createAndDeployWebsite(
          userId,
          websiteData,
          appName
        );
        setMachineData(result.machine);
      }
    })();
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

  const handleGoLive = async () => {
    toast({
      title: "Deploying website...",
      description: "Please wait while we deploy your website.",
      variant: "default",
    });
    // Call the server action to deploy the website
    const deployResult = await deployWebsite(id);

    if (!deployResult.success) {
      toast({
        title: "Error",
        description: deployResult.error || "Failed to deploy the website.",
        variant: "destructive",
      });
      return;
    }
    if (deployResult.data?.url) {
      setWebsiteUrl(deployResult.data.url);
    }
    toast({
      title: "Success",
      description:
        deployResult.data?.message || "Website deployed successfully.",
      variant: "default",
    });
  };

  const [IsMediaModalOpen, setIsMediaModalOpen] = useState(false);
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
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-fit mb-4">
              <Image className="h-4 w-4" />
              <DialogHeader className="hidden">
                <DialogTitle>Media Library</DialogTitle>
              </DialogHeader>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <MediaLibrary onSelectImage={() => 2 + 2} />
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
        className={`border-r bg-muted/20 p-4 flex flex-col md:rounded-none rounded-t-lg ${
          leftSidebarOpen ? "" : "w-0 overflow-hidden"
        }`}
      >
        {content}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium">Loading website...</h3>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl">
      <div className="h-14 border-b flex items-center px-4 gap-2">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Dashboard
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
          <Button size="sm" onClick={handleGoLive}>
            <Rocket className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Go Live</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 h-full">
        <div className="flex flex-1 flex-col md:flex-row h-full w-full">
          <div className="flex-1 min-w-0 h-full">
            <WebsitePreview
              isEditMode={isEditMode}
              initialUrl={websiteUrl || undefined}
              id={id}
              machine={machineData}
            />
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
