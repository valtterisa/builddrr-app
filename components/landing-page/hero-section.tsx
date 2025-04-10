"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock,
  LayoutTemplate,
  Headset,
  Rocket,
} from "lucide-react";

export function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/create");
  };

  return (
    <section className="relative py-8 md:py-32 overflow-hidden">
      <div className="container w-full mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Create Your Perfect Website in Minutes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 mb-8"
          >
            No coding required. Just tell us about your business, and our AI
            will create a beautiful, professional website for you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              Create Your Website
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/templates")}
            >
              View Templates
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 bg-white/50 backdrop-blur-sm px-4 md:px-8 py-4 rounded-2xl md:rounded-full shadow-sm w-fit mx-auto"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium">No credit card required</span>
          </div>
          <div className="hidden md:block h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm font-medium">14-day free trial</span>
          </div>
          <div className="hidden md:block h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm font-medium">Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
