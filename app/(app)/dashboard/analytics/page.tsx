import type { Metadata } from "next";
import AnalyticsOverview from "@/components/analytics/analytics-overview";
import AdvancedAnalytics from "@/components/analytics/advanced-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/router";

export const metadata: Metadata = {
  title: "Analytics - Social Media Platform",
  description: "Track and analyze your social media performance",
};

// redirect user away for now
const router = useRouter();
router.push("/dashboard/content");

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col space-y-6 container py-10 px-4 md:px-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Analytics Dashboard
        </h2>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-0 space-y-6">
          <AnalyticsOverview />
          <AdvancedAnalytics />
        </TabsContent>
        <TabsContent value="content" className="mt-0">
          <AdvancedAnalytics filterBy="content" />
        </TabsContent>
        <TabsContent value="audience" className="mt-0">
          <AdvancedAnalytics filterBy="audience" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
