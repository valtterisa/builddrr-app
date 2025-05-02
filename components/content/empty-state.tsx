import { Button } from "@/components/ui/button";
import { Calendar, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
        <Calendar className="h-10 w-10 text-purple-600" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold">No content scheduled yet</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Start creating and scheduling content for your social media platforms.
      </p>
      <Link href="/dashboard/content/create" className="mt-6">
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Create Your First Post
        </Button>
      </Link>
    </div>
  );
}
