"use client"

import { motion } from "framer-motion"

const images = [
  "https://via.placeholder.com/400x300",
  "https://via.placeholder.com/400x300?text=Sec+Event",
  "https://via.placeholder.com/400x300?text=Training",
  "https://via.placeholder.com/400x300?text=Networking",
]

export default function Gallery() {
  return (
    <section id="gallery" aria-label="Image Gallery" className="mb-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {images.map((src, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="overflow-hidden rounded-lg"
          >
            <img src={src} alt={`Gallery image ${i+1}`} className="w-full h-48 object-cover" />
          </motion.div>
        ))}
      </div>
    </section>
  )
}