"use client";

import { Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

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

export function AllWebsitesClient({ websites }: WebsitesListProps) {
  const visibleWebsites = websites

  return (
    <div className="px-4 flex flex-col min-h-screen min-w-0">
      <SiteHeader title="All Websites" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
        {visibleWebsites.map((website) => (
          <Card
            key={website.id}
            className="flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow border-primary/20 hover:border-primary"
          >
            <CardHeader className="pb-2 flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-2 text-primary">
                <Globe className="h-7 w-7" />
              </div>
              <CardTitle className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
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
            <CardContent>
              <Link
                href={`/dashboard/website/${website?.previewDetail?.app_name}/domains`}
              >
                <Button variant="outline" size="sm" className="mt-2">
                  Domains
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
