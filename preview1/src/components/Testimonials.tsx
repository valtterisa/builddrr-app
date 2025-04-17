"use client"
import { motion } from "framer-motion";

const testimonials = [
  { author: "Maria", text: "Parasta nepalilaista ruokaa Kuopiossa!" },
  { author: "Jukka", text: "Ihana tunnelma ja herkulliset maut." },
  { author: "Anna", text: "Avoin keittiö on todella viihtyisä." },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-gray-50" aria-label="Testimonials">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Customer Reviews</h2>
        <div className="space-y-8 max-w-3xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="bg-white p-6 rounded-lg shadow"
            >
              <p className="text-gray-700 mb-4">"{t.text}"</p>
              <cite className="block text-right font-semibold text-gray-900">- {t.author}</cite>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
