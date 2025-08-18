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
        ) : !deployUrl ? (
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" onClick={() => setShowMenu((v) => !v)}>
                <Rocket className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline flex items-center">
                  Deployed
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 p-0">
              <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                    Live
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  Your site is deployed!
                </p>
                <p className="text-xs text-muted-foreground">
                  Site is live and accessible worldwide
                </p>
              </div>

              <div className="p-2">
                <DropdownMenuItem asChild className="p-0">
                  <a
                    href={deployUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex items-center justify-center h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-md mr-3 flex-shrink-0">
                        <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {deployUrl?.replace("https://", "")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Click to open site
                        </p>
                      </div>
                    </div>
                    <svg
                      className="h-4 w-4 ml-2 flex-shrink-0 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </DropdownMenuItem>

                <DropdownMenuItem className="p-3 hover:bg-accent hover:text-accent-foreground transition-colors">
                  <div className="flex items-center justify-center h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-md mr-3 flex-shrink-0">
                    <LinkIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Add Custom Domain
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use your own domain name
                    </p>
                  </div>
                </DropdownMenuItem>
              </div>
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
