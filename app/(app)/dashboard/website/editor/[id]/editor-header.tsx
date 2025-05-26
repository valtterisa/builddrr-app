import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Edit,
  Eye,
  Monitor,
  Rocket,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { deployWebsite } from "@/lib/fly";
import { useToast } from "@/hooks/use-toast";

type ViewportSize = "desktop" | "mobile";

function EditorHeader({
  id,
  setIsEditMode,
  isEditMode,
}: {
  id: string;
  setIsEditMode: (isEditMode: boolean) => void;
  isEditMode: boolean;
}) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(id);

  const { toast } = useToast();

  const handleGoLive = async () => {
    toast({
      title: "Deploying website...",
      description: "Please wait while we deploy your website.",
      variant: "default",
    });

    try {
      const deployResult = await deployWebsite(id);

      if (!deployResult.success) {
        toast({
          title: "Error",
          description: deployResult.error || "Failed to deploy the website.",
          variant: "destructive",
        });
        return;
      }

      if (deployResult.data?.url) {
        setWebsiteUrl(deployResult.data.url);
      }

      toast({
        title: "Success",
        description:
          deployResult.data?.message || "Website deployed successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deploying website:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deploying.",
        variant: "destructive",
      });
    } finally {
    }
  };

  return (
    <div className="h-14 border-b flex items-center px-4 gap-2">
      <Link href="/dashboard">
        <Button variant="outline" size="sm">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Dashboard
        </Button>
      </Link>

      <Button
        variant={isEditMode ? "default" : "outline"}
        size="sm"
        onClick={() => setIsEditMode(!isEditMode)}
        title={isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
      >
        {isEditMode ? (
          <Eye className="h-4 w-4 mr-1" />
        ) : (
          <Edit className="h-4 w-4 mr-1" />
        )}
        Edit
      </Button>

      <div className="flex items-center space-x-2 ml-auto">
        <Button
          variant={viewportSize === "mobile" ? "default" : "outline"}
          size="icon"
          onClick={() => setViewportSize("mobile")}
          title="Mobile view"
        >
          <Smartphone className="h-4 w-4" />
        </Button>

        <Button
          variant={viewportSize === "desktop" ? "default" : "outline"}
          size="icon"
          onClick={() => setViewportSize("desktop")}
          title="Desktop view"
        >
          <Monitor className="h-4 w-4" />
        </Button>

        <Button size="sm" onClick={handleGoLive}>
          <Rocket className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Go Live</span>
        </Button>
      </div>
    </div>
  );
}

export default EditorHeader;
