import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Rocket,
  Globe,
  Link as LinkIcon,
  ArrowLeft,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { createSiteForUser } from "@/lib/cloudflare/cloudflare";
import { createClient } from "@/lib/supabase/client";

function EditorHeader({ id }: { id: string }) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPublishMenu, setShowPublishMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingDeployment, setIsLoadingDeployment] = useState(true);
  const pathname = usePathname();

  const { toast } = useToast();

  // Fetch deployment status on component mount
  useEffect(() => {
    const fetchDeploymentStatus = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("websites")
            .select("primary_url, status")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

          if (!error && data?.primary_url) {
            setDeployUrl(data.primary_url);
          }
        }
      } catch (error) {
        console.error("Failed to fetch deployment status:", error);
      } finally {
        setIsLoadingDeployment(false);
      }
    };

    fetchDeploymentStatus();
  }, [id]);

  // Extract repo name from URL path
  const getRepoNameFromUrl = () => {
    // URL pattern: /dashboard/website/{repoName}/editor
    const pathParts = pathname.split("/");
    const websiteIndex = pathParts.findIndex((part) => part === "website");
    if (websiteIndex !== -1 && websiteIndex + 1 < pathParts.length) {
      return pathParts[websiteIndex + 1];
    }
    return id; // fallback to id prop
  };

  // Commented out publish logic

  const handlePublish = async (useCustomDomain: boolean = false) => {
    setIsDeploying(true);
    setShowPublishMenu(false);

    toast({
      title: "Deploying website...",
      description: "Please wait while we deploy your website.",
      variant: "default",
    });

    try {
      const result = await createSiteForUser(id);

      if (!result.ok) {
        toast({
          title: "Error",
          description: "Failed to create site. Please try again.",
          variant: "destructive",
        });
        setIsDeploying(false);
        return;
      }

      const { deploymentUrl } = result;

      toast({
        title: "Success",
        description: "Website deployed successfully.",
        variant: "default",
      });

      setDeployUrl(deploymentUrl ?? null);
      setShowMenu(true);
      setIsDeploying(false);
    } catch (error) {
      console.error("Error deploying website:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deploying.",
        variant: "destructive",
      });
    }
    setIsDeploying(false);
  };

  // Download handler
  const handleDownload = async () => {
    if (isDownloading) return; // Prevent multiple clicks

    setIsDownloading(true);
    try {
      const repoName = getRepoNameFromUrl();
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repoName }),
      });
      if (!response.ok) throw new Error("Failed to download");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `builddrr-output.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Download started", variant: "default" });
    } catch (e: any) {
      toast({
        title: "Download failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-12 border-b flex items-center px-4 gap-2">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" />
        Dashboard
      </Link>

      <div className="flex items-center space-x-2 ml-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-3 w-3" />
            </>
          )}
        </Button>

        {isLoadingDeployment ? (
          <Button size="sm" disabled>
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="hidden sm:inline">Loading...</span>
          </Button>
        ) : deployUrl ? (
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" onClick={() => setShowMenu((v) => !v)}>
                <Rocket className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline flex items-center">
                  Deployed
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <a href={deployUrl} target="_blank" rel="noopener noreferrer">
                  View Deployment
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowMenu(false)}>
                Close
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu
            open={showPublishMenu}
            onOpenChange={setShowPublishMenu}
          >
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                disabled={isDeploying}
                className="focus:outline-none"
              >
                <Rocket className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline flex items-center">
                  {isDeploying ? (
                    <>
                      Deploying...
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    </>
                  ) : (
                    "Publish"
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePublish(false)}>
                <LinkIcon className="h-3 w-3 mr-2" />
                Use Subdomain
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePublish(true)}>
                <Globe className="h-3 w-3 mr-2" />
                Custom Domain
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export default EditorHeader;
