"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const templates = [
  {
    id: 1,
    name: "Modern Portfolio",
    image: "/templates/portfolio.jpg",
    description: "Clean and professional design for showcasing your work",
    rating: 4.9,
    reviews: 128,
    tags: ["Portfolio", "Minimal", "Professional"],
  },
  {
    id: 2,
    name: "E-commerce Store",
    image: "/templates/store.jpg",
    description: "Complete online store with product showcase and cart",
    rating: 4.8,
    reviews: 95,
    tags: ["E-commerce", "Shop", "Products"],
  },
  {
    id: 3,
    name: "Business Website",
    image: "/templates/business.jpg",
    description: "Corporate website with services and contact information",
    rating: 4.7,
    reviews: 76,
    tags: ["Business", "Corporate", "Services"],
  },
];

export function TemplatesCTA() {
  const router = useRouter();

  return (
    <section className="py-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Beautiful Templates to Get You Started
          </h2>
          <p className="text-xl text-gray-600">
            Choose from our collection of professionally designed templates
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={template.image}
                  alt={template.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                <p className="text-gray-600 mb-4">{template.description}</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="font-medium">{template.rating}</span>
                    <span className="text-gray-500 ml-1">
                      ({template.reviews})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-8 py-6 text-lg"
            onClick={() => router.push("/templates")}
          >
            Browse All Templates
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
