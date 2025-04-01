"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, MessageSquare, CreditCard, BarChart3, Lock, Check, AlertCircle, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

export default function IntegrationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter")
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [integrations, setIntegrations] = useState<any[]>([])
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<string | null>(null)
  const [integrationDetails, setIntegrationDetails] = useState({
    apiKey: "",
    name: "",
    email: "",
  })

  const integrationTypes = [
    {
      id: "email",
      name: "Email Service",
      description: "Connect an email service to send form submissions and notifications.",
      icon: Mail,
      providers: [
        { id: "mailchimp", name: "Mailchimp", requiresApiKey: true },
        { id: "sendgrid", name: "SendGrid", requiresApiKey: true },
        { id: "gmail", name: "Gmail", requiresAuth: true },
      ],
      requiresPro: true,
    },
    {
      id: "forms",
      name: "Form Handlers",
      description: "Connect form handlers to process form submissions.",
      icon: MessageSquare,
      providers: [
        { id: "formspree", name: "Formspree", requiresApiKey: true },
        { id: "netlify", name: "Netlify Forms", requiresApiKey: false },
        { id: "zapier", name: "Zapier", requiresApiKey: true },
      ],
      requiresPro: true,
    },
    {
      id: "payments",
      name: "Payment Processors",
      description: "Connect payment processors to accept payments on your website.",
      icon: CreditCard,
      providers: [
        { id: "stripe", name: "Stripe", requiresApiKey: true },
        { id: "paypal", name: "PayPal", requiresApiKey: true },
      ],
      requiresPro: true,
    },
    {
      id: "analytics",
      name: "Analytics",
      description: "Connect analytics tools to track website performance.",
      icon: BarChart3,
      providers: [
        { id: "google-analytics", name: "Google Analytics", requiresApiKey: true },
        { id: "plausible", name: "Plausible", requiresApiKey: true },
      ],
      requiresPro: true,
    },
  ]

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

    // Mock integrations data
    if (plan !== "starter") {
      setIntegrations([
        {
          id: "1",
          type: "email",
          provider: "mailchimp",
          name: "Newsletter Signup",
          apiKey: "********",
          createdAt: new Date().toISOString(),
          status: "active",
        },
      ])
    }

    setIsLoading(false)
  }, [plan])

  const handleConnectIntegration = (integrationType: string) => {
    if (plan === "starter") {
      setShowUpgradeDialog(true)
      return
    }

    setSelectedIntegrationType(integrationType)
    setShowConnectDialog(true)
  }

  const handleConfirmConnect = () => {
    if (!selectedIntegrationType || !integrationDetails.name) return

    const selectedType = integrationTypes.find((type) => type.id === selectedIntegrationType)
    if (!selectedType) return

    const provider = selectedType.providers[0]

    // Add new integration
    const newIntegration = {
      id: Date.now().toString(),
      type: selectedIntegrationType,
      provider: provider.id,
      name: integrationDetails.name,
      apiKey: integrationDetails.apiKey || "********",
      createdAt: new Date().toISOString(),
      status: "active",
    }

    setIntegrations([...integrations, newIntegration])
    setIntegrationDetails({ apiKey: "", name: "", email: "" })
    setShowConnectDialog(false)

    toast({
      title: "Integration connected",
      description: `${provider.name} has been successfully connected.`,
    })
  }

  const handleDeleteIntegration = (integrationId: string) => {
    setIntegrations(integrations.filter((integration) => integration.id !== integrationId))

    toast({
      title: "Integration removed",
      description: "The integration has been successfully removed.",
    })
  }

  const handleUpgrade = () => {
    setShowUpgradeDialog(false)
    router.push("/upgrade")
  }

  if (isLoading) {
    return <div className="container py-10 px-4 md:px-6">Loading...</div>
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Connect third-party services to enhance your website.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {integrationTypes.map((integrationType) => (
          <Card key={integrationType.id} className="relative overflow-hidden">
            {integrationType.requiresPro && plan === "starter" && (
              <div className="absolute top-0 right-0 p-1 bg-amber-100 dark:bg-amber-900 rounded-bl-lg">
                <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-md bg-primary/10">
                  <integrationType.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{integrationType.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{integrationType.description}</p>
              <div className="space-y-2">
                {integrationType.providers.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between">
                    <span className="text-sm">{provider.name}</span>
                    {integrations.some((i) => i.provider === provider.id) ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline">Available</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleConnectIntegration(integrationType.id)}
                disabled={integrationType.requiresPro && plan === "starter"}
              >
                {integrationType.requiresPro && plan === "starter" ? "Pro Feature" : "Connect"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Integrations</TabsTrigger>
          <TabsTrigger value="available">Available Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {plan === "starter" ? (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <CardTitle className="text-amber-600 dark:text-amber-400">Pro Feature</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300">
                  Integrations are available on Pro and Enterprise plans. Upgrade to connect email services, form
                  handlers, and more.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleUpgrade}>
                  Upgrade to Pro
                </Button>
              </CardFooter>
            </Card>
          ) : integrations.length > 0 ? (
            <div className="grid gap-4">
              {integrations.map((integration) => {
                const integrationType = integrationTypes.find((type) => type.id === integration.type)
                const provider = integrationType?.providers.find((p) => p.id === integration.provider)

                return (
                  <Card key={integration.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {integrationType && (
                            <div className="p-2 rounded-md bg-primary/10">
                              <integrationType.icon className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <CardTitle>{integration.name}</CardTitle>
                            <CardDescription>{provider?.name || "Unknown provider"}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={integration.status === "active" ? "default" : "outline"}
                          className={integration.status === "active" ? "bg-green-500" : "bg-amber-500"}
                        >
                          {integration.status === "active" ? "Active" : "Pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">API Key:</span>
                          <span className="text-sm font-medium">{integration.apiKey}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Connected on:</span>
                          <span className="text-sm font-medium">
                            {new Date(integration.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        Test Connection
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteIntegration(integration.id)}>
                        Remove
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No active integrations</CardTitle>
                <CardDescription>You haven't connected any integrations yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect third-party services to enhance your website functionality.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleConnectIntegration("email")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Connect Integration
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>Explore integrations you can connect to your website.</CardDescription>
            </CardHeader>
            <CardContent>
              {plan === "starter" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Lock className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">Pro Feature</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrations are available on Pro and Enterprise plans.
                  </p>
                  <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {integrationTypes.flatMap((type) =>
                      type.providers
                        .filter((provider) => !integrations.some((i) => i.provider === provider.id))
                        .map((provider) => (
                          <div key={provider.id} className="flex items-center justify-between p-4 border rounded-md">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-md bg-primary/10">
                                <type.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{provider.name}</div>
                                <div className="text-xs text-muted-foreground">{type.name}</div>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => handleConnectIntegration(type.id)}>
                              Connect
                            </Button>
                          </div>
                        )),
                    )}
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 inline-block mr-1" />
                      Need a specific integration? Contact our support team for assistance.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connect Integration Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Integration</DialogTitle>
            <DialogDescription>
              {selectedIntegrationType &&
                integrationTypes.find((type) => type.id === selectedIntegrationType)?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="integration-name">Integration Name</Label>
              <Input
                id="integration-name"
                placeholder="e.g., Newsletter Signup"
                value={integrationDetails.name}
                onChange={(e) => setIntegrationDetails({ ...integrationDetails, name: e.target.value })}
              />
            </div>
            {selectedIntegrationType && (
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <select
                  id="provider"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {integrationTypes
                    .find((type) => type.id === selectedIntegrationType)
                    ?.providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                placeholder="Enter your API key"
                value={integrationDetails.apiKey}
                onChange={(e) => setIntegrationDetails({ ...integrationDetails, apiKey: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">You can find your API key in your provider's dashboard.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmConnect}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>Integrations are available on Pro and Enterprise plans.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Upgrade to Pro to connect email services, form handlers, payment processors, and more.
            </p>
            <Card className="mb-4 border-primary">
              <CardHeader>
                <CardTitle>Pro Plan</CardTitle>
                <CardDescription>Perfect for growing businesses</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Email integrations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Form handlers</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Payment processors</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Analytics tools</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Maybe Later
            </Button>
            <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

