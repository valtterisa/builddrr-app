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
  previewDetail: any;
}

interface WebsitesListProps {
  websites: Website[];
}

export function WebsitesList({ websites }: WebsitesListProps) {
  const [showAll, setShowAll] = React.useState(false);
  const visibleWebsites = showAll ? websites : websites.slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">All Sites</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleWebsites.map((website) => (
          <Card
            key={website.id}
            className="flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow border-primary/20 hover:border-primary"
          >
            <CardHeader className="pb-2 flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-2 text-primary">
                <Globe className="h-7 w-7" />
              </div>
              <CardTitle className="text-lg font-semibold">
                {website.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/dashboard/website/${website?.previewDetail?.app_name}/editor`}
              >
                <Button variant="outline" size="sm" className="mt-2">
                  Edit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {websites.length > 3 && (
        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show Less" : "Show All"}
          </Button>
        </div>
      )}
    </div>
  );
}
