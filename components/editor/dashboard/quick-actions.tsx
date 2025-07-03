import {
  Code,
  FileText,
  Globe,
  LayoutGrid,
  Upload,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Generate Website */}
      <Card className="flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow border-primary/20 hover:border-primary">
        <CardHeader className="pb-2 flex flex-col items-center">
          <div className="rounded-full bg-primary/10 p-3 mb-2 text-primary">
            <Globe className="h-7 w-7" />
          </div>
          <CardTitle className="text-lg font-semibold">
            Generate Website
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Start building a new website project in seconds.
          </p>
          <button className="px-4 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition">
            Generate
          </button>
        </CardContent>
      </Card>

      {/* Get Help / Documentation */}
      <Card className="flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow border-primary/20 hover:border-primary">
        <CardHeader className="pb-2 flex flex-col items-center">
          <div className="rounded-full bg-primary/10 p-3 mb-2 text-primary">
            <BookOpen className="h-7 w-7" />
          </div>
          <CardTitle className="text-lg font-semibold">
            Get Help / Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Read guides, FAQs, and tips to get the most out of the platform.
          </p>
          <Link
            href="/docs"
            className="px-4 py-2 rounded-md bg-muted text-primary font-medium hover:bg-primary/10 transition border border-primary/30"
          >
            View Docs
          </Link>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow border-primary/20 hover:border-primary">
        <CardHeader className="pb-2 flex flex-col items-center">
          <div className="rounded-full bg-primary/10 p-3 mb-2 text-primary">
            <MessageCircle className="h-7 w-7" />
          </div>
          <CardTitle className="text-lg font-semibold">Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Have ideas or issues? Let us know and help improve the platform.
          </p>
          <a
            href="https://feedback.yourdomain.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-md bg-muted text-primary font-medium hover:bg-primary/10 transition border border-primary/30"
          >
            Give Feedback
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
