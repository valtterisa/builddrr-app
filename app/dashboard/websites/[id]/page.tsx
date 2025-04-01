"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, ExternalLink, Globe, Image, Settings, Eye } from "lucide-react"
import { getWebsite, updateWebsite } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

export default function WebsiteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [website, setWebsite] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadWebsite = async () => {
      try {
        setLoading(true)
        const data = await getWebsite(params.id)
        setWebsite(data)
      } catch (error) {
        console.error("Failed to load website:", error)
        toast({
          title: "Error loading website",
          description: (error as Error).message,
          variant: "destructive",
        })
        router.push("/dashboard/websites")
      } finally {
        setLoading(false)
      }
    }

    loadWebsite()
  }, [params.id, router, toast])

  const handlePublish = async () => {
    try {
      const updatedWebsite = await updateWebsite(params.id, { published: !website.published })
      setWebsite(updatedWebsite)
      toast({
        title: updatedWebsite.published ? "Website published" : "Website unpublished",
        description: updatedWebsite.published
          ? "Your website is now live and accessible to visitors."
          : "Your website is now offline and not accessible to visitors.",
      })
    } catch (error) {
      console.error("Failed to update website:", error)
      toast({
        title: "Error updating website",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-10 px-4 md:px-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="space-y-2">
            <div className="h-4 w-[250px] rounded-md bg-muted"></div>
            <div className="h-4 w-[200px] rounded-md bg-muted"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.push("/dashboard/websites")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{website.name}</h1>
            <p className="text-muted-foreground">
              {website.published ? "Published" : "Draft"} • Last updated{" "}
              {new Date(website.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/editor?id=${params.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={handlePublish}>
            <Globe className="mr-2 h-4 w-4" />
            {website.published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Website Preview</CardTitle>
            <CardDescription>Preview how your website looks to visitors.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video bg-muted relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="h-12 w-12 text-muted-foreground/50" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push(`/preview?id=${params.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            {website.published && (
              <Button variant="outline" onClick={() => window.open(`/sites/${params.id}`, "_blank")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website Assets</CardTitle>
              <CardDescription>Manage images, documents, and other files for your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upload and manage assets that you can use in your website content.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push(`/dashboard/websites/${params.id}/assets`)}>
                <Image className="mr-2 h-4 w-4" />
                Manage Assets
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Website Settings</CardTitle>
              <CardDescription>Configure settings for your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Update your website name, description, and other settings.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push(`/dashboard/websites/${params.id}/settings`)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="mt-8">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Analytics</CardTitle>
              <CardDescription>View statistics and insights about your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Total Visits</p>
                    <p className="text-2xl font-bold">{website.visits}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Average Time on Page</p>
                    <p className="text-2xl font-bold">2m 34s</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Bounce Rate</p>
                    <p className="text-2xl font-bold">42%</p>
                  </div>
                </div>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Analytics chart will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="domains" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Domains</CardTitle>
              <CardDescription>Connect custom domains to your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {website.plan === "starter"
                  ? "Upgrade to Pro to connect custom domains to your website."
                  : "Connect your own domain name to make your website more professional."}
              </p>
              <Button
                onClick={() => router.push(`/dashboard/domains?websiteId=${params.id}`)}
                disabled={website.plan === "starter"}
              >
                Manage Domains
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect third-party services to your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {website.plan === "starter"
                  ? "Upgrade to Pro to connect integrations to your website."
                  : "Connect email services, analytics tools, and more to enhance your website."}
              </p>
              <Button
                onClick={() => router.push(`/dashboard/integrations?websiteId=${params.id}`)}
                disabled={website.plan === "starter"}
              >
                Manage Integrations
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

