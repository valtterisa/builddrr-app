"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Sparkles, LoaderCircle } from "lucide-react";
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

const statusMessages: Record<string, string> = {
  idle: "What changes would you like to make to your website?",
  thinking: "Thinking about how to build your website...",
  generating: "Generating your website code...",
  deploying: "Deploying your website to the cloud...",
  polling: "Setting up your website environment...",
  ready: "Your website is ready! What would you like to modify next?",
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
        await onSendMessage(userMessage.content);

        // Add system message showing we're processing
        const processingMessage = {
          id: "processing",
          content: "Processing your request...",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, processingMessage]);
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
      return (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span>{statusMessages[status]}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background rounded-3xl overflow-hidden",
        className
      )}
    >
      {status !== "idle" && status !== "ready" && (
        <div className="bg-muted/30 border-b px-4 py-2">
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
            <Sparkles className="h-10 w-10 mb-4 text-primary" />
            <p className="text-center max-w-sm">Ask a follow up...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3 mb-4",
                  message.isUser ? "justify-end" : "justify-start"
                )}
              >
                {!message.isUser && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mt-1">
                    <Sparkles size={14} className="text-primary-foreground" />
                  </div>
                )}
                <div
                  className={cn(
                    "px-4 py-3 w-fit max-w-[85%] text-base shadow-sm",
                    message.isUser
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                      : "bg-muted/80 text-foreground/90 rounded-2xl rounded-tl-sm"
                  )}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
                {message.isUser && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center mt-1">
                    <span className="text-secondary-foreground text-sm">U</span>
                  </div>
                )}
              </div>
            ))}
            {getStatusIndicator()}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-xl border bg-background"
        >
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about your website..."
            className="min-h-12 max-h-32 resize-none rounded-xl border-0 bg-transparent p-4 pr-16 shadow-none focus:outline-none"
            disabled={
              isLoading ||
              status === "thinking" ||
              status === "generating" ||
              status === "deploying" ||
              status === "polling"
            }
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button
              type="submit"
              size="icon"
              className="rounded-full h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90"
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
        </form>
      </div>
    </div>
  );
}
