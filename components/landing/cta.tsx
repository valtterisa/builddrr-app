import Link from "next/link";
import { Reveal } from "@/components/site/reveal";

export function CallToAction() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-brand text-brand-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            "radial-gradient(ellipse 55% 90% at 88% 50%, color-mix(in srgb, var(--paper) 28%, transparent), transparent 70%)",
        }}
      />
      <img
        aria-hidden
        alt=""
        src="/brand/logo-mark.png"
        draggable={false}
        className="pointer-events-none absolute -right-10 top-1/2 hidden h-[155%] w-auto -translate-y-1/2 object-contain opacity-[0.55] brightness-0 invert md:block lg:-right-6 lg:opacity-[0.62]"
      />

      <div className="relative grid gap-0 md:grid-cols-[1fr_auto]">
        <div className="border-b border-brand-foreground/20 px-6 py-12 md:border-b-0 md:border-r md:px-8 md:py-16">
          <Reveal>
            <h2 className="max-w-[16ch] text-3xl font-semibold tracking-tight md:text-4xl">
              Your next site is one sentence away.
            </h2>
          </Reveal>
        </div>
        <div className="relative z-[1] flex items-center justify-center px-6 py-8 md:min-w-[14rem] md:px-10">
          <Reveal delay={0.06}>
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center justify-center border border-brand-foreground/30 bg-paper px-7 text-sm font-medium text-ink shadow-[0_0_0_1px_color-mix(in_srgb,var(--brand)_12%,transparent)] transition-[filter] hover:brightness-95 active:scale-[0.98]"
            >
              Start building
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
