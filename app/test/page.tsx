"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type TeamMember = {
    name: string;
    role: string;
    image: string;
};

const teamMembers: TeamMember[] = [
    { name: "Alice Johnson", role: "CEO", image: "https://placehold.co/200x200" },
    { name: "Bob Smith", role: "CTO", image: "https://placehold.co/200x200" },
    { name: "Charlie Davis", role: "Lead Designer", image: "https://placehold.co/200x200" },
];

export default function Component() {
    const [navOpen, setNavOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function toggleNav() {
        setNavOpen((prev) => !prev);
    }

    function smoothScroll(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setNavOpen(false);
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        const message = formData.get("message")?.toString().trim();

        if (!name || !email || !message) {
            setError("All fields are required.");
            return;
        }

        setError(null);
        setLoading(true);
        // Simulate async form submission
        setTimeout(() => {
            setLoading(false);
            e.currentTarget.reset();
            alert("Thank you for contacting us!");
        }, 2000);
    }

    return (
        <motion.div
            data-file-location="/app/page.tsx"
            className="min-h-screen font-sans text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/** HEADER */}
            <header className="sticky top-0 z-50" style={{ backgroundColor: "#6B7280" }}>
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <Link href="/" className="text-xl font-bold text-white" aria-label="Logo" data-editable="true">
                        asdasdasd
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        <a
                            href="#home"
                            onClick={(e) => smoothScroll(e, "home")}
                            className="text-white hover:text-[#9CA3AF] transition-colors"
                            aria-label="Home"
                            data-editable="true"
                        >
                            Home
                        </a>
                        <a
                            href="#team"
                            onClick={(e) => smoothScroll(e, "team")}
                            className="text-white hover:text-[#9CA3AF] transition-colors"
                            aria-label="Team"
                            data-editable="true"
                        >
                            Team
                        </a>
                        <a
                            href="#contact"
                            onClick={(e) => smoothScroll(e, "contact")}
                            className="text-white hover:text-[#9CA3AF] transition-colors"
                            aria-label="Contact"
                            data-editable="true"
                        >
                            Contact
                        </a>
                        <a
                            href="#map"
                            onClick={(e) => smoothScroll(e, "map")}
                            className="text-white hover:text-[#9CA3AF] transition-colors"
                            aria-label="Location"
                            data-editable="true"
                        >
                            Location
                        </a>
                    </nav>
                    <button
                        className="md:hidden text-white focus:outline-none"
                        onClick={toggleNav}
                        aria-label="Toggle navigation"
                    >
                        {navOpen ? "✕" : "☰"}
                    </button>
                </div>
                {navOpen && (
                    <nav className="md:hidden bg-[#6B7280]">
                        <ul className="flex flex-col gap-4 px-4 pb-4">
                            <li>
                                <a
                                    href="#home"
                                    onClick={(e) => smoothScroll(e, "home")}
                                    className="block text-white hover:text-[#9CA3AF] transition-colors"
                                    aria-label="Home"
                                    data-editable="true"
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#team"
                                    onClick={(e) => smoothScroll(e, "team")}
                                    className="block text-white hover:text-[#9CA3AF] transition-colors"
                                    aria-label="Team"
                                    data-editable="true"
                                >
                                    Team
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#contact"
                                    onClick={(e) => smoothScroll(e, "contact")}
                                    className="block text-white hover:text-[#9CA3AF] transition-colors"
                                    aria-label="Contact"
                                    data-editable="true"
                                >
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#map"
                                    onClick={(e) => smoothScroll(e, "map")}
                                    className="block text-white hover:text-[#9CA3AF] transition-colors"
                                    aria-label="Location"
                                    data-editable="true"
                                >
                                    Location
                                </a>
                            </li>
                        </ul>
                    </nav>
                )}
            </header>

            {/** HERO SECTION */}
            <motion.section
                id="home"
                className="container mx-auto px-4 py-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            >
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-[#4B5563]" aria-label="Business Name" data-editable="true">
                    asdasdasd
                </h1>
                <p className="text-lg md:text-xl mb-8 text-[#9CA3AF]" aria-label="Business Description" data-editable="true">
                    asdasdasda
                </p>
                <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto" aria-label="Welcome Message" data-editable="true">
                    Welcome to our modern, visually stunning website. We blend clean design with smooth animations and a fully responsive layout to deliver a superior digital experience.
                </p>
            </motion.section>

            {/** TEAM SECTION */}
            <motion.section
                id="team"
                className="container mx-auto px-4 py-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#4B5563]" aria-label="Meet Our Team" data-editable="true">
                    Meet Our Team
                </h2>
                <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                    {teamMembers.map((member, idx) => (
                        <motion.div
                            key={idx}
                            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2, duration: 0.6, ease: "easeOut" }}
                        >
                            <img
                                src={member.image}
                                alt={`${member.name} portrait`}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-[#4B5563]" aria-label={member.name} data-editable="true">
                                    {member.name}
                                </h3>
                                <p className="text-base text-[#9CA3AF]" aria-label={member.role} data-editable="true">
                                    {member.role}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/** CONTACT FORM SECTION */}
            <motion.section
                id="contact"
                className="container mx-auto px-4 py-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#4B5563]" aria-label="Get in Touch" data-editable="true">
                    Get in Touch
                </h2>
                <form
                    onSubmit={handleSubmit}
                    className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-lg shadow-md"
                    aria-label="Contact Form"
                >
                    {error && (
                        <p className="text-red-500" aria-label="Error Message" data-editable="true">
                            {error}
                        </p>
                    )}
                    <div className="form-control">
                        <label htmlFor="name" className="mb-2 font-medium">
                            Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#9CA3AF]"
                            aria-label="Name"
                            data-editable="true"
                        />
                    </div>
                    <div className="form-control">
                        <label htmlFor="email" className="mb-2 font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#9CA3AF]"
                            aria-label="Email"
                            data-editable="true"
                        />
                    </div>
                    <div className="form-control">
                        <label htmlFor="message" className="mb-2 font-medium">
                            Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            rows={4}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#9CA3AF]"
                            aria-label="Message"
                            data-editable="true"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-[#4B5563] text-white rounded-md hover:bg-[#9CA3AF] transition-colors disabled:opacity-50"
                        disabled={loading}
                        aria-label="Submit Contact Form"
                        data-editable="true"
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>
                </form>
            </motion.section>

            {/** LOCATION MAP SECTION */}
            <motion.section
                id="map"
                className="container mx-auto px-4 py-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#4B5563]" aria-label="Our Location" data-editable="true">
                    Our Location
                </h2>
                <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.9598906972505!2d-74.00594118459365!3d40.71277597933043!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a3160cfffab%3A0x65e3cddd3f3d2a8c!2sNew%20York%20City!5e0!3m2!1sen!2sus!4v1680000000000!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Location Map"
                        aria-label="Location Map"
                        data-editable="true"
                    />
                </div>
            </motion.section>

            {/** FOOTER */}
            <footer className="bg-[#6B7280] text-white">
                <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm" aria-label="Footer Text" data-editable="true">
                        © {new Date().getFullYear()} asdasdasd. All rights reserved.
                    </p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#home" onClick={(e) => smoothScroll(e, "home")} className="hover:text-[#9CA3AF] transition-colors" aria-label="Home" data-editable="true">
                            Home
                        </a>
                        <a href="#team" onClick={(e) => smoothScroll(e, "team")} className="hover:text-[#9CA3AF] transition-colors" aria-label="Team" data-editable="true">
                            Team
                        </a>
                        <a href="#contact" onClick={(e) => smoothScroll(e, "contact")} className="hover:text-[#9CA3AF] transition-colors" aria-label="Contact" data-editable="true">
                            Contact
                        </a>
                        <a href="#map" onClick={(e) => smoothScroll(e, "map")} className="hover:text-[#9CA3AF] transition-colors" aria-label="Location" data-editable="true">
                            Location
                        </a>
                    </div>
                </div>
            </footer>
        </motion.div>);
}
