"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ComputerIcon as Desktop, Smartphone, Tablet, Save, Menu } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { WebsitePreview } from "@/components/website-preview"
import { SectionReorder, type Section } from "@/components/section-reorder"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function PreviewPage() {
  const router = useRouter()
  const [websiteData, setWebsiteData] = useState<any>(null)
  const [viewMode, setViewMode] = useState("desktop")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sections, setSections] = useState<Section[]>([])

  useEffect(() => {
    // Get website data from localStorage
    const data = localStorage.getItem("websiteData")
    if (data) {
      const parsedData = JSON.parse(data)
      // Ensure plan is set (default to starter if not present)
      if (!parsedData.plan) {
        parsedData.plan = "starter"
      }
      setWebsiteData(parsedData)

      // Initialize sections if not already in the data
      if (!parsedData.sections) {
        const defaultSections: Section[] = [
          { id: "hero", name: "Hero Section", visible: true, type: "hero" },
          { id: "about", name: "About Us", visible: true, type: "about" },
          { id: "services", name: "Services/Products", visible: true, type: "services" },
          { id: "gallery", name: "Gallery", visible: true, type: "gallery" },
          { id: "testimonials", name: "Testimonials", visible: true, type: "testimonials" },
          { id: "contact", name: "Contact Form", visible: true, type: "contact" },
        ]
        setSections(defaultSections)
      } else {
        setSections(parsedData.sections)
      }
    } else {
      // If no data, redirect to home
      router.push("/")
    }

    // Check if user is authenticated (in a real app, this would check with your auth provider)
    const checkAuth = localStorage.getItem("isAuthenticated") === "true"
    setIsAuthenticated(checkAuth)
  }, [router])

  const handleSectionReorder = (updatedSections: Section[]) => {
    setSections(updatedSections)

    // Update websiteData with the new sections
    if (websiteData) {
      const updatedData = {
        ...websiteData,
        sections: updatedSections,
      }
      setWebsiteData(updatedData)

      // Save to localStorage
      localStorage.setItem("websiteData", JSON.stringify(updatedData))
    }
  }

  const handlePublish = () => {
    if (isAuthenticated) {
      setShowPublishDialog(true)
    } else {
      setShowAuthModal(true)
    }
  }

  const handleAuthSuccess = () => {
    // In a real app, this would be handled by your auth provider
    localStorage.setItem("isAuthenticated", "true")
    setIsAuthenticated(true)
    setShowAuthModal(false)
    setShowPublishDialog(true)
  }

  const handleConfirmPublish = () => {
    // In a real app, this would send the website data to your backend for publishing
    setTimeout(() => {
      setShowPublishDialog(false)
      router.push("/dashboard")
    }, 1000)
  }

  const handleUpgradeClick = () => {
    router.push("/upgrade")
  }

  if (!websiteData) {
    return <div className="container py-10 px-4 md:px-6">Loading...</div>
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div>
              <h1 className="font-semibold">Preview</h1>
              {websiteData && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {websiteData.plan === "starter" ? "Starter" : websiteData.plan === "pro" ? "Pro" : "Enterprise"}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-4">
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList>
                <TabsTrigger value="mobile">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </TabsTrigger>
                <TabsTrigger value="tablet">
                  <Tablet className="h-4 w-4 mr-2" />
                  Tablet
                </TabsTrigger>
                <TabsTrigger value="desktop">
                  <Desktop className="h-4 w-4 mr-2" />
                  Desktop
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <SectionReorder
              onReorder={handleSectionReorder}
              currentPlan={websiteData.plan}
              onUpgradeClick={handleUpgradeClick}
            />
            <div className="flex items-center gap-2">
              {websiteData && websiteData.plan === "starter" && (
                <Button variant="outline" onClick={handleUpgradeClick}>
                  Upgrade Plan
                </Button>
              )}
              <Button onClick={handlePublish}>
                <Save className="mr-2 h-4 w-4" />
                Publish Website
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[385px]">
                <div className="flex flex-col gap-4 py-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">View Mode</h3>
                    <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="mobile">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Mobile
                        </TabsTrigger>
                        <TabsTrigger value="tablet">
                          <Tablet className="h-4 w-4 mr-2" />
                          Tablet
                        </TabsTrigger>
                        <TabsTrigger value="desktop">
                          <Desktop className="h-4 w-4 mr-2" />
                          Desktop
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Arrange Sections</h3>
                    <SectionReorder
                      onReorder={handleSectionReorder}
                      currentPlan={websiteData.plan}
                      onUpgradeClick={handleUpgradeClick}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Actions</h3>
                    <div className="flex flex-col gap-2">
                      {websiteData && websiteData.plan === "starter" && (
                        <Button variant="outline" onClick={handleUpgradeClick} className="w-full">
                          Upgrade Plan
                        </Button>
                      )}
                      <Button onClick={handlePublish} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Publish Website
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
        <div
          className={`mx-auto my-6 transition-all duration-300 bg-white dark:bg-gray-800 shadow-md ${
            viewMode === "mobile" ? "max-w-[375px]" : viewMode === "tablet" ? "max-w-[768px]" : "max-w-[1200px]"
          }`}
        >
          <WebsitePreview data={{ ...websiteData, sections }} />
        </div>
      </main>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Your Website</DialogTitle>
            <DialogDescription>
              Your website is ready to be published. Once published, it will be live and accessible to everyone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              Website Name: <span className="font-medium">{websiteData.businessName}</span>
            </p>
            <p className="text-sm mt-2">
              Your website will be available at:
              <span className="font-medium block mt-1 text-primary break-all">
                https://siteforge.app/{websiteData.businessName.toLowerCase().replace(/\s+/g, "-")}
              </span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPublish}>Publish Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

