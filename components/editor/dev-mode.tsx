// This file was renamed from floating-toolbar.tsx to dev-mode.tsx. No code changes yet.

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link2,
  Type,
  Palette,
  ImageIcon,
  FileImage,
  Eraser,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditorStore } from "@/lib/editor-store";
import type { EditorState, EditorElement } from "@/lib/editor-store";

export interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface ToolbarPosition {
  top: number;
  left: number;
}

export interface DevModeProps {
  show: boolean;
  position: ToolbarPosition;
  activeFormats: ActiveFormats;
  elementType: string;
  selectedElement: HTMLElement | null;
  onFormatText: (command: string, value?: string) => void;
  onSetBackgroundColor: (color: string) => void;
  onSetBackgroundImage: (url: string) => void;
  onSetLink: (url: string) => void;
  onSetAltTag: (alt: string) => void;
  onClose: () => void;
  activeTextColor?: string | null;
  setActiveTextColor: (color: string) => void;
  onRemoveStandalone: () => void;
  canRemoveStandalone: boolean;
}

export default function DevMode({
  activeFormats,
  elementType,
  selectedElement,
  onFormatText,
  onSetBackgroundColor,
  onSetBackgroundImage,
  onSetLink,
  onSetAltTag,
  onClose,
  activeTextColor,
  setActiveTextColor,
  onRemoveStandalone,
  canRemoveStandalone,
}: DevModeProps) {
  const selectedElementId = useEditorStore(
    (s: EditorState) => s.selectedElementId
  );
  const elements = useEditorStore((s: EditorState) => s.elements);
  const makeTextBigger = useEditorStore((s: EditorState) => s.makeTextBigger);
  const updateElement = useEditorStore((s: EditorState) => s.updateElement);

  const TAILWIND_TEXT_SIZES = [
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
    "text-6xl",
    "text-7xl",
    "text-8xl",
    "text-9xl",
  ];

  const [textSize, setTextSize] = useState<string>("");

  const tagName =
    selectedElementId && (elements[selectedElementId] as EditorElement)?.tagName
      ? (elements[selectedElementId] as EditorElement).tagName
      : null;

  const handleTextSizeChange = (size: string) => {
    setTextSize(size);
    if (selectedElementId) {
      updateElement(selectedElementId, (el) => {
        // Remove any previous text size classes
        const filtered = (el.className || "")
          .split(" ")
          .filter((cls) => !TAILWIND_TEXT_SIZES.includes(cls))
          .concat(size)
          .filter(Boolean)
          .join(" ");
        return { ...el, className: filtered };
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col gap-6 border border-muted mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dev Mode Controls</h2>
        <Button
          variant="ghost"
          size="icon"
          title="Close Dev Mode"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="mb-2 text-sm text-muted-foreground">
        {tagName ? `Editing: <${tagName}>` : "No element selected"}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="font-medium mb-1">Text Formatting</div>
          <div className="flex gap-2">
            <Button
              variant={activeFormats.bold ? "default" : "outline"}
              size="icon"
              onClick={() => onFormatText("bold")}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={activeFormats.italic ? "default" : "outline"}
              size="icon"
              onClick={() => onFormatText("italic")}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={activeFormats.underline ? "default" : "outline"}
              size="icon"
              onClick={() => onFormatText("underline")}
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <div className="font-medium mb-1">Text Color</div>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={activeTextColor || "#000000"}
              onChange={(e) => setActiveTextColor(e.target.value)}
              className="w-10 h-10 p-0 border rounded"
            />
            <span className="text-xs font-mono">{activeTextColor}</span>
          </div>
        </div>
        <div>
          <div className="font-medium mb-1">Background Color</div>
          <Input
            type="color"
            onChange={(e) => onSetBackgroundColor(e.target.value)}
            className="w-10 h-10 p-0 border rounded"
          />
        </div>
        <div>
          <div className="font-medium mb-1">Background Image</div>
          <Input
            type="text"
            placeholder="Image URL"
            onBlur={(e) => onSetBackgroundImage(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <div className="font-medium mb-1">Link</div>
          <Input
            type="text"
            placeholder="https://example.com"
            onBlur={(e) => onSetLink(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <div className="font-medium mb-1">Alt Text (for images)</div>
          <Input
            type="text"
            placeholder="Describe the image"
            onBlur={(e) => onSetAltTag(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Button
            variant={canRemoveStandalone ? "destructive" : "outline"}
            size="sm"
            onClick={onRemoveStandalone}
            disabled={!canRemoveStandalone}
            className="w-fit"
          >
            <Eraser className="h-4 w-4 mr-2" /> Remove Standalone Span
          </Button>
        </div>
        <div>
          <div className="font-medium mb-1">Text Size</div>
          <select
            className="input input-bordered"
            value={textSize}
            onChange={(e) => handleTextSizeChange(e.target.value)}
            disabled={!selectedElementId}
          >
            <option value="">Select size</option>
            {TAILWIND_TEXT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size.replace("text-", "").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 text-muted-foreground text-sm">
        Dev Mode: All controls are always visible here for development and
        testing.
      </div>
    </div>
  );
}
