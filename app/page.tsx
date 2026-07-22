import { MarketingLayout } from "@/components/site/marketing-layout";
import { Hero } from "@/components/landing/hero";
import { LogoWall } from "@/components/landing/logo-wall";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { CallToAction } from "@/components/landing/cta";
import { SectionGutter } from "@/components/landing/section-gutter";

export default function LandingPage() {
  return (
    <MarketingLayout>
      <Hero />
      <SectionGutter />
      <LogoWall />
      <SectionGutter />
      <Features />
      <SectionGutter />
      <HowItWorks />
      <SectionGutter />
      <Pricing />
      <SectionGutter />
      <CallToAction />
    </MarketingLayout>
  );
}
