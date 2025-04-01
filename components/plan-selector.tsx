"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

interface PlanSelectorProps {
  selectedPlan: "starter" | "pro" | "enterprise"
  onPlanChange: (plan: "starter" | "pro" | "enterprise") => void
}

export function PlanSelector({ selectedPlan, onPlanChange }: PlanSelectorProps) {
  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "Free",
      description: "Basic features for individuals and small businesses",
      features: ["One-page website", "AI content generation", "Basic templates"],
      limitations: ["No contact forms", "No testimonials section", "No custom domain"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$19/month",
      description: "Advanced features for growing businesses",
      features: ["Everything in Starter", "Contact forms", "Testimonials section", "Custom domain", "Basic analytics"],
      limitations: ["No priority support", "No multi-language support", "No SEO optimization"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$49/month",
      description: "Complete solution for professional businesses",
      features: [
        "Everything in Pro",
        "Advanced contact forms",
        "Priority support",
        "Multi-language support",
        "SEO optimization",
        "Advanced analytics",
      ],
      limitations: [],
    },
  ]

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedPlan}
        onValueChange={(value) => onPlanChange(value as "starter" | "pro" | "enterprise")}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            <RadioGroupItem value={plan.id} id={plan.id} className="sr-only peer" />
            <Label htmlFor={plan.id} className="cursor-pointer">
              <Card
                className={`h-full transition-all ${
                  selectedPlan === plan.id
                    ? "border-primary ring-2 ring-primary ring-opacity-50"
                    : "hover:border-gray-300"
                }`}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2 text-2xl font-bold">{plan.price}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-gray-500">Limitations:</h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-sm text-gray-500 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {selectedPlan === plan.id ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => onPlanChange(plan.id as "starter" | "pro" | "enterprise")}
                    >
                      Select Plan
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

