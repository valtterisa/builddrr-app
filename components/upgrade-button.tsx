"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ensureStripeCustomer } from "@/actions/user-actions"

// Update the UpgradeButtonProps interface
interface UpgradeButtonProps extends ButtonProps {
  userId: string
  children?: React.ReactNode
}

// Update the component to remove the plan parameter
export function UpgradeButton({ userId, children, ...props }: UpgradeButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setLoading(true)

      // Ensure the user has a Stripe customer ID
      await ensureStripeCustomer(userId)

      // Redirect to the upgrade page
      router.push("/upgrade")
    } catch (error) {
      console.error("Error preparing upgrade:", error)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleUpgrade} disabled={loading} {...props}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children || "Upgrade to Pro"
      )}
    </Button>
  )
}

