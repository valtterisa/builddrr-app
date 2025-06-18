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
import { ColorPicker } from "./color-picker";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { buildClassName } from "@/lib/editor-store";

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
  const removeClassGroup = useEditorStore(
    (s: EditorState) => s.removeClassGroup
  );
  const setClassGroup = useEditorStore((s: EditorState) => s.setClassGroup);

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

  const TAILWIND_FONT_WEIGHTS = [
    "font-thin",
    "font-extralight",
    "font-light",
    "font-normal",
    "font-medium",
    "font-semibold",
    "font-bold",
    "font-extrabold",
    "font-black",
  ];

  const TAILWIND_TEXT_ALIGN = [
    "text-left",
    "text-center",
    "text-right",
    "text-justify",
  ];

  const TAILWIND_LINE_HEIGHTS = [
    "leading-none",
    "leading-tight",
    "leading-snug",
    "leading-normal",
    "leading-relaxed",
    "leading-loose",
  ];

  const TAILWIND_LETTER_SPACING = [
    "tracking-tighter",
    "tracking-tight",
    "tracking-normal",
    "tracking-wide",
    "tracking-wider",
    "tracking-widest",
  ];

  const TAILWIND_TEXT_DECORATION = [
    "underline",
    "line-through",
    "no-underline",
  ];

  const TAILWIND_TEXT_TRANSFORM = [
    "uppercase",
    "lowercase",
    "capitalize",
    "normal-case",
  ];

  const TAILWIND_BG_GRADIENTS = [
    "bg-gradient-to-r",
    "bg-gradient-to-l",
    "bg-gradient-to-t",
    "bg-gradient-to-b",
  ];

  const TAILWIND_BORDER_WIDTHS = [
    "border",
    "border-2",
    "border-4",
    "border-8",
    "border-0",
  ];

  const TAILWIND_BORDER_RADIUS = [
    "rounded-none",
    "rounded-sm",
    "rounded",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",
    "rounded-2xl",
    "rounded-3xl",
    "rounded-full",
  ];

  const TAILWIND_SHADOWS = [
    "shadow-none",
    "shadow-sm",
    "shadow",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
    "shadow-2xl",
  ];

  const TAILWIND_SPACING = [
    "p-0",
    "p-2",
    "p-4",
    "p-6",
    "p-8",
    "m-0",
    "m-2",
    "m-4",
    "m-6",
    "m-8",
  ];

  const TAILWIND_WIDTHS = [
    "w-auto",
    "w-px",
    "w-1\/2",
    "w-1\/3",
    "w-2\/3",
    "w-1\/4",
    "w-3\/4",
    "w-full",
    "w-screen",
  ];

  const TAILWIND_HEIGHTS = [
    "h-auto",
    "h-px",
    "h-1\/2",
    "h-1\/3",
    "h-2\/3",
    "h-1\/4",
    "h-3\/4",
    "h-full",
    "h-screen",
  ];

  const TAILWIND_DISPLAY = [
    "block",
    "inline-block",
    "inline",
    "flex",
    "inline-flex",
    "grid",
    "inline-grid",
    "hidden",
  ];

  const TAILWIND_FLEX_ALIGN = [
    "items-start",
    "items-center",
    "items-end",
    "justify-start",
    "justify-center",
    "justify-end",
    "justify-between",
    "justify-around",
    "justify-evenly",
  ];

  const [textSize, setTextSize] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");
  const [originalClasses, setOriginalClasses] = useState<
    Record<string, string>
  >({});

  const tagName =
    selectedElementId && (elements[selectedElementId] as EditorElement)?.tagName
      ? (elements[selectedElementId] as EditorElement).tagName
      : null;

  useEffect(() => {
    if (selectedElement) {
      setTextContent(selectedElement.textContent || "");
      const classList = (selectedElement.className || "").split(" ");
      setOriginalClasses({
        "text-size":
          classList.find((cls) => TAILWIND_TEXT_SIZES.includes(cls)) || "",
        "font-weight":
          classList.find((cls) => TAILWIND_FONT_WEIGHTS.includes(cls)) || "",
        "text-align":
          classList.find((cls) => TAILWIND_TEXT_ALIGN.includes(cls)) || "",
        "line-height":
          classList.find((cls) => TAILWIND_LINE_HEIGHTS.includes(cls)) || "",
        "letter-spacing":
          classList.find((cls) => TAILWIND_LETTER_SPACING.includes(cls)) || "",
        "text-decoration":
          classList.find((cls) => TAILWIND_TEXT_DECORATION.includes(cls)) || "",
        "text-transform":
          classList.find((cls) => TAILWIND_TEXT_TRANSFORM.includes(cls)) || "",
        "bg-gradient":
          classList.find((cls) => TAILWIND_BG_GRADIENTS.includes(cls)) || "",
        "border-width":
          classList.find((cls) => TAILWIND_BORDER_WIDTHS.includes(cls)) || "",
        "border-radius":
          classList.find((cls) => TAILWIND_BORDER_RADIUS.includes(cls)) || "",
        "shadow": classList.find((cls) => TAILWIND_SHADOWS.includes(cls)) || "",
        "spacing":
          classList.find((cls) => TAILWIND_SPACING.includes(cls)) || "",
        "width": classList.find((cls) => TAILWIND_WIDTHS.includes(cls)) || "",
        "height": classList.find((cls) => TAILWIND_HEIGHTS.includes(cls)) || "",
        "display":
          classList.find((cls) => TAILWIND_DISPLAY.includes(cls)) || "",
        "flex-align":
          classList.find((cls) => TAILWIND_FLEX_ALIGN.includes(cls)) || "",
      });
    }
  }, [selectedElement]);

  const handleTextSizeChange = (size: string) => {
    setTextSize(size);
    if (!selectedElementId) return;
    updateElement(selectedElementId, (el) => ({
      ...el,
      fontSize: size,
      className: buildClassName({ ...el, fontSize: size }),
    }));
  };

  const handleTextContentChange = (val: string) => {
    setTextContent(val);
    if (selectedElementId) {
      updateElement(selectedElementId, (el) => ({ ...el, textContent: val }));
    }
  };

  // Helper for rendering a select control
  function StyleSelect({
    label,
    options,
    value,
    onChange,
    disabled = false,
    groupOptions: _groupOptions,
  }: {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    groupOptions: string[];
  }) {
    return (
      <div className="flex flex-col gap-1 mb-2">
        <Label className="mb-1">{label}</Label>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt: string) => (
              <SelectItem key={opt} value={opt}>
                {opt.replace(/-/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 p-4 flex flex-col gap-8 border border-muted h-full overflow-y-auto">
      {tagName && (
        <div className="border-alpha-200 flex w-min items-center justify-center gap-1.5 whitespace-nowrap rounded-md border bg-blue-100 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">
          {tagName}
        </div>
      )}
      {selectedElementId && tagName ? (
        <>
          <Accordion type="multiple" className="w-full space-y-2">
            <AccordionItem value="text">
              <AccordionTrigger>Text</AccordionTrigger>
              <AccordionContent>
                <StyleSelect
                  label="Font Size"
                  options={TAILWIND_TEXT_SIZES}
                  value={elements[selectedElementId || ""]?.fontSize || ""}
                  onChange={(size) => handleTextSizeChange(size)}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_TEXT_SIZES}
                />
                <StyleSelect
                  label="Font Weight"
                  options={TAILWIND_FONT_WEIGHTS}
                  value={elements[selectedElementId || ""]?.fontWeight || ""}
                  onChange={(fw) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      fontWeight: fw,
                      className: buildClassName({ ...el, fontWeight: fw }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_FONT_WEIGHTS}
                />
                <StyleSelect
                  label="Text Align"
                  options={TAILWIND_TEXT_ALIGN}
                  value={elements[selectedElementId || ""]?.textAlign || ""}
                  onChange={(align) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      textAlign: align,
                      className: buildClassName({ ...el, textAlign: align }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_TEXT_ALIGN}
                />
                <StyleSelect
                  label="Line Height"
                  options={TAILWIND_LINE_HEIGHTS}
                  value={elements[selectedElementId || ""]?.lineHeight || ""}
                  onChange={(lh) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      lineHeight: lh,
                      className: buildClassName({ ...el, lineHeight: lh }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_LINE_HEIGHTS}
                />
                <StyleSelect
                  label="Letter Spacing"
                  options={TAILWIND_LETTER_SPACING}
                  value={elements[selectedElementId || ""]?.letterSpacing || ""}
                  onChange={(ls) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      letterSpacing: ls,
                      className: buildClassName({ ...el, letterSpacing: ls }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_LETTER_SPACING}
                />
                <StyleSelect
                  label="Text Decoration"
                  options={TAILWIND_TEXT_DECORATION}
                  value={
                    elements[selectedElementId || ""]?.textDecoration || ""
                  }
                  onChange={(td) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      textDecoration: td,
                      className: buildClassName({ ...el, textDecoration: td }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_TEXT_DECORATION}
                />
                <StyleSelect
                  label="Text Transform"
                  options={TAILWIND_TEXT_TRANSFORM}
                  value={elements[selectedElementId || ""]?.textTransform || ""}
                  onChange={(tt) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      textTransform: tt,
                      className: buildClassName({ ...el, textTransform: tt }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_TEXT_TRANSFORM}
                />
                {selectedElement && (
                  <div className="mt-2">
                    <ColorPicker
                      element={selectedElement}
                      onUpdate={() => {}}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="background">
              <AccordionTrigger>Background</AccordionTrigger>
              <AccordionContent>
                <StyleSelect
                  label="Gradient"
                  options={TAILWIND_BG_GRADIENTS}
                  value={elements[selectedElementId || ""]?.bgGradient || ""}
                  onChange={(g) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      bgGradient: g,
                      className: buildClassName({ ...el, bgGradient: g }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_BG_GRADIENTS}
                />
                {selectedElement && (
                  <div className="mt-2">
                    <ColorPicker
                      element={selectedElement}
                      onUpdate={() => {}}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="border">
              <AccordionTrigger>Border</AccordionTrigger>
              <AccordionContent>
                <StyleSelect
                  label="Border Width"
                  options={TAILWIND_BORDER_WIDTHS}
                  value={elements[selectedElementId || ""]?.borderWidth || ""}
                  onChange={(bw) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      borderWidth: bw,
                      className: buildClassName({ ...el, borderWidth: bw }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_BORDER_WIDTHS}
                />
                <StyleSelect
                  label="Border Radius"
                  options={TAILWIND_BORDER_RADIUS}
                  value={elements[selectedElementId || ""]?.borderRadius || ""}
                  onChange={(br) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      borderRadius: br,
                      className: buildClassName({ ...el, borderRadius: br }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_BORDER_RADIUS}
                />
                {selectedElement && (
                  <div className="mt-2">
                    <ColorPicker
                      element={selectedElement}
                      onUpdate={() => {}}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shadow">
              <AccordionTrigger>Shadow</AccordionTrigger>
              <AccordionContent>
                <StyleSelect
                  label="Shadow"
                  options={TAILWIND_SHADOWS}
                  value={elements[selectedElementId || ""]?.shadow || ""}
                  onChange={(sh) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      shadow: sh,
                      className: buildClassName({ ...el, shadow: sh }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_SHADOWS}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="spacing">
              <AccordionTrigger>Spacing</AccordionTrigger>
              <AccordionContent>
                <StyleSelect
                  label="Spacing"
                  options={TAILWIND_SPACING}
                  value={elements[selectedElementId || ""]?.spacing || ""}
                  onChange={(sp) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      spacing: sp,
                      className: buildClassName({ ...el, spacing: sp }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_SPACING}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="layout">
              <AccordionTrigger>Layout</AccordionTrigger>
              <AccordionContent>
                <StyleSelect
                  label="Width"
                  options={TAILWIND_WIDTHS}
                  value={elements[selectedElementId || ""]?.width || ""}
                  onChange={(w) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      width: w,
                      className: buildClassName({ ...el, width: w }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_WIDTHS}
                />
                <StyleSelect
                  label="Height"
                  options={TAILWIND_HEIGHTS}
                  value={elements[selectedElementId || ""]?.height || ""}
                  onChange={(h) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      height: h,
                      className: buildClassName({ ...el, height: h }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_HEIGHTS}
                />
                <StyleSelect
                  label="Display"
                  options={TAILWIND_DISPLAY}
                  value={elements[selectedElementId || ""]?.display || ""}
                  onChange={(d) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      display: d,
                      className: buildClassName({ ...el, display: d }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_DISPLAY}
                />
                <StyleSelect
                  label="Flex/Grid Align"
                  options={TAILWIND_FLEX_ALIGN}
                  value={elements[selectedElementId || ""]?.flexAlign || ""}
                  onChange={(fa) => {
                    if (!selectedElementId) return;
                    updateElement(selectedElementId, (el) => ({
                      ...el,
                      flexAlign: fa,
                      className: buildClassName({ ...el, flexAlign: fa }),
                    }));
                  }}
                  disabled={!selectedElementId}
                  groupOptions={TAILWIND_FLEX_ALIGN}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="mb-6">
            <Label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Content
            </Label>
            <Input
              value={textContent}
              onChange={(e) => handleTextContentChange(e.target.value)}
              placeholder="Edit text content..."
              className="w-full h-10 px-3 text-base rounded-md border border-input bg-background"
              disabled={!selectedElementId}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-base font-medium h-full">
          No element selected. Choose an element to edit.
        </div>
      )}
    </div>
  );
}
