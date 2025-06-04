"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "@/components/auth-modal";
import Logo from "../logo";

export default function PromptTool({ user }: { user: any }) {
  const [prompt, setPrompt] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!prompt.trim()) return;
    // Check auth before proceeding
    if (!user) {
      localStorage.setItem("builddrr_prompt", prompt);
      setShowAuthModal(true);
      return;
    }

    // Store the prompt, appName, and clear steps in localStorage for the editor/chat
    sessionStorage.setItem("builddrr_generation_prompt", prompt);

    // Instantly redirect to the editor
    // @TODO: get app name that is generated from the prompt
    // Supabase call
    // router.push(`/dashboard/website/editor/${appName}`);
  };

  const examples = [
    {
      name: "Cafe website",
      prompt: "Make a simple website for my cafe",
    },
    {
      name: "Landing page for a software startup",
      prompt: "Make a landing page for my software startup",
    },
    {
      name: "Portfolio website for a photographer",
      prompt: "Make a portfolio website for my photography business",
    },
    {
      name: "Blog website",
      prompt: "Make a blog website for my blog",
    },
  ];

  const promptPlaceholders = [
    "Make a landing page for my new product",
    "I need a website for my cafeteria",
    "Create a landing page for my software startup",
    "Make a cool portfolio for my photography business",
  ];

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    const currentPrompt = promptPlaceholders[currentPromptIndex];
    let timeout: NodeJS.Timeout;

    if (!isErasing && displayedPlaceholder.length < currentPrompt.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayedPlaceholder(
          currentPrompt.slice(0, displayedPlaceholder.length + 1)
        );
      }, 20);
    } else if (
      !isErasing &&
      displayedPlaceholder.length === currentPrompt.length
    ) {
      // Wait before erasing
      timeout = setTimeout(() => {
        setIsErasing(true);
      }, 2000);
    } else if (isErasing && displayedPlaceholder.length > 0) {
      // Erasing
      timeout = setTimeout(() => {
        setDisplayedPlaceholder(
          currentPrompt.slice(0, displayedPlaceholder.length - 1)
        );
      }, 10);
    } else if (isErasing && displayedPlaceholder.length === 0) {
      // Move to next prompt
      timeout = setTimeout(() => {
        setIsErasing(false);
        setCurrentPromptIndex(
          (prevIndex) => (prevIndex + 1) % promptPlaceholders.length
        );
      }, 100);
    }

    return () => clearTimeout(timeout);
  }, [displayedPlaceholder, isErasing, currentPromptIndex, promptPlaceholders]);

  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center pb-8 pt-12 md:pt-8 px-2 relative overflow-hidden">
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Loading overlay removed; editor/chat will show progress */}
        <h1 className="pt-4 flex items-center text-2xl md:text-5xl font-bold text-gray-900 text-center ">
          Build websites
          <span className="flex items-center">
            <Logo className="md:mx-3 mx-2 h-7 w-7 md:h-16 md:w-16" />
            Builddrr
          </span>
        </h1>
        <p className="py-2 text-base md:text-lg text-gray-500 text-center mb-4 max-w-xl">
          Chat with AI to create your website.
        </p>
        <div className="w-full max-w-xl bg-gray-100 rounded-xl shadow p-4 flex flex-col gap-2">
          <textarea
            className="w-full bg-transparent text-gray-900 text-sm md:text-base resize-none outline-none border-none min-h-[5rem] placeholder:text-gray-400"
            placeholder={displayedPlaceholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 px-1 h-7"
              >
                <Paperclip className="h-4 w-4 mr-1" />{" "}
                <span className="text-xs">Attach</span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                className="rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow h-7 w-7"
                disabled={!prompt.trim()}
                onClick={handleSend}
              >
                <ArrowUpRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            setTimeout(() => handleSend(), 100); // Try again after auth
          }}
        />
        <div className="flex flex-wrap gap-2 pt-4">
          {examples.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setPrompt(example.prompt)}
            >
              {example.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
