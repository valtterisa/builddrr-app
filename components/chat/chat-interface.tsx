"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Mic, Copy, RefreshCcw } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  className?: string;
  userAvatar?: string;
  assistantAvatar?: string;
}

function MessageLoading() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
    >
      <circle cx="4" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_qFRN"
          begin="0;spinner_OcgL.end+0.25s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor">
        <animate
          begin="spinner_qFRN.begin+0.1s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_OcgL"
          begin="spinner_qFRN.begin+0.2s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
    </svg>
  );
}

function ChatBubble({
  message,
  userAvatar,
  assistantAvatar,
}: {
  message: Message;
  userAvatar?: string;
  assistantAvatar?: string;
}) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-start gap-3 mb-4")}>
      <Avatar className="h-8 w-8 border border-border">
        {isUser ? (
          userAvatar ? (
            <AvatarImage src={userAvatar} alt="User" />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">
              U
            </AvatarFallback>
          )
        ) : assistantAvatar ? (
          <AvatarImage src={assistantAvatar} alt="Assistant" />
        ) : (
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            A
          </AvatarFallback>
        )}
      </Avatar>
      <div
        className={cn(
          "px-6 py-4 w-fit max-w-[80%] text-base bg-muted/80 shadow-lg",
          isUser ? "text-primary" : "text-foreground/90"
        )}
        style={{ borderRadius: 18 }}
      >
        {message.isLoading ? (
          <div className="flex items-center h-6">
            <MessageLoading />
          </div>
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatInterface({
  initialMessages = [],
  className,
  userAvatar,
  assistantAvatar,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setTimeout(() => {
      const loadingMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "",
        role: "assistant",
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages((prev) => [...prev, loadingMessage]);
      setTimeout(() => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const loadingIndex = newMessages.findIndex((m) => m.isLoading);
          if (loadingIndex !== -1) {
            newMessages[loadingIndex] = {
              id: newMessages[loadingIndex].id,
              content:
                "This is a simulated response to your message. In a real implementation, this would be replaced with an actual API call to your backend or AI service.",
              role: "assistant",
              timestamp: new Date(),
            };
          }
          return newMessages;
        });
        setIsLoading(false);
      }, 1500);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background rounded-3xl",
        className
      )}
    >
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                userAvatar={userAvatar}
                assistantAvatar={assistantAvatar}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="border-t p-4">
        <form
          onSubmit={handleSubmit}
          className="relative rounded-xl border bg-background"
        >
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow up question..."
            className="min-h-12 max-h-32 resize-none rounded-xl border-0 bg-transparent p-4 pr-16 shadow-none focus:outline-none"
            disabled={isLoading}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            <Button
              type="submit"
              size="icon"
              className="rounded-full h-8 w-8"
              disabled={!inputValue.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Example usage for development preview
// export default function ChatPage() {
//   const initialMessages: Message[] = [
//     {
//       id: "1",
//       content: "Hello! How can I help you today?",
//       role: "assistant",
//       timestamp: new Date(Date.now() - 100000),
//     },
//     {
//       id: "2",
//       content: "I'm looking for information about your services.",
//       role: "user",
//       timestamp: new Date(Date.now() - 80000),
//     },
//     {
//       id: "3",
//       content: "Of course! We offer a range of services including web development, mobile app development, and UI/UX design. Is there a specific service you're interested in learning more about?",
//       role: "assistant",
//       timestamp: new Date(Date.now() - 60000),
//     },
//   ];
//   return (
//     <div className="h-[600px] w-full max-w-3xl mx-auto border rounded-xl overflow-hidden shadow-lg">
//       <ChatInterface initialMessages={initialMessages} />
//     </div>
//   );
// }
