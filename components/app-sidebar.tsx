"use client";

import * as React from "react";
import {
  BarChartIcon,
  Book,
  Globe,
  HelpCircleIcon,
  House,
  ImageIcon,
  LayoutDashboardIcon,
  MessageCircle,
  PlusCircle,
  Map,
  Network,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { AIUsageSidebar } from "@/components/ai-usage-sidebar";
import { FeedbackModal } from "@/components/feedback-modal";
import { Button } from "@/components/ui/button";
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
import Logo from "./logo";

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
      type: "item" as const,
      title: "Overview",
      url: withTeam("/dashboard"),
      icon: House,
    },
    { type: "label" as const, label: "Product" },

    {
      type: "item" as const,
      title: "All Websites",
      url: withTeam("/dashboard/website/all"),
      icon: Globe,
    },
    {
      type: "item" as const,
      title: "Create Website",
      url: withTeam("/dashboard/website/create"),
      icon: PlusCircle,
    },
    {
      type: "item" as const,
      title: "Domains",
      url: withTeam("/dashboard/domains"),
      icon: Network,
    },
    // {
    //   type: "item" as const,
    //   title: "Settings",
    //   url: withTeam("/dashboard/settings"),
    //   icon: Settings,
    // },
    // {
    //   type: "item" as const,
    //   title: "Team",
    //   url: withTeam("/dashboard/team"),
    //   icon: UsersIcon,
    // },
  ];

  const navSecondary = [
    // {
    //   title: "Settings",
    //   url: withTeam("/settings"),
    //   icon: SettingsIcon,
    // },
    {
      title: "Documentation",
      url: "https://docs.builddrr.com",
      target: "_blank",
      icon: Book,
    },
    {
      title: "Roadmap",
      url: "https://builddrr.featurebase.app/",
      target: "_blank",
      icon: Map,
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
        <div className="h-12 flex items-center text-xl font-bold text-gray-900 text-center ">
          <span className="flex items-center">
            <Logo className="mx-2 size-7" />
            Builddrr
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 min-h-0 overflow-auto bg-sidebar">
        <NavMain items={navMain} handleMobileClose={handleMobileClose} />

        {/* AI Usage Component */}
        <AIUsageSidebar />

        <NavSecondary
          items={navSecondary}
          className="mt-auto bg-sidebar"
          handleMobileClose={handleMobileClose}
        />

        {/* Quick Feedback Button */}
        <div className="p-4 border-t border-sidebar-border">
          <FeedbackModal>
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="h-4 w-4 mr-2" />
              Give Feedback
            </Button>
          </FeedbackModal>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
