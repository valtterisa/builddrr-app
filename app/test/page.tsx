"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Twitter, Instagram, Github } from "lucide-react";

export default function Component() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: "Home", href: "#hero" },
        { name: "About", href: "#about" },
        { name: "Services", href: "#services" },
        { name: "Contact", href: "#contact" },
    ];

    // Animation settings
    const animationProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" },
    };

    return (
        <motion.div
            data-file-location="/app/moro/page.tsx"
            className="min-h-screen flex flex-col bg-white"
            {...animationProps}
        >
            {/* Header */}
            <header
                data-file-location="/app/moro/page.tsx"
                className="bg-[#6B7280] text-white px-6 py-4 shadow-md fixed w-full z-50"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1
                        className="text-2xl font-bold cursor-pointer"
                        aria-label="Moro Brand Logo"
                        data-editable="true"
                    >
                        Moro
                    </h1>
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="hover:text-[#9CA3AF] transition-colors font-medium"
                                aria-label={link.name}
                                data-editable="true"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded hover:bg-[#4B5563] transition-colors"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <nav className="md:hidden mt-4">
                        <ul className="flex flex-col space-y-2">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="block px-4 py-2 hover:bg-[#4B5563] transition-colors rounded"
                                        aria-label={link.name}
                                        data-editable="true"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-grow pt-20">
                {/* Hero Section */}
                <motion.section
                    id="hero"
                    data-file-location="/app/moro/page.tsx"
                    {...animationProps}
                    className="flex flex-col items-center justify-center text-center px-6 py-20 bg-white"
                >
                    <h2
                        className="text-4xl md:text-6xl font-extrabold text-[#4B5563] mb-6"
                        aria-label="Welcome Heading"
                        data-editable="true"
                    >
                        Welcome to Moro
                    </h2>
                    <p
                        className="max-w-2xl text-lg text-[#6B7280] mb-8"
                        aria-label="Business Description"
                        data-editable="true"
                    >
                        ASDASDASDASD
                    </p>
                    <a
                        href="#contact"
                        className="bg-[#9CA3AF] text-white font-semibold py-3 px-6 rounded-full shadow hover:bg-[#4B5563] transition-colors"
                        aria-label="Get In Touch"
                        data-editable="true"
                    >
                        Get In Touch
                    </a>
                </motion.section>

                {/* About Section */}
                <motion.section
                    id="about"
                    data-file-location="/app/moro/page.tsx"
                    {...animationProps}
                    className="px-6 py-16 bg-gray-50"
                >
                    <h3
                        className="text-3xl font-bold text-center text-[#4B5563] mb-4"
                        aria-label="About Moro"
                        data-editable="true"
                    >
                        About Moro
                    </h3>
                    <p
                        className="max-w-3xl mx-auto text-center text-[#6B7280] text-lg"
                        aria-label="About description"
                        data-editable="true"
                    >
                        At Moro, we believe in clean, modern design that merges innovation with functionality.
                        Our approach is centered on seamless user experiences and responsive designs that look
                        stunning on any device.
                    </p>
                </motion.section>

                {/* Services Section */}
                <motion.section
                    id="services"
                    data-file-location="/app/moro/page.tsx"
                    {...animationProps}
                    className="px-6 py-16 bg-white"
                >
                    <h3
                        className="text-3xl font-bold text-center text-[#4B5563] mb-8"
                        aria-label="Our Services"
                        data-editable="true"
                    >
                        Our Services
                    </h3>
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Service Card */}
                        {[1, 2, 3].map((service) => (
                            <motion.div
                                key={service}
                                data-file-location="/app/moro/page.tsx"
                                {...animationProps}
                                className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow"
                            >
                                <h4
                                    className="text-xl font-semibold text-[#4B5563] mb-2"
                                    aria-label={`Service ${service}`}
                                    data-editable="true"
                                >
                                    Service {service}
                                </h4>
                                <p
                                    className="text-[#6B7280] text-base"
                                    aria-label={`Service ${service} description`}
                                    data-editable="true"
                                >
                                    We provide exceptional quality and attention to detail in every project we
                                    undertake.
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Contact Section */}
                <motion.section
                    id="contact"
                    data-file-location="/app/moro/page.tsx"
                    {...animationProps}
                    className="px-6 py-16 bg-gray-50"
                >
                    <h3
                        className="text-3xl font-bold text-center text-[#4B5563] mb-8"
                        aria-label="Contact Us"
                        data-editable="true"
                    >
                        Contact Us
                    </h3>
                    <form
                        action="#"
                        className="max-w-xl mx-auto space-y-6"
                        noValidate
                    >
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[#4B5563]">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#9CA3AF]"
                                aria-label="Your Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#4B5563]">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#9CA3AF]"
                                aria-label="Your Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-[#4B5563]">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#9CA3AF]"
                                aria-label="Your Message"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 rounded-md bg-[#9CA3AF] text-white font-semibold hover:bg-[#4B5563] transition-colors"
                            aria-label="Submit Contact Form"
                        >
                            Submit
                        </button>
                    </form>
                </motion.section>
            </main>

            {/* Footer */}
            <footer
                data-file-location="/app/moro/page.tsx"
                className="bg-[#6B7280] text-white py-8 px-6"
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <p
                        className="text-center text-sm mb-4 md:mb-0"
                        aria-label="Copyright"
                        data-editable="true"
                    >
                        © {new Date().getFullYear()} Moro. All rights reserved.
                    </p>
                    <div className="flex space-x-4">
                        <a
                            href="#"
                            aria-label="Twitter"
                            className="hover:text-[#9CA3AF] transition-colors"
                        >
                            <Twitter size={20} />
                        </a>
                        <a
                            href="#"
                            aria-label="Instagram"
                            className="hover:text-[#9CA3AF] transition-colors"
                        >
                            <Instagram size={20} />
                        </a>
                        <a
                            href="#"
                            aria-label="GitHub"
                            className="hover:text-[#9CA3AF] transition-colors"
                        >
                            <Github size={20} />
                        </a>
                    </div>
                </div>
            </footer>
        </motion.div>
    );
}