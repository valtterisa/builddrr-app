"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, Save, Palette, Type, Layout, Menu } from "lucide-react"
import { WebsitePreview } from "@/components/website-preview"
import { SectionReorder } from "@/components/section-reorder"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function EditorPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("content")
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [websiteData, setWebsiteData] = useState({
    businessName: "Your Business Name",
    description: "Your business description or tagline goes here",
    industry: "retail",
    style: "modern",
    features: {
      contactForm: true,
      testimonials: true,
      socialMedia: true,
      gallery: true,
      services: true,
    },
    plan: "starter", // Default to starter plan
  })

  useEffect(() => {
    // Get selected template from localStorage
    const template = localStorage.getItem("selectedTemplate")
    if (template) {
      setTemplateId(template)
    } else {
      // If no template selected, redirect to templates page
      router.push("/create/templates")
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setWebsiteData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setWebsiteData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    setWebsiteData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: enabled,
      },
    }))
  }

  const handlePreview = () => {
    // Store website data in localStorage for preview page
    localStorage.setItem("websiteData", JSON.stringify(websiteData))
    router.push("/preview")
  }

  if (!templateId) {
    return <div className="container py-10 px-4 md:px-6">Loading...</div>
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/create/templates")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="font-semibold">Editor</h1>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-4">
            <SectionReorder
              onReorder={(sections) => {
                console.log("Sections reordered:", sections)
                // In a real implementation, you would update the website data here
              }}
            />
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button onClick={handlePreview}>
              <Save className="mr-2 h-4 w-4" />
              Save & Continue
            </Button>
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
                    <h3 className="text-sm font-medium">Arrange Sections</h3>
                    <SectionReorder
                      onReorder={(sections) => {
                        console.log("Sections reordered:", sections)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Actions</h3>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        {showPreview ? "Hide Preview" : "Show Preview"}
                      </Button>
                      <Button onClick={handlePreview} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Save & Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Editor Sidebar */}
        <div className={`w-full ${showPreview ? "md:w-1/3 lg:w-1/4" : "md:w-full"} border-r overflow-y-auto`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="content">
                <Type className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Content</span>
                <span className="sm:hidden">Content</span>
              </TabsTrigger>
              <TabsTrigger value="style">
                <Palette className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Style</span>
                <span className="sm:hidden">Style</span>
              </TabsTrigger>
              <TabsTrigger value="sections">
                <Layout className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sections</span>
                <span className="sm:hidden">Sections</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Edit your business information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={websiteData.businessName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description/Tagline</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={websiteData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={websiteData.industry}
                      onValueChange={(value) => handleSelectChange("industry", value)}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="professional">Professional Services</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="style" className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Select value={websiteData.style} onValueChange={(value) => handleSelectChange("style", value)}>
                      <SelectTrigger id="style">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="vibrant">Vibrant</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Color Preview</Label>
                    <div className="grid grid-cols-5 gap-2">
                      <div
                        className={`h-10 rounded-md ${
                          websiteData.style === "modern"
                            ? "bg-blue-600"
                            : websiteData.style === "minimalist"
                              ? "bg-gray-900"
                              : websiteData.style === "vibrant"
                                ? "bg-purple-600"
                                : websiteData.style === "professional"
                                  ? "bg-indigo-700"
                                  : websiteData.style === "elegant"
                                    ? "bg-emerald-700"
                                    : "bg-amber-500"
                        }`}
                      ></div>
                      <div
                        className={`h-10 rounded-md ${
                          websiteData.style === "modern"
                            ? "bg-blue-500"
                            : websiteData.style === "minimalist"
                              ? "bg-gray-800"
                              : websiteData.style === "vibrant"
                                ? "bg-purple-500"
                                : websiteData.style === "professional"
                                  ? "bg-indigo-600"
                                  : websiteData.style === "elegant"
                                    ? "bg-emerald-600"
                                    : "bg-amber-400"
                        }`}
                      ></div>
                      <div
                        className={`h-10 rounded-md ${
                          websiteData.style === "modern"
                            ? "bg-blue-400"
                            : websiteData.style === "minimalist"
                              ? "bg-gray-700"
                              : websiteData.style === "vibrant"
                                ? "bg-purple-400"
                                : websiteData.style === "professional"
                                  ? "bg-indigo-500"
                                  : websiteData.style === "elegant"
                                    ? "bg-emerald-500"
                                    : "bg-amber-300"
                        }`}
                      ></div>
                      <div
                        className={`h-10 rounded-md ${
                          websiteData.style === "modern"
                            ? "bg-gray-100"
                            : websiteData.style === "minimalist"
                              ? "bg-gray-50"
                              : websiteData.style === "vibrant"
                                ? "bg-pink-50"
                                : websiteData.style === "professional"
                                  ? "bg-gray-100"
                                  : websiteData.style === "elegant"
                                    ? "bg-emerald-50"
                                    : "bg-amber-50"
                        }`}
                      ></div>
                      <div
                        className={`h-10 rounded-md border ${
                          websiteData.style === "modern"
                            ? "bg-white"
                            : websiteData.style === "minimalist"
                              ? "bg-white"
                              : websiteData.style === "vibrant"
                                ? "bg-white"
                                : websiteData.style === "professional"
                                  ? "bg-white"
                                  : websiteData.style === "elegant"
                                    ? "bg-white"
                                    : "bg-white"
                        }`}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Website Sections</CardTitle>
                  <CardDescription>Enable or disable sections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contactForm" className="cursor-pointer">
                      Contact Form
                    </Label>
                    <div
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                      onClick={() => handleFeatureToggle("contactForm", !websiteData.features.contactForm)}
                    >
                      <span
                        className={`${websiteData.features.contactForm ? "translate-x-6 bg-primary" : "translate-x-1 bg-white"} inline-block h-4 w-4 transform rounded-full transition-transform`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="testimonials" className="cursor-pointer">
                      Testimonials
                    </Label>
                    <div
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                      onClick={() => handleFeatureToggle("testimonials", !websiteData.features.testimonials)}
                    >
                      <span
                        className={`${websiteData.features.testimonials ? "translate-x-6 bg-primary" : "translate-x-1 bg-white"} inline-block h-4 w-4 transform rounded-full transition-transform`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="socialMedia" className="cursor-pointer">
                      Social Media Links
                    </Label>
                    <div
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                      onClick={() => handleFeatureToggle("socialMedia", !websiteData.features.socialMedia)}
                    >
                      <span
                        className={`${websiteData.features.socialMedia ? "translate-x-6 bg-primary" : "translate-x-1 bg-white"} inline-block h-4 w-4 transform rounded-full transition-transform`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gallery" className="cursor-pointer">
                      Image Gallery
                    </Label>
                    <div
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                      onClick={() => handleFeatureToggle("gallery", !websiteData.features.gallery)}
                    >
                      <span
                        className={`${websiteData.features.gallery ? "translate-x-6 bg-primary" : "translate-x-1 bg-white"} inline-block h-4 w-4 transform rounded-full transition-transform`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="services" className="cursor-pointer">
                      Services/Products Section
                    </Label>
                    <div
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                      onClick={() => handleFeatureToggle("services", !websiteData.features.services)}
                    >
                      <span
                        className={`${websiteData.features.services ? "translate-x-6 bg-primary" : "translate-x-1 bg-white"} inline-block h-4 w-4 transform rounded-full transition-transform`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Area - Only shown when showPreview is true */}
        {showPreview && (
          <div className="hidden md:block md:w-2/3 lg:w-3/4 overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="p-6">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <WebsitePreview data={websiteData} />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Preview Button - Only shown on mobile */}
        <div className="md:hidden fixed bottom-4 right-4 z-10">
          <Button onClick={handlePreview} size="lg" className="rounded-full shadow-lg">
            <Eye className="mr-2 h-5 w-5" />
            Preview
          </Button>
        </div>
      </div>
    </div>
  )
}

