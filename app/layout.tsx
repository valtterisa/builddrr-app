import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SiteForge - Create Your Business Website in Minutes",
  description:
    "Generate a professional one-page website with AI or customize a template. No coding required.",
  generator: "SiteForge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster />
      </body>
    </html>
  );
}
