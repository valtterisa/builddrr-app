"use client";

import * as React from "react";
import {
  BarChartIcon,
  Globe,
  HelpCircleIcon,
  ImageIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTeams } from "@/hooks/use-teams";

import { useRouter, useParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { TeamSwitcher } from "./team-switcher";

export function AppSidebar({
  className = "",
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: any }) {
  const { setOpenMobile, isMobile } = useSidebar();
  const params = useParams();
  const pathname = usePathname();
  const teamId =
    typeof params.teamID === "string"
      ? params.teamID
      : Array.isArray(params.teamID)
        ? params.teamID[0]
        : undefined;
  // const { teams, currentTeam, switchTeam, profile, isLoading } =
  //   useTeams(teamId);

  const teams = [
    {
      name: "Team 1",
      logo: Globe,
      role: "admin",
      team_id: "1",
    },
    {
      name: "Team 2",
      logo: Globe,
      role: "admin",
      team_id: "2",
    },
    {
      name: "Team 3",
      logo: Globe,
      role: "admin",
      team_id: "3",
    },
  ];

  const [websiteId, setWebsiteId] = useState<string | null>(null);

  useEffect(() => {
    // Extract website ID from the URL if present
    const match = pathname.match(/\/website\/([^/]+)/);
    if (match) {
      setWebsiteId(match[1]);
    } else {
      setWebsiteId(null);
    }
  }, [pathname]);

  // Helper to prefix dashboard URLs with /dashboard/[teamID]
  const withTeam = (path: string) =>
    teamId
      ? `/dashboard/${teamId}${path.startsWith("/") ? path : "/" + path}`
      : path;

  const navMain = [
    {
      title: "Dashboard",
      url: withTeam("/dashboard"),
      icon: LayoutDashboardIcon,
    },
    {
      title: "All Websites",
      url: withTeam("/dashboard/website/all"),
      icon: Globe,
    },
    // {
    //   title: "Analytics",
    //   url: withTeam("/dashboard/analytics"),
    //   icon: BarChartIcon,
    // },
    // {
    //   title: "Media Library",
    //   url: withTeam("/dashboard/media-library"),
    //   icon: ImageIcon,
    // },
    {
      title: "Team",
      url: withTeam("/dashboard/team"),
      icon: UsersIcon,
    },
  ];

  const navSecondary = [
    // {
    //   title: "Settings",
    //   url: withTeam("/settings"),
    //   icon: SettingsIcon,
    // },
    {
      title: "Get Help",
      url: withTeam("/help"),
      icon: HelpCircleIcon,
    },
    // {
    //   title: "Search",
    //   url: withTeam("/search"),
    //   icon: SearchIcon,
    // },
  ];

  function handleMobileClose() {
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar collapsible="offcanvas" className={className} {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      <SidebarContent className="flex-1 min-h-0 overflow-auto bg-sidebar">
        <NavMain items={navMain} handleMobileClose={handleMobileClose} />
        <NavSecondary
          items={navSecondary}
          className="mt-auto bg-sidebar"
          handleMobileClose={handleMobileClose}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
