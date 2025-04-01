"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, ArrowRight } from "lucide-react"

export default function TemplatesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  // Mock template data
  const templates = [
    {
      id: 1,
      name: "Business Pro",
      category: "Business",
      image: "/placeholder.svg?height=600&width=450&text=Business%20Pro",
      isPremium: false,
    },
    {
      id: 2,
      name: "Portfolio Plus",
      category: "Portfolio",
      image: "/placeholder.svg?height=600&width=450&text=Portfolio%20Plus",
      isPremium: false,
    },
    {
      id: 3,
      name: "Restaurant Deluxe",
      category: "Restaurant",
      image: "/placeholder.svg?height=600&width=450&text=Restaurant%20Deluxe",
      isPremium: true,
    },
    {
      id: 4,
      name: "E-commerce Shop",
      category: "E-commerce",
      image: "/placeholder.svg?height=600&width=450&text=E-commerce%20Shop",
      isPremium: true,
    },
    {
      id: 5,
      name: "Blog Standard",
      category: "Blog",
      image: "/placeholder.svg?height=600&width=450&text=Blog%20Standard",
      isPremium: false,
    },
    {
      id: 6,
      name: "Fitness Coach",
      category: "Fitness",
      image: "/placeholder.svg?height=600&width=450&text=Fitness%20Coach",
      isPremium: true,
    },
    {
      id: 7,
      name: "Creative Agency",
      category: "Agency",
      image: "/placeholder.svg?height=600&width=450&text=Creative%20Agency",
      isPremium: true,
    },
    {
      id: 8,
      name: "Personal Blog",
      category: "Blog",
      image: "/placeholder.svg?height=600&width=450&text=Personal%20Blog",
      isPremium: false,
    },
    {
      id: 9,
      name: "Landing Page",
      category: "Marketing",
      image: "/placeholder.svg?height=600&width=450&text=Landing%20Page",
      isPremium: false,
    },
  ]

  const categories = [
    "All",
    "Business",
    "Portfolio",
    "E-commerce",
    "Blog",
    "Restaurant",
    "Fitness",
    "Agency",
    "Marketing",
  ]
  const [activeCategory, setActiveCategory] = useState("All")

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "All" || template.category === activeCategory

    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = (templateId: number) => {
    // In a real implementation, you would store the selected template ID
    localStorage.setItem("selected_template_id", templateId.toString())

    // Redirect to the editor
    router.push("/editor")
  }

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

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Website Templates</h1>
          <p className="text-xl text-gray-600">Choose from our collection of professionally designed templates</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" />
            <span className="text-gray-700">Filter:</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className={
                activeCategory === category
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "border-gray-200 text-gray-700 hover:border-purple-500 hover:text-purple-600"
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden group">
              <div className="aspect-[3/4] relative">
                <Image src={template.image || "/placeholder.svg"} alt={template.name} fill className="object-cover" />
                {template.isPremium && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Premium
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    className="bg-white text-gray-900 hover:bg-gray-100"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    Use This Template
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-0 h-8 w-8"
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No templates found matching your search criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setActiveCategory("All")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} SiteBuilder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

