import { Globe, ImageIcon, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm">Website "AI Generated Website" updated</p>
            <p className="text-xs text-muted-foreground">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <ImageIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm">3 new media files uploaded</p>
            <p className="text-xs text-muted-foreground">Yesterday</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm">Team member invited</p>
            <p className="text-xs text-muted-foreground">3 days ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
