"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "../../app-sidebar";
import { SidebarInset, SidebarProvider } from "../../ui/sidebar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Define website type
type Website = {
  id: string;
  name: string;
  custom_domain: string | null;
  primary_domain: string;
  status: string;
  is_active?: boolean; // Optional property to indicate if the website is active
};

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
          .from("websites_old")
          .select("*")
          .is("deleted_at", null)
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

  // If on editor page, show chat on left instead of sidebar
  if (pathname?.includes("editor")) {
    return (
      <SidebarProvider>
        <SidebarInset className="rounded-3xl min-w-0 flex-1">
          {children}
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen p-2 md:p-4 w-full">
        <AppSidebar className="hidden md:flex pt-2" user={user} />
        <SidebarInset className="rounded-3xl min-w-0 flex-1">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
