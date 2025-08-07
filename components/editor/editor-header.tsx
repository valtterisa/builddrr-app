import React, { useState } from "react";
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

function EditorHeader({ id }: { id: string }) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPublishMenu, setShowPublishMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pathname = usePathname();

  const { toast } = useToast();

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
  /*
  const handlePublish = async (useCustomDomain: boolean = false) => {
    setIsDeploying(true);
    setShowPublishMenu(false);

    toast({
      title: "Deploying website...",
      description: "Please wait while we deploy your website.",
      variant: "default",
    });

    try {
      const deployResult = await fetch("/api/deploy", {
        method: "POST",
        body: JSON.stringify({
          appName: id,
          useCustomDomain,
        }),
      });

      console.log("[deployResult]", deployResult);

      const { url, deploymentId } = await deployResult.json();

      console.log("[url]", url);
      console.log("[deploymentId]", deploymentId);

      const isDeployed = await fetch(`/api/deploy?id=${deploymentId}`, {
        method: "GET",
      });

      console.log("[isDeployed]", isDeployed);

      const { status } = await isDeployed.json();

      if (status === "READY") {
        toast({
          title: "Success",
          description: "Website deployed successfully.",
          variant: "default",
        });
        setDeployUrl("https://placeholder-url.vercel.app");
        setShowMenu(true);
      }
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
  */

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
    <div className="h-10 border-b flex items-center px-4 gap-2">
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
              <Download className="h-3 w-3 mr-1" />
              Download
            </>
          )}
        </Button>

        {/*
        {deployUrl ? (
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
        */}
      </div>
    </div>
  );
}

export default EditorHeader;
