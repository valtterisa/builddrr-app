"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Check,
  Star,
  Layout,
  Palette,
  Code,
  Smartphone,
} from "lucide-react";
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
    previewImages: [
      "/templates/modern-business-1.jpg",
      "/templates/modern-business-2.jpg",
      "/templates/modern-business-3.jpg",
    ],
    sections: [
      {
        title: "Hero Section",
        description:
          "Make a strong first impression with a modern hero section",
      },
      {
        title: "Services",
        description: "Showcase your services with beautiful cards",
      },
      {
        title: "About",
        description: "Tell your story with a clean layout",
      },
      {
        title: "Contact",
        description: "Easy-to-use contact form",
      },
    ],
  },
  // ... other templates with similar structure
];

export default function TemplatePage() {
  const router = useRouter();
  const params = useParams();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const template = templates.find((t) => t.id === params?.id);
    if (template) {
      setSelectedTemplate(template);
    } else {
      router.push("/templates");
    }
  }, [params?.id, router]);

  if (!selectedTemplate) {
    return null;
  }

  const handleSelectTemplate = () => {
    localStorage.setItem("selectedTemplate", selectedTemplate.id);
    router.push("/website/editor");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container py-12 px-4 md:px-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/templates")}
          className="mb-8 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Templates
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          <div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl mb-6">
              <Image
                src={selectedTemplate.previewImages[activeImage]}
                alt={selectedTemplate.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {selectedTemplate.previewImages.map(
                (image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
                      activeImage === index ? "ring-2 ring-purple-500" : ""
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {selectedTemplate.name}
              </h1>
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">
                    {selectedTemplate.rating}
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({selectedTemplate.reviews} reviews)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-lg text-gray-600 mb-8">
                {selectedTemplate.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="p-4">
                  <Layout className="h-6 w-6 text-purple-600 mb-2" />
                  <h3 className="font-semibold mb-1">Responsive Design</h3>
                  <p className="text-sm text-gray-600">
                    Looks great on all devices
                  </p>
                </Card>
                <Card className="p-4">
                  <Palette className="h-6 w-6 text-purple-600 mb-2" />
                  <h3 className="font-semibold mb-1">Customizable</h3>
                  <p className="text-sm text-gray-600">
                    Easy to modify colors and styles
                  </p>
                </Card>
                <Card className="p-4">
                  <Code className="h-6 w-6 text-purple-600 mb-2" />
                  <h3 className="font-semibold mb-1">Clean Code</h3>
                  <p className="text-sm text-gray-600">
                    Well-structured and maintainable
                  </p>
                </Card>
                <Card className="p-4">
                  <Smartphone className="h-6 w-6 text-purple-600 mb-2" />
                  <h3 className="font-semibold mb-1">Mobile First</h3>
                  <p className="text-sm text-gray-600">
                    Optimized for mobile devices
                  </p>
                </Card>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-semibold">Template Sections</h3>
                {selectedTemplate.sections.map(
                  (section: any, index: number) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-purple-600 mr-3 mt-1" />
                      <div>
                        <h4 className="font-medium">{section.title}</h4>
                        <p className="text-sm text-gray-600">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <Button
                onClick={handleSelectTemplate}
                className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Use This Template
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
