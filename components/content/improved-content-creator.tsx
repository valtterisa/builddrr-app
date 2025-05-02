"use client"

import { useState } from "react"
import { Calendar, Clock, Link2, Send, Smile, X, ImageIcon, Video, FileText, Hash, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import SocialMediaPreview from "@/components/social-media-preview"
import MediaUploader from "@/components/media-uploader"
import ScheduleCalendar from "@/components/schedule-calendar"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ImprovedContentCreator() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter"])
  const [postContent, setPostContent] = useState("")
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([])
  const [isScheduled, setIsScheduled] = useState(false)
  const [hashtags, setHashtags] = useState<string[]>([])
  const [newHashtag, setNewHashtag] = useState("")
  const [contentType, setContentType] = useState<"text" | "image" | "video">("text")
  const [showPlatformTips, setShowPlatformTips] = useState(true)

  const platforms = [
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: "twitter",
      tips: "Best practices: 280 character limit, 1-2 hashtags, images increase engagement by 35%",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: "instagram",
      tips: "Best practices: 2200 character limit, 5-10 hashtags, square images perform best",
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: "tiktok",
      tips: "Best practices: 150 character limit, 3-5 hashtags, vertical videos (9:16) perform best",
    },
  ]

  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter((id) => id !== platformId))
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId])
    }
  }

  const handleMediaUpload = (mediaUrl: string) => {
    setUploadedMedia([...uploadedMedia, mediaUrl])
    if (mediaUrl.endsWith(".mp4")) {
      setContentType("video")
    } else {
      setContentType("image")
    }
  }

  const removeMedia = (index: number) => {
    const newMedia = [...uploadedMedia]
    newMedia.splice(index, 1)
    setUploadedMedia(newMedia)
    if (newMedia.length === 0) {
      setContentType("text")
    }
  }

  const addHashtag = () => {
    if (newHashtag && !hashtags.includes(newHashtag)) {
      setHashtags([...hashtags, newHashtag])
      setNewHashtag("")
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag))
  }

  const getCharacterCount = () => {
    let count = postContent.length
    hashtags.forEach((tag) => {
      count += tag.length + 2 // +2 for # and space
    })
    return count
  }

  const getCharacterLimit = () => {
    if (selectedPlatforms.includes("twitter")) return 280
    if (selectedPlatforms.includes("tiktok")) return 150
    return 2200 // Instagram
  }

  const isOverCharacterLimit = () => {
    return getCharacterCount() > getCharacterLimit()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create Content</CardTitle>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-8 w-8 p-0", contentType === "text" && "bg-muted")}
                      onClick={() => setContentType("text")}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Text Post</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-8 w-8 p-0", contentType === "image" && "bg-muted")}
                      onClick={() => setContentType("image")}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Image Post</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-8 w-8 p-0", contentType === "video" && "bg-muted")}
                      onClick={() => setContentType("video")}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Video Post</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <div key={platform.id} className="flex flex-col">
                  <Button
                    variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                    className={cn(
                      "flex items-center gap-2",
                      selectedPlatforms.includes(platform.id) &&
                        platform.id === "twitter" &&
                        "bg-blue-500 hover:bg-blue-600",
                      selectedPlatforms.includes(platform.id) &&
                        platform.id === "instagram" &&
                        "bg-pink-500 hover:bg-pink-600",
                      selectedPlatforms.includes(platform.id) &&
                        platform.id === "tiktok" &&
                        "bg-black hover:bg-gray-800",
                    )}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    {platform.id === "twitter" && (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                      </svg>
                    )}
                    {platform.id === "instagram" && (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.982c2.937 0 3.285.011 4.445.064 1.072.049 1.655.228 2.042.379.514.2.88.439 1.265.823.385.385.624.751.824 1.265.15.387.33.97.379 2.042.053 1.16.064 1.508.064 4.445 0 2.937-.011 3.285-.064 4.445-.049 1.072-.228 1.655-.379 2.042-.2.514-.439.88-.823 1.265-.385.385-.751.624-1.265.824-.387.15-.97.33-2.042.379-1.16.053-1.508.064-4.445.064-2.937 0-3.285-.011-4.445-.064-1.072-.049-1.655-.228-2.042-.379-.514-.2-.88-.439-1.265-.823-.385-.385-.624-.751-.824-1.265-.15-.387-.33-.97-.379-2.042-.053-1.16-.064-1.508-.064-4.445 0-2.937.011-3.285.064-4.445.049-1.072.228-1.655.379-2.042.2-.514.439-.88.823-1.265.385-.385.751-.624 1.265-.824.387-.15.97-.33 2.042-.379 1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066-1.171.054-1.97.24-2.67.512-.724.281-1.337.657-1.949 1.27-.613.612-.989 1.225-1.27 1.949-.272.7-.458 1.499-.512 2.67C1.013 8.638 1 9.013 1 12s.013 3.362.066 4.535c.054 1.171.24 1.97.512 2.67.281.724.657 1.337 1.27 1.949.612.613 1.225.989 1.949 1.27.7.272 1.499.458 2.67.512C8.638 22.987 9.013 23 12 23s3.362-.013 4.535-.066c1.171-.054 1.97-.24 2.67-.512.724-.281 1.337-.657 1.949-1.27.613-.612.989-1.225 1.27-1.949.272-.7.458-1.499.512-2.67C22.987 15.362 23 14.987 23 12s-.013-3.362-.066-4.535c-.054-1.171-.24-1.97-.512-2.67-.281-.724-.657-1.337-1.27-1.949-.612-.613-1.225-.989-1.949-1.27-.7-.272-1.499-.458-2.67-.512C15.362 1.013 14.987 1 12 1Zm0 5.351c-3.121 0-5.649 2.528-5.649 5.649 0 3.121 2.528 5.649 5.649 5.649 3.121 0 5.649-2.528 5.649-5.649 0-3.121-2.528-5.649-5.649-5.649Zm0 9.316c-2.026 0-3.667-1.641-3.667-3.667 0-2.026 1.641-3.667 3.667-3.667 2.026 0 3.667 1.641 3.667 3.667 0 2.026-1.641 3.667-3.667 3.667Zm7.192-9.539c0 .729-.592 1.32-1.321 1.32-.729 0-1.32-.591-1.32-1.32 0-.729.591-1.32 1.32-1.32.729 0 1.321.591 1.321 1.32Z" />
                      </svg>
                    )}
                    {platform.id === "tiktok" && (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.53-3.295h-3.643v13.636c0 1.355-1.095 2.45-2.45 2.45s-2.45-1.095-2.45-2.45 1.095-2.45 2.45-2.45c.273 0 .537.045.784.127v-3.688a6.13 6.13 0 0 0-.784-.05c-3.362 0-6.088 2.729-6.088 6.09a6.089 6.089 0 0 0 6.088 6.088c3.361 0 6.09-2.727 6.09-6.088V8.967a8.78 8.78 0 0 0 4.948 1.514V7a5.127 5.127 0 0 1-1 .188 5.127 5.127 0 0 1-1-.188V5.562h.001Z" />
                      </svg>
                    )}
                    {platform.name}
                  </Button>
                  {selectedPlatforms.includes(platform.id) && showPlatformTips && (
                    <div className="text-xs text-muted-foreground mt-1 px-2">{platform.tips}</div>
                  )}
                </div>
              ))}
              {showPlatformTips && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground"
                  onClick={() => setShowPlatformTips(false)}
                >
                  Hide tips
                </Button>
              )}
            </div>

            <div className="relative">
              <Textarea
                placeholder="What's on your mind?"
                className={cn(
                  "min-h-[120px] resize-none transition-all",
                  isOverCharacterLimit() && "border-red-500 focus-visible:ring-red-500",
                )}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
              <div
                className={cn(
                  "absolute bottom-2 right-2 text-xs",
                  isOverCharacterLimit() ? "text-red-500" : "text-muted-foreground",
                )}
              >
                {getCharacterCount()}/{getCharacterLimit()}
              </div>
            </div>

            {isOverCharacterLimit() && (
              <div className="flex items-center gap-2 text-xs text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>Character limit exceeded for selected platform(s)</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center">
              <Hash className="h-4 w-4 text-muted-foreground" />
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #{tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => removeHashtag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add hashtag"
                  className="h-8 w-32"
                  value={newHashtag}
                  onChange={(e) => setNewHashtag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addHashtag()
                    }
                  }}
                />
                <Button variant="outline" size="sm" className="h-8" onClick={addHashtag}>
                  Add
                </Button>
              </div>
            </div>

            {uploadedMedia.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {uploadedMedia.map((media, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={media || "/placeholder.svg"}
                      alt={`Uploaded media ${index + 1}`}
                      className="rounded-md w-full aspect-square object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeMedia(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <MediaUploader onUpload={handleMediaUpload} />

              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Link2 className="h-4 w-4" />
                Add Link
              </Button>

              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Smile className="h-4 w-4" />
                Emoji
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch id="schedule" checked={isScheduled} onCheckedChange={setIsScheduled} />
                <Label htmlFor="schedule">Schedule for later</Label>
              </div>

              {isScheduled && (
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Select time
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="end">
                      <div className="grid gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="grid gap-1">
                            <Label htmlFor="hours">Hours</Label>
                            <Input id="hours" type="number" min={0} max={23} defaultValue={12} />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor="minutes">Minutes</Label>
                            <Input id="minutes" type="number" min={0} max={59} defaultValue={0} />
                          </div>
                        </div>
                        <Button size="sm">Set Time</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button
              className="flex items-center gap-1"
              disabled={isOverCharacterLimit() || selectedPlatforms.length === 0}
            >
              {isScheduled ? "Schedule" : "Post Now"}
              <Send className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Tabs defaultValue="preview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <SocialMediaPreview
              content={postContent + (hashtags.length > 0 ? " " + hashtags.map((tag) => `#${tag}`).join(" ") : "")}
              media={uploadedMedia}
              platforms={selectedPlatforms}
            />
          </TabsContent>
          <TabsContent value="schedule" className="mt-4">
            <ScheduleCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
