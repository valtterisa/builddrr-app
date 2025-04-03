"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";

const templates = [
  {
    id: "modern-business",
    name: "Modern Business",
    description: "Clean and professional design for businesses",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["Professional", "Clean", "Corporate"],
  },
  {
    id: "creative-portfolio",
    name: "Creative Portfolio",
    description: "Showcase your creative work with style",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["Creative", "Portfolio", "Artistic"],
  },
  {
    id: "restaurant-cafe",
    name: "Restaurant & Café",
    description: "Perfect for food businesses and cafés",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["Food", "Restaurant", "Menu"],
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    description: "Modern design for tech companies and startups",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["Technology", "Startup", "Modern"],
  },
  {
    id: "local-service",
    name: "Local Service",
    description: "Ideal for local service providers",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["Service", "Local Business", "Professional"],
  },
  {
    id: "ecommerce-simple",
    name: "Simple Store",
    description: "Showcase your products with this simple store template",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["E-commerce", "Products", "Store"],
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      // Store the selected template in localStorage
      localStorage.setItem("selectedTemplate", selectedTemplate);
      router.push("/website/editor");
    }
  };

  return (
    <div className="container py-10 px-4 md:px-6">
      <Button variant="ghost" onClick={() => router.push("/")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose a Template</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Select a template to start customizing your one-page website.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`overflow-hidden cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? "ring-2 ring-primary"
                : "hover:shadow-md"
            }`}
            onClick={() => handleSelectTemplate(template.id)}
          >
            <div className="relative">
              <Image
                src={template.image || "/placeholder.svg"}
                alt={template.name}
                width={600}
                height={400}
                className="w-full h-48 object-cover"
              />
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{template.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!selectedTemplate}
          className="px-6"
        >
          Continue to Editor
        </Button>
      </div>
    </div>
  );
}
