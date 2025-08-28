import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: "Builddrr",
  description:
    "Generate a professional one-page website with AI or customize a template. No coding required.",
  generator: "builddrr",
};

const geist = Geist({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className}`}>
        <PostHogProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  );
}
