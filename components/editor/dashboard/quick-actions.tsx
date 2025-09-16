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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeedbackModal } from "@/components/feedback-modal";
import { UserSubscriptionData } from "@/lib/actions/user-profile";

export function QuickActions({
  userData,
}: {
  userData?: UserSubscriptionData;
}) {
  const router = useRouter();
  const plan = userData?.subscription.plan;
  const hasAccess = userData?.subscription.hasAccess || false;

  const handleCreateWebsite = () => {
    if (!hasAccess) {
      // Redirect to billing if no access
      router.push("/dashboard/account/billing");
    } else {
      router.push("/dashboard/website/create");
    }
  };

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
          <Button
            className="px-4 py-2 rounded-md bg-primary border font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCreateWebsite}
            disabled={!hasAccess}
            title={!hasAccess ? "Select a plan to use this feature" : undefined}
          >
            {!hasAccess ? "Select Plan" : "Generate"}
          </Button>
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
          <a
            href="https://docs.builddrr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-md bg-muted text-primary font-medium hover:bg-primary/10 transition border border-primary/30"
          >
            View Docs
          </a>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="flex flex-col items-center justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow border-primary/20 hover:border-primary">
        <CardHeader className="pb-2 flex flex-col items-center">
          <div className="rounded-full bg-primary/10 p-3 mb-2 text-primary">
            <MessageCircle className="h-7 w-7" />
          </div>
          <CardTitle className="text-lg font-semibold">Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Have ideas or issues? Let us know and help improve the platform.
          </p>
          <div className="flex flex-col gap-2">
            <FeedbackModal>
              <Button className="px-4 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition">
                Give Feedback
              </Button>
            </FeedbackModal>
            <a
              href="https://builddrr.featurebase.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md bg-muted text-primary font-medium hover:bg-primary/10 transition border border-primary/30 text-sm"
            >
              View Roadmap
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
