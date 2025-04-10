"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { HeroSection } from "./hero-section";
import { StepsSection } from "./steps-section";
import { PricingSection } from "./pricing-section";
import { Footer } from "./footer";
import { TemplatesCTA } from "./templates-cta";
import { AIBuilderCTA } from "./ai-builder-cta";
import { DemoVideo } from "./demo-video";
import { ValueProposition } from "./value-proposition";
import { FinalCTA } from "./final-cta";

export function AnimatedLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-50 via-white to-white -z-10" />

      {/* Sticky Header */}
      <motion.header
        style={{ y, opacity }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-purple-600">SiteForge</span>
            <nav className="hidden md:flex items-center gap-6">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-purple-600"
              >
                Features
              </Button>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-purple-600"
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-purple-600"
              >
                Templates
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="hidden md:flex text-purple-600 border-purple-600 hover:bg-purple-50"
            >
              Sign In
            </Button>
            <Button className="hidden md:flex bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
              Get Started
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-purple-600"
              >
                Features
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-purple-600"
              >
                Pricing
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-purple-600"
              >
                Templates
              </Button>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="w-full text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  Sign In
                </Button>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.header>

      {/* Main Content */}
      <main className="pt-16">
        <HeroSection />
        <DemoVideo />
        <ValueProposition />
        <StepsSection />
        <TemplatesCTA />
        <PricingSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
