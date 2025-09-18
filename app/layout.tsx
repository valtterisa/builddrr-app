import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode, Suspense } from "react";
import { SandboxState } from "@/components/modals/sandbox-state";
import { ChatProvider } from "@/lib/chat-context";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://builddrr.com"),
  title: "Builddrr - Make websites with AI",
  description: "Generate a professional website with AI. No coding required.",
  openGraph: {
    title: "Builddrr - Make websites with AI",
    description: "Generate a professional website with AI. No coding required.",
    url: "https://builddrr.com",
    siteName: "Builddrr",
    images: "/og-image.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Builddrr - Make websites with AI",
    description:
      "Generate a professional one-page website with AI. No coding required.",
    images: "/og-image.png",
  },
};

const geist = Geist({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.className} antialiased bg-background text-foreground`}
      >
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            forcedTheme="light"
            disableTransitionOnChange
          >
            <NuqsAdapter>
              <ChatProvider>{children}</ChatProvider>
            </NuqsAdapter>
          </ThemeProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
