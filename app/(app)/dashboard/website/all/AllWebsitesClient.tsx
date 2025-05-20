"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Plus,
  Edit,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Search,
  Rocket,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { deleteProjectById, deployWebsite } from "@/lib/fly";
import { SiteHeader } from "@/components/site-header";
import Loading from "@/app/loading";

export type MyWebsite = {
  id: string;
  user_id: string;
  name: string;
  primary_url: string;
  template?: string;
  plan?: string;
  created_at: string;
  custom_domain?: string;
  status?: string;
  description?: string; // Added optional description field
  content?: string; // Added optional content field
  published?: boolean; // Added optional published field
  template_id?: string; // Added optional template_id field
  settings?: Record<string, any>; // Added optional settings field
  machine_id?: string; // Added optional machine_id field
  app_name?: string; // Added optional app_name field
  preview_url?: string; // Added optional preview_url field
  last_deployed?: string; // Added optional last_deployed field
  repository_url?: string; // Added optional repository_url field
  subdomain?: string; // Added optional subdomain field
  primary_domain?: string; // Added optional primary_domain field
};

// Helper to slugify a string
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^a-z0-9-]/g, "") // Remove all non-alphanumeric except -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .replace(/^-+|-+$/g, ""); // Trim - from start/end
}

// Helper to construct unique url
function constructWebsiteUrl(website: MyWebsite): string {
  if (website.primary_url) {
    return website.primary_url!;
  } else {
    return website.preview_url!;
  }
}

export default function AllWebsitesClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState<string | null>(null);
  const [deployingWebsiteId, setDeployingWebsiteId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchWebsites = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user) {
        setWebsites([]);
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("websites")
        .select(
          "id, name, description, published, template_id, primary_url, settings, machine_id, app_name, status, preview_url, last_deployed, repository_url, subdomain, primary_domain, created_at"
        )
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) {
        setWebsites([]);
      } else {
        setWebsites(data || []);
      }
      setIsLoading(false);
    };
    fetchWebsites();
  }, []);

  const handleDeleteWebsite = (id: string) => {
    setWebsiteToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (websiteToDelete) {
      const result = await deleteProjectById(websiteToDelete);
      if (result.success) {
        setWebsites(
          websites.filter((website) => website.id !== websiteToDelete)
        );
        toast({
          title: "Website deleted",
          description: "Your website has been successfully deleted.",
        });
      } else {
        toast({
          title: "Error",
          description:
            result.error || "Failed to delete website. Please try again.",
          variant: "destructive",
        });
      }
      setShowDeleteDialog(false);
      setWebsiteToDelete(null);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "Website URL copied to clipboard.",
    });
  };

  // Handle website deployment directly
  const handleDeploy = async (websiteId: string) => {
    setDeployingWebsiteId(websiteId);

    toast({
      title: "Deploying website...",
      description: "Please wait while we deploy your website.",
      variant: "default",
    });

    try {
      const deployResult = await deployWebsite(websiteId);

      if (!deployResult.success) {
        toast({
          title: "Error",
          description: deployResult.error || "Failed to deploy the website.",
          variant: "destructive",
        });
        return;
      }

      // Update the website status in the local state
      setWebsites(
        websites.map((website) =>
          website.id === websiteId
            ? { ...website, status: "deployed" }
            : website
        )
      );

      toast({
        title: "Success",
        description:
          deployResult.data?.message || "Website deployed successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during deployment.",
        variant: "destructive",
      });
    } finally {
      setDeployingWebsiteId(null);
    }
  };

  const filteredWebsites = websites.filter((website) =>
    website.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 md:px-6">
      <SiteHeader title="My Websites" />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 pt-4">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search websites..."
            className="pl-8 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="w-full md:w-auto">
            Sort: Newest
          </Button>
          <Button variant="outline" className="w-full md:w-auto">
            Filter
          </Button>
        </div>
      </div>

      {filteredWebsites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWebsites.map((website) => (
            <Card key={website.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Globe className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-background capitalize">
                    {website.plan}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle>{website.name}</CardTitle>
                <CardDescription>
                  Created on{" "}
                  {format(new Date(website.created_at), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-sm text-gray-500">
                      {constructWebsiteUrl(website)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleCopyUrl(constructWebsiteUrl(website))
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`editor/${website.app_name}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {website.status === "deployed" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(constructWebsiteUrl(website), "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeploy(website.id)}
                    disabled={
                      deployingWebsiteId === website.id ||
                      website.status === "deploying"
                    }
                  >
                    {deployingWebsiteId === website.id ||
                    website.status === "deploying" ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Rocket className="h-4 w-4 mr-1" />
                    )}
                    {website.status === "deploying" ? "Deploying..." : "Deploy"}
                  </Button>
                )}
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel hidden>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push("/dashboard/website/domains")
                        }
                      >
                        Set up custom domain
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push("/dashboard/website/integrations")
                        }
                      >
                        Connect integrations
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteWebsite(website.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Delete website
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No websites found</CardTitle>
            <CardDescription>
              {searchQuery
                ? "No websites match your search query."
                : "You haven't created any websites yet."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")}>
              \n <Plus className="mr-2 h-4 w-4" />
              Create Website
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Website</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this website? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
