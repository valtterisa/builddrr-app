"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file-upload"
import { StorageBucket } from "@/lib/storage"
import { getAssets, deleteAsset, type Asset } from "@/lib/database"
import { Search, Image, FileText, File, Trash2, Copy, ExternalLink, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AssetManagerProps {
  websiteId: string
  onSelectAsset?: (asset: Asset) => void
  className?: string
}

export function AssetManager({ websiteId, onSelectAsset, className }: AssetManagerProps) {
  const { toast } = useToast()
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssets()
  }, [websiteId])

  useEffect(() => {
    filterAssets()
  }, [assets, searchQuery, activeTab])

  const loadAssets = async () => {
    try {
      setLoading(true)
      const data = await getAssets(websiteId)
      setAssets(data)
    } catch (error) {
      console.error("Failed to load assets:", error)
      toast({
        title: "Error loading assets",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAssets = () => {
    let filtered = assets

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((asset) => asset.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by type
    if (activeTab !== "all") {
      filtered = filtered.filter((asset) => {
        if (activeTab === "images") {
          return asset.type.startsWith("image/")
        } else if (activeTab === "documents") {
          return (
            asset.type.includes("pdf") ||
            asset.type.includes("doc") ||
            asset.type.includes("txt") ||
            asset.type.includes("csv")
          )
        } else {
          return (
            !asset.type.startsWith("image/") &&
            !asset.type.includes("pdf") &&
            !asset.type.includes("doc") &&
            !asset.type.includes("txt") &&
            !asset.type.includes("csv")
          )
        }
      })
    }

    setFilteredAssets(filtered)
  }

  const handleDeleteAsset = async (asset: Asset) => {
    try {
      await deleteAsset(asset.id)
      setAssets(assets.filter((a) => a.id !== asset.id))
      toast({
        title: "Asset deleted",
        description: `${asset.name} has been deleted.`,
      })
    } catch (error) {
      console.error("Failed to delete asset:", error)
      toast({
        title: "Error deleting asset",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleCopyUrl = (asset: Asset) => {
    // In a real app, we would get the actual URL from storage
    // For now, we'll just construct a placeholder URL
    const url = `/api/assets/${asset.id}`
    navigator.clipboard.writeText(url)
    toast({
      title: "URL copied",
      description: "Asset URL copied to clipboard.",
    })
  }

  const getAssetIcon = (asset: Asset) => {
    if (asset.type.startsWith("image/")) {
      return <Image className="h-5 w-5" />
    } else if (asset.type.includes("pdf") || asset.type.includes("doc")) {
      return <FileText className="h-5 w-5" />
    } else {
      return <File className="h-5 w-5" />
    }
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={loadAssets} variant="outline" size="icon" title="Refresh">
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <FileUpload
              websiteId={websiteId}
              bucket={StorageBucket.WEBSITE_ASSETS}
              path={`websites/${websiteId}`}
              onUploadComplete={(url, asset) => {
                setAssets([asset, ...assets])
                toast({
                  title: "Upload complete",
                  description: `${asset.name} has been uploaded.`,
                })
              }}
              multiple={true}
              className="mb-6"
            />

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredAssets.map((asset) => (
                  <Card key={asset.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {asset.type.startsWith("image/") ? (
                        // In a real app, we would use the actual image URL
                        <img src={`/api/assets/${asset.id}`} alt={asset.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          {getAssetIcon(asset)}
                          <span className="text-xs mt-2">{asset.type.split("/")[1]}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="truncate pr-2">
                          <p className="font-medium text-sm truncate">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(asset.size)}</p>
                        </div>
                        <div className="flex gap-1">
                          {onSelectAsset && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => onSelectAsset(asset)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopyUrl(asset)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleDeleteAsset(asset)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No assets match your search" : "No assets found"}
              </div>
            )}
          </TabsContent>

          {/* The other tabs will show the same content, filtered by type */}
          <TabsContent value="images" className="mt-4">
            {/* Same content as "all" tab, but filtered for images */}
            <FileUpload
              websiteId={websiteId}
              bucket={StorageBucket.WEBSITE_ASSETS}
              path={`websites/${websiteId}`}
              accept="image/*"
              onUploadComplete={(url, asset) => {
                setAssets([asset, ...assets])
                toast({
                  title: "Upload complete",
                  description: `${asset.name} has been uploaded.`,
                })
              }}
              multiple={true}
              className="mb-6"
            />

            {/* Same asset grid as "all" tab */}
            {/* ... */}
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            {/* Same content as "all" tab, but filtered for documents */}
            <FileUpload
              websiteId={websiteId}
              bucket={StorageBucket.WEBSITE_ASSETS}
              path={`websites/${websiteId}`}
              accept=".pdf,.doc,.docx,.txt,.csv"
              onUploadComplete={(url, asset) => {
                setAssets([asset, ...assets])
                toast({
                  title: "Upload complete",
                  description: `${asset.name} has been uploaded.`,
                })
              }}
              multiple={true}
              className="mb-6"
            />

            {/* Same asset grid as "all" tab */}
            {/* ... */}
          </TabsContent>

          <TabsContent value="other" className="mt-4">
            {/* Same content as "all" tab, but filtered for other file types */}
            <FileUpload
              websiteId={websiteId}
              bucket={StorageBucket.WEBSITE_ASSETS}
              path={`websites/${websiteId}`}
              onUploadComplete={(url, asset) => {
                setAssets([asset, ...assets])
                toast({
                  title: "Upload complete",
                  description: `${asset.name} has been uploaded.`,
                })
              }}
              multiple={true}
              className="mb-6"
            />

            {/* Same asset grid as "all" tab */}
            {/* ... */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

