"use client";

import type React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  ChevronLeft,
  Edit,
  Eye,
  Loader2,
  Monitor,
  Rocket,
  Smartphone,
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import WebsitePreview from "./website-preview";
import Link from "next/link";
import { MediaLibrary } from "../media-library/media-library";
import { useToast } from "@/hooks/use-toast";
import { deployWebsite } from "@/lib/fly";

type ViewportSize = "desktop" | "mobile";

export function WebsiteEditor({
  id,
  user,
  machine,
  appName,
}: {
  id: string;
  user: any;
  machine?: any;
  appName?: string;
}) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
  const [isEditMode, setIsEditMode] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(id);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const [machineData, setMachineData] = useState<any>(machine);

  useEffect(() => {
    setMachineData(machine);
  }, [machine]);

  const handleGoLive = async () => {
    toast({
      title: "Deploying website...",
      description: "Please wait while we deploy your website.",
      variant: "default",
    });

    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl">
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

      <div className="flex flex-1 h-full">
        <div className="flex-1 min-w-0 h-full">
          <WebsitePreview
            isEditMode={isEditMode}
            initialUrl={websiteUrl || undefined}
            id={id}
            machine={machineData}
          />
        </div>
      </div>
    </div>
  );
}

export default WebsiteEditor;
