import { Container } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { LandingComposer } from "@/components/landing/landing-composer";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-[480px] w-[480px] rounded-full bg-brand/12 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 20% 20%, black 20%, transparent 75%)",
          }}
        />
      </div>

      <Container className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-16 lg:py-20">
        <Reveal className="w-full max-w-2xl">
          <LandingComposer />
        </Reveal>
      </Container>
    </section>
  );
}
