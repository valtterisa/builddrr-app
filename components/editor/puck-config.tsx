"use client";
import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { registerOverlayPortal } from "@measured/puck";

const DrawerTabContext = createContext<{
  activeTab: "Core" | "Sections" | "Templates";
  setActiveTab: (tab: "Core" | "Sections" | "Templates") => void;
}>({
  activeTab: "Core",
  setActiveTab: () => {},
});

export const puckConfig = {
  components: {
    // CORE ELEMENTS - Basic building blocks
    TextElement: {
      defaultProps: {
        content: "Your text here",
        size: "base",
        weight: "normal",
        align: "left",
        color: "default",
        italic: false,
        underline: false,
        lineHeight: "normal",
        letterSpacing: "normal",
        textTransform: "none",
        fontFamily: "default",
        backgroundColor: "transparent",
        padding: "none",
        margin: "none",
        borderRadius: "none",
        shadow: "none",
      },
      fields: {
        content: { type: "textarea", label: "Text Content" },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "Extra Small", value: "xs" },
            { label: "Small", value: "sm" },
            { label: "Base", value: "base" },
            { label: "Large", value: "lg" },
            { label: "Extra Large", value: "xl" },
            { label: "2XL", value: "2xl" },
            { label: "3XL", value: "3xl" },
            { label: "4XL", value: "4xl" },
            { label: "5XL", value: "5xl" },
          ],
        },
        weight: {
          type: "select",
          label: "Weight",
          options: [
            { label: "Thin", value: "thin" },
            { label: "Light", value: "light" },
            { label: "Normal", value: "normal" },
            { label: "Medium", value: "medium" },
            { label: "Semibold", value: "semibold" },
            { label: "Bold", value: "bold" },
            { label: "Extrabold", value: "extrabold" },
            { label: "Black", value: "black" },
          ],
        },
        align: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
            { label: "Justify", value: "justify" },
          ],
        },
        color: {
          type: "select",
          label: "Text Color",
          options: [
            { label: "Default", value: "default" },
            { label: "Muted", value: "muted" },
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Accent", value: "accent" },
            { label: "Destructive", value: "destructive" },
            { label: "White", value: "white" },
            { label: "Black", value: "black" },
            { label: "Gray 500", value: "gray-500" },
            { label: "Gray 600", value: "gray-600" },
            { label: "Gray 700", value: "gray-700" },
            { label: "Red 500", value: "red-500" },
            { label: "Blue 500", value: "blue-500" },
            { label: "Green 500", value: "green-500" },
            { label: "Yellow 500", value: "yellow-500" },
            { label: "Purple 500", value: "purple-500" },
            { label: "Pink 500", value: "pink-500" },
            { label: "Indigo 500", value: "indigo-500" },
          ],
        },
        backgroundColor: {
          type: "select",
          label: "Background Color",
          options: [
            { label: "Transparent", value: "transparent" },
            { label: "Background", value: "background" },
            { label: "Muted", value: "muted" },
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Accent", value: "accent" },
            { label: "Destructive", value: "destructive" },
            { label: "White", value: "white" },
            { label: "Black", value: "black" },
            { label: "Gray 100", value: "gray-100" },
            { label: "Gray 200", value: "gray-200" },
            { label: "Red 100", value: "red-100" },
            { label: "Blue 100", value: "blue-100" },
            { label: "Green 100", value: "green-100" },
            { label: "Yellow 100", value: "yellow-100" },
            { label: "Purple 100", value: "purple-100" },
          ],
        },
        fontFamily: {
          type: "select",
          label: "Font Family",
          options: [
            { label: "Default", value: "default" },
            { label: "Sans Serif", value: "sans" },
            { label: "Serif", value: "serif" },
            { label: "Monospace", value: "mono" },
          ],
        },
        lineHeight: {
          type: "select",
          label: "Line Height",
          options: [
            { label: "Tight", value: "tight" },
            { label: "Snug", value: "snug" },
            { label: "Normal", value: "normal" },
            { label: "Relaxed", value: "relaxed" },
            { label: "Loose", value: "loose" },
          ],
        },
        letterSpacing: {
          type: "select",
          label: "Letter Spacing",
          options: [
            { label: "Tighter", value: "tighter" },
            { label: "Tight", value: "tight" },
            { label: "Normal", value: "normal" },
            { label: "Wide", value: "wide" },
            { label: "Wider", value: "wider" },
            { label: "Widest", value: "widest" },
          ],
        },
        textTransform: {
          type: "select",
          label: "Text Transform",
          options: [
            { label: "None", value: "none" },
            { label: "Uppercase", value: "uppercase" },
            { label: "Lowercase", value: "lowercase" },
            { label: "Capitalize", value: "capitalize" },
          ],
        },
        padding: {
          type: "select",
          label: "Padding",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "X-Large", value: "xl" },
          ],
        },
        margin: {
          type: "select",
          label: "Margin",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "X-Large", value: "xl" },
          ],
        },
        borderRadius: {
          type: "select",
          label: "Border Radius",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "X-Large", value: "xl" },
            { label: "Full", value: "full" },
          ],
        },
        shadow: {
          type: "select",
          label: "Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "X-Large", value: "xl" },
          ],
        },
        italic: {
          type: "select",
          label: "Italic",
          options: [
            { label: "No", value: false },
            { label: "Yes", value: true },
          ],
        },
        underline: {
          type: "select",
          label: "Underline",
          options: [
            { label: "No", value: false },
            { label: "Yes", value: true },
          ],
        },
      },
      render: ({
        content,
        size,
        weight,
        align,
        color,
        italic,
        underline,
        lineHeight,
        letterSpacing,
        textTransform,
        fontFamily,
        backgroundColor,
        padding,
        margin,
        borderRadius,
        shadow,
      }: any) => {
        const sizeClass =
          size === "xs"
            ? "text-xs"
            : size === "sm"
              ? "text-sm"
              : size === "lg"
                ? "text-lg"
                : size === "xl"
                  ? "text-xl"
                  : size === "2xl"
                    ? "text-2xl"
                    : size === "3xl"
                      ? "text-3xl"
                      : size === "4xl"
                        ? "text-4xl"
                        : size === "5xl"
                          ? "text-5xl"
                          : "text-base";

        const weightClass =
          weight === "thin"
            ? "font-thin"
            : weight === "light"
              ? "font-light"
              : weight === "medium"
                ? "font-medium"
                : weight === "semibold"
                  ? "font-semibold"
                  : weight === "bold"
                    ? "font-bold"
                    : weight === "extrabold"
                      ? "font-extrabold"
                      : weight === "black"
                        ? "font-black"
                        : "font-normal";

        const alignClass =
          align === "center"
            ? "text-center"
            : align === "right"
              ? "text-right"
              : align === "justify"
                ? "text-justify"
                : "text-left";

        const colorClass =
          color === "muted"
            ? "text-muted-foreground"
            : color === "primary"
              ? "text-primary"
              : color === "secondary"
                ? "text-secondary"
                : color === "accent"
                  ? "text-accent"
                  : color === "destructive"
                    ? "text-destructive"
                    : color === "white"
                      ? "text-white"
                      : color === "black"
                        ? "text-black"
                        : color === "gray-500"
                          ? "text-gray-500"
                          : color === "gray-600"
                            ? "text-gray-600"
                            : color === "gray-700"
                              ? "text-gray-700"
                              : color === "red-500"
                                ? "text-red-500"
                                : color === "blue-500"
                                  ? "text-blue-500"
                                  : color === "green-500"
                                    ? "text-green-500"
                                    : color === "yellow-500"
                                      ? "text-yellow-500"
                                      : color === "purple-500"
                                        ? "text-purple-500"
                                        : color === "pink-500"
                                          ? "text-pink-500"
                                          : color === "indigo-500"
                                            ? "text-indigo-500"
                                            : "";

        const backgroundClass =
          backgroundColor === "background"
            ? "bg-background"
            : backgroundColor === "muted"
              ? "bg-muted"
              : backgroundColor === "primary"
                ? "bg-primary"
                : backgroundColor === "secondary"
                  ? "bg-secondary"
                  : backgroundColor === "accent"
                    ? "bg-accent"
                    : backgroundColor === "destructive"
                      ? "bg-destructive"
                      : backgroundColor === "white"
                        ? "bg-white"
                        : backgroundColor === "black"
                          ? "bg-black"
                          : backgroundColor === "gray-100"
                            ? "bg-gray-100"
                            : backgroundColor === "gray-200"
                              ? "bg-gray-200"
                              : backgroundColor === "red-100"
                                ? "bg-red-100"
                                : backgroundColor === "blue-100"
                                  ? "bg-blue-100"
                                  : backgroundColor === "green-100"
                                    ? "bg-green-100"
                                    : backgroundColor === "yellow-100"
                                      ? "bg-yellow-100"
                                      : backgroundColor === "purple-100"
                                        ? "bg-purple-100"
                                        : "";

        const fontFamilyClass =
          fontFamily === "sans"
            ? "font-sans"
            : fontFamily === "serif"
              ? "font-serif"
              : fontFamily === "mono"
                ? "font-mono"
                : "";

        const lineHeightClass =
          lineHeight === "tight"
            ? "leading-tight"
            : lineHeight === "snug"
              ? "leading-snug"
              : lineHeight === "relaxed"
                ? "leading-relaxed"
                : lineHeight === "loose"
                  ? "leading-loose"
                  : "leading-normal";

        const letterSpacingClass =
          letterSpacing === "tighter"
            ? "tracking-tighter"
            : letterSpacing === "tight"
              ? "tracking-tight"
              : letterSpacing === "wide"
                ? "tracking-wide"
                : letterSpacing === "wider"
                  ? "tracking-wider"
                  : letterSpacing === "widest"
                    ? "tracking-widest"
                    : "tracking-normal";

        const textTransformClass =
          textTransform === "uppercase"
            ? "uppercase"
            : textTransform === "lowercase"
              ? "lowercase"
              : textTransform === "capitalize"
                ? "capitalize"
                : "";

        const paddingClass =
          padding === "sm"
            ? "p-2"
            : padding === "md"
              ? "p-4"
              : padding === "lg"
                ? "p-6"
                : padding === "xl"
                  ? "p-8"
                  : "";

        const marginClass =
          margin === "sm"
            ? "m-2"
            : margin === "md"
              ? "m-4"
              : margin === "lg"
                ? "m-6"
                : margin === "xl"
                  ? "m-8"
                  : "";

        const borderRadiusClass =
          borderRadius === "sm"
            ? "rounded-sm"
            : borderRadius === "md"
              ? "rounded-md"
              : borderRadius === "lg"
                ? "rounded-lg"
                : borderRadius === "xl"
                  ? "rounded-xl"
                  : borderRadius === "full"
                    ? "rounded-full"
                    : "";

        const shadowClass =
          shadow === "sm"
            ? "shadow-sm"
            : shadow === "md"
              ? "shadow-md"
              : shadow === "lg"
                ? "shadow-lg"
                : shadow === "xl"
                  ? "shadow-xl"
                  : "";

        const styleClass =
          `${italic ? "italic" : ""} ${underline ? "underline" : ""}`.trim();

        return (
          <span
            className={`${sizeClass} ${weightClass} ${alignClass} ${colorClass} ${backgroundClass} ${fontFamilyClass} ${lineHeightClass} ${letterSpacingClass} ${textTransformClass} ${paddingClass} ${marginClass} ${borderRadiusClass} ${shadowClass} ${styleClass}`.trim()}
          >
            {content}
          </span>
        );
      },
    },

    HeadingElement: {
      defaultProps: {
        content: "Heading",
        level: "h2",
        align: "left",
        color: "default",
        weight: "bold",
        fontFamily: "default",
        letterSpacing: "normal",
        textTransform: "none",
        backgroundColor: "transparent",
        padding: "none",
        margin: "none",
        borderRadius: "none",
        shadow: "none",
        gradient: "none",
      },
      fields: {
        content: { type: "text", label: "Heading Text" },
        level: {
          type: "select",
          label: "Level",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
            { label: "H5", value: "h5" },
            { label: "H6", value: "h6" },
          ],
        },
        align: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: {
          type: "select",
          label: "Text Color",
          options: [
            { label: "Default", value: "default" },
            { label: "Muted", value: "muted" },
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Accent", value: "accent" },
            { label: "Destructive", value: "destructive" },
            { label: "White", value: "white" },
            { label: "Black", value: "black" },
            { label: "Gray 600", value: "gray-600" },
            { label: "Gray 700", value: "gray-700" },
            { label: "Gray 800", value: "gray-800" },
            { label: "Red 600", value: "red-600" },
            { label: "Blue 600", value: "blue-600" },
            { label: "Green 600", value: "green-600" },
            { label: "Purple 600", value: "purple-600" },
            { label: "Indigo 600", value: "indigo-600" },
          ],
        },
        weight: {
          type: "select",
          label: "Font Weight",
          options: [
            { label: "Light", value: "light" },
            { label: "Normal", value: "normal" },
            { label: "Medium", value: "medium" },
            { label: "Semibold", value: "semibold" },
            { label: "Bold", value: "bold" },
            { label: "Extrabold", value: "extrabold" },
            { label: "Black", value: "black" },
          ],
        },
        fontFamily: {
          type: "select",
          label: "Font Family",
          options: [
            { label: "Default", value: "default" },
            { label: "Sans Serif", value: "sans" },
            { label: "Serif", value: "serif" },
            { label: "Monospace", value: "mono" },
          ],
        },
        letterSpacing: {
          type: "select",
          label: "Letter Spacing",
          options: [
            { label: "Tighter", value: "tighter" },
            { label: "Tight", value: "tight" },
            { label: "Normal", value: "normal" },
            { label: "Wide", value: "wide" },
            { label: "Wider", value: "wider" },
            { label: "Widest", value: "widest" },
          ],
        },
        textTransform: {
          type: "select",
          label: "Text Transform",
          options: [
            { label: "None", value: "none" },
            { label: "Uppercase", value: "uppercase" },
            { label: "Lowercase", value: "lowercase" },
            { label: "Capitalize", value: "capitalize" },
          ],
        },
        backgroundColor: {
          type: "select",
          label: "Background Color",
          options: [
            { label: "Transparent", value: "transparent" },
            { label: "Background", value: "background" },
            { label: "Muted", value: "muted" },
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Accent", value: "accent" },
            { label: "Gray 100", value: "gray-100" },
            { label: "Gray 200", value: "gray-200" },
            { label: "Blue 100", value: "blue-100" },
            { label: "Green 100", value: "green-100" },
            { label: "Purple 100", value: "purple-100" },
          ],
        },
        gradient: {
          type: "select",
          label: "Text Gradient",
          options: [
            { label: "None", value: "none" },
            { label: "Blue to Purple", value: "blue-purple" },
            { label: "Green to Blue", value: "green-blue" },
            { label: "Purple to Pink", value: "purple-pink" },
            { label: "Orange to Red", value: "orange-red" },
            { label: "Indigo to Purple", value: "indigo-purple" },
          ],
        },
        padding: {
          type: "select",
          label: "Padding",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "X-Large", value: "xl" },
          ],
        },
        margin: {
          type: "select",
          label: "Margin",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "X-Large", value: "xl" },
          ],
        },
        borderRadius: {
          type: "select",
          label: "Border Radius",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "X-Large", value: "xl" },
          ],
        },
        shadow: {
          type: "select",
          label: "Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "X-Large", value: "xl" },
          ],
        },
      },
      render: ({
        content,
        level,
        align,
        color,
        weight,
        fontFamily,
        letterSpacing,
        textTransform,
        backgroundColor,
        padding,
        margin,
        borderRadius,
        shadow,
        gradient,
      }: any) => {
        const alignClass =
          align === "center"
            ? "text-center"
            : align === "right"
              ? "text-right"
              : "text-left";

        const sizeClass =
          level === "h1"
            ? "text-4xl"
            : level === "h2"
              ? "text-3xl"
              : level === "h3"
                ? "text-2xl"
                : level === "h4"
                  ? "text-xl"
                  : level === "h5"
                    ? "text-lg"
                    : "text-base";

        const weightClass =
          weight === "light"
            ? "font-light"
            : weight === "normal"
              ? "font-normal"
              : weight === "medium"
                ? "font-medium"
                : weight === "semibold"
                  ? "font-semibold"
                  : weight === "bold"
                    ? "font-bold"
                    : weight === "extrabold"
                      ? "font-extrabold"
                      : weight === "black"
                        ? "font-black"
                        : "font-bold";

        const colorClass =
          color === "muted"
            ? "text-muted-foreground"
            : color === "primary"
              ? "text-primary"
              : color === "secondary"
                ? "text-secondary"
                : color === "accent"
                  ? "text-accent"
                  : color === "destructive"
                    ? "text-destructive"
                    : color === "white"
                      ? "text-white"
                      : color === "black"
                        ? "text-black"
                        : color === "gray-600"
                          ? "text-gray-600"
                          : color === "gray-700"
                            ? "text-gray-700"
                            : color === "gray-800"
                              ? "text-gray-800"
                              : color === "red-600"
                                ? "text-red-600"
                                : color === "blue-600"
                                  ? "text-blue-600"
                                  : color === "green-600"
                                    ? "text-green-600"
                                    : color === "purple-600"
                                      ? "text-purple-600"
                                      : color === "indigo-600"
                                        ? "text-indigo-600"
                                        : "";

        const fontFamilyClass =
          fontFamily === "sans"
            ? "font-sans"
            : fontFamily === "serif"
              ? "font-serif"
              : fontFamily === "mono"
                ? "font-mono"
                : "";

        const letterSpacingClass =
          letterSpacing === "tighter"
            ? "tracking-tighter"
            : letterSpacing === "tight"
              ? "tracking-tight"
              : letterSpacing === "wide"
                ? "tracking-wide"
                : letterSpacing === "wider"
                  ? "tracking-wider"
                  : letterSpacing === "widest"
                    ? "tracking-widest"
                    : "tracking-normal";

        const textTransformClass =
          textTransform === "uppercase"
            ? "uppercase"
            : textTransform === "lowercase"
              ? "lowercase"
              : textTransform === "capitalize"
                ? "capitalize"
                : "";

        const backgroundClass =
          backgroundColor === "background"
            ? "bg-background"
            : backgroundColor === "muted"
              ? "bg-muted"
              : backgroundColor === "primary"
                ? "bg-primary"
                : backgroundColor === "secondary"
                  ? "bg-secondary"
                  : backgroundColor === "accent"
                    ? "bg-accent"
                    : backgroundColor === "gray-100"
                      ? "bg-gray-100"
                      : backgroundColor === "gray-200"
                        ? "bg-gray-200"
                        : backgroundColor === "blue-100"
                          ? "bg-blue-100"
                          : backgroundColor === "green-100"
                            ? "bg-green-100"
                            : backgroundColor === "purple-100"
                              ? "bg-purple-100"
                              : "";

        const paddingClass =
          padding === "sm"
            ? "p-2"
            : padding === "md"
              ? "p-4"
              : padding === "lg"
                ? "p-6"
                : padding === "xl"
                  ? "p-8"
                  : "";

        const marginClass =
          margin === "sm"
            ? "m-2"
            : margin === "md"
              ? "m-4"
              : margin === "lg"
                ? "m-6"
                : margin === "xl"
                  ? "m-8"
                  : "";

        const borderRadiusClass =
          borderRadius === "sm"
            ? "rounded-sm"
            : borderRadius === "md"
              ? "rounded-md"
              : borderRadius === "lg"
                ? "rounded-lg"
                : borderRadius === "xl"
                  ? "rounded-xl"
                  : "";

        const shadowClass =
          shadow === "sm"
            ? "shadow-sm"
            : shadow === "md"
              ? "shadow-md"
              : shadow === "lg"
                ? "shadow-lg"
                : shadow === "xl"
                  ? "shadow-xl"
                  : "";

        const gradientClass =
          gradient === "blue-purple"
            ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            : gradient === "green-blue"
              ? "bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
              : gradient === "purple-pink"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                : gradient === "orange-red"
                  ? "bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                  : gradient === "indigo-purple"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                    : "";

        const className =
          `${sizeClass} ${weightClass} ${alignClass} ${gradientClass || colorClass} ${fontFamilyClass} ${letterSpacingClass} ${textTransformClass} ${backgroundClass} ${paddingClass} ${marginClass} ${borderRadiusClass} ${shadowClass}`.trim();

        switch (level) {
          case "h1":
            return <h1 className={className}>{content}</h1>;
          case "h2":
            return <h2 className={className}>{content}</h2>;
          case "h3":
            return <h3 className={className}>{content}</h3>;
          case "h4":
            return <h4 className={className}>{content}</h4>;
          case "h5":
            return <h5 className={className}>{content}</h5>;
          case "h6":
            return <h6 className={className}>{content}</h6>;
          default:
            return <h2 className={className}>{content}</h2>;
        }
      },
    },

    ImageElement: {
      defaultProps: {
        src: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop",
        alt: "Image description",
        width: "full",
        height: "auto",
        rounded: "md",
        objectFit: "cover",
        aspectRatio: "auto",
        shadow: "none",
        border: "none",
        borderColor: "gray-200",
        borderWidth: "thin",
        opacity: "100",
        brightness: "100",
        contrast: "100",
        saturate: "100",
        hoverEffect: "none",
        overlay: "none",
        overlayColor: "black",
        overlayOpacity: "50",
      },
      fields: {
        src: { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Alt Text" },
        width: {
          type: "select",
          label: "Width",
          options: [
            { label: "Auto", value: "auto" },
            { label: "Full", value: "full" },
            { label: "1/2", value: "1/2" },
            { label: "1/3", value: "1/3" },
            { label: "2/3", value: "2/3" },
            { label: "1/4", value: "1/4" },
            { label: "3/4", value: "3/4" },
            { label: "16", value: "16" },
            { label: "24", value: "24" },
            { label: "32", value: "32" },
            { label: "48", value: "48" },
            { label: "64", value: "64" },
            { label: "80", value: "80" },
            { label: "96", value: "96" },
          ],
        },
        height: {
          type: "select",
          label: "Height",
          options: [
            { label: "Auto", value: "auto" },
            { label: "16", value: "16" },
            { label: "24", value: "24" },
            { label: "32", value: "32" },
            { label: "48", value: "48" },
            { label: "64", value: "64" },
            { label: "80", value: "80" },
            { label: "96", value: "96" },
            { label: "Screen", value: "screen" },
          ],
        },
        aspectRatio: {
          type: "select",
          label: "Aspect Ratio",
          options: [
            { label: "Auto", value: "auto" },
            { label: "Square (1:1)", value: "square" },
            { label: "Video (16:9)", value: "video" },
            { label: "Portrait (3:4)", value: "portrait" },
            { label: "Landscape (4:3)", value: "landscape" },
            { label: "Ultrawide (21:9)", value: "ultrawide" },
          ],
        },
        rounded: {
          type: "select",
          label: "Border Radius",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "X-Large", value: "xl" },
            { label: "2X-Large", value: "2xl" },
            { label: "3X-Large", value: "3xl" },
            { label: "Full", value: "full" },
          ],
        },
        objectFit: {
          type: "select",
          label: "Object Fit",
          options: [
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
            { label: "Fill", value: "fill" },
            { label: "Scale Down", value: "scale-down" },
            { label: "None", value: "none" },
          ],
        },
        shadow: {
          type: "select",
          label: "Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "X-Large", value: "xl" },
            { label: "2X-Large", value: "2xl" },
          ],
        },
        border: {
          type: "select",
          label: "Border",
          options: [
            { label: "None", value: "none" },
            { label: "Thin", value: "thin" },
            { label: "Medium", value: "medium" },
            { label: "Thick", value: "thick" },
          ],
        },
        borderColor: {
          type: "select",
          label: "Border Color",
          options: [
            { label: "Gray 200", value: "gray-200" },
            { label: "Gray 300", value: "gray-300" },
            { label: "Gray 400", value: "gray-400" },
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Accent", value: "accent" },
            { label: "White", value: "white" },
            { label: "Black", value: "black" },
            { label: "Red", value: "red-300" },
            { label: "Blue", value: "blue-300" },
            { label: "Green", value: "green-300" },
            { label: "Purple", value: "purple-300" },
          ],
        },
        opacity: {
          type: "select",
          label: "Opacity",
          options: [
            { label: "100%", value: "100" },
            { label: "95%", value: "95" },
            { label: "90%", value: "90" },
            { label: "80%", value: "80" },
            { label: "70%", value: "70" },
            { label: "60%", value: "60" },
            { label: "50%", value: "50" },
          ],
        },
        brightness: {
          type: "select",
          label: "Brightness",
          options: [
            { label: "50%", value: "50" },
            { label: "75%", value: "75" },
            { label: "100%", value: "100" },
            { label: "110%", value: "110" },
            { label: "125%", value: "125" },
            { label: "150%", value: "150" },
          ],
        },
        contrast: {
          type: "select",
          label: "Contrast",
          options: [
            { label: "50%", value: "50" },
            { label: "75%", value: "75" },
            { label: "100%", value: "100" },
            { label: "125%", value: "125" },
            { label: "150%", value: "150" },
            { label: "200%", value: "200" },
          ],
        },
        saturate: {
          type: "select",
          label: "Saturation",
          options: [
            { label: "0%", value: "0" },
            { label: "50%", value: "50" },
            { label: "100%", value: "100" },
            { label: "150%", value: "150" },
            { label: "200%", value: "200" },
          ],
        },
        hoverEffect: {
          type: "select",
          label: "Hover Effect",
          options: [
            { label: "None", value: "none" },
            { label: "Zoom", value: "zoom" },
            { label: "Zoom Out", value: "zoom-out" },
            { label: "Fade", value: "fade" },
            { label: "Brighten", value: "brighten" },
            { label: "Darken", value: "darken" },
            { label: "Grayscale", value: "grayscale" },
            { label: "Lift", value: "lift" },
          ],
        },
        overlay: {
          type: "select",
          label: "Overlay",
          options: [
            { label: "None", value: "none" },
            { label: "Color", value: "color" },
            { label: "Gradient", value: "gradient" },
          ],
        },
        overlayColor: {
          type: "select",
          label: "Overlay Color",
          options: [
            { label: "Black", value: "black" },
            { label: "White", value: "white" },
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Blue", value: "blue" },
            { label: "Red", value: "red" },
            { label: "Green", value: "green" },
            { label: "Purple", value: "purple" },
          ],
        },
        overlayOpacity: {
          type: "select",
          label: "Overlay Opacity",
          options: [
            { label: "10%", value: "10" },
            { label: "20%", value: "20" },
            { label: "30%", value: "30" },
            { label: "40%", value: "40" },
            { label: "50%", value: "50" },
            { label: "60%", value: "60" },
            { label: "70%", value: "70" },
          ],
        },
      },
      render: ({
        src,
        alt,
        width,
        height,
        rounded,
        objectFit,
        aspectRatio,
        shadow,
        border,
        borderColor,
        opacity,
        brightness,
        contrast,
        saturate,
        hoverEffect,
        overlay,
        overlayColor,
        overlayOpacity,
      }: any) => {
        const widthClass =
          width === "full"
            ? "w-full"
            : width === "1/2"
              ? "w-1/2"
              : width === "1/3"
                ? "w-1/3"
                : width === "2/3"
                  ? "w-2/3"
                  : width === "1/4"
                    ? "w-1/4"
                    : width === "3/4"
                      ? "w-3/4"
                      : width === "16"
                        ? "w-16"
                        : width === "24"
                          ? "w-24"
                          : width === "32"
                            ? "w-32"
                            : width === "48"
                              ? "w-48"
                              : width === "64"
                                ? "w-64"
                                : width === "80"
                                  ? "w-80"
                                  : width === "96"
                                    ? "w-96"
                                    : "w-auto";

        const heightClass =
          height === "auto"
            ? "h-auto"
            : height === "screen"
              ? "h-screen"
              : `h-${height}`;

        const aspectRatioClass =
          aspectRatio === "square"
            ? "aspect-square"
            : aspectRatio === "video"
              ? "aspect-video"
              : aspectRatio === "portrait"
                ? "aspect-[3/4]"
                : aspectRatio === "landscape"
                  ? "aspect-[4/3]"
                  : aspectRatio === "ultrawide"
                    ? "aspect-[21/9]"
                    : "";

        const roundedClass =
          rounded === "none"
            ? ""
            : rounded === "sm"
              ? "rounded-sm"
              : rounded === "md"
                ? "rounded-md"
                : rounded === "lg"
                  ? "rounded-lg"
                  : rounded === "xl"
                    ? "rounded-xl"
                    : rounded === "2xl"
                      ? "rounded-2xl"
                      : rounded === "3xl"
                        ? "rounded-3xl"
                        : rounded === "full"
                          ? "rounded-full"
                          : "rounded-md";

        const objectFitClass = `object-${objectFit}`;

        const shadowClass =
          shadow === "none"
            ? ""
            : shadow === "sm"
              ? "shadow-sm"
              : shadow === "md"
                ? "shadow-md"
                : shadow === "lg"
                  ? "shadow-lg"
                  : shadow === "xl"
                    ? "shadow-xl"
                    : shadow === "2xl"
                      ? "shadow-2xl"
                      : "";

        const borderClass =
          border === "none"
            ? ""
            : border === "thin"
              ? "border"
              : border === "medium"
                ? "border-2"
                : border === "thick"
                  ? "border-4"
                  : "";

        const borderColorClass = borderClass ? `border-${borderColor}` : "";

        const opacityClass = opacity !== "100" ? `opacity-${opacity}` : "";

        const filterClasses = [
          brightness !== "100" ? `brightness-${brightness}` : "",
          contrast !== "100" ? `contrast-${contrast}` : "",
          saturate !== "100" ? `saturate-${saturate}` : "",
        ]
          .filter(Boolean)
          .join(" ");

        const hoverEffectClass =
          hoverEffect === "zoom"
            ? "hover:scale-110 transition-transform duration-300"
            : hoverEffect === "zoom-out"
              ? "hover:scale-95 transition-transform duration-300"
              : hoverEffect === "fade"
                ? "hover:opacity-80 transition-opacity duration-300"
                : hoverEffect === "brighten"
                  ? "hover:brightness-110 transition-all duration-300"
                  : hoverEffect === "darken"
                    ? "hover:brightness-90 transition-all duration-300"
                    : hoverEffect === "grayscale"
                      ? "hover:grayscale transition-all duration-300"
                      : hoverEffect === "lift"
                        ? "hover:-translate-y-2 hover:shadow-lg transition-all duration-300"
                        : "";

        const baseClasses = [
          widthClass,
          heightClass,
          aspectRatioClass,
          roundedClass,
          objectFitClass,
          shadowClass,
          borderClass,
          borderColorClass,
          opacityClass,
          filterClasses,
          hoverEffectClass,
        ]
          .filter(Boolean)
          .join(" ");

        const overlayElement = overlay !== "none" && (
          <div
            className={`absolute inset-0 ${roundedClass} ${
              overlay === "color"
                ? `bg-${overlayColor} opacity-${overlayOpacity}`
                : `bg-gradient-to-r from-${overlayColor} to-transparent opacity-${overlayOpacity}`
            }`}
          />
        );

        return (
          <div
            className={`relative ${hoverEffect !== "none" ? "overflow-hidden" : ""} ${roundedClass}`}
          >
            <img src={src} alt={alt} className={baseClasses} />
            {overlayElement}
          </div>
        );
      },
    },

    ButtonElement: {
      defaultProps: {
        text: "Click me",
        variant: "default",
        size: "default",
        href: "#",
        fullWidth: false,
        disabled: false,
        customColor: "none",
        customBackgroundColor: "none",
        borderColor: "none",
        borderWidth: "default",
        customShadow: "default",
        customRadius: "default",
        hoverEffect: "default",
        fontWeight: "default",
        textTransform: "none",
        letterSpacing: "normal",
        icon: "none",
        iconPosition: "left",
      },
      fields: {
        text: { type: "text", label: "Button Text" },
        variant: {
          type: "select",
          label: "Variant",
          options: [
            { label: "Default", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
            { label: "Ghost", value: "ghost" },
            { label: "Link", value: "link" },
            { label: "Destructive", value: "destructive" },
            { label: "Custom", value: "custom" },
          ],
        },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "Extra Small", value: "xs" },
            { label: "Small", value: "sm" },
            { label: "Default", value: "default" },
            { label: "Large", value: "lg" },
            { label: "Extra Large", value: "xl" },
            { label: "Icon", value: "icon" },
          ],
        },
        customColor: {
          type: "select",
          label: "Text Color",
          options: [
            { label: "Default", value: "none" },
            { label: "White", value: "white" },
            { label: "Black", value: "black" },
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Gray 600", value: "gray-600" },
            { label: "Gray 700", value: "gray-700" },
            { label: "Red 600", value: "red-600" },
            { label: "Blue 600", value: "blue-600" },
            { label: "Green 600", value: "green-600" },
            { label: "Purple 600", value: "purple-600" },
            { label: "Yellow 600", value: "yellow-600" },
            { label: "Pink 600", value: "pink-600" },
          ],
        },
        customBackgroundColor: {
          type: "select",
          label: "Background Color",
          options: [
            { label: "Default", value: "none" },
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Accent", value: "accent" },
            { label: "Muted", value: "muted" },
            { label: "White", value: "white" },
            { label: "Black", value: "black" },
            { label: "Gray 100", value: "gray-100" },
            { label: "Gray 200", value: "gray-200" },
            { label: "Gray 800", value: "gray-800" },
            { label: "Red 500", value: "red-500" },
            { label: "Blue 500", value: "blue-500" },
            { label: "Green 500", value: "green-500" },
            { label: "Purple 500", value: "purple-500" },
            { label: "Yellow 500", value: "yellow-500" },
            { label: "Pink 500", value: "pink-500" },
            { label: "Gradient Blue", value: "gradient-blue" },
            { label: "Gradient Purple", value: "gradient-purple" },
            { label: "Gradient Green", value: "gradient-green" },
          ],
        },
        borderColor: {
          type: "select",
          label: "Border Color",
          options: [
            { label: "Default", value: "none" },
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Muted", value: "muted" },
            { label: "Gray 300", value: "gray-300" },
            { label: "Gray 400", value: "gray-400" },
            { label: "Red 300", value: "red-300" },
            { label: "Blue 300", value: "blue-300" },
            { label: "Green 300", value: "green-300" },
            { label: "Purple 300", value: "purple-300" },
          ],
        },
        borderWidth: {
          type: "select",
          label: "Border Width",
          options: [
            { label: "Default", value: "default" },
            { label: "Thin", value: "thin" },
            { label: "Medium", value: "medium" },
            { label: "Thick", value: "thick" },
          ],
        },
        customShadow: {
          type: "select",
          label: "Shadow",
          options: [
            { label: "Default", value: "default" },
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Extra Large", value: "xl" },
            { label: "Colored Primary", value: "colored-primary" },
            { label: "Colored Secondary", value: "colored-secondary" },
          ],
        },
        customRadius: {
          type: "select",
          label: "Border Radius",
          options: [
            { label: "Default", value: "default" },
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Extra Large", value: "xl" },
            { label: "Full", value: "full" },
          ],
        },
        hoverEffect: {
          type: "select",
          label: "Hover Effect",
          options: [
            { label: "Default", value: "default" },
            { label: "Lift", value: "lift" },
            { label: "Grow", value: "grow" },
            { label: "Glow", value: "glow" },
            { label: "Fade", value: "fade" },
            { label: "Slide", value: "slide" },
          ],
        },
        fontWeight: {
          type: "select",
          label: "Font Weight",
          options: [
            { label: "Default", value: "default" },
            { label: "Normal", value: "normal" },
            { label: "Medium", value: "medium" },
            { label: "Semibold", value: "semibold" },
            { label: "Bold", value: "bold" },
            { label: "Extrabold", value: "extrabold" },
          ],
        },
        textTransform: {
          type: "select",
          label: "Text Transform",
          options: [
            { label: "None", value: "none" },
            { label: "Uppercase", value: "uppercase" },
            { label: "Lowercase", value: "lowercase" },
            { label: "Capitalize", value: "capitalize" },
          ],
        },
        letterSpacing: {
          type: "select",
          label: "Letter Spacing",
          options: [
            { label: "Normal", value: "normal" },
            { label: "Tight", value: "tight" },
            { label: "Wide", value: "wide" },
            { label: "Wider", value: "wider" },
            { label: "Widest", value: "widest" },
          ],
        },
        icon: {
          type: "select",
          label: "Icon",
          options: [
            { label: "None", value: "none" },
            { label: "Arrow Right", value: "arrow-right" },
            { label: "Arrow Left", value: "arrow-left" },
            { label: "Download", value: "download" },
            { label: "External Link", value: "external" },
            { label: "Plus", value: "plus" },
            { label: "Check", value: "check" },
            { label: "Heart", value: "heart" },
            { label: "Star", value: "star" },
            { label: "Play", value: "play" },
            { label: "Shopping Cart", value: "cart" },
          ],
        },
        iconPosition: {
          type: "select",
          label: "Icon Position",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
        href: { type: "text", label: "Link URL" },
        fullWidth: {
          type: "select",
          label: "Full Width",
          options: [
            { label: "No", value: false },
            { label: "Yes", value: true },
          ],
        },
        disabled: {
          type: "select",
          label: "Disabled",
          options: [
            { label: "No", value: false },
            { label: "Yes", value: true },
          ],
        },
      },
      render: ({
        text,
        variant,
        size,
        href,
        fullWidth,
        disabled,
        customColor,
        customBackgroundColor,
        borderColor,
        borderWidth,
        customShadow,
        customRadius,
        hoverEffect,
        fontWeight,
        textTransform,
        letterSpacing,
        icon,
        iconPosition,
      }: any) => {
        // Icon mapping
        const iconMap: Record<string, string> = {
          "arrow-right": "→",
          "arrow-left": "←",
          "download": "⬇",
          "external": "↗",
          "plus": "+",
          "check": "✓",
          "heart": "♥",
          "star": "★",
          "play": "▶",
          "cart": "🛒",
        };

        const iconElement = icon !== "none" ? iconMap[icon] || "" : "";

        // Custom styling classes
        const colorClass =
          customColor !== "none"
            ? `text-${customColor === "primary" ? "primary" : customColor === "secondary" ? "secondary" : customColor}`
            : "";

        const backgroundColorClass =
          customBackgroundColor !== "none"
            ? customBackgroundColor === "gradient-blue"
              ? "bg-gradient-to-r from-blue-500 to-blue-600"
              : customBackgroundColor === "gradient-purple"
                ? "bg-gradient-to-r from-purple-500 to-purple-600"
                : customBackgroundColor === "gradient-green"
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : `bg-${customBackgroundColor}`
            : "";

        const borderColorClass =
          borderColor !== "none" ? `border-${borderColor}` : "";

        const borderWidthClass =
          borderWidth === "thin"
            ? "border"
            : borderWidth === "medium"
              ? "border-2"
              : borderWidth === "thick"
                ? "border-4"
                : "";

        const shadowClass =
          customShadow === "none"
            ? "shadow-none"
            : customShadow === "sm"
              ? "shadow-sm"
              : customShadow === "md"
                ? "shadow-md"
                : customShadow === "lg"
                  ? "shadow-lg"
                  : customShadow === "xl"
                    ? "shadow-xl"
                    : customShadow === "colored-primary"
                      ? "shadow-lg shadow-primary/25"
                      : customShadow === "colored-secondary"
                        ? "shadow-lg shadow-secondary/25"
                        : "";

        const radiusClass =
          customRadius === "none"
            ? "rounded-none"
            : customRadius === "sm"
              ? "rounded-sm"
              : customRadius === "md"
                ? "rounded-md"
                : customRadius === "lg"
                  ? "rounded-lg"
                  : customRadius === "xl"
                    ? "rounded-xl"
                    : customRadius === "full"
                      ? "rounded-full"
                      : "";

        const hoverEffectClass =
          hoverEffect === "lift"
            ? "hover:-translate-y-1 transition-transform"
            : hoverEffect === "grow"
              ? "hover:scale-105 transition-transform"
              : hoverEffect === "glow"
                ? "hover:shadow-lg hover:shadow-primary/25 transition-shadow"
                : hoverEffect === "fade"
                  ? "hover:opacity-80 transition-opacity"
                  : hoverEffect === "slide"
                    ? "hover:translate-x-1 transition-transform"
                    : "";

        const fontWeightClass =
          fontWeight === "normal"
            ? "font-normal"
            : fontWeight === "medium"
              ? "font-medium"
              : fontWeight === "semibold"
                ? "font-semibold"
                : fontWeight === "bold"
                  ? "font-bold"
                  : fontWeight === "extrabold"
                    ? "font-extrabold"
                    : "";

        const textTransformClass =
          textTransform === "uppercase"
            ? "uppercase"
            : textTransform === "lowercase"
              ? "lowercase"
              : textTransform === "capitalize"
                ? "capitalize"
                : "";

        const letterSpacingClass =
          letterSpacing === "tight"
            ? "tracking-tight"
            : letterSpacing === "wide"
              ? "tracking-wide"
              : letterSpacing === "wider"
                ? "tracking-wider"
                : letterSpacing === "widest"
                  ? "tracking-widest"
                  : "";

        const customClasses = [
          colorClass,
          backgroundColorClass,
          borderColorClass,
          borderWidthClass,
          shadowClass,
          radiusClass,
          hoverEffectClass,
          fontWeightClass,
          textTransformClass,
          letterSpacingClass,
          fullWidth ? "w-full" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const content = (
          <>
            {iconElement && iconPosition === "left" && (
              <span className="mr-2">{iconElement}</span>
            )}
            {text}
            {iconElement && iconPosition === "right" && (
              <span className="ml-2">{iconElement}</span>
            )}
          </>
        );

        const buttonEl =
          variant === "custom" ? (
            <button
              disabled={disabled}
              className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${customClasses}`}
            >
              {content}
            </button>
          ) : (
            <Button
              variant={variant as any}
              size={size as any}
              disabled={disabled}
              className={`${customClasses} ${hoverEffectClass}`}
            >
              {content}
            </Button>
          );

        if (href && href !== "#" && !disabled) {
          return (
            <a href={href} className={fullWidth ? "w-full block" : ""}>
              {buttonEl}
            </a>
          );
        }

        return buttonEl;
      },
    },

    LinkElement: {
      defaultProps: {
        text: "Link text",
        href: "#",
        target: "_self",
        color: "primary",
        underline: "hover",
        weight: "normal",
        size: "base",
        decoration: "none",
        hoverEffect: "default",
        icon: "none",
        iconPosition: "right",
      },
      fields: {
        text: { type: "text", label: "Link Text" },
        href: { type: "text", label: "URL" },
        target: {
          type: "select",
          label: "Target",
          options: [
            { label: "Same Window", value: "_self" },
            { label: "New Window", value: "_blank" },
          ],
        },
        color: {
          type: "select",
          label: "Color",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Muted", value: "muted" },
            { label: "Default", value: "default" },
            { label: "Black", value: "black" },
            { label: "White", value: "white" },
            { label: "Gray 600", value: "gray-600" },
            { label: "Red 600", value: "red-600" },
            { label: "Blue 600", value: "blue-600" },
            { label: "Green 600", value: "green-600" },
            { label: "Purple 600", value: "purple-600" },
            { label: "Indigo 600", value: "indigo-600" },
          ],
        },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "Small", value: "sm" },
            { label: "Base", value: "base" },
            { label: "Large", value: "lg" },
            { label: "Extra Large", value: "xl" },
          ],
        },
        weight: {
          type: "select",
          label: "Font Weight",
          options: [
            { label: "Normal", value: "normal" },
            { label: "Medium", value: "medium" },
            { label: "Semibold", value: "semibold" },
            { label: "Bold", value: "bold" },
          ],
        },
        underline: {
          type: "select",
          label: "Underline",
          options: [
            { label: "Always", value: "always" },
            { label: "Hover", value: "hover" },
            { label: "Never", value: "never" },
          ],
        },
        decoration: {
          type: "select",
          label: "Text Decoration",
          options: [
            { label: "None", value: "none" },
            { label: "Underline", value: "underline" },
            { label: "Overline", value: "overline" },
            { label: "Line Through", value: "line-through" },
          ],
        },
        hoverEffect: {
          type: "select",
          label: "Hover Effect",
          options: [
            { label: "Default", value: "default" },
            { label: "Fade", value: "fade" },
            { label: "Brighten", value: "brighten" },
            { label: "Scale", value: "scale" },
            { label: "Slide", value: "slide" },
          ],
        },
        icon: {
          type: "select",
          label: "Icon",
          options: [
            { label: "None", value: "none" },
            { label: "External Link", value: "external" },
            { label: "Arrow Right", value: "arrow-right" },
            { label: "Arrow Left", value: "arrow-left" },
            { label: "Download", value: "download" },
            { label: "Mail", value: "mail" },
            { label: "Phone", value: "phone" },
          ],
        },
        iconPosition: {
          type: "select",
          label: "Icon Position",
          options: [
            { label: "Left", value: "left" },
            { label: "Right", value: "right" },
          ],
        },
      },
      render: ({
        text,
        href,
        target,
        color,
        underline,
        weight,
        size,
        decoration,
        hoverEffect,
        icon,
        iconPosition,
      }: any) => {
        const iconMap: Record<string, string> = {
          "external": "↗",
          "arrow-right": "→",
          "arrow-left": "←",
          "download": "⬇",
          "mail": "✉",
          "phone": "📞",
        };

        const iconElement = icon !== "none" ? iconMap[icon] || "" : "";

        const colorClass =
          color === "primary"
            ? "text-primary"
            : color === "secondary"
              ? "text-secondary"
              : color === "muted"
                ? "text-muted-foreground"
                : color === "black"
                  ? "text-black"
                  : color === "white"
                    ? "text-white"
                    : color === "gray-600"
                      ? "text-gray-600"
                      : color === "red-600"
                        ? "text-red-600"
                        : color === "blue-600"
                          ? "text-blue-600"
                          : color === "green-600"
                            ? "text-green-600"
                            : color === "purple-600"
                              ? "text-purple-600"
                              : color === "indigo-600"
                                ? "text-indigo-600"
                                : "";

        const sizeClass =
          size === "sm"
            ? "text-sm"
            : size === "lg"
              ? "text-lg"
              : size === "xl"
                ? "text-xl"
                : "text-base";

        const weightClass =
          weight === "medium"
            ? "font-medium"
            : weight === "semibold"
              ? "font-semibold"
              : weight === "bold"
                ? "font-bold"
                : "font-normal";

        const underlineClass =
          underline === "always"
            ? "underline"
            : underline === "hover"
              ? "hover:underline"
              : "";

        const decorationClass =
          decoration === "underline"
            ? "underline"
            : decoration === "overline"
              ? "overline"
              : decoration === "line-through"
                ? "line-through"
                : "";

        const hoverEffectClass =
          hoverEffect === "fade"
            ? "hover:opacity-70 transition-opacity"
            : hoverEffect === "brighten"
              ? "hover:brightness-110 transition-all"
              : hoverEffect === "scale"
                ? "hover:scale-105 transition-transform"
                : hoverEffect === "slide"
                  ? "hover:translate-x-1 transition-transform"
                  : "transition-colors";

        const content = (
          <>
            {iconElement && iconPosition === "left" && (
              <span className="mr-1">{iconElement}</span>
            )}
            {text}
            {iconElement && iconPosition === "right" && (
              <span className="ml-1">{iconElement}</span>
            )}
          </>
        );

        return (
          <a
            href={href}
            target={target}
            className={`inline-flex items-center ${colorClass} ${sizeClass} ${weightClass} ${underlineClass} ${decorationClass} ${hoverEffectClass}`.trim()}
          >
            {content}
          </a>
        );
      },
    },

    ListElement: {
      defaultProps: {
        items: ["Item 1", "Item 2", "Item 3"],
        type: "unordered",
        style: "disc",
        spacing: "normal",
        color: "default",
        size: "base",
        weight: "normal",
        indent: "normal",
        backgroundColor: "transparent",
        borderRadius: "none",
        padding: "none",
        margin: "none",
      },
      fields: {
        items: {
          type: "array",
          label: "List Items",
          getItemSummary: (item: string) => item,
        },
        type: {
          type: "select",
          label: "List Type",
          options: [
            { label: "Unordered", value: "unordered" },
            { label: "Ordered", value: "ordered" },
          ],
        },
        style: {
          type: "select",
          label: "Marker Style",
          options: [
            { label: "Disc", value: "disc" },
            { label: "Circle", value: "circle" },
            { label: "Square", value: "square" },
            { label: "Decimal", value: "decimal" },
            { label: "Lower Alpha", value: "lower-alpha" },
            { label: "Upper Alpha", value: "upper-alpha" },
            { label: "Lower Roman", value: "lower-roman" },
            { label: "Upper Roman", value: "upper-roman" },
            { label: "None", value: "none" },
          ],
        },
        spacing: {
          type: "select",
          label: "Item Spacing",
          options: [
            { label: "Tight", value: "tight" },
            { label: "Normal", value: "normal" },
            { label: "Loose", value: "loose" },
            { label: "Extra Loose", value: "extra-loose" },
          ],
        },
        color: {
          type: "select",
          label: "Text Color",
          options: [
            { label: "Default", value: "default" },
            { label: "Muted", value: "muted" },
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Black", value: "black" },
            { label: "Gray 600", value: "gray-600" },
            { label: "Gray 700", value: "gray-700" },
            { label: "Blue 600", value: "blue-600" },
            { label: "Green 600", value: "green-600" },
            { label: "Red 600", value: "red-600" },
          ],
        },
        size: {
          type: "select",
          label: "Text Size",
          options: [
            { label: "Small", value: "sm" },
            { label: "Base", value: "base" },
            { label: "Large", value: "lg" },
            { label: "Extra Large", value: "xl" },
          ],
        },
        weight: {
          type: "select",
          label: "Font Weight",
          options: [
            { label: "Normal", value: "normal" },
            { label: "Medium", value: "medium" },
            { label: "Semibold", value: "semibold" },
            { label: "Bold", value: "bold" },
          ],
        },
        indent: {
          type: "select",
          label: "Indentation",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "small" },
            { label: "Normal", value: "normal" },
            { label: "Large", value: "large" },
          ],
        },
        backgroundColor: {
          type: "select",
          label: "Background Color",
          options: [
            { label: "Transparent", value: "transparent" },
            { label: "Muted", value: "muted" },
            { label: "Background", value: "background" },
            { label: "Gray 50", value: "gray-50" },
            { label: "Gray 100", value: "gray-100" },
            { label: "Blue 50", value: "blue-50" },
            { label: "Green 50", value: "green-50" },
            { label: "Yellow 50", value: "yellow-50" },
          ],
        },
        borderRadius: {
          type: "select",
          label: "Border Radius",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        padding: {
          type: "select",
          label: "Padding",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        margin: {
          type: "select",
          label: "Margin",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
      },
      render: ({
        items,
        type,
        style,
        spacing,
        color,
        size,
        weight,
        indent,
        backgroundColor,
        borderRadius,
        padding,
        margin,
      }: any) => {
        const spacingClass =
          spacing === "tight"
            ? "space-y-1"
            : spacing === "loose"
              ? "space-y-3"
              : spacing === "extra-loose"
                ? "space-y-4"
                : "space-y-2";

        const colorClass =
          color === "muted"
            ? "text-muted-foreground"
            : color === "primary"
              ? "text-primary"
              : color === "secondary"
                ? "text-secondary"
                : color === "black"
                  ? "text-black"
                  : color === "gray-600"
                    ? "text-gray-600"
                    : color === "gray-700"
                      ? "text-gray-700"
                      : color === "blue-600"
                        ? "text-blue-600"
                        : color === "green-600"
                          ? "text-green-600"
                          : color === "red-600"
                            ? "text-red-600"
                            : "";

        const sizeClass =
          size === "sm"
            ? "text-sm"
            : size === "lg"
              ? "text-lg"
              : size === "xl"
                ? "text-xl"
                : "text-base";

        const weightClass =
          weight === "medium"
            ? "font-medium"
            : weight === "semibold"
              ? "font-semibold"
              : weight === "bold"
                ? "font-bold"
                : "font-normal";

        const indentClass =
          indent === "none"
            ? "list-none"
            : indent === "small"
              ? "ml-4"
              : indent === "large"
                ? "ml-8"
                : "ml-6";

        const backgroundClass =
          backgroundColor === "muted"
            ? "bg-muted"
            : backgroundColor === "background"
              ? "bg-background"
              : backgroundColor === "gray-50"
                ? "bg-gray-50"
                : backgroundColor === "gray-100"
                  ? "bg-gray-100"
                  : backgroundColor === "blue-50"
                    ? "bg-blue-50"
                    : backgroundColor === "green-50"
                      ? "bg-green-50"
                      : backgroundColor === "yellow-50"
                        ? "bg-yellow-50"
                        : "";

        const borderRadiusClass =
          borderRadius === "sm"
            ? "rounded-sm"
            : borderRadius === "md"
              ? "rounded-md"
              : borderRadius === "lg"
                ? "rounded-lg"
                : "";

        const paddingClass =
          padding === "sm"
            ? "p-2"
            : padding === "md"
              ? "p-4"
              : padding === "lg"
                ? "p-6"
                : "";

        const marginClass =
          margin === "sm"
            ? "m-2"
            : margin === "md"
              ? "m-4"
              : margin === "lg"
                ? "m-6"
                : "";

        const listStyleClass = style === "none" ? "list-none" : `list-${style}`;
        const listPositionClass = style === "none" ? "" : "list-inside";

        const containerClasses = [
          backgroundClass,
          borderRadiusClass,
          paddingClass,
          marginClass,
        ]
          .filter(Boolean)
          .join(" ");

        const listClasses = [
          listStyleClass,
          listPositionClass,
          spacingClass,
          colorClass,
          sizeClass,
          weightClass,
          indentClass,
        ]
          .filter(Boolean)
          .join(" ");

        const ListTag = type === "ordered" ? "ol" : "ul";

        const content = (
          <ListTag className={listClasses}>
            {items.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ListTag>
        );

        return containerClasses ? (
          <div className={containerClasses}>{content}</div>
        ) : (
          content
        );
      },
    },

    // COMPOSITE COMPONENTS - Built from core elements

    // Portfolio Template Components
    PortfolioHeader: {
      defaultProps: {
        name: "John Doe",
        showNavigation: true,
      },
      fields: {
        name: { type: "text", label: "Name" },
        showNavigation: {
          type: "select",
          label: "Show Navigation",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      render: ({ name, showNavigation }: any) => (
        <header className="border-b sticky top-0 bg-background/95 backdrop-blur">
          <div className="container max-w-5xl mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <div className="font-bold text-xl">{name}</div>
              {showNavigation && (
                <div className="hidden md:flex space-x-6">
                  <a
                    href="#about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </a>
                  <a
                    href="#projects"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Projects
                  </a>
                  <a
                    href="#contact"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </a>
                </div>
              )}
            </nav>
          </div>
        </header>
      ),
    },

    PortfolioHero: {
      defaultProps: {
        name: "John Doe",
        title: "Full Stack Developer",
        bio: "I'm a passionate developer who loves creating amazing digital experiences. With 5+ years of experience in web development.",
        profileImage:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        resumeUrl: "#",
        emailAddress: "john@example.com",
        showButtons: true,
      },
      fields: {
        name: { type: "text", label: "Your Name" },
        title: { type: "text", label: "Professional Title" },
        bio: { type: "textarea", label: "Bio" },
        profileImage: { type: "text", label: "Profile Image URL" },
        resumeUrl: { type: "text", label: "Resume URL" },
        emailAddress: { type: "text", label: "Email Address" },
        showButtons: {
          type: "select",
          label: "Show Action Buttons",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      render: ({
        name,
        title,
        bio,
        profileImage,
        resumeUrl,
        emailAddress,
        showButtons,
      }: any) => (
        <section id="about" className="py-20">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Hi, I'm {name}
                </h1>
                <p className="text-2xl text-primary mb-6">{title}</p>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  {bio}
                </p>
                {showButtons && (
                  <div className="flex gap-4">
                    <Button asChild>
                      <a href={resumeUrl}>Download Resume</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={`mailto:${emailAddress}`}>Contact Me</a>
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-80 h-80 rounded-full overflow-hidden border-4 border-primary/20">
                    <img
                      src={profileImage}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ),
    },

    SkillsSection: {
      defaultProps: {
        title: "Skills & Technologies",
        skillGroups: [
          {
            category: "Frontend",
            skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
          },
          {
            category: "Backend",
            skills: ["Node.js", "Python", "PostgreSQL", "MongoDB"],
          },
          {
            category: "Tools",
            skills: ["Git", "Docker", "AWS", "Figma"],
          },
        ],
        backgroundColor: "muted",
      },
      fields: {
        title: { type: "text", label: "Section Title" },
        skillGroups: {
          type: "array",
          label: "Skill Groups",
          getItemSummary: (item: any) => item.category || "Skill Group",
          arrayFields: {
            category: { type: "text", label: "Category Name" },
            skills: {
              type: "array",
              label: "Skills",
              getItemSummary: (skill: string) => skill,
            },
          },
        },
        backgroundColor: {
          type: "select",
          label: "Background",
          options: [
            { label: "None", value: "none" },
            { label: "Muted", value: "muted" },
            { label: "Gray 50", value: "gray-50" },
          ],
        },
      },
      render: ({ title, skillGroups, backgroundColor }: any) => (
        <section
          className={`py-16 ${backgroundColor === "muted" ? "bg-muted/30" : backgroundColor === "gray-50" ? "bg-gray-50" : ""}`}
        >
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {skillGroups.map((skillGroup: any, i: number) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>{skillGroup.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.skills.map((skill: string, j: number) => (
                        <Badge key={j} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ),
    },

    Card: {
      defaultProps: {
        title: "Card Name",
        description: "A brief description of the card",
        image: "",
        technologies: ["React", "TypeScript"],
        codeUrl: "#",
        demoUrl: "#",
        showTechnologies: true,
        showButtons: true,
      },
      fields: {
        title: { type: "text", label: "Card Title" },
        description: { type: "textarea", label: "Description" },
        image: { type: "text", label: "Card Image URL" },
        technologies: {
          type: "array",
          label: "Technologies",
          getItemSummary: (item: string) => item,
        },
        codeUrl: { type: "text", label: "Code URL" },
        demoUrl: { type: "text", label: "Demo URL" },
        showTechnologies: {
          type: "select",
          label: "Show Technologies",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        showButtons: {
          type: "select",
          label: "Show Action Buttons",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      render: ({
        title,
        description,
        image,
        technologies,
        codeUrl,
        demoUrl,
        showTechnologies,
        showButtons,
      }: any) => (
        <Card className="group hover:shadow-lg transition-all">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">💼</span>
            )}
          </div>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{description}</p>
            {showTechnologies && technologies.length > 0 && (
              <div className="flex gap-2 mb-4">
                {technologies.map((tech: string, i: number) => (
                  <Badge key={i} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
            {showButtons && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={codeUrl}>View Code</a>
                </Button>
                <Button size="sm" asChild>
                  <a href={demoUrl}>Live Demo</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },

    Grid: {
      label: "Grid Section",
      defaultProps: {
        title: "Featured Grid",
        columns: 2,
      },

      fields: {
        content: {
          type: "slot",
        },
        title: { type: "text", label: "Section Title" },

        columns: {
          type: "select",
          label: "Columns",
          options: [
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
          ],
        },
      },

      render: ({ content: Content, title, columns }: any) => (
        <section id="projects" className="py-16">
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>
            <Content
              className={`grid gap-8 ${columns === 1 ? "" : columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}
            />
          </div>
        </section>
      ),
    },

    PortfolioContact: {
      defaultProps: {
        title: "Let's Work Together",
        subtitle:
          "I'm always interested in new opportunities and exciting projects.",
        emailAddress: "john@example.com",
        linkedinUrl: "#",
        githubUrl: "#",
        backgroundColor: "muted",
      },
      fields: {
        title: { type: "text", label: "Section Title" },
        subtitle: { type: "textarea", label: "Subtitle" },
        emailAddress: { type: "text", label: "Email Address" },
        linkedinUrl: { type: "text", label: "LinkedIn URL" },
        githubUrl: { type: "text", label: "GitHub URL" },
        backgroundColor: {
          type: "select",
          label: "Background",
          options: [
            { label: "None", value: "none" },
            { label: "Muted", value: "muted" },
            { label: "Gray 50", value: "gray-50" },
          ],
        },
      },
      render: ({
        title,
        subtitle,
        emailAddress,
        linkedinUrl,
        githubUrl,
        backgroundColor,
      }: any) => (
        <section
          id="contact"
          className={`py-16 ${backgroundColor === "muted" ? "bg-muted/30" : backgroundColor === "gray-50" ? "bg-gray-50" : ""}`}
        >
          <div className="container max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">{title}</h2>
            <p className="text-muted-foreground text-lg mb-8">{subtitle}</p>
            <div className="flex justify-center gap-4 mb-8">
              <Button asChild>
                <a href={`mailto:${emailAddress}`}>📧 Email Me</a>
              </Button>
              <Button variant="outline" asChild>
                <a href={linkedinUrl}>💼 LinkedIn</a>
              </Button>
              <Button variant="outline" asChild>
                <a href={githubUrl}>🐙 GitHub</a>
              </Button>
            </div>
          </div>
        </section>
      ),
    },

    // Blog Template Components
    BlogHeader: {
      defaultProps: {
        siteName: "Blog",
        logoText: "📝 MyBlog",
        showNavigation: true,
      },
      fields: {
        siteName: { type: "text", label: "Site Name" },
        logoText: { type: "text", label: "Logo Text" },
        showNavigation: {
          type: "select",
          label: "Show Navigation",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      render: ({ siteName, logoText, showNavigation }: any) => (
        <header className="border-b">
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">{logoText}</div>
              {showNavigation && (
                <nav className="hidden md:flex space-x-6">
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Home
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Archive
                  </a>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </a>
                </nav>
              )}
            </div>
          </div>
        </header>
      ),
    },

    BlogHero: {
      defaultProps: {
        title: "Welcome to My Blog",
        subtitle: "Thoughts, stories and ideas from our team",
        maxWidth: "4xl",
      },
      fields: {
        title: { type: "text", label: "Hero Title" },
        subtitle: { type: "textarea", label: "Hero Subtitle" },
        maxWidth: {
          type: "select",
          label: "Max Width",
          options: [
            { label: "3XL", value: "3xl" },
            { label: "4XL", value: "4xl" },
            { label: "5XL", value: "5xl" },
            { label: "6XL", value: "6xl" },
          ],
        },
      },
      render: ({ title, subtitle, maxWidth }: any) => (
        <section className="py-20 text-center">
          <div className={`container max-w-${maxWidth} mx-auto px-4`}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
        </section>
      ),
    },

    BlogFeaturedPost: {
      defaultProps: {
        title: "Featured Post Title",
        excerpt:
          "This is the excerpt of our featured blog post that showcases the most important content...",
        image:
          "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
        buttonText: "Read More",
        showBadge: true,
        badgeText: "Featured",
      },
      fields: {
        title: { type: "text", label: "Post Title" },
        excerpt: { type: "textarea", label: "Post Excerpt" },
        image: { type: "text", label: "Post Image" },
        buttonText: { type: "text", label: "Button Text" },
        showBadge: {
          type: "select",
          label: "Show Featured Badge",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
        badgeText: { type: "text", label: "Badge Text" },
      },
      render: ({
        title,
        excerpt,
        image,
        buttonText,
        showBadge,
        badgeText,
      }: any) => (
        <section className="py-16">
          <div className="container max-w-6xl mx-auto px-4">
            {showBadge && (
              <div className="mb-8">
                <Badge variant="secondary">{badgeText}</Badge>
              </div>
            )}
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                <p className="text-muted-foreground text-lg mb-6">{excerpt}</p>
                <Button>{buttonText}</Button>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      ),
    },

    BlogPostGrid: {
      defaultProps: {
        title: "Recent Posts",
        postCount: 6,
        columns: 3,
        backgroundColor: "muted",
      },
      fields: {
        title: { type: "text", label: "Section Title" },
        postCount: {
          type: "select",
          label: "Number of Posts",
          options: [
            { label: "3", value: 3 },
            { label: "6", value: 6 },
            { label: "9", value: 9 },
            { label: "12", value: 12 },
          ],
        },
        columns: {
          type: "select",
          label: "Columns",
          options: [
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
          ],
        },
        backgroundColor: {
          type: "select",
          label: "Background",
          options: [
            { label: "None", value: "none" },
            { label: "Muted", value: "muted" },
            { label: "Gray 50", value: "gray-50" },
          ],
        },
      },
      render: ({ title, postCount, columns, backgroundColor }: any) => (
        <section
          className={`py-16 ${backgroundColor === "muted" ? "bg-muted/30" : backgroundColor === "gray-50" ? "bg-gray-50" : ""}`}
        >
          <div className="container max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>
            <div
              className={`grid gap-8 ${columns === 1 ? "" : columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}
            >
              {Array.from({ length: postCount }, (_, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted rounded-t-lg"></div>
                  <CardHeader>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline">Technology</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">
                      Blog Post Title {i + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      This is a sample excerpt for blog post {i + 1}. It gives
                      readers a preview of what to expect...
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>March {i + 1}, 2024</span>
                      <span>5 min read</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ),
    },

    BlogFooter: {
      defaultProps: {
        text: "© 2024 MyBlog. All rights reserved.",
        maxWidth: "6xl",
      },
      fields: {
        text: { type: "text", label: "Footer Text" },
        maxWidth: {
          type: "select",
          label: "Max Width",
          options: [
            { label: "4XL", value: "4xl" },
            { label: "5XL", value: "5xl" },
            { label: "6XL", value: "6xl" },
            { label: "7XL", value: "7xl" },
          ],
        },
      },
      render: ({ text, maxWidth }: any) => (
        <footer className="border-t py-12">
          <div
            className={`container max-w-${maxWidth} mx-auto px-4 text-center`}
          >
            <p className="text-muted-foreground">{text}</p>
          </div>
        </footer>
      ),
    },

    FeatureCard: {
      defaultProps: {
        icon: "🎯",
        title: "Feature Title",
        description:
          "Feature description goes here. Explain the benefits and value.",
        buttonText: "Learn More",
        buttonHref: "#",
        showButton: true,
      },
      fields: {
        icon: { type: "text", label: "Icon" },
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        buttonText: { type: "text", label: "Button Text" },
        buttonHref: { type: "text", label: "Button Link" },
        showButton: {
          type: "select",
          label: "Show Button",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      render: ({
        icon,
        title,
        description,
        buttonText,
        buttonHref,
        showButton,
      }: any) => (
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="text-3xl mb-2">{icon}</div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground leading-relaxed flex-grow">
              {description}
            </p>
            {showButton && (
              <div className="mt-auto">
                <Button variant="outline" className="w-full" asChild>
                  <a href={buttonHref}>{buttonText}</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },

    TestimonialCard: {
      defaultProps: {
        quote:
          "This product has completely transformed how we work. Highly recommended!",
        author: "Jane Smith",
        role: "CEO at Company",
        avatar: "👩‍💼",
        rating: 5,
      },
      fields: {
        quote: { type: "textarea", label: "Quote" },
        author: { type: "text", label: "Author Name" },
        role: { type: "text", label: "Author Role" },
        avatar: { type: "text", label: "Avatar" },
        rating: { type: "number", label: "Rating (1-5)", min: 1, max: 5 },
      },
      render: ({ quote, author, role, avatar, rating }: any) => (
        <Card className="h-full">
          <CardContent className="pt-6">
            <div className="flex mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={i < rating ? "text-yellow-500" : "text-gray-300"}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-muted-foreground mb-4 italic">"{quote}"</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{avatar}</span>
              <div>
                <p className="font-semibold">{author}</p>
                <p className="text-sm text-muted-foreground">{role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },

    PricingCard: {
      defaultProps: {
        title: "Basic",
        price: "$19",
        period: "per month",
        description: "Perfect for getting started",
        features: ["Feature 1", "Feature 2", "Feature 3"],
        buttonText: "Get Started",
        buttonHref: "#",
        popular: false,
      },
      fields: {
        title: { type: "text", label: "Plan Title" },
        price: { type: "text", label: "Price" },
        period: { type: "text", label: "Billing Period" },
        description: { type: "text", label: "Description" },
        features: {
          type: "array",
          label: "Features",
          getItemSummary: (item: string) => item,
        },
        buttonText: { type: "text", label: "Button Text" },
        buttonHref: { type: "text", label: "Button Link" },
        popular: {
          type: "select",
          label: "Popular Badge",
          options: [
            { label: "No", value: false },
            { label: "Yes", value: true },
          ],
        },
      },
      render: ({
        title,
        price,
        period,
        description,
        features,
        buttonText,
        buttonHref,
        popular,
      }: any) => (
        <Card
          className={`relative h-full ${popular ? "border-primary shadow-lg" : ""}`}
        >
          {popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                Most Popular
              </Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{price}</span>
              <span className="text-muted-foreground">{period}</span>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="space-y-3 flex-grow">
              {features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`w-full ${popular ? "" : "variant-outline"}`}
              variant={popular ? "default" : "outline"}
              asChild
            >
              <a href={buttonHref}>{buttonText}</a>
            </Button>
          </CardContent>
        </Card>
      ),
    },

    BlogPostCard: {
      defaultProps: {
        image:
          "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
        title: "Blog Post Title",
        excerpt:
          "This is a brief excerpt of the blog post that gives readers a preview of what to expect...",
        author: "John Doe",
        date: "March 15, 2024",
        readTime: "5 min read",
        href: "#",
        tags: ["Technology", "Web Development"],
      },
      fields: {
        image: { type: "text", label: "Featured Image URL" },
        title: { type: "text", label: "Post Title" },
        excerpt: { type: "textarea", label: "Excerpt" },
        author: { type: "text", label: "Author" },
        date: { type: "text", label: "Publish Date" },
        readTime: { type: "text", label: "Read Time" },
        href: { type: "text", label: "Post URL" },
        tags: {
          type: "array",
          label: "Tags",
          getItemSummary: (item: string) => item,
        },
      },
      render: ({
        image,
        title,
        excerpt,
        author,
        date,
        readTime,
        href,
        tags,
      }: any) => (
        <Card className="h-full hover:shadow-lg transition-shadow">
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="line-clamp-2">
              <a href={href} className="hover:text-primary transition-colors">
                {title}
              </a>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground line-clamp-3 flex-grow">
              {excerpt}
            </p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>By {author}</span>
              <span>
                {date} • {readTime}
              </span>
            </div>
          </CardContent>
        </Card>
      ),
    },

    ContactSection: {
      defaultProps: {
        title: "Get in Touch",
        subtitle:
          "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
        email: "hello@company.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street, City, State 12345",
        showForm: true,
      },
      fields: {
        title: { type: "text", label: "Section Title" },
        subtitle: { type: "textarea", label: "Subtitle" },
        email: { type: "text", label: "Email" },
        phone: { type: "text", label: "Phone" },
        address: { type: "text", label: "Address" },
        showForm: {
          type: "select",
          label: "Show Contact Form",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
      render: ({ title, subtitle, email, phone, address, showForm }: any) => (
        <section className="py-24 lg:py-32">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {subtitle}
              </p>
            </div>
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">{email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl">📞</div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-muted-foreground">{phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-muted-foreground">{address}</p>
                  </div>
                </div>
              </div>
              {showForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Send us a message</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <input
                          type="text"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <textarea
                        rows={4}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    </div>
                    <Button className="w-full">Send Message</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      ),
    },

    // LEGACY COMPONENTS - For backward compatibility (will be reorganized)
    HeadingBlock: {
      key: "HeadingBlock",
      defaultProps: {
        children: "Heading",
        level: "h1",
        align: "left",
        tone: "default",
      },

      fields: {
        children: { type: "text", label: "Text", defaultValue: "Heading" },
        level: {
          type: "select",
          label: "Level",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
          ],
          defaultValue: "h1",
        },
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
          defaultValue: "left",
        },
        tone: {
          type: "select",
          label: "Tone",
          options: [
            { label: "Default", value: "default" },
            { label: "Foreground", value: "fg" },
            { label: "Muted", value: "muted" },
            { label: "Primary", value: "primary" },
          ],
          defaultValue: "default",
        },
      },
      render: ({
        children,
        level,
        align,
        tone,
      }: {
        children: string;
        level: "h1" | "h2" | "h3";
        align: "left" | "center" | "right";
        tone: "default" | "fg" | "muted" | "primary";
      }) => {
        const className =
          align === "center"
            ? "text-center"
            : align === "right"
              ? "text-right"
              : "text-left";
        const color =
          tone === "fg"
            ? "text-foreground"
            : tone === "muted"
              ? "text-muted-foreground"
              : tone === "primary"
                ? "text-primary"
                : "";
        if (level === "h2")
          return (
            <h2 className={`${className} text-2xl font-bold ${color}`.trim()}>
              {children}
            </h2>
          );
        if (level === "h3")
          return (
            <h3 className={`${className} text-xl font-bold ${color}`.trim()}>
              {children}
            </h3>
          );
        return (
          <h1 className={`${className} text-3xl font-bold ${color}`.trim()}>
            {children}
          </h1>
        );
      },
    },

    ButtonBlock: {
      defaultProps: {
        label: "Click me",
        href: "#",
        variant: "default",
        size: "default",
        align: "left",
        fullWidth: false,
      },
      fields: {
        label: { type: "text", label: "Label", defaultValue: "Click me" },
        href: { type: "text", label: "Href", defaultValue: "#" },
        variant: {
          type: "select",
          label: "Variant",
          options: [
            { label: "Default", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
            { label: "Ghost", value: "ghost" },
            { label: "Link", value: "link" },
          ],
          defaultValue: "default",
        },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "Default", value: "default" },
            { label: "Small", value: "sm" },
            { label: "Large", value: "lg" },
            { label: "Icon", value: "icon" },
          ],
          defaultValue: "default",
        },
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
          defaultValue: "left",
        },
        fullWidth: {
          type: "select",
          label: "Full width",
          options: [
            { label: "False", value: false },
            { label: "True", value: true },
          ],
          defaultValue: false,
        },
      },
      render: ({
        label,
        href,
        variant,
        size,
        align,
        fullWidth,
      }: {
        label: string;
        href: string;
        variant: "default" | "secondary" | "outline" | "ghost" | "link";
        size: "default" | "sm" | "lg" | "icon";
        align: "left" | "center" | "right";
        fullWidth: boolean;
      }) => {
        const justify =
          align === "center"
            ? "justify-center"
            : align === "right"
              ? "justify-end"
              : "justify-start";
        return (
          <div className={`flex ${justify}`}>
            <a href={href} className={fullWidth ? "w-full" : undefined}>
              <Button
                variant={variant}
                size={size}
                className={fullWidth ? "w-full" : undefined}
              >
                {label}
              </Button>
            </a>
          </div>
        );
      },
    },

    CardBlock: {
      defaultProps: {
        title: "Card title",
        content: "Card content",
        shadow: "sm",
        padding: 16,
      },
      fields: {
        title: { type: "text", label: "Title", defaultValue: "Card title" },
        content: {
          type: "textarea",
          label: "Content",
          defaultValue: "Card content",
        },
        shadow: {
          type: "select",
          label: "Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "sm", value: "sm" },
            { label: "md", value: "md" },
            { label: "lg", value: "lg" },
          ],
          defaultValue: "sm",
        },
        padding: {
          type: "number",
          label: "Padding",
          defaultValue: 16,
          min: 0,
          max: 64,
          step: 4,
        },
      },
      render: ({
        title,
        content,
        shadow,
        padding,
      }: {
        title: string;
        content: string;
        shadow: "none" | "sm" | "md" | "lg";
        padding: number;
      }) => {
        const shadowClass =
          shadow === "none"
            ? ""
            : shadow === "sm"
              ? "shadow-sm"
              : shadow === "md"
                ? "shadow-md"
                : "shadow-lg";
        return (
          <Card className={shadowClass}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent style={{ padding }}>
              <p>{content}</p>
            </CardContent>
          </Card>
        );
      },
    },

    BadgeBlock: {
      defaultProps: {
        text: "Badge",
        variant: "default",
        tone: "default",
      },
      fields: {
        text: { type: "text", label: "Text", defaultValue: "Badge" },
        variant: {
          type: "select",
          label: "Variant",
          options: [
            { label: "Default", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
          ],
          defaultValue: "default",
        },
        tone: {
          type: "select",
          label: "Tone",
          options: [
            { label: "Default", value: "default" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
            { label: "Destructive", value: "destructive" },
          ],
          defaultValue: "default",
        },
      },
      render: ({
        text,
        variant,
        tone,
      }: {
        text: string;
        variant: "default" | "secondary" | "outline";
        tone: "default" | "secondary" | "outline" | "destructive";
      }) => <Badge variant={tone as any}>{text}</Badge>,
    },

    ParagraphBlock: {
      defaultProps: {
        text: "Lorem ipsum dolor sit amet.",
        size: "base",
        align: "left",
        muted: false,
      },
      fields: {
        text: {
          type: "textarea",
          label: "Text",
          defaultValue: "Lorem ipsum dolor sit amet.",
        },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "sm", value: "sm" },
            { label: "base", value: "base" },
            { label: "lg", value: "lg" },
          ],
          defaultValue: "base",
        },
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
          defaultValue: "left",
        },
        muted: {
          type: "select",
          label: "Muted",
          options: [
            { label: "False", value: false },
            { label: "True", value: true },
          ],
          defaultValue: false,
        },
      },
      render: ({
        text,
        size,
        align,
        muted,
      }: {
        text: string;
        size: "sm" | "base" | "lg";
        align: "left" | "center" | "right";
        muted: boolean;
      }) => {
        const sizeClass =
          size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";
        const alignClass =
          align === "center"
            ? "text-center"
            : align === "right"
              ? "text-right"
              : "text-left";
        const color = muted ? "text-muted-foreground" : "";
        return (
          <p className={`${sizeClass} ${alignClass} ${color}`.trim()}>{text}</p>
        );
      },
    },

    SeparatorBlock: {
      defaultProps: {
        decorative: false,
      },
      fields: {
        decorative: {
          type: "select",
          label: "Decorative",
          options: [
            { label: "False", value: false },
            { label: "True", value: true },
          ],
          defaultValue: false,
        },
      },
      render: ({ decorative }: { decorative: boolean }) => (
        <Separator decorative={decorative} />
      ),
    },

    AlertBlock: {
      defaultProps: {
        title: "Heads up!",
        description: "You can use this alert for contextual messaging.",
        variant: "default",
      },
      fields: {
        title: { type: "text", label: "Title", defaultValue: "Heads up!" },
        description: {
          type: "textarea",
          label: "Description",
          defaultValue: "You can use this alert for contextual messaging.",
        },
        variant: {
          type: "select",
          label: "Variant",
          options: [
            { label: "Default", value: "default" },
            { label: "Destructive", value: "destructive" },
          ],
          defaultValue: "default",
        },
      },
      render: ({
        title,
        description,
        variant,
      }: {
        title: string;
        description: string;
        variant: "default" | "destructive";
      }) => (
        <Alert variant={variant as any}>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      ),
    },

    HeroSection: {
      defaultProps: {
        eyebrow: "Introducing",
        title: "Build faster with Builddrr",
        subtitle:
          "Ship beautiful sites with a drag-and-drop editor and production-grade components.",
        primaryLabel: "Get started",
        primaryHref: "#",
        secondaryLabel: "Contact sales",
        secondaryHref: "#",
        align: "center",
        background: "default",
        kicker: "Trusted by 200+ teams",
        showKicker: true,
      },
      fields: {
        eyebrow: {
          type: "text",
          label: "Eyebrow",
          defaultValue: "Introducing",
        },
        title: {
          type: "text",
          label: "Title",
          defaultValue: "Build faster with Builddrr",
        },
        subtitle: {
          type: "textarea",
          label: "Subtitle",
          defaultValue:
            "Ship beautiful sites with a drag-and-drop editor and production-grade components.",
        },
        primaryLabel: {
          type: "text",
          label: "Primary CTA",
          defaultValue: "Get started",
        },
        primaryHref: { type: "text", label: "Primary Href", defaultValue: "#" },
        secondaryLabel: {
          type: "text",
          label: "Secondary CTA",
          defaultValue: "Contact sales",
        },
        secondaryHref: {
          type: "text",
          label: "Secondary Href",
          defaultValue: "#",
        },
        align: {
          type: "select",
          label: "Align",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
          ],
          defaultValue: "center",
        },
        background: {
          type: "select",
          label: "Background",
          options: [
            { label: "Default", value: "default" },
            { label: "Muted", value: "muted" },
            { label: "Gradient Blue/Purple", value: "grad-blue" },
            { label: "Gradient Emerald/Teal", value: "grad-emerald" },
          ],
          defaultValue: "default",
        },
        kicker: {
          type: "text",
          label: "Kicker",
          defaultValue: "Trusted by 200+ teams",
        },
        showKicker: {
          type: "select",
          label: "Show Kicker",
          options: [
            { label: "False", value: false },
            { label: "True", value: true },
          ],
          defaultValue: true,
        },
      },
      render: ({
        eyebrow,
        title,
        subtitle,
        primaryLabel,
        primaryHref,
        secondaryLabel,
        secondaryHref,
        align,
        background,
        kicker,
        showKicker,
      }: {
        eyebrow: string;
        title: string;
        subtitle: string;
        primaryLabel: string;
        primaryHref: string;
        secondaryLabel: string;
        secondaryHref: string;
        align: "left" | "center";
        background: "default" | "muted" | "grad-blue" | "grad-emerald";
        kicker: string;
        showKicker: boolean;
      }) => {
        const wrapper =
          background === "muted"
            ? "bg-muted"
            : background === "grad-blue"
              ? "bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-fuchsia-600/10"
              : background === "grad-emerald"
                ? "bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10"
                : "";
        const center =
          align === "center"
            ? "items-center text-center"
            : "items-start text-left";
        return (
          <section
            className={`${wrapper} relative overflow-hidden py-20 flex justify-center`}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
            </div>
            <div
              className={`relative container max-w-3xl flex flex-col gap-4 ${center}`}
            >
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                {subtitle}
              </p>
              {showKicker && (
                <div className="text-xs text-muted-foreground">{kicker}</div>
              )}
              <div
                className={`flex gap-3 ${align === "center" ? "justify-center" : "justify-start"}`}
              >
                <a href={primaryHref} className="[text-decoration:none]">
                  <Button
                    size="lg"
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    {primaryLabel}
                  </Button>
                </a>
                <a href={secondaryHref} className="[text-decoration:none]">
                  <Button
                    variant="outline"
                    size="lg"
                    className="hover:bg-muted"
                  >
                    {secondaryLabel}
                  </Button>
                </a>
              </div>
            </div>
          </section>
        );
      },
    },

    CtaSection: {
      defaultProps: {
        title: "Ready to launch?",
        subtitle: "Start building with our free plan today.",
        buttonLabel: "Create account",
        buttonHref: "#",
      },
      fields: {
        title: {
          type: "text",
          label: "Title",
          defaultValue: "Ready to launch?",
        },
        subtitle: {
          type: "textarea",
          label: "Subtitle",
          defaultValue: "Start building with our free plan today.",
        },
        buttonLabel: {
          type: "text",
          label: "Button Label",
          defaultValue: "Create account",
        },
        buttonHref: { type: "text", label: "Button Href", defaultValue: "#" },
      },
      render: ({
        title,
        subtitle,
        buttonLabel,
        buttonHref,
      }: {
        title: string;
        subtitle: string;
        buttonLabel: string;
        buttonHref: string;
      }) => (
        <section className="py-14 flex justify-center">
          <div className="container max-w-4xl flex justify-center">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 justify-center items-center">
                  <p className="text-muted-foreground">{subtitle}</p>
                  <a href={buttonHref} className="pt-2">
                    <Button size="lg">{buttonLabel}</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      ),
    },

    TemplateStartup: {
      defaultProps: {
        // Company & Branding
        company: "Builddrr",
        logo: "🚀",

        // Navigation
        navLink1: "Features",
        navLink2: "Pricing",
        navLink3: "About",
        navLink4: "Contact",

        // Hero Section
        heroTitle: "Build your startup site in minutes",
        heroSubtitle:
          "Beautiful sections, fast editing, and production-ready deployment — all in one place.",
        ctaPrimary: "Get started",
        ctaSecondary: "Contact sales",
        heroImage: "🎯",

        // Features Section
        featuresTitle: "Everything you need to grow",
        featuresSubtitle:
          "Powerful features to help you build and scale your SaaS business",
        feature1Title: "Drag & Drop Builder",
        feature1Description:
          "Create beautiful pages with our intuitive drag-and-drop interface",
        feature1Icon: "🎨",
        feature2Title: "Lightning Fast",
        feature2Description: "Optimized for speed with modern web technologies",
        feature2Icon: "⚡",
        feature3Title: "Fully Responsive",
        feature3Description:
          "Your site will look perfect on all devices and screen sizes",
        feature3Icon: "📱",
        feature4Title: "SEO Optimized",
        feature4Description:
          "Built-in SEO best practices to help you rank higher",
        feature4Icon: "🔍",
        feature5Title: "Analytics Ready",
        feature5Description:
          "Track your performance with built-in analytics support",
        feature5Icon: "📊",
        feature6Title: "24/7 Support",
        feature6Description:
          "Get help whenever you need it from our expert team",
        feature6Icon: "🛟",

        // Pricing Section
        pricingTitle: "Simple, transparent pricing",
        pricingSubtitle: "Choose the perfect plan for your business needs",

        // Starter Plan
        starterTitle: "Starter",
        starterPrice: "$9",
        starterPeriod: "per month",
        starterDescription: "Perfect for small teams and startups",
        starterFeature1: "Up to 5 projects",
        starterFeature2: "10GB storage",
        starterFeature3: "Email support",
        starterFeature4: "Basic analytics",
        starterButton: "Get Started",

        // Pro Plan
        proTitle: "Pro",
        proPrice: "$29",
        proPeriod: "per month",
        proDescription: "Best for growing businesses",
        proFeature1: "Unlimited projects",
        proFeature2: "100GB storage",
        proFeature3: "Priority support",
        proFeature4: "Advanced analytics",
        proFeature5: "Custom domain",
        proFeature6: "Team collaboration",
        proButton: "Get Started",
        proPopular: true,

        // Enterprise Plan
        enterpriseTitle: "Enterprise",
        enterprisePrice: "$99",
        enterprisePeriod: "per month",
        enterpriseDescription: "For large organizations",
        enterpriseFeature1: "Everything in Pro",
        enterpriseFeature2: "Unlimited storage",
        enterpriseFeature3: "24/7 phone support",
        enterpriseFeature4: "Custom integrations",
        enterpriseFeature5: "SLA guarantee",
        enterpriseFeature6: "Dedicated manager",
        enterpriseButton: "Contact Sales",

        // Testimonials Section
        testimonialsTitle: "Loved by thousands of customers",
        testimonialsSubtitle: "See what our customers have to say about us",
        testimonial1Quote:
          "This platform has completely transformed how we build and deploy our websites. The speed and ease of use is incredible!",
        testimonial1Author: "Sarah Chen",
        testimonial1Role: "CTO at TechCorp",
        testimonial1Avatar: "👩‍💼",
        testimonial2Quote:
          "Finally, a tool that makes web development accessible to our entire team. The drag-and-drop interface is intuitive and powerful.",
        testimonial2Author: "Mike Rodriguez",
        testimonial2Role: "Product Manager at StartupXYZ",
        testimonial2Avatar: "👨‍💻",
        testimonial3Quote:
          "We've saved countless hours and significantly reduced our development costs. Highly recommend to any growing business.",
        testimonial3Author: "Emma Thompson",
        testimonial3Role: "Founder at InnovateCo",
        testimonial3Avatar: "👩‍🚀",

        // FAQ Section
        faqTitle: "Frequently asked questions",
        faqSubtitle: "Everything you need to know about our platform",
        faq1Question: "How quickly can I get started?",
        faq1Answer:
          "You can be up and running in minutes! Simply sign up, choose a template, and start customizing.",
        faq2Question: "Do I need coding experience?",
        faq2Answer:
          "Not at all! Our drag-and-drop interface is designed for users of all skill levels.",
        faq3Question: "Can I use my own domain?",
        faq3Answer:
          "Yes, you can connect your custom domain with any paid plan.",
        faq4Question: "Is there a free trial?",
        faq4Answer:
          "Yes, we offer a 14-day free trial with full access to all features.",
        faq5Question: "Can I cancel anytime?",
        faq5Answer:
          "Absolutely! You can cancel your subscription at any time with no penalties.",
        faq6Question: "Do you offer refunds?",
        faq6Answer:
          "Yes, we offer a 30-day money-back guarantee if you're not satisfied.",

        // Footer CTA
        footerCtaTitle: "Ready to get started?",
        footerCtaSubtitle:
          "Join thousands of businesses already using our platform",
        footerCtaButton: "Start Free Trial",

        // Footer
        footerCompanyDescription:
          "Building the future of web development with powerful, easy-to-use tools.",
        footerSocialTwitter: "https://twitter.com",
        footerSocialLinkedin: "https://linkedin.com",
        footerSocialGithub: "https://github.com",
        footerEmailContact: "hello@builddrr.com",
        footerPhoneContact: "+1 (555) 123-4567",
      },
      fields: {
        company: { type: "text", label: "Company", defaultValue: "Builddrr" },
        heroTitle: {
          type: "text",
          label: "Hero title",
          defaultValue: "Build your startup site in minutes",
        },
        heroSubtitle: {
          type: "textarea",
          label: "Hero subtitle",
          defaultValue:
            "Beautiful sections, fast editing, and production-ready deployment — all in one place.",
        },
        ctaPrimary: {
          type: "text",
          label: "Primary CTA",
          defaultValue: "Get started",
        },
        ctaSecondary: {
          type: "text",
          label: "Secondary CTA",
          defaultValue: "Contact sales",
        },
        featuresTitle1: {
          type: "text",
          label: "Feature 1",
          defaultValue: "Drag & Drop",
        },
        featuresTitle2: {
          type: "text",
          label: "Feature 2",
          defaultValue: "shadcn/ui",
        },
        featuresTitle3: {
          type: "text",
          label: "Feature 3",
          defaultValue: "Fast Deploys",
        },
        footerCtaTitle: {
          type: "text",
          label: "Footer CTA title",
          defaultValue: "Join hundreds of teams",
        },
        footerCtaSubtitle: {
          type: "text",
          label: "Footer CTA subtitle",
          defaultValue: "Start free. Upgrade anytime.",
        },
        footerCtaButton: {
          type: "text",
          label: "Footer CTA button",
          defaultValue: "Create account",
        },

        // Add simplified fields for all new props - users can customize via the UI
        logo: { type: "text", label: "Logo", defaultValue: "🚀" },
        navLink1: {
          type: "text",
          label: "Nav Link 1",
          defaultValue: "Features",
        },
        navLink2: {
          type: "text",
          label: "Nav Link 2",
          defaultValue: "Pricing",
        },
        navLink3: { type: "text", label: "Nav Link 3", defaultValue: "About" },
        navLink4: {
          type: "text",
          label: "Nav Link 4",
          defaultValue: "Contact",
        },
        heroImage: { type: "text", label: "Hero Image", defaultValue: "🎯" },
        featuresTitle: {
          type: "text",
          label: "Features Title",
          defaultValue: "Everything you need to grow",
        },
        featuresSubtitle: {
          type: "text",
          label: "Features Subtitle",
          defaultValue:
            "Powerful features to help you build and scale your SaaS business",
        },
        feature1Title: {
          type: "text",
          label: "Feature 1 Title",
          defaultValue: "Drag & Drop Builder",
        },
        feature1Description: {
          type: "textarea",
          label: "Feature 1 Description",
          defaultValue:
            "Create beautiful pages with our intuitive drag-and-drop interface",
        },
        feature1Icon: {
          type: "text",
          label: "Feature 1 Icon",
          defaultValue: "🎨",
        },

        // Feature 2-6 fields
        feature2Title: {
          type: "text",
          label: "Feature 2 Title",
          defaultValue: "Lightning Fast",
        },
        feature2Description: {
          type: "textarea",
          label: "Feature 2 Description",
          defaultValue: "Optimized for speed with modern web technologies",
        },
        feature2Icon: {
          type: "text",
          label: "Feature 2 Icon",
          defaultValue: "⚡",
        },
        feature3Title: {
          type: "text",
          label: "Feature 3 Title",
          defaultValue: "Fully Responsive",
        },
        feature3Description: {
          type: "textarea",
          label: "Feature 3 Description",
          defaultValue:
            "Your site will look perfect on all devices and screen sizes",
        },
        feature3Icon: {
          type: "text",
          label: "Feature 3 Icon",
          defaultValue: "📱",
        },
        feature4Title: {
          type: "text",
          label: "Feature 4 Title",
          defaultValue: "SEO Optimized",
        },
        feature4Description: {
          type: "textarea",
          label: "Feature 4 Description",
          defaultValue: "Built-in SEO best practices to help you rank higher",
        },
        feature4Icon: {
          type: "text",
          label: "Feature 4 Icon",
          defaultValue: "🔍",
        },
        feature5Title: {
          type: "text",
          label: "Feature 5 Title",
          defaultValue: "Analytics Ready",
        },
        feature5Description: {
          type: "textarea",
          label: "Feature 5 Description",
          defaultValue:
            "Track your performance with built-in analytics support",
        },
        feature5Icon: {
          type: "text",
          label: "Feature 5 Icon",
          defaultValue: "📊",
        },
        feature6Title: {
          type: "text",
          label: "Feature 6 Title",
          defaultValue: "24/7 Support",
        },
        feature6Description: {
          type: "textarea",
          label: "Feature 6 Description",
          defaultValue: "Get help whenever you need it from our expert team",
        },
        feature6Icon: {
          type: "text",
          label: "Feature 6 Icon",
          defaultValue: "🛟",
        },
        pricingTitle: {
          type: "text",
          label: "Pricing Title",
          defaultValue: "Simple, transparent pricing",
        },
        pricingSubtitle: {
          type: "text",
          label: "Pricing Subtitle",
          defaultValue: "Choose the perfect plan for your business needs",
        },
        starterTitle: {
          type: "text",
          label: "Starter Title",
          defaultValue: "Starter",
        },
        starterPrice: {
          type: "text",
          label: "Starter Price",
          defaultValue: "$9",
        },
        proTitle: { type: "text", label: "Pro Title", defaultValue: "Pro" },
        proPrice: { type: "text", label: "Pro Price", defaultValue: "$29" },
        proPopular: {
          type: "select",
          label: "Pro Popular",
          options: [
            { label: "False", value: false },
            { label: "True", value: true },
          ],
          defaultValue: true,
        },

        // Detailed pricing fields
        starterPeriod: {
          type: "text",
          label: "Starter Period",
          defaultValue: "per month",
        },
        starterDescription: {
          type: "text",
          label: "Starter Description",
          defaultValue: "Perfect for small teams and startups",
        },
        starterFeature1: {
          type: "text",
          label: "Starter Feature 1",
          defaultValue: "Up to 5 projects",
        },
        starterFeature2: {
          type: "text",
          label: "Starter Feature 2",
          defaultValue: "10GB storage",
        },
        starterFeature3: {
          type: "text",
          label: "Starter Feature 3",
          defaultValue: "Email support",
        },
        starterFeature4: {
          type: "text",
          label: "Starter Feature 4",
          defaultValue: "Basic analytics",
        },
        starterButton: {
          type: "text",
          label: "Starter Button",
          defaultValue: "Get Started",
        },

        proPeriod: {
          type: "text",
          label: "Pro Period",
          defaultValue: "per month",
        },
        proDescription: {
          type: "text",
          label: "Pro Description",
          defaultValue: "Best for growing businesses",
        },
        proFeature1: {
          type: "text",
          label: "Pro Feature 1",
          defaultValue: "Unlimited projects",
        },
        proFeature2: {
          type: "text",
          label: "Pro Feature 2",
          defaultValue: "100GB storage",
        },
        proFeature3: {
          type: "text",
          label: "Pro Feature 3",
          defaultValue: "Priority support",
        },
        proFeature4: {
          type: "text",
          label: "Pro Feature 4",
          defaultValue: "Advanced analytics",
        },
        proFeature5: {
          type: "text",
          label: "Pro Feature 5",
          defaultValue: "Custom domain",
        },
        proFeature6: {
          type: "text",
          label: "Pro Feature 6",
          defaultValue: "Team collaboration",
        },
        proButton: {
          type: "text",
          label: "Pro Button",
          defaultValue: "Get Started",
        },

        enterpriseTitle: {
          type: "text",
          label: "Enterprise Title",
          defaultValue: "Enterprise",
        },
        enterprisePrice: {
          type: "text",
          label: "Enterprise Price",
          defaultValue: "$99",
        },
        enterprisePeriod: {
          type: "text",
          label: "Enterprise Period",
          defaultValue: "per month",
        },
        enterpriseDescription: {
          type: "text",
          label: "Enterprise Description",
          defaultValue: "For large organizations",
        },
        enterpriseFeature1: {
          type: "text",
          label: "Enterprise Feature 1",
          defaultValue: "Everything in Pro",
        },
        enterpriseFeature2: {
          type: "text",
          label: "Enterprise Feature 2",
          defaultValue: "Unlimited storage",
        },
        enterpriseFeature3: {
          type: "text",
          label: "Enterprise Feature 3",
          defaultValue: "24/7 phone support",
        },
        enterpriseFeature4: {
          type: "text",
          label: "Enterprise Feature 4",
          defaultValue: "Custom integrations",
        },
        enterpriseFeature5: {
          type: "text",
          label: "Enterprise Feature 5",
          defaultValue: "SLA guarantee",
        },
        enterpriseFeature6: {
          type: "text",
          label: "Enterprise Feature 6",
          defaultValue: "Dedicated manager",
        },
        enterpriseButton: {
          type: "text",
          label: "Enterprise Button",
          defaultValue: "Contact Sales",
        },
        testimonialsTitle: {
          type: "text",
          label: "Testimonials Title",
          defaultValue: "Loved by thousands of customers",
        },
        testimonial1Quote: {
          type: "textarea",
          label: "Testimonial 1",
          defaultValue:
            "This platform has completely transformed how we build and deploy our websites.",
        },
        testimonial1Author: {
          type: "text",
          label: "Testimonial 1 Author",
          defaultValue: "Sarah Chen",
        },
        faqTitle: {
          type: "text",
          label: "FAQ Title",
          defaultValue: "Frequently asked questions",
        },
        faq1Question: {
          type: "text",
          label: "FAQ 1 Question",
          defaultValue: "How quickly can I get started?",
        },
        faq1Answer: {
          type: "textarea",
          label: "FAQ 1 Answer",
          defaultValue: "You can be up and running in minutes!",
        },

        // Complete testimonials fields
        testimonialsSubtitle: {
          type: "text",
          label: "Testimonials Subtitle",
          defaultValue: "See what our customers have to say about us",
        },
        testimonial1Role: {
          type: "text",
          label: "Testimonial 1 Role",
          defaultValue: "CTO at TechCorp",
        },
        testimonial1Avatar: {
          type: "text",
          label: "Testimonial 1 Avatar",
          defaultValue: "👩‍💼",
        },
        testimonial2Quote: {
          type: "textarea",
          label: "Testimonial 2 Quote",
          defaultValue:
            "Finally, a tool that makes web development accessible to our entire team. The drag-and-drop interface is intuitive and powerful.",
        },
        testimonial2Author: {
          type: "text",
          label: "Testimonial 2 Author",
          defaultValue: "Mike Rodriguez",
        },
        testimonial2Role: {
          type: "text",
          label: "Testimonial 2 Role",
          defaultValue: "Product Manager at StartupXYZ",
        },
        testimonial2Avatar: {
          type: "text",
          label: "Testimonial 2 Avatar",
          defaultValue: "👨‍💻",
        },
        testimonial3Quote: {
          type: "textarea",
          label: "Testimonial 3 Quote",
          defaultValue:
            "We've saved countless hours and significantly reduced our development costs. Highly recommend to any growing business.",
        },
        testimonial3Author: {
          type: "text",
          label: "Testimonial 3 Author",
          defaultValue: "Emma Thompson",
        },
        testimonial3Role: {
          type: "text",
          label: "Testimonial 3 Role",
          defaultValue: "Founder at InnovateCo",
        },
        testimonial3Avatar: {
          type: "text",
          label: "Testimonial 3 Avatar",
          defaultValue: "👩‍🚀",
        },

        // Complete FAQ fields
        faqSubtitle: {
          type: "text",
          label: "FAQ Subtitle",
          defaultValue: "Everything you need to know about our platform",
        },
        faq2Question: {
          type: "text",
          label: "FAQ 2 Question",
          defaultValue: "Do I need coding experience?",
        },
        faq2Answer: {
          type: "textarea",
          label: "FAQ 2 Answer",
          defaultValue:
            "Not at all! Our drag-and-drop interface is designed for users of all skill levels.",
        },
        faq3Question: {
          type: "text",
          label: "FAQ 3 Question",
          defaultValue: "Can I use my own domain?",
        },
        faq3Answer: {
          type: "textarea",
          label: "FAQ 3 Answer",
          defaultValue:
            "Yes, you can connect your custom domain with any paid plan.",
        },
        faq4Question: {
          type: "text",
          label: "FAQ 4 Question",
          defaultValue: "Is there a free trial?",
        },
        faq4Answer: {
          type: "textarea",
          label: "FAQ 4 Answer",
          defaultValue:
            "Yes, we offer a 14-day free trial with full access to all features.",
        },
        faq5Question: {
          type: "text",
          label: "FAQ 5 Question",
          defaultValue: "Can I cancel anytime?",
        },
        faq5Answer: {
          type: "textarea",
          label: "FAQ 5 Answer",
          defaultValue:
            "Absolutely! You can cancel your subscription at any time with no penalties.",
        },
        faq6Question: {
          type: "text",
          label: "FAQ 6 Question",
          defaultValue: "Do you offer refunds?",
        },
        faq6Answer: {
          type: "textarea",
          label: "FAQ 6 Answer",
          defaultValue:
            "Yes, we offer a 30-day money-back guarantee if you're not satisfied.",
        },

        // Footer fields
        footerCompanyDescription: {
          type: "textarea",
          label: "Footer Company Description",
          defaultValue:
            "Building the future of web development with powerful, easy-to-use tools.",
        },
        footerSocialTwitter: {
          type: "text",
          label: "Twitter URL",
          defaultValue: "https://twitter.com",
        },
        footerSocialLinkedin: {
          type: "text",
          label: "LinkedIn URL",
          defaultValue: "https://linkedin.com",
        },
        footerSocialGithub: {
          type: "text",
          label: "GitHub URL",
          defaultValue: "https://github.com",
        },
        footerEmailContact: {
          type: "text",
          label: "Contact Email",
          defaultValue: "hello@builddrr.com",
        },
        footerPhoneContact: {
          type: "text",
          label: "Contact Phone",
          defaultValue: "+1 (555) 123-4567",
        },
      },
      render: (props: any) => {
        const {
          // Company & Branding
          company,
          logo,

          // Navigation
          navLink1,
          navLink2,
          navLink3,
          navLink4,

          // Hero Section
          heroTitle,
          heroSubtitle,
          ctaPrimary,
          ctaSecondary,
          heroImage,

          // Features Section
          featuresTitle,
          featuresSubtitle,
          feature1Title,
          feature1Description,
          feature1Icon,
          feature2Title,
          feature2Description,
          feature2Icon,
          feature3Title,
          feature3Description,
          feature3Icon,
          feature4Title,
          feature4Description,
          feature4Icon,
          feature5Title,
          feature5Description,
          feature5Icon,
          feature6Title,
          feature6Description,
          feature6Icon,

          // Pricing Section
          pricingTitle,
          pricingSubtitle,
          starterTitle,
          starterPrice,
          starterPeriod,
          starterDescription,
          starterFeature1,
          starterFeature2,
          starterFeature3,
          starterFeature4,
          starterButton,
          proTitle,
          proPrice,
          proPeriod,
          proDescription,
          proFeature1,
          proFeature2,
          proFeature3,
          proFeature4,
          proFeature5,
          proFeature6,
          proButton,
          proPopular,
          enterpriseTitle,
          enterprisePrice,
          enterprisePeriod,
          enterpriseDescription,
          enterpriseFeature1,
          enterpriseFeature2,
          enterpriseFeature3,
          enterpriseFeature4,
          enterpriseFeature5,
          enterpriseFeature6,
          enterpriseButton,

          // Testimonials Section
          testimonialsTitle,
          testimonialsSubtitle,
          testimonial1Quote,
          testimonial1Author,
          testimonial1Role,
          testimonial1Avatar,
          testimonial2Quote,
          testimonial2Author,
          testimonial2Role,
          testimonial2Avatar,
          testimonial3Quote,
          testimonial3Author,
          testimonial3Role,
          testimonial3Avatar,

          // FAQ Section
          faqTitle,
          faqSubtitle,
          faq1Question,
          faq1Answer,
          faq2Question,
          faq2Answer,
          faq3Question,
          faq3Answer,
          faq4Question,
          faq4Answer,
          faq5Question,
          faq5Answer,
          faq6Question,
          faq6Answer,

          // Footer CTA
          footerCtaTitle,
          footerCtaSubtitle,
          footerCtaButton,

          // Footer
          footerCompanyDescription,
          footerSocialTwitter,
          footerSocialLinkedin,
          footerSocialGithub,
          footerEmailContact,
          footerPhoneContact,
        } = props;

        return (
          <div className="flex flex-col">
            {/* Navigation */}
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
              <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{logo}</span>
                    <span className="font-bold text-xl">{company}</span>
                  </div>
                  <div className="hidden md:flex items-center gap-6">
                    <a
                      href="#features"
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {navLink1}
                    </a>
                    <a
                      href="#pricing"
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {navLink2}
                    </a>
                    <a
                      href="#about"
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {navLink3}
                    </a>
                    <a
                      href="#contact"
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {navLink4}
                    </a>
                    <Button size="sm">{ctaPrimary}</Button>
                  </div>
                </div>
              </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 lg:py-32 xl:py-40 bg-gradient-to-b from-background via-background to-background">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-40 right-1/3 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
              </div>
              <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-5xl mx-auto">
                  <span className="inline-block text-xs uppercase tracking-wide text-muted-foreground mb-4">
                    Introducing {company}
                  </span>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                    {heroTitle}
                  </h1>
                  <p className="mt-6 text-muted-foreground text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed">
                    {heroSubtitle}
                  </p>
                  <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto sm:max-w-none">
                    <Button
                      size="lg"
                      className="shadow-sm hover:shadow-md px-8 py-3"
                    >
                      {ctaPrimary}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="hover:bg-muted px-8 py-3"
                    >
                      {ctaSecondary}
                    </Button>
                  </div>
                  <div className="mt-16 text-6xl md:text-7xl lg:text-8xl opacity-60">
                    {heroImage}
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 lg:py-32 xl:py-40">
              <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    {featuresTitle}
                  </h2>
                  <p className="mt-6 text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    {featuresSubtitle}
                  </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      title: feature1Title,
                      description: feature1Description,
                      icon: feature1Icon,
                    },
                    {
                      title: feature2Title,
                      description: feature2Description,
                      icon: feature2Icon,
                    },
                    {
                      title: feature3Title,
                      description: feature3Description,
                      icon: feature3Icon,
                    },
                    {
                      title: feature4Title,
                      description: feature4Description,
                      icon: feature4Icon,
                    },
                    {
                      title: feature5Title,
                      description: feature5Description,
                      icon: feature5Icon,
                    },
                    {
                      title: feature6Title,
                      description: feature6Description,
                      icon: feature6Icon,
                    },
                  ].map((feature, i) => (
                    <Card
                      key={i}
                      className="border-border/60 hover:shadow-lg transition-all"
                    >
                      <CardHeader>
                        <div className="text-3xl mb-2">{feature.icon}</div>
                        <CardTitle className="text-xl">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Pricing Section */}
            <section
              id="pricing"
              className="py-24 lg:py-32 xl:py-40 bg-muted/30"
            >
              <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    {pricingTitle}
                  </h2>
                  <p className="mt-6 text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    {pricingSubtitle}
                  </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                  {/* Starter Plan */}
                  <Card className="relative">
                    <CardHeader>
                      <CardTitle className="text-xl">{starterTitle}</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">
                          {starterPrice}
                        </span>
                        <span className="text-muted-foreground">
                          {starterPeriod}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {starterDescription}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {[
                          starterFeature1,
                          starterFeature2,
                          starterFeature3,
                          starterFeature4,
                        ].map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant="outline">
                        {starterButton}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pro Plan */}
                  <Card className="relative border-primary">
                    {proPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{proTitle}</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{proPrice}</span>
                        <span className="text-muted-foreground">
                          {proPeriod}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {proDescription}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {[
                          proFeature1,
                          proFeature2,
                          proFeature3,
                          proFeature4,
                          proFeature5,
                          proFeature6,
                        ].map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full">{proButton}</Button>
                    </CardContent>
                  </Card>

                  {/* Enterprise Plan */}
                  <Card className="relative">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {enterpriseTitle}
                      </CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">
                          {enterprisePrice}
                        </span>
                        <span className="text-muted-foreground">
                          {enterprisePeriod}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {enterpriseDescription}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {[
                          enterpriseFeature1,
                          enterpriseFeature2,
                          enterpriseFeature3,
                          enterpriseFeature4,
                          enterpriseFeature5,
                          enterpriseFeature6,
                        ].map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full" variant="outline">
                        {enterpriseButton}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 lg:py-32 xl:py-40">
              <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    {testimonialsTitle}
                  </h2>
                  <p className="mt-6 text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    {testimonialsSubtitle}
                  </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                  {[
                    {
                      quote: testimonial1Quote,
                      author: testimonial1Author,
                      role: testimonial1Role,
                      avatar: testimonial1Avatar,
                    },
                    {
                      quote: testimonial2Quote,
                      author: testimonial2Author,
                      role: testimonial2Role,
                      avatar: testimonial2Avatar,
                    },
                    {
                      quote: testimonial3Quote,
                      author: testimonial3Author,
                      role: testimonial3Role,
                      avatar: testimonial3Avatar,
                    },
                  ].map((testimonial, i) => (
                    <Card key={i} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground mb-4 italic">
                          "{testimonial.quote}"
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{testimonial.avatar}</span>
                          <div>
                            <p className="font-semibold">
                              {testimonial.author}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 lg:py-32 xl:py-40 bg-muted/30">
              <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    {faqTitle}
                  </h2>
                  <p className="mt-6 text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    {faqSubtitle}
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    { question: faq1Question, answer: faq1Answer },
                    { question: faq2Question, answer: faq2Answer },
                    { question: faq3Question, answer: faq3Answer },
                    { question: faq4Question, answer: faq4Answer },
                    { question: faq5Question, answer: faq5Answer },
                    { question: faq6Question, answer: faq6Answer },
                  ].map((faq, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {faq.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer CTA */}
            <section className="py-24 lg:py-32 xl:py-40">
              <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                  <CardHeader className="text-center py-12">
                    <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold">
                      {footerCtaTitle}
                    </CardTitle>
                    <p className="text-muted-foreground text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
                      {footerCtaSubtitle}
                    </p>
                  </CardHeader>
                  <CardContent className="flex justify-center pb-12">
                    <Button
                      size="lg"
                      className="shadow-sm hover:shadow-md px-8 py-3"
                    >
                      {footerCtaButton}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-background py-16 lg:py-20">
              <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{logo}</span>
                      <span className="font-bold text-xl">{company}</span>
                    </div>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      {footerCompanyDescription}
                    </p>
                    <div className="flex gap-4">
                      <a
                        href={footerSocialTwitter}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        🐦
                      </a>
                      <a
                        href={footerSocialLinkedin}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        💼
                      </a>
                      <a
                        href={footerSocialGithub}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        🐙
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Product</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <a
                          href="#features"
                          className="hover:text-primary transition-colors"
                        >
                          Features
                        </a>
                      </li>
                      <li>
                        <a
                          href="#pricing"
                          className="hover:text-primary transition-colors"
                        >
                          Pricing
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="hover:text-primary transition-colors"
                        >
                          Documentation
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="hover:text-primary transition-colors"
                        >
                          API
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Contact</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>{footerEmailContact}</li>
                      <li>{footerPhoneContact}</li>
                      <li>
                        <a
                          href="#"
                          className="hover:text-primary transition-colors"
                        >
                          Support
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="hover:text-primary transition-colors"
                        >
                          Help Center
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
                  <p>&copy; 2024 {company}. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        );
      },
    },

    TemplateBlog: {
      defaultProps: {
        siteName: "Blog",
        logoText: "📝 MyBlog",
        heroTitle: "Welcome to My Blog",
        heroSubtitle: "Thoughts, stories and ideas from our team",
        featuredPostTitle: "Featured Post Title",
        featuredPostExcerpt:
          "This is the excerpt of our featured blog post that showcases the most important content...",
        featuredPostImage:
          "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop",
        footerText: "© 2024 MyBlog. All rights reserved.",
        sections: [
          { type: "BlogHeader" },
          { type: "BlogHero" },
          { type: "BlogFeaturedPost" },
          { type: "BlogPostGrid" },
          { type: "BlogFooter" },
        ],
      },
      fields: {
        siteName: { type: "text", label: "Site Name" },
        logoText: { type: "text", label: "Logo Text" },
        heroTitle: { type: "text", label: "Hero Title" },
        heroSubtitle: { type: "textarea", label: "Hero Subtitle" },
        featuredPostTitle: { type: "text", label: "Featured Post Title" },
        featuredPostExcerpt: {
          type: "textarea",
          label: "Featured Post Excerpt",
        },
        featuredPostImage: { type: "text", label: "Featured Post Image" },
        footerText: { type: "text", label: "Footer Text" },
        sections: {
          type: "array",
          label: "Sections",
          getItemSummary: (item: any) => item.type || "Section",
          arrayFields: {
            type: {
              type: "select",
              label: "Section Type",
              options: [
                { label: "Header", value: "BlogHeader" },
                { label: "Hero", value: "BlogHero" },
                { label: "Featured Post", value: "BlogFeaturedPost" },
                { label: "Post Grid", value: "BlogPostGrid" },
                { label: "Footer", value: "BlogFooter" },
              ],
            },
            // Optional per-section overrides
            title: { type: "text", label: "Title (optional)" },
            subtitle: { type: "text", label: "Subtitle (optional)" },
            image: { type: "text", label: "Image URL (optional)" },
            postCount: { type: "text", label: "Post Count (optional)" },
            columns: { type: "text", label: "Columns (optional)" },
            badgeText: { type: "text", label: "Badge (optional)" },
          },
        },
      },
      render: (props: any) => {
        const {
          logoText,
          heroTitle,
          heroSubtitle,
          featuredPostTitle,
          featuredPostExcerpt,
          featuredPostImage,
          footerText,
          sections,
        } = props;

        return (
          <div className="min-h-screen bg-background">
            {sections.map((section: any, idx: number) => {
              switch (section.type) {
                case "BlogHeader": {
                  const node = (puckConfig as any).components.BlogHeader.render(
                    { siteName: props.siteName, logoText, showNavigation: true }
                  );
                  return (
                    <div key={idx} className="contents">
                      {node}
                    </div>
                  );
                }
                case "BlogHero": {
                  const node = (puckConfig as any).components.BlogHero.render({
                    title: section.title || heroTitle,
                    subtitle: section.subtitle || heroSubtitle,
                    maxWidth: "4xl",
                  });
                  return (
                    <div key={idx} className="contents">
                      {node}
                    </div>
                  );
                }
                case "BlogFeaturedPost": {
                  const node = (
                    puckConfig as any
                  ).components.BlogFeaturedPost.render({
                    title: section.title || featuredPostTitle,
                    excerpt: section.subtitle || featuredPostExcerpt,
                    image: section.image || featuredPostImage,
                    buttonText: "Read More",
                    showBadge: true,
                    badgeText: section.badgeText || "Featured",
                  });
                  return (
                    <div key={idx} className="contents">
                      {node}
                    </div>
                  );
                }
                case "BlogPostGrid": {
                  const node = (
                    puckConfig as any
                  ).components.BlogPostGrid.render({
                    title: section.title || "Recent Posts",
                    postCount: Number(section.postCount) || 6,
                    columns: Number(section.columns) || 3,
                    backgroundColor: "muted",
                  });
                  return (
                    <div key={idx} className="contents">
                      {node}
                    </div>
                  );
                }
                case "BlogFooter": {
                  const node = (puckConfig as any).components.BlogFooter.render(
                    { text: footerText, maxWidth: "6xl" }
                  );
                  return (
                    <div key={idx} className="contents">
                      {node}
                    </div>
                  );
                }
                default:
                  return null;
              }
            })}
          </div>
        );
      },
    },

    TemplatePortfolio: {
      defaultProps: {
        name: "John Doe",
        title: "Full Stack Developer",
        bio: "I'm a passionate developer who loves creating amazing digital experiences. With 5+ years of experience in web development.",
        profileImage:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        resumeUrl: "#",
        githubUrl: "#",
        linkedinUrl: "#",
        emailAddress: "john@example.com",
        sections: [
          { type: "PortfolioHeader" },
          { type: "PortfolioHero" },
          { type: "SkillsSection" },
          { type: "Grid" },
          { type: "PortfolioContact" },
        ],
      },
      fields: {
        name: { type: "text", label: "Your Name" },
        title: { type: "text", label: "Professional Title" },
        bio: { type: "textarea", label: "Bio" },
        profileImage: { type: "text", label: "Profile Image URL" },
        resumeUrl: { type: "text", label: "Resume URL" },
        githubUrl: { type: "text", label: "GitHub URL" },
        linkedinUrl: { type: "text", label: "LinkedIn URL" },
        emailAddress: { type: "text", label: "Email Address" },
        sections: {
          type: "array",
          label: "Sections",
          getItemSummary: (item: any) => item.type || "Section",
          arrayFields: {
            type: {
              type: "select",
              label: "Section Type",
              options: [
                { label: "Header", value: "PortfolioHeader" },
                { label: "Hero", value: "PortfolioHero" },
                { label: "Skills", value: "SkillsSection" },
                { label: "Projects", value: "Grid" },
                { label: "Contact", value: "PortfolioContact" },
              ],
            },
            // Optional per-section overrides
            title: { type: "text", label: "Title (optional)" },
            subtitle: { type: "text", label: "Subtitle (optional)" },
            image: { type: "text", label: "Image URL (optional)" },
            projectCount: { type: "text", label: "Project Count (optional)" },
            columns: { type: "text", label: "Columns (optional)" },
          },
        },
      },
      render: (props: any) => {
        const {
          name,
          title,
          bio,
          profileImage,
          resumeUrl,
          githubUrl,
          linkedinUrl,
          emailAddress,
          sections,
        } = props;

        return (
          <div className="min-h-screen bg-background">
            {sections.map((section: any, idx: number) => {
              switch (section.type) {
                case "PortfolioHeader": {
                  const node = (
                    puckConfig as any
                  ).components.PortfolioHeader.render({
                    name,
                    showNavigation: true,
                  });
                  return (
                    <div key={idx} className="contents">
                      {node}
                    </div>
                  );
                }
                case "PortfolioHero":
                  return (
                    <div key={idx} className="contents">
                      {(puckConfig as any).components.PortfolioHero.render({
                        name,
                        title,
                        bio,
                        profileImage,
                        resumeUrl,
                        emailAddress,
                        showButtons: true,
                      })}
                    </div>
                  ) as any;
                case "SkillsSection":
                  return (
                    <div key={idx} className="contents">
                      {(puckConfig as any).components.SkillsSection.render({
                        title: section.title || "Skills & Technologies",
                        skillGroups: (puckConfig as any).components
                          .SkillsSection.defaultProps.skillGroups,
                        backgroundColor: "muted",
                      })}
                    </div>
                  ) as any;
                case "Grid":
                  return (
                    <div key={idx} className="contents">
                      {(puckConfig as any).components.Grid.render({
                        title: section.title || "Featured Projects",
                        projectCount: Number(section.projectCount) || 4,
                        columns: Number(section.columns) || 2,
                      })}
                    </div>
                  ) as any;
                case "PortfolioContact":
                  return (
                    <div key={idx} className="contents">
                      {(puckConfig as any).components.PortfolioContact.render({
                        title: section.title || "Let's Work Together",
                        subtitle:
                          section.subtitle ||
                          "I'm always interested in new opportunities and exciting projects.",
                        emailAddress,
                        linkedinUrl,
                        githubUrl,
                        backgroundColor: "muted",
                      })}
                    </div>
                  ) as any;
                default:
                  return null;
              }
            })}
          </div>
        );
      },
    },
  },
  root: {
    components: [
      // Core Elements
      "TextElement",
      "HeadingElement",
      "ImageElement",
      "ButtonElement",
      "LinkElement",
      "ListElement",

      // Portfolio Template Components
      "PortfolioHeader",
      "PortfolioHero",
      "SkillsSection",
      "ProjectCard",
      "Grid",
      "PortfolioContact",

      // Blog Template Components
      "BlogHeader",
      "BlogHero",
      "BlogFeaturedPost",
      "BlogPostGrid",
      "BlogFooter",

      // General Composite Components
      "FeatureCard",
      "TestimonialCard",
      "PricingCard",
      "BlogPostCard",
      "ContactSection",

      // Section Components
      "HeroSection",
      "CtaSection",

      // Template Components
      "TemplateStartup",
      "TemplateBlog",
      "TemplatePortfolio",

      // Legacy Components (for backward compatibility)
      "HeadingBlock",
      "ParagraphBlock",
      "ButtonBlock",
      "CardBlock",
      "BadgeBlock",
      "SeparatorBlock",
      "AlertBlock",
    ],
  },
} as const;

export const puckOverrides = {
  drawer: ({ children }: { children: React.ReactNode }) => {
    const [activeTab, setActiveTab] = useState<
      "Core" | "Sections" | "Templates"
    >("Core");

    const TabButton = ({ value }: { value: typeof activeTab }) => {
      const isActive = activeTab === value;
      return (
        <button
          onClick={() => setActiveTab(value)}
          aria-selected={isActive}
          className={`px-3 py-1 text-xs rounded-md transition-colors outline-none border ${
            isActive
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-background text-foreground border-border hover:bg-muted"
          }`}
        >
          {value}
        </button>
      );
    };

    return (
      <DrawerTabContext.Provider value={{ activeTab, setActiveTab }}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <TabButton value="Core" />
            <TabButton value="Sections" />
            <TabButton value="Templates" />
          </div>
          <div className="grid grid-cols-1 space-y-3">{children}</div>
        </div>
      </DrawerTabContext.Provider>
    );
  },
  drawerItem: ({ name }: { name: string }) => {
    const { activeTab } = useContext(DrawerTabContext);

    const category = (() => {
      // Core Elements - Basic building blocks
      if (
        [
          "TextElement",
          "HeadingElement",
          "ImageElement",
          "ButtonElement",
          "LinkElement",
          "ListElement",
          // Legacy core components
          "HeadingBlock",
          "ParagraphBlock",
          "ButtonBlock",
          "CardBlock",
          "BadgeBlock",
          "SeparatorBlock",
          "AlertBlock",
        ].includes(name)
      )
        return "Core";

      // Section Components - Layout sections and composite components
      if (
        [
          // Portfolio components
          "PortfolioHeader",
          "PortfolioHero",
          "SkillsSection",
          "ProjectCard",
          "Grid",
          "PortfolioContact",
          // Blog components
          "BlogHeader",
          "BlogHero",
          "BlogFeaturedPost",
          "BlogPostGrid",
          "BlogFooter",
          // General sections
          "HeroSection",
          "CtaSection",
          "ContactSection",
          "FeatureCard",
          "TestimonialCard",
          "PricingCard",
          "BlogPostCard",
        ].includes(name)
      )
        return "Sections";

      // Template Components - Full page layouts
      if (
        ["TemplateStartup", "TemplateBlog", "TemplatePortfolio"].includes(name)
      )
        return "Templates";

      return "Core";
    })();

    // Hide items that don't match the active tab
    if (activeTab !== category) {
      return <div style={{ display: "none" }} />;
    }

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div
        className="w-full rounded-md border bg-background p-3 text-foreground"
        data-category={category}
        data-component={name}
      >
        <div className="text-xs mb-2 opacity-70 truncate">{name}</div>
        <div className="overflow-hidden rounded-sm border bg-card p-2">
          <div className="scale-90 origin-top-left">{children}</div>
        </div>
      </div>
    );

    switch (name) {
      // Core Elements
      case "TextElement":
        return (
          <Wrapper>
            <p className="text-sm">Your text here</p>
          </Wrapper>
        );
      case "HeadingElement":
        return (
          <Wrapper>
            <h3 className="text-lg font-bold">Heading</h3>
          </Wrapper>
        );
      case "ImageElement":
        return (
          <Wrapper>
            <div className="w-full h-16 bg-muted rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">📷 Image</span>
            </div>
          </Wrapper>
        );
      case "ButtonElement":
        return (
          <Wrapper>
            <Button size="sm">Click me</Button>
          </Wrapper>
        );
      case "LinkElement":
        return (
          <Wrapper>
            <a href="#" className="text-primary hover:underline text-sm">
              Link text
            </a>
          </Wrapper>
        );
      case "ListElement":
        return (
          <Wrapper>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </Wrapper>
        );

      // Portfolio Components
      case "PortfolioHeader":
        return (
          <Wrapper>
            <div className="border rounded p-2">
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold">John Doe</div>
                <div className="flex gap-1">
                  <div className="w-2 h-1 bg-muted rounded"></div>
                  <div className="w-2 h-1 bg-muted rounded"></div>
                  <div className="w-2 h-1 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </Wrapper>
        );
      case "PortfolioHero":
        return (
          <Wrapper>
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <div className="h-2 rounded bg-muted"></div>
                <div className="h-1 rounded bg-muted/60"></div>
                <div className="h-1 rounded bg-muted/60"></div>
                <div className="flex gap-1">
                  <div className="h-1 w-6 rounded bg-primary"></div>
                  <div className="h-1 w-6 rounded bg-muted"></div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted"></div>
            </div>
          </Wrapper>
        );
      case "SkillsSection":
        return (
          <Wrapper>
            <div className="space-y-2">
              <div className="h-1 rounded bg-muted mx-4"></div>
              <div className="grid grid-cols-3 gap-1">
                <Card className="p-1">
                  <div className="h-2 rounded bg-muted"></div>
                </Card>
                <Card className="p-1">
                  <div className="h-2 rounded bg-muted"></div>
                </Card>
                <Card className="p-1">
                  <div className="h-2 rounded bg-muted"></div>
                </Card>
              </div>
            </div>
          </Wrapper>
        );
      case "ProjectCard":
        return (
          <Wrapper>
            <Card>
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t flex items-center justify-center">
                <span className="text-lg">💼</span>
              </div>
              <CardContent className="p-2">
                <div className="h-2 rounded bg-muted mb-1"></div>
                <div className="h-1 rounded bg-muted/60 mb-2"></div>
                <div className="flex gap-1">
                  <div className="flex-1 h-1 rounded bg-primary/30"></div>
                  <div className="flex-1 h-1 rounded bg-primary/30"></div>
                </div>
              </CardContent>
            </Card>
          </Wrapper>
        );
      case "Grid":
        return (
          <Wrapper>
            <div className="space-y-2">
              <div className="h-1 rounded bg-muted mx-4"></div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-6 rounded bg-muted"></div>
                <div className="h-6 rounded bg-muted"></div>
                <div className="h-6 rounded bg-muted"></div>
                <div className="h-6 rounded bg-muted"></div>
              </div>
            </div>
          </Wrapper>
        );
      case "PortfolioContact":
        return (
          <Wrapper>
            <div className="text-center space-y-1">
              <div className="h-2 rounded bg-muted mx-2"></div>
              <div className="h-1 rounded bg-muted/60 mx-4"></div>
              <div className="flex justify-center gap-1">
                <div className="w-4 h-1 rounded bg-primary"></div>
                <div className="w-4 h-1 rounded bg-muted"></div>
                <div className="w-4 h-1 rounded bg-muted"></div>
              </div>
            </div>
          </Wrapper>
        );

      // Blog Components
      case "BlogHeader":
        return (
          <Wrapper>
            <div className="border-b pb-1">
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold">📝 MyBlog</div>
                <div className="flex gap-1">
                  <div className="w-2 h-1 bg-muted rounded"></div>
                  <div className="w-2 h-1 bg-muted rounded"></div>
                  <div className="w-2 h-1 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </Wrapper>
        );
      case "BlogHero":
        return (
          <Wrapper>
            <div className="text-center space-y-1">
              <div className="h-2 rounded bg-muted mx-1"></div>
              <div className="h-1 rounded bg-muted/60 mx-2"></div>
            </div>
          </Wrapper>
        );
      case "BlogFeaturedPost":
        return (
          <Wrapper>
            <div className="space-y-1">
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <div className="h-2 rounded bg-muted"></div>
                  <div className="h-1 rounded bg-muted/60"></div>
                  <div className="h-1 w-6 rounded bg-primary"></div>
                </div>
                <div className="w-8 h-6 rounded bg-muted"></div>
              </div>
            </div>
          </Wrapper>
        );
      case "BlogPostGrid":
        return (
          <Wrapper>
            <div className="space-y-1">
              <div className="h-1 rounded bg-muted mx-4"></div>
              <div className="grid grid-cols-3 gap-1">
                <Card className="p-1">
                  <div className="aspect-video bg-muted rounded mb-1"></div>
                  <div className="h-1 rounded bg-muted"></div>
                </Card>
                <Card className="p-1">
                  <div className="aspect-video bg-muted rounded mb-1"></div>
                  <div className="h-1 rounded bg-muted"></div>
                </Card>
                <Card className="p-1">
                  <div className="aspect-video bg-muted rounded mb-1"></div>
                  <div className="h-1 rounded bg-muted"></div>
                </Card>
              </div>
            </div>
          </Wrapper>
        );
      case "BlogFooter":
        return (
          <Wrapper>
            <div className="border-t pt-1 text-center">
              <div className="h-1 rounded bg-muted/60 mx-4"></div>
            </div>
          </Wrapper>
        );

      // Composite Components
      case "FeatureCard":
        return (
          <Wrapper>
            <Card>
              <CardHeader className="p-3">
                <div className="text-lg mb-1">🎯</div>
                <CardTitle className="text-sm">Feature</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-xs text-muted-foreground">Description...</p>
                <Button size="sm" variant="outline" className="mt-2 w-full">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </Wrapper>
        );
      case "TestimonialCard":
        return (
          <Wrapper>
            <Card>
              <CardContent className="p-3">
                <div className="flex mb-2">
                  <span className="text-yellow-500 text-xs">★★★★★</span>
                </div>
                <p className="text-xs text-muted-foreground italic mb-2">
                  "Great product!"
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm">👤</span>
                  <div>
                    <p className="text-xs font-semibold">John Doe</p>
                    <p className="text-xs text-muted-foreground">CEO</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Wrapper>
        );
      case "PricingCard":
        return (
          <Wrapper>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Basic</CardTitle>
                <div className="text-lg font-bold">$19</div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ul className="text-xs space-y-1 mb-2">
                  <li className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>Feature 1
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>Feature 2
                  </li>
                </ul>
                <Button size="sm" className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </Wrapper>
        );
      case "BlogPostCard":
        return (
          <Wrapper>
            <Card>
              <div className="h-16 bg-muted rounded-t flex items-center justify-center">
                <span className="text-xs text-muted-foreground">📰</span>
              </div>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Blog Title</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-xs text-muted-foreground">Post excerpt...</p>
              </CardContent>
            </Card>
          </Wrapper>
        );
      case "ContactSection":
        return (
          <Wrapper>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Get in Touch</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs">📧</span>
                  <span className="text-xs">Email</span>
                </div>
                <div className="h-8 bg-muted rounded text-xs flex items-center justify-center">
                  Form
                </div>
              </div>
            </div>
          </Wrapper>
        );

      // Legacy Components
      case "HeadingBlock":
        return (
          <Wrapper>
            <h3 className="text-xl font-semibold">Heading</h3>
            <p className="text-xs text-muted-foreground">Subheading preview</p>
          </Wrapper>
        );
      case "ParagraphBlock":
        return (
          <Wrapper>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </Wrapper>
        );
      case "ButtonBlock":
        return (
          <Wrapper>
            <Button size="sm">Button</Button>
          </Wrapper>
        );
      case "CardBlock":
        return (
          <Wrapper>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-sm">Card title</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-xs text-muted-foreground">Some content…</p>
              </CardContent>
            </Card>
          </Wrapper>
        );
      case "BadgeBlock":
        return (
          <Wrapper>
            <Badge>Badge</Badge>
          </Wrapper>
        );
      case "SeparatorBlock":
        return (
          <Wrapper>
            <Separator />
          </Wrapper>
        );
      case "AlertBlock":
        return (
          <Wrapper>
            <Alert>
              <AlertTitle className="text-sm">Heads up!</AlertTitle>
              <AlertDescription className="text-xs">
                Something happened.
              </AlertDescription>
            </Alert>
          </Wrapper>
        );
      case "HeroSection":
        return (
          <Wrapper>
            <div className="w-full gap-2 text-center">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Introducing
              </div>
              <div className="text-base font-semibold">
                Build faster with Builddrr
              </div>
              <div className="flex justify-center gap-2">
                <Button size="sm">Get started</Button>
                <Button size="sm" variant="outline">
                  Contact sales
                </Button>
              </div>
            </div>
          </Wrapper>
        );
      case "CtaSection":
        return (
          <Wrapper>
            <Card>
              <CardHeader className="p-2">
                <CardTitle className="text-sm">Ready to launch?</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 flex items-center justify-between gap-2">
                <div className="text-[11px] text-muted-foreground">
                  Start building today.
                </div>
                <Button size="sm">Create account</Button>
              </CardContent>
            </Card>
          </Wrapper>
        );
      case "TemplateStartup":
        return (
          <Wrapper>
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Introducing
                </div>
                <div className="text-sm font-semibold">Startup template</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 rounded bg-muted" />
                <div className="h-8 rounded bg-muted" />
                <div className="h-8 rounded bg-muted" />
              </div>
              <div className="flex justify-center">
                <Button size="sm">Get started</Button>
              </div>
            </div>
          </Wrapper>
        );
      case "TemplateBlog":
        return (
          <Wrapper>
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  📝
                </div>
                <div className="text-sm font-semibold">Blog Template</div>
              </div>
              <div className="space-y-1">
                <div className="h-4 rounded bg-muted" />
                <div className="grid grid-cols-3 gap-1">
                  <div className="h-6 rounded bg-muted" />
                  <div className="h-6 rounded bg-muted" />
                  <div className="h-6 rounded bg-muted" />
                </div>
              </div>
            </div>
          </Wrapper>
        );
      case "TemplatePortfolio":
        return (
          <Wrapper>
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  💼
                </div>
                <div className="text-sm font-semibold">Portfolio</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-2 rounded bg-muted mb-1" />
                  <div className="h-1 rounded bg-muted/60" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-6 rounded bg-muted" />
                <div className="h-6 rounded bg-muted" />
              </div>
            </div>
          </Wrapper>
        );
      default:
        return (
          <Wrapper>
            <div className="text-xs">{name}</div>
          </Wrapper>
        );
    }
  },
} as const;
