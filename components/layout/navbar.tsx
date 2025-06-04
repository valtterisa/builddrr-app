"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { SignOutButton } from "../auth/sign-out-button";
import { usePathname } from "next/navigation";

export default function Navbar({ user }: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu when the pathname changes (navigation completes)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <motion.header className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-purple-600">builddrr</span>
        </div>
        {/* Desktop */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Button href="/dashboard" size="sm" variant={"outline"}>
                Dashboard
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                href="/login"
                variant="outline"
                className="hidden md:flex text-purple-600  hover:bg-purple-50"
              >
                Sign In
              </Button>
              <Button
                href="/signup"
                className="hidden md:flex bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                Get Started
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              {user ? (
                <div className="flex items-center gap-4">
                  <SignOutButton />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    href="/login"
                    variant="outline"
                    className="w-full justify-center text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    Sign In
                  </Button>
                  <Button
                    href="/signup"
                    className="w-full justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
}
