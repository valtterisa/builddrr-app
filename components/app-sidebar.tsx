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
  ChevronDown,
  LogOut,
  UserIcon,
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
import Logo from "./logo";
import { useTeams } from "@/hooks/use-teams";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export function AppSidebar({
  className = "",
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile, isMobile } = useSidebar();
  const params = useParams();
  const pathname = usePathname();
  const teamId =
    typeof params.teamID === "string"
      ? params.teamID
      : Array.isArray(params.teamID)
      ? params.teamID[0]
      : undefined;
  const { teams, currentTeam, switchTeam, profile, isLoading } = useTeams(teamId);
  const router = useRouter();
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

  // Helper function for website-specific URLs
  const withWebsite = (path: string) => {
    if (!teamId || !websiteId || websiteId === "all")
      return withTeam(`/website/all`);
    return withTeam(
      `/website/${websiteId}${path.startsWith("/") ? path : "/" + path}`
    );
  };

  const navMain = [
    {
      title: "Dashboard",
      url: withTeam(""),
      icon: LayoutDashboardIcon,
    },
    {
      title: "Website",
      url: "#",
      icon: Globe,
      children: [
        {
          title: "All Websites",
          url: withTeam("/website/all"),
        },
        {
          title: "Editor",
          url:
            websiteId && websiteId !== "all"
              ? withWebsite("/editor")
              : withTeam("/website/all"),
          disabled: !websiteId || websiteId === "all",
        },
        {
          title: "Integrations",
          url:
            websiteId && websiteId !== "all"
              ? withWebsite("/integrations")
              : withTeam("/website/all"),
          disabled: !websiteId || websiteId === "all",
        },
        {
          title: "Domains",
          url:
            websiteId && websiteId !== "all"
              ? withWebsite("/domains")
              : withTeam("/website/all"),
          disabled: !websiteId || websiteId === "all",
        },
      ],
    },
    {
      title: "Analytics",
      url: withTeam("/analytics"),
      icon: BarChartIcon,
    },
    {
      title: "Media Library",
      url: withTeam("/media-library"),
      icon: ImageIcon,
    },
    {
      title: "Team",
      url: withTeam("/team"),
      icon: UsersIcon,
    },
  ];

  const navSecondary = [
    {
      title: "Settings",
      url: withTeam("/settings"),
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: withTeam("/help"),
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: withTeam("/search"),
      icon: SearchIcon,
    },
  ];

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

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // When switching teams, update the URL but keep the current path (replace teamID)
  const handleSwitchTeam = (newTeamId: string) => {
    if (newTeamId !== teamId) {
      // Replace the teamID in the current path
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(
        /\/dashboard\/[^/]+/,
        `/dashboard/${newTeamId}`
      );
      router.push(newPath);
    }
    switchTeam(newTeamId);
    handleMobileClose();
  };

  return (
    <Sidebar collapsible="offcanvas" className={className} {...props}>
      <SidebarHeader className="bg-sidebar">
        <SidebarMenu className="bg-sidebar">
          <SidebarMenuItem className="bg-sidebar flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1 py-2 md:py-0">
              <Logo className="h-4 w-4 md:h-8 md:w-8" />
              <span className="font-bold text-2xl">Builddrr</span>
            </Link>
            <SidebarCloseButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Team Selector */}
      <div className="px-4 py-2 bg-sidebar border-b border-border">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center px-2 h-auto py-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        currentTeam?.team_id
                          ? `/api/team/${currentTeam?.team_id}/avatar`
                          : undefined
                      }
                    />
                    <AvatarFallback>
                      {currentTeam?.name?.substring(0, 2) || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">
                      {currentTeam?.name || "No Team"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {currentTeam?.role || ""}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Teams</DropdownMenuLabel>
              {teams.map((team) => (
                <DropdownMenuItem
                  key={team.team_id}
                  onClick={() => handleSwitchTeam(team.team_id)}
                  className={
                    team.team_id === currentTeam?.team_id ? "bg-muted" : ""
                  }
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={`/api/team/${team.team_id}/avatar`} />
                    <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span>{team.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={withTeam("/team")}
                  className="cursor-pointer"
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  <span>Manage Team</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={withTeam("/team/new")}
                  className="cursor-pointer"
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  <span>Create Team</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <SidebarContent className="flex-1 min-h-0 overflow-auto bg-sidebar">
        <NavMain items={navMain} handleMobileClose={handleMobileClose} />
        <NavSecondary
          items={navSecondary}
          className="mt-auto bg-sidebar"
          handleMobileClose={handleMobileClose}
        />
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <div className="flex items-center gap-2 p-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full h-auto p-0">
                <div className="p-4 flex items-center gap-2 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium text-sm">
                      {profile?.full_name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href={withTeam("/settings/profile")}
                  className="cursor-pointer"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

