"use client";

import { useState, useEffect } from "react";
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
import { createClient } from "@/utils/supabase/client";

export type MyWebsite = {
  id: string;
  user_id: string;
  name: string;
  url: string;
  template?: string;
  plan?: string;
  created_at: string;
  visits?: number;
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
function constructWebsiteUrl(name: string, uuid: string): string {
  const slug = slugify(name);
  const shortId = uuid.split("-")[0];
  return `/site/${slug}-${shortId}`;
}

export default function WebsitesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState<string | null>(null);

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
        .from("my_websites")
        .select("*")
        .eq("user_id", user.id)
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
      const supabase = createClient();
      const { error } = await supabase
        .from("my_websites")
        .delete()
        .eq("id", websiteToDelete);
      if (!error) {
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
          description: "Failed to delete website. Please try again.",
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

  const filteredWebsites = websites.filter((website) =>
    website.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="container py-10 px-4 md:px-6">Loading...</div>;
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Websites</h1>
          <p className="text-muted-foreground">
            Manage all your websites in one place.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => router.push("/")}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Website
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
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
                  Created on {new Date(website.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-sm text-gray-500">
                      {constructWebsiteUrl(website.name, website.id)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleCopyUrl(
                          constructWebsiteUrl(website.name, website.id)
                        )
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
                  onClick={() => router.push(`editor/${website.id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      constructWebsiteUrl(website.name, website.id),
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Visit
                </Button>
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
                        onClick={() => router.push("/dashboard/domains")}
                      >
                        Set up custom domain
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push("/dashboard/integrations")}
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
              <Plus className="mr-2 h-4 w-4" />
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
