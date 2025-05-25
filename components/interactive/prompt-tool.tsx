"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "@/components/auth-modal";
import { generateAppName } from "@/lib/utils";

const EXAMPLES = [
  "VitePress docs",
  "Crypto portfolio tracker",
  "Kanban board",
  "Weather dashboard",
];

export default function PromptTool() {
  const [prompt, setPrompt] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!prompt.trim()) return;
    // Check auth before proceeding
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      localStorage.setItem("siteforge_prompt", prompt);
      setShowAuthModal(true);
      return;
    }

    const appName = generateAppName(authData.user.id);

    console.log("appName", appName);

    // Store the prompt, appName, and clear steps in localStorage for the editor/chat
    sessionStorage.setItem("siteforge_generation_prompt", prompt);
    sessionStorage.setItem("siteforge_app_name", appName);

    // Instantly redirect to the editor
    router.push(`/dashboard/website/editor/${appName}`);
  };

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
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white pb-8 pt-8 px-2 relative">
      {/* Loading overlay removed; editor/chat will show progress */}
      <h1 className="pt-4 text-2xl md:text-5xl font-bold text-gray-900 text-center mb-2 tracking-tight">
        Build websites with
        <span
          className="ml-2 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent blur-[16px] select-none pointer-events-none"
          aria-hidden="true"
        >
          Siteforge
        </span>
      </h1>
      <p className="py-2 text-base md:text-lg text-gray-500 text-center mb-4 max-w-xl">
        Idea to website in seconds, with your personal website designer
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
    </div>
  );
}
