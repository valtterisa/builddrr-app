"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">
        <a href="#" className="text-2xl font-semibold text-[#10B981]">KuoSec ry</a>
        <nav className="hidden md:flex space-x-8">
          {["Home","Gallery","About"].map((item) => (
            <a key={item} href={"#"+item.toLowerCase()} className="text-gray-600 hover:text-[#059669] transition">
              {item}
            </a>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="md:hidden p-2"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          <span className="block w-6 h-0.5 bg-gray-700 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-700 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-700"></span>
        </Button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden overflow-hidden bg-white shadow"
          >
            <ul className="flex flex-col px-4 py-2 space-y-2">
              {["Home","Gallery","About"].map((item) => (
                <li key={item}>
                  <a href={"#"+item.toLowerCase()} className="block text-gray-700 hover:text-[#059669] transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
)
}