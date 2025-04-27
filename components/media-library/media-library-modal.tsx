"use client";

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
}

export function MediaLibraryModal({
  open = false,
  onOpenChange = () => {},
  onSelectImage,
}: MediaLibraryModalProps) {
  const handleSelectImage = (imageUrl: string | null) => {
    onSelectImage(imageUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader className="hidden">
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        <MediaLibrary onSelectImage={handleSelectImage} />
      </DialogContent>
    </Dialog>
  );
}
