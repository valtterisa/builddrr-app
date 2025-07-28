"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Globe, RefreshCw, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface PreviewEnvironment {
  preview_id: string;
  app_name: string;
  machine_id: string;
  status: string;
  assigned_at: string | null;
  id: string | null; // user_id when assigned
  mapping: {
    app_id: string;
    machine_name: string;
    machine_state: string;
    region: string;
    instance_id: string;
    private_ip: string;
    updated_at: string;
  };
}

interface AdminClientProps {
  websiteCount: number;
  previewEnvironments: PreviewEnvironment[];
}

export default function AdminClient({
  websiteCount,
  previewEnvironments: initialPreviewEnvironments,
}: AdminClientProps) {
  const [isCreatingPreview, setIsCreatingPreview] = useState(false);
  const [count, setCount] = useState(1);
  const [previewEnvironments] = useState(initialPreviewEnvironments);
  const { toast } = useToast();

  const createPreviewEnvironment = async () => {
    setIsCreatingPreview(true);
    try {
      // Get the current user's session token
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No valid session found");
      }

      const response = await fetch("/api/create-previews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          count: Number(count),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create preview environment");
      }

      toast({
        title: "Preview Environment Created",
        description:
          data.message ||
          "New preview environment has been set up successfully",
      });

      // Note: Preview environments will be refreshed on next page load
      // since we're fetching server-side
    } catch (error) {
      console.error("Error creating preview environment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create preview environment",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPreview(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "non-active":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: string) => {
    console.log(status);
    switch (status) {
      case "active":
        return "Assigned";
      case "non-active":
        return "Inactive";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">Admin Access</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Total Websites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{websiteCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview Environments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input
                type="number"
                min={1}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-24"
                disabled={isCreatingPreview}
                aria-label="Number of preview environments"
              />
              <span>to create</span>
            </div>
            <Button
              onClick={createPreviewEnvironment}
              disabled={isCreatingPreview || !count || Number(count) < 1}
              className="w-full"
            >
              {isCreatingPreview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Preview Environments
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Preview Environments ({previewEnvironments.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {previewEnvironments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No preview environments found
              </div>
            ) : (
              <div className="space-y-3">
                {previewEnvironments.map((env) => (
                  <div
                    key={env.preview_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{env.app_name}</span>
                        <Badge className={getStatusColor(env.status)}>
                          {getStatusText(env.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Machine: {env.mapping.machine_name} • Region:{" "}
                        {env.mapping.region} • State:{" "}
                        {env.mapping.machine_state}
                      </div>
                      {env.assigned_at && (
                        <div className="text-xs text-gray-400 mt-1">
                          Assigned:{" "}
                          {new Date(env.assigned_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
