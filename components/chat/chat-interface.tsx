"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, LoaderCircle, Sparkles } from "lucide-react";
import { getChatMessages, sendChatMessage } from "@/app/actions";
import ReactMarkdown from "react-markdown";
import { useChatStreamStore, ChatMessage } from "@/lib/chat-stream-store";

interface ChatInterfaceProps {
  className?: string;
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

// Helper function to extract and render component-analysis blocks
const renderMessageContent = (content: string, isUser: boolean) => {
  if (isUser) {
    return content;
  }

  console.log("🚀 ~ renderMessageContent ~ content:", content)

  // Check if the message contains a component-analysis block
  const componentAnalysisMatch = content.match(/<component-analysis>([\s\S]*?)<\/component-analysis>/);

  if (componentAnalysisMatch) {
    const analysisContent = componentAnalysisMatch[1];
    const beforeAnalysis = content.substring(0, content.indexOf('<component-analysis>'));
    const afterAnalysis = content.substring(content.indexOf('</component-analysis>') + '</component-analysis>'.length);

    return (
      <>
        {beforeAnalysis && <div className="mb-4">{beforeAnalysis}</div>}
        <div className="bg-muted/30 rounded-lg p-4 border border-muted mb-4">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-foreground">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-4 text-foreground">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-3 text-foreground">{children}</h3>,
              p: ({ children }) => <p className="mb-2 text-foreground">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-foreground">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-foreground">{children}</ol>,
              li: ({ children }) => <li className="text-sm text-foreground">{children}</li>,
              code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">{children}</code>,
              pre: ({ children }) => <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mb-2 text-foreground">{children}</pre>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              em: ({ children }) => <em className="italic text-foreground">{children}</em>,
            }}
          >
            {analysisContent}
          </ReactMarkdown>
        </div>
        {afterAnalysis && <div>{afterAnalysis}</div>}
      </>
    );
  }

  // If no component-analysis block, render as plain text
  return content;
};

export default function ChatInterface({
  className,
  onSendMessage,
  appName,
  userId,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Zustand chat stream state
  const { messages, setMessages, addMessage, isStreaming, streamedContent, clear } = useChatStreamStore();
  const prevStreaming = useRef(false);

  // Hydrate Zustand from Redis on mount
  useEffect(() => {
    async function hydrate() {
      if (userId && appName) {
        const msgs = await getChatMessages(userId, appName);
        // Ensure all timestamps are strings
        setMessages(msgs.map(m => ({ ...m, timestamp: typeof m.timestamp === 'string' ? m.timestamp : new Date(m.timestamp).toISOString() })));
      }
    }
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, appName]);

  // Only show welcome if no messages and not streaming
  useEffect(() => {
    if (messages.length === 0 && !isStreaming) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          content: "What changes would you like to make to your website?",
          isUser: false,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isStreaming, messages.length, setMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, streamedContent]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // When streaming finishes, append the streamed message to chat history and persist to Redis
  useEffect(() => {
    if (prevStreaming.current && !isStreaming && streamedContent) {
      const aiMsg: ChatMessage = {
        id: Date.now().toString(),
        content: `<code-analysis>${streamedContent}</code-analysis>`,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      addMessage(aiMsg);
      if (userId && appName) {
        sendChatMessage(userId, appName, aiMsg.content, false);
      }
    }
    prevStreaming.current = isStreaming;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInputValue("");
    setIsLoading(true);
    if (userId && appName) {
      await sendChatMessage(userId, appName, userMessage.content, true);
    }
    try {
      if (onSendMessage) {
        await onSendMessage(userMessage.content);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: "Sorry, there was an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      addMessage(errorMessage);
      if (userId && appName) {
        await sendChatMessage(userId, appName, errorMessage.content, false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className={cn("md:w-[500px] flex flex-col h-full", className)}>
      <div className={cn("flex-1 flex flex-col h-full bg-[#faefff] text-foreground overflow-hidden")}>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && !isStreaming ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p className="text-center max-w-sm">Ask a follow up...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex items-center gap-4">
                  {message.isUser ? (
                    <div className="h-7 w-7 rounded-md bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">who</span>
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-md border border-primary/20 bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="text-sm text-foreground leading-relaxed max-w-[90%]">
                    {renderMessageContent(message.content, message.isUser)}
                  </div>
                </div>
              ))}
              {/* Show the live streaming message if streaming */}
              {isStreaming && streamedContent && (
                <div className="flex items-center gap-4 opacity-80">
                  <div className="h-8 w-8 rounded-md border border-primary/20 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="text-sm text-foreground leading-relaxed max-w-[90%]">
                    {renderMessageContent(`<code-analysis>${streamedContent}</code-analysis>`, false)}
                  </div>
                </div>
              )}
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
              disabled={isLoading || isStreaming}
            />
            <div className="absolute right-2 bottom-12 flex items-center gap-1">
              <Button
                type="submit"
                size="icon"
                className="rounded-md h-7 w-7 bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none"
                disabled={!inputValue.trim() || isLoading || isStreaming}
              >
                <ArrowUp className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center py-3">
              Builddrr may make mistakes. Please use with discretion.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
