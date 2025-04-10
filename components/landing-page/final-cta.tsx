"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function FinalCTA() {
  const router = useRouter();

  return (
    <section className="py-8 bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Build Your Website?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Start your 14-day free trial today. No credit card required.
            <br className="hidden md:block" />
            Or talk to our founder directly if you have any questions.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full md:w-auto">
            <Button
              size="lg"
              className="w-full h-14 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 px-6 md:px-8 text-lg"
              onClick={() => router.push("/create")}
            >
              Start Building Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 flex items-center justify-center border-purple-600 text-purple-600 hover:bg-purple-50 px-6 md:px-8 text-lg"
              onClick={() => router.push("/contact")}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Talk to Founder
            </Button>
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
              <span className="text-sm font-medium">
                No credit card required
              </span>
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
        </motion.div>
      </div>
    </section>
  );
}
