"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

import ReactMarkdown from "react-markdown";
import { useChatStreamStore, ChatMessage } from "@/lib/chat-stream-store";
import { useAIUsage } from "@/hooks/use-ai-usage";
import { trackAICall } from "@/lib/ai-usage-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Response } from "../ai-elements/response";
import ChatInput from "./chat-input";

// Memoized chat message component to prevent unnecessary re-renders
const ChatMessageComponent = memo(({ message }: { message: ChatMessage }) => {
  // Remove useMemo - object creation is cheap and this only runs once anyway
  const markdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1
        className="text-base font-semibold leading-6 tracking-tight text-black mt-1 mb-2 first:mt-0"
        {...props}
      />
    ),
    h2: ({ node, ...props }: any) => (
      <h2
        className="text-[15px] font-semibold leading-6 tracking-tight text-black mt-1 mb-2 first:mt-0"
        {...props}
      />
    ),
    h3: ({ node, ...props }: any) => (
      <h3
        className="text-sm font-medium leading-5 tracking-tight text-black mt-1 mb-1 first:mt-0"
        {...props}
      />
    ),
    p: ({ node, ...props }: any) => (
      <p className="mb-2 text-black" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul
        className="mb-2 ml-5 list-disc space-y-1.5 marker:text-neutral-600"
        {...props}
      />
    ),
    ol: ({ node, ...props }: any) => (
      <ol
        className="mb-2 ml-5 list-decimal space-y-1.5 marker:text-neutral-600"
        {...props}
      />
    ),
    li: ({ node, ...props }: any) => (
      <li className="pl-1 text-black" {...props} />
    ),
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-black" {...props} />
    ),
    em: ({ node, ...props }: any) => (
      <em className="italic text-black" {...props} />
    ),
    a: ({ node, ...props }: any) => (
      <a
        className="text-blue-600 underline-offset-4 hover:underline break-words"
        target="_blank"
        rel="noreferrer noopener"
        {...props}
      />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="my-2 border-l-2 border-neutral-300 pl-3 text-neutral-700 bg-neutral-50 rounded-r"
        {...props}
      />
    ),
    hr: () => <hr className="my-3 border-t border-neutral-200" />,
    br: () => <br />,
    code: ({ node, ...props }: any) => null,
    pre: ({ node, ...props }: any) => null,
  };

  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-xl p-3 border shadow-sm ${
          message.isUser
            ? "bg-primary/10 border-primary/20"
            : "bg-white border-neutral-200"
        }`}
      >
        <div className="text-sm leading-relaxed text-black space-y-2">
          {message.isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <Response
              components={markdownComponents}
              parseIncompleteMarkdown={false}
            >
              {message.content}
            </Response>
          )}
        </div>
        <div
          className={`text-xs mt-1 ${
            message.isUser ? "text-neutral-500" : "text-neutral-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
});

ChatMessageComponent.displayName = "ChatMessageComponent";

const AILoadingComponent = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-xl p-3 bg-white border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <span className="text-sm text-neutral-600">Thinking...</span>
        </div>
      </div>
    </div>
  );
};

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
  const { streamedContent, messages } = useChatStreamStore();
  const status = useChatStreamStore((s) => s.status);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // AI usage tracking
  const { limits, isLoading: limitsLoading } = useAIUsage();
  const hasExceededLimits = limits.some((limit) => limit.is_exceeded);

  // Auto-scroll state management
  const [userScrolling, setUserScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle user scroll detection
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

    setUserScrolling(!isAtBottom);

    // Reset user scrolling flag after a delay
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      setUserScrolling(false);
    }, 1000); // 1 second delay
  }, [userScrolling]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;

    if (status === "streaming") {
      // Force scroll to bottom immediately
      container.scrollTop = container.scrollHeight;

      // Keep scrolling to bottom during streaming
      const interval = setInterval(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);

      return () => clearInterval(interval);
    }
  }, [status]);

  // Detect when AI finishes streaming and call callback
  const prevStatusRef = useRef<"ready" | "submitted" | "streaming" | "error">(
    "ready"
  );
  useEffect(() => {
    const was = prevStatusRef.current;
    prevStatusRef.current = status;
    if (was === "streaming" && status === "ready" && onAIFinish) {
      const timer = setTimeout(() => {
        onAIFinish();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, onAIFinish]);

  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) return;

    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }, [messages.length]);

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || status !== "ready" || hasExceededLimits) {
      return;
    }

    const messageToSend = inputValue;
    setInputValue("");

    try {
      // Trigger server-side send/stream via provided handler
      if (onSendMessage) {
        await onSendMessage(messageToSend);
      }

      // Track AI usage in the background; do not block sending/rendering
      void trackAICall()
        .then((res) => {})
        .catch(() => {
          // ignore tracking errors for UX; keep chat flowing
        });
    } catch (error) {
      console.error("Error in onSendMessage:", error);
    }
  }, [inputValue, status, hasExceededLimits, onSendMessage]);

  return (
    <div
      className={cn(
        "flex flex-col min-h-0 w-full max-h-[calc(100dvh-6rem)]",
        className
      )}
    >
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <div
          className="flex-1 min-h-0 overflow-y-auto md:p-4 space-y-4 custom-scrollbar"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {/* Render existing chat messages */}
          {messages.map((message) => (
            <ChatMessageComponent key={message.id} message={message} />
          ))}

          {/* Show streamed content */}
          {streamedContent ? (
            <ChatMessageComponent
              message={{
                id: "streaming",
                content: streamedContent,
                isUser: false,
                timestamp: new Date().toISOString(),
              }}
            />
          ) : null}

          {/* Show AI loading indicator when thinking or generating */}
          {status === "streaming" && !streamedContent && (
            <>
              <AILoadingComponent />
            </>
          )}

          {/* Invisible div for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          hasExceededLimits={hasExceededLimits}
          onSubmit={handleSubmit}
          setInputValue={setInputValue}
          value={inputValue}
          disabled={inputValue === "" || status !== "ready"}
          status={status}
        />
      </div>
    </div>
  );
}
