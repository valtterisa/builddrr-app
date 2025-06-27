"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, LoaderCircle, Sparkles, Bug } from "lucide-react";
import { getChatMessages, sendChatMessage, debugRedisMessages } from "@/app/actions";
import ReactMarkdown from "react-markdown";
import { useChatStreamStore, ChatMessage } from "@/lib/chat-stream-store";

interface ChatInterfaceProps {
  className?: string;
  onSendMessage?: (message: string) => Promise<any>;
  appName?: string;
  userId?: string;
  isAutoProcessing?: boolean;
}

export default function ChatInterface({
  className,
  onSendMessage,
  appName,
  userId,
  isAutoProcessing = false,
}: ChatInterfaceProps) {
  const { isStreaming, streamedContent, messages } = useChatStreamStore();
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug logging for props
  useEffect(() => {
    console.log("🔍 [ChatInterface] Props received:", {
      appName,
      userId,
      hasOnSendMessage: !!onSendMessage,
      isAutoProcessing
    });
  }, [appName, userId, onSendMessage, isAutoProcessing]);

  // Auto-scroll to bottom when messages or streamed content changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent]);

  return (
    <div className={className}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Render existing chat messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
            >
              <div className="text-sm">
                {message.isUser ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
              </div>
              <div className={`text-xs mt-1 ${message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Show streamed content */}
        {streamedContent ? (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <ReactMarkdown>{streamedContent}</ReactMarkdown>
            </div>
          </div>
        ) : null}

        {/* Show auto-processing indicator */}
        {isAutoProcessing && !isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">AI is processing your request...</span>
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

          try {
            if (onSendMessage) await onSendMessage(inputValue);
          } catch (error) {
            console.error("Error in onSendMessage:", error);
          } finally {
            setInputValue("");
          }
        }}
        className="flex items-end gap-2 p-4 border-t bg-background"
      >
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none rounded border p-2"
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your request..."
          disabled={isStreaming || isAutoProcessing}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={async () => {
            if (userId && appName) {
              console.log("🐛 [DEBUG] Checking Redis messages...");
              await debugRedisMessages(userId, appName);
            } else {
              console.log("❌ [DEBUG] Missing userId or appName for debug");
            }
          }}
          title="Debug Redis Messages"
        >
          <Bug className="h-4 w-4" />
        </Button>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isStreaming || isAutoProcessing || !inputValue.trim()}
        >
          {isStreaming ? "Streaming..." : isAutoProcessing ? "Processing..." : "Send"}
        </button>
      </form>
    </div>
  );
}
