"use client";

import { useRef } from "react";
import { StepsSection } from "./steps-section";
import { PricingSection } from "./pricing-section";
import { TemplatesCTA } from "./templates-cta";
import { DemoVideo } from "./demo-video";
import { ValueProposition } from "./value-proposition";
import { FinalCTA } from "./final-cta";
import PromptTool from "../interactive/prompt-tool";

export function AnimatedLayout() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-50 via-white to-white -z-10" />

      <main>
        <PromptTool />
        <DemoVideo />
        {/* <ValueProposition />
        <StepsSection />
        <TemplatesCTA />
        <PricingSection />
        <FinalCTA /> */}
      </main>
    </div>
  );
}
