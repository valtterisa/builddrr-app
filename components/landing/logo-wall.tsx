import { Reveal } from "@/components/site/reveal";

const AUDIENCES = [
  "Local shops",
  "Creators",
  "Consultants",
  "Cafés & studios",
];

export function LogoWall() {
  return (
    <section className="border-b border-border">
      <div className="grid sm:grid-cols-[9rem_1fr]">
        <div className="flex items-center border-b border-border px-4 py-4 sm:border-b-0 sm:border-r md:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Made for
          </p>
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-4">
          {AUDIENCES.map((label, i) => (
            <li
              key={label}
              className={`flex h-14 items-center justify-center border-border px-3 text-center text-sm text-muted-foreground ${
                i % 2 === 0 ? "border-r" : ""
              } sm:border-r sm:last:border-r-0 ${i < 2 ? "border-b sm:border-b-0" : ""}`}
            >
              <Reveal>
                <span>{label}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
