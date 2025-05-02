"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartTooltip, ChartTooltipContent, ChartTooltipItem } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

// Sample engagement data
const engagementData = [
  { date: "May 1", twitter: 245, instagram: 352, tiktok: 189 },
  { date: "May 2", twitter: 312, instagram: 418, tiktok: 256 },
  { date: "May 3", twitter: 279, instagram: 387, tiktok: 312 },
  { date: "May 4", twitter: 294, instagram: 402, tiktok: 345 },
  { date: "May 5", twitter: 321, instagram: 489, tiktok: 367 },
  { date: "May 6", twitter: 358, instagram: 521, tiktok: 412 },
  { date: "May 7", twitter: 397, instagram: 578, tiktok: 456 },
]

// Sample reach data
const reachData = [
  { date: "May 1", twitter: 1245, instagram: 2352, tiktok: 1589 },
  { date: "May 2", twitter: 1312, instagram: 2418, tiktok: 1756 },
  { date: "May 3", twitter: 1279, instagram: 2387, tiktok: 1912 },
  { date: "May 4", twitter: 1294, instagram: 2402, tiktok: 2045 },
  { date: "May 5", twitter: 1321, instagram: 2489, tiktok: 2167 },
  { date: "May 6", twitter: 1358, instagram: 2521, tiktok: 2312 },
  { date: "May 7", twitter: 1397, instagram: 2578, tiktok: 2456 },
]

// Sample content type performance
const contentTypeData = [
  { name: "Images", value: 45, color: "#4ade80" },
  { name: "Videos", value: 30, color: "#f472b6" },
  { name: "Text Only", value: 15, color: "#60a5fa" },
  { name: "Links", value: 10, color: "#c084fc" },
]

// Sample audience demographics
const audienceData = [
  { name: "18-24", value: 25, color: "#4ade80" },
  { name: "25-34", value: 35, color: "#f472b6" },
  { name: "35-44", value: 20, color: "#60a5fa" },
  { name: "45+", value: 20, color: "#c084fc" },
]

export default function PerformanceMetrics() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("week")
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)

  // Platform colors
  const platformColors = {
    twitter: "#1DA1F2",
    instagram: "#E1306C",
    tiktok: "#000000",
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Performance Metrics</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Time Range:</span>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="week" className="text-xs px-3">
                Week
              </TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3">
                Month
              </TabsTrigger>
              <TabsTrigger value="quarter" className="text-xs px-3">
                Quarter
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Engagement Chart */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Engagement</CardTitle>
            <CardDescription>Likes, comments, shares, and saves</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent>
                            <div className="font-medium">{label}</div>
                            {payload.map((entry, index) => (
                              <ChartTooltipItem
                                key={`item-${index}`}
                                label={
                                  entry.name === "twitter"
                                    ? "X (Twitter)"
                                    : entry.name === "instagram"
                                      ? "Instagram"
                                      : "TikTok"
                                }
                                value={`${entry.value} engagements`}
                                color={entry.color}
                              />
                            ))}
                          </ChartTooltipContent>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="twitter"
                    stroke={platformColors.twitter}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="twitter"
                    onMouseEnter={() => setHoveredPlatform("twitter")}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    strokeOpacity={hoveredPlatform && hoveredPlatform !== "twitter" ? 0.3 : 1}
                  />
                  <Line
                    type="monotone"
                    dataKey="instagram"
                    stroke={platformColors.instagram}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="instagram"
                    onMouseEnter={() => setHoveredPlatform("instagram")}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    strokeOpacity={hoveredPlatform && hoveredPlatform !== "instagram" ? 0.3 : 1}
                  />
                  <Line
                    type="monotone"
                    dataKey="tiktok"
                    stroke={platformColors.tiktok}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="tiktok"
                    onMouseEnter={() => setHoveredPlatform("tiktok")}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    strokeOpacity={hoveredPlatform && hoveredPlatform !== "tiktok" ? 0.3 : 1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div
                className="flex items-center gap-1 cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredPlatform("twitter")}
                onMouseLeave={() => setHoveredPlatform(null)}
                style={{ opacity: hoveredPlatform && hoveredPlatform !== "twitter" ? 0.5 : 1 }}
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platformColors.twitter }}></div>
                <span className="text-xs">X (Twitter)</span>
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredPlatform("instagram")}
                onMouseLeave={() => setHoveredPlatform(null)}
                style={{ opacity: hoveredPlatform && hoveredPlatform !== "instagram" ? 0.5 : 1 }}
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platformColors.instagram }}></div>
                <span className="text-xs">Instagram</span>
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredPlatform("tiktok")}
                onMouseLeave={() => setHoveredPlatform(null)}
                style={{ opacity: hoveredPlatform && hoveredPlatform !== "tiktok" ? 0.5 : 1 }}
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platformColors.tiktok }}></div>
                <span className="text-xs">TikTok</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reach Chart */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reach</CardTitle>
            <CardDescription>Total number of unique viewers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reachData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent>
                            <div className="font-medium">{label}</div>
                            {payload.map((entry, index) => (
                              <ChartTooltipItem
                                key={`item-${index}`}
                                label={
                                  entry.name === "twitter"
                                    ? "X (Twitter)"
                                    : entry.name === "instagram"
                                      ? "Instagram"
                                      : "TikTok"
                                }
                                value={`${entry.value.toLocaleString()} views`}
                                color={entry.color}
                              />
                            ))}
                          </ChartTooltipContent>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="twitter"
                    fill={platformColors.twitter}
                    radius={[4, 4, 0, 0]}
                    name="twitter"
                    onMouseEnter={() => setHoveredPlatform("twitter")}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    fillOpacity={hoveredPlatform && hoveredPlatform !== "twitter" ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="instagram"
                    fill={platformColors.instagram}
                    radius={[4, 4, 0, 0]}
                    name="instagram"
                    onMouseEnter={() => setHoveredPlatform("instagram")}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    fillOpacity={hoveredPlatform && hoveredPlatform !== "instagram" ? 0.3 : 1}
                  />
                  <Bar
                    dataKey="tiktok"
                    fill={platformColors.tiktok}
                    radius={[4, 4, 0, 0]}
                    name="tiktok"
                    onMouseEnter={() => setHoveredPlatform("tiktok")}
                    onMouseLeave={() => setHoveredPlatform(null)}
                    fillOpacity={hoveredPlatform && hoveredPlatform !== "tiktok" ? 0.3 : 1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div
                className="flex items-center gap-1 cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredPlatform("twitter")}
                onMouseLeave={() => setHoveredPlatform(null)}
                style={{ opacity: hoveredPlatform && hoveredPlatform !== "twitter" ? 0.5 : 1 }}
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platformColors.twitter }}></div>
                <span className="text-xs">X (Twitter)</span>
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredPlatform("instagram")}
                onMouseLeave={() => setHoveredPlatform(null)}
                style={{ opacity: hoveredPlatform && hoveredPlatform !== "instagram" ? 0.5 : 1 }}
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platformColors.instagram }}></div>
                <span className="text-xs">Instagram</span>
              </div>
              <div
                className="flex items-center gap-1 cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredPlatform("tiktok")}
                onMouseLeave={() => setHoveredPlatform(null)}
                style={{ opacity: hoveredPlatform && hoveredPlatform !== "tiktok" ? 0.5 : 1 }}
              >
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platformColors.tiktok }}></div>
                <span className="text-xs">TikTok</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Type Performance */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Content Type Performance</CardTitle>
            <CardDescription>Engagement by content type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent>
                            <ChartTooltipItem
                              label={payload[0].name}
                              value={`${payload[0].value}% of engagement`}
                              color={payload[0].payload.color}
                            />
                          </ChartTooltipContent>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {contentTypeData.map((type) => (
                <div key={type.name} className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }}></div>
                  <span className="text-xs">
                    {type.name}: {type.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audience Demographics */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Audience Demographics</CardTitle>
            <CardDescription>Age distribution of your audience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={audienceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {audienceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <ChartTooltipContent>
                            <ChartTooltipItem
                              label={`Age ${payload[0].name}`}
                              value={`${payload[0].value}% of audience`}
                              color={payload[0].payload.color}
                            />
                          </ChartTooltipContent>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {audienceData.map((age) => (
                <div key={age.name} className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: age.color }}></div>
                  <span className="text-xs">
                    Age {age.name}: {age.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
