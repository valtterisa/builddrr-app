"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

export function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-12 bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="pt-4 text-2xl md:text-5xl font-bold text-gray-900 text-center mb-2 tracking-tight">
            See what
            <span
              className="mx-3  font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent select-none pointer-events-none relative"
              aria-hidden="true"
            >
              Builddrr
              <span
                className="absolute left-0 right-0 -bottom-0 h-2 bg-gradient-to-r from-purple-600 to-pink-500 opacity-80 pointer-events-none"
                aria-hidden="true"
              />
            </span>
            can do.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative rounded-xl overflow-hidden shadow-xl"
        >
          <div className="relative aspect-video">
            {isPlaying ? (
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/your-video-id?autoplay=1"
                title="builddrr Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="group relative w-20 h-20 rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Play className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-purple-600 group-hover:text-white transition-colors" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">Watch Demo</h3>
                  <p className="text-white/80">2:30 min</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
