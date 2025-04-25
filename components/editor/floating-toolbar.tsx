"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link2,
  Type,
  Palette,
  ChevronDown,
  ImageIcon,
  FileImage,
  X, // Import the X icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Font size options
const fontSizeOptions = [
  { name: "Small", value: "1" },
  { name: "Normal", value: "3" },
  { name: "Medium", value: "4" },
  { name: "Large", value: "5" },
  { name: "X-Large", value: "6" },
  { name: "XX-Large", value: "7" },
];

// Color palette
const colorPalette = [
  // Reds
  "#FF0000",
  "#FF5252",
  "#FF4081",
  "#F44336",
  "#E91E63",
  // Purples
  "#9C27B0",
  "#673AB7",
  "#7C3AED",
  "#5E35B1",
  "#512DA8",
  // Blues
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  // Greens
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  // Oranges/Browns
  "#FF9800",
  "#FF5722",
  "#795548",
  "#607D8B",
  // Grayscale
  "#000000",
  "#424242",
  "#616161",
  "#9E9E9E",
  "#BDBDBD",
  "#FFFFFF",
];

export interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export interface ToolbarPosition {
  top: number;
  left: number;
}

export interface FloatingToolbarProps {
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
}

export default function FloatingToolbar({
  show,
  position,
  activeFormats,
  elementType,
  selectedElement,
  onFormatText,
  onSetBackgroundColor,
  onSetBackgroundImage,
  onSetLink,
  onSetAltTag,
  onClose, // Existing onClose prop
}: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isToolbarPositioned, setIsToolbarPositioned] = useState(false);

  // State for menu visibility
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showBackgroundMenu, setShowBackgroundMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [showAltMenu, setShowAltMenu] = useState(false);

  // Determine if element can have a link
  const canHaveLink =
    elementType &&
    !["img", "h1", "h2", "h3", "h4", "h5", "h6"].includes(elementType);

  // Determine if element can have text formatting
  const canFormatText = elementType && elementType !== "img";

  // Determine if element can have background color/image
  const canHaveBackground = elementType && !["a"].includes(elementType);

  // Toggle menu visibility
  const toggleMenu = (menu: string) => {
    // Close all menus first
    setShowFontSizeMenu(false);
    setShowColorMenu(false);
    setShowBackgroundMenu(false);
    setShowLinkMenu(false);
    setShowAltMenu(false);

    // Then open the selected menu
    switch (menu) {
      case "fontSize":
        setShowFontSizeMenu((prev) => !prev);
        break;
      case "color":
        setShowColorMenu((prev) => !prev);
        break;
      case "background":
        setShowBackgroundMenu((prev) => !prev);
        break;
      case "link":
        setShowLinkMenu((prev) => !prev);
        break;
      case "alt":
        setShowAltMenu((prev) => !prev);
        break;
    }
  };

  // Apply font size
  const applyFontSize = (size: string) => {
    onFormatText("fontSize", size);
    setShowFontSizeMenu(false);
  };

  // Apply text color
  const applyTextColor = (color: string) => {
    onFormatText("foreColor", color);
    setShowColorMenu(false);
  };

  // Handle clicks outside the toolbar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node) &&
        event.target !== selectedElement
      ) {
        onClose();
        // Close all menus
        setShowFontSizeMenu(false);
        setShowColorMenu(false);
        setShowBackgroundMenu(false);
        setShowLinkMenu(false);
        setShowAltMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedElement, onClose]);

  // Adjust toolbar position if it goes out of viewport
  useEffect(() => {
    if (show && toolbarRef.current) {
      const toolbar = toolbarRef.current;
      const rect = toolbar.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newLeft = position.left;
      let newTop = position.top;

      // Adjust horizontal position if needed
      if (rect.right > viewportWidth) {
        newLeft = Math.max(0, viewportWidth - rect.width - 10);
      } else if (rect.left < 0) {
        newLeft = 10;
      }

      // Adjust vertical position if needed
      if (rect.top < 0) {
        newTop = 10;
      }

      if (newLeft !== position.left || newTop !== position.top) {
        toolbar.style.left = `${newLeft}px`;
        toolbar.style.top = `${newTop}px`;
      }

      setIsToolbarPositioned(true);
    } else {
      setIsToolbarPositioned(false);
    }
  }, [show, position]);

  return (
    <div
      ref={toolbarRef}
      data-toolbar="true" // Add this attribute
      className={cn(
        "fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 transition-all duration-200 flex items-center gap-1 flex-wrap",
        show
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 pointer-events-none transform -translate-y-2"
      )}
      style={{
        top: `${Math.max(0, position.top)}px`,
        left: `${Math.max(0, position.left)}px`,
        maxWidth: "95vw",
      }}
    >
      {/* Text formatting options - only for text elements */}
      {canFormatText && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", activeFormats.bold && "bg-muted")}
            onClick={() => onFormatText("bold")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", activeFormats.italic && "bg-muted")}
            onClick={() => onFormatText("italic")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", activeFormats.underline && "bg-muted")}
            onClick={() => onFormatText("underline")}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Font Size - only for text elements */}
      {canFormatText && (
        <>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={() => toggleMenu("fontSize")}
            >
              <Type className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:text-xs">Size</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>

            {showFontSizeMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100]">
                <div className="p-1">
                  {fontSizeOptions.map((size) => (
                    <Button
                      key={size.name}
                      variant="ghost"
                      className="justify-start h-8 px-2 text-left w-full"
                      onClick={() => applyFontSize(size.value)}
                    >
                      <span>{size.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Text Color - only for text elements */}
      {canFormatText && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Text Color"
            onClick={() => toggleMenu("color")}
          >
            <Palette className="h-4 w-4" />
          </Button>

          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100]">
              <div className="p-3">
                <h4 className="text-sm font-medium">Text Color</h4>
                <div className="grid grid-cols-6 gap-1 mt-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      className="h-6 w-6 rounded-md border border-gray-200 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      style={{ backgroundColor: color }}
                      onClick={() => applyTextColor(color)}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center mt-2">
                  <Input
                    type="text"
                    placeholder="#000000"
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applyTextColor((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 ml-1"
                    onClick={(e) => {
                      const input = e.currentTarget
                        .previousSibling as HTMLInputElement;
                      if (input.value) {
                        applyTextColor(input.value);
                        input.value = "";
                      }
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Background Color/Image - for most elements */}
      {canHaveBackground && (
        <>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Background"
              onClick={() => toggleMenu("background")}
            >
              <FileImage className="h-4 w-4" />
            </Button>

            {showBackgroundMenu && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100]">
                <div className="p-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Background Color
                    </h4>
                    <div className="grid grid-cols-6 gap-1">
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          className="h-6 w-6 rounded-md border border-gray-200 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-200"
                          style={{ backgroundColor: color }}
                          onClick={() => onSetBackgroundColor(color)}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="flex items-center mt-2">
                      <Input
                        type="text"
                        placeholder="#000000"
                        className="h-8 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            onSetBackgroundColor(
                              (e.target as HTMLInputElement).value
                            );
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 ml-1"
                        onClick={(e) => {
                          const input = e.currentTarget
                            .previousSibling as HTMLInputElement;
                          if (input.value) {
                            onSetBackgroundColor(input.value);
                            input.value = "";
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">
                      Background Image
                    </h4>
                    <div className="flex flex-col space-y-2">
                      <Input
                        type="url"
                        placeholder="Image URL"
                        className="h-8 text-xs"
                        id="bg-image-url"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(
                            "bg-image-url"
                          ) as HTMLInputElement;
                          if (input.value) {
                            onSetBackgroundImage(input.value);
                            input.value = "";
                          }
                        }}
                      >
                        Apply Background Image
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Link Setting - only for appropriate elements */}
      {canHaveLink && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Add Link"
            onClick={() => toggleMenu("link")}
          >
            <Link2 className="h-4 w-4" />
          </Button>

          {showLinkMenu && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100]">
              <div className="p-3">
                <h4 className="text-sm font-medium">Add Link</h4>
                <div className="flex flex-col space-y-2 mt-2">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    className="h-8 text-xs"
                    id="link-url"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById(
                        "link-url"
                      ) as HTMLInputElement;
                      if (input.value) {
                        onSetLink(input.value);
                        input.value = "";
                      }
                    }}
                  >
                    Apply Link
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alt Tag Setting - only for images */}
      {elementType === "img" && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Set Alt Text"
            onClick={() => toggleMenu("alt")}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          {showAltMenu && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100]">
              <div className="p-3">
                <h4 className="text-sm font-medium">Image Alt Text</h4>
                <div className="flex flex-col space-y-2 mt-2">
                  <Label htmlFor="alt-text">Alt Text (for accessibility)</Label>
                  <Input
                    type="text"
                    placeholder="Describe the image"
                    className="h-8 text-xs"
                    id="alt-text"
                    defaultValue={
                      selectedElement
                        ? (selectedElement as HTMLImageElement).alt
                        : ""
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById(
                        "alt-text"
                      ) as HTMLInputElement;
                      onSetAltTag(input.value);
                    }}
                  >
                    Update Alt Text
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Separator and Close Button */}
      <Separator orientation="vertical" className="h-6 mx-1" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Close Toolbar"
        onClick={onClose} // Call the onClose prop when clicked
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
