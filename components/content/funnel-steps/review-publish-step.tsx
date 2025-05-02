"use client"

import { useState } from "react"
import type { ContentCreationState } from "../content-creation-funnel"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Check, Loader2, CalendarDays } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

interface ReviewPublishStepProps {
  state: ContentCreationState
  updateState: (updates: Partial<ContentCreationState>) => void
  onPublish: () => void
}

// Sample platform data (simplified version of what's in platform-selection-step)
const availablePlatforms = [
  {
    id: "twitter",
    name: "X (Twitter)",
    color: "bg-blue-500",
    accounts: [
      { id: "twitter1", name: "Main Account", avatar: "/abstract-profile.png" },
      { id: "twitter2", name: "Brand Account", avatar: "/abstract-profile.png" },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    color: "bg-pink-500",
    accounts: [
      { id: "insta1", name: "Personal", avatar: "/abstract-profile.png" },
      { id: "insta2", name: "Business", avatar: "/abstract-profile.png" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "bg-black",
    accounts: [{ id: "tiktok1", name: "Main", avatar: "/abstract-profile.png" }],
  },
  {
    id: "bluesky",
    name: "Bluesky",
    color: "bg-sky-500",
    accounts: [{ id: "bluesky1", name: "Personal", avatar: "/abstract-profile.png" }],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    color: "bg-red-600",
    accounts: [{ id: "pinterest1", name: "Business", avatar: "/abstract-profile.png" }],
  },
]

export default function ReviewPublishStep({ state, updateState, onPublish }: ReviewPublishStepProps) {
  const [selectedTime, setSelectedTime] = useState<{ hours: number; minutes: number }>({ hours: 12, minutes: 0 })
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishingComplete, setPublishingComplete] = useState(false)
  const [publishingModalOpen, setPublishingModalOpen] = useState(false)

  const toggleScheduling = () => {
    updateState({
      isScheduled: !state.isScheduled,
      scheduledDate: !state.isScheduled ? new Date() : undefined,
    })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Preserve the time when changing the date
      if (state.scheduledDate) {
        date.setHours(state.scheduledDate.getHours())
        date.setMinutes(state.scheduledDate.getMinutes())
      }
      updateState({ scheduledDate: date })
    }
  }

  const handleTimeChange = (type: "hours" | "minutes", value: number) => {
    const newTime = { ...selectedTime, [type]: value }
    setSelectedTime(newTime)

    if (state.scheduledDate) {
      const newDate = new Date(state.scheduledDate)
      newDate.setHours(newTime.hours)
      newDate.setMinutes(newTime.minutes)
      updateState({ scheduledDate: newDate })
    }
  }

  // Get account names for a platform
  const getAccountNames = (platformId: string) => {
    const platform = availablePlatforms.find((p) => p.id === platformId)
    if (!platform) return []

    const accountIds = state.selectedAccounts[platformId] || []
    return accountIds
      .map((id) => {
        const account = platform.accounts.find((a) => a.id === id)
        return account ? account.name : ""
      })
      .filter(Boolean)
  }

  // Get content for a platform
  const getContentForPlatform = (platformId: string) => {
    if (state.useUnifiedContent) {
      return state.content
    } else {
      return state.platformSpecificContent[platformId] || state.content
    }
  }

  // Get hashtag string
  const getHashtagString = () => {
    return state.hashtags.length > 0 ? state.hashtags.map((tag) => `#${tag}`).join(" ") : ""
  }

  // Handle publishing or scheduling
  const handlePublish = () => {
    setPublishingModalOpen(true)
    setIsPublishing(true)
    setPublishingComplete(false)

    // Simulate publishing process
    setTimeout(() => {
      setIsPublishing(false)
      setPublishingComplete(true)
      onPublish()
    }, 2000)
  }

  // Close the modal and reset states
  const handleCloseModal = () => {
    setPublishingModalOpen(false)
    setIsPublishing(false)
    setPublishingComplete(false)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review & Publish</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Content Preview</h3>

        <div className="space-y-4">
          {state.platforms.map((platformId) => {
            const platform = availablePlatforms.find((p) => p.id === platformId)
            if (!platform) return null

            const content = getContentForPlatform(platformId)
            const accountNames = getAccountNames(platformId)

            return (
              <Card key={platformId} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", platform.color)}>
                        {platformId === "twitter" && (
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                          </svg>
                        )}
                        {platformId === "instagram" && (
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.982c2.937 0 3.285.011 4.445.064 1.072.049 1.655.228 2.042.379.514.2.88.439 1.265.823.385.385.624.751.824 1.265.15.387.33.97.379 2.042.053 1.16.064 1.508.064 4.445 0 2.937-.011 3.285-.064 4.445-.049 1.072-.228 1.655-.379 2.042-.2.514-.439.88-.823 1.265-.385.385-.751.624-1.265.824-.387.15-.97.33-2.042.379-1.16.053-1.508.064-4.445.064-2.937 0-3.285-.011-4.445-.064-1.072-.049-1.655-.228-2.042-.379-.514-.2-.88-.439-1.265-.823-.385-.385-.624-.751-.824-1.265-.15-.387-.33-.97-.379-2.042-.053-1.16-.064-1.508-.064-4.445 0-2.937.011-3.285.064-4.445.049-1.072.228-1.655.379-2.042.2-.514.439-.88.823-1.265.385-.385.751-.624 1.265-.824.387-.15.97-.33 2.042-.379 1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066-1.171.054-1.97.24-2.67.512-.724.281-1.337.657-1.949 1.27-.613.612-.989 1.225-1.27 1.949-.272.7-.458 1.499-.512 2.67C1.013 8.638 1 9.013 1 12s.013 3.362.066 4.535c.054 1.171.24 1.97.512 2.67.281.724.657 1.337 1.27 1.949.612.613 1.225.989 1.949 1.27.7.272 1.499.458 2.67.512C8.638 22.987 9.013 23 12 23s3.362-.013 4.535-.066c1.171-.054 1.97-.24 2.67-.512.724-.281 1.337-.657 1.949-1.27.613-.612.989-1.225 1.27-1.949.272-.7.458-1.499.512-2.67C22.987 15.362 23 14.987 23 12s-.013-3.362-.066-4.535c-.054-1.171-.24-1.97-.512-2.67-.281-.724-.657-1.337-1.27-1.949-.612-.613-1.225-.989-1.949-1.27-.7-.272-1.499-.458-2.67-.512C15.362 1.013 14.987 1 12 1Zm0 5.351c-3.121 0-5.649 2.528-5.649 5.649 0 3.121 2.528 5.649 5.649 5.649 3.121 0 5.649-2.528 5.649-5.649 0-3.121-2.528-5.649-5.649-5.649Zm0 9.316c-2.026 0-3.667-1.641-3.667-3.667 0-2.026 1.641-3.667 3.667-3.667 2.026 0 3.667 1.641 3.667 3.667 0 2.026-1.641 3.667-3.667 3.667Zm7.192-9.539c0 .729-.592 1.32-1.321 1.32-.729 0-1.32-.591-1.32-1.32 0-.729.591-1.32 1.32-1.32.729 0 1.321.591 1.321 1.32Z" />
                          </svg>
                        )}
                        {platformId === "tiktok" && (
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.53-3.295h-3.643v13.636c0 1.355-1.095 2.45-2.45 2.45s-2.45-1.095-2.45-2.45 1.095-2.45 2.45-2.45c.273 0 .537.045.784.127v-3.688a6.13 6.13 0 0 0-.784-.05c-3.362 0-6.088 2.729-6.088 6.09a6.089 6.089 0 0 0 6.088 6.088c3.361 0 6.09-2.727 6.09-6.088V8.967a8.78 8.78 0 0 0 4.948 1.514V7a5.127 5.127 0 0 1-1 .188 5.127 5.127 0 0 1-1-.188V5.562h.001Z" />
                          </svg>
                        )}
                        {/* Simplified icons for Bluesky and Pinterest */}
                        {platformId === "bluesky" && (
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" />
                          </svg>
                        )}
                        {platformId === "pinterest" && (
                          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{platform.name}</div>
                        <div className="text-xs text-muted-foreground">{accountNames.join(", ")}</div>
                      </div>
                    </div>

                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Ready to publish
                    </Badge>
                  </div>

                  <div className="border rounded-md p-3 mb-3">
                    <p className="text-sm whitespace-pre-wrap">{content}</p>
                    {state.hashtags.length > 0 && <p className="text-sm text-blue-600 mt-1">{getHashtagString()}</p>}
                  </div>

                  {state.media.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {state.media.map((media, index) => (
                        <img
                          key={index}
                          src={media || "/placeholder.svg"}
                          alt={`Media ${index + 1}`}
                          className="rounded-md w-full aspect-square object-cover"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Publishing Options</h3>

          <div className="flex items-center gap-2">
            <Label htmlFor="schedule-toggle" className="text-sm">
              Schedule for later
            </Label>
            <Switch id="schedule-toggle" checked={state.isScheduled} onCheckedChange={toggleScheduling} />
          </div>
        </div>

        {state.isScheduled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !state.scheduledDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {state.scheduledDate ? state.scheduledDate.toLocaleDateString() : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={state.scheduledDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="mb-2 block">Select Time</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label htmlFor="hours" className="text-xs">
                    Hours
                  </Label>
                  <Input
                    id="hours"
                    type="number"
                    min={0}
                    max={23}
                    value={selectedTime.hours}
                    onChange={(e) => handleTimeChange("hours", Number.parseInt(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="minutes" className="text-xs">
                    Minutes
                  </Label>
                  <Input
                    id="minutes"
                    type="number"
                    min={0}
                    max={59}
                    value={selectedTime.minutes}
                    onChange={(e) => handleTimeChange("minutes", Number.parseInt(e.target.value) || 0)}
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-muted p-3 rounded-md">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium">
              {state.isScheduled
                ? `Your content will be scheduled for ${state.scheduledDate?.toLocaleDateString()} at ${state.scheduledDate?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Your content is ready to be published immediately"}
            </p>
          </div>
        </div>
      </div>

      {/* Publishing Modal */}
      <Dialog open={publishingModalOpen} onOpenChange={setPublishingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isPublishing
                ? state.isScheduled
                  ? "Scheduling your content..."
                  : "Publishing your content..."
                : state.isScheduled
                  ? "Content scheduled successfully!"
                  : "Content published successfully!"}
            </DialogTitle>
            {isPublishing && (
              <DialogDescription>
                {state.isScheduled
                  ? "We're scheduling your content across all selected platforms."
                  : "We're publishing your content across all selected platforms."}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6">
            {isPublishing ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
                <p className="text-center text-sm text-muted-foreground">
                  {state.isScheduled
                    ? "Your content is being scheduled. This may take a moment..."
                    : "Your content is being published. This may take a moment..."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-center font-medium mb-2">
                  {state.isScheduled
                    ? "Your content has been scheduled successfully!"
                    : "Your content has been published successfully!"}
                </p>
                <p className="text-center text-sm text-muted-foreground mb-6">
                  {state.isScheduled
                    ? `Your content will be published on ${state.scheduledDate?.toLocaleDateString()} at ${state.scheduledDate?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : "Your content is now live on all selected platforms."}
                </p>
              </div>
            )}
          </div>

          {publishingComplete && (
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleCloseModal} className="sm:flex-1">
                Done
              </Button>
              {state.isScheduled ? (
                <Link href="/?tab=calendar" className="sm:flex-1">
                  <Button className="w-full">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    View Scheduled Posts
                  </Button>
                </Link>
              ) : (
                <Link href="/?tab=library" className="sm:flex-1">
                  <Button className="w-full">View Published Content</Button>
                </Link>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
