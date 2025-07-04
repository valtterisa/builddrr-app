import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Monitor, Rocket, Smartphone } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type ViewportSize = "desktop" | "mobile";

function EditorHeader({ id }: { id: string }) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(id);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const { toast } = useToast();

  // Query supabase here or page load to see if current website is already deployed -> if so, set deployUrl to the url and show menu

  const handlePublish = async () => {
    setIsDeploying(true);
    toast({
      title: "Deploying website...",
      description: "Please wait while we deploy your website.",
      variant: "default",
    });

    try {
      const deployResult = await fetch("/api/deploy", {
        method: "POST",
        body: JSON.stringify({ appName: id }),
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

  return (
    <div className="h-10 border-b flex items-center px-4 gap-2">
      <Link href="/dashboard">
        <Button variant="outline" size="icon">
          <LayoutDashboard className="h-3 w-3 mr-1" />
        </Button>
      </Link>

      <div className="flex items-center space-x-2 ml-auto">
        <Button
          variant={viewportSize === "mobile" ? "default" : "outline"}
          size="icon"
          onClick={() => setViewportSize("mobile")}
          title="Mobile view"
        >
          <Smartphone className="h-3 w-3" />
        </Button>

        <Button
          variant={viewportSize === "desktop" ? "default" : "outline"}
          size="icon"
          onClick={() => setViewportSize("desktop")}
          title="Desktop view"
        >
          <Monitor className="h-3 w-3" />
        </Button>

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
          <Button size="sm" onClick={handlePublish} disabled={isDeploying}>
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
        )}
      </div>
    </div>
  );
}

export default EditorHeader;
