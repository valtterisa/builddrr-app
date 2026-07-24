import type { ReactNode } from "react";
import { Container } from "@/components/site/container";
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  containerClassName,
  bordered = false,
  flush = false,
  children,
}: {
  id?: string;
  className?: string;
  containerClassName?: string;
  bordered?: boolean;
  flush?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        flush ? undefined : "py-28",
        bordered && "border-y border-border/60",
        className
      )}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
