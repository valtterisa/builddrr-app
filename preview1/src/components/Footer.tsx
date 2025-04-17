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