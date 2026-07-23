import { Reveal } from "@/components/site/reveal";
import { LandingComposer } from "@/components/landing/landing-composer";

export function Hero() {
  return (
    <section className="border-b border-border px-4 py-12 md:px-8 md:py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 md:gap-10">
        <Reveal className="w-full">
          <h1 className="mx-auto max-w-[18ch] text-center text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.12]">
            A live site from{" "}
            <span className="relative inline-block whitespace-nowrap">
              one sentence
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-[0.12em] h-[0.14em] bg-brand"
              />
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-[36ch] text-center text-base leading-relaxed text-muted-foreground">
            No code. No designer. Just describe what you need.
          </p>
        </Reveal>

        <Reveal delay={0.06} className="w-full">
          <LandingComposer />
        </Reveal>
      </div>
    </section>
  );
}
