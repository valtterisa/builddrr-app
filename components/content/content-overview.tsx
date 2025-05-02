"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, AlertCircle, Info } from "lucide-react";
import { scheduledPosts } from "@/lib/sample-data";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import Link from "next/link";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PerformanceMetrics from "./performance-metrics";

export default function ContentOverview() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">(
    "month"
  );
  const [selectedMetric, setSelectedMetric] = useState<
    "posts" | "engagement" | "reach"
  >("posts");

  // Get current date
  const currentDate = new Date();

  // Calculate stats
  const totalPosts = scheduledPosts.length;
  const scheduledCount = scheduledPosts.filter(
    (post) => new Date(post.date) > currentDate
  ).length;
  const publishedCount = totalPosts - scheduledCount;

  // Platform distribution
  const platformCounts = {
    twitter: scheduledPosts.filter((post) => post.platforms.includes("twitter"))
      .length,
    instagram: scheduledPosts.filter((post) =>
      post.platforms.includes("instagram")
    ).length,
    tiktok: scheduledPosts.filter((post) => post.platforms.includes("tiktok"))
      .length,
  };

  // Media usage
  const withMediaCount = scheduledPosts.filter(
    (post) => post.media && post.media.length > 0
  ).length;
  const withoutMediaCount = totalPosts - withMediaCount;

  // Upcoming posts (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(currentDate.getDate() + 7);
  const upcomingPosts = scheduledPosts
    .filter((post) => {
      const postDate = new Date(post.date);
      return postDate > currentDate && postDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Posts by day of week (for bar chart)
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const postsByDay = daysOfWeek.map((day) => {
    const dayIndex = daysOfWeek.indexOf(day);
    // Generate random engagement and reach metrics for demonstration
    const count = scheduledPosts.filter(
      (post) => new Date(post.date).getDay() === dayIndex
    ).length;
    const engagementRate = Math.round(Math.random() * 8 + 2); // Random 2-10%
    const reach = Math.round(Math.random() * 900 + 100); // Random 100-1000

    return {
      name: day.substring(0, 3),
      posts: count,
      engagement: engagementRate,
      reach: reach,
      // Add color based on engagement rate for visual cue
      color:
        engagementRate > 7
          ? "#22c55e"
          : engagementRate > 4
            ? "#eab308"
            : "#ef4444",
    };
  });

  // Platform distribution data (for pie chart)
  const platformData = [
    {
      name: "X (Twitter)",
      value: platformCounts.twitter,
      color: "#1DA1F2",
      engagementRate: 4.2,
      reach: 750,
    },
    {
      name: "Instagram",
      value: platformCounts.instagram,
      color: "#E1306C",
      engagementRate: 6.8,
      reach: 920,
    },
    {
      name: "TikTok",
      value: platformCounts.tiktok,
      color: "#000000",
      engagementRate: 8.5,
      reach: 1200,
    },
  ];

  // Performance trend over time (for line chart)
  const performanceTrend = [
    { date: "May 1", posts: 2, engagement: 3.5, reach: 450 },
    { date: "May 5", posts: 4, engagement: 4.2, reach: 680 },
    { date: "May 10", posts: 3, engagement: 5.1, reach: 720 },
    { date: "May 15", posts: 5, engagement: 4.7, reach: 830 },
    { date: "May 20", posts: 2, engagement: 6.3, reach: 910 },
    { date: "May 25", posts: 6, engagement: 5.8, reach: 1050 },
    { date: "May 30", posts: 4, engagement: 7.2, reach: 1200 },
  ];

  // Best performing times (for time heat map)
  const bestTimes = [
    { time: "9 AM", engagement: 4.2 },
    { time: "12 PM", engagement: 5.7 },
    { time: "3 PM", engagement: 7.3 },
    { time: "6 PM", engagement: 8.1 },
    { time: "9 PM", engagement: 6.4 },
  ];

  // Function to get status badge
  const getStatusBadge = (date: Date) => {
    if (date < currentDate) {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-600 border-green-200"
        >
          Published
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-600 border-amber-200"
        >
          Scheduled
        </Badge>
      );
    }
  };

  // Function to get the right data based on selected metric
  const getMetricData = (item: any) => {
    switch (selectedMetric) {
      case "engagement":
        return item.engagement;
      case "reach":
        return item.reach;
      default:
        return item.posts;
    }
  };

  // Helper to format metrics for display
  const formatMetric = (value: number, metric: string) => {
    switch (metric) {
      case "engagement":
        return `${value}%`;
      case "reach":
        return value > 1000 ? `${(value / 1000).toFixed(1)}k` : value;
      default:
        return value;
    }
  };

  // Get the color for the chart based on metric
  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "engagement":
        return "#8b5cf6"; // Purple
      case "reach":
        return "#06b6d4"; // Cyan
      default:
        return "#6366f1"; // Indigo
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TooltipProvider>
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Total number of posts across all platforms.</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Published: Posts that have already been published.</p>
                    <p>
                      Scheduled: Posts that are set to be published in the
                      future.
                    </p>
                  </div>
                </TooltipContent>
              </UITooltip>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPosts}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">{publishedCount} published</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs">{scheduledCount} scheduled</span>
                </div>
              </div>
              <div className="h-1 w-full bg-gray-200 mt-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(publishedCount / totalPosts) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Distribution
              </CardTitle>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Distribution of your content across different social media
                    platforms.
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    {platformData.map((platform) => (
                      <div key={platform.name} className="text-center">
                        <div className="font-medium">{platform.name}</div>
                        <div className="text-muted-foreground">
                          Engagement: {platform.engagementRate}%
                        </div>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </UITooltip>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 flex-1">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-blue-600">
                    {platformCounts.twitter} X
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                  <span className="text-xs text-pink-600">
                    {platformCounts.instagram} Instagram
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <div className="h-3 w-3 rounded-full bg-black"></div>
                  <span className="text-xs">
                    {platformCounts.tiktok} TikTok
                  </span>
                </div>
              </div>
              <div className="h-2 w-full flex mt-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${(platformCounts.twitter / totalPosts) * 100}%`,
                  }}
                ></div>
                <div
                  className="h-full bg-pink-500"
                  style={{
                    width: `${(platformCounts.instagram / totalPosts) * 100}%`,
                  }}
                ></div>
                <div
                  className="h-full bg-black"
                  style={{
                    width: `${(platformCounts.tiktok / totalPosts) * 100}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Engagement Overview
              </CardTitle>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    Average engagement rate across all your social media
                    platforms.
                  </p>
                  <div className="mt-2 space-y-1 text-xs">
                    <p>X (Twitter): 4.2% engagement rate</p>
                    <p>Instagram: 6.8% engagement rate</p>
                    <p>TikTok: 8.5% engagement rate</p>
                  </div>
                </TooltipContent>
              </UITooltip>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.5%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average engagement rate
              </p>
              <div className="mt-2 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceTrend}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="#8b5cf6"
                      fill="#8b5cf680"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next Post</CardTitle>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Details about your next scheduled post.</p>
                  {upcomingPosts.length > 0 && (
                    <div className="mt-2 text-xs">
                      <div className="font-medium">Platforms:</div>
                      <div className="flex gap-2 mt-1">
                        {upcomingPosts[0].platforms.map((platform) => (
                          <Badge
                            key={platform}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {platform === "twitter"
                              ? "X"
                              : platform === "instagram"
                                ? "Instagram"
                                : "TikTok"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TooltipContent>
              </UITooltip>
            </CardHeader>
            <CardContent>
              {upcomingPosts.length > 0 ? (
                <>
                  <div className="text-sm font-medium">
                    {new Date(upcomingPosts[0].date).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(upcomingPosts[0].date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="mt-2 line-clamp-2 text-xs border-l-2 pl-2 border-purple-500">
                    {upcomingPosts[0].content.substring(0, 80) + "..."}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm font-medium">No upcoming posts</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Schedule your next post
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>

      {/* Charts and Upcoming Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Content Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>Analysis by day and platform</CardDescription>
              </div>
              <Tabs
                value={selectedMetric}
                onValueChange={(v) =>
                  setSelectedMetric(v as "posts" | "engagement" | "reach")
                }
                className="w-full max-w-[240px]"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  <TabsTrigger value="reach">Reach</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Tabs defaultValue="day" className="w-full">
              <TabsList className="grid w-full max-w-[200px] grid-cols-2">
                <TabsTrigger value="day">By Day</TabsTrigger>
                <TabsTrigger value="platform">By Platform</TabsTrigger>
              </TabsList>
              <TabsContent value="day" className="mt-2">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={postsByDay}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-md shadow-md">
                                <p className="font-medium">{label}</p>
                                <div className="mt-2 space-y-1 text-sm">
                                  <p className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">
                                      Posts:
                                    </span>
                                    <span className="font-medium">
                                      {data.posts}
                                    </span>
                                  </p>
                                  <p className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">
                                      Engagement:
                                    </span>
                                    <span className="font-medium">
                                      {data.engagement}%
                                    </span>
                                  </p>
                                  <p className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">
                                      Reach:
                                    </span>
                                    <span className="font-medium">
                                      {data.reach}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey={selectedMetric}
                        fill={getMetricColor(selectedMetric)}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="platform" className="mt-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border rounded-md shadow-md">
                                  <p className="font-medium">{data.name}</p>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <p className="flex justify-between gap-4">
                                      <span className="text-muted-foreground">
                                        Posts:
                                      </span>
                                      <span className="font-medium">
                                        {data.value}
                                      </span>
                                    </p>
                                    <p className="flex justify-between gap-4">
                                      <span className="text-muted-foreground">
                                        Engagement:
                                      </span>
                                      <span className="font-medium">
                                        {data.engagementRate}%
                                      </span>
                                    </p>
                                    <p className="flex justify-between gap-4">
                                      <span className="text-muted-foreground">
                                        Reach:
                                      </span>
                                      <span className="font-medium">
                                        {data.reach}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium mb-3">
                      Platform Performance
                    </h4>
                    <div className="space-y-4">
                      {platformData.map((platform) => (
                        <div key={platform.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: platform.color }}
                              ></div>
                              <span>{platform.name}</span>
                            </div>
                            <span className="font-medium">
                              {platform.value} posts
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Engagement Rate:</span>
                            <span>{platform.engagementRate}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Reach:</span>
                            <span>{platform.reach}</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(platform.engagementRate / 10) * 100}%`,
                                backgroundColor: platform.color,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Upcoming Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Posts</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPosts.length > 0 ? (
                upcomingPosts.slice(0, 4).map((post, index) => (
                  <Popover key={index}>
                    <PopoverTrigger asChild>
                      <div className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                        <div className="flex flex-col items-center">
                          <div className="text-xs font-medium">
                            {new Date(post.date).toLocaleDateString(undefined, {
                              weekday: "short",
                            })}
                          </div>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border">
                            {new Date(post.date).getDate()}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {post.platforms.map((platform) => (
                                <div key={platform} className="h-3 w-3">
                                  {platform === "twitter" && (
                                    <svg
                                      className="fill-blue-500"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                                    </svg>
                                  )}
                                  {platform === "instagram" && (
                                    <svg
                                      className="fill-pink-500"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M12 2.982c2.937 0 3.285.011 4.445.064 1.072.049 1.655.228 2.042.379.514.2.88.439 1.265.823.385.385.624.751.824 1.265.15.387.33.97.379 2.042.053 1.16.064 1.508.064 4.445 0 2.937-.011 3.285-.064 4.445-.049 1.072-.228 1.655-.379 2.042-.2.514-.439.88-.823 1.265-.385.385-.751.624-1.265.824-.387.15-.97.33-2.042.379-1.16.053-1.508.064-4.445.064-2.937 0-3.285-.011-4.445-.064-1.072-.049-1.655-.228-2.042-.379-.514-.2-.88-.439-1.265-.823-.385-.385-.751-.624-.824-1.265-.15-.387-.33-.97-.379-2.042-.053-1.16-.064-1.508-.064-4.445 0-2.937.011-3.285.064-4.445.049-1.072.228-1.655.379-2.042.2-.514.439-.88.823-1.265.385.385.751-.624 1.265-.824.387-.15.97-.33 2.042-.379 1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066-1.171.054-1.97.24-2.67.512-.724.281-1.337.657-1.949 1.27-.613.612-.989 1.225-1.27 1.949-.272.7-.458 1.499-.512 2.67C1.013 8.638 1 9.013 1 12s.013 3.362.066 4.535c.054 1.171.24 1.97.512 2.67.281.724.657 1.337 1.27 1.949.612.613 1.225.989 1.949 1.27.7.272 1.499.458 2.67.512C8.638 22.987 9.013 23 12 23s3.362-.013 4.535-.066c1.171-.054 1.97-.24 2.67-.512.724-.281 1.337-.657 1.949-1.27.613-.612.989-1.225 1.27-1.949.272-.7.458-1.499.512-2.67C22.987 15.362 23 14.987 23 12s-.013-3.362-.066-4.535c-.054-1.171-.24-1.97-.512-2.67-.281-.724-.657-1.337-1.27-1.949-.612-.613-1.225-.989-1.949-1.27-.7-.272-1.499-.458-2.67-.512C15.362 1.013 14.987 1 12 1Zm0 5.351c-3.121 0-5.649 2.528-5.649 5.649 0 3.121 2.528 5.649 5.649 5.649 3.121 0 5.649-2.528 5.649-5.649 0-3.121-2.528-5.649-5.649-5.649Zm0 9.316c-2.026 0-3.667-1.641-3.667-3.667 0-2.026 1.641-3.667 3.667-3.667 2.026 0 3.667 1.641 3.667 3.667 0 2.026-1.641 3.667-3.667 3.667Zm7.192-9.539c0 .729-.592 1.32-1.321 1.32-.729 0-1.32-.591-1.32-1.32 0-.729.591-1.32 1.32-1.32.729 0 1.321.591 1.321 1.32Z" />
                                    </svg>
                                  )}
                                  {platform === "tiktok" && (
                                    <svg
                                      className="fill-gray-900"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.53-3.295h-3.643v13.636c0 1.355-1.095 2.45-2.45 2.45s-2.45-1.095-2.45-2.45 1.095-2.45 2.45-2.45c.273 0 .537.045.784.127v-3.688a6.13 6.13 0 0 0-.784-.05c-3.362 0-6.088 2.729-6.088 6.09a6.089 6.089 0 0 0 6.088 6.088c3.361 0 6.09-2.727 6.09-6.088V8.967a8.78 8.78 0 0 0 4.948 1.514V7a5.127 5.127 0 0 1-1 .188 5.127 5.127 0 0 1-1-.188V5.562h.001Z" />
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(post.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          <p className="text-xs line-clamp-1">{post.content}</p>
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Post Details</h4>
                        <p className="text-xs text-muted-foreground">
                          Scheduled for{" "}
                          {new Date(post.date).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="text-xs">
                          <span className="font-medium">Platforms:</span>{" "}
                          {post.platforms.map((platform) => (
                            <Badge
                              key={platform}
                              variant="secondary"
                              className="ml-1"
                            >
                              {platform === "twitter"
                                ? "X"
                                : platform === "instagram"
                                  ? "Instagram"
                                  : "TikTok"}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs line-clamp-4">{post.content}</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming posts scheduled
                  </p>
                  <Link href="/dashboard/content/create">
                    <Button variant="outline" size="sm" className="mt-2">
                      Create a Post
                    </Button>
                  </Link>
                </div>
              )}

              {upcomingPosts.length > 4 && (
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View all {upcomingPosts.length} upcoming posts
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Health */}
      <Card>
        <CardHeader>
          <CardTitle>Content Health</CardTitle>
          <CardDescription>
            Recommendations to improve your content strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-md bg-amber-50">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Platform Balance</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Your content is unevenly distributed across platforms.
                  Consider creating more content for TikTok to reach a wider
                  audience.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Media Usage</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Great job using media in your posts! Posts with images or
                  videos typically see 2.3x more engagement.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-md bg-blue-50">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Posting Schedule</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  You have a good distribution of posts throughout the week.
                  Consider scheduling more content on Mondays when engagement is
                  typically higher.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <PerformanceMetrics />
    </div>
  );
}
