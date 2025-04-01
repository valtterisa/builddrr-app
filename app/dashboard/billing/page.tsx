"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Check, Download, Calendar, ArrowRight, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function BillingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    // Get website data from localStorage
    const data = localStorage.getItem("websiteData")
    if (data) {
      const parsedData = JSON.parse(data)

      // Set plan
      if (parsedData.plan) {
        setPlan(parsedData.plan)
      }
    }

    // Mock invoices data
    if (plan !== "starter") {
      setInvoices([
        {
          id: "INV-001",
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: plan === "pro" ? 19 : 49,
          status: "paid",
        },
        {
          id: "INV-002",
          date: new Date().toISOString(),
          amount: plan === "pro" ? 19 : 49,
          status: "paid",
        },
      ])
    }

    setIsLoading(false)
  }, [plan])

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Invoice downloaded",
      description: `Invoice ${invoiceId} has been downloaded.`,
    })
  }

  const handleCancelSubscription = () => {
    setShowCancelDialog(true)
  }

  const confirmCancelSubscription = () => {
    // In a real app, this would call your backend to cancel the subscription
    setPlan("starter")
    setInvoices([])
    setShowCancelDialog(false)

    toast({
      title: "Subscription cancelled",
      description:
        "Your subscription has been cancelled. You will be downgraded to the Starter plan at the end of your billing period.",
    })
  }

  const handleUpgrade = () => {
    router.push("/upgrade")
  }

  if (isLoading) {
    return <div className="container py-10 px-4 md:px-6">Loading...</div>
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and billing information.</p>
        </div>
        {plan === "starter" && (
          <div className="mt-4 md:mt-0">
            <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your current subscription plan and details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold capitalize">{plan} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan === "starter"
                      ? "Free plan with basic features"
                      : plan === "pro"
                        ? "$19/month, billed monthly"
                        : "$49/month, billed monthly"}
                  </p>
                </div>
                <Badge
                  variant={plan === "starter" ? "outline" : "default"}
                  className={plan === "starter" ? "" : "bg-green-500"}
                >
                  {plan === "starter" ? "Free" : "Active"}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Check
                    className={`h-4 w-4 mr-2 ${plan === "starter" ? "text-muted-foreground" : "text-green-500"}`}
                  />
                  <span className="text-sm">One-page website</span>
                </div>
                <div className="flex items-center">
                  <Check
                    className={`h-4 w-4 mr-2 ${plan === "starter" ? "text-muted-foreground" : "text-green-500"}`}
                  />
                  <span className="text-sm">AI content generation</span>
                </div>
                <div className="flex items-center">
                  <Check
                    className={`h-4 w-4 mr-2 ${plan !== "starter" ? "text-green-500" : "text-muted-foreground"}`}
                  />
                  <span className={`text-sm ${plan === "starter" ? "text-muted-foreground" : ""}`}>
                    Custom domain
                    {plan === "starter" && " (Pro feature)"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Check
                    className={`h-4 w-4 mr-2 ${plan !== "starter" ? "text-green-500" : "text-muted-foreground"}`}
                  />
                  <span className={`text-sm ${plan === "starter" ? "text-muted-foreground" : ""}`}>
                    Advanced forms
                    {plan === "starter" && " (Pro feature)"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Check
                    className={`h-4 w-4 mr-2 ${plan !== "starter" ? "text-green-500" : "text-muted-foreground"}`}
                  />
                  <span className={`text-sm ${plan === "starter" ? "text-muted-foreground" : ""}`}>
                    Email integrations
                    {plan === "starter" && " (Pro feature)"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Check
                    className={`h-4 w-4 mr-2 ${plan === "enterprise" ? "text-green-500" : "text-muted-foreground"}`}
                  />
                  <span className={`text-sm ${plan !== "enterprise" ? "text-muted-foreground" : ""}`}>
                    Priority support
                    {plan !== "enterprise" && " (Enterprise feature)"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {plan === "starter" ? (
                <Button className="w-full" onClick={handleUpgrade}>
                  Upgrade to Pro
                </Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment methods.</CardDescription>
            </CardHeader>
            <CardContent>
              {plan !== "starter" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-md bg-primary/10">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Visa ending in 4242</div>
                        <div className="text-xs text-muted-foreground">Expires 12/2025</div>
                      </div>
                    </div>
                    <Badge>Default</Badge>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      Update Payment Method
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">No payment method</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You're on the free Starter plan. Upgrade to add a payment method.
                  </p>
                  <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Your billing details and address.</CardDescription>
            </CardHeader>
            <CardContent>
              {plan !== "starter" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Name</h4>
                      <p className="text-sm">John Doe</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Email</h4>
                      <p className="text-sm">john@example.com</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Company</h4>
                      <p className="text-sm">Acme Inc.</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">VAT Number</h4>
                      <p className="text-sm">EU123456789</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Address</h4>
                    <p className="text-sm">123 Main St, Anytown, CA 12345, USA</p>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      Update Billing Info
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">No billing information</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You're on the free Starter plan. Upgrade to add billing information.
                  </p>
                  <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your recent invoices and payments.</CardDescription>
            </CardHeader>
            <CardContent>
              {plan !== "starter" && invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{invoice.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                          <Badge
                            variant="outline"
                            className={
                              invoice.status === "paid" ? "bg-green-500/10 text-green-600 border-green-200" : ""
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoice(invoice.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">No billing history</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan === "starter"
                      ? "You're on the free Starter plan. Upgrade to see billing history."
                      : "Your billing history will appear here after your first payment."}
                  </p>
                  {plan === "starter" && <Button onClick={handleUpgrade}>Upgrade to Pro</Button>}
                </div>
              )}
            </CardContent>
            {plan !== "starter" && invoices.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Invoices
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>Are you sure you want to cancel your subscription?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              If you cancel, your subscription will remain active until the end of your current billing period. After
              that, you'll be downgraded to the Starter plan.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-md">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 inline-block mr-1" />
                You'll lose access to premium features like custom domains, advanced forms, and integrations.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={confirmCancelSubscription}>
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

