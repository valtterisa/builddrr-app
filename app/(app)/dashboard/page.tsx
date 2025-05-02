"use client";

import { useState } from "react"; // Removed useEffect as it's not used
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter, // Removed unused component
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
} from "lucide-react";

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

export default function DashboardPage() {
  const router = useRouter();
  // const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter"); // Removed plan state if not needed for this view

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
        <h2 className="text-2xl font-semibold tracking-tight mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Example Quick Action: Create New Post */}
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/dashboard/content?action=createPost")}
          >
            <CardHeader className="flex flex-row items-center space-x-3">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">Create New Post</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Start drafting a new blog or social media post.
              </CardDescription>
            </CardContent>
          </Card>
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
        </div>
      </div>
      <hr className="my-8 border-border" />

      {/* Main Navigation Links */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/website" passHref>
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
        <Link href="/dashboard/content" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col p-4 min-h-[180px]">
            <CardHeader>
              <PenSquare className="h-10 w-10 mb-3 text-primary" />
              <CardTitle>Content Hub</CardTitle>
              <CardDescription>
                Create and manage your content library.
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

        {/* Scheduled Posts Block */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <CalendarClock className="h-5 w-5" />
            <CardTitle>Scheduled Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledPosts.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {scheduledPosts.map((post) => (
                  <li key={post.id}>
                    <strong>{post.title}</strong> - Scheduled for {post.date}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No posts scheduled.
              </p>
            )}
            {/* Link to full schedule view if available */}
            {/* <Button variant="link" size="sm" className="mt-2 p-0 h-auto">View full schedule</Button> */}
          </CardContent>
        </Card>
      </div>

      {/* Separator Line */}
      <hr className="my-8 border-border" />
    </div>
  );
}
