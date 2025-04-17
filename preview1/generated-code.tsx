Files to create and a new dependency:
1. Install framer-motion
2. src/app/layout.tsx
3. src/app/page.tsx
4. src/components/Header.tsx
5. src/components/Footer.tsx
6. src/components/Gallery.tsx

<lov-add-dependency>
framer-motion
</lov-add-dependency>

<lov-write file="src/app/layout.tsx">
"use client"

import "@/globals.css"
import { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
</lov-write>

<lov-write file="src/app/page.tsx">
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
</lov-write>

<lov-write file="src/components/Header.tsx">
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
</lov-write>

<lov-write file="src/components/Footer.tsx">
"use client"

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} KuoSec ry. All rights reserved.</p>
        <nav className="mt-4 flex justify-center space-x-4">
          <a href="#home" className="hover:text-[#059669]">Home</a>
          <a href="#gallery" className="hover:text-[#059669]">Gallery</a>
          <a href="#about" className="hover:text-[#059669]">About</a>
        </nav>
      </div>
    </footer>
  )
}
</lov-write>

<lov-write file="src/components/Gallery.tsx">
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
</lov-write>