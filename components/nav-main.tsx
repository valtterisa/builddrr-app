"use client";

import {
  MailIcon,
  PlusCircleIcon,
  type LucideIcon,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              aria-label="Quick Create"
            >
              <PlusCircleIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu role="menu">
          {items.map((item, idx) => {
            const submenuId = `sidebar-submenu-${idx}`;
            return (
              <SidebarMenuItem key={item.title} role="none">
                {item.children ? (
                  <Collapsible defaultOpen className="group/collapsible">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="bg-sidebar hover:bg-sidebar-hover"
                        aria-controls={submenuId}
                        aria-label={item.title}
                        role="menuitem"
                        tabIndex={0}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub id={submenuId} role="menu">
                        {item.children.map((sub) => (
                          <SidebarMenuSubItem key={sub.title} role="none">
                            <SidebarMenuSubButton
                              href={sub.url}
                              className="bg-sidebar hover:bg-sidebar-hover"
                              aria-label={sub.title}
                              role="menuitem"
                              tabIndex={0}
                              aria-current={
                                pathname === sub.url ? "page" : undefined
                              }
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
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="bg-sidebar hover:bg-sidebar-hover"
                    aria-label={item.title}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <Link
                      href={item.url}
                      aria-current={pathname === item.url ? "page" : undefined}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
