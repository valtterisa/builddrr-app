"use client";

import {
  MailIcon,
  PlusCircleIcon,
  type LucideIcon,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export function NavMain({
  items,
  handleMobileClose,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    children?: {
      title: string;
      url: string;
      icon?: LucideIcon;
    }[];
  }[];
  handleMobileClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2 relative">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              aria-label="Quick Create"
              onClick={handleMobileClose}
            >
              <PlusCircleIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu role="menu">
          {items.map((item, idx) => {
            const submenuId = `sidebar-submenu-${idx}`;
            const isParentActive =
              pathname === item.url ||
              (item.children &&
                item.children.some((sub) => pathname === sub.url));
            return (
              <SidebarMenuItem key={item.title} role="none">
                {item.children ? (
                  <Collapsible defaultOpen className="group/collapsible">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        aria-controls={submenuId}
                        aria-label={item.title}
                        role="menuitem"
                        tabIndex={0}
                        isActive={isParentActive}
                      >
                        {item.icon && <item.icon />}
                        {item.title}
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub id={submenuId} role="menu">
                        {item.children.map((sub) => (
                          <SidebarMenuSubItem key={sub.title} role="none">
                            <SidebarMenuSubButton
                              href={sub.url}
                              aria-label={sub.title}
                              role="menuitem"
                              tabIndex={0}
                              isActive={pathname === sub.url}
                              aria-current={
                                pathname === sub.url ? "page" : undefined
                              }
                              onClick={handleMobileClose}
                            >
                              {sub.icon && <sub.icon />}
                              <span>{sub.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Link
                    href={item.url}
                    className={cn(
                      "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] bg-sidebar hover:bg-sidebar-hover hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-hover active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
                      pathname === item.url && "bg-sidebar-hover"
                    )}
                    aria-label={item.title}
                    role="menuitem"
                    tabIndex={0}
                    aria-current={pathname === item.url ? "page" : undefined}
                    onClick={handleMobileClose}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
