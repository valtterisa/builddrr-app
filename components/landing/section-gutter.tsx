import { cn } from "@/lib/utils";

export function SectionGutter({
  cols = 4,
  className,
}: {
  cols?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "grid h-10 border-b border-border md:h-12",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: cols }, (_, i) => (
        <div
          key={i}
          className={i < cols - 1 ? "border-r border-border" : undefined}
        />
      ))}
    </div>
  );
}
