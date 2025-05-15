"use server";

import { createClient } from "@/lib/supabase/server";
import { createWebsite } from "./website";
import { revalidatePath } from "next/cache";
import { parseAIResponse } from "@/lib/utils";

type GenerateDeployResult = {
  success: boolean;
  data?: {
    websiteId: string;
    machineId: string;
    url: string;
  };
  error?: string;
};

/**
 * Mock implementation of AI content generation that reads from a static file
 */
async function getMockAIResponse(): Promise<string> {
  // In production, this would call an actual AI service
  // For now, we'll use a mock response from a static file
  try {
    // Using a hardcoded mock response for now
    const mockResponse = `

<siteforge-code>


<siteforge-write file="/components/site-components/header/header.tsx">
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

</siteforge-write>

<siteforge-write file="/components/site-components/header/logo.tsx">
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
</siteforge-write>
</siteforge-code>`;

    console.log("Using mock AI response");
    return mockResponse;
  } catch (error) {
    console.error("Error reading mock AI response:", error);
    throw new Error("Failed to get mock AI response");
  }
}

/**
 * Server action to generate a website from a prompt and deploy it to Fly.io
 *
 * @param userId The authenticated user ID
 * @param prompt The user's prompt for AI website generation
 * @returns Result with website and deployment information
 */
export async function generateAndDeployWebsite(
  userId: string,
  prompt: string
): Promise<GenerateDeployResult> {
  try {
    console.log(
      `Starting website generation for user ${userId} with prompt: ${prompt}`
    );

    // 1. Generate website content with AI (using mock data for now)
    console.log("Getting mock AI content...");
    // const aiResponse = await generateAIResponse(prompt); // COMMENTED OUT: Real AI generation
    const aiResponse = await getMockAIResponse(); // USING MOCK RESPONSE

    if (!aiResponse) {
      throw new Error("Failed to generate website content");
    }

    // 2. Parse the AI response to extract file operations
    const fileOperations = await parseAIResponse(aiResponse);

    if (fileOperations.length === 0) {
      throw new Error("No valid file operations found in AI response");
    }

    console.log(
      `Found ${fileOperations.length} file operations in AI response`
    );

    // 3. Create a website name from the prompt with a timestamp to ensure uniqueness
    const timestamp = Date.now().toString().slice(-6); // Use last 6 digits of timestamp for uniqueness
    const websiteName = `${prompt
      .split(" ")
      .slice(0, 3)
      .join("-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")}-${timestamp}`;

    console.log(`Creating new website with unique name: ${websiteName}`);

    // 4. Create a website record and assign a Fly.io machine with the files already included
    const websiteResult = await createWebsite(
      userId,
      websiteName,
      fileOperations
    );

    if (!websiteResult.success) {
      throw new Error(
        `Failed to create website: ${websiteResult.error || "Unknown error"}`
      );
    }

    if (
      !websiteResult.data ||
      !websiteResult.data.website ||
      !websiteResult.data.website.id ||
      !websiteResult.data.machine ||
      !websiteResult.data.machine.machine_id
    ) {
      throw new Error(
        "Failed to create website: No website ID or machine ID returned"
      );
    }

    const websiteId = websiteResult.data.website.id;
    const machineId = websiteResult.data.machine.machine_id;
    const appName = websiteResult.data.machine.app_name;

    console.log(
      `Website created with ID: ${websiteId}, Machine ID: ${machineId}, App: ${appName}`
    );
    let url = `https://${appName}.fly.dev`;
    // Update the website with URL and content
    const supabase = await createClient();
    await supabase
      .from("websites")
      .update({
        status: "running",
        url: url,
      })
      .eq("id", websiteId);

    // 7. Revalidate relevant paths to update UI
    revalidatePath("/dashboard/website/my-websites");
    revalidatePath(`/dashboard/website/editor/${websiteId}`);

    console.log("Website deployment completed");

    return {
      success: true,
      data: {
        websiteId,
        machineId,
        url,
      },
    };
  } catch (error) {
    console.error("Error in generateAndDeployWebsite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
