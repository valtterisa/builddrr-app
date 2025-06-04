"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  Globe,
  Globe2,
  HelpCircleIcon,
  Image,
  ImageIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  X,
  Zap,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Website",
      url: "#",
      icon: Globe,
      children: [
        {
          title: "All Websites",
          url: "/dashboard/website/all",
        },
        {
          title: "Integrations",
          url: "/dashboard/website/integrations",
        },
        {
          title: "Domains",
          url: "/dashboard/website/domains",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChartIcon,
    },
    {
      title: "Media Library",
      url: "/dashboard/media-library",
      icon: ImageIcon,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: UsersIcon,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "/dashboard/help",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "/dashboard/search",
      icon: SearchIcon,
    },
  ],
};

export function AppSidebar({
  className = "",
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile, isMobile } = useSidebar();

  function handleMobileClose() {
    if (isMobile) setOpenMobile(false);
  }

  function SidebarCloseButton() {
    if (!isMobile) return null;
    return (
      <button
        type="button"
        aria-label="Close sidebar"
        className="z-50 p-2 rounded hover:bg-muted"
        onClick={() => setOpenMobile(false)}
      >
        <X className="w-5 h-5" />
      </button>
    );
  }

  return (
    <Sidebar collapsible="offcanvas" className={className} {...props}>
      <SidebarHeader className="bg-sidebar">
        <SidebarMenu className="bg-sidebar">
          <SidebarMenuItem className="bg-sidebar flex items-center justify-center">
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">builddrr</span>
              </Link>
            </SidebarMenuButton>
            <SidebarCloseButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex-1 min-h-0 overflow-auto bg-sidebar">
        <NavMain items={data.navMain} handleMobileClose={handleMobileClose} />
        <NavSecondary
          items={data.navSecondary}
          className="mt-auto bg-sidebar"
          handleMobileClose={handleMobileClose}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
