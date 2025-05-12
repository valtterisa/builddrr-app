"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Globe,
  ArrowUpRight,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AuthModal } from "@/components/auth-modal";
import { generateAndDeployWebsite } from "@/app/actions/generate-deploy";
import { toast } from "@/components/ui/use-toast";

const EXAMPLES = [
  "VitePress docs",
  "Crypto portfolio tracker",
  "Kanban board",
  "Weather dashboard",
];

export default function PromptTool() {
  const [prompt, setPrompt] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  // Restore prompt from localStorage if present
  useEffect(() => {
    const savedPrompt = localStorage.getItem("siteforge_prompt");
    if (savedPrompt) {
      setPrompt(savedPrompt);
      localStorage.removeItem("siteforge_prompt");
    }
    // Check auth
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

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

    setLoading(true);
    setGenerationStatus("Generating website content with AI...");

    try {
      // Use our new server action for end-to-end generation and deployment
      setGenerationStatus("Creating your new Fly.io machine...");
      const result = await generateAndDeployWebsite(authData.user.id, prompt);

      if (!result.success || !result.data) {
        throw new Error(
          result.error || "Failed to generate and deploy website"
        );
      }

      const { websiteId, url } = result.data;

      // Store the website ID in localStorage for the editor
      localStorage.setItem("currentWebsiteId", websiteId);

      setGenerationStatus("New website deployed successfully!");
      toast({
        title: "New website created!",
        description:
          "Your website has been generated and deployed successfully.",
      });

      // Navigate to the editor with the new website ID
      router.push(`/dashboard/website/editor/${websiteId}`);
    } catch (error) {
      console.error("Error creating website:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create website",
        variant: "destructive",
      });
      setLoading(false);
      setGenerationStatus(null);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white pb-8 pt-8 px-2 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-6" />
          <div className="text-lg font-semibold text-gray-800">
            {generationStatus || "Generating your website..."}
          </div>
          <div className="text-gray-500 mt-2">
            This usually takes a few seconds.
          </div>
        </div>
      )}
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
          placeholder="Describe the website you want to create..."
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
              disabled={!prompt.trim() || !authChecked || loading}
              onClick={handleSend}
            >
              <ArrowUpRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 my-6">
        <div className="w-24 h-px bg-gray-200" />
        <span className="text-gray-400 uppercase text-sm">or</span>
        <div className="w-24 h-px bg-gray-200" />
      </div>
      <Button
        variant="outline"
        className="group flex items-center gap-2 px-6 py-2.5 rounded-lg border-2 border-purple-200 text-purple-700 font-medium text-sm hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
        onClick={() => router.push("/create")}
      >
        <span>Try Guided Website Builder</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </Button>
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
