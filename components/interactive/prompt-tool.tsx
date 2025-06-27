"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUpRight, ArrowDown, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "@/components/auth-modal";
import Logo from "../logo";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

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

    // If not already on the editor page, redirect to it so the auto-trigger works
    if (!window.location.pathname.includes("/dashboard/website/") || !window.location.pathname.includes("/editor")) {
      const app_name = "plain-nextjs-app";
      router.push(`/dashboard/website/${app_name}/editor`);
      return; // Prevent further execution
    }

    const supabase = createClient();
    try {
      // Get available preview environment
      const { data: previewData, error: previewError } = await supabase
        .from("preview_environments")
        .select("*")
        .eq("status", "non-active")
        .limit(1);

      if (previewError) throw previewError;
      if (!previewData || previewData.length === 0) {
        throw new Error("No available preview environments");
      }

      // const app_name = previewData[0].app_name;
      // const preview_id = previewData[0].preview_id;

      const app_name = "plain-nextjs-app";
      const preview_id = "83e84c99-e616-48ea-9a49-8284eea24f2e";

      // Update both tables in parallel
      const [websiteUpdate, previewUpdate] = await Promise.all([
        supabase
          .from("websites_old")
          .update({ preview_id: preview_id })
          .eq("user_id", user.id),
        supabase
          .from("preview_environments")
          .update({
            status: "active",
            assigned_at: new Date().toISOString(),
            id: user.id,
          })
          .eq("app_name", app_name),
      ]);

      if (websiteUpdate.error) throw websiteUpdate.error;
      if (previewUpdate.error) throw previewUpdate.error;

      console.log("redirecting to editor:", app_name);
      router.push(`/dashboard/website/${app_name}/editor`);
    } catch (error) {
      console.error("Error in handleSend:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
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
    <div className="min-h-[100vh] w-full flex flex-col items-center justify-center pb-8 pt-12 md:pt-8 px-2 relative">
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
      <motion.div
        className="absolute bottom-2 left-0 right-0 w-10 h-10 mx-auto"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown className="w-10 h-10" />
      </motion.div>
    </div>
  );
}
