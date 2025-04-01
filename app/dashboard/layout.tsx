"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Globe, CreditCard, Settings, Users, LogOut, LayoutDashboard, LinkIcon, Mail, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
} from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = localStorage.getItem("isAuthenticated") === "true"
    setIsAuthenticated(checkAuth)

    if (!checkAuth) {
      router.push("/")
      return
    }

    // Check if mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    router.push("/")
  }

  if (!isAuthenticated) {
    return <div className="container py-10 px-4 md:px-6">Redirecting...</div>
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-4 py-2">
              <Globe className="h-5 w-5" />
              <span className="font-bold text-xl">SiteForge</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        Dashboard
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/websites"}>
                      <Link href="/dashboard/websites">
                        <Globe className="h-5 w-5 mr-3" />
                        My Websites
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/domains"}>
                      <Link href="/dashboard/domains">
                        <LinkIcon className="h-5 w-5 mr-3" />
                        Domains
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/integrations"}>
                      <Link href="/dashboard/integrations">
                        <Mail className="h-5 w-5 mr-3" />
                        Integrations
                      </Link>
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
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/billing"}>
                      <Link href="/dashboard/billing">
                        <CreditCard className="h-5 w-5 mr-3" />
                        Billing
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/team"}>
                      <Link href="/dashboard/team">
                        <Users className="h-5 w-5 mr-3" />
                        Team
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"}>
                      <Link href="/dashboard/settings">
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
                <SidebarMenuButton onClick={handleLogout}>
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
                <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 py-4 border-b">
                      <Globe className="h-5 w-5" />
                      <span className="font-bold text-xl">SiteForge</span>
                    </div>
                    <div className="flex-1 py-4">
                      <div className="space-y-1">
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant={pathname === "/dashboard" ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            <LayoutDashboard className="h-5 w-5 mr-3" />
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/dashboard/websites" onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant={pathname === "/dashboard/websites" ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            <Globe className="h-5 w-5 mr-3" />
                            My Websites
                          </Button>
                        </Link>
                        <Link href="/dashboard/domains" onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant={pathname === "/dashboard/domains" ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            <LinkIcon className="h-5 w-5 mr-3" />
                            Domains
                          </Button>
                        </Link>
                        <Link href="/dashboard/integrations" onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant={pathname === "/dashboard/integrations" ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            <Mail className="h-5 w-5 mr-3" />
                            Integrations
                          </Button>
                        </Link>
                      </div>

                      <div className="h-px bg-border my-4" />

                      <div className="space-y-1">
                        <Link href="/dashboard/billing" onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant={pathname === "/dashboard/billing" ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            <CreditCard className="h-5 w-5 mr-3" />
                            Billing
                          </Button>
                        </Link>
                        <Link href="/dashboard/team" onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant={pathname === "/dashboard/team" ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            <Users className="h-5 w-5 mr-3" />
                            Team
                          </Button>
                        </Link>
                        <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant={pathname === "/dashboard/settings" ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            <Settings className="h-5 w-5 mr-3" />
                            Settings
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="border-t py-4">
                      <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

