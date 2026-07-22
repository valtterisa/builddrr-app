import { Reveal } from "@/components/site/reveal";

const STEPS = [
  {
    title: "Describe",
    body: "Write one sentence about your business, offer, or idea. Floras picks a look that fits.",
  },
  {
    title: "See it live",
    body: "In moments you get a real website you can open, click through, and share.",
  },
  {
    title: "Refine",
    body: "Ask for new copy, sections, or colors in chat. The preview updates as you go.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-b border-border">
      <div className="border-b border-border px-6 py-10 md:px-8 md:py-12">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            From sentence to site.
          </h2>
        </Reveal>
      </div>

      <ol>
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className={`grid gap-3 px-6 py-9 md:grid-cols-[minmax(0,0.28fr)_minmax(0,0.72fr)] md:items-center md:gap-0 md:px-8 ${
              i < STEPS.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <Reveal delay={i * 0.06} className="grid gap-3 md:contents">
              <h3 className="border-b border-border pb-3 text-2xl font-semibold tracking-tight md:border-b-0 md:border-r md:pb-0 md:pr-12 md:text-3xl">
                {step.title}
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:pl-12">
                {step.body}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
