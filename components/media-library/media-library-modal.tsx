"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaLibrary } from "./media-library";

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
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <MediaLibrary onSelectImage={handleSelectImage} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
