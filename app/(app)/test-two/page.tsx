"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Star,
  Code,
  Zap,
  Shield,
  Users,
  ChartBar,
  Gift,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="relative z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="#" className="text-xl font-bold text-indigo-600">
                Nova<span className="text-gray-900">Tech</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </a>
              <a
                href="#"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 pt-2 pb-3 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </a>
              <a
                href="#"
                className="block px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-center"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Feature Section */}
      <section id="features" className="py-20 relative">
        {/* Background with pattern */}
        <div className="absolute inset-0 bg-gray-50 overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-full bg-white"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25px 25px, lightgray 2px, transparent 0)",
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Our comprehensive platform provides all the tools you need to grow
              your business.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Code size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Powerful API
              </h3>
              <p className="mt-3 text-gray-600">
                Integrate seamlessly with our robust API. Build custom solutions
                with ease.
              </p>
              <div className="mt-4 flex justify-center">
                <img
                  src="/api/placeholder/300/150?text=API+Documentation"
                  alt="API documentation"
                  className="rounded-md shadow-sm"
                />
              </div>
              <a
                href="#"
                className="mt-4 inline-flex items-center text-indigo-600 font-medium"
              >
                Learn more <ArrowRight className="ml-1" size={16} />
              </a>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-md bg-green-100 text-green-600 flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Lightning Fast
              </h3>
              <p className="mt-3 text-gray-600">
                Experience blazing fast performance. Our optimized
                infrastructure ensures speed.
              </p>
              <div className="mt-4 flex justify-center">
                <img
                  src="/api/placeholder/300/150?text=Performance+Metrics"
                  alt="Performance metrics"
                  className="rounded-md shadow-sm"
                />
              </div>
              <a
                href="#"
                className="mt-4 inline-flex items-center text-indigo-600 font-medium"
              >
                Learn more <ArrowRight className="ml-1" size={16} />
              </a>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Enterprise Security
              </h3>
              <p className="mt-3 text-gray-600">
                Bank-level security protocols. Your data is always protected and
                encrypted.
              </p>
              <div className="mt-4 flex justify-center">
                <img
                  src="/api/placeholder/300/150?text=Security+Features"
                  alt="Security features"
                  className="rounded-md shadow-sm"
                />
              </div>
              <a
                href="#"
                className="mt-4 inline-flex items-center text-indigo-600 font-medium"
              >
                Learn more <ArrowRight className="ml-1" size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-64 -right-64 w-96 h-96 rounded-full bg-indigo-100 opacity-50"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-purple-100 opacity-40"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why companies choose NovaTech
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Our platform delivers measurable results that drive business
              growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="/api/placeholder/540/360?text=Platform+Overview"
                alt="Platform overview"
                className="w-full rounded-xl shadow-lg"
              />
            </div>
            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <Users size={20} />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    User-Friendly Interface
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Designed with users in mind, our intuitive interface reduces
                    the learning curve and increases adoption.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <ChartBar size={20} />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Advanced Analytics
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Gain valuable insights with our comprehensive analytics
                    tools that track performance metrics.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <Gift size={20} />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Regular Updates
                  </h3>
                  <p className="mt-2 text-gray-600">
                    We continuously improve our platform with regular updates
                    and new features based on user feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 relative">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trusted by industry leaders
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              See what our customers have to say about their experience with
              NovaTech.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img
                    src="/api/placeholder/48/48?text=SJ"
                    alt="Sarah Johnson"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                  <p className="text-gray-600 text-sm">CTO, TechCorp</p>
                </div>
              </div>
              <p className="text-gray-700">
                "NovaTech has transformed our business operations. The platform
                is intuitive, powerful, and the support team is exceptional."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img
                    src="/api/placeholder/48/48?text=MR"
                    alt="Mark Rodriguez"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">
                    Mark Rodriguez
                  </h4>
                  <p className="text-gray-600 text-sm">Founder, StartupX</p>
                </div>
              </div>
              <p className="text-gray-700">
                "As a startup, we needed a solution that could scale with us.
                NovaTech delivered beyond our expectations."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden">
                  <img
                    src="/api/placeholder/48/48?text=LC"
                    alt="Lisa Chen"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Lisa Chen</h4>
                  <p className="text-gray-600 text-sm">
                    VP Product, EnterpriseGlobal
                  </p>
                </div>
              </div>
              <p className="text-gray-700">
                "The security features and customization options make NovaTech
                the perfect solution for our enterprise needs."
              </p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(30deg, #f0f4ff 12%, transparent 12.5%, transparent 87%, #f0f4ff 87.5%, #f0f4ff), linear-gradient(150deg, #f0f4ff 12%, transparent 12.5%, transparent 87%, #f0f4ff 87.5%, #f0f4ff), linear-gradient(30deg, #f0f4ff 12%, transparent 12.5%, transparent 87%, #f0f4ff 87.5%, #f0f4ff), linear-gradient(150deg, #f0f4ff 12%, transparent 12.5%, transparent 87%, #f0f4ff 87.5%, #f0f4ff), linear-gradient(60deg, #e4e9ff 25%, transparent 25.5%, transparent 75%, #e4e9ff 75%, #e4e9ff), linear-gradient(60deg, #e4e9ff 25%, transparent 25.5%, transparent 75%, #e4e9ff 75%, #e4e9ff)",
              backgroundSize: "40px 70px",
              backgroundPosition:
                "0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px",
            }}
          ></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Choose the plan that works best for your business needs.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Starter Plan */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow relative">
              <h3 className="text-xl font-semibold text-gray-900">Starter</h3>
              <p className="mt-4 text-gray-600 text-sm">
                Perfect for small businesses and startups
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="mt-6 space-y-4">
                {[
                  "Up to 5 users",
                  "50GB storage",
                  "Basic analytics",
                  "Email support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle size={18} className="text-green-500 mr-2" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 bg-gray-50 rounded-lg p-3 text-center text-sm text-gray-600">
                <img
                  src="/api/placeholder/200/100?text=Starter+Features"
                  alt="Starter plan features"
                  className="mx-auto rounded"
                />
              </div>
              <a
                href="#"
                className="mt-8 block w-full py-3 px-4 rounded-md bg-white border border-indigo-600 text-indigo-600 text-center font-medium hover:bg-indigo-50 transition-colors"
              >
                Get Started
              </a>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-indigo-100 hover:shadow-xl transition-shadow relative -translate-y-4">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
              <p className="mt-4 text-gray-600 text-sm">
                Ideal for growing businesses
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">$79</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="mt-6 space-y-4">
                {[
                  "Up to 20 users",
                  "250GB storage",
                  "Advanced analytics",
                  "Priority support",
                  "API access",
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle size={18} className="text-green-500 mr-2" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 bg-indigo-50 rounded-lg p-3 text-center text-sm text-gray-600">
                <img
                  src="/api/placeholder/200/100?text=Pro+Features"
                  alt="Pro plan features"
                  className="mx-auto rounded"
                />
              </div>
              <a
                href="#"
                className="mt-8 block w-full py-3 px-4 rounded-md bg-indigo-600 text-white text-center font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </a>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow relative">
              <h3 className="text-xl font-semibold text-gray-900">
                Enterprise
              </h3>
              <p className="mt-4 text-gray-600 text-sm">
                For large organizations with complex needs
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">$199</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="mt-6 space-y-4">
                {[
                  "Unlimited users",
                  "1TB storage",
                  "Custom analytics",
                  "24/7 dedicated support",
                  "Advanced API access",
                  "Custom integrations",
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle size={18} className="text-green-500 mr-2" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 bg-gray-50 rounded-lg p-3 text-center text-sm text-gray-600">
                <img
                  src="/api/placeholder/200/100?text=Enterprise+Features"
                  alt="Enterprise plan features"
                  className="mx-auto rounded"
                />
              </div>
              <a
                href="#"
                className="mt-8 block w-full py-3 px-4 rounded-md bg-white border border-indigo-600 text-indigo-600 text-center font-medium hover:bg-indigo-50 transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-3/5">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to transform your business?
              </h2>
              <p className="mt-4 text-lg text-indigo-100">
                Join thousands of companies already using NovaTech to scale
                their operations.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 lg:w-2/5 lg:flex lg:justify-end">
              <div className="rounded-md shadow">
                <a
                  href="#"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10"
                >
                  Get Started Today
                </a>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 lg:ml-3">
                <a
                  href="#"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800 md:py-4 md:text-lg md:px-10"
                >
                  Schedule Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                {[
                  "Features",
                  "Pricing",
                  "Case Studies",
                  "Reviews",
                  "Updates",
                ].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Careers", "Press", "Partners", "Contact"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                {[
                  "Blog",
                  "Documentation",
                  "Help Center",
                  "API",
                  "Community",
                ].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Security", "Cookies", "Compliance"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 NovaTech. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              {["Twitter", "LinkedIn", "GitHub", "Facebook"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="hover:text-white transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Animated background component
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50"></div>

      {/* Animated blobs */}
      <div className="absolute top-0 left-0 w-full h-full">
        {/* Large animated blob */}
        <div
          className="absolute top-10 left-10 w-64 h-64 bg-indigo-300 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>

        {/* Second animated blob */}
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDuration: "12s" }}
        ></div>

        {/* Third floating blob */}
        <div
          className="absolute top-1/3 right-1/4 w-48 h-48 bg-blue-200 rounded-full blur-3xl opacity-10 animate-pulse"
          style={{ animationDuration: "15s" }}
        ></div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Subtle radial gradient for depth */}
      <div className="absolute inset-0 bg-radial-gradient opacity-20"></div>
    </div>
  );
};

// Floating elements that move on mouse position
const FloatingElements = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Elements that move slightly with cursor */}
      <div
        className="absolute top-20 left-10 w-16 h-16 rounded-full border border-indigo-300 opacity-30"
        style={{
          transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
          transition: "transform 0.2s ease-out",
        }}
      ></div>
      <div
        className="absolute top-40 right-40 w-32 h-32 rounded-full border-2 border-purple-300 opacity-20"
        style={{
          transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
          transition: "transform 0.3s ease-out",
        }}
      ></div>
      <div
        className="absolute bottom-20 left-1/3 w-24 h-24 rounded-full border border-cyan-300 opacity-20"
        style={{
          transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
          transition: "transform 0.25s ease-out",
        }}
      ></div>

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full opacity-60"></div>
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/2 w-2 h-2 bg-indigo-400 rounded-full opacity-60"></div>
    </div>
  );
};

const HeroSection = () => {
  // Animated counter effect for companies number
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount < 500) return prevCount + 5;
        clearInterval(interval);
        return 500;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Enhanced background */}
      <AnimatedBackground />

      {/* Interactive floating elements */}
      <FloatingElements />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6 xl:col-span-5">
            <div className="relative">
              {/* Decorative element */}
              <div className="absolute -left-8 -top-8 w-24 h-24 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full opacity-20 blur-xl"></div>

              <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight animate-fade-in-up">
                Build the future with{" "}
                <span className="relative inline-block text-indigo-600">
                  NovaTech
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-indigo-200 opacity-50 rounded"></span>
                </span>
              </h1>
            </div>

            <p
              className="mt-6 text-xl text-gray-600 max-w-3xl animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              Powerful solutions for modern businesses. Streamline workflows,
              enhance productivity, and scale with confidence.
            </p>

            <div
              className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <a
                href="#"
                className="px-8 py-3 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all transform hover:scale-105 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                Get Started <ChevronRight className="ml-2" size={16} />
              </a>
              <a
                href="#"
                className="px-8 py-3 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all transform hover:scale-105 flex items-center justify-center hover:shadow-md"
              >
                Learn More <ArrowRight className="ml-2" size={16} />
              </a>
            </div>

            <div
              className="mt-8 flex items-center animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-white transform hover:scale-110 transition-transform"
                  >
                    <img
                      src={`/api/placeholder/${32}/${32}?text=${i}`}
                      alt={`User ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="ml-4 text-sm text-gray-700">
                <span className="font-semibold">{count}+</span> companies
                already onboard
              </p>
            </div>
          </div>

          <div
            className="mt-12 lg:mt-0 lg:col-span-6 xl:col-span-7 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform hover:scale-[1.02] transition-all hover:shadow-2xl">
              <div className="h-64 bg-gradient-to-r from-indigo-500 to-purple-600 relative overflow-hidden flex items-center justify-center">
                {/* Animated pattern overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 15% 50%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 25%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 25%, transparent 25%)",
                    backgroundSize: "50% 100%, 40% 80%",
                  }}
                ></div>

                {/* Glowing orb */}
                <div
                  className="absolute top-1/4 left-1/4 w-16 h-16 bg-white rounded-full blur-xl opacity-30 animate-pulse"
                  style={{ animationDuration: "3s" }}
                ></div>

                {/* Dashboard image with subtle animation */}
                <img
                  src="/api/placeholder/600/320?text=Dashboard+Preview"
                  alt="Dashboard preview"
                  className="rounded shadow-lg relative z-10 hover:shadow-2xl transition-all transform hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Intuitive Dashboard
                  </h3>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={16}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Get all your metrics at a glance with our beautifully designed
                  analytics dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .bg-radial-gradient {
          background: radial-gradient(
            circle at center,
            rgba(99, 102, 241, 0.1) 0%,
            transparent 70%
          );
        }
      `}</style>
    </section>
  );
};
