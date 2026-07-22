import { Reveal } from "@/components/site/reveal";

const POINTS = [
  {
    title: "Looks intentional",
    body: "Strong hierarchy, real spacing, and a clear visual direction — so the site feels designed, not generated.",
  },
  {
    title: "Ready to show",
    body: "Share a live preview the same day. Clients and teammates see the real thing, not a mock.",
  },
  {
    title: "Easy to change",
    body: "Ask for a new headline, section, or tone. Iterate in chat until it matches what you meant.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border">
      <div className="border-b border-border px-6 py-10 md:px-8 md:py-12">
        <Reveal>
          <h2 className="max-w-[18ch] text-3xl font-semibold tracking-tight md:text-4xl">
            Built for people who need a site, not a stack.
          </h2>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
            Describe the business. Get a polished Astro site you can refine in
            conversation and ship with confidence.
          </p>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <Reveal className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
            <img
              src="https://picsum.photos/seed/builddrr-light-workspace/1400/900"
              alt="Builddrr workspace with chat and live site preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="border-t border-border px-6 py-7 md:px-8">
            <h3 className="text-xl font-semibold tracking-tight">
              From idea to something you can open.
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Write one sentence. Watch a full site appear with a live preview —
              then keep editing until it feels right.
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col">
          {POINTS.map((point, i) => (
            <Reveal
              key={point.title}
              delay={0.05 * (i + 1)}
              className={`flex flex-1 flex-col justify-center px-6 py-8 md:px-8 ${
                i < POINTS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <h3 className="text-lg font-semibold tracking-tight">{point.title}</h3>
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
