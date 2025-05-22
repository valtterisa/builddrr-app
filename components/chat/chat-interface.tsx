import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUpRight } from "lucide-react";

interface ChatInterfaceProps {
  projectId?: string;
  generationSteps?: string[];
}

function parseSiteforgeSteps(response: string): string[] {
  const match = response.match(
    /<siteforge-steps>([\s\S]*?)<\/siteforge-steps>/
  );
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^<\/?siteforge-steps>/.test(line));
}

export function ChatInterface({
  projectId,
  generationSteps,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "bot"; type?: "normal" | "resource" }[]
  >([
    { text: "Welcome to the chat! How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastStepIndex, setLastStepIndex] = useState(0);
  const [localGenerationSteps, setLocalGenerationSteps] = useState<string[]>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Append new generation steps as bot messages

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    const userMessage = input;
    setInput("");
    setLoading(true);

    if (projectId) {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, projectId }),
        });
        const data = await res.json();
        // Parse and display <siteforge-steps> if present
        const steps = parseSiteforgeSteps(data.response);
        if (steps.length > 0) {
          setLocalGenerationSteps((prev) => [...prev, ...steps]);
        }
        // Show the rest of the response (without <siteforge-steps>)
        const responseWithoutSteps = data.response
          .replace(/<siteforge-steps>[\s\S]*?<\/siteforge-steps>/, "")
          .trim();
        if (responseWithoutSteps) {
          setMessages((prev) => [
            ...prev,
            { text: responseWithoutSteps, sender: "bot" },
          ]);
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, there was an error contacting the AI.",
            sender: "bot",
          },
        ]);
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback: Simulate bot reply if no projectId
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "This is a placeholder response.", sender: "bot" },
        ]);
        setLoading(false);
      }, 600);
    }
  };

  // Accept both input and textarea keydown events
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Render markdown-style links for resource messages
  function renderMessage(msg: { text: string; sender: string; type?: string }) {
    if (msg.type === "resource") {
      // Simple markdown link rendering
      return (
        <span>
          {msg.text.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
            const match = part.match(/\[(.*?)\]\((.*?)\)/);
            if (match) {
              return (
                <a
                  key={i}
                  href={match[2]}
                  className="text-primary underline mx-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {match[1]}
                </a>
              );
            }
            return part;
          })}
        </span>
      );
    }
    return msg.text;
  }

  return (
    <div className="h-full w-full flex flex-col p-4 rounded-3xl">
      <div className="flex-1 overflow-auto mb-2 rounded p-2 flex flex-col gap-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-3 py-2 rounded-lg text-sm shadow-sm ${
              msg.sender === "user"
                ? "bg-primary text-white self-end"
                : "bg-gray-200 text-gray-800 self-start"
            }`}
          >
            {renderMessage(msg)}
          </div>
        ))}
        {loading && (
          <div className="max-w-[80%] px-3 py-2 rounded-lg text-sm shadow-sm bg-gray-100 text-gray-400 self-start animate-pulse">
            AI is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2 mt-2 w-full">
        <div className="flex-1 relative">
          <textarea
            className="w-full bg-white border rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[2.5rem] max-h-32 transition-all placeholder:text-gray-400"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
            style={{ minHeight: 40, maxHeight: 128 }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            type="button"
            tabIndex={-1}
            aria-label="Attach file (coming soon)"
            disabled
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
        <Button
          className="rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow h-10 w-10 flex items-center justify-center disabled:opacity-50 transition-all duration-200"
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          <ArrowUpRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
