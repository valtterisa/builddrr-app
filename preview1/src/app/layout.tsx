"use client"

import "./globals.css"
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