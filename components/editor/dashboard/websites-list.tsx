import { Clock, Globe, Plus, Users } from "lucide-react";
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
}

interface WebsitesListProps {
  websites: Website[];
}

export function WebsitesList({ websites }: WebsitesListProps) {
  const [allPage, setAllPage] = React.useState(1);
  const [activePage, setActivePage] = React.useState(1);
  const [inactivePage, setInactivePage] = React.useState(1);
  const perPage = 10;

  const allWebsites = websites;
  const activeWebsites = websites.filter((w) => w.status === "active");
  const inactiveWebsites = websites.filter((w) => w.status === "inactive");

  const allPageCount = Math.ceil(allWebsites.length / perPage) || 1;
  const activePageCount = Math.ceil(activeWebsites.length / perPage) || 1;
  const inactivePageCount = Math.ceil(inactiveWebsites.length / perPage) || 1;

  const getPaginated = (arr: Website[], page: number) =>
    arr.slice((page - 1) * perPage, page * perPage);

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all">All Websites</TabsTrigger>
        </TabsList>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Website
        </Button>
      </div>
      <TabsContent value="all" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Sites</CardTitle>
            <CardDescription>
              Manage and monitor all your websites
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[450px]">
            <div className="flex flex-wrap gap-4 max-w-[50rem]">
              {getPaginated(allWebsites, allPage).map((website) => (
                <Link
                  href={`/dashboard/website/${website.id}`}
                  key={website.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{website.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t px-6 py-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setAllPage((p) => Math.max(1, p - 1));
                    }}
                    aria-disabled={allPage === 1}
                    tabIndex={allPage === 1 ? -1 : 0}
                  />
                </PaginationItem>
                <div className="text-sm text-muted-foreground">
                  Page {allPage} of {allPageCount}
                </div>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setAllPage((p) => Math.min(allPageCount, p + 1));
                    }}
                    aria-disabled={allPage === allPageCount}
                    tabIndex={allPage === allPageCount ? -1 : 0}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
