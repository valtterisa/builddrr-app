import { heroConfig } from "../site-components/Hero";
import { ctaBlockConfig } from "../site-components/CTABlock";
import { footerConfig } from "../site-components/Footer";
import { featureBlockConfig } from "../site-components/FeatureBlock";
import { pricingCardConfig } from "../site-components/PricingCard";
import { testimonialConfig } from "../site-components/Testimonials";
import { headerConfig } from "../site-components/Header";

export const config = {
  components: {
    Hero: heroConfig,
    CTABlock: ctaBlockConfig,
    Footer: footerConfig,
    Features: featureBlockConfig,
    Testimonial: testimonialConfig,
    Pricing: pricingCardConfig,
    Header: headerConfig,
  },
};
