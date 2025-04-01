"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingToggle } from "@/components/pricing-toggle";

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const pricingPlans = [
    {
      name: "Free",
      description: "Perfect for trying out our platform",
      price: { monthly: 0, yearly: 0 },
      features: ["1 website", "Basic templates", "Community support"],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      description: "For professionals and small businesses",
      price: { monthly: 5, yearly: 29 },
      features: [
        "5 websites",
        "Premium templates",
        "Priority support",
        "Custom domain",
        "Remove branding",
      ],
      cta: "Get Started",
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "For larger organizations with advanced needs",
      price: { monthly: 49, yearly: 490 },
      features: [
        "Unlimited websites",
        "All Pro features",
        "Dedicated support",
        "Team collaboration",
        "Advanced analytics",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-700"></div>
            <span className="font-bold text-xl">SiteBuilder</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#templates"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Templates
            </Link>
            <Link
              href="#pricing"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              Login
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              Create Your Website in Minutes
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Build beautiful, responsive websites without coding. Choose
              between our AI-powered builder or pre-designed templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/create/ai">
                <Button className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 px-8 py-6 text-lg">
                  AI Website Builder
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/templates">
                <Button
                  variant="outline"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg"
                >
                  Browse Templates
                </Button>
              </Link>
            </div>
            <div className="relative mt-16">
              <div className="absolute -top-6 -left-6 right-6 bottom-6 rounded-xl bg-gray-100 -z-10"></div>
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                <Image
                  src="/placeholder.svg?height=600&width=1000"
                  alt="Website builder interface"
                  width={1000}
                  height={600}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
              Everything you need to create and manage beautiful websites
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI-Powered Builder",
                  description:
                    "Describe your website and our AI will build it for you in seconds.",
                },
                {
                  title: "Drag & Drop Editor",
                  description:
                    "Easily customize your website with our intuitive drag and drop interface.",
                },
                {
                  title: "Responsive Design",
                  description:
                    "All websites look great on any device, from desktop to mobile.",
                },
                {
                  title: "SEO Optimization",
                  description:
                    "Built-in tools to help your website rank higher in search results.",
                },
                {
                  title: "Fast Performance",
                  description:
                    "Lightning-fast websites that load quickly and keep visitors engaged.",
                },
                {
                  title: "Custom Domains",
                  description:
                    "Connect your own domain name for a professional online presence.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Beautiful Templates</h2>
            <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
              Choose from our collection of professionally designed templates
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((template) => (
                <div
                  key={template}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                >
                  <div className="aspect-[3/4] bg-gray-100">
                    <Image
                      src={`/placeholder.svg?height=600&width=450&text=Template%20${template}`}
                      alt={`Template ${template}`}
                      width={450}
                      height={600}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
                    <Link href="/templates">
                      <Button className="bg-white text-gray-900 hover:bg-gray-100">
                        Use This Template
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link href="/templates">
                <Button
                  variant="outline"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  View All Templates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Choose the plan that works best for you
            </p>

            <PricingToggle
              billingPeriod={billingPeriod}
              onChange={setBillingPeriod}
              className="mb-16"
            />

            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl p-8 border ${
                    plan.highlighted
                      ? "border-purple-500 shadow-lg relative"
                      : "border-gray-200 shadow-sm"
                  }`}
                >
                  {plan.highlighted && billingPeriod === "yearly" && (
                    <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Save 20%
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ${plan.price[billingPeriod]}
                    </span>
                    {plan.price[billingPeriod] > 0 && (
                      <span className="text-gray-600">
                        /{billingPeriod === "monthly" ? "mo" : "yr"}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto text-center">
              Find answers to common questions about our platform
            </p>
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "Do I need coding knowledge to use SiteBuilder?",
                  answer:
                    "No, SiteBuilder is designed for everyone. Our AI-powered builder and drag-and-drop editor make it easy to create professional websites without any coding knowledge.",
                },
                {
                  question: "Can I use my own domain name?",
                  answer:
                    "Yes, you can connect your own domain name to your website on our Pro and Enterprise plans. We also offer domain registration services if you need to purchase a new domain.",
                },
                {
                  question: "Is there a free plan available?",
                  answer:
                    "Yes, we offer a free plan that allows you to create one website with basic features. It's perfect for trying out our platform or for simple personal projects.",
                },
                {
                  question: "Can I switch templates after creating my website?",
                  answer:
                    "Yes, you can switch templates at any time. Your content will be automatically transferred to the new template, though you may need to make some adjustments to ensure everything looks perfect.",
                },
                {
                  question: "How does the AI website builder work?",
                  answer:
                    "Our AI website builder uses advanced artificial intelligence to create a website based on your description. Simply tell us what kind of website you want, and our AI will generate a complete website for you in seconds.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 bg-white"
                >
                  <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Build Your Website?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Get started today and create a stunning website in minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create/ai">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg">
                  Start with AI Builder
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/templates">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-purple-600 px-8 py-6 text-lg"
                >
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-700"></div>
                <span className="font-bold text-xl">SiteBuilder</span>
              </div>
              <p className="text-gray-400">
                Create beautiful websites without coding. Powered by AI.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#templates"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Templates
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} SiteBuilder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
