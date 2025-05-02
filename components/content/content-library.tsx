"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Filter, MoreHorizontal, Search, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { scheduledPosts } from "@/lib/sample-data"

export default function ContentLibrary() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPost, setSelectedPost] = useState<any | null>(null)
  const [isPostDetailsOpen, setIsPostDetailsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [filters, setFilters] = useState({
    platforms: [] as string[],
    status: "all", // 'all', 'scheduled', 'published'
    sortBy: "date-desc", // 'date-desc', 'date-asc', 'platform'
  })

  // Filter and sort posts
  const filteredPosts = scheduledPosts
    .filter((post) => {
      // Filter by search query
      if (searchQuery && !post.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Filter by platforms
      if (filters.platforms.length > 0 && !post.platforms.some((platform) => filters.platforms.includes(platform))) {
        return false
      }

      // Filter by status
      if (filters.status === "scheduled" && new Date(post.date) < new Date()) {
        return false
      }
      if (filters.status === "published" && new Date(post.date) >= new Date()) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort by selected option
      if (filters.sortBy === "date-desc") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      if (filters.sortBy === "date-asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      if (filters.sortBy === "platform") {
        return a.platforms[0].localeCompare(b.platforms[0])
      }
      return 0
    })

  // Function to handle post click
  const handlePostClick = (post: any) => {
    setSelectedPost(post)
    setIsPostDetailsOpen(true)
  }

  // Function to toggle platform filter
  const togglePlatformFilter = (platform: string) => {
    if (filters.platforms.includes(platform)) {
      setFilters({
        ...filters,
        platforms: filters.platforms.filter((p) => p !== platform),
      })
    } else {
      setFilters({
        ...filters,
        platforms: [...filters.platforms, platform],
      })
    }
  }

  // Function to get status badge
  const getStatusBadge = (date: Date) => {
    const now = new Date()
    if (date < now) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
          Published
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
          Scheduled
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Platforms</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filters.platforms.includes("twitter")}
                      onCheckedChange={() => togglePlatformFilter("twitter")}
                    >
                      X (Twitter)
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.platforms.includes("instagram")}
                      onCheckedChange={() => togglePlatformFilter("instagram")}
                    >
                      Instagram
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.platforms.includes("tiktok")}
                      onCheckedChange={() => togglePlatformFilter("tiktok")}
                    >
                      TikTok
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filters.status === "all"}
                      onCheckedChange={() => setFilters({ ...filters, status: "all" })}
                    >
                      All
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.status === "scheduled"}
                      onCheckedChange={() => setFilters({ ...filters, status: "scheduled" })}
                    >
                      Scheduled
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filters.status === "published"}
                      onCheckedChange={() => setFilters({ ...filters, status: "published" })}
                    >
                      Published
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1">
                      <SlidersHorizontal className="h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setFilters({ ...filters, sortBy: "date-desc" })}
                      className={filters.sortBy === "date-desc" ? "bg-muted" : ""}
                    >
                      Newest first
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilters({ ...filters, sortBy: "date-asc" })}
                      className={filters.sortBy === "date-asc" ? "bg-muted" : ""}
                    >
                      Oldest first
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilters({ ...filters, sortBy: "platform" })}
                      className={filters.sortBy === "platform" ? "bg-muted" : ""}
                    >
                      By platform
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="border rounded-md p-1">
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => setViewMode("list")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Content List */}
            {filteredPosts.length > 0 ? (
              viewMode === "list" ? (
                <div className="space-y-3 mt-2">
                  {filteredPosts.map((post, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handlePostClick(post)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex gap-2 items-center">
                          <div className="flex gap-1">
                            {post.platforms.map((platform: string) => (
                              <div key={platform} className="h-5 w-5">
                                {platform === "twitter" && (
                                  <svg className="fill-blue-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                                  </svg>
                                )}
                                {platform === "instagram" && (
                                  <svg className="fill-pink-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2.982c2.937 0 3.285.011 4.445.064 1.072.049 1.655.228 2.042.379.514.2.88.439 1.265.823.385.385.624.751.824 1.265.15.387.33.97.379 2.042.053 1.16.064 1.508.064 4.445 0 2.937-.011 3.285-.064 4.445-.049 1.072-.228 1.655-.379 2.042-.2.514-.439.88-.823 1.265-.385.385-.751.624-1.265.824-.387.15-.97.33-2.042.379-1.16.053-1.508.064-4.445.064-2.937 0-3.285-.011-4.445-.064-1.072-.049-1.655-.228-2.042-.379-.514-.2-.88-.439-1.265-.823-.385-.385-.624-.751-.824-1.265-.15-.387-.33-.97-.379-2.042-.053-1.16-.064-1.508-.064-4.445 0-2.937.011-3.285.064-4.445.049-1.072.228-1.655.379-2.042.2-.514.439-.88.823-1.265.385-.385.751-.624 1.265-.824.387-.15.97-.33 2.042-.379 1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066-1.171.054-1.97.24-2.67.512-.724.281-1.337.657-1.949 1.27-.613.612-.989 1.225-1.27 1.949-.272.7-.458 1.499-.512 2.67C1.013 8.638 1 9.013 1 12s.013 3.362.066 4.535c.054 1.171.24 1.97.512 2.67.281.724.657 1.337 1.27 1.949.612.613 1.225.989 1.949 1.27.7.272 1.499.458 2.67.512C8.638 22.987 9.013 23 12 23s3.362-.013 4.535-.066c1.171-.054 1.97-.24 2.67-.512.724-.281 1.337-.657 1.949-1.27.613-.612.989-1.225 1.27-1.949.272-.7.458-1.499.512-2.67C22.987 15.362 23 14.987 23 12s-.013-3.362-.066-4.535c-.054-1.171-.24-1.97-.512-2.67-.281-.724-.657-1.337-1.27-1.949-.612-.613-1.225-.989-1.949-1.27-.7-.272-1.499-.458-2.67-.512C15.362 1.013 14.987 1 12 1Zm0 5.351c-3.121 0-5.649 2.528-5.649 5.649 0 3.121 2.528 5.649 5.649 5.649 3.121 0 5.649-2.528 5.649-5.649 0-3.121-2.528-5.649-5.649-5.649Zm0 9.316c-2.026 0-3.667-1.641-3.667-3.667 0-2.026 1.641-3.667 3.667-3.667 2.026 0 3.667 1.641 3.667 3.667 0 2.026-1.641 3.667-3.667 3.667Zm7.192-9.539c0 .729-.592 1.32-1.321 1.32-.729 0-1.32-.591-1.32-1.32 0-.729.591-1.32 1.32-1.32.729 0 1.321.591 1.321 1.32Z" />
                                  </svg>
                                )}
                                {platform === "tiktok" && (
                                  <svg className="fill-gray-900" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.53-3.295h-3.643v13.636c0 1.355-1.095 2.45-2.45 2.45s-2.45-1.095-2.45-2.45 1.095-2.45 2.45-2.45c.273 0 .537.045.784.127v-3.688a6.13 6.13 0 0 0-.784-.05c-3.362 0-6.088 2.729-6.088 6.09a6.089 6.089 0 0 0 6.088 6.088c3.361 0 6.09-2.727 6.09-6.088V8.967a8.78 8.78 0 0 0 4.948 1.514V7a5.127 5.127 0 0 1-1 .188 5.127 5.127 0 0 1-1-.188V5.562h.001Z" />
                                  </svg>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="ml-1">{getStatusBadge(post.date)}</div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {post.date.toLocaleDateString("default", { month: "short", day: "numeric" })} at{" "}
                          {post.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="line-clamp-2">{post.content}</p>
                      </div>
                      {post.media && post.media.length > 0 && (
                        <div className="mt-2 flex gap-2 overflow-x-auto">
                          {post.media.map((media: string, idx: number) => (
                            <img
                              key={idx}
                              src={media || "/placeholder.svg"}
                              alt={`Media ${idx + 1}`}
                              className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {filteredPosts.map((post, index) => (
                    <div
                      key={index}
                      className="border rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handlePostClick(post)}
                    >
                      {post.media && post.media.length > 0 ? (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img
                            src={post.media[0] || "/placeholder.svg"}
                            alt="Post media"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-muted flex items-center justify-center">
                          <div className="text-muted-foreground text-sm">No media</div>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex gap-1">
                            {post.platforms.map((platform: string) => (
                              <div key={platform} className="h-4 w-4">
                                {platform === "twitter" && (
                                  <svg className="fill-blue-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                                  </svg>
                                )}
                                {platform === "instagram" && (
                                  <svg className="fill-pink-500" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2.982c2.937 0 3.285.011 4.445.064 1.072.049 1.655.228 2.042.379.514.2.88.439 1.265.823.385.385.624.751.824 1.265.15.387.33.97.379 2.042.053 1.16.064 1.508.064 4.445 0 2.937-.011 3.285-.064 4.445-.049 1.072-.228 1.655-.379 2.042-.2.514-.439.88-.823 1.265-.385.385-.751.624-1.265.824-.387.15-.97.33-2.042.379-1.16.053-1.508.064-4.445.064-2.937 0-3.285-.011-4.445-.064-1.072-.049-1.655-.228-2.042-.379-.514-.2-.88-.439-1.265-.823-.385-.385-.624-.751-.824-1.265-.15-.387-.33-.97-.379-2.042-.053-1.16-.064-1.508-.064-4.445 0-2.937.011-3.285.064-4.445.049-1.072.228-1.655.379-2.042.2-.514.439-.88.823-1.265.385-.385.751-.624 1.265-.824.387-.15.97-.33 2.042-.379 1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066-1.171.054-1.97.24-2.67.512-.724.281-1.337.657-1.949 1.27-.613.612-.989 1.225-1.27 1.949-.272.7-.458 1.499-.512 2.67C1.013 8.638 1 9.013 1 12s.013 3.362.066 4.535c.054 1.171.24 1.97.512 2.67.281.724.657 1.337 1.27 1.949.612.613 1.225.989 1.949 1.27.7.272 1.499.458 2.67.512C8.638 22.987 9.013 23 12 23s3.362-.013 4.535-.066c1.171-.054 1.97-.24 2.67-.512.724-.281 1.337-.657 1.949-1.27.613-.612.989-1.225 1.27-1.949.272-.7.458-1.499.512-2.67C22.987 15.362 23 14.987 23 12s-.013-3.362-.066-4.535c-.054-1.171-.24-1.97-.512-2.67-.281-.724-.657-1.337-1.27-1.949-.612-.613-1.225-.989-1.949-1.27-.7-.272-1.499-.458-2.67-.512C15.362 1.013 14.987 1 12 1Zm0 5.351c-3.121 0-5.649 2.528-5.649 5.649 0 3.121 2.528 5.649 5.649 5.649 3.121 0 5.649-2.528 5.649-5.649 0-3.121-2.528-5.649-5.649-5.649Zm0 9.316c-2.026 0-3.667-1.641-3.667-3.667 0-2.026 1.641-3.667 3.667-3.667 2.026 0 3.667 1.641 3.667 3.667 0 2.026-1.641 3.667-3.667 3.667Zm7.192-9.539c0 .729-.592 1.32-1.321 1.32-.729 0-1.32-.591-1.32-1.32 0-.729.591-1.32 1.32-1.32.729 0 1.321.591 1.321 1.32Z" />
                                  </svg>
                                )}
                                {platform === "tiktok" && (
                                  <svg className="fill-gray-900" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.53-3.295h-3.643v13.636c0 1.355-1.095 2.45-2.45 2.45s-2.45-1.095-2.45-2.45 1.095-2.45 2.45-2.45c.273 0 .537.045.784.127v-3.688a6.13 6.13 0 0 0-.784-.05c-3.362 0-6.088 2.729-6.088 6.09a6.089 6.089 0 0 0 6.088 6.088c3.361 0 6.09-2.727 6.09-6.088V8.967a8.78 8.78 0 0 0 4.948 1.514V7a5.127 5.127 0 0 1-1 .188 5.127 5.127 0 0 1-1-.188V5.562h.001Z" />
                                  </svg>
                                )}
                              </div>
                            ))}
                          </div>
                          {getStatusBadge(post.date)}
                        </div>
                        <p className="line-clamp-3 text-sm">{post.content}</p>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.date.toLocaleDateString("default", { month: "short", day: "numeric" })} at{" "}
                          {post.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found matching your filters</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setFilters({
                      platforms: [],
                      status: "all",
                      sortBy: "date-desc",
                    })
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Post Details Dialog */}
      <Dialog open={isPostDetailsOpen} onOpenChange={setIsPostDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-1">
                  {selectedPost.platforms.map((platform: string) => (
                    <Badge
                      key={platform}
                      variant="outline"
                      className={cn(
                        platform === "twitter" && "bg-blue-50 text-blue-600 border-blue-200",
                        platform === "instagram" && "bg-pink-50 text-pink-600 border-pink-200",
                        platform === "tiktok" && "bg-gray-900 text-white border-gray-700",
                      )}
                    >
                      {platform === "twitter" ? "X" : platform === "instagram" ? "Instagram" : "TikTok"}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedPost.date.toLocaleDateString("default", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  at {selectedPost.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              <div className="border-t border-b py-3">
                <p>{selectedPost.content}</p>
              </div>

              {selectedPost.media && selectedPost.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPostDetailsOpen(false)}>
                  Close
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <MoreHorizontal className="h-4 w-4 mr-1" />
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Post</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate Post</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete Post</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
