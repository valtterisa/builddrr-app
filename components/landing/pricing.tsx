import { Reveal } from "@/components/site/reveal";
import { PageHeader } from "@/components/site/page-header";
import { PricingTableClient } from "@/components/pricing/pricing-table-client";

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border">
      <div className="border-b border-border px-4 py-10 md:px-8 md:py-12">
        <Reveal>
          <PageHeader
            size="section"
            title="Simple pricing."
            description="Tokens, hosting, and SEO-ready Astro — top up when you want to go further."
            className="md:items-start"
          />
        </Reveal>
      </div>
      <Reveal delay={0.06}>
        <PricingTableClient />
      </Reveal>
    </section>
  );
}
