"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Add a fullWidth prop to the component to allow for a larger calendar view on the main page
interface ScheduleCalendarProps {
  fullWidth?: boolean;
}

export default function ScheduleCalendar({
  fullWidth = false,
}: ScheduleCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Mock scheduled posts data
  const scheduledPosts = [
    {
      id: 1,
      date: new Date(2025, 4, 2),
      platforms: ["twitter", "instagram"],
      content:
        "Exciting news coming soon! Stay tuned for our big announcement.",
    },
    {
      id: 2,
      date: new Date(2025, 4, 5),
      platforms: ["twitter"],
      content: "Join our webinar on content strategy this Friday!",
    },
    {
      id: 3,
      date: new Date(2025, 4, 8),
      platforms: ["instagram", "tiktok"],
      content: "Behind the scenes look at our new product line.",
    },
  ];

  // Filter posts for the selected date
  const postsForSelectedDate = scheduledPosts.filter(
    (post) =>
      date &&
      post.date.getDate() === date.getDate() &&
      post.date.getMonth() === date.getMonth() &&
      post.date.getFullYear() === date.getFullYear()
  );

  // Function to highlight dates with scheduled posts
  const isDayWithPost = (day: Date) => {
    return scheduledPosts.some(
      (post) =>
        post.date.getDate() === day.getDate() &&
        post.date.getMonth() === day.getMonth() &&
        post.date.getFullYear() === day.getFullYear()
    );
  };

  return (
    <Card className={fullWidth ? "h-full" : ""}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Content Calendar</CardTitle>
        {fullWidth && (
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="flex items-center mr-3">
              <div className="w-3 h-3 rounded-full bg-purple-100 mr-1"></div>
              <span>Scheduled posts</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={`grid ${fullWidth ? "grid-cols-1 lg:grid-cols-3 gap-6" : ""}`}
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              booked: (date) => isDayWithPost(date),
            }}
            modifiersClassNames={{
              booked: "bg-purple-100 font-bold text-purple-900",
            }}
          />

          <div className={`${fullWidth ? "lg:col-span-2" : "mt-6"}`}>
            <h3 className="font-medium text-sm mb-2">
              {date
                ? date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                : "Select a date"}
            </h3>

            {postsForSelectedDate.length > 0 ? (
              <div className="space-y-3">
                {postsForSelectedDate.map((post) => (
                  <div key={post.id} className="p-3 border rounded-md">
                    <div className="flex gap-1 mb-2">
                      {post.platforms.includes("twitter") && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-600 border-blue-200"
                        >
                          <svg
                            className="w-3 h-3 mr-1 fill-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                          </svg>
                          X
                        </Badge>
                      )}
                      {post.platforms.includes("instagram") && (
                        <Badge
                          variant="outline"
                          className="bg-pink-50 text-pink-600 border-pink-200"
                        >
                          <svg
                            className="w-3 h-3 mr-1 fill-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2.982c2.937 0 3.285.011 4.445.064 1.072.049 1.655.228 2.042.379.514.2.88.439 1.265.823.385.385.624.751.824 1.265.15.387.33.97.379 2.042.053 1.16.064 1.508.064 4.445 0 2.937-.011 3.285-.064 4.445-.049 1.072-.228 1.655-.379 2.042-.2.514-.439.88-.823 1.265-.385.385-.751.624-1.265.824-.387.15-.97.33-2.042.379-1.16.053-1.508.064-4.445.064-2.937 0-3.285-.011-4.445-.064-1.072-.049-1.655-.228-2.042-.379-.514-.2-.88-.439-1.265-.823-.385-.385-.624-.751-.824-1.265-.15-.387-.33-.97-.379-2.042-.053-1.16-.064-1.508-.064-4.445 0-2.937.011-3.285.064-4.445.049-1.072.228-1.655.379-2.042.2-.514.439-.88.823-1.265.385-.385.751-.624 1.265-.824.387-.15.97-.33 2.042-.379 1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066-1.171.054-1.97.24-2.67.512-.724.281-1.337.657-1.949 1.27-.613.612-.989 1.225-1.27 1.949-.272.7-.458 1.499-.512 2.67C1.013 8.638 1 9.013 1 12s.013 3.362.066 4.535c.054 1.171.24 1.97.512 2.67.281.724.657 1.337 1.27 1.949.612.613 1.225.989 1.949 1.27.7.272 1.499.458 2.67.512C8.638 22.987 9.013 23 12 23s3.362-.013 4.535-.066c1.171-.054 1.97-.24 2.67-.512.724-.281 1.337-.657 1.949-1.27.613-.612.989-1.225 1.27-1.949.272-.7.458-1.499.512-2.67C22.987 15.362 23 14.987 23 12s-.013-3.362-.066-4.535c-.054-1.171-.24-1.97-.512-2.67-.281-.724-.657-1.337-1.27-1.949-.612-.613-1.225-.989-1.949-1.27-.7-.272-1.499-.458-2.67-.512C15.362 1.013 14.987 1 12 1Zm0 5.351c-3.121 0-5.649 2.528-5.649 5.649 0 3.121 2.528 5.649 5.649 5.649 3.121 0 5.649-2.528 5.649-5.649 0-3.121-2.528-5.649-5.649-5.649Zm0 9.316c-2.026 0-3.667-1.641-3.667-3.667 0-2.026 1.641-3.667 3.667-3.667 2.026 0 3.667 1.641 3.667 3.667 0 2.026-1.641 3.667-3.667 3.667Zm7.192-9.539c0 .729-.592 1.32-1.321 1.32-.729 0-1.32-.591-1.32-1.32 0-.729.591-1.32 1.32-1.32.729 0 1.321.591 1.321 1.32Z" />
                          </svg>
                          Instagram
                        </Badge>
                      )}
                      {post.platforms.includes("tiktok") && (
                        <Badge
                          variant="outline"
                          className="bg-gray-900 text-white border-gray-700"
                        >
                          <svg
                            className="w-3 h-3 mr-1 fill-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.53-3.295h-3.643v13.636c0 1.355-1.095 2.45-2.45 2.45s-2.45-1.095-2.45-2.45 1.095-2.45 2.45-2.45c.273 0 .537.045.784.127v-3.688a6.13 6.13 0 0 0-.784-.05c-3.362 0-6.088 2.729-6.088 6.09a6.089 6.089 0 0 0 6.088 6.088c3.361 0 6.09-2.727 6.09-6.088V8.967a8.78 8.78 0 0 0 4.948 1.514V7a5.127 5.127 0 0 1-1 .188 5.127 5.127 0 0 1-1-.188V5.562h.001Z" />
                          </svg>
                          TikTok
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {post.date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border rounded-md">
                <p className="text-sm text-muted-foreground">
                  No posts scheduled for this date
                </p>
                <Link href="/dashboard/content/create">
                  <Button variant="outline" className="mt-3">
                    Create a Post
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
