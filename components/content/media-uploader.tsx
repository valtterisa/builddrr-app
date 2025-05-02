"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Upload, Image as ImageIcon } from "lucide-react"

interface MediaUploaderProps {
  onUpload: (mediaUrl: string) => void
}

export default function MediaUploader({ onUpload }: MediaUploaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleImageSelect = (url: string) => {
    onUpload(url)
    setIsOpen(false)
  }

  const placeholderImages = [
    "/social-media-post.png",
    "/product-photography-still-life.png",
    "/vast-mountain-valley.png",
    "/portrait-photography.png",
    "/vibrant-pasta-dish.png",
    "/travel-photography.png",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <ImageIcon className="h-4 w-4" />
          Add Media
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Media</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-medium text-lg">Drag and drop files</h3>
                <p className="text-muted-foreground text-sm mb-4">or click to browse files</p>
                <Input
                  type="file"
                  className="max-w-xs"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    // In a real app, this would upload the file to a server
                    // For this demo, we'll just use a placeholder
                    if (e.target.files && e.target.files[0]) {
                      handleImageSelect(placeholderImages[0])
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-4">Supported formats: JPEG, PNG, GIF, MP4, MOV</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="library" className="py-4">
            <div className="grid grid-cols-3 gap-4">
              {placeholderImages.slice(0, 3).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageSelect(image)}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Library image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="stock" className="py-4">
            <div className="grid grid-cols-3 gap-4">
              {placeholderImages.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageSelect(image)}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Stock image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
