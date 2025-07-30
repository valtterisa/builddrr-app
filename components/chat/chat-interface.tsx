"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

import ReactMarkdown from "react-markdown";
import { useChatStreamStore, ChatMessage } from "@/lib/chat-stream-store";

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
      code: ({ node, ...props }: any) => (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-xs" {...props} />
      ),
      pre: ({ node, ...props }: any) => (
        <pre
          className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2"
          {...props}
        />
      ),
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
              // Always render AI messages as markdown for consistent experience
              <ReactMarkdown components={markdownComponents}>
                {message.content}
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
        "flex flex-col min-h-0 w-full max-h-[calc(100vh-5rem)]",
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
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!inputValue.trim() || isStreaming || isAutoProcessing) {
              return;
            }

            // Clear input immediately and show thinking animation
            const messageToSend = inputValue;
            setInputValue("");
            setIsThinking(true);

            try {
              if (onSendMessage) await onSendMessage(messageToSend);
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
      </div>
    </div>
  );
}
