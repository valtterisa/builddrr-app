"use server";

import {
  generateAppName,
  getFlyRegistryUrl,
  parseAIResponse,
} from "@/lib/utils";
import { FileOperation } from "@/lib/types";
import {
  addWebsiteUser,
  createWebsite,
  getWebsite,
  updateWebsite,
} from "./database";
import { revalidatePath } from "next/cache";

export type WebsiteCreationData = {
  name: string;
  description?: string;
  prompt?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  industry?: string;
  components?: string[];
  template?: string;
};

export type WebsiteCreationResult = {
  success: boolean;
  machine?: any;
  appName?: string;
  error?: string;
};

/**
 * Here we define all the routes to the backend API. U
 * 1. Create a new app and assign a machine to it -> createAppAndAssignMachine
 * 2. Update a machine files -> updateMachineWithFiles
 * 3. Start a machine -> startMachine
 * 4. Stop a machine -> stopMachine
 * 5. Restart a machine -> restartMachine
 * 6. Delete a machine -> deleteMachine
 * 7. Get a machine by id -> getMachineById
 * 8. Get all machines for a user -> getMachinesByUserId
 * 9. Get all machines for a website -> getMachinesByWebsiteId
 */

/**
 * Assign a machine to a user's website
 * @param userId User ID
 * @param websiteName Website name
 * @param files File operations to add to the machine
 * @returns Machine data
 */
export async function createAppAndAssignMachine(
  userId: string,
  appName: string,
  files?: FileOperation[]
) {
  // Check if FLY_API_TOKEN is set
  if (!process.env.FLY_API_TOKEN) {
    console.error("FLY_API_TOKEN environment variable is not set");
    throw new Error(
      "FLY_API_TOKEN is not set. Please configure your environment variables."
    );
  }

  let imageTag = `${getFlyRegistryUrl(appName)}:latest`; // This is pushed to fly registry so save this

  // Call to backend to create app and machines
  const response = await fetch(process.env.PREVIEW_DEPLOY_URL!, {
    method: "POST",
    body: JSON.stringify({
      imageTag: imageTag,
      appName: appName,
      websiteName: appName,
      userId: userId,
      files: files,
    }),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.PREVIEW_DEPLOY_API_KEY!,
    },
  });

  const machine = await response.json();

  console.log("Machine", machine);

  // Return the machine data that will be used in the website record
  return { machine: machine, success: machine.success };
}

/**
 * Delete a project by its ID (UUID).
 * This will call the backend /api/delete-project endpoint with the correct parameters.
 * @param id The website/project UUID
 * @returns Result of the deletion operation
 */
export async function deleteProjectById(id: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
}> {
  try {
    // Get the website/project from Supabase
    const website = await getWebsite(id);
    if (!website) {
      return { success: false, error: "Project not found" };
    }
    if (!website.app_name) {
      return { success: false, error: "Project app_name not found" };
    }

    // Prepare parameters for the backend API
    const gitlabRepo = `bittive-group/${website.app_name}`;
    const cloudflareProject = website.app_name;
    const slug = website.app_name;

    // Call the backend API endpoint
    const response = await fetch("http://localhost:3001/api/delete-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gitlabRepo, cloudflareProject, slug }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: "Failed to delete project. Try again later.",
        details: result.details,
      };
    }

    // Mark the website record as deleted in Supabase (set deleted_at to now)
    await updateWebsite(id, { deleted_at: new Date().toISOString() });

    return {
      success: true,
      message: result.message || "Project deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Unknown error",
    };
  }
}

/**
 * Mock implementation of AI content generation
 */
async function getMockAIResponse(prompt: string): Promise<string> {
  // In production, this would call an actual AI service
  // For now, we'll use a mock response
  console.log("Using mock AI response for prompt:", prompt);

  // Using a hardcoded mock response
  const mockResponse = `
<siteforge-code>
<siteforge-steps>
1. Analyze the business description and extract key features.
2. List all required components for the website.
3. Plan the implementation for each component (structure, data, styling, etc).
4. Design the overall layout and color scheme.
5. Plan responsive design and breakpoints.
6. Select and customize shadcn/ui components.
7. Plan framer-motion animations for UI elements.
8. Suggest additional components to enhance user experience.
9. Ensure all required components are included in the plan.
10. Generate code for all components and pages.
11. Project created!
</siteforge-steps>

<component-analysis>
1. Business Description Analysis:
   a. Main points: Software agency
   b. Unique selling points: Need to emphasize technical expertise, innovation, and reliability

2. Required Components:
   - Header with responsive navigation
   - Footer with proper site structure
   - Hero section
   - Testimonials section

3. Component Implementation:
   a. Header:
      - Structure: Logo, navigation links, CTA button
      - Data: Navigation items (Home, Services, About, Projects, Contact)
      - Styling: Fixed position, transparent on hero section, solid elsewhere        
      - shadcn/ui: NavigationMenu, Button
      - Accessibility: Proper ARIA labels, keyboard navigation
      - User interactions: Mobile hamburger menu, hover effects
      - Performance: Minimal JS for toggle functionality

   b. Footer:
      - Structure: Logo, site links, contact info, social links, copyright
      - Data: Navigation links, contact details, social media links
      - Styling: Dark background with proper spacing
      - shadcn/ui: Button for CTA
      - Accessibility: Proper heading structure, link descriptions
      - Performance: Static rendering

   c. Hero:
      - Structure: Headline, subheading, CTA buttons, background image/pattern       
      - Data: Company tagline, brief description
      - Styling: Full-width, gradient background with primary/secondary colors       
      - shadcn/ui: Button for CTAs
      - Animations: Text fade-in, subtle background animation
      - Responsive: Text size adjustments, layout changes

   d. Testimonials:
      - Structure: Heading, testimonial cards with quotes and attribution
      - Data: Customer quotes, names, companies, optional avatars
      - Styling: Card-based layout with accent color highlights
      - shadcn/ui: Card, Avatar components
      - Animations: Card reveal on scroll
      - Responsive: Grid to single column layout

4. Overall Layout:
   - Modern, clean design with ample whitespace
   - Content-focused with clear hierarchy
   - Consistent padding and spacing

5. Color Scheme Usage:
   - Primary (#6366F1): Main brand color, buttons, key headings
   - Secondary (#8B5CF6): Accents, gradients, secondary elements
   - Accent (#EC4899): Highlights, call-to-action elements, emphasis

6. Responsive Strategy:
   - Mobile-first approach
   - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
   - Header transforms to hamburger menu on mobile
   - Grid layouts adjust columns based on screen size

7. shadcn/ui Components:
   - Button: CTAs throughout the site
   - NavigationMenu: Header navigation
   - Sheet: Mobile navigation
   - Card: Testimonials
   - Avatar: Team/testimonial images

8. Animation Plan:
   - Subtle entrance animations for hero elements
   - Scroll-triggered animations for testimonials
   - Hover effects on interactive elements
   - Page transitions

9. Additional Suggested Components:
   - Services section: Showcase the agency's expertise
   - Projects/Portfolio: Display past work
   - Team section: Highlight team members
   - Contact form: Allow potential clients to reach out

10. All required components are accounted for in this plan.
</component-analysis>

<siteforge-code>

<siteforge-write file="/components/site-components/header/header.tsx">
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import NavLinks from "./nav-links";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",     
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLinks className="flex items-center space-x-6" />
          <Button className="bg-primary hover:bg-primary/90">Contact Us</Button>     
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col h-full">
              <div className="flex justify-end py-4">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetTrigger>
              </div>
              <NavLinks className="flex flex-col space-y-6 text-lg" />
              <div className="mt-auto py-6">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Contact Us
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
};

export default Header;
</siteforge-write>

<siteforge-write file="/components/site-components/header/logo.tsx">
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center">
      <motion.div
        className="text-2xl font-bold flex items-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <span className="text-primary">Bittive</span>
        <span className="text-secondary ml-1">Oy</span>
      </motion.div>
    </Link>
  );
};

export default Logo;
</siteforge-write>

<siteforge-write file="/components/site-components/header/nav-links.tsx">
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  className?: string;
}

const navItems = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

const NavLinks: React.FC<NavLinksProps> = ({ className }) => (
  <nav className={cn(className)} aria-label="Main navigation">
    {navItems.map((item) => (
      <motion.div
        key={item.name}
        whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <Link
          href={item.href}
          className="text-base font-medium text-gray-700 hover:text-primary transition-colors"
        >
          {item.name}
        </Link>
      </motion.div>
    ))}
  </nav>
);

export default NavLinks;
</siteforge-write>

<siteforge-write file="/app/services/page.tsx">
import React from "react";

const ServicesPage = () => (
  <main className="container mx-auto py-16">
    <h1 className="text-4xl font-bold mb-6">Our Services</h1>
    <p className="text-lg text-gray-700 mb-4">
      We offer a range of software development and consulting services to help your business grow.
    </p>
    <ul className="list-disc pl-6 space-y-2">
      <li>Custom Web Application Development</li>
      <li>UI/UX Design</li>
      <li>Cloud & DevOps Consulting</li>
      <li>Mobile App Development</li>
      <li>Technical Support & Maintenance</li>
    </ul>
  </main>
);

export default ServicesPage;
</siteforge-write>

<siteforge-write file="/app/about/page.tsx">
import React from "react";

const AboutPage = () => (
  <main className="container mx-auto py-16">
    <h1 className="text-4xl font-bold mb-6">About Us</h1>
    <p className="text-lg text-gray-700 mb-4">
      Bittive Oy is a software agency focused on delivering high-quality, innovative solutions for businesses of all sizes.
    </p>
    <p className="text-lg text-gray-700">
      Our team combines technical expertise with a passion for problem-solving, ensuring every project is a success.
    </p>
  </main>
);

export default AboutPage;
</siteforge-write>

<siteforge-write file="/app/projects/page.tsx">
import React from "react";

const ProjectsPage = () => (
  <main className="container mx-auto py-16">
    <h1 className="text-4xl font-bold mb-6">Our Projects</h1>
    <p className="text-lg text-gray-700 mb-4">
      Explore some of the projects we have delivered for our clients.
    </p>
    <ul className="list-disc pl-6 space-y-2">
      <li>Project Alpha - SaaS Platform for Retail</li>
      <li>Beta CRM - Customer Relationship Management Tool</li>
      <li>Gamma Analytics - Data Visualization Suite</li>
    </ul>
  </main>
);

export default ProjectsPage;
</siteforge-write>
<siteforge-write file="/app/page.tsx">
import React from "react";

import Header from "@/components/site-components/header/header";

const HomePage = () => (
  <>
    <Header />
    <main className="pt-32 container mx-auto text-center">
      <section className="py-20">
        <h1 className="text-5xl font-bold mb-6">Welcome to Bittive Oy</h1>
        <p className="text-xl text-gray-700 mb-8">
          We build modern, scalable, and beautiful web solutions for your business.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/services" className="bg-primary text-white px-6 py-3 rounded hover:bg-primary/90 transition">Our Services</a>
          <a href="/contact" className="bg-secondary text-white px-6 py-3 rounded hover:bg-secondary/90 transition">Contact Us</a>
        </div>
      </section>
    </main>
  </>
);

export default HomePage;
</siteforge-write>
</siteforge-code>`;

  return mockResponse;
}

/**
 * Unified function to handle website creation from any source
 * Works with both guided builder and AI prompt tool
 *
 * @param userId The authenticated user ID
 * @param data Website creation data from form or prompt
 * @param appName The app name (slug) for the website
 * @param onStep Optional callback to update step status
 * @returns Result with website and deployment information
 */
export async function createAndDeployWebsite(
  userId: string,
  data: WebsiteCreationData,
  appName: string
): Promise<WebsiteCreationResult> {
  let website: any = null;

  try {
    // Step 1: Create initial website record
    const websiteInitialData = {
      name: data.name,
      description: data.description || "",
      published: false,
      app_name: appName,
      status: "creating",
      settings: {
        colors: data.colors,
        components: data.components,
        industry: data.industry,
      },
      template_id: data.template || null,
      subdomain: null,
      primary_domain: null,
    };
    website = await createWebsite(userId, websiteInitialData);
    if (!website) {
      throw new Error("Failed to create initial website record");
    }

    // 1. Fork repository with app name as slug
    // const forkResponse = await fetch(`http://localhost:3001/api/fork`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ slug: appName }),
    // });
    // const repositoryUrl = `https://gitlab.com/bittive-group/${appName}`;
    // if (!forkResponse.ok) {
    // } else {
    //   const contentType = forkResponse.headers.get("content-type");
    //   if (contentType && contentType.includes("application/json")) {
    //     await forkResponse.json();
    //     try {
    //       await updateWebsite(website.id, { repository_url: repositoryUrl });
    //     } catch (error) {}
    //   }
    // }

    // Generate custom domain
    const customDomain = `${appName}.siteforge.bittive.com`;

    // 2. Create pages with same slug
    // const pagesResponse = await fetch(
    //   `http://localhost:3001/api/pages-create`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ slug: appName }),
    //   }
    // );
    // if (!pagesResponse.ok) {
    // } else {
    //   const contentType = pagesResponse.headers.get("content-type");
    //   if (contentType && contentType.includes("application/json")) {
    //     await pagesResponse.json();
    //   }
    // }

    // 3. Start wire-domain process (don't await the response)
    // fetch(`http://localhost:3001/api/wire-domain`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ slug: appName }),
    // })
    //   .then((response) => {
    //     if (!response.ok) return;
    //     const contentType = response.headers.get("content-type");
    //     if (contentType && contentType.includes("application/json")) {
    //       return response.json();
    //     }
    //   })
    //   .then(async (data) => {
    //     if (data && data.success) {
    //       try {
    //         const customDomain = `${appName}.siteforge.bittive.com`;
    //         await updateWebsite(website.id, { primary_url: customDomain });
    //       } catch (error) {}
    //     }
    //   })
    //   .catch(() => {});

    // Step 1.6: Add the user as the admin in the website_users table
    try {
      await addWebsiteUser(website.id, userId, "admin");
    } catch (error) {
      throw new Error("Failed to add user as admin in website_users table");
    }

    // Step 2: Generate website content
    let aiResponse;
    if (data.prompt) {
      aiResponse = await getMockAIResponse(data.prompt);
    } else {
      const structuredPrompt = `Create a website for ${data.name} in the ${data.industry || "business"} industry.\n${data.description ? `Description: ${data.description}` : ""}\nComponents: ${data.components?.join(", ") || "standard website components"}`;
      aiResponse = await getMockAIResponse(structuredPrompt);
    }
    if (!aiResponse) {
      await updateWebsite(website.id, { status: "failed" });
      throw new Error("Failed to generate website content");
    }

    // Step 3: Parse AI response to get file operations
    const files = await parseAIResponse(aiResponse);
    if (files.length === 0) {
      await updateWebsite(website.id, { status: "failed" });
      throw new Error("No valid file operations found in AI response");
    }

    // Step 4: Update status to "deploying" before starting the deployment process
    await updateWebsite(website.id, { status: "deploying" });

    // Step 5: Deploy to Fly.io
    const deployResult = await createAppAndAssignMachine(
      userId,
      appName,
      files
    );
    if (!deployResult.success) {
      await updateWebsite(website.id, { status: "failed" });
    }

    const machine = deployResult.machine.appMachines[0];
    const machineId = machine.id;
    const url = machine.url;

    // Step 6: Update website record with deployment info
    await updateWebsite(website.id, {
      preview_url: url,
      published: true,
      status: "preview",
      machine_id: machineId,
      last_deployed: new Date().toISOString(),
      repository_url: `https://gitlab.com/bittive-group/${appName}`,
    });

    // Step 7: Revalidate paths
    revalidatePath("/dashboard/website/all");
    revalidatePath(`/website/editor/${appName}`);

    return {
      success: true,
      machine: machine,
      appName,
    };
  } catch (error) {
    try {
      if (typeof website !== "undefined" && website && website.id) {
        await updateWebsite(website.id, { status: "failed" });
      }
    } catch {}
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Deploy an existing website by its ID
 *
 * @param websiteId The website's unique identifier
 * @returns Deployment result with status and URL information
 */
export async function deployWebsite(websiteId: string): Promise<{
  success: boolean;
  data?: {
    url?: string;
    status?: string;
    message?: string;
  };
  error?: string;
}> {
  try {
    console.log(`Starting deployment for website ID: ${websiteId}`);

    // Step 1: Get website details from database to retrieve the app_name (slug)
    const website = await getWebsite(websiteId);

    if (!website) {
      throw new Error(`Website with ID ${websiteId} not found`);
    }

    if (!website.app_name) {
      throw new Error(
        `Website with ID ${websiteId} has no app_name (slug) configured`
      );
    }

    // Update status to "deploying" to indicate deployment in progress
    await updateWebsite(websiteId, {
      status: "deploying",
    });
    console.log(`Website status updated to "deploying"`);

    const appName = website.app_name;
    console.log(`Retrieved app name: ${appName} for website ID: ${websiteId}`);

    // Step 2: Call the deployment API
    console.log(`Calling deploy API with slug=${appName}`);
    const deployResponse = await fetch(`http://localhost:3001/api/deploy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug: appName }),
    });

    if (!deployResponse.ok) {
      const errorText = await deployResponse
        .text()
        .catch(() => "Unknown error");
      // Update status to reflect deployment failure
      await updateWebsite(websiteId, {
        status: "failed",
      });
      console.log(`Website status updated to "failed" due to deployment error`);
      throw new Error(
        `Deploy API returned status ${deployResponse.status}: ${errorText}`
      );
    }

    // Check content type to ensure it's JSON
    const contentType = deployResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // Update status to reflect deployment failure
      await updateWebsite(websiteId, {
        status: "failed",
      });
      console.log(
        `Website status updated to "failed" due to invalid response format`
      );
      throw new Error(
        `Deploy API did not return JSON. Content type: ${contentType}`
      );
    }

    const deployData = await deployResponse.json();
    console.log("Deploy API response:", deployData);

    // Step 3: Update website record with latest deployment info
    await updateWebsite(websiteId, {
      status: "deployed", // Update status to "deployed" after successful deployment
      last_deployed: new Date().toISOString(),
    });

    console.log(
      `Website record updated with latest deployment timestamp and status "deployed"`
    );

    // Step 4: Revalidate paths to reflect changes in UI
    revalidatePath("/dashboard/website/all");
    revalidatePath(`/website/editor/${websiteId}`);

    return {
      success: true,
      data: {
        url: website.primary_url || deployData.url,
        status: "deployed",
        message: "Website deployed successfully",
      },
    };
  } catch (error) {
    console.error("Error in deployWebsite:", error);
    // Ensure status is updated to "failed" on any uncaught exceptions
    try {
      await updateWebsite(websiteId, {
        status: "failed",
      });
      console.log(`Website status updated to "failed" due to unhandled error`);
    } catch (updateError) {
      console.error(
        "Failed to update website status to 'failed':",
        updateError
      );
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if an app exists in Fly.io
 * @param appName The name of the app to check
 * @returns True if the app exists, false otherwise
 */
export async function checkAppExists(appName: string): Promise<boolean> {
  const response = await fetch(
    `${process.env.FLY_API_BASE}/v1/apps/${appName}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  if (data.error === "app not found") {
    return false;
  } else {
    return true;
  }
}

/**
 * Start a machine
 * @param appName The name of the app
 * @param machineId The ID of the machine to start
 * @returns True if the machine was started, false otherwise
 */
export async function startMachine(appName: string, machineId: string) {
  console.log("Starting machine", appName, machineId);
  try {
    const response = await fetch(
      `${process.env.FLY_API_BASE}/v1/apps/${appName}/machines/${machineId}/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
        },
      }
    );
    const data = await response.json();
    console.log("Machine started", data);

    const machineState = await fetch(
      `${process.env.FLY_API_BASE}/v1/apps/${appName}/machines/${machineId}/wait?state=started`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.FLY_API_TOKEN}`,
        },
      }
    );
    const machineStateData = await machineState.json();
    console.log("Machine state", machineStateData);

    return { started: "ok" };
  } catch (error) {
    console.error("Error starting machine:", error);
    return { started: "error" };
  }
}
