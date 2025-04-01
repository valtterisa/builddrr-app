"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, Plus, ArrowUpRight, CreditCard, LinkIcon, Mail, BarChart3, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const router = useRouter()
  const [websiteData, setWebsiteData] = useState<any>(null)
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get website data from localStorage
    const data = localStorage.getItem("websiteData")
    if (data) {
      const parsedData = JSON.parse(data)
      setWebsiteData(parsedData)

      // Set plan
      if (parsedData.plan) {
        setPlan(parsedData.plan)
      }
    }

    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <div className="container py-10 px-4 md:px-6">Loading...</div>
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your SiteForge dashboard.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => router.push("/")}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Website
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{plan}</div>
            <p className="text-xs text-muted-foreground">
              {plan === "starter" ? "Free plan" : plan === "pro" ? "$19/month" : "$49/month"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5%</div>
            <Progress value={5} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Websites */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="col-span-full md:col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Websites</CardTitle>
            <CardDescription>Your recently created or updated websites.</CardDescription>
          </CardHeader>
          <CardContent>
            {websiteData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{websiteData.businessName}</div>
                      <div className="text-sm text-muted-foreground">Created today</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {plan}
                    </Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="/editor">
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Globe className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-1">No websites yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first website to get started.</p>
                <Button onClick={() => router.push("/")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Website
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/websites">View All Websites</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/domains">
                <LinkIcon className="mr-2 h-4 w-4" />
                Set Up Custom Domain
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/integrations">
                <Mail className="mr-2 h-4 w-4" />
                Connect Email Service
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/billing">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {plan === "starter" && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-amber-600 dark:text-amber-400">Upgrade Your Plan</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700 dark:text-amber-300">
              You're currently on the Starter plan. Upgrade to Pro to unlock premium features like custom domains,
              advanced forms, and more.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" asChild>
              <Link href="/upgrade">Upgrade to Pro</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

