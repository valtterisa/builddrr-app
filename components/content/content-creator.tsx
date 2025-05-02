"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ContentCreator() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter"])
  const [postContent, setPostContent] = useState("")
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([])
  const [isScheduled, setIsScheduled] = useState(false)
  const [contentType, setContentType] = useState<"text" | "media" | "link">("text")
  const [linkUrl, setLinkUrl] = useState("")
  const [linkTitle, setLinkTitle] = useState("")
  const [linkDescription, setLinkDescription] = useState("")
  const [selectedTime, setSelectedTime] = useState<{ hours: number; minutes: number }>({ hours: 12, minutes: 0 })
  const [aiSuggestion, setAiSuggestion] = useState("")

  const platforms = [
    { id: "twitter", name: "X (Twitter)", icon: "twitter", color: "bg-blue-500 hover:bg-blue-600" },
    { id: "instagram", name: "Instagram", icon: "instagram", color: "bg-pink-500 hover:bg-pink-600" },
    { id: "tiktok", name: "TikTok", icon: "tiktok", color: "bg-black hover:bg-gray-800" },
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
    setContentType("media")
  }

  const removeMedia = (index: number) => {
    const newMedia = [...uploadedMedia]
    newMedia.splice(index, 1)
    setUploadedMedia(newMedia)
    if (newMedia.length === 0 && !linkUrl) {
      setContentType("text")
    }
  }

  const handleLinkAdd = () => {
    if (linkUrl) {
      setContentType("link")
    }
  }

  const removeLinkPreview = () => {
    setLinkUrl("")
    setLinkTitle("")
    setLinkDescription("")
    if (uploadedMedia.length === 0) {
      setContentType("text")
    } else {
      setContentType("media")
    }
  }

  const generateAiSuggestion = () => {
    // In a real app, this would call an AI service
    const suggestions = [
      "Excited to announce our new product line! Check out these amazing designs perfect for summer. #NewCollection #SummerVibes",
      "Behind the scenes look at our creative process. We love bringing your ideas to life! #BehindTheScenes #CreativeProcess",
      "Join us this Friday for an exclusive webinar on content strategy. Register now at the link in our bio! #ContentStrategy #Webinar",
      "Customer spotlight: Meet Sarah, who transformed her business using our platform. Read her success story on our blog!",
    ]
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)])
  }

  const applyAiSuggestion = () => {
    setPostContent(aiSuggestion)
    setAiSuggestion("")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
            <CardTitle>Create Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Platform Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <TooltipProvider key={platform.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                          className={cn(
                            "flex items-center gap-2 transition-all",
                            selectedPlatforms.includes(platform.id) && platform.color
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
                              <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.53-3.295h-3.643v13.636c0 1.355-1.095 2.45-2.45 2.45s-2.45-1.095-2.45-2.45 1.095-2.45

Now, let's update the app/page.tsx file to include our new PerformanceMetrics component:

\
