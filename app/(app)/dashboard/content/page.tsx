import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedCalendar from "@/components/content/enhanced-calendar";
import ContentLibrary from "@/components/content/content-library";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import ContentOverview from "@/components/content/content-overview";
import PerformanceMetrics from "@/components/content/performance-metrics";

export const metadata: Metadata = {
  title: "Content Dashboard - Social Media Platform",
  description: "Manage and schedule your social media content",
};

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-6 container py-10 px-4 md:px-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Content Dashboard</h2>
        <Link href="/dashboard/content/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create a Post
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-0">
          <ContentOverview />
          {/* <div className="mt-6">
              <PerformanceMetrics />
            </div> */}
        </TabsContent>
        <TabsContent value="calendar" className="mt-0">
          <EnhancedCalendar />
        </TabsContent>
        <TabsContent value="library" className="mt-0">
          <ContentLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
