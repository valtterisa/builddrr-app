"use client";

import type { Website } from "@/lib/database";
import { SiteHeader } from "../../site-header";
import { QuickActions } from "./quick-actions";
import { MetricsCards } from "./metrics-cards";
import { RecentActivity } from "./recent-activity";
import { WebsitesList } from "./websites-list";

type DashboardClientProps = {
  websites: Website[];
  error: string | null;
  user: any;
};

export default function DashboardClient({
  websites,
  user,
}: DashboardClientProps) {
  return (
    <div className="px-4 md:px-6 flex min-h-screen min-w-0">
      <div className="flex-1 min-w-0">
        <SiteHeader title="Dashboard" />
        <div className="space-y-8 py-4">
          <MetricsCards />
          <QuickActions />
          <RecentActivity />
          <WebsitesList websites={websites} />
        </div>
      </div>
    </div>
  );
}
