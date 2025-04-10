"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Zap, Code, Palette } from "lucide-react";

export function AIBuilderCTA() {
  const router = useRouter();

  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Generation",
      description:
        "Create professional websites in minutes with our advanced AI technology",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "No Coding Required",
      description:
        "Build beautiful websites without writing a single line of code",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Customizable Templates",
      description: "Choose from a variety of modern, responsive templates",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Fast Deployment",
      description: "Get your website live in minutes with one-click deployment",
    },
  ];

  return (
    <section className="py-8 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Let AI Build Your Perfect Website
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our AI-powered website builder creates stunning, professional
              websites in minutes. Just tell us about your business, and we'll
              handle the rest.
            </p>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8">
              <Button
                onClick={() => router.push("/create")}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                Try AI Builder Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full blur-3xl opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
