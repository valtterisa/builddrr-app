"use client"

import { useState } from "react"
import type { ContentCreationState } from "../content-creation-funnel"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Hash, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentDetailsStepProps {
  state: ContentCreationState
  updateState: (updates: Partial<ContentCreationState>) => void
}

// Platform-specific character limits
const characterLimits = {
  twitter: 280,
  instagram: 2200,
  tiktok: 150,
  bluesky: 300,
  pinterest: 500,
}

export default function ContentDetailsStep({ state, updateState }: ContentDetailsStepProps) {
  const [newHashtag, setNewHashtag] = useState("")

  const handleUnifiedContentChange = (content: string) => {
    updateState({ content })
  }

  const handlePlatformSpecificContentChange = (platformId: string, content: string) => {
    updateState({
      platformSpecificContent: {
        ...state.platformSpecificContent,
        [platformId]: content,
      },
    })
  }

  const toggleUnifiedContent = () => {
    updateState({ useUnifiedContent: !state.useUnifiedContent })
  }

  const addHashtag = () => {
    if (newHashtag && !state.hashtags.includes(newHashtag)) {
      updateState({ hashtags: [...state.hashtags, newHashtag] })
      setNewHashtag("")
    }
  }

  const removeHashtag = (tag: string) => {
    updateState({ hashtags: state.hashtags.filter((t) => t !== tag) })
  }

  // Get character count for a platform
  const getCharacterCount = (platformId: string) => {
    if (state.useUnifiedContent) {
      return state.content.length + getHashtagsLength()
    } else {
      const platformContent = state.platformSpecificContent[platformId] || ""
      return platformContent.length + getHashtagsLength()
    }
  }

  // Get the total length of hashtags including # and spaces
  const getHashtagsLength = () => {
    if (state.hashtags.length === 0) return 0
    // Add 2 for each hashtag (# symbol and space)
    return state.hashtags.reduce((total, tag) => total + tag.length + 2, 0)
  }

  // Check if content exceeds character limit for a platform
  const isOverCharacterLimit = (platformId: string) => {
    const limit = characterLimits[platformId as keyof typeof characterLimits] || 2200
    return getCharacterCount(platformId) > limit
  }

  // Get platforms that exceed their character limits
  const getPlatformsOverLimit = () => {
    return state.platforms.filter((platformId) => isOverCharacterLimit(platformId))
  }

  const platformsOverLimit = getPlatformsOverLimit()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Content Details</h2>

        <div className="flex items-center gap-2">
          <Label htmlFor="unified-content" className="text-sm">
            Use same content for all platforms
          </Label>
          <Switch id="unified-content" checked={state.useUnifiedContent} onCheckedChange={toggleUnifiedContent} />
        </div>
      </div>

      {state.useUnifiedContent ? (
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Enter your content here..."
              className={cn(
                "min-h-[200px] resize-none",
                platformsOverLimit.length > 0 && "border-red-500 focus-visible:ring-red-500",
              )}
              value={state.content}
              onChange={(e) => handleUnifiedContentChange(e.target.value)}
            />

            {platformsOverLimit.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-red-500">
                Character limit exceeded for some platforms
              </div>
            )}
          </div>

          {platformsOverLimit.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>
                Content exceeds character limit for:{" "}
                {platformsOverLimit
                  .map((p) => {
                    const platformName =
                      p === "twitter"
                        ? "X (Twitter)"
                        : p === "instagram"
                          ? "Instagram"
                          : p === "tiktok"
                            ? "TikTok"
                            : p === "bluesky"
                              ? "Bluesky"
                              : "Pinterest"
                    return platformName
                  })
                  .join(", ")}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Character counts by platform:</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {state.platforms.map((platformId) => {
                const limit = characterLimits[platformId as keyof typeof characterLimits] || 2200
                const count = getCharacterCount(platformId)
                const isOverLimit = count > limit

                return (
                  <div
                    key={platformId}
                    className={cn(
                      "p-2 border rounded-md text-sm",
                      isOverLimit ? "border-red-300 bg-red-50" : "border-gray-200",
                    )}
                  >
                    <div className="font-medium">
                      {platformId === "twitter"
                        ? "X (Twitter)"
                        : platformId === "instagram"
                          ? "Instagram"
                          : platformId === "tiktok"
                            ? "TikTok"
                            : platformId === "bluesky"
                              ? "Bluesky"
                              : "Pinterest"}
                    </div>
                    <div className={isOverLimit ? "text-red-600" : "text-muted-foreground"}>
                      {count}/{limit} characters
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue={state.platforms[0] || "twitter"}>
          <TabsList className="mb-4">
            {state.platforms.map((platformId) => (
              <TabsTrigger key={platformId} value={platformId}>
                {platformId === "twitter"
                  ? "X (Twitter)"
                  : platformId === "instagram"
                    ? "Instagram"
                    : platformId === "tiktok"
                      ? "TikTok"
                      : platformId === "bluesky"
                        ? "Bluesky"
                        : "Pinterest"}
              </TabsTrigger>
            ))}
          </TabsList>

          {state.platforms.map((platformId) => {
            const limit = characterLimits[platformId as keyof typeof characterLimits] || 2200
            const content = state.platformSpecificContent[platformId] || state.content
            const count = content.length + getHashtagsLength()
            const isOverLimit = count > limit

            return (
              <TabsContent key={platformId} value={platformId} className="space-y-4">
                <div className="relative">
                  <Textarea
                    placeholder={`Enter content for ${
                      platformId === "twitter"
                        ? "X (Twitter)"
                        : platformId === "instagram"
                          ? "Instagram"
                          : platformId === "tiktok"
                            ? "TikTok"
                            : platformId === "bluesky"
                              ? "Bluesky"
                              : "Pinterest"
                    }...`}
                    className={cn(
                      "min-h-[200px] resize-none",
                      isOverLimit && "border-red-500 focus-visible:ring-red-500",
                    )}
                    value={content}
                    onChange={(e) => handlePlatformSpecificContentChange(platformId, e.target.value)}
                  />

                  <div
                    className={cn(
                      "absolute bottom-2 right-2 text-xs",
                      isOverLimit ? "text-red-500" : "text-muted-foreground",
                    )}
                  >
                    {count}/{limit}
                  </div>
                </div>

                {isOverLimit && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Content exceeds character limit for this platform</span>
                  </div>
                )}

                <div className="p-3 border rounded-md bg-gray-50">
                  <p className="text-sm text-muted-foreground mb-2">Platform tips:</p>
                  {platformId === "twitter" && (
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>280 character limit</li>
                      <li>1-2 hashtags recommended</li>
                      <li>Images increase engagement by 35%</li>
                    </ul>
                  )}
                  {platformId === "instagram" && (
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>2200 character limit</li>
                      <li>5-10 hashtags recommended</li>
                      <li>Square images perform best</li>
                    </ul>
                  )}
                  {platformId === "tiktok" && (
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>150 character limit</li>
                      <li>3-5 hashtags recommended</li>
                      <li>Vertical videos (9:16) perform best</li>
                    </ul>
                  )}
                  {platformId === "bluesky" && (
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>300 character limit</li>
                      <li>1-3 hashtags recommended</li>
                    </ul>
                  )}
                  {platformId === "pinterest" && (
                    <ul className="text-sm space-y-1 list-disc pl-4">
                      <li>500 character limit</li>
                      <li>Vertical images (2:3) perform best</li>
                    </ul>
                  )}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      )}

      <div className="space-y-2">
        <Label>Hashtags</Label>
        <div className="flex flex-wrap gap-2 items-center">
          <Hash className="h-4 w-4 text-muted-foreground" />
          {state.hashtags.map((tag) => (
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
      </div>
    </div>
  )
}
