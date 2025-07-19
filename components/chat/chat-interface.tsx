"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, LoaderCircle, Sparkles, Bug } from "lucide-react";
import {
  getChatMessages,
  sendChatMessage,
  debugRedisMessages,
} from "@/app/actions";
import ReactMarkdown from "react-markdown";
import { useChatStreamStore, ChatMessage } from "@/lib/chat-stream-store";

interface ChatInterfaceProps {
  className?: string;
  onSendMessage?: (message: string) => Promise<any>;
  onAIFinish?: () => void; // Add callback for when AI finishes
  appName?: string;
  userId?: string;
  isAutoProcessing?: boolean;
}

export default function ChatInterface({
  className,
  onSendMessage,
  onAIFinish,
  appName,
  userId,
  isAutoProcessing = false,
}: ChatInterfaceProps) {
  const { isStreaming, streamedContent, messages } = useChatStreamStore();

  // Debug logging for streaming state
  useEffect(() => {
    console.log("🔍 [ChatInterface] Streaming state changed:", {
      isStreaming,
      streamedContentLength: streamedContent?.length || 0,
      streamedContentPreview: streamedContent?.substring(0, 50) + "...",
      hasStreamedContent: !!streamedContent
    });
  }, [isStreaming, streamedContent]);
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLTextAreaElement>(null);

  // Debug logging for props
  useEffect(() => {
    console.log("🔍 [ChatInterface] Props received:", {
      appName,
      userId,
      hasOnSendMessage: !!onSendMessage,
      isAutoProcessing,
    });
  }, [appName, userId, onSendMessage, isAutoProcessing]);

  // Auto-scroll to bottom when messages or streamed content changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedContent]);

  // Detect when AI finishes streaming and call callback
  useEffect(() => {
    console.log("🔍 [ChatInterface] AI finish detection:", {
      isStreaming,
      hasStreamedContent: !!streamedContent,
      streamedContentLength: streamedContent?.length || 0,
      hasOnAIFinish: !!onAIFinish
    });

    if (!isStreaming && streamedContent && onAIFinish) {
      console.log("🎯 [ChatInterface] AI finished, calling onAIFinish callback");
      // Small delay to ensure content is fully processed
      const timer = setTimeout(() => {
        onAIFinish();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, streamedContent, onAIFinish]);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current && shadowRef.current) {
      shadowRef.current.value = inputValue || "";
      const scrollHeight = shadowRef.current.scrollHeight;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(scrollHeight) + "px";
    }
  }, [inputValue]);

  return (
    <div
      className={cn(
        "flex flex-col min-h-0 w-full max-h-[calc(100vh-5rem)]",
        className
      )}
    >
      <div className="flex flex-col-reverse flex-1 min-h-0 w-full">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!inputValue.trim() || isStreaming || isAutoProcessing) {
              return;
            }

            // Clear input immediately
            const messageToSend = inputValue;
            setInputValue("");

            try {
              if (onSendMessage) await onSendMessage(messageToSend);
            } catch (error) {
              console.error("Error in onSendMessage:", error);
            }
          }}
          className="flex items-end p-4 bg-background border-t"
          style={{ boxShadow: "0 -2px 8px 0 rgba(0,0,0,0.02)" }}
        >
          <div className="relative flex-1">
            {/* Hidden shadow textarea for measuring height */}
            <textarea
              ref={shadowRef}
              className="absolute z-[-1] top-0 left-0 w-full h-0 opacity-0 pointer-events-none resize-none"
              tabIndex={-1}
              aria-hidden="true"
              rows={1}
              readOnly
            />
            <textarea
              ref={textareaRef}
              className="flex-1 w-full rounded-xl bg-muted px-4 py-3 pr-10 text-sm shadow-none border-none outline-none focus:ring-0 focus:outline-none placeholder:text-muted-foreground/70 transition resize-none scrollbar-none"
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a follow up..."
              spellCheck={false}
              disabled={isStreaming || isAutoProcessing}
              style={{
                minHeight: "2.5rem",
                overflow: "hidden",
                maxHeight: "none",
              }}
            />
            <button
              type="submit"
              className="absolute bottom-1/2 translate-y-1/2 right-2 bg-primary text-white rounded-full p-2 shadow-sm hover:bg-primary/90 disabled:opacity-50 transition"
              disabled={isStreaming || isAutoProcessing || !inputValue.trim()}
              tabIndex={0}
              aria-label="Send"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </form>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Render existing chat messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
                  }`}
              >
                <div className="text-sm prose prose-sm max-w-none">
                  {message.isUser ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mb-1" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                        em: ({ node, ...props }) => <em className="italic" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs" {...props} />,
                        pre: ({ node, ...props }) => <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                <div
                  className={`text-xs mt-1 ${message.isUser
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                    }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Show streamed content */}
          {streamedContent ? (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="text-sm prose prose-sm max-w-none">
                  {isStreaming ? (
                    // Show as plain text during streaming for smoother experience
                    <div className="whitespace-pre-wrap">{streamedContent}</div>
                  ) : (
                    // Show as markdown when streaming is complete
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mb-1" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                        em: ({ node, ...props }) => <em className="italic" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs" {...props} />,
                        pre: ({ node, ...props }) => <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2" {...props} />,
                      }}
                    >
                      {streamedContent}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Show auto-processing indicator */}
          {isAutoProcessing && !isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">
                    AI is processing your request...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Invisible div for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
