"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Upload,
  Calendar,
  Info,
  Download,
  Trash2,
  CheckCircle2,
  Grid2X2,
  LayoutList,
} from "lucide-react";
import { format } from "date-fns";

// Mock initial images
const initialImages = [
  {
    id: "1",
    url: "https://placehold.co/600x400",
    name: "Mountain Valley",
    type: "image/png",
    size: 1200000,
    uploadedAt: "2023-10-15T10:30:00Z",
  },
  {
    id: "2",
    url: "https://placehold.co/600x400",
    name: "Portrait Study",
    type: "image/png",
    size: 980000,
    uploadedAt: "2023-11-02T14:45:00Z",
  },
  {
    id: "3",
    url: "https://placehold.co/600x400",
    name: "Abstract Art",
    type: "image/png",
    size: 850000,
    uploadedAt: "2023-12-07T09:15:00Z",
  },
  {
    id: "4",
    url: "https://placehold.co/600x400",
    name: "Forest Stream",
    type: "image/png",
    size: 1450000,
    uploadedAt: "2024-01-20T16:20:00Z",
  },
];

type Image = {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
};

interface MediaLibraryProps {
  onSelectImage: (imageUrl: string | null) => void;
}

export function MediaLibrary({ onSelectImage }: MediaLibraryProps) {
  const [images, setImages] = useState<Image[]>(initialImages);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles]);

      // Create object URLs for previews
      const newPreviews = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setUploadPreviews((prev) => [...prev, ...newPreviews]);

      // Simulate upload progress
      const newProgressArray = acceptedFiles.map(() => 0);
      setUploadProgress((prev) => [...prev, ...newProgressArray]);

      // Simulate upload progress
      acceptedFiles.forEach((_, index) => {
        const totalIndex = uploadProgress.length + index;
        simulateUploadProgress(totalIndex);
      });

      // Mock adding the new images to our gallery
      const newImages = acceptedFiles.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        url: newPreviews[index],
        name: file.name.split(".")[0].replace(/[-_]/g, " "),
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }));

      setImages((prev) => [...prev, ...newImages]);
    },
    [uploadProgress]
  );

  const simulateUploadProgress = (index: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress((prev) => {
        const newProgress = [...prev];
        newProgress[index] = progress;
        return newProgress;
      });
    }, 300);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
  });

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setPreviewOpen(true);
  };

  const handleSelectImage = () => {
    if (selectedImage) {
      onSelectImage(selectedImage.url);
      setPreviewOpen(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Media Assets</h2>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-9 w-9"
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid View</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-9 w-9"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="gallery" className="flex-1">
            Gallery
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="pt-2">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image) => (
                <Card
                  key={image.id}
                  className="overflow-hidden cursor-pointer group hover:ring-2 hover:ring-purple-500 transition-all duration-200"
                  onClick={() => handleImageClick(image)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <div className="text-white text-sm font-medium truncate w-full">
                          {image.name}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(image.uploadedAt)}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0 h-5"
                    >
                      {formatFileSize(image.size)}
                    </Badge>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/40 px-4 py-2.5 text-sm font-medium grid grid-cols-12 gap-4">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1"></div>
              </div>
              <div className="divide-y">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="px-4 py-3 text-sm grid grid-cols-12 gap-4 items-center hover:bg-muted/30 cursor-pointer"
                    onClick={() => handleImageClick(image)}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-medium truncate">{image.name}</span>
                    </div>
                    <div className="col-span-2 text-muted-foreground">
                      {image.type.split("/")[1].toUpperCase()}
                    </div>
                    <div className="col-span-2 text-muted-foreground">
                      {formatFileSize(image.size)}
                    </div>
                    <div className="col-span-2 text-muted-foreground">
                      {formatDate(image.uploadedAt)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="pt-2">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? "border-purple-500 bg-purple-500/10"
                : "border-muted-foreground/20 hover:border-purple-500/50 hover:bg-purple-500/5"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  isDragActive
                    ? "bg-purple-100 text-purple-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium mb-2">Drop your files here</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Drag and drop your images or click to browse your files
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Select Files
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: JPEG, PNG, GIF, WebP • Max size: 10MB
              </p>
            </div>
          </div>

          {uploadPreviews.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                Uploaded Files
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/40 px-4 py-2.5 text-sm font-medium grid grid-cols-12 gap-4">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Actions</div>
                </div>
                <div className="divide-y">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 text-sm grid grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={uploadPreviews[index] || "/placeholder.svg"}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium truncate">
                          {file.name}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress[index]}%` }}
                          ></div>
                        </div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          {uploadProgress[index] < 100
                            ? `Uploading... ${uploadProgress[index]}%`
                            : "Upload complete"}
                        </div>
                      </div>
                      <div className="col-span-2 text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                      <div className="col-span-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedImage?.name}</DialogTitle>
          </DialogHeader>

          {selectedImage && (
            <div className="space-y-6">
              <div className="border rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800/50">
                <div className="flex items-center justify-center p-4">
                  <img
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.name}
                    className="max-h-[60vh] object-contain rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Type</div>
                  <div className="font-medium">
                    {selectedImage.type.split("/")[1].toUpperCase()}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Size</div>
                  <div className="font-medium">
                    {formatFileSize(selectedImage.size)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Uploaded</div>
                  <div className="font-medium">
                    {formatDate(selectedImage.uploadedAt)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPreviewOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSelectImage}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Use in Editor
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
