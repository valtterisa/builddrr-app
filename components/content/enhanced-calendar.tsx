"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { scheduledPosts } from "@/lib/sample-data";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

export default function EnhancedCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week" | "3day">("month"); // Add "3day"
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [isPostDetailsOpen, setIsPostDetailsOpen] = useState(false);

  // Get the first day of the month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  // Get the last day of the month
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Calculate days from previous month to show
  const daysFromPrevMonth = firstDayOfWeek;

  // Calculate total days to show (including days from previous and next months)
  const totalDays = 42; // 6 rows of 7 days

  // Generate calendar days
  const calendarDays = [];

  // Add days from previous month
  const prevMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  );
  const prevMonthDays = prevMonth.getDate();

  for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
    calendarDays.push({
      date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i),
      isCurrentMonth: false,
    });
  }

  // Add days from current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
      isCurrentMonth: true,
    });
  }

  // Add days from next month
  const remainingDays = totalDays - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
      isCurrentMonth: false,
    });
  }

  // Generate week view if in week mode
  const weekDays: CalendarDay[] = []; // Explicitly type weekDays
  if (viewMode === "week") {
    // Get the first day of the week (Sunday)
    const firstDayOfWeekDate = new Date(currentDate);
    const dayOfWeek = currentDate.getDay();
    firstDayOfWeekDate.setDate(currentDate.getDate() - dayOfWeek);

    // Generate 7 days starting from the first day of the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeekDate);
      date.setDate(firstDayOfWeekDate.getDate() + i);
      weekDays.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      });
    }
  }

  // Generate 3-day view if in 3day mode
  const threeDays: CalendarDay[] = [];
  if (viewMode === "3day") {
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      threeDays.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(), // Keep track if it crosses months
      });
    }
  }

  // Function to check if a day has posts
  const getPostsForDay = (date: Date) => {
    return scheduledPosts.filter(
      (post) =>
        post.date.getDate() === date.getDate() &&
        post.date.getMonth() === date.getMonth() &&
        post.date.getFullYear() === date.getFullYear()
    );
  };

  // Function to navigate to previous month/week/3day
  const goToPrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    } else if (viewMode === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      // 3day view
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 3);
      setCurrentDate(newDate);
    }
  };

  // Function to navigate to next month/week/3day
  const goToNext = () => {
    if (viewMode === "month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    } else if (viewMode === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      // 3day view
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 3);
      setCurrentDate(newDate);
    }
  };

  // Function to go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Function to handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Function to handle post click
  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setIsPostDetailsOpen(true);
  };

  // Function to format date for display
  const formatDateHeader = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("default", {
        month: "long",
        year: "numeric",
      });
    } else if (viewMode === "week" && weekDays.length === 7) {
      // Add check for weekDays length
      const firstDay = weekDays[0].date;
      const lastDay = weekDays[6].date;
      const sameMonth = firstDay.getMonth() === lastDay.getMonth();
      const sameYear = firstDay.getFullYear() === lastDay.getFullYear();

      if (sameMonth && sameYear) {
        return `${firstDay.toLocaleDateString("default", { month: "long", year: "numeric" })}`;
      } else if (sameYear) {
        return `${firstDay.toLocaleDateString("default", { month: "short" })} - ${lastDay.toLocaleDateString("default", { month: "short", year: "numeric" })}`;
      } else {
        return `${firstDay.toLocaleDateString("default", { month: "short", year: "numeric" })} - ${lastDay.toLocaleDateString("default", { month: "short", year: "numeric" })}`;
      }
    } else if (viewMode === "3day" && threeDays.length === 3) {
      const firstDay = threeDays[0].date;
      const lastDay = threeDays[2].date;
      const firstDayStr = firstDay.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      });
      const lastDayStr = lastDay.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      if (firstDay.getFullYear() === lastDay.getFullYear()) {
        if (firstDay.getMonth() === lastDay.getMonth()) {
          return `${firstDay.toLocaleDateString("default", { month: "long" })} ${firstDay.getDate()} - ${lastDay.getDate()}, ${firstDay.getFullYear()}`;
        } else {
          return `${firstDayStr} - ${lastDayStr}`;
        }
      } else {
        return `${firstDayStr}, ${firstDay.getFullYear()} - ${lastDayStr}`;
      }
    }
    return ""; // Add a default return
  };

  // Get today's date for highlighting
  const today = new Date();
  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 sm:p-6">
          {" "}
          {/* Adjusted padding */}
          <div className="flex flex-col space-y-4">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              {" "}
              {/* Responsive flex direction and gap */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {" "}
                {/* Adjusted spacing */}
                <Button variant="outline" size="icon" onClick={goToPrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h3 className="text-base sm:text-lg font-semibold ml-1 sm:ml-2">
                  {formatDateHeader()}
                </h3>{" "}
                {/* Adjusted text size and margin */}
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                {" "}
                {/* Adjusted spacing and width */}
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <div className="border rounded-md p-0.5 sm:p-1 flex">
                  {" "}
                  {/* Adjusted padding & added flex */}
                  <Button
                    variant={viewMode === "month" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-r-none px-2 sm:px-3" // Adjusted padding
                    onClick={() => setViewMode("month")}
                  >
                    Month
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-none border-l border-r px-2 sm:px-3" // Adjusted padding & border
                    onClick={() => setViewMode("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "3day" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-l-none px-2 sm:px-3" // Adjusted padding
                    onClick={() => setViewMode("3day")}
                  >
                    3 Day
                  </Button>
                </div>
              </div>
            </div>

            {/* Calendar Grid - Month View */}
            {viewMode === "month" && (
              <>
                <div className="grid grid-cols-7 gap-px">
                  {/* Use shorter day names on small screens */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center py-2 text-xs sm:text-sm font-medium text-muted-foreground"
                      >
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                      </div>
                    )
                  )}

                  {calendarDays.map((day, index) => {
                    const dayPosts = getPostsForDay(day.date);
                    const isSelected =
                      selectedDate &&
                      selectedDate.getDate() === day.date.getDate() &&
                      selectedDate.getMonth() === day.date.getMonth() &&
                      selectedDate.getFullYear() === day.date.getFullYear();

                    return (
                      <div
                        key={index}
                        className={cn(
                          "min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border border-border relative", // Adjusted min-height and padding
                          day.isCurrentMonth ? "bg-background" : "bg-muted/30",
                          isSelected ? "ring-2 ring-primary z-10" : "", // Added z-index
                          isToday(day.date) ? "bg-blue-50" : ""
                        )}
                        onClick={() => handleDayClick(day.date)}
                      >
                        <div
                          className={cn(
                            "text-xs sm:text-sm font-medium text-center sm:text-left", // Adjusted text size and alignment
                            !day.isCurrentMonth && "text-muted-foreground",
                            isToday(day.date) && "text-blue-600 font-bold"
                          )}
                        >
                          {day.date.getDate()}
                        </div>
                        {/* Simplified post indicators for small screens */}
                        <div className="hidden sm:block mt-1 space-y-1 max-h-[80px] overflow-hidden">
                          {dayPosts.slice(0, 2).map(
                            (
                              post,
                              idx // Show fewer posts on month view
                            ) => (
                              <TooltipProvider key={idx}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        "text-xs p-1 rounded-sm truncate cursor-pointer",
                                        post.platforms.includes("twitter") &&
                                          "bg-blue-100 text-blue-800",
                                        post.platforms.includes("instagram") &&
                                          !post.platforms.includes("twitter") &&
                                          "bg-pink-100 text-pink-800",
                                        post.platforms.includes("tiktok") &&
                                          !post.platforms.includes("twitter") &&
                                          !post.platforms.includes(
                                            "instagram"
                                          ) &&
                                          "bg-gray-900 text-white"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePostClick(post);
                                      }}
                                    >
                                      {post.content.substring(0, 15)}...{" "}
                                      {/* Shorter preview */}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="max-w-xs">
                                      <div className="flex gap-1 mb-1">
                                        {post.platforms.map(
                                          (platform: string) => (
                                            <Badge
                                              key={platform}
                                              variant="outline"
                                              className={cn(
                                                platform === "twitter" &&
                                                  "bg-blue-50 text-blue-600 border-blue-200",
                                                platform === "instagram" &&
                                                  "bg-pink-50 text-pink-600 border-pink-200",
                                                platform === "tiktok" &&
                                                  "bg-gray-900 text-white border-gray-700"
                                              )}
                                            >
                                              {platform === "twitter"
                                                ? "X"
                                                : platform === "instagram"
                                                  ? "Instagram"
                                                  : "TikTok"}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                      <p className="text-sm">{post.content}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {post.date.toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )
                          )}
                          {dayPosts.length > 2 && ( // Adjust count for fewer posts shown
                            <div
                              className="text-xs text-center p-1 bg-muted rounded-sm cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(day.date);
                              }}
                            >
                              +{dayPosts.length - 2} more
                            </div>
                          )}
                        </div>
                        {/* Dot indicators for small screens */}
                        <div className="sm:hidden flex flex-wrap justify-center gap-0.5 mt-1 absolute bottom-1 left-1 right-1">
                          {dayPosts.slice(0, 3).map((post, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                post.platforms.includes("twitter") &&
                                  "bg-blue-500",
                                post.platforms.includes("instagram") &&
                                  !post.platforms.includes("twitter") &&
                                  "bg-pink-500",
                                post.platforms.includes("tiktok") &&
                                  !post.platforms.includes("twitter") &&
                                  !post.platforms.includes("instagram") &&
                                  "bg-gray-900"
                              )}
                            ></div>
                          ))}
                          {dayPosts.length > 3 && (
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></div> // Indicator for more posts
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Calendar Grid - Week View */}
            {viewMode === "week" && (
              <>
                {/* Week Header - Adjusted for smaller screens */}
                <div className="grid grid-cols-7 gap-px">
                  {weekDays.map((day, index) => (
                    <div
                      key={index}
                      className="text-center py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium"
                    >
                      {" "}
                      {/* Increased py */}
                      <div className="text-muted-foreground">
                        {
                          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                            index
                          ]
                        }
                      </div>
                      <div
                        className={cn(
                          "inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full mt-1 sm:mt-1 text-[11px] sm:text-sm", // Increased base size, text size
                          isToday(day.date) ? "bg-blue-600 text-white" : "",
                          !day.isCurrentMonth ? "text-muted-foreground" : ""
                        )}
                      >
                        {day.date.getDate()}
                      </div>
                      {/* Removed month display for week header */}
                    </div>
                  ))}
                </div>

                {/* Week Content Grid */}
                <div className="grid grid-cols-7 gap-px mt-1.5 sm:mt-2 border-t pt-1.5 sm:pt-2">
                  {" "}
                  {/* Increased mt/pt */}
                  {weekDays.map((day, index) => {
                    const dayPosts = getPostsForDay(day.date);
                    const isSelected =
                      selectedDate &&
                      selectedDate.getDate() === day.date.getDate() &&
                      selectedDate.getMonth() === day.date.getMonth() &&
                      selectedDate.getFullYear() === day.date.getFullYear();

                    return (
                      <div
                        key={index}
                        className={cn(
                          "min-h-[150px] sm:min-h-[250px] p-1 sm:p-2 border border-border", // Increased base min-height, base padding
                          day.isCurrentMonth ? "bg-background" : "bg-muted/30",
                          isSelected ? "ring-2 ring-primary z-10" : "",
                          isToday(day.date) ? "bg-blue-50" : ""
                        )}
                        onClick={() => handleDayClick(day.date)}
                      >
                        <div className="space-y-1.5 sm:space-y-2">
                          {" "}
                          {/* Increased base space-y */}
                          {dayPosts.map((post, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "text-[11px] p-1 sm:p-1.5 rounded cursor-pointer border-l-2 sm:border-l-4", // Increased base padding, base text size
                                post.platforms.includes("twitter") &&
                                  "border-blue-500 bg-blue-50",
                                post.platforms.includes("instagram") &&
                                  !post.platforms.includes("twitter") &&
                                  "border-pink-500 bg-pink-50",
                                post.platforms.includes("tiktok") &&
                                  !post.platforms.includes("twitter") &&
                                  !post.platforms.includes("instagram") &&
                                  "border-gray-900 bg-gray-100"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePostClick(post);
                              }}
                            >
                              <div className="flex justify-between items-start gap-0.5 sm:gap-1">
                                {" "}
                                {/* Increased base gap */}
                                <div className="font-medium text-[10px] sm:text-xs flex-shrink-0">
                                  {" "}
                                  {/* Increased base text size */}
                                  {post.date.toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </div>
                                <div className="flex gap-0.5 sm:gap-0.5 flex-shrink-0">
                                  {" "}
                                  {/* Increased base gap */}
                                  {post.platforms.map((platform: string) => (
                                    <div
                                      key={platform}
                                      className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                                    >
                                      {" "}
                                      {/* Increased base icon size */}
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
                                          <path d="M12 2.982c2.937 0 3.285.011 4.445.064 1.072.049 1.655.228 2.042.379.514.2.88.439 1.265.823.385.385.624.751.824 1.265.15.387.33.97.379 2.042.053 1.16.064 1.508.064 4.445 0 2.937-.011 3.285-.064 4.445-.049 1.072-.228 1.655-.379 2.042-.2.514-.439.88-.823 1.265-.385.385-.751.624-1.265.824-.387.15-.97.33-2.042.379-1.16.053-1.508.064-4.445.064-2.937 0-3.285-.011-4.445-.064-1.072-.049-1.655-.228-2.042-.379-.514-.2-.88-.439-1.265-.823-.385-.385-.624-.751-.824-1.265-.15-.387-.33-.97-.379-2.042-.053-1.16-.064-1.508-.064-4.445 0-2.937.011-3.285.064-4.445.049-1.072.228-1.655.379-2.042.2-.514.439-.88.823-1.265.385-.385.751-.624 1.265-.824.387-.15.97-.33 2.042-.379 1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066-1.171.054-1.97.24-2.67.512-.724.281-1.337.657-1.949 1.27-.613.612-.989 1.225-1.27 1.949-.272.7-.458 1.499-.512 2.67C1.013 8.638 1 9.013 1 12s.013 3.362.066 4.535c.054 1.171.24 1.97.512 2.67.281.724.657 1.337 1.27 1.949.612.613 1.225.989 1.949 1.27.7.272 1.499.458 2.67.512C8.638 22.987 9.013 23 12 23s3.362-.013 4.535-.066c1.171-.054 1.97-.24 2.67-.512.724-.281 1.337-.657 1.949-1.27.613-.612.989-1.225 1.27-1.949.272-.7.458-1.499.512-2.67C22.987 15.362 23 14.987 23 12s-.013-3.362-.066-4.535c-.054-1.171-.24-1.97-.512-2.67-.281-.724-.657-1.337-1.27-1.949-.612-.613-1.225-.989-1.949-1.27-.7-.272-1.499-.458-2.67-.512C15.362 1.013 14.987 1 12 1Zm0 5.351c-3.121 0-5.649 2.528-5.649 5.649 0 3.121 2.528 5.649 5.649 5.649 3.121 0 5.649-2.528 5.649-5.649 0-3.121-2.528-5.649-5.649-5.649Zm0 9.316c-2.026 0-3.667-1.641-3.667-3.667 0-2.026 1.641-3.667 3.667-3.667 2.026 0 3.667 1.641 3.667 3.667 0 2.026-1.641 3.667-3.667 3.667Zm7.192-9.539c0 .729-.592 1.32-1.321 1.32-.729 0-1.32-.591-1.32-1.32 0-.729.591-1.32 1.32-1.32.729 0 1.321.591 1.321 1.32Z" />
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
                              </div>
                              <div className="mt-1 sm:mt-1 line-clamp-2 text-[10px] sm:text-xs">
                                {" "}
                                {/* Increased base margin, base text size, adjusted line-clamp */}
                                {post.content}
                              </div>
                            </div>
                          ))}
                          {dayPosts.length === 0 && (
                            <div className="h-full flex items-center justify-center text-[10px] sm:text-xs text-muted-foreground text-center px-1">
                              {" "}
                              {/* Increased base text size, base padding */}
                              No posts
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Calendar Grid - 3 Day View */}
            {viewMode === "3day" && (
              <>
                {/* 3 Day Header */}
                <div className="grid grid-cols-3 gap-px">
                  {threeDays.map((day, index) => (
                    <div
                      key={index}
                      className="text-center py-1 sm:py-2 text-xs sm:text-sm font-medium"
                    >
                      <div className="text-muted-foreground">
                        {day.date.toLocaleDateString("default", {
                          weekday: "short",
                        })}
                      </div>
                      <div
                        className={cn(
                          "inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full mt-1 text-xs sm:text-sm",
                          isToday(day.date) ? "bg-blue-600 text-white" : ""
                        )}
                      >
                        {day.date.getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                        {day.date.toLocaleDateString("default", {
                          month: "short",
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3 Day Content Grid */}
                <div className="grid grid-cols-3 gap-px mt-1 sm:mt-2 border-t pt-1 sm:pt-2">
                  {threeDays.map((day, index) => {
                    const dayPosts = getPostsForDay(day.date);
                    const isSelected =
                      selectedDate &&
                      selectedDate.getDate() === day.date.getDate() &&
                      selectedDate.getMonth() === day.date.getMonth() &&
                      selectedDate.getFullYear() === day.date.getFullYear();

                    return (
                      <div
                        key={index}
                        className={cn(
                          "min-h-[200px] sm:min-h-[400px] p-1 sm:p-2 border border-border", // Adjusted min-height and padding
                          isSelected ? "ring-2 ring-primary z-10" : "",
                          isToday(day.date) ? "bg-blue-50" : "bg-background" // Simplified background
                        )}
                        onClick={() => handleDayClick(day.date)}
                      >
                        <div className="space-y-1 sm:space-y-2">
                          {dayPosts.map((post, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "text-xs p-1 sm:p-2 rounded-md cursor-pointer border-l-2 sm:border-l-4", // Reused week view styling
                                post.platforms.includes("twitter") &&
                                  "border-blue-500 bg-blue-50",
                                post.platforms.includes("instagram") &&
                                  !post.platforms.includes("twitter") &&
                                  "border-pink-500 bg-pink-50",
                                post.platforms.includes("tiktok") &&
                                  !post.platforms.includes("twitter") &&
                                  !post.platforms.includes("instagram") &&
                                  "border-gray-900 bg-gray-100"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePostClick(post);
                              }}
                            >
                              <div className="flex justify-between items-start gap-1">
                                <div className="font-medium text-[10px] sm:text-xs">
                                  {post.date.toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </div>
                                <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                                  {post.platforms.map((platform: string) => (
                                    <div
                                      key={platform}
                                      className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                                    >
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
                                          <path d="M12 2.982c2.937 0 3.285.011 4.445.064 1.072.049 1.655.228 2.042.379.514.2.88.439 1.265.823.385.385.624.751.824 1.265.15.387.33.97.379 2.042.053 1.16.064 1.508.064 4.445 0 2.937-.011 3.285-.064 4.445-.049 1.072-.228 1.655-.379 2.042-.2.514-.439.88-.823 1.265-.385.385-.751.624-1.265.824-.387.15-.97.33-2.042.379-1.16.053-1.508.064-4.445.064-2.937 0-3.285-.011-4.445-.064-1.072-.049-1.655-.228-2.042-.379-.514-.2-.88-.439-1.265-.823-.385-.385-.624-.751-.824-1.265-.15-.387-.33-.97-.379-2.042-.053-1.16-.064-1.508-.064-4.445 0-2.937.011-3.285.064-4.445.049-1.072.228-1.655.379-2.042.2-.514.439-.88.823-1.265.385-.385.751-.624 1.265-.824.387-.15.97-.33 2.042-.379 1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066-1.171.054-1.97.24-2.67.512-.724.281-1.337.657-1.949 1.27-.613.612-.989 1.225-1.27 1.949-.272.7-.458 1.499-.512 2.67C1.013 8.638 1 9.013 1 12s.013 3.362.066 4.535c.054 1.171.24 1.97.512 2.67.281.724.657 1.337 1.27 1.949.612.613 1.225.989 1.949 1.27.7.272 1.499.458 2.67.512C8.638 22.987 9.013 23 12 23s3.362-.013 4.535-.066c1.171-.054 1.97-.24 2.67-.512.724-.281 1.337-.657 1.949-1.27.613-.612.989-1.225 1.27-1.949.272-.7.458-1.499.512-2.67C22.987 15.362 23 14.987 23 12s-.013-3.362-.066-4.535c-.054-1.171-.24-1.97-.512-2.67-.281-.724-.657-1.337-1.27-1.949-.612-.613-1.225-.989-1.949-1.27-.7-.272-1.499-.458-2.67-.512C15.362 1.013 14.987 1 12 1Zm0 5.351c-3.121 0-5.649 2.528-5.649 5.649 0 3.121 2.528 5.649 5.649 5.649 3.121 0 5.649-2.528 5.649-5.649 0-3.121-2.528-5.649-5.649-5.649Zm0 9.316c-2.026 0-3.667-1.641-3.667-3.667 0-2.026 1.641-3.667 3.667-3.667 2.026 0 3.667 1.641 3.667 3.667 0 2.026-1.641 3.667-3.667 3.667Zm7.192-9.539c0 .729-.592 1.32-1.321 1.32-.729 0-1.32-.591-1.32-1.32 0-.729.591-1.32 1.32-1.32.729 0 1.321.591 1.321 1.32Z" />
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
                              </div>
                              <div className="mt-0.5 sm:mt-1 line-clamp-2 text-[11px] sm:text-xs">
                                {post.content}
                              </div>
                            </div>
                          ))}
                          {dayPosts.length === 0 && (
                            <div className="h-full flex items-center justify-center text-[10px] sm:text-xs text-muted-foreground text-center px-1">
                              No posts
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Posts - Adjusted padding */}
      {selectedDate && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            {" "}
            {/* Adjusted padding */}
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              {" "}
              {/* Adjusted margin */}
              <h3 className="text-base sm:text-lg font-semibold">
                {" "}
                {/* Adjusted text size */}
                {selectedDate.toLocaleDateString("default", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(null)}
              >
                Close
              </Button>
            </div>
            <div className="space-y-2 sm:space-y-3 max-h-[40vh] overflow-y-auto">
              {" "}
              {/* Adjusted spacing and added scroll */}
              {getPostsForDay(selectedDate).length > 0 ? (
                getPostsForDay(selectedDate).map((post, index) => (
                  <div
                    key={index}
                    className="p-2 sm:p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors" // Adjusted padding
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="flex justify-between items-start">
                      {" "}
                      {/* Added items-start */}
                      <div className="flex flex-wrap gap-1 mb-1 sm:mb-2">
                        {" "}
                        {/* Added flex-wrap, adjusted gap/margin */}
                        {post.platforms.map((platform: string) => (
                          <Badge
                            key={platform}
                            variant="outline"
                            className={cn(
                              "text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1", // Adjusted text size and padding
                              platform === "twitter" &&
                                "bg-blue-50 text-blue-600 border-blue-200",
                              platform === "instagram" &&
                                "bg-pink-50 text-pink-600 border-pink-200",
                              platform === "tiktok" &&
                                "bg-gray-900 text-white border-gray-700"
                            )}
                          >
                            {platform === "twitter"
                              ? "X"
                              : platform === "instagram"
                                ? "Instagram"
                                : "TikTok"}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0 ml-1">
                        {" "}
                        {/* Adjusted text size */}
                        {post.date.toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                        {/* Ensure consistent time format */}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm">{post.content}</p>{" "}
                    {/* Adjusted text size */}
                    {post.media && post.media.length > 0 && (
                      <div className="mt-2 flex gap-1 sm:gap-2">
                        {" "}
                        {/* Adjusted gap */}
                        {post.media.map((media: string, idx: number) => (
                          <img
                            key={idx}
                            src={media || "/placeholder.svg"}
                            alt={`Media ${idx + 1}`}
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-md object-cover" // Adjusted size
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  {" "}
                  {/* Adjusted padding */}
                  <p className="text-sm">
                    No posts scheduled for this date
                  </p>{" "}
                  {/* Adjusted text size */}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post Details Dialog - Ensure content is scrollable if needed */}
      <Dialog open={isPostDetailsOpen} onOpenChange={setIsPostDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-3 sm:space-y-4 max-h-[80vh] overflow-y-auto pr-3">
              {" "}
              {/* Added max-height, scroll, padding */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-0">
                {" "}
                {/* Responsive flex direction */}
                <div className="flex flex-wrap gap-1">
                  {" "}
                  {/* Added flex-wrap */}
                  {selectedPost.platforms.map((platform: string) => (
                    <Badge
                      key={platform}
                      variant="outline"
                      className={cn(
                        "text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1", // Adjusted text size and padding
                        platform === "twitter" &&
                          "bg-blue-50 text-blue-600 border-blue-200",
                        platform === "instagram" &&
                          "bg-pink-50 text-pink-600 border-pink-200",
                        platform === "tiktok" &&
                          "bg-gray-900 text-white border-gray-700"
                      )}
                    >
                      {platform === "twitter"
                        ? "X"
                        : platform === "instagram"
                          ? "Instagram"
                          : "TikTok"}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-0">
                  {" "}
                  {/* Adjusted text size and margin */}
                  {selectedPost.date.toLocaleDateString("default", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  at{" "}
                  {selectedPost.date.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}{" "}
                  {/* Ensure consistent time format */}
                </div>
              </div>
              <div className="border-t border-b py-2 sm:py-3 text-sm">
                {" "}
                {/* Adjusted padding and text size */}
                <p>{selectedPost.content}</p>
              </div>
              {selectedPost.media && selectedPost.media.length > 0 && (
                <div className="grid grid-cols-2 gap-1 sm:gap-2">
                  {" "}
                  {/* Adjusted gap */}
                  {selectedPost.media.map((media: string, idx: number) => (
                    <img
                      key={idx}
                      src={media || "/placeholder.svg"}
                      alt={`Media ${idx + 1}`}
                      className="rounded-md w-full object-cover aspect-square"
                    />
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 sm:pt-0">
                {" "}
                {/* Adjusted padding */}
                <Button
                  variant="outline"
                  onClick={() => setIsPostDetailsOpen(false)}
                >
                  Close
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {" "}
                      {/* Adjusted size */}
                      <MoreHorizontal className="h-4 w-4 sm:mr-1" />{" "}
                      {/* Adjusted margin */}
                      <span className="hidden sm:inline">Actions</span>{" "}
                      {/* Hide text on small screens */}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Post</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate Post</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
