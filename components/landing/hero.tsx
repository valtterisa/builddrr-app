import { Reveal } from "@/components/site/reveal";
import { LandingComposer } from "@/components/landing/landing-composer";

export function Hero() {
  return (
    <section className="border-b border-border px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto grid max-w-3xl gap-10 md:gap-12">
        <Reveal>
          <h1 className="mx-auto max-w-[16ch] text-center text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
            Astro sites from{" "}
            <span className="relative inline-block whitespace-nowrap px-0.5">
              one sentence.
              <svg
                aria-hidden
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-x-0 bottom-[-0.06em] h-[0.28em] w-full"
              >
                <defs>
                  <linearGradient
                    id="sentence-underline"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#3245ff" />
                    <stop offset="100%" stopColor="#b845ed" />
                  </linearGradient>
                </defs>
                <path
                  d="M2 8.5 C40 3.5, 80 10.5, 120 6.5 S180 3, 198 7.5"
                  fill="none"
                  stroke="url(#sentence-underline)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.06}>
          <LandingComposer />
        </Reveal>
      </div>
    </section>
  );
}
