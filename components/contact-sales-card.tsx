"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, Loader2, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContactSalesCardProps {
  isCurrentPlan: boolean
}

export function ContactSalesCard({ isCurrentPlan }: ContactSalesCardProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const enterpriseFeatures = [
    "Everything in Pro",
    "Custom integrations",
    "Dedicated account manager",
    "Priority support",
    "Custom branding",
    "Advanced analytics",
    "Multi-language support",
    "SEO optimization",
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Get form data
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const company = formData.get("company") as string
    const message = formData.get("message") as string

    // In a real implementation, you would send this data to your server
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)

      toast({
        title: "Request submitted",
        description: "Our sales team will contact you shortly.",
      })

      // Reset the form after 2 seconds
      setTimeout(() => {
        setOpen(false)
        setSubmitted(false)
      }, 2000)
    }, 1500)
  }

  return (
    <Card className="flex flex-col border-2 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="pb-8 pt-8">
        <CardTitle className="text-2xl">Enterprise</CardTitle>
        <CardDescription className="text-base mt-2">Custom solution for larger organizations</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">Custom</span>
          <span className="text-muted-foreground text-lg"> pricing</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 px-8">
        <ul className="space-y-4">
          {enterpriseFeatures.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="px-8 pb-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="w-full text-base py-6"
              variant={isCurrentPlan ? "outline" : "outline"}
              disabled={isCurrentPlan}
            >
              {isCurrentPlan ? "Current Plan" : "Contact Sales"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Contact our sales team</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Fill out the form below and our team will get back to you within 24 hours.
              </DialogDescription>
            </DialogHeader>
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="rounded-full bg-green-100 p-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-center text-lg font-medium">
                  Thank you for your interest! Our sales team will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">
                    Name
                  </Label>
                  <Input id="name" name="name" className="h-12" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">
                    Email
                  </Label>
                  <Input id="email" name="email" type="email" className="h-12" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-base">
                    Company
                  </Label>
                  <Input id="company" name="company" className="h-12" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your needs and requirements"
                    className="min-h-[120px] text-base"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading} className="w-full h-12 text-base">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-5 w-5" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

