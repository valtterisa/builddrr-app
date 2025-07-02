import {
  Italic,
  Underline,
  Eraser,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { useEditorStore } from "@/lib/editor-store";
import type { EditorState, EditorElement } from "@/lib/editor-store";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { buildClassName } from "@/lib/editor-store";

export default function DevMode() {
  const selectedElementId = useEditorStore(
    (s: EditorState) => s.selectedElementId
  );
  const elements = useEditorStore((s: EditorState) => s.elements);
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

  const tagName =
    selectedElementId && (elements[selectedElementId] as EditorElement)?.tagName
      ? (elements[selectedElementId] as EditorElement).tagName
      : null;

  const handleTextSizeChange = (size: string | undefined) => {
    if (!selectedElementId) return;
    updateElement(selectedElementId, (el) => ({
      ...el,
      fontSize: size,
      className: buildClassName({ ...el, fontSize: size }),
    }));
  };

  return (
    <div className="flex flex-col min-h-0 h-full w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 gap-8 border border-muted max-h-[calc(100vh-5rem)]">
      {selectedElementId && tagName ? (
        <>
          <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2">
            {tagName && (
              <div className="border-alpha-200 flex w-min items-center justify-center gap-1.5 whitespace-nowrap rounded-md border bg-blue-100 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">
                {tagName}
              </div>
            )}
            <div className="mb-6">
              <div className="text-base font-bold mb-2">Typography</div>
              <div className="flex flex-col gap-3 bg-muted/30 rounded-lg p-4 border border-muted">
                {/* Font Family */}
                <div>
                  <Label className="text-xs mb-1 block">Font Family</Label>
                  <Select
                    value={
                      elements[selectedElementId || ""]?.fontFamily || "default"
                    }
                    onValueChange={(ff) => {
                      if (!selectedElementId) return;
                      updateElement(selectedElementId, (el) => ({
                        ...el,
                        fontFamily: ff === "default" ? undefined : ff,
                        className: buildClassName({
                          ...el,
                          fontFamily: ff === "default" ? undefined : ff,
                        }),
                      }));
                    }}
                    disabled={!selectedElementId}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="font-sans">Sans</SelectItem>
                      <SelectItem value="font-serif">Serif</SelectItem>
                      <SelectItem value="font-mono">Mono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Font Weight & Size */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Weight</Label>
                    <Select
                      value={
                        elements[selectedElementId || ""]?.fontWeight ||
                        "default"
                      }
                      onValueChange={(fw) => {
                        if (!selectedElementId) return;
                        updateElement(selectedElementId, (el) => ({
                          ...el,
                          fontWeight: fw === "default" ? undefined : fw,
                          className: buildClassName({
                            ...el,
                            fontWeight: fw === "default" ? undefined : fw,
                          }),
                        }));
                      }}
                      disabled={!selectedElementId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Regular" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Regular</SelectItem>
                        {TAILWIND_FONT_WEIGHTS.map((fw) => (
                          <SelectItem key={fw} value={fw}>
                            {fw.replace("font-", "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Size</Label>
                    <Select
                      value={
                        elements[selectedElementId || ""]?.fontSize || "default"
                      }
                      onValueChange={(size) =>
                        handleTextSizeChange(
                          size === "default" ? undefined : size
                        )
                      }
                      disabled={!selectedElementId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {TAILWIND_TEXT_SIZES.map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz.replace("text-", "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Line Height & Letter Spacing */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Line Height</Label>
                    <Select
                      value={
                        elements[selectedElementId || ""]?.lineHeight ||
                        "default"
                      }
                      onValueChange={(lh) => {
                        if (!selectedElementId) return;
                        updateElement(selectedElementId, (el) => ({
                          ...el,
                          lineHeight: lh === "default" ? undefined : lh,
                          className: buildClassName({
                            ...el,
                            lineHeight: lh === "default" ? undefined : lh,
                          }),
                        }));
                      }}
                      disabled={!selectedElementId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {TAILWIND_LINE_HEIGHTS.map((lh) => (
                          <SelectItem key={lh} value={lh}>
                            {lh.replace("leading-", "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Letter Spacing</Label>
                    <Select
                      value={
                        elements[selectedElementId || ""]?.letterSpacing ||
                        "default"
                      }
                      onValueChange={(ls) => {
                        if (!selectedElementId) return;
                        updateElement(selectedElementId, (el) => ({
                          ...el,
                          letterSpacing: ls === "default" ? undefined : ls,
                          className: buildClassName({
                            ...el,
                            letterSpacing: ls === "default" ? undefined : ls,
                          }),
                        }));
                      }}
                      disabled={!selectedElementId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {TAILWIND_LETTER_SPACING.map((ls) => (
                          <SelectItem key={ls} value={ls}>
                            {ls.replace("tracking-", "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Alignment & Decoration */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Alignment</Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          elements[selectedElementId || ""]?.textAlign ===
                          "text-left"
                            ? "default"
                            : "ghost"
                        }
                        className="h-8 w-8"
                        onClick={() => {
                          if (!selectedElementId) return;
                          updateElement(selectedElementId, (el) => ({
                            ...el,
                            textAlign: "text-left",
                            className: buildClassName({
                              ...el,
                              textAlign: "text-left",
                            }),
                          }));
                        }}
                        aria-label="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          elements[selectedElementId || ""]?.textAlign ===
                          "text-center"
                            ? "default"
                            : "ghost"
                        }
                        className="h-8 w-8"
                        onClick={() => {
                          if (!selectedElementId) return;
                          updateElement(selectedElementId, (el) => ({
                            ...el,
                            textAlign: "text-center",
                            className: buildClassName({
                              ...el,
                              textAlign: "text-center",
                            }),
                          }));
                        }}
                        aria-label="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          elements[selectedElementId || ""]?.textAlign ===
                          "text-right"
                            ? "default"
                            : "ghost"
                        }
                        className="h-8 w-8"
                        onClick={() => {
                          if (!selectedElementId) return;
                          updateElement(selectedElementId, (el) => ({
                            ...el,
                            textAlign: "text-right",
                            className: buildClassName({
                              ...el,
                              textAlign: "text-right",
                            }),
                          }));
                        }}
                        aria-label="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          elements[selectedElementId || ""]?.textAlign ===
                          "text-justify"
                            ? "default"
                            : "ghost"
                        }
                        className="h-8 w-8"
                        onClick={() => {
                          if (!selectedElementId) return;
                          updateElement(selectedElementId, (el) => ({
                            ...el,
                            textAlign: "text-justify",
                            className: buildClassName({
                              ...el,
                              textAlign: "text-justify",
                            }),
                          }));
                        }}
                        aria-label="Align Justify"
                      >
                        <AlignJustify className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Decoration</Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          elements[
                            selectedElementId || ""
                          ]?.textDecoration?.includes("underline")
                            ? "default"
                            : "ghost"
                        }
                        className="h-8 w-8"
                        onClick={() => {
                          if (!selectedElementId) return;
                          updateElement(selectedElementId, (el) => {
                            let newDecoration = el.textDecoration || "";
                            if (newDecoration.includes("underline")) {
                              newDecoration = newDecoration
                                .replace("underline", "")
                                .replace(/\s+/g, " ")
                                .trim();
                            } else {
                              newDecoration = (newDecoration + " underline")
                                .trim()
                                .replace(/\s+/g, " ");
                            }
                            newDecoration = newDecoration || "";
                            return {
                              ...el,
                              textDecoration: newDecoration,
                              className: buildClassName({
                                ...el,
                                textDecoration: newDecoration,
                              }),
                            };
                          });
                        }}
                        aria-label="Underline"
                      >
                        <Underline className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          elements[
                            selectedElementId || ""
                          ]?.textDecoration?.includes("line-through")
                            ? "default"
                            : "ghost"
                        }
                        className="h-8 w-8"
                        onClick={() => {
                          if (!selectedElementId) return;
                          updateElement(selectedElementId, (el) => {
                            let newDecoration = el.textDecoration || "";
                            if (newDecoration.includes("line-through")) {
                              newDecoration = newDecoration
                                .replace("line-through", "")
                                .replace(/\s+/g, " ")
                                .trim();
                            } else {
                              newDecoration = (newDecoration + " line-through")
                                .trim()
                                .replace(/\s+/g, " ");
                            }
                            newDecoration = newDecoration || "";
                            return {
                              ...el,
                              textDecoration: newDecoration,
                              className: buildClassName({
                                ...el,
                                textDecoration: newDecoration,
                              }),
                            };
                          });
                        }}
                        aria-label="Strikethrough"
                      >
                        <Strikethrough className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          elements[selectedElementId || ""]?.fontStyle ===
                          "italic"
                            ? "default"
                            : "ghost"
                        }
                        className="h-8 w-8"
                        onClick={() => {
                          if (!selectedElementId) return;
                          updateElement(selectedElementId, (el) => ({
                            ...el,
                            fontStyle:
                              el.fontStyle === "italic" ? undefined : "italic",
                            className: buildClassName({
                              ...el,
                              fontStyle:
                                el.fontStyle === "italic"
                                  ? undefined
                                  : "italic",
                            }),
                          }));
                        }}
                        aria-label="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant={
                          !elements[selectedElementId || ""]?.textDecoration &&
                          !elements[selectedElementId || ""]?.fontStyle
                            ? "default"
                            : "ghost"
                        }
                        className="h-8 w-8"
                        onClick={() => {
                          if (!selectedElementId) return;
                          updateElement(selectedElementId, (el) => ({
                            ...el,
                            textDecoration: undefined,
                            fontStyle: undefined,
                            className: buildClassName({
                              ...el,
                              textDecoration: undefined,
                              fontStyle: undefined,
                            }),
                          }));
                        }}
                        aria-label="Clear Decoration"
                      >
                        <Eraser className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="">
              <div className="text-base font-bold mb-2">Background</div>
              <div className="flex flex-col gap-3 bg-muted/30 rounded-lg p-4 border border-muted">
                <div>
                  <Label className="text-xs mb-1 block">Gradient</Label>
                  <Select
                    value={
                      elements[selectedElementId || ""]?.bgGradient || "default"
                    }
                    onValueChange={(g) => {
                      if (!selectedElementId) return;
                      updateElement(selectedElementId, (el) => ({
                        ...el,
                        bgGradient: g === "default" ? undefined : g,
                        className: buildClassName({
                          ...el,
                          bgGradient: g === "default" ? undefined : g,
                        }),
                      }));
                    }}
                    disabled={!selectedElementId}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      {TAILWIND_BG_GRADIENTS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g.replace("bg-gradient-to-", "to ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <div className="text-base font-bold mb-2">Border</div>
              <div className="flex flex-col gap-3 bg-muted/30 rounded-lg p-4 border border-muted">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Border Width</Label>
                    <Select
                      value={
                        elements[selectedElementId || ""]?.borderWidth ||
                        "default"
                      }
                      onValueChange={(bw) => {
                        if (!selectedElementId) return;
                        updateElement(selectedElementId, (el) => ({
                          ...el,
                          borderWidth: bw === "default" ? undefined : bw,
                          className: buildClassName({
                            ...el,
                            borderWidth: bw === "default" ? undefined : bw,
                          }),
                        }));
                      }}
                      disabled={!selectedElementId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {TAILWIND_BORDER_WIDTHS.map((bw) => (
                          <SelectItem key={bw} value={bw}>
                            {bw}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Border Radius</Label>
                    <Select
                      value={
                        elements[selectedElementId || ""]?.borderRadius ||
                        "default"
                      }
                      onValueChange={(br) => {
                        if (!selectedElementId) return;
                        updateElement(selectedElementId, (el) => ({
                          ...el,
                          borderRadius: br === "default" ? undefined : br,
                          className: buildClassName({
                            ...el,
                            borderRadius: br === "default" ? undefined : br,
                          }),
                        }));
                      }}
                      disabled={!selectedElementId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {TAILWIND_BORDER_RADIUS.map((br) => (
                          <SelectItem key={br} value={br}>
                            {br.replace("rounded-", "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <div className="text-base font-bold mb-2">Shadow</div>
              <div className="flex flex-col gap-3 bg-muted/30 rounded-lg p-4 border border-muted">
                <div>
                  <Label className="text-xs mb-1 block">Shadow</Label>
                  <Select
                    value={
                      elements[selectedElementId || ""]?.shadow || "default"
                    }
                    onValueChange={(sh) => {
                      if (!selectedElementId) return;
                      updateElement(selectedElementId, (el) => ({
                        ...el,
                        shadow: sh === "default" ? undefined : sh,
                        className: buildClassName({
                          ...el,
                          shadow: sh === "default" ? undefined : sh,
                        }),
                      }));
                    }}
                    disabled={!selectedElementId}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      {TAILWIND_SHADOWS.map((sh) => (
                        <SelectItem key={sh} value={sh}>
                          {sh.replace("shadow-", "")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-base font-bold mb-2">Spacing</div>
              <div className="flex flex-col gap-3 bg-muted/30 rounded-lg p-4 border border-muted">
                <div>
                  <Label className="text-xs mb-1 block">Spacing</Label>
                  <Select
                    value={
                      elements[selectedElementId || ""]?.spacing || "default"
                    }
                    onValueChange={(sp) => {
                      if (!selectedElementId) return;
                      updateElement(selectedElementId, (el) => ({
                        ...el,
                        spacing: sp === "default" ? undefined : sp,
                        className: buildClassName({
                          ...el,
                          spacing: sp === "default" ? undefined : sp,
                        }),
                      }));
                    }}
                    disabled={!selectedElementId}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      {TAILWIND_SPACING.map((sp) => (
                        <SelectItem key={sp} value={sp}>
                          {sp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-base font-bold mb-2">Layout</div>
              <div className="flex flex-col gap-3 bg-muted/30 rounded-lg p-4 border border-muted">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Width</Label>
                    <Select
                      value={
                        elements[selectedElementId || ""]?.width || "default"
                      }
                      onValueChange={(w) => {
                        if (!selectedElementId) return;
                        updateElement(selectedElementId, (el) => ({
                          ...el,
                          width: w === "default" ? undefined : w,
                          className: buildClassName({
                            ...el,
                            width: w === "default" ? undefined : w,
                          }),
                        }));
                      }}
                      disabled={!selectedElementId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {TAILWIND_WIDTHS.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w.replace("w-", "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Height</Label>
                    <Select
                      value={
                        elements[selectedElementId || ""]?.height || "default"
                      }
                      onValueChange={(h) => {
                        if (!selectedElementId) return;
                        updateElement(selectedElementId, (el) => ({
                          ...el,
                          height: h === "default" ? undefined : h,
                          className: buildClassName({
                            ...el,
                            height: h === "default" ? undefined : h,
                          }),
                        }));
                      }}
                      disabled={!selectedElementId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {TAILWIND_HEIGHTS.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h.replace("h-", "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">Display</Label>
                    <Select
                      value={
                        elements[selectedElementId || ""]?.display || "default"
                      }
                      onValueChange={(d) => {
                        if (!selectedElementId) return;
                        updateElement(selectedElementId, (el) => ({
                          ...el,
                          display: d === "default" ? undefined : d,
                          className: buildClassName({
                            ...el,
                            display: d === "default" ? undefined : d,
                          }),
                        }));
                      }}
                      disabled={!selectedElementId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {TAILWIND_DISPLAY.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">
                      Flex/Grid Align
                    </Label>
                    <Select
                      value={
                        elements[selectedElementId || ""]?.flexAlign ||
                        "default"
                      }
                      onValueChange={(fa) => {
                        if (!selectedElementId) return;
                        updateElement(selectedElementId, (el) => ({
                          ...el,
                          flexAlign: fa === "default" ? undefined : fa,
                          className: buildClassName({
                            ...el,
                            flexAlign: fa === "default" ? undefined : fa,
                          }),
                        }));
                      }}
                      disabled={!selectedElementId}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {TAILWIND_FLEX_ALIGN.map((fa) => (
                          <SelectItem key={fa} value={fa}>
                            {fa.replace("items-", "").replace("justify-", "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
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
