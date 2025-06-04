import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFlyRegistryUrl(appName: string): string {
  return `registry.fly.io/${appName}`;
}

/**
 * Create a unique app name for a user's website
 * @param userId User ID
 * @returns A unique app name valid for Fly.io
 */
export function randomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateAppName(userId: string): string {
  // Use only lowercase alphanumeric for userId
  let userPart = userId
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()
    .slice(0, 8);
  if (!userPart) userPart = randomString(6);
  let rand = randomString(16);
  let appName = `${userPart}-${rand}`;
  // Remove any non-alphanumeric or dash, and ensure no leading/trailing dash
  appName = appName.replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
  // Enforce length and no leading/trailing dash
  if (appName.length > 30) appName = appName.slice(0, 30);
  if (appName.length < 3) appName = appName + randomString(3 - appName.length);
  appName = appName.replace(/^-+|-+$/g, "");
  return appName;
}

import { FileOperation } from "./types";

// Helper function to parse AI-generated content into file operations
export async function parseAIResponse(
  aiResponse: string
): Promise<FileOperation[]> {
  const fileOperations: FileOperation[] = [];

  // Extract <builddrr-write> blocks
  const fileBlockRegex =
    /<builddrr-write file="([^"]+)">([\s\S]*?)<\/builddrr-write>/g;
  let match;

  while ((match = fileBlockRegex.exec(aiResponse)) !== null) {
    const filePath = match[1];
    let content = match[2].trim();

    // Clean up any extra indentation or formatting
    content = content.replace(/^\s+/gm, "");

    // No need to escape content anymore since we're using base64 encoding
    // when writing to Fly.io machines

    fileOperations.push({
      path: filePath.startsWith("/") ? filePath.substring(1) : filePath,
      content: content,
    });
  }

  // Extract dependencies if present
  const dependencyRegex =
    /<builddrr-add-dependency>([\s\S]*?)<\/builddrr-add-dependency>/g;
  let depMatch;

  if ((depMatch = dependencyRegex.exec(aiResponse)) !== null) {
    const dependencies = depMatch[1].trim().split("\n");

    // Create or update package.json with the dependencies
    fileOperations.push({
      path: "package.json",
      content: JSON.stringify(
        {
          dependencies: dependencies.reduce(
            (acc, dep) => {
              acc[dep.trim()] = "latest";
              return acc;
            },
            {} as Record<string, string>
          ),
        },
        null,
        2
      ),
    });
  }

  return fileOperations;
}

export async function getMockAIResponse(): Promise<string> {
  // In production, this would call an actual AI service
  // For now, we'll use a mock response from a static file
  try {
    // Using a hardcoded mock response for now
    const mockResponse = `

<builddrr-code>


<builddrr-write file="/components/site-components/header/header.tsx">
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Logo from "./logo";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",
        isScrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Button className="bg-primary hover:bg-primary/90">Contact Us</Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col h-full">
              <div className="flex justify-end py-4">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetTrigger>
              </div>
              <div className="mt-auto py-6">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Contact Us
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
};

export default Header;

</builddrr-write>

<builddrr-write file="/components/site-components/header/logo.tsx">
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <motion.div
        className="text-2xl font-bold flex items-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <span className="text-primary">Bittive</span>
        <span className="text-secondary ml-1">Oy</span>
      </motion.div>
    </Link>
  );
};

export default Logo;
</builddrr-write>
</builddrr-code>`;

    console.log("Using mock AI response");
    return mockResponse;
  } catch (error) {
    console.error("Error reading mock AI response:", error);
    throw new Error("Failed to get mock AI response");
  }
}
