import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanFeatureCheckProps {
  feature: string
  included: boolean
  className?: string
}

export function PlanFeatureCheck({ feature, included, className }: PlanFeatureCheckProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {included ? (
        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-gray-300 mr-2 flex-shrink-0" />
      )}
      <span className={included ? "" : "text-muted-foreground"}>{feature}</span>
    </div>
  )
}

