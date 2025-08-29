"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, Eye, Star } from "lucide-react";
import { motion } from "framer-motion";

const templates = [
  {
    id: "modern-business",
    name: "Modern Business",
    description: "Clean and professional design for businesses",
    image: "/templates/modern-business.jpg",
    tags: ["Professional", "Clean", "Corporate"],
    rating: 4.8,
    reviews: 124,
    features: [
      "Responsive Design",
      "Contact Form",
      "Testimonials",
      "Services Showcase",
    ],
  },
  {
    id: "creative-portfolio",
    name: "Creative Portfolio",
    description: "Showcase your creative work with style",
    image: "/templates/creative-portfolio.jpg",
    tags: ["Creative", "Portfolio", "Artistic"],
    rating: 4.9,
    reviews: 98,
    features: [
      "Gallery Grid",
      "Project Showcase",
      "About Section",
      "Social Links",
    ],
  },
  {
    id: "restaurant-cafe",
    name: "Restaurant & Café",
    description: "Perfect for food businesses and cafés",
    image: "/templates/restaurant.jpg",
    tags: ["Food", "Restaurant", "Menu"],
    rating: 4.7,
    reviews: 156,
    features: [
      "Menu Display",
      "Reservation System",
      "Food Gallery",
      "Location Map",
    ],
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    description: "Modern design for tech companies and startups",
    image: "/templates/tech-startup.jpg",
    tags: ["Technology", "Startup", "Modern"],
    rating: 4.9,
    reviews: 112,
    features: [
      "Product Showcase",
      "Team Section",
      "Features Grid",
      "Pricing Tables",
    ],
  },
  {
    id: "local-service",
    name: "Local Service",
    description: "Ideal for local service providers",
    image: "/templates/local-service.jpg",
    tags: ["Service", "Local Business", "Professional"],
    rating: 4.6,
    reviews: 89,
    features: [
      "Service Cards",
      "Booking System",
      "Testimonials",
      "FAQ Section",
    ],
  },
  {
    id: "ecommerce-simple",
    name: "Simple Store",
    description: "Showcase your products with this simple store template",
    image: "/templates/ecommerce.jpg",
    tags: ["E-commerce", "Products", "Store"],
    rating: 4.7,
    reviews: 134,
    features: [
      "Product Grid",
      "Shopping Cart",
      "Product Details",
      "Checkout Form",
    ],
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handlePreview = (templateId: string) => {
    router.push(`/templates/${templateId}`);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      localStorage.setItem("selectedTemplate", selectedTemplate);
      router.push("/website/editor");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container py-12 md:px-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-8 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Choose Your Perfect Template
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select a professionally designed template and customize it to match
            your brand
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                className={`overflow-hidden cursor-pointer transition-all duration-300 ${selectedTemplate === template.id
                  ? "ring-2 ring-purple-500 shadow-lg"
                  : "hover:shadow-xl"
                  }`}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
              >
                <div className="relative group">
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={template.image}
                      alt={template.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => handlePreview(template.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview Template
                      </Button>
                    </div>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-2">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {template.rating} ({template.reviews})
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex justify-center"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedTemplate}
            className="px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Continue to Editor
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
