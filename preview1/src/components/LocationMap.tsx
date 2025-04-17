"use client"
import { motion } from "framer-motion";

export function LocationMap() {
  return (
    <section id="location" className="py-16 bg-white" aria-label="Location">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Find Us</h2>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full h-96 rounded-lg overflow-hidden shadow"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!...Kuopio"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            aria-label="Google Map location"
          />
        </motion.div>
      </div>
    </section>
  );
}
