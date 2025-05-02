"use client";

import type React from "react";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  CreditCard,
  Settings,
  Users,
  LogOut,
  LayoutDashboard,
  LinkIcon,
  Menu,
  Images,
  ChartColumn,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { logout } from "../../(auth)/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contentMenuOpen, setContentMenuOpen] = useState(true);

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-4 py-2">
              <Globe className="h-5 w-5" />
              <span className="font-bold text-xl">SiteForge</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="flex flex-col justify-between">
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard"}
                    >
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        Home
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Collapsible Content Menu */}
                  <Collapsible
                    open={contentMenuOpen}
                    onOpenChange={setContentMenuOpen}
                    className="w-full"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="justify-between">
                          <div className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md text-left outline-none">
                            <Globe className="h-4 w-4 mr-3" />
                            Website
                          </div>
                          {contentMenuOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>

                    <CollapsibleContent className="pl-8 space-y-1 mt-1">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/dashboard/website/blog"}
                        >
                          <Link href="/dashboard/website/blog">Blog</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/dashboard/website/editor"}
                        >
                          <Link href="/dashboard/website/editor">Editor</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname === "/dashboard/website/my-websites"
                          }
                        >
                          <Link href="/dashboard/website/my-websites">
                            My websites
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/dashboard/website/domains"}
                        >
                          <Link href="/dashboard/website/domains">Domains</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </CollapsibleContent>
                  </Collapsible>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/content"}
                    >
                      <Link href="/dashboard/content">
                        <Images className="h-5 w-5 mr-3" />
                        Social Media
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      disabled
                      className="opacity-70 cursor-not-allowed relative"
                    >
                      <div className="flex items-center">
                        <ChartColumn className="h-5 w-5 mr-3" />
                        Analytics
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
                          coming soon
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/account/billing"}
                    >
                      <Link href="/dashboard/account/billing">
                        <CreditCard className="h-5 w-5 mr-3" />
                        Billing
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/account/team"}
                    >
                      <Link href="/dashboard/account/team">
                        <Users className="h-5 w-5 mr-3" />
                        Team
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/account/settings"}
                    >
                      <Link href="/dashboard/account/settings">
                        <Settings className="h-5 w-5 mr-3" />
                        Settings
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Header */}
        <div className="flex flex-col flex-1">
          <header className="md:hidden border-b">
            <div className="container flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-2 font-bold text-xl">
                <Globe className="h-5 w-5" />
                <span>SiteForge</span>
              </div>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[250px] sm:w-[300px]"
                  title="Dashboard Navigation"
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="flex items-center gap-2 py-4 border-b">
                      <Globe className="h-5 w-5" />
                      <span className="font-bold text-xl">SiteForge</span>
                    </div>
                    <div className="flex-1 py-4">
                      <div className="space-y-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={
                              pathname === "/dashboard" ? "default" : "ghost"
                            }
                            className="w-full justify-start"
                          >
                            <LayoutDashboard className="h-5 w-5 mr-3" />
                            Home
                          </Button>
                        </Link>

                        {/* Website Collapsible Menu */}
                        <Collapsible
                          className="w-full"
                          open={contentMenuOpen}
                          onOpenChange={setContentMenuOpen}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between"
                            >
                              <div className="flex items-center">
                                <Globe className="h-5 w-5 mr-3" />
                                Website
                              </div>
                              {contentMenuOpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-8 space-y-1 mt-1">
                            <Link
                              href="/dashboard/website/blog"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button
                                variant={
                                  pathname === "/dashboard/website/blog"
                                    ? "default"
                                    : "ghost"
                                }
                                className="w-full justify-start"
                              >
                                Blog
                              </Button>
                            </Link>
                            <Link
                              href="/dashboard/website/editor"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button
                                variant={
                                  pathname === "/dashboard/website/editor"
                                    ? "default"
                                    : "ghost"
                                }
                                className="w-full justify-start"
                              >
                                Editor
                              </Button>
                            </Link>
                            <Link
                              href="/dashboard/website/my-websites"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button
                                variant={
                                  pathname === "/dashboard/website/my-websites"
                                    ? "default"
                                    : "ghost"
                                }
                                className="w-full justify-start"
                              >
                                My websites
                              </Button>
                            </Link>
                            <Link
                              href="/dashboard/website/domains"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button
                                variant={
                                  pathname === "/dashboard/website/domains"
                                    ? "default"
                                    : "ghost"
                                }
                                className="w-full justify-start"
                              >
                                Domains
                              </Button>
                            </Link>
                          </CollapsibleContent>
                        </Collapsible>

                        <Link
                          href="/dashboard/content"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={
                              pathname === "/dashboard/content"
                                ? "default"
                                : "ghost"
                            }
                            className="w-full justify-start"
                          >
                            <Images className="h-5 w-5 mr-3" />
                            Social Media
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          className="w-full justify-start opacity-70 cursor-not-allowed"
                          disabled
                        >
                          <ChartColumn className="h-5 w-5 mr-3" />
                          Analytics
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full ml-2">
                            coming soon
                          </span>
                        </Button>
                      </div>

                      <div className="h-px bg-border my-4" />

                      <div className="space-y-1">
                        <Link
                          href="/dashboard/account/billing"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={
                              pathname === "/dashboard/account/billing"
                                ? "default"
                                : "ghost"
                            }
                            className="w-full justify-start"
                          >
                            <CreditCard className="h-5 w-5 mr-3" />
                            Billing
                          </Button>
                        </Link>
                        <Link
                          href="/dashboard/account/team"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={
                              pathname === "/dashboard/account/team"
                                ? "default"
                                : "ghost"
                            }
                            className="w-full justify-start"
                          >
                            <Users className="h-5 w-5 mr-3" />
                            Team
                          </Button>
                        </Link>
                        <Link
                          href="/dashboard/account/settings"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={
                              pathname === "/dashboard/account/settings"
                                ? "default"
                                : "ghost"
                            }
                            className="w-full justify-start"
                          >
                            <Settings className="h-5 w-5 mr-3" />
                            Settings
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="border-t py-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={logout}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
