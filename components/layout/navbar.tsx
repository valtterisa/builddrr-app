"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  MoreVerticalIcon,
  UserCircleIcon,
  CreditCardIcon,
  LogOutIcon,
  LayoutDashboard,
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

export default function Navbar({ user }: any) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed w-screen top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
        ${scrolled ? "bg-white/80 backdrop-blur-sm shadow-md border-b border-gray-200" : "bg-transparent"}
      `}
    >
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Desktop */}
        <div className="flex items-center gap-1">
          <Logo className="h-4 w-4 md:h-8 md:w-8" />

          <span className="text-2xl font-bold">Builddrr</span>
        </div>
        <div className="flex items-center gap-4">
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
                  <span className="hidden md:block text-sm font-medium text-gray-900">
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
        </div>
      </div>
    </motion.header>
  );
}
