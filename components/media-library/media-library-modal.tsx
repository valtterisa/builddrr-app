"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MediaLibrary } from "./media-library";
import { Image } from "lucide-react";
import { Button } from "../ui/button";

interface MediaLibraryModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectImage: (imageUrl: string | null) => void;
  title?: string;
}

export function MediaLibraryModal({
  open = false,
  onOpenChange = () => {},
  onSelectImage,
  title = "Media Library",
}: MediaLibraryModalProps) {
  const handleSelectImage = (imageUrl: string | null) => {
    onSelectImage(imageUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-fit mb-4">
          <Image className="h-4 w-4" />
          <DialogHeader className="hidden">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <MediaLibrary onSelectImage={handleSelectImage} />
      </DialogContent>
    </Dialog>
  );
}
