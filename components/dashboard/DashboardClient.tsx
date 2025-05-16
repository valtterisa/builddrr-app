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

// Mock data for notifications and scheduled posts (replace with actual data fetching)
const notifications = [
  { id: 1, message: "Your new website 'My Portfolio' is live!" },
  { id: 2, message: "Subscription renewal due next week." },
];

const scheduledPosts = [
  { id: 1, title: "Blog Post: The Future of AI", date: "May 5, 2025" },
  {
    id: 2,
    title: "Social Media Update: New Feature Launch",
    date: "May 7, 2025",
  },
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
    <div className="container py-10 px-4 md:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Navigate your workspace below.
          </p>
        </div>
      </div>
      {/* Quick Actions Section */}
      <div>
        <hr className="my-8 border-border" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Example Quick Action: Create New Website (Duplicate from header for convenience) */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/")}
          >
            <CardHeader className="flex flex-row items-center space-x-3">
              <Plus className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">Create New Website</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Start building a new website project.
              </CardDescription>
            </CardContent>
          </Card>
          {/* Add more quick actions as needed */}
          {/* Example Quick Action: Upload Media */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/dashboard/content?action=uploadMedia")}
          >
            <CardHeader className="flex flex-row items-center space-x-3">
              <UploadCloud className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">Upload Media</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Add new images or videos to your library.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
      <hr className="my-8 border-border" />

      {/* Main Navigation Links */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/website/all" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col p-4 min-h-[180px]">
            <CardHeader>
              <LayoutGrid className="h-10 w-10 mb-3 text-primary" />
              <CardTitle>Manage Websites</CardTitle>
              <CardDescription>
                View, edit, and publish your websites.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/analytics" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col p-4 min-h-[180px]">
            <CardHeader>
              <BarChart3 className="h-10 w-10 mb-3 text-primary" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Track your website performance.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/settings" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col p-4 min-h-[180px]">
            <CardHeader>
              <Settings className="h-10 w-10 mb-3 text-primary" />
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage account, billing, and integrations.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        {/* Add more links as needed */}
      </div>

      {/* Separator Line */}
      <hr className="my-8 border-border" />

      {/* Notifications and Scheduled Posts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications Block */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="flex items-start space-x-2"
                  >
                    <span
                      className="mt-1 block h-2 w-2 flex-shrink-0 rounded-full bg-sky-500"
                      aria-hidden="true"
                    />
                    <span>{notification.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No new notifications.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Separator Line */}
      <hr className="my-8 border-border" />

      {/* Domains Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Domains</h2>
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Custom Domains</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading websites...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>
                  Error loading websites: {error}
                </AlertDescription>
              </Alert>
            ) : websites.filter((site) => site.published).length > 0 ? (
              <div className="space-y-4">
                {websites
                  .filter((site) => site.published)
                  .map((website) => (
                    <div key={website.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{website.name}</h3>
                          <div className="text-sm mt-1">
                            <p>
                              Default URL:{" "}
                              <a
                                href={website.primary_url ?? "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {website.primary_url}
                              </a>
                            </p>
                            {website.primary_url ? (
                              <p className="text-green-600 mt-1">
                                Custom Domain:{" "}
                                <a
                                  href={`https://${website.primary_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {website.primary_url}
                                </a>
                              </p>
                            ) : (
                              <p className="text-muted-foreground mt-1">
                                No custom domain configured
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/dashboard/website/${website.id}/settings`
                            )
                          }
                        >
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No published websites found. Publish a website to configure a
                custom domain.
              </p>
            )}
            <div className="mt-4">
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto"
                onClick={() => router.push("/dashboard/website/all")}
              >
                Manage all websites
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Separator Line */}
      <hr className="my-8 border-border" />
    </div>
  );
}
