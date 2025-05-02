"use client"

import type React from "react"

import { useState } from "react"
import type { ContentCreationState } from "../content-creation-funnel"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Sparkles, ImageIcon, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ContentInputStepProps {
  state: ContentCreationState
  updateState: (updates: Partial<ContentCreationState>) => void
}

export default function ContentInputStep({ state, updateState }: ContentInputStepProps) {
  const [inputMethod, setInputMethod] = useState<"text" | "ai" | "upload">("text")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleTextChange = (text: string) => {
    updateState({ content: text })
    if (text.trim() !== "") {
      updateState({ contentType: "text" })
    }
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, this would upload the file to a server
      // For this demo, we'll just use a placeholder
      const file = e.target.files[0]
      const isVideo = file.type.startsWith("video/")
      const newMedia = [...state.media, isVideo ? "/social-media-post.png" : "/social-media-post.png"]

      updateState({
        media: newMedia,
        contentType: isVideo ? "video" : "image",
      })
    }
  }

  const removeMedia = (index: number) => {
    const newMedia = [...state.media]
    newMedia.splice(index, 1)
    updateState({
      media: newMedia,
      contentType: newMedia.length === 0 && state.content ? "text" : state.contentType,
    })
  }

  const generateAiContent = () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)

    // Simulate AI generation
    setTimeout(() => {
      const suggestions = [
        `${aiPrompt} - Excited to share our latest update with you all! Let us know what you think in the comments below. #Innovation #NewFeatures`,
        `${aiPrompt} - Just launched something special! Check out our new release and tell us your thoughts. #ProductLaunch #Feedback`,
        `${aiPrompt} - We've been working on this for months and it's finally here! Introducing our newest creation. #NewRelease #Announcement`,
      ]

      setAiSuggestions(suggestions)
      setIsGenerating(false)
    }, 1500)
  }

  const selectAiSuggestion = (suggestion: string) => {
    updateState({
      content: suggestion,
      contentType: "text",
    })
    setInputMethod("text")
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Create Your Content</h2>

      <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as any)}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Studio
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <Textarea
            placeholder="What's on your mind? Type your content here..."
            className="min-h-[200px]"
            value={state.content}
            onChange={(e) => handleTextChange(e.target.value)}
          />

          {state.media.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              {state.media.map((media, index) => (
                <div key={index} className="relative group">
                  <img
                    src={media || "/placeholder.svg"}
                    alt={`Media ${index + 1}`}
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

          <div className="flex items-center gap-2">
            <Label htmlFor="media-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors">
                <ImageIcon className="h-4 w-4" />
                <span>Add Media</span>
              </div>
              <Input
                id="media-upload"
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
              />
            </Label>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Tell the AI what to write about</Label>
            <div className="flex gap-2">
              <Input
                id="ai-prompt"
                placeholder="e.g., Write a post about our new product launch"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <Button onClick={generateAiContent} disabled={isGenerating || !aiPrompt.trim()}>
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>

          {isGenerating && (
            <div className="p-8 text-center">
              <div className="animate-pulse text-purple-600">
                <Sparkles className="h-8 w-8 mx-auto mb-2" />
                <p>Generating creative content...</p>
              </div>
            </div>
          )}

          {!isGenerating && aiSuggestions.length > 0 && (
            <div className="space-y-3 mt-4">
              <Label>Select one of these AI-generated suggestions:</Label>
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => selectAiSuggestion(suggestion)}
                >
                  <p>{suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium text-lg">Drag and drop files</h3>
              <p className="text-muted-foreground text-sm mb-4">or click to browse files</p>
              <Input type="file" className="max-w-xs" accept="image/*,video/*" onChange={handleMediaUpload} />
              <p className="text-xs text-muted-foreground mt-4">Supported formats: JPEG, PNG, GIF, MP4, MOV</p>
            </div>
          </div>

          {state.media.length > 0 && (
            <div>
              <Label className="block mb-2">Uploaded Media:</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {state.media.map((media, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={media || "/placeholder.svg"}
                      alt={`Media ${index + 1}`}
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
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
