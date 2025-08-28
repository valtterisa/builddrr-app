"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MoreVerticalIcon,
  UserCircleIcon,
  CreditCardIcon,
  LogOutIcon,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import Logo from "../logo";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/(auth)/actions";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

export default function Navbar({ user }: any) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      className={`fixed w-screen left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-gray-200
        ${scrolled ? "bg-white/90 backdrop-blur-sm shadow-md border-b border-gray-300" : "bg-transparent"}
      `}
    >
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-1">
          <Logo className="h-4 w-4 md:h-8 md:w-8" />
          <span className="text-xl md:text-2xl font-bold text-black">Builddrr</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={
                  "hover:bg-gray-100 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                }
                asChild
              >
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 py-1 rounded-lg"
                >
                  <Avatar className="h-8 w-8 rounded-lg grayscale">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900">
                    {user.name}
                  </span>
                  <MoreVerticalIcon className="ml-1 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56 rounded-lg"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account">
                      <UserCircleIcon className="mr-2 h-4 w-4" /> Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account/billing">
                      <CreditCardIcon className="mr-2 h-4 w-4" /> Billing
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}>
                  <LogOutIcon className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button
                href="/login"
                variant="outline"
                className="text-purple-600 hover:bg-purple-50"
              >
                Sign In
              </Button>
              <Button
                href="/signup"
                className="bg-black text-white hover:bg-gray-800"
              >
                Start for Free
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          {user ? (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80" title="Menu">
                <SheetHeader>
                  <SheetTitle className="text-left"></SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-12 w-12 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">
                        {user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/account"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      <span>Account</span>
                    </Link>
                    <Link
                      href="/dashboard/account/billing"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <CreditCardIcon className="h-5 w-5" />
                      <span>Billing</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                    >
                      <LogOutIcon className="mr-3 h-5 w-5" />
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 pt-16" title="Menu">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      href="/login"
                      variant="outline"
                      className="w-full justify-center text-purple-600 hover:bg-purple-50"
                      onClick={closeMobileMenu}
                    >
                      Sign In
                    </Button>
                    <Button
                      href="/signup"
                      className="w-full justify-center bg-black text-white hover:bg-gray-800"
                      onClick={closeMobileMenu}
                    >
                      Start for Free
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </motion.header>
  );
}
