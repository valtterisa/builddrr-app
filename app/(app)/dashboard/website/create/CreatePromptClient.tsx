"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/site-header";
import { generateAndSaveProjectName } from "@/lib/actions/save-project-name";

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

export default function CreatePromptClient({ user }: { user: User }) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const promptPlaceholders = [
    "Make a landing page for my new product",
    "I need a website for my cafeteria",
    "Create a landing page for my software startup",
    "Make a cool portfolio for my photography business",
  ];
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isErasing, setIsErasing] = useState(false);

  // Rotating placeholder effect
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

  const handleSend = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const supabase = createClient();
    if (!prompt.trim()) {
      setIsLoading(false);
      return;
    }
    if (!user) {
      localStorage.setItem("builddrr_prompt", prompt);
      setIsLoading(false);
      return;
    }
    sessionStorage.setItem("builddrr_generation_prompt", prompt);
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
      const app_name = previewData[0].app_name;
      const preview_id = previewData[0].preview_id;
      // Update both tables in parallel
      const [websiteUpdate, previewUpdate] = await Promise.all([
        supabase
          .from("websites")
          .insert({
            preview_id: preview_id,
            user_id: user.id,
            name: app_name,
            created_at: new Date().toISOString(),
          })
          .select()
          .single(),
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

      // Generate and save a user-friendly project name using AI
      try {
        const nameResult = await generateAndSaveProjectName(app_name, prompt);
        if (nameResult.success && nameResult.name) {
          console.log("Generated project name:", nameResult.name);
        } else {
          console.warn("Failed to generate project name:", nameResult.error);
        }
      } catch (nameError) {
        console.error("Error generating project name:", nameError);
        // Don't fail the entire process if name generation fails
      }

      router.push(`/dashboard/website/${app_name}/editor`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SiteHeader title="Create Website" />
      <div className="h-full w-full flex flex-col items-center justify-center relative">
        <div className="relative z-10 w-full flex flex-col items-center">
          <p className="py-2 text-base md:text-lg text-gray-500 text-center mb-4 max-w-xl">
            Chat with AI to create your website.
          </p>
          <div className="w-full max-w-xl bg-gray-100 rounded-xl shadow p-4 flex flex-col gap-2">
            <textarea
              className="w-full bg-transparent text-gray-900 text-sm md:text-base resize-none outline-none border-none min-h-[5rem] placeholder:text-gray-400"
              placeholder={displayedPlaceholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2"></div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  className="rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow h-7 w-7"
                  disabled={!prompt.trim() || isLoading}
                  onClick={handleSend}
                >
                  {isLoading ? (
                    <span className="h-5 w-5 flex items-center justify-center">
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    </span>
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
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
    </>
  );
}
