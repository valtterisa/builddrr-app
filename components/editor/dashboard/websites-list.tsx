import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import React from "react";
import Link from "next/link";

interface Website {
  id: string;
  name: string;
  status: string;
  lastUpdated?: string;
  visitors?: number;
  previewDetail: any;
}

interface WebsitesListProps {
  websites: Website[];
}

export function WebsitesList({ websites }: WebsitesListProps) {
  const [showAll, setShowAll] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "deployed" | "preview">(
    "all"
  );

  const filtered = React.useMemo(() => {
    if (filter === "all") return websites;
    return websites.filter((w) =>
      filter === "deployed" ? w.status === "deployed" : w.status === "preview"
    );
  }, [websites, filter]);

  const visibleWebsites = showAll ? filtered : filtered.slice(0, 6);
  const counts = React.useMemo(
    () => ({
      all: websites.length,
      deployed: websites.filter((w) => w.status === "deployed").length,
      preview: websites.filter((w) => w.status === "preview").length,
    }),
    [websites]
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">All Sites</h2>
      </div>
      <div className="mb-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="rounded-full bg-muted/60 p-1">
            <TabsTrigger
              value="all"
              className="rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow"
            >
              All
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="deployed"
              className="rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow"
            >
              Deployed
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.deployed}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow"
            >
              Preview
              <span className="ml-2 text-xs text-muted-foreground">
                {counts.preview}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {visibleWebsites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted/60 p-6 mb-4">
            <Globe className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No websites yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {filter === "all"
              ? "Get started by creating your first website with our AI-powered builder."
              : filter === "deployed"
                ? "No deployed websites found. Deploy a website to see it here."
                : "No preview websites found. Create a website to see it here."}
          </p>
          <Button asChild>
            <Link href="/dashboard/website/create">Create Website</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleWebsites.map((website) => (
            <Card
              key={website.id}
              className="group relative flex flex-col p-5 shadow-md hover:shadow-lg transition-all border border-black/5  hover:border-primary/40 rounded-xl bg-white ring-1 ring-black/5 dark:ring-white/10"
            >
              <CardHeader className="flex flex-row items-start gap-4 p-0">
                <div className="shrink-0 rounded-full bg-primary/10 p-3 text-primary ring-1 ring-primary/20">
                  <Globe className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle
                    title={website.name}
                    className="text-base font-semibold truncate"
                  >
                    {website.name}
                  </CardTitle>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    {website.previewDetail?.app_name && (
                      <span
                        className="font-mono truncate max-w-[180px]"
                        title={website.previewDetail?.app_name}
                      >
                        {website.previewDetail?.app_name}
                      </span>
                    )}
                    {website.status && (
                      <Badge variant="secondary" className="ml-auto capitalize">
                        {website.status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="mt-4 p-0">
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/website/${website?.previewDetail?.app_name}/editor`}
                  >
                    <Button size="sm">Edit</Button>
                  </Link>
                  <Link
                    href={`/dashboard/website/${website?.previewDetail?.app_name}/domains`}
                  >
                    <Button variant="outline" size="sm">
                      Domains
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {websites.length > 3 && (
        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show Less" : "Show All"}
          </Button>
        </div>
      )}
    </>
  );
}
