"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { AssetManager } from "@/components/asset-manager"
import { getWebsite } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

export default function WebsiteAssetsPage({ params }: { params: { id: string } }) {
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
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{website.name}</h1>
            <p className="text-muted-foreground">Manage website assets</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>Upload and manage images, documents, and other files for your website.</CardDescription>
        </CardHeader>
        <CardContent>
          <AssetManager websiteId={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}

