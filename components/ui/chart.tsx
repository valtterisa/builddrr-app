import * as React from "react";

import { cn } from "@/lib/utils";

const Chart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div className={cn("relative", className)} ref={ref} {...props} />;
});
Chart.displayName = "Chart";

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div className={cn("absolute inset-0", className)} ref={ref} {...props} />
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("absolute top-2 right-2", className)}
      ref={ref}
      {...props}
    />
  );
});
ChartLegend.displayName = "ChartLegend";

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "z-50 rounded-md border bg-popover p-4 text-sm shadow-sm outline-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      ref={ref}
      {...props}
    />
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

interface ChartTooltipItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  color?: string;
}

const ChartTooltipItem = React.forwardRef<
  HTMLDivElement,
  ChartTooltipItemProps
>(({ className, label, value, color, ...props }, ref) => {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      ref={ref}
      {...props}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
});
ChartTooltipItem.displayName = "ChartTooltipItem";

export {
  Chart,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipItem,
};
