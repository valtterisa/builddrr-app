import type { Metadata } from "next";
import ContentCreationFunnel from "@/components/content/content-creation-funnel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Content - Social Media Platform",
  description:
    "Create and schedule content for multiple social media platforms",
};

export default function CreatePage() {
  return (
    <div className="flex flex-col space-y-6 container py-10 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Create New Post</h2>
      </div>

      <ContentCreationFunnel />
    </div>
  );
}
