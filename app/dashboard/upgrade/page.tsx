"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard } from "lucide-react"
import { PlanSelector } from "@/components/plan-selector"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function UpgradePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentPlan, setCurrentPlan] = useState<"starter" | "pro" | "enterprise">("starter")
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "enterprise">("pro")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [websiteData, setWebsiteData] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = localStorage.getItem("isAuthenticated") === "true"
    setIsAuthenticated(checkAuth)

    if (!checkAuth) {
      router.push("/login")
      return
    }

    // Get website data from localStorage
    const data = localStorage.getItem("websiteData")
    if (data) {
      const parsedData = JSON.parse(data)
      setWebsiteData(parsedData)

      // Set current plan
      if (parsedData.plan) {
        setCurrentPlan(parsedData.plan)

        // Default selected plan to the next tier up
        if (parsedData.plan === "starter") {
          setSelectedPlan("pro")
        } else if (parsedData.plan === "pro") {
          setSelectedPlan("enterprise")
        }
      }
    } else {
      router.push("/")
    }
  }, [router])

  const handlePlanChange = (plan: "starter" | "pro" | "enterprise") => {
    setSelectedPlan(plan)
  }

  const handleUpgrade = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Update website data with new plan
      if (websiteData) {
        const updatedData = {
          ...websiteData,
          plan: selectedPlan,
        }

        // Save to localStorage
        localStorage.setItem("websiteData", JSON.stringify(updatedData))

        toast({
          title: "Plan upgraded successfully",
          description: `You are now on the ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan.`,
        })

        setLoading(false)
        router.push("/dashboard")
      }
    }, 1500)
  }

  if (!isAuthenticated || !websiteData) {
    return <div className="container py-10 px-4 md:px-6">Loading...</div>
  }

  return (
    <div className="container max-w-5xl py-10 px-4 md:px-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upgrade Your Plan</h1>
        <p className="text-gray-500 dark:text-gray-400">Choose the plan that best fits your business needs</p>
      </div>

      <PlanSelector selectedPlan={selectedPlan} onPlanChange={handlePlanChange} />

      {selectedPlan !== currentPlan && selectedPlan !== "starter" && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Enter your payment details to upgrade to the{" "}
                {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input id="cardName" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpgrade} className="w-full" disabled={loading}>
                {loading
                  ? "Processing..."
                  : `Upgrade to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {selectedPlan === currentPlan && (
        <div className="mt-8 text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-lg font-medium">
            You are already on the {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan.
          </p>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      )}

      {selectedPlan === "starter" && currentPlan !== "starter" && (
        <div className="mt-8 text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-lg font-medium">Are you sure you want to downgrade to the Starter plan?</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            You will lose access to premium features like contact forms, testimonials, and custom domains.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUpgrade} disabled={loading}>
              {loading ? "Processing..." : "Downgrade to Starter Plan"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

