"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, LoaderCircle, Sparkles } from "lucide-react";
import { getChatMessages } from "@/app/actions";

interface ChatInterfaceProps {
  className?: string;
  status: string;
  onSendMessage?: (message: string) => Promise<any>;
  appName?: string;
  userId?: string;
}

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

// Update status messages to be more detailed
const statusMessages: Record<string, string> = {
  idle: "What changes would you like to make to your website?",
  thinking: "Analyzing your request and planning required changes...",
  generating: "Generating code for your website updates...",
  deploying: "Deploying your changes to the preview environment...",
  polling: "Setting up your website environment and preparing services...",
  ready: "Your website is ready! What would you like to modify next?",
};

// Add detailed process steps for each status
const statusDetails: Record<string, string[]> = {
  thinking: [
    "Understanding your requirements",
    "Analyzing existing codebase",
    "Planning necessary changes",
  ],
  generating: [
    "Creating component structure",
    "Writing code implementation",
    "Ensuring proper styling",
  ],
  deploying: [
    "Preparing deployment package",
    "Uploading files to server",
    "Configuring runtime environment",
  ],
  polling: [
    "Starting server instances",
    "Initializing database connections",
    "Verifying all services",
  ],
};

// Function to fetch messages from localStorage as a fallback
const getMessagesFromLocalStorage = (userId?: string, appName?: string) => {
  if (!userId || !appName) return [];

  const storageKey = `chat:${userId}:${appName}`;
  const storedMessages = localStorage.getItem(storageKey);

  if (storedMessages) {
    try {
      return JSON.parse(storedMessages);
    } catch (error) {
      console.error("Error parsing stored messages:", error);
      return [];
    }
  }

  return [];
};

export default function ChatInterface({
  className,
  status,
  onSendMessage,
  appName,
  userId,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Load messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId || !appName) {
        // No user or website ID, just show status message
        setMessages([
          {
            id: `status-${Date.now()}-${Math.random().toString(12).substring(2, 8)}`,
            content: statusMessages[status] || status,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      try {
        // Try to load messages from Redis using server action
        const redisMessages = await getChatMessages(userId, appName);

        if (redisMessages && redisMessages.length > 0) {
          setMessages(redisMessages);
        } else {
          // Try to load messages from localStorage as a fallback
          const localMessages = getMessagesFromLocalStorage(userId, appName);

          if (localMessages.length > 0) {
            setMessages(localMessages);
          } else {
            // Initialize with status message
            setMessages([
              {
                id: `status-${Date.now()}-${Math.random().toString(12).substring(2, 8)}`,
                content: statusMessages[status] || status,
                isUser: false,
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Initialize with status message if there's an error
        setMessages([
          {
            id: `status-${Date.now()}-${Math.random().toString(12).substring(2, 8)}`,
            content: statusMessages[status] || status,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    };

    fetchMessages();
  }, [userId, appName, status]);

  // Update status message when status changes
  useEffect(() => {
    // Skip if we don't have any messages yet (the first effect will handle it)
    if (messages.length === 0) return;

    const statusMessage = statusMessages[status];
    const statusId = `status-${Date.now()}`;

    const hasStatusMessage = messages.some((m) => m.id.startsWith("status-"));
    const lastMessageIsStatus =
      messages.length > 0 &&
      messages[messages.length - 1].id.startsWith("status-");

    if (lastMessageIsStatus) {
      // Update the last message if it's a status message
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          id: statusId,
          content: statusMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } else if (!hasStatusMessage) {
      // Add a new status message if there isn't one
      setMessages((prev) => [
        ...prev,
        {
          id: statusId,
          content: statusMessage,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [status, messages.length]);

  // Save messages to localStorage as a fallback
  useEffect(() => {
    if (appName && userId && messages.length > 0) {
      const storageKey = `chat:${userId}:${appName}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, appName, userId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Progress animation effect for active processing states
  useEffect(() => {
    if (
      status === "thinking" ||
      status === "generating" ||
      status === "deploying" ||
      status === "polling"
    ) {
      const steps = statusDetails[status] || [];
      if (steps.length === 0) return;

      // Move through steps with a delay
      const interval = setInterval(() => {
        setActiveStepIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          // If we reached the end, start from beginning to show continuous progress
          return nextIndex >= steps.length ? 0 : nextIndex;
        });
      }, 3000); // Update every 3 seconds

      return () => clearInterval(interval);
    } else {
      setActiveStepIndex(0); // Reset when not in a processing state
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      if (onSendMessage) {
        // Add system message showing we're processing
        const processingMessage = {
          id: "processing",
          content: "Processing your request...",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, processingMessage]);

        // Call the onSendMessage handler and await result
        await onSendMessage(userMessage.content);

        // Update the processing message with success info
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === "processing"
              ? {
                  ...msg,
                  id: Date.now().toString(), // Change ID so it doesn't get updated again
                  content: "Request processed successfully. Changes applied.",
                }
              : msg
          )
        );
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage = {
        id: Date.now().toString(),
        content:
          "Sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (
      status === "thinking" ||
      status === "generating" ||
      status === "deploying" ||
      status === "polling"
    ) {
      // Get the detailed steps for current status
      const steps = statusDetails[status] || [];

      return (
        <div className="bg-muted/30 rounded-lg p-4 my-4">
          <div className="flex items-center gap-2 mb-2">
            <LoaderCircle className="h-5 w-5 text-primary animate-spin" />
            <span className="font-medium">{statusMessages[status]}</span>
          </div>

          {steps.length > 0 && (
            <div className="pl-7 mt-2 space-y-2">
              {steps.map((step, index) => {
                // Use the activeStepIndex to determine which steps are active
                // Current step and previous steps are shown as active
                const isActive = index <= activeStepIndex;
                const isCurrent = index === activeStepIndex;

                return (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        isCurrent
                          ? "bg-primary animate-pulse"
                          : isActive
                            ? "bg-primary"
                            : "bg-muted"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {step}
                      {isCurrent && "..."}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("md:w-[500px] flex flex-col h-full", className)}>
      <div
        className={cn(
          "flex-1 flex flex-col h-full bg-[#faefff] text-foreground overflow-hidden"
        )}
      >
        {status !== "idle" && status !== "ready" && (
          <div className="border-b border-muted/30 px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <p className="text-sm font-medium">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p className="text-center max-w-sm">Ask a follow up...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex items-center gap-4">
                  {message.isUser ? (
                    <div className="h-7 w-7 rounded-md bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">
                        who
                      </span>
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-md border border-primary/20 bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="text-sm text-foreground leading-relaxed max-w-[90%]">
                    {message.content}
                  </div>
                </div>
              ))}
              {getStatusIndicator()}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-muted/30 px-4">
          <form onSubmit={handleSubmit} className="relative h-full">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow up..."
              className="min-h-24 max-h-32 resize-none bg-background border border-muted rounded-md p-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={
                isLoading ||
                status === "thinking" ||
                status === "generating" ||
                status === "deploying" ||
                status === "polling"
              }
            />
            <div className="absolute right-2 bottom-12 flex items-center gap-1">
              <Button
                type="submit"
                size="icon"
                className="rounded-md h-7 w-7 bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none"
                disabled={
                  !inputValue.trim() ||
                  isLoading ||
                  status === "thinking" ||
                  status === "generating" ||
                  status === "deploying" ||
                  status === "polling"
                }
              >
                <ArrowUp className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center py-3">
              builddrr may make mistakes. Please use with discretion.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
