import type { ReactNode } from "react";
import { PageHeader } from "@/components/site/page-header";

export function AccountSection({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-3xl border border-border/60 bg-card/40 p-6 md:scroll-mt-8 md:p-8"
    >
      <PageHeader
        as="h2"
        size="card"
        title={title}
        description={description}
      />
      <div className="mt-6">{children}</div>
    </section>
  );
}
