"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Globe,
  CreditCard,
  Settings,
  Users,
  LogOut,
  LayoutDashboard,
  PenSquare,
  Menu,
  ChevronDown,
  ChevronRight,
  Plus,
  BarChart3,
  ExternalLink,
  Image,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { logout } from "../../(auth)/actions";

// Define website type
type Website = {
  id: string;
  name: string;
  custom_domain: string | null;
  primary_domain: string;
  status: string;
  is_active?: boolean; // Optional property to indicate if the website is active
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contentMenuOpen, setContentMenuOpen] = useState(true);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [activeWebsite, setActiveWebsite] = useState<Website | null>(null);
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);

  // Fetch user's websites
  useEffect(() => {
    const fetchWebsites = async () => {
      setIsLoadingWebsites(true);
      try {
        const supabase = createClient();
        const { data: websitesData, error } = await supabase
          .from("websites")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (websitesData && websitesData.length > 0) {
          // Mark websites as active if they are deployed or deploying
          const processedWebsites = websitesData.map((site) => ({
            ...site,
            is_active:
              site.status === "deployed" || site.status === "deploying",
          }));

          setWebsites(processedWebsites);

          // Set first website as active if none is selected
          if (!activeWebsite) {
            setActiveWebsite(processedWebsites[0]);
            // Store selection in localStorage
            localStorage.setItem("activeWebsiteId", processedWebsites[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching websites:", error);
      } finally {
        setIsLoadingWebsites(false);
      }
    };

    fetchWebsites();
  }, []);

  // Load active website from localStorage on initial render
  useEffect(() => {
    const savedWebsiteId = localStorage.getItem("activeWebsiteId");
    if (savedWebsiteId && websites.length > 0) {
      const website = websites.find((site) => site.id === savedWebsiteId);
      if (website) {
        setActiveWebsite(website);
      }
    }
  }, [websites]);

  // Handle website change
  const handleWebsiteChange = (websiteId: string) => {
    const website = websites.find((site) => site.id === websiteId);
    if (website) {
      setActiveWebsite(website);
      localStorage.setItem("activeWebsiteId", websiteId);
    }
  };

  // Function to create a new website
  const handleCreateWebsite = () => {
    router.push("/dashboard/website/all?action=create");
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex border-r">
          <SidebarHeader className="border-b px-2 py-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">SiteForge</span>
              </div>
              {websites.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCreateWebsite}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Create new website</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="flex flex-col">
            {/* Website Selector */}
            {websites.length > 0 && (
              <div className="px-3 py-3 border-b">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      ACTIVE WEBSITE
                    </span>
                    <Badge variant="outline" className="text-xs font-normal">
                      {websites.filter((site) => site.is_active).length}/
                      {websites.length} live
                    </Badge>
                  </div>
                  {activeWebsite && (
                    <div className="flex justify-between items-center">
                      <Link
                        href={activeWebsite.custom_domain || "#"}
                        target="_blank"
                        className="text-xs text-primary hover:underline flex items-center"
                      >
                        View site
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                      <Link
                        href="/dashboard/website/all"
                        className="text-xs text-primary hover:underline"
                      >
                        Manage all
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard"}
                    >
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4 mr-3" />
                        Dashboard
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
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-5" />
                            Website
                          </div>
                          {contentMenuOpen ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>

                    <CollapsibleContent className="pl-8 space-y-1 mt-1">
                      {/* <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/dashboard/website/blog"}
                          disabled={websites.length === 0}
                        >
                          <Link href="/dashboard/website/blog">Blog</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem> */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/dashboard/website/all"}
                        >
                          <Link href="/dashboard/website/all">My websites</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/dashboard/website/domains"}
                          disabled={websites.length === 0}
                        >
                          <Link href="/dashboard/website/domains">Domains</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname === "/dashboard/website/integrations"
                          }
                          disabled={websites.length === 0}
                        >
                          <Link href="/dashboard/website/integrations">
                            Integrations
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </CollapsibleContent>
                  </Collapsible>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.includes("/dashboard/analytics")}
                    >
                      <Link href="/dashboard/analytics">
                        <BarChart3 className="h-4 w-4 mr-3" />
                        Analytics
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.includes("/dashboard/analytics")}
                    >
                      <Link href="/dashboard/media-library">
                        <Image className="h-4 w-4 mr-3" />
                        Media Library
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />
          </SidebarContent>
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
                      <CreditCard className="h-4 w-4 mr-3" />
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
                      <Users className="h-4 w-4 mr-3" />
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
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarFooter className="border-t">
            {websites.length === 0 && (
              <div className="px-3 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleCreateWebsite}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create website
                </Button>
              </div>
            )}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout}>
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign out
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Header */}
        <div className="flex flex-col flex-1">
          <header className="md:hidden border-b sticky top-0 bg-background z-10">
            <div className="flex h-14 items-center justify-between px-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-bold">SiteForge</span>
              </Link>

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  title={"SITEFORGE"}
                  side="left"
                  className="w-[270px] p-0"
                >
                  <div className="flex flex-col h-full">
                    <div className="border-b p-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="font-bold">SiteForge</span>
                      </div>
                    </div>

                    {/* Mobile Site Selector */}
                    {websites.length > 0 && (
                      <div className="border-b p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">
                              ACTIVE WEBSITE
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              {websites.filter((site) => site.is_active).length}
                              /{websites.length} live
                            </Badge>
                          </div>

                          {activeWebsite && (
                            <>
                              <div className="text-sm font-medium">
                                {activeWebsite.name}
                                {activeWebsite.status && (
                                  <Badge
                                    variant={
                                      activeWebsite.is_active
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="ml-2 text-xs"
                                  >
                                    {activeWebsite.status}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex justify-between items-center mt-2">
                                <Link
                                  href={
                                    activeWebsite.custom_domain
                                      ? `https://${activeWebsite.custom_domain}`
                                      : activeWebsite.primary_domain
                                        ? activeWebsite.primary_domain
                                        : ""
                                  }
                                  target="_blank"
                                  className="text-xs text-primary hover:underline flex items-center"
                                >
                                  View site
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Link>
                                <Link
                                  href="/dashboard/website/all"
                                  className="text-xs text-primary hover:underline"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  Manage all
                                </Link>
                              </div>

                              {websites.length > 1 && (
                                <div className="pt-2">
                                  <select
                                    className="w-full px-2 py-1 text-sm border rounded"
                                    value={activeWebsite.id}
                                    onChange={(e) =>
                                      handleWebsiteChange(e.target.value)
                                    }
                                  >
                                    {websites.map((site) => (
                                      <option key={site.id} value={site.id}>
                                        {site.name}{" "}
                                        {site.is_active ? "(active)" : ""}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex-1 py-4 px-1 overflow-auto">
                      {/* Navigation Links */}
                      <div className="px-2 pb-2">
                        <span className="text-xs font-medium text-muted-foreground px-3 mb-2 block">
                          NAVIGATION
                        </span>
                        <div className="space-y-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant={
                                pathname === "/dashboard"
                                  ? "secondary"
                                  : "ghost"
                              }
                              className="w-full justify-start h-9 text-sm"
                            >
                              <LayoutDashboard className="h-4 w-4 mr-3" />
                              Dashboard
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
                                className="w-full justify-between h-9 text-sm"
                              >
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-5" />
                                  Website
                                </div>
                                {contentMenuOpen ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-7 space-y-1 mt-1">
                              {/* <Link
                                href="/dashboard/website/blog"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <Button
                                  variant={
                                    pathname === "/dashboard/website/blog"
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  className="w-full justify-start h-8 text-sm"
                                  disabled={websites.length === 0}
                                >
                                  Blog
                                </Button>
                              </Link> */}
                              <Link
                                href="/dashboard/website/editor"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <Button
                                  variant={
                                    pathname === "/dashboard/website/editor"
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  className="w-full justify-start h-8 text-sm"
                                  disabled={websites.length === 0}
                                >
                                  Editor
                                </Button>
                              </Link>
                              <Link
                                href="/dashboard/website/all"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <Button
                                  variant={
                                    pathname === "/dashboard/website/all"
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  className="w-full justify-start h-8 text-sm"
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
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  className="w-full justify-start h-8 text-sm"
                                  disabled={websites.length === 0}
                                >
                                  Domains
                                </Button>
                              </Link>
                              <Link
                                href="/dashboard/website/integrations"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <Button
                                  variant={
                                    pathname ===
                                    "/dashboard/website/integrations"
                                      ? "secondary"
                                      : "ghost"
                                  }
                                  className="w-full justify-start h-8 text-sm"
                                  disabled={websites.length === 0}
                                >
                                  Integrations
                                </Button>
                              </Link>
                            </CollapsibleContent>
                          </Collapsible>

                          <Link
                            href="/dashboard/analytics"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant={
                                pathname.includes("/dashboard/analytics")
                                  ? "secondary"
                                  : "ghost"
                              }
                              className="w-full justify-start h-9 text-sm"
                            >
                              <BarChart3 className="h-4 w-4 mr-3" />
                              Analytics
                            </Button>
                          </Link>
                          <Link
                            href="/dashboard/media-library"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant={
                                pathname.includes("/dashboard/media-library")
                                  ? "secondary"
                                  : "ghost"
                              }
                              className="w-full justify-start h-9 text-sm"
                            >
                              <Image className="h-4 w-4 mr-3" />
                              Media Library
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="h-px bg-border my-4 mx-3" />

                      {/* Account Links */}
                      <div className="px-2">
                        <span className="text-xs font-medium text-muted-foreground px-3 mb-2 block">
                          ACCOUNT
                        </span>
                        <div className="space-y-1">
                          <Link
                            href="/dashboard/account/billing"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant={
                                pathname === "/dashboard/account/billing"
                                  ? "secondary"
                                  : "ghost"
                              }
                              className="w-full justify-start h-9 text-sm"
                            >
                              <CreditCard className="h-4 w-4 mr-3" />
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
                                  ? "secondary"
                                  : "ghost"
                              }
                              className="w-full justify-start h-9 text-sm"
                            >
                              <Users className="h-4 w-4 mr-3" />
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
                                  ? "secondary"
                                  : "ghost"
                              }
                              className="w-full justify-start h-9 text-sm"
                            >
                              <Settings className="h-4 w-4 mr-3" />
                              Settings
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t p-4">
                      {websites.length === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mb-3"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleCreateWebsite();
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create website
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
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
