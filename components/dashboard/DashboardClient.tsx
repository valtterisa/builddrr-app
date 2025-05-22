"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Plus,
  BarChart3,
  LayoutGrid,
  PenSquare,
  Settings,
  Bell,
  CalendarClock,
  UploadCloud,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Website } from "@/lib/database";
import { SiteHeader } from "../site-header";
import { useState } from "react";
import { QuickActions } from "./quick-actions";
import { MetricsCards } from "./metrics-cards";
import { RecentActivity } from "./recent-activity";
import { WebsitesList } from "./websites-list";

// Mock data for notifications and scheduled posts (replace with actual data fetching)
const notifications = [
  { id: 1, message: "Your new website 'My Portfolio' is live!" },
  { id: 2, message: "Subscription renewal due next week." },
];

type DashboardClientProps = {
  websites: Website[];
  error: string | null;
};

export default function DashboardClient({
  websites,
  error,
}: DashboardClientProps) {
  const router = useRouter();
  const isLoading = false; // Data is loaded server-side

  return (
    <div className="px-4 md:px-6 flex min-h-screen min-w-0">
      <div className="flex-1 min-w-0">
        {/* Header */}
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
