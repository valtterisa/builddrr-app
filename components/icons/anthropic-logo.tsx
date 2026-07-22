import { cn } from "@/lib/utils";

export function AnthropicLogo({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("size-4 shrink-0", className)}
      {...props}
    >
      <path d="M13.827 3.52h3.603L24 20.48h-3.603l-1.728-4.464h-7.417L9.523 20.48H5.926l6.901-16.96zm.516 4.128-2.709 6.657h5.418l-2.709-6.657zM0 3.52h3.78l6.9 16.96H6.9L0 3.52z" />
    </svg>
  );
}
