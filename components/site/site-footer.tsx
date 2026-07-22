import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="flex flex-col justify-between gap-10 p-8 md:flex-row md:items-end md:p-10">
        <div>
          <Logo />
          <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
            Describe a site. Get a live Astro preview in a real sandbox.
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          &copy; {new Date().getFullYear()} Builddrr
        </p>
      </div>
      <div className="flex justify-center border-t border-border">
        <a
          href="https://valtterisavonen.fi"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          Made by Valtteri Savonen
        </a>
      </div>
    </footer>
  );
}
