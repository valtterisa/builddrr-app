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
import DomainConnectionModal from "@/components/domain-connection-modal";
import {
  Sheet,
  SheetContent,
  SheetHeader as SheetHdr,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function EditorHeader({ id }: { id: string }) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPublishMenu, setShowPublishMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoadingDeployment, setIsLoadingDeployment] = useState(true);
  const [showDomainModal, setShowDomainModal] = useState(false);
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


        console.log("user", user);
        console.log("id", id);
        if (user) {
          const { data, error } = await supabase
            .from("websites")
            .select("primary_url, status")
            .eq("app_name", id)
            .eq("user_id", user.id)
            .single();

          console.log("data", data);
          console.log("error", error);

          if (!error && data?.primary_url) {
            console.log("data", data);
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

    const domainType = useCustomDomain ? "custom domain" : "free domain";

    toast({
      title: `Publishing your website with ${domainType}...`,
      description: "Your site will be live in just a moment.",
      variant: "default",
    });

    try {
      const result = await createSiteForUser(id);

      if (!result.ok) {
        toast({
          title: "Publishing failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        setIsDeploying(false);
        return;
      }

      const { deploymentUrl } = result;

      toast({
        title: "🎉 Website is live!",
        description: `Your website is now available on the internet${useCustomDomain ? ". You can now connect your custom domain." : " with a free domain!"}`,
        variant: "default",
      });

      setDeployUrl(deploymentUrl ?? null);
      setIsDeploying(false);
    } catch (error) {
      console.error("Error publishing website:", error);
      toast({
        title: "Publishing failed",
        description: "An unexpected error occurred. Please try again.",
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

      {/* Desktop actions */}
      <div className="hidden md:flex items-center space-x-2 ml-auto">
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
              <Button
                size="sm"
                onClick={() => setShowMenu((v) => !v)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Globe className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline flex items-center">Live</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 p-0">
              <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                    Live Website
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  🎉 Your website is online!
                </p>
                <p className="text-xs text-muted-foreground">
                  Anyone can visit your site with this link
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
                        <p className="text-sm font-medium text-foreground">
                          View Live Website
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {deployUrl?.replace("https://", "")}
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

                <DropdownMenuItem
                  className="p-3 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDomainModal(true);
                  }}
                >
                  <div className="flex items-center justify-center h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-md mr-3 flex-shrink-0">
                    <LinkIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Connect Your Domain
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use your own website address (like mysite.com)
                    </p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="p-3 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(deployUrl || "");
                    toast({
                      title: "Link copied!",
                      description: "Website link copied to clipboard",
                      variant: "default",
                    });
                  }}
                >
                  <div className="flex items-center justify-center h-8 w-8 bg-gray-100 dark:bg-gray-900/30 rounded-md mr-3 flex-shrink-0">
                    <svg
                      className="h-4 w-4 text-gray-600 dark:text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Copy Website Link
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Share your website with others
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
                {isDeploying ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
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
                    <span className="hidden sm:inline">Publishing...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-3 w-3 sm:mr-1" />
                    <span className="hidden sm:inline">Publish</span>
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <div className="p-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Choose how to publish
                </div>

                <DropdownMenuItem
                  onClick={() => handlePublish(false)}
                  className="p-3 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-md mr-3 flex-shrink-0">
                    <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Use Our Free Domain
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Get a free yoursite.builddrr.com address instantly
                    </p>
                  </div>
                  <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                    Free
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setShowPublishMenu(false);
                    setShowDomainModal(true);
                  }}
                  className="p-3 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-md mr-3 flex-shrink-0">
                    <LinkIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Connect Your Domain
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use your own domain like mysite.com
                    </p>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Mobile menu */}
      <div className="md:hidden ml-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" variant="outline">
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" title="Editor menu" className="p-4">
            <SheetHdr className="pb-2">
              <SheetTitle>Editor actions</SheetTitle>
            </SheetHdr>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? "Downloading..." : "Download"}
              </Button>
              {isLoadingDeployment ? (
                <Button size="sm" disabled>
                  Loading...
                </Button>
              ) : deployUrl ? (
                <>
                  <a
                    href={deployUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button size="sm" className="w-full">
                      View Live Website
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(deployUrl || "");
                      toast({
                        title: "Link copied!",
                        description: "Website link copied to clipboard",
                        variant: "default",
                      });
                    }}
                  >
                    Copy Website Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDomainModal(true)}
                  >
                    Connect Your Domain
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => handlePublish(false)}
                    disabled={isDeploying}
                  >
                    {isDeploying ? "Publishing..." : "Publish (Free Domain)"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDomainModal(true)}
                  >
                    Connect Your Domain
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Domain Connection Modal */}
      <DomainConnectionModal
        isOpen={showDomainModal}
        onClose={() => setShowDomainModal(false)}
        websiteId={id}
      />
    </div>
  );
}

export default EditorHeader;
