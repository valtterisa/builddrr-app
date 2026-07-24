import { Reveal } from "@/components/site/reveal";
import { PageHeader } from "@/components/site/page-header";

const POINTS = [
  {
    title: "Looks intentional",
    body: "Clear layout, thoughtful spacing, and a design that fits your business — so it feels made for you, not templated.",
  },
  {
    title: "Ready to show",
    body: "Share a live link the same day. Clients and teammates see the real site, not a sketch.",
  },
  {
    title: "Easy to change",
    body: "Ask for a new headline, section, or tone. Chat until it matches what you meant.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border">
      <div className="border-b border-border px-4 py-10 md:px-8 md:py-12">
        <Reveal>
          <PageHeader
            size="section"
            title="Built for people who need a website, not a web team."
            description="Describe your business. Get a polished site you can refine in conversation and share with confidence."
            className="md:items-start"
          />
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <Reveal className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-brand-soft">
            <div
              aria-hidden
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 70% 60% at 50% 45%, color-mix(in srgb, var(--brand) 28%, transparent), transparent 70%)",
              }}
            />
            <img
              src="/brand/logo-mark.png"
              alt=""
              aria-hidden
              draggable={false}
              className="relative z-[1] h-[58%] w-auto max-w-[70%] object-contain drop-shadow-sm"
            />
          </div>
          <div className="border-t border-border px-4 py-7 md:px-8">
            <h3 className="text-xl font-semibold tracking-tight">
              From idea to something you can open.
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Write one sentence. Watch a full website appear with a live
              preview — then keep editing until it feels right.
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col">
          {POINTS.map((point, i) => (
            <Reveal
              key={point.title}
              delay={0.05 * (i + 1)}
              className={`flex flex-1 flex-col justify-center px-4 py-8 md:px-8 ${
                i < POINTS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <h3 className="text-lg font-semibold tracking-tight">
                {point.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {point.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
