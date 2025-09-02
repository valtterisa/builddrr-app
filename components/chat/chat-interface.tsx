"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

import ReactMarkdown from "react-markdown";
import { useChatStreamStore, ChatMessage } from "@/lib/chat-stream-store";
import { useAIUsage } from "@/hooks/use-ai-usage";
import { trackAIUsage } from "@/lib/ai-usage-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

// Remove code from AI responses and optionally surface friendly file creation lines
function sanitizeAIContent(raw: string): string {
  if (!raw) return raw;

  // Strip any custom <builddrr-*>...</builddrr-*> blocks and standalone tags entirely
  const withoutBuilddrr = raw
    .replace(/<builddrr-[^>]*>[\s\S]*?<\/builddrr-[^>]*>/gi, "")
    .replace(/<builddrr[^>]*\/>/gi, "")
    .replace(/<builddrr[^>]*>/gi, "")
    .replace(/<\/builddrr[^>]*>/gi, "");

  // Remove generic HTML code/pre tags
  const withoutHtmlCode = withoutBuilddrr
    .replace(/<pre[\s\S]*?<\/pre>/gi, "")
    .replace(/<code[\s\S]*?<\/code>/gi, "");

  // Remove fenced code blocks ```...``` and ~~~...~~~
  const withoutFenced = withoutHtmlCode
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "");

  // Remove inline code `...`
  const withoutInline = withoutFenced.replace(/`[^`]*`/g, "");

  // Remove indentation-based code blocks (lines starting with 4+ spaces or a tab)
  const cleaned = withoutInline
    // Strip any remaining HTML-like tags just in case
    .replace(/<[^>]+>/g, "")
    // Remove any lingering builddrr tokens
    .replace(/\b(?:builddrr|ddrr)[-\w]*>?/gi, "");

  const lines = cleaned
    .split(/\r?\n/)
    // Drop any lines that still contain builddrr artifacts
    .filter((line) => !/(builddrr|\bddrr)/i.test(line))
    // Normalize list markers so markdown recognizes them
    .map((line) =>
      line
        // Ensure dash lists have a space after '-'
        .replace(/^-(\S)/, "- $1")
        // Ensure star lists have a space after '*'
        .replace(/^\*(\S)/, "* $1")
        // Ensure plus lists have a space after '+'
        .replace(/^\+(\S)/, "+ $1")
    )
    // Remove lines that are now just stray symbols
    .filter((line) => line.trim() !== ">" && line.trim() !== "-")
    .join("\n");
  return lines;
}

// Memoized chat message component to prevent unnecessary re-renders
const ChatMessageComponent = memo(
  ({
    message,
    isStreaming = false,
    isStreamedContent = false,
  }: {
    message: ChatMessage;
    isStreaming?: boolean;
    isStreamedContent?: boolean;
  }) => {
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
      <div
        className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
      >
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
              // Render AI messages with code stripped and friendly file lines
              <ReactMarkdown components={markdownComponents}>
                {sanitizeAIContent(message.content)}
              </ReactMarkdown>
            )}
          </div>
          <div
            className={`text-xs mt-1 ${
              message.isUser ? "text-neutral-500" : "text-neutral-500"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  }
);

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
  const router = useRouter();
  const { isStreaming, streamedContent, messages } = useChatStreamStore();
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLTextAreaElement>(null);
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

    console.log("🖱️ [ChatInterface] Scroll detected:", {
      scrollTop,
      scrollHeight,
      clientHeight,
      isAtBottom,
      wasUserScrolling: userScrolling,
      willSetUserScrolling: !isAtBottom,
    });

    setUserScrolling(!isAtBottom);

    // Reset user scrolling flag after a delay
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      console.log("⏰ [ChatInterface] Resetting user scrolling flag");
      setUserScrolling(false);
    }, 1000); // 1 second delay
  }, [userScrolling]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;

    if (isThinking || isStreaming) {
      // Force scroll to bottom immediately
      container.scrollTop = container.scrollHeight;

      // Keep scrolling to bottom during streaming
      const interval = setInterval(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isThinking, isStreaming, streamedContent]);

  // Detect when AI finishes streaming and call callback
  const prevIsStreamingRef = useRef<boolean>(false);
  useEffect(() => {
    const wasStreaming = prevIsStreamingRef.current;
    prevIsStreamingRef.current = isStreaming;

    if (wasStreaming && !isStreaming && onAIFinish) {
      const timer = setTimeout(() => {
        onAIFinish();
      }, 500);
      return () => clearTimeout(timer);
    }
    if (isStreaming) {
      setIsThinking(false);
    }
  }, [isStreaming, onAIFinish]);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current && shadowRef.current) {
      shadowRef.current.value = inputValue || "";
      const scrollHeight = shadowRef.current.scrollHeight;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(scrollHeight) + "px";
    }
  }, [inputValue]);

  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) return;

    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }, [messages.length]);

  const handleSubmit = useCallback(async () => {
    if (
      !inputValue.trim() ||
      isStreaming ||
      isAutoProcessing ||
      hasExceededLimits
    ) {
      return;
    }

    // Clear input immediately and show thinking animation
    const messageToSend = inputValue;
    setInputValue("");
    setIsThinking(true);
    setTrackingResult(null);

    try {
      // Send immediately so message appears in chat right away
      if (onSendMessage) {
        await onSendMessage(messageToSend);
      }

      // Track AI usage in the background; do not block sending/rendering
      const estimatedTokens = Math.round(messageToSend.length * 1.3);
      void trackAIUsage("chat", estimatedTokens)
        .then((res) => setTrackingResult(res))
        .catch(() => {
          // ignore tracking errors for UX; keep chat flowing
        });
    } catch (error) {
      console.error("Error in onSendMessage:", error);
      setIsThinking(false);
    }
  }, [
    inputValue,
    isStreaming,
    isAutoProcessing,
    hasExceededLimits,
    onSendMessage,
  ]);

  return (
    <div
      className={cn(
        "flex flex-col min-h-0 w-full max-h-[calc(100dvh-6rem)]",
        className
      )}
    >
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <div
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {/* Render existing chat messages */}
          {messages.map((message) => (
            <ChatMessageComponent
              key={message.id}
              message={message}
              isStreaming={isStreaming}
            />
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
              isStreaming={isStreaming}
              isStreamedContent={true}
            />
          ) : null}

          {/* Show AI loading indicator when thinking or generating */}
          {(isThinking || isStreaming) && (
            <>
              {console.log("🤔 [ChatInterface] Loading component conditions:", {
                isThinking,
                isStreaming,
                hasStreamedContent: !!streamedContent,
                shouldShowLoading: isThinking || isStreaming,
              })}
              <AILoadingComponent />
            </>
          )}

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

        {/* Show limit exceeded warning or tracking result above input */}
        {(hasExceededLimits || trackingResult) && (
          <div className="px-4 pb-2 space-y-2">
            {hasExceededLimits && (
              <div className="flex justify-center">
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Chat Limit Exceeded - Please Upgrade Your Plan
                </Badge>
              </div>
            )}
            {trackingResult && hasExceededLimits && !trackingResult.success && (
              <div
                className={`p-2 rounded-lg border text-xs ${
                  !trackingResult.success &&
                  "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {!trackingResult.success && (
                  <div>❌ {trackingResult.error}</div>
                )}
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-end p-4 bg-background border-t"
          style={{ boxShadow: "0 -2px 8px 0 rgba(0,0,0,0.02)" }}
        >
          <div className="relative flex-1">
            {hasExceededLimits ? (
              <div className="flex items-center justify-between w-full rounded-xl bg-muted px-4 py-3 text-sm border border-neutral-200">
                <div className="flex items-center gap-2 text-neutral-700">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Chat limit exceeded
                </div>
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={() => router.push("/dashboard/account/billing")}
                  type="button"
                >
                  Upgrade Plan
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={"Ask a follow up..."}
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
                  disabled={
                    isStreaming || isAutoProcessing || !inputValue.trim()
                  }
                  tabIndex={0}
                  aria-label="Send"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
