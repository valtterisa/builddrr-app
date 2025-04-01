"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

export default function AIBuilderPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) return

    setIsGenerating(true)

    try {
      // In a real implementation, this would call your AI service
      // For now, we'll just simulate a delay and redirect to the editor
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store the prompt in localStorage
      localStorage.setItem("website_prompt", prompt)

      // Redirect to the editor page
      router.push("/editor")
    } catch (error) {
      console.error("Error generating website:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const examples = [
    "A professional portfolio website for a photographer with a gallery and contact form",
    "A restaurant website with menu, location, and online reservation system",
    "A fitness coach website with services, testimonials, and a blog section",
    "A small business website for a local bakery with product showcase and ordering info",
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-700"></div>
            <span className="font-bold text-xl">SiteBuilder</span>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Website Builder</h1>
          <p className="text-xl text-gray-600">
            Describe your ideal website and our AI will create it for you in seconds
          </p>
        </div>

        <Card className="mb-12">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your website
                </label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., I need a professional website for my photography business with a gallery, about page, and contact form..."
                  className="min-h-[150px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800"
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>Generating your website...</>
                ) : (
                  <>
                    Create My Website
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Need inspiration?</h2>
          <p className="text-gray-600">Try one of these examples:</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {examples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 justify-start text-left border-gray-200 hover:border-purple-500 hover:bg-purple-50"
                onClick={() => setPrompt(example)}
              >
                <span>{example}</span>
                <ArrowRight className="ml-auto h-4 w-4 text-purple-500" />
              </Button>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} SiteBuilder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

