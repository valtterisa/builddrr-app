"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Send, Menu, X, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EditableText } from "@/components/editable-text"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { Check } from "lucide-react"
import type { Section } from "@/components/section-reorder"

interface WebsitePreviewProps {
  data: {
    businessName: string
    description: string
    industry: string
    style: string
    features: {
      contactForm: boolean
      testimonials: boolean
      socialMedia: boolean
      gallery: boolean
      services: boolean
    }
    plan?: "starter" | "pro" | "enterprise"
    sections?: Section[]
  }
  editable?: boolean
}

export function WebsitePreview({ data, editable = true }: WebsitePreviewProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [featureToUpgrade, setFeatureToUpgrade] = useState<string>("")
  const [styleClasses, setStyleClasses] = useState({
    primary: "bg-blue-600",
    secondary: "bg-gray-100",
    text: "text-gray-800",
    accent: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
  })

  // Set default plan to starter if not provided
  const plan = data.plan || "starter"

  // Use sections from data if available, otherwise use default order
  const sections = data.sections || [
    { id: "hero", name: "Hero Section", visible: true, type: "hero" },
    { id: "about", name: "About Us", visible: true, type: "about" },
    { id: "services", name: "Services/Products", visible: true, type: "services" },
    { id: "gallery", name: "Gallery", visible: true, type: "gallery" },
    { id: "testimonials", name: "Testimonials", visible: true, type: "testimonials" },
    { id: "contact", name: "Contact Form", visible: true, type: "contact" },
  ]

  useEffect(() => {
    // Set style based on selected style
    if (data.style === "modern") {
      setStyleClasses({
        primary: "bg-blue-600",
        secondary: "bg-gray-100",
        text: "text-gray-800",
        accent: "text-blue-600",
        button: "bg-blue-600 hover:bg-blue-700",
      })
    } else if (data.style === "minimalist") {
      setStyleClasses({
        primary: "bg-gray-900",
        secondary: "bg-gray-50",
        text: "text-gray-800",
        accent: "text-gray-900",
        button: "bg-gray-900 hover:bg-gray-800",
      })
    } else if (data.style === "vibrant") {
      setStyleClasses({
        primary: "bg-purple-600",
        secondary: "bg-pink-50",
        text: "text-gray-800",
        accent: "text-purple-600",
        button: "bg-purple-600 hover:bg-purple-700",
      })
    } else if (data.style === "professional") {
      setStyleClasses({
        primary: "bg-indigo-700",
        secondary: "bg-gray-100",
        text: "text-gray-800",
        accent: "text-indigo-700",
        button: "bg-indigo-700 hover:bg-indigo-800",
      })
    } else if (data.style === "elegant") {
      setStyleClasses({
        primary: "bg-emerald-700",
        secondary: "bg-emerald-50",
        text: "text-gray-800",
        accent: "text-emerald-700",
        button: "bg-emerald-700 hover:bg-emerald-800",
      })
    } else if (data.style === "playful") {
      setStyleClasses({
        primary: "bg-amber-500",
        secondary: "bg-amber-50",
        text: "text-gray-800",
        accent: "text-amber-500",
        button: "bg-amber-500 hover:bg-amber-600",
      })
    }
  }, [data.style])

  // Generate placeholder content based on industry
  const getIndustryContent = () => {
    switch (data.industry) {
      case "restaurant":
        return {
          title: "Our Menu",
          items: [
            { name: "Signature Dish", description: "Our most popular dish with fresh ingredients", price: "$18.99" },
            { name: "Chef's Special", description: "Daily special prepared by our head chef", price: "$22.99" },
            { name: "Vegetarian Delight", description: "A perfect blend of seasonal vegetables", price: "$16.99" },
          ],
        }
      case "retail":
        return {
          title: "Featured Products",
          items: [
            { name: "Premium Item", description: "Our best-selling product with top quality", price: "$49.99" },
            { name: "New Arrival", description: "Just added to our collection", price: "$39.99" },
            { name: "Limited Edition", description: "Get it while supplies last", price: "$59.99" },
          ],
        }
      case "professional":
        return {
          title: "Our Services",
          items: [
            { name: "Consultation", description: "Professional advice tailored to your needs", price: "From $99" },
            { name: "Full Service", description: "Comprehensive solution for your business", price: "From $299" },
            { name: "Maintenance", description: "Ongoing support and maintenance", price: "From $49/mo" },
          ],
        }
      default:
        return {
          title: "What We Offer",
          items: [
            { name: "Service One", description: "High-quality service tailored to your needs", price: "Contact us" },
            { name: "Service Two", description: "Professional solutions for your requirements", price: "Contact us" },
            { name: "Service Three", description: "Custom options available upon request", price: "Contact us" },
          ],
        }
    }
  }

  const industryContent = getIndustryContent()

  // Generate testimonials
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Customer",
      content: "I've been extremely satisfied with the service. The team is professional and responsive.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Sarah Williams",
      role: "Client",
      content: "Outstanding quality and attention to detail. I highly recommend their services to anyone.",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      name: "Michael Brown",
      role: "Partner",
      content: "A pleasure to work with. Their expertise and dedication are truly impressive.",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  const handleUpgradePrompt = (feature: string) => {
    setFeatureToUpgrade(feature)
    setShowUpgradeDialog(true)
  }

  // Check if a feature is available on the current plan
  const isFeatureAvailable = (feature: string): boolean => {
    if (plan === "enterprise") return true

    if (plan === "pro") {
      // Features available on Pro plan
      return !["advanced_analytics", "priority_support", "multi_language", "seo_optimization"].includes(feature)
    }

    if (plan === "starter") {
      // Features available on Starter plan
      return ![
        "contact_form",
        "testimonials",
        "custom_domain",
        "analytics",
        "priority_support",
        "multi_language",
        "seo_optimization",
        "advanced_forms",
        "advanced_gallery",
        "newsletter",
        "map",
      ].includes(feature)
    }

    return false
  }

  // Render a section based on its type
  const renderSection = (section: Section) => {
    if (!section.visible) return null

    switch (section.type) {
      case "hero":
        return renderHeroSection()
      case "about":
        return renderAboutSection()
      case "services":
        return data.features.services ? renderServicesSection() : null
      case "gallery":
        return data.features.gallery ? renderGallerySection() : null
      case "testimonials":
        return data.features.testimonials ? renderTestimonialsSection() : null
      case "contact":
        return data.features.contactForm ? renderContactSection() : null
      case "advanced-gallery":
        return renderAdvancedGallerySection()
      case "contact-form":
        return renderAdvancedContactForm()
      case "newsletter":
        return renderNewsletterSection()
      case "map":
        return renderMapSection()
      case "team":
        return renderTeamSection()
      case "faq":
        return renderFaqSection()
      case "pricing":
        return renderPricingSection()
      default:
        return renderCustomSection(section)
    }
  }

  // Section renderers
  const renderHeroSection = () => (
    <section className={`${styleClasses.primary} text-white py-16 md:py-24`}>
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          <EditableText initialValue={data.businessName} tag="h1" className="inline-block" disabled={!editable} />
        </h1>
        <div className="text-xl md:text-2xl max-w-2xl mx-auto mb-8">
          <EditableText
            initialValue={data.description || "Welcome to our business"}
            tag="span"
            className="inline-block"
            disabled={!editable}
          />
        </div>
        <div className="flex justify-center gap-4">
          <Button className={`${styleClasses.button} text-white border border-white`}>Learn More</Button>
          {data.features.contactForm && (
            <Button
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white hover:text-black"
            >
              Contact Us
            </Button>
          )}
        </div>
      </div>
    </section>
  )

  const renderAboutSection = () => (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
          <EditableText initialValue="About Us" tag="h2" className="inline-block" disabled={!editable} />
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <img src="/placeholder.svg?height=400&width=600" alt="About Us" className="rounded-lg shadow-md w-full" />
          </div>
          <div className="md:w-1/2">
            <h3 className="text-2xl font-semibold mb-4">
              <EditableText initialValue="Our Story" tag="h3" disabled={!editable} />
            </h3>
            <div className="mb-4">
              <EditableText
                initialValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor."
                tag="span"
                disabled={!editable}
              />
            </div>
            <div>
              <EditableText
                initialValue="Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio."
                tag="p"
                disabled={!editable}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const renderServicesSection = () => (
    <section id="services" className={`py-16 ${styleClasses.secondary}`}>
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
          <EditableText initialValue={industryContent.title} tag="h2" className="inline-block" disabled={!editable} />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {industryContent.items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(item.name)}`}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  <EditableText initialValue={item.name} tag="h3" disabled={!editable} />
                </h3>
                <div className="text-gray-600 mb-4">
                  <EditableText initialValue={item.description} tag="span" disabled={!editable} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">
                    <EditableText initialValue={item.price} tag="span" disabled={!editable} />
                  </span>
                  <Button className={styleClasses.button}>Learn More</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  const renderGallerySection = () => (
    <section id="gallery" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
          <EditableText initialValue="Gallery" tag="h2" className="inline-block" disabled={!editable} />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="overflow-hidden rounded-lg shadow-md">
              <img
                src={`/placeholder.svg?height=300&width=400&text=Gallery+Image+${item}`}
                alt={`Gallery Image ${item}`}
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  const renderTestimonialsSection = () => {
    if (data.features.testimonials) {
      if (isFeatureAvailable("testimonials")) {
        return (
          <section id="testimonials" className={`py-16 ${styleClasses.secondary}`}>
            <div className="container mx-auto px-4">
              <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
                <EditableText
                  initialValue="What Our Clients Say"
                  tag="h2"
                  className="inline-block"
                  disabled={!editable}
                />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-semibold">
                          <EditableText initialValue={testimonial.name} tag="h3" disabled={!editable} />
                        </h3>
                        <p className="text-sm text-gray-600">
                          <EditableText initialValue={testimonial.role} tag="p" disabled={!editable} />
                        </p>
                      </div>
                    </div>
                    <div className="italic text-gray-700">
                      <EditableText initialValue={`"${testimonial.content}"`} tag="span" disabled={!editable} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      } else {
        return (
          <section id="testimonials" className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-white p-8 rounded-lg shadow-md border border-dashed border-gray-300">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Testimonials Section</h2>
                  <p className="text-gray-600 mb-6">
                    Showcase customer testimonials to build trust and credibility. This feature is available on Pro and
                    Enterprise plans.
                  </p>
                  <Button onClick={() => handleUpgradePrompt("testimonials")} className={styleClasses.button}>
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )
      }
    }
    return null
  }

  const renderContactSection = () => {
    if (data.features.contactForm) {
      if (isFeatureAvailable("contact_form")) {
        return (
          <section id="contact" className="py-16">
            <div className="container mx-auto px-4">
              <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
                <EditableText initialValue="Contact Us" tag="h2" className="inline-block" disabled={!editable} />
              </h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <form className="space-y-4">
                    <div>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div>
                      <Input id="email" type="email" placeholder="Your email" />
                    </div>
                    <div>
                      <Textarea id="message" placeholder="Your message" rows={5} />
                    </div>
                    <Button className={styleClasses.button}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </form>
                </div>
                <div className="md:w-1/2">
                  <div className="bg-gray-100 p-6 rounded-lg h-full">
                    <h3 className="text-xl font-semibold mb-4">
                      <EditableText initialValue="Get in Touch" tag="h3" disabled={!editable} />
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <MapPin className="mr-3 h-5 w-5 text-gray-600" />
                        <span>
                          <EditableText
                            initialValue="123 Business Street, City, Country"
                            tag="span"
                            disabled={!editable}
                          />
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="mr-3 h-5 w-5 text-gray-600" />
                        <span>
                          <EditableText initialValue="(123) 456-7890" tag="span" disabled={!editable} />
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="mr-3 h-5 w-5 text-gray-600" />
                        <span>
                          <EditableText
                            initialValue={`contact@${data.businessName.toLowerCase().replace(/\s+/g, "")}.com`}
                            tag="span"
                            disabled={!editable}
                          />
                        </span>
                      </div>
                    </div>
                    {data.features.socialMedia && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Follow Us</h4>
                        <div className="flex space-x-4">
                          <a href="#" className="text-gray-600 hover:text-blue-600">
                            <Facebook className="h-6 w-6" />
                          </a>
                          <a href="#" className="text-gray-600 hover:text-blue-400">
                            <Twitter className="h-6 w-6" />
                          </a>
                          <a href="#" className="text-gray-600 hover:text-pink-600">
                            <Instagram className="h-6 w-6" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      } else {
        return (
          <section id="contact" className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-white p-8 rounded-lg shadow-md border border-dashed border-gray-300">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Contact Form</h2>
                  <p className="text-gray-600 mb-6">
                    Add a contact form to your website to collect leads and inquiries. This feature is available on Pro
                    and Enterprise plans.
                  </p>
                  <Button onClick={() => handleUpgradePrompt("contact_form")} className={styleClasses.button}>
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )
      }
    }
    return null
  }

  // Pro plan sections
  const renderAdvancedGallerySection = () => {
    if (isFeatureAvailable("advanced_gallery")) {
      return (
        <section id="advanced-gallery" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
              <EditableText initialValue="Image Gallery" tag="h2" className="inline-block" disabled={!editable} />
            </h2>
            <div className="relative">
              <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 space-x-4 scrollbar-hide">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="snap-center shrink-0 first:pl-4 last:pr-4">
                    <img
                      src={`/placeholder.svg?height=400&width=600&text=Gallery+Image+${item}`}
                      alt={`Gallery Image ${item}`}
                      className="w-80 h-60 object-cover rounded-lg shadow-md"
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-y-0 left-0 flex items-center">
                <Button variant="outline" size="icon" className="rounded-full bg-white/80 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Button>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button variant="outline" size="icon" className="rounded-full bg-white/80 shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )
    } else {
      return (
        <section id="advanced-gallery" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white p-8 rounded-lg shadow-md border border-dashed border-gray-300">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Advanced Gallery</h2>
                <p className="text-gray-600 mb-6">
                  Showcase your work with an interactive slideshow gallery. This feature is available on Pro and
                  Enterprise plans.
                </p>
                <Button onClick={() => handleUpgradePrompt("advanced_gallery")} className={styleClasses.button}>
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        </section>
      )
    }
  }

  const renderAdvancedContactForm = () => {
    if (isFeatureAvailable("advanced_forms")) {
      return (
        <section id="advanced-contact" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
              <EditableText initialValue="Get in Touch" tag="h2" className="inline-block" disabled={!editable} />
            </h2>
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="(123) 456-7890" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your message" rows={5} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button className={styleClasses.button}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )
    } else {
      return (
        <section id="advanced-contact" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white p-8 rounded-lg shadow-md border border-dashed border-gray-300">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Advanced Contact Form</h2>
                <p className="text-gray-600 mb-6">
                  Collect detailed information with our advanced contact form. This feature is available on Pro and
                  Enterprise plans.
                </p>
                <Button onClick={() => handleUpgradePrompt("advanced_forms")} className={styleClasses.button}>
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        </section>
      )
    }
  }

  const renderNewsletterSection = () => {
    if (isFeatureAvailable("newsletter")) {
      return (
        <section id="newsletter" className={`py-16 ${styleClasses.primary} text-white`}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              <EditableText
                initialValue="Subscribe to Our Newsletter"
                tag="h2"
                className="inline-block"
                disabled={!editable}
              />
            </h2>
            <p className="max-w-2xl mx-auto mb-8">
              <EditableText
                initialValue="Stay updated with our latest news, offers, and updates. We promise not to spam your inbox!"
                tag="p"
                disabled={!editable}
              />
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <Input placeholder="Your email address" className="bg-white text-gray-800 border-0" />
              <Button variant="outline" className="bg-white text-primary hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      )
    } else {
      return (
        <section id="newsletter" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white p-8 rounded-lg shadow-md border border-dashed border-gray-300">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Newsletter Signup</h2>
                <p className="text-gray-600 mb-6">
                  Collect email subscribers with a newsletter signup form. This feature is available on Pro and
                  Enterprise plans.
                </p>
                <Button onClick={() => handleUpgradePrompt("newsletter")} className={styleClasses.button}>
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        </section>
      )
    }
  }

  const renderMapSection = () => {
    if (isFeatureAvailable("map")) {
      return (
        <section id="map" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
              <EditableText initialValue="Find Us" tag="h2" className="inline-block" disabled={!editable} />
            </h2>
            <div className="bg-gray-200 rounded-lg overflow-hidden h-80 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="font-medium">Interactive Map (Pro Feature)</p>
                  <p className="text-sm text-gray-600">Map would be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )
    } else {
      return (
        <section id="map" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white p-8 rounded-lg shadow-md border border-dashed border-gray-300">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Location Map</h2>
                <p className="text-gray-600 mb-6">
                  Show your business location with an interactive map. This feature is available on Pro and Enterprise
                  plans.
                </p>
                <Button onClick={() => handleUpgradePrompt("map")} className={styleClasses.button}>
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        </section>
      )
    }
  }

  // Additional sections
  const renderTeamSection = () => (
    <section id="team" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
          <EditableText initialValue="Our Team" tag="h2" className="inline-block" disabled={!editable} />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden text-center">
              <img
                src={`/placeholder.svg?height=300&width=300&text=Team+Member+${item}`}
                alt={`Team Member ${item}`}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">
                  <EditableText initialValue={`Team Member ${item}`} tag="h3" disabled={!editable} />
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  <EditableText initialValue={`Position ${item}`} tag="p" disabled={!editable} />
                </p>
                <p className="text-sm text-gray-500">
                  <EditableText
                    initialValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                    tag="p"
                    disabled={!editable}
                  />
                </p>
                <div className="mt-4 flex justify-center space-x-3">
                  <a href="#" className="text-gray-400 hover:text-blue-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-pink-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  const renderFaqSection = () => (
    <section id="faq" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
          <EditableText
            initialValue="Frequently Asked Questions"
            tag="h2"
            className="inline-block"
            disabled={!editable}
          />
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-3">
                <EditableText initialValue={`Question ${item}?`} tag="h3" disabled={!editable} />
              </h3>
              <div className="text-gray-600">
                <EditableText
                  initialValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula."
                  tag="p"
                  disabled={!editable}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  const renderPricingSection = () => (
    <section id="pricing" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
          <EditableText initialValue="Our Pricing" tag="h2" className="inline-block" disabled={!editable} />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Basic", price: "$9.99", popular: false },
            { name: "Standard", price: "$19.99", popular: true },
            { name: "Premium", price: "$29.99", popular: false },
          ].map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                plan.popular ? "border-2 border-primary relative" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-center">
                  <EditableText initialValue={plan.name} tag="h3" disabled={!editable} />
                </h3>
                <div className="text-3xl font-bold text-center mb-6">
                  <EditableText initialValue={plan.price} tag="span" disabled={!editable} />
                  <span className="text-sm text-gray-500 font-normal">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {[1, 2, 3, 4].map((item) => (
                    <li key={item} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>
                        <EditableText initialValue={`Feature ${item}`} tag="span" disabled={!editable} />
                      </span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${styleClasses.button}`}>Get Started</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  const renderCustomSection = (section: Section) => (
    <section id={section.id} className="py-16">
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold mb-8 text-center ${styleClasses.accent}`}>
          <EditableText initialValue={section.name} tag="h2" className="inline-block" disabled={!editable} />
        </h2>
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center text-gray-500">
            <EditableText
              initialValue="This is a custom section. Click to edit this text and add your own content here."
              tag="p"
              disabled={!editable}
            />
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className={`${styleClasses.primary} text-white`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">
              <EditableText initialValue={data.businessName} tag="span" disabled={!editable} />
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#about" className="hover:underline">
                About
              </a>
              {data.features.services && (
                <a href="#services" className="hover:underline">
                  Services
                </a>
              )}
              {data.features.gallery && (
                <a href="#gallery" className="hover:underline">
                  Gallery
                </a>
              )}
              {data.features.testimonials && (
                <a href="#testimonials" className="hover:underline">
                  Testimonials
                </a>
              )}
              {data.features.contactForm && (
                <a href="#contact" className="hover:underline">
                  Contact
                </a>
              )}
            </div>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <a href="#about" className="block hover:underline">
                About
              </a>
              {data.features.services && (
                <a href="#services" className="block hover:underline">
                  Services
                </a>
              )}
              {data.features.gallery && (
                <a href="#gallery" className="block hover:underline">
                  Gallery
                </a>
              )}
              {data.features.testimonials && (
                <a href="#testimonials" className="block hover:underline">
                  Testimonials
                </a>
              )}
              {data.features.contactForm && (
                <a href="#contact" className="block hover:underline">
                  Contact
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Render sections based on order in sections array */}
      {sections.map((section) => (
        <div key={section.id}>{renderSection(section)}</div>
      ))}

      {/* Footer */}
      <footer className={`${styleClasses.primary} text-white py-8`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">
                <EditableText initialValue={data.businessName} tag="h3" disabled={!editable} />
              </h3>
              <div className="mt-2 text-sm opacity-80">
                <EditableText initialValue={data.description} tag="span" disabled={!editable} />
              </div>
            </div>
            {data.features.socialMedia && (
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:opacity-80">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-white hover:opacity-80">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-white hover:opacity-80">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-white/20 text-center text-sm opacity-80">
            <p>
              © {new Date().getFullYear()} {data.businessName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>Unlock premium features to enhance your website</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              The{" "}
              {featureToUpgrade === "contact_form"
                ? "Contact Form"
                : featureToUpgrade === "testimonials"
                  ? "Testimonials"
                  : featureToUpgrade === "advanced_gallery"
                    ? "Advanced Gallery"
                    : featureToUpgrade === "advanced_forms"
                      ? "Advanced Contact Form"
                      : featureToUpgrade === "newsletter"
                        ? "Newsletter Signup"
                        : featureToUpgrade === "map"
                          ? "Location Map"
                          : "Premium"}{" "}
              feature is available on our Pro and Enterprise plans.
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
                    <span>Contact forms</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Testimonials section</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Advanced galleries</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span>Newsletter signup</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/signup" className="w-full">
                  <Button className="w-full">Upgrade to Pro</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

