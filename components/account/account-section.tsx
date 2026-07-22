import type { ReactNode } from "react";

export function AccountSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/40 p-6 md:p-8">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
