"use client";

import { useRef } from "react";
import { HeroSection } from "./hero-section";
import { StepsSection } from "./steps-section";
import { PricingSection } from "./pricing-section";
import { Footer } from "./footer";
import { TemplatesCTA } from "./templates-cta";
import { AIBuilderCTA } from "./ai-builder-cta";
import { DemoVideo } from "./demo-video";
import { ValueProposition } from "./value-proposition";
import { FinalCTA } from "./final-cta";
import Header from "../layout/header";

export function AnimatedLayout() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-50 via-white to-white -z-10" />

      <Header />

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
