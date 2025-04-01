"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Upload, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AICreationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    industry: "",
    style: "",
    features: {
      contactForm: true,
      testimonials: false,
      socialMedia: true,
      gallery: false,
      services: true,
    },
    additionalNotes: "",
    document: null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (feature: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: checked,
      },
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, document: e.target.files?.[0] || null }))
    }
  }

  const handleNext = () => {
    if (step === 1 && !formData.businessName) {
      toast({
        title: "Business name required",
        description: "Please enter your business name to continue.",
        variant: "destructive",
      })
      return
    }

    if (step < 3) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push("/")
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    // In a real application, we would send the form data to the server
    // and generate the website using AI

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      // Store the form data in localStorage for the preview page
      localStorage.setItem("websiteData", JSON.stringify(formData))
      router.push("/preview")
    }, 2000)
  }

  return (
    <div className="container max-w-3xl py-10 px-4 md:px-6">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create Your AI-Generated Website</CardTitle>
          <CardDescription>Tell us about your business and we'll generate a custom website for you.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter your business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Business Description/Tagline</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Briefly describe your business or add a tagline"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry or Niche</Label>
                <Select value={formData.industry} onValueChange={(value) => handleSelectChange("industry", value)}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select your industry" />
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="style">Preferred Style</Label>
                <Select value={formData.style} onValueChange={(value) => handleSelectChange("style", value)}>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Select your preferred style" />
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
                <Label>Desired Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="contactForm"
                      checked={formData.features.contactForm}
                      onCheckedChange={(checked) => handleCheckboxChange("contactForm", checked as boolean)}
                    />
                    <Label htmlFor="contactForm">Contact Form</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="testimonials"
                      checked={formData.features.testimonials}
                      onCheckedChange={(checked) => handleCheckboxChange("testimonials", checked as boolean)}
                    />
                    <Label htmlFor="testimonials">Testimonials</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="socialMedia"
                      checked={formData.features.socialMedia}
                      onCheckedChange={(checked) => handleCheckboxChange("socialMedia", checked as boolean)}
                    />
                    <Label htmlFor="socialMedia">Social Media Links</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="gallery"
                      checked={formData.features.gallery}
                      onCheckedChange={(checked) => handleCheckboxChange("gallery", checked as boolean)}
                    />
                    <Label htmlFor="gallery">Image Gallery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="services"
                      checked={formData.features.services}
                      onCheckedChange={(checked) => handleCheckboxChange("services", checked as boolean)}
                    />
                    <Label htmlFor="services">Services/Products Section</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                <Textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  placeholder="Any specific requirements or additional information"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">Upload Business Document (Optional)</Label>
                <div className="mt-1 flex items-center">
                  <label
                    htmlFor="document"
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{formData.document ? (formData.document as File).name : "Upload PDF/Word"}</span>
                    <input
                      id="document"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a document with your business information to help our AI generate better content.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </span>
            ) : step < 3 ? (
              <span className="flex items-center gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate Website
                <Sparkles className="h-4 w-4" />
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

