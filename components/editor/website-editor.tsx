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
  MessageSquare,
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import WebsitePreview from "./website-preview";
import Link from "next/link";
import { MediaLibrary } from "../media-library/media-library";
import { useToast } from "@/hooks/use-toast";
import { deployWebsite, createAndDeployWebsite, startMachine } from "@/lib/fly";
import { redis } from "@/lib/redis";

type ViewportSize = "desktop" | "mobile";

export function WebsiteEditor({
  id,
  user,
  machine,
  appName,
}: {
  id: string;
  user: any;
  machine?: any;
  appName?: string;
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

  const [generationComplete, setGenerationComplete] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<"components" | "chat">(
    "components"
  );
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      content: string;
      role: "user" | "assistant" | "system";
      timestamp: Date;
      isLoading?: boolean;
    }>
  >([]);

  // Add transition effect state
  const [showTransitionMessage, setShowTransitionMessage] = useState(true);
  const [transitionStep, setTransitionStep] = useState(0);
  const transitionMessages = [
    "Preparing your website...",
    "Setting up the editor...",
    "Almost ready...",
  ];

  const isMobile = useMobile();
  const { toast } = useToast();

  const [machineData, setMachineData] = useState<any>(machine);
  const [generationPrompt, setGenerationPrompt] = useState<string | null>(null);

  const [userId] = useState<string | null>(user.id);
  const [isInitializing, setIsInitializing] = useState(true);

  // Guard to prevent double execution in Strict Mode
  const hasRun = useRef(false);

  useEffect(() => {
    const initializeEditor = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      setIsInitializing(true);

      // Try loading from Redis if we have an appName
      if (appName && userId) {
        try {
          const vfsData = await redis.get(`vfs:${userId}:${appName}`);
          if (vfsData) {
            const parsedFiles = JSON.parse(vfsData as string);
            console.log("Loaded VFS data from Redis:", parsedFiles);
            // Use VFS data to initialize components or other editor state
            // For now, just set the loading state to complete
            setIsInitializing(false);
            setGenerationComplete(true);
          }
        } catch (error) {
          console.error("Error loading VFS data from Redis:", error);
        }
      }

      setIsInitializing(false);
    };

    initializeEditor();
  }, [userId, appName]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Load and clear the prompt from localStorage
    const prompt = localStorage.getItem("siteforge_generation_prompt");
    if (prompt) {
      setGenerationPrompt(prompt);
      // Initially show the chat panel if we have a prompt
      setSidebarContent("chat");
      setLeftSidebarOpen(true);
    }

    // Check if we have a defined machine
    if (machine) {
      setShowTransitionMessage(false);
      setIsInitializing(false);
      return;
    }

    // On mount, check for generation steps in localStorage
    const appName = localStorage.getItem("siteforge_app_name");

    // If we have a prompt and appName, start generation
    (async () => {
      if (prompt && appName) {
        if (!userId) {
          toast({
            title: "Error",
            description: "Please login to create a website.",
            variant: "destructive",
          });
          setIsInitializing(false);
          return;
        }

        setIsLoading(true);

        // Show transition messages before actual loading
        let step = 0;
        const interval = setInterval(() => {
          setTransitionStep(step);
          step++;
          if (step >= transitionMessages.length) {
            clearInterval(interval);
          }
        }, 1200);

        try {
          const result = await createAndDeployWebsite(userId, appName, prompt);
          setMachineData(result.machine);
          toast({
            title: "Website Created",
            description: "Your website is ready to customize in the editor.",
          });
          setGenerationComplete(true);
        } catch (error) {
          console.error("Error creating website:", error);
          toast({
            title: "Error",
            description: "Failed to create website. Please try again.",
            variant: "destructive",
          });
        } finally {
          clearInterval(interval);
          setTimeout(() => {
            setShowTransitionMessage(false);
            setIsLoading(false);
            setIsInitializing(false);
            setGenerationComplete(true);
          }, 500);
        }
      } else {
        setShowTransitionMessage(false);
        setIsInitializing(false);
      }
    })();
  }, [machine, toast, userId, transitionMessages]);

  const handleGoLive = async () => {
    toast({
      title: "Deploying website...",
      description: "Please wait while we deploy your website.",
      variant: "default",
    });

    setIsLoading(true);

    try {
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
    } catch (error) {
      console.error("Error deploying website:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deploying.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatWithAI = async (message: string) => {
    toast({
      title: "Message sent",
      description: "Your message has been sent to the AI.",
    });

    // Make sure the chat panel is visible when a new message is sent
    if (sidebarContent !== "chat") {
      setSidebarContent("chat");
      setLeftSidebarOpen(true);
    }

    // Return a response based on the type of query
    const lowerMessage = message.toLowerCase();

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setMessages((prev) => {
      const newMessages = [...prev];
      const loadingIndex = newMessages.findIndex((m) => m.isLoading);

      if (loadingIndex !== -1) {
        // Generate a contextual response based on the user's query
        let response =
          "I'll help you with that. What would you like to do with your website?";

        if (lowerMessage.includes("color") || lowerMessage.includes("style")) {
          response =
            "I can help you change the colors and styles of your website. You can use the edit mode to select elements and modify their appearance using the toolbar that appears.";
        } else if (
          lowerMessage.includes("image") ||
          lowerMessage.includes("picture") ||
          lowerMessage.includes("photo")
        ) {
          response =
            "To add or change images, enter edit mode by clicking the Edit button in the top bar. Then select the image you want to replace, and use the toolbar to upload a new one from your media library.";
        } else if (
          lowerMessage.includes("text") ||
          lowerMessage.includes("content")
        ) {
          response =
            "You can edit any text on your website by entering edit mode and clicking on the text you want to change. Then just type your new content!";
        } else if (
          lowerMessage.includes("add") ||
          lowerMessage.includes("section")
        ) {
          response =
            "To add new components to your website, use the Components panel on the left side. Click the + button in the toolbar to open it if it's not already visible.";
        } else if (
          lowerMessage.includes("publish") ||
          lowerMessage.includes("deploy") ||
          lowerMessage.includes("live")
        ) {
          response =
            "When you're ready to publish your website, click the 'Go Live' button in the top right of the editor. This will deploy your site and make it available online.";
        }

        newMessages[loadingIndex] = {
          id: newMessages[loadingIndex].id,
          content: response,
          role: "assistant" as const,
          timestamp: new Date(),
        };
      }

      return newMessages;
    });

    return Promise.resolve();
  };

  const toggleChatPanel = () => {
    if (sidebarContent !== "chat") {
      setSidebarContent("chat");
      setLeftSidebarOpen(true);
    } else {
      // Toggle the sidebar if already showing chat
      setLeftSidebarOpen(!leftSidebarOpen);
    }
  };

  const toggleComponentPanel = () => {
    if (sidebarContent !== "components") {
      setSidebarContent("components");
      setLeftSidebarOpen(true);
    } else {
      // Toggle the sidebar if already showing components
      setLeftSidebarOpen(!leftSidebarOpen);
    }
  };

  // Initialize chat messages when needed
  useEffect(() => {
    if (messages.length === 0) {
      if (generationPrompt) {
        // For newly generated websites or websites in process of being generated
        const initialMessages = [
          {
            id: "1",
            content: "I've created your website based on this description:",
            role: "assistant" as const,
            timestamp: new Date(),
          },
          {
            id: "2",
            content: generationPrompt,
            role: "user" as const,
            timestamp: new Date(),
          },
        ];

        // Add appropriate completion message based on whether the machine exists
        initialMessages.push({
          id: "3",
          content: machine
            ? "Your website is ready! You can now edit it using the tools in the editor. Let me know if you need any help making changes or adding new features."
            : "I'm still working on creating your website. You'll be able to customize it once it's ready.",
          role: "assistant" as const,
          timestamp: new Date(),
        });

        setMessages(initialMessages);

        // Auto-show chat panel for newly generated websites
        setSidebarContent("chat");
        setLeftSidebarOpen(true);
      } else {
        // For existing websites without generation prompt
        setMessages([
          {
            id: "1",
            content: "How can I help with your website today?",
            role: "assistant" as const,
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [
    messages.length,
    generationPrompt,
    machine,
    setMessages,
    setSidebarContent,
    setLeftSidebarOpen,
  ]);

  const renderComponentsSidebar = () => {
    return (
      <div className="rounded h-full w-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Components</h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-fit">
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-xs">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[825px]">
              <DialogHeader>
                <DialogTitle>Component Library</DialogTitle>
              </DialogHeader>
              <ComponentLibrary onSelectComponent={addComponent} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex space-x-2 mb-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-fit">
                <Settings className="h-4 w-4 mr-1" />
                <span className="text-xs">Settings</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[825px]">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              {/* Settings content would go here */}
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-fit">
                <WandSparkles className="h-4 w-4 mr-1" />
                <span className="text-xs">AI</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[825px]">
              <DialogHeader>
                <DialogTitle>AI Suggestions</DialogTitle>
              </DialogHeader>
              {/* AI suggestions would go here */}
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-fit">
                <Image className="h-4 w-4 mr-1" />
                <span className="text-xs">Media</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[825px]">
              <DialogHeader>
                <DialogTitle>Media Library</DialogTitle>
              </DialogHeader>
              <MediaLibrary onSelectImage={() => 2 + 2} />
            </DialogContent>
          </Dialog>
        </div>

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
  };

  // Handle drag and drop for components
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

  // Initial loading state
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium">Initializing editor...</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  // Loading state for website operations
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-medium">
            {showTransitionMessage
              ? transitionMessages[transitionStep]
              : "Loading website..."}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {showTransitionMessage
              ? "We're getting your new website ready for editing"
              : "This may take a few moments"}
          </p>

          {showTransitionMessage && (
            <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${((transitionStep + 1) / transitionMessages.length) * 100}%`,
                }}
              ></div>
            </div>
          )}
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

          <Button
            variant={viewportSize === "desktop" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewportSize("desktop")}
            title="Desktop view"
          >
            <Monitor className="h-4 w-4" />
          </Button>

          <Button
            variant={
              sidebarContent === "chat" && leftSidebarOpen
                ? "default"
                : "outline"
            }
            size="icon"
            onClick={toggleChatPanel}
            title="Chat with AI assistant"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          <Button
            variant={
              sidebarContent === "components" && leftSidebarOpen
                ? "default"
                : "outline"
            }
            size="icon"
            onClick={toggleComponentPanel}
            title="Component Library"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button size="sm" onClick={handleGoLive}>
            <Rocket className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Go Live</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 h-full">
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
  );
}

export default WebsiteEditor;
