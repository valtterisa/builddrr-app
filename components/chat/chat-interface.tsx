"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

import ReactMarkdown from "react-markdown";
import { useChatStreamStore, ChatMessage } from "@/lib/chat-stream-store";
import { useAIUsage } from "@/hooks/use-ai-usage";
import { trackAIUsage } from "@/lib/ai-usage-tracker";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

// Remove code from AI responses and optionally surface friendly file creation lines
function sanitizeAIContent(raw: string): string {
  if (!raw) return raw;

  // Replace any <builddrr-write file="...">...</builddrr-write> with a friendly line
  const replacedWrites = raw.replace(
    /<builddrr-write\s+file="([^"]+)">([\s\S]*?)<\/builddrr-write\s*>/gi,
    (_match, filePath: string) => {
      const fileName = (filePath || "").split("/").pop() || filePath || "file";
      return `\nCreating file ${fileName}\n`;
    }
  );

  // Strip any <builddrr-code>...</builddrr-code> blocks entirely
  const withoutBuilddrrCode = replacedWrites.replace(
    /<builddrr-code\s*>[\s\S]*?<\/builddrr-code\s*>/gi,
    ""
  );

  // Remove generic HTML code/pre tags
  const withoutHtmlCode = withoutBuilddrrCode
    .replace(/<pre[\s\S]*?<\/pre>/gi, "")
    .replace(/<code[\s\S]*?<\/code>/gi, "");

  // Remove fenced code blocks ```...``` and ~~~...~~~
  const withoutFenced = withoutHtmlCode
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "");

  // Remove inline code `...`
  const withoutInline = withoutFenced.replace(/`[^`]*`/g, "");

  // Remove indentation-based code blocks (lines starting with 4+ spaces or a tab)
  const lines = withoutInline
    .split(/\r?\n/)
    .filter((line) => !/^([\t]|\s{4,})/.test(line))
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
        <h1 className="text-lg font-bold mb-2" {...props} />
      ),
      h2: ({ node, ...props }: any) => (
        <h2 className="text-base font-semibold mb-2" {...props} />
      ),
      h3: ({ node, ...props }: any) => (
        <h3 className="text-sm font-semibold mb-1" {...props} />
      ),
      p: ({ node, ...props }: any) => <p className="mb-2" {...props} />,
      ul: ({ node, ...props }: any) => (
        <ul className="list-disc list-inside mb-2" {...props} />
      ),
      ol: ({ node, ...props }: any) => (
        <ol className="list-decimal list-inside mb-2" {...props} />
      ),
      li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
      strong: ({ node, ...props }: any) => (
        <strong className="font-semibold" {...props} />
      ),
      em: ({ node, ...props }: any) => <em className="italic" {...props} />,
      // Do not render code/pre blocks for AI output
      code: ({ node, ...props }: any) => null,
      pre: ({ node, ...props }: any) => null,
    };

    return (
      <div
        className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[80%] rounded-lg p-3 ${
            message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <div className="text-sm prose prose-sm max-w-none">
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
              message.isUser
                ? "text-primary-foreground/70"
                : "text-muted-foreground"
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
      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
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
          <span className="text-sm text-muted-foreground">Thinking...</span>
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
  useEffect(() => {
    if (!isStreaming && streamedContent && onAIFinish) {
      // Small delay to ensure content is fully processed
      const timer = setTimeout(() => {
        onAIFinish();
      }, 500);
      return () => clearTimeout(timer);
    }
    if (isStreaming) {
      setIsThinking(false);
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

  useEffect(() => {
    if (!messagesContainerRef.current || messages.length === 0) return;

    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }, [messages.length]);

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
          <div className="px-4 pb-2">
            {hasExceededLimits && (
              <div className="flex justify-center">
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Chat Limit Exceeded - Please Upgrade Your Plan
                </Badge>
              </div>
            )}
            {trackingResult && !hasExceededLimits && (
              <div
                className={`p-2 rounded-lg border text-xs ${
                  trackingResult.success
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {trackingResult.success ? (
                  <div className="flex justify-between items-center">
                    <span>✅ Usage tracked successfully</span>
                    <span>
                      Supabase: {trackingResult.supabaseTracked ? "✅" : "❌"} |
                      Polar: {trackingResult.polarTracked ? "✅" : "❌"}
                    </span>
                  </div>
                ) : (
                  <div>❌ {trackingResult.error}</div>
                )}
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();
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
              // Track AI usage
              const estimatedTokens = Math.round(messageToSend.length * 1.3);
              const trackResult = await trackAIUsage("chat", estimatedTokens);
              setTrackingResult(trackResult);

              if (trackResult.success && onSendMessage) {
                await onSendMessage(messageToSend);
              } else if (!trackResult.success) {
                setIsThinking(false);
              }
            } catch (error) {
              console.error("Error in onSendMessage:", error);
              setIsThinking(false);
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
              placeholder={
                hasExceededLimits
                  ? "Chat limit exceeded - please upgrade"
                  : "Ask a follow up..."
              }
              spellCheck={false}
              disabled={isStreaming || isAutoProcessing || hasExceededLimits}
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
                isStreaming ||
                isAutoProcessing ||
                !inputValue.trim() ||
                hasExceededLimits
              }
              tabIndex={0}
              aria-label="Send"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
