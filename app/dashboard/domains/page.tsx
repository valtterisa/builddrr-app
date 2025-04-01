"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Plus, Check, AlertCircle, Clock, RefreshCw, Lock, ExternalLink } from "lucide-react"
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

export default function DomainsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter")
  const [showAddDomainDialog, setShowAddDomainDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [domains, setDomains] = useState<any[]>([])
  const [newDomain, setNewDomain] = useState("")
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null)
  const [websites, setWebsites] = useState<any[]>([])

  useEffect(() => {
    // Get website data from localStorage
    const data = localStorage.getItem("websiteData")
    if (data) {
      const parsedData = JSON.parse(data)

      // Set plan
      if (parsedData.plan) {
        setPlan(parsedData.plan)
      }

      // Create a mock website entry
      setWebsites([
        {
          id: "1",
          name: parsedData.businessName,
          url: `https://siteforge.app/${parsedData.businessName.toLowerCase().replace(/\s+/g, "-")}`,
        },
      ])

      setSelectedWebsite("1")
    }

    // Mock domains data
    if (plan !== "starter") {
      setDomains([
        {
          id: "1",
          name: "example.com",
          status: "active",
          websiteId: "1",
          ssl: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
    }

    setIsLoading(false)
  }, [plan])

  const handleAddDomain = () => {
    if (plan === "starter") {
      setShowUpgradeDialog(true)
      return
    }

    setShowAddDomainDialog(true)
  }

  const handleConfirmAddDomain = () => {
    if (!newDomain || !selectedWebsite) return

    // Validate domain format
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(newDomain)) {
      toast({
        title: "Invalid domain",
        description: "Please enter a valid domain name (e.g., example.com).",
        variant: "destructive",
      })
      return
    }

    // Add new domain
    const newDomainObj = {
      id: Date.now().toString(),
      name: newDomain,
      status: "pending",
      websiteId: selectedWebsite,
      ssl: false,
      createdAt: new Date().toISOString(),
    }

    setDomains([...domains, newDomainObj])
    setNewDomain("")
    setShowAddDomainDialog(false)

    toast({
      title: "Domain added",
      description: "Your domain has been added and is pending verification.",
    })
  }

  const handleVerifyDomain = (domainId: string) => {
    // Simulate domain verification
    setDomains(domains.map((domain) => (domain.id === domainId ? { ...domain, status: "active", ssl: true } : domain)))

    toast({
      title: "Domain verified",
      description: "Your domain has been successfully verified and is now active.",
    })
  }

  const handleDeleteDomain = (domainId: string) => {
    setDomains(domains.filter((domain) => domain.id !== domainId))

    toast({
      title: "Domain removed",
      description: "Your domain has been successfully removed.",
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
          <h1 className="text-3xl font-bold tracking-tight">Domain Management</h1>
          <p className="text-muted-foreground">Connect custom domains to your websites.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleAddDomain}>
            <Plus className="mr-2 h-4 w-4" />
            Add Domain
          </Button>
        </div>
      </div>

      <Tabs defaultValue="domains" className="space-y-4">
        <TabsList>
          <TabsTrigger value="domains">My Domains</TabsTrigger>
          <TabsTrigger value="dns">DNS Records</TabsTrigger>
          <TabsTrigger value="ssl">SSL Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-4">
          {plan === "starter" ? (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <CardTitle className="text-amber-600 dark:text-amber-400">Custom Domains</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300">
                  Custom domains are available on Pro and Enterprise plans. Upgrade to connect your own domain name to
                  your website.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleUpgrade}>
                  Upgrade to Pro
                </Button>
              </CardFooter>
            </Card>
          ) : domains.length > 0 ? (
            <div className="grid gap-4">
              {domains.map((domain) => (
                <Card key={domain.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{domain.name}</CardTitle>
                      <Badge
                        variant={domain.status === "active" ? "default" : "outline"}
                        className={domain.status === "active" ? "bg-green-500" : "bg-amber-500"}
                      >
                        {domain.status === "active" ? "Active" : "Pending"}
                      </Badge>
                    </div>
                    <CardDescription>Added on {new Date(domain.createdAt).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Connected to:</span>
                        <span className="text-sm font-medium">
                          {websites.find((w) => w.id === domain.websiteId)?.name || "Unknown website"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">SSL Certificate:</span>
                        <div className="flex items-center">
                          {domain.ssl ? (
                            <>
                              <Check className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-amber-500 mr-1" />
                              <span className="text-sm font-medium">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://${domain.name}`, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </Button>
                    <div className="flex gap-2">
                      {domain.status !== "active" && (
                        <Button size="sm" onClick={() => handleVerifyDomain(domain.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteDomain(domain.id)}>
                        Remove
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No domains found</CardTitle>
                <CardDescription>You haven't added any custom domains yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Add a custom domain to make your website accessible at your own domain name.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddDomain}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Domain
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DNS Configuration</CardTitle>
              <CardDescription>Configure DNS records for your domains.</CardDescription>
            </CardHeader>
            <CardContent>
              {plan === "starter" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Lock className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">Pro Feature</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    DNS management is available on Pro and Enterprise plans.
                  </p>
                  <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
                </div>
              ) : domains.length > 0 ? (
                <div className="space-y-4">
                  <div className="border rounded-md">
                    <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                      <div>Type</div>
                      <div>Name</div>
                      <div>Value</div>
                      <div>TTL</div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 p-4 border-b">
                      <div>A</div>
                      <div>@</div>
                      <div>76.76.21.21</div>
                      <div>3600</div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 p-4">
                      <div>CNAME</div>
                      <div>www</div>
                      <div>{domains[0]?.name}</div>
                      <div>3600</div>
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 inline-block mr-1" />
                      DNS changes can take up to 48 hours to propagate globally.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Globe className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">No domains yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add a domain first to manage DNS records.</p>
                  <Button onClick={handleAddDomain}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Domain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ssl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SSL Certificates</CardTitle>
              <CardDescription>Manage SSL certificates for your domains.</CardDescription>
            </CardHeader>
            <CardContent>
              {plan === "starter" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Lock className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">Pro Feature</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    SSL certificate management is available on Pro and Enterprise plans.
                  </p>
                  <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
                </div>
              ) : domains.length > 0 ? (
                <div className="space-y-4">
                  {domains.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <div className="font-medium">{domain.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {domain.ssl
                            ? "Valid until " + new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()
                            : "Pending"}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {domain.ssl ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Button size="sm" onClick={() => handleVerifyDomain(domain.id)}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Issue Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      <Check className="h-4 w-4 inline-block mr-1 text-green-500" />
                      All SSL certificates are automatically renewed 30 days before expiration.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Globe className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">No domains yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add a domain first to manage SSL certificates.</p>
                  <Button onClick={handleAddDomain}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Domain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Domain Dialog */}
      <Dialog open={showAddDomainDialog} onOpenChange={setShowAddDomainDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Domain</DialogTitle>
            <DialogDescription>Connect your own domain name to your website.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your domain without www or http/https (e.g., example.com)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Connect to Website</Label>
              <select
                id="website"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedWebsite || ""}
                onChange={(e) => setSelectedWebsite(e.target.value)}
              >
                <option value="" disabled>
                  Select a website
                </option>
                {websites.map((website) => (
                  <option key={website.id} value={website.id}>
                    {website.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDomainDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddDomain}>Add Domain</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>Custom domains are available on Pro and Enterprise plans.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Upgrade to Pro to connect your own domain names to your websites and access other premium features.
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
                    <span>Custom domains</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>SSL certificates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Advanced forms</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Email integrations</span>
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

