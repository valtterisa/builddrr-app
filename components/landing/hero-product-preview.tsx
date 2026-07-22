import { LogoMark } from "@/components/brand/logo";

export function HeroProductPreview() {
  return (
    <div className="relative w-full">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)]">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <div className="ml-3 flex-1 truncate rounded-md bg-muted/50 px-3 py-1 font-mono text-[11px] text-muted-foreground">
            floras.ai/build/coastal-studio
          </div>
        </div>

        <div className="grid min-h-[340px] md:min-h-[420px] md:grid-cols-[200px_1fr]">
          <div className="hidden border-r border-border/60 bg-background/40 p-4 md:block">
            <div className="flex items-center gap-2">
              <LogoMark className="size-5 rounded-md" />
              <span className="text-xs font-medium">Floras</span>
            </div>
            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-muted/40 px-3 py-2.5">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  A launch page for a coastal coffee roaster with a short blog.
                </p>
              </div>
              <div className="rounded-xl border border-border/50 px-3 py-2.5">
                <p className="text-[11px] leading-relaxed text-foreground/80">
                  Scaffolded site, Tailwind, and a live preview on Box.
                </p>
              </div>
              <div className="h-8 rounded-full border border-border/60 bg-muted/20" />
            </div>
          </div>

          <div className="relative bg-neutral-100">
            <div className="absolute inset-0 flex flex-col">
              <div className="flex items-center justify-between border-b border-black/5 bg-white/90 px-5 py-3">
                <span className="text-xs font-semibold tracking-tight text-neutral-900">
                  Coastal Roast
                </span>
                <span className="text-[10px] text-neutral-500">Shop / Journal / Visit</span>
              </div>
              <div className="grid flex-1 gap-0 md:grid-cols-2">
                <div className="flex flex-col justify-center gap-3 bg-muted p-6 md:p-8">
                  <p className="max-w-[14ch] text-2xl font-semibold leading-[1.05] tracking-tight text-neutral-900 md:text-3xl">
                    Small-batch coffee from the Pacific edge.
                  </p>
                  <p className="max-w-[28ch] text-xs leading-relaxed text-neutral-600">
                    Fresh roast drops every Thursday. Pickup in Astoria.
                  </p>
                  <span className="inline-flex w-fit rounded-full bg-neutral-900 px-3 py-1.5 text-[10px] font-medium text-neutral-50">
                    Shop the roast
                  </span>
                </div>
                <div className="relative min-h-[160px] overflow-hidden">
                  <img
                    src="https://picsum.photos/seed/floras-coastal-roast/800/900"
                    alt="Sample generated site for a coffee roaster"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
