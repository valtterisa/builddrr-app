"use client"

import { motion } from "framer-motion"
import Gallery from "@/components/Gallery"

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-5xl mx-auto px-4 py-16"
    >
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[#10B981] mb-4">KuoSec ry</h1>
        <p className="text-lg text-gray-700">
          Infosec community in Kuopio, Finland—meetups, training & networking for everyone interested in security.
        </p>
      </section>
      <Gallery />
    </motion.div>
  )
}