import { Book, Map } from "lucide-react";
import Image from "next/image";
import Logo from "../logo";

export default function Footer() {
  return (
    <footer className="w-full border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <span className="text-2xl font-bold">Builddrr</span>
            </h3>{" "}
            <p className="text-sm text-gray-600">
              Build websites with AI. Create stunning websites in minutes, not
              hours.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.builddrr.com"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Book className="w-4 h-4" />
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://builddrr.featurebase.app/"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Map className="w-4 h-4" />
                  Roadmap & Feedback
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/Fg8qtgMN"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/discord-logo.svg"
                    alt="Discord"
                    width={16}
                    height={16}
                  />
                  Support (Discord)
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Follow Us</h4>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/trybuilddrr"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on X (Twitter)"
              >
                <Image src="/x-logo.png" alt="X.com" width={20} height={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2025 builddrr. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="/privacy"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
