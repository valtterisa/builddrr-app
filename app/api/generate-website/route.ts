import { NextRequest, NextResponse } from "next/server";
import { generateAndDeployWebsite } from "@/app/actions/generate-deploy";
import { createClient } from "@/lib/supabase/server";

// Mock AI response function
async function getMockAIResponse(): Promise<string> {
  // Using a hardcoded mock response for now
  const mockResponse = `<component-analysis>
1. Business Description Analysis:
   a. Main points: Software agency
   b. Unique selling points: Need to emphasize technical expertise, innovation, and reliability

2. Required Components:
   - Header with responsive navigation
   - Footer with proper site structure
   - Hero section
   - Testimonials section

3. Component Implementation:
   a. Header:
      - Structure: Logo, navigation links, CTA button
      - Data: Navigation items (Home, Services, About, Projects, Contact)
      - Styling: Fixed position, transparent on hero section, solid elsewhere        
      - shadcn/ui: NavigationMenu, Button
      - Accessibility: Proper ARIA labels, keyboard navigation
      - User interactions: Mobile hamburger menu, hover effects
      - Performance: Minimal JS for toggle functionality

   b. Footer:
      - Structure: Logo, site links, contact info, social links, copyright
      - Data: Navigation links, contact details, social media links
      - Styling: Dark background with proper spacing
      - shadcn/ui: Button for CTA
      - Accessibility: Proper heading structure, link descriptions
      - Performance: Static rendering
</component-analysis>

<siteforge-code>
<siteforge-add-dependency>
framer-motion
</siteforge-add-dependency>

<siteforge-write file="/app/components/site-components/header/header.tsx">
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import NavLinks from "./nav-links";

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
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLinks className="flex items-center space-x-6" />
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
              <NavLinks className="flex flex-col space-y-6 text-lg" />
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

<siteforge-write file="/app/components/site-components/header/logo.tsx">
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

  console.log("Using mock AI response in API route");
  return mockResponse;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  try {
    // Verify the user session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 }
      );
    }

    const requestData = await request.json();

    // Get the user's raw prompt
    const userPrompt = requestData.prompt;
    if (!userPrompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check if we should auto-deploy to Fly.io
    const autoDeploy = requestData.autoDeploy !== false;

    if (autoDeploy) {
      // Use the server action to generate and deploy in one step
      const result = await generateAndDeployWebsite(user.id, userPrompt);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to deploy website" },
          { status: 500 }
        );
      }
      // Return both the generated content, deployment info, and GitLab repo URL if available
      return NextResponse.json({
        success: true,
        data: {
          websiteId: result.data?.websiteId,
          machineId: result.data?.machineId,
          url: result.data?.url,
        },
        userId: user.id,
      });
    } else {
      // Traditional approach - just generate AI content without deploying
      const generatedContentJSON = await getMockAIResponse();
      return NextResponse.json({
        data: generatedContentJSON,
        userId: user.id,
      });
    }
  } catch (error) {
    console.error("Error generating website:", error);
    return NextResponse.json(
      { error: "Failed to generate website content" },
      { status: 500 }
    );
  }
}
