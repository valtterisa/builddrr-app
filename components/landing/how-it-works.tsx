import { Reveal } from "@/components/site/reveal";

const STEPS = [
  {
    title: "Describe",
    body: "Write one sentence about the site. Floras reads the brief and picks a design direction.",
  },
  {
    title: "Generate",
    body: "A typed plan becomes a full site project in a fresh Box sandbox with a live dev server.",
  },
  {
    title: "Refine",
    body: "Chat to change copy, sections, and color. The preview updates as it builds.",
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
            className={`grid gap-3 px-6 py-9 md:grid-cols-[minmax(0,0.28fr)_minmax(0,0.72fr)] md:items-center md:gap-12 md:px-8 ${
              i < STEPS.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <Reveal delay={i * 0.06} className="grid gap-3 md:contents">
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {step.title}
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
