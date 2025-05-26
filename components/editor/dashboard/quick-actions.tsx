import { Code, FileText, Globe, LayoutGrid, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {/* Create Website */}
          <div className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-all hover:border-primary hover:bg-primary/5">
            <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="mb-1 font-medium">Create New Website</h3>
            <p className="text-xs text-muted-foreground">
              Start building a new website project
            </p>
          </div>

          {/* Upload Media */}
          <div className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-all hover:border-primary hover:bg-primary/5">
            <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="mb-1 font-medium">Upload Media</h3>
            <p className="text-xs text-muted-foreground">
              Add new images or videos to your library
            </p>
          </div>

          {/* Create Template */}
          <div className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-all hover:border-primary hover:bg-primary/5">
            <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <h3 className="mb-1 font-medium">Create Template</h3>
            <p className="text-xs text-muted-foreground">
              Save a reusable website template
            </p>
          </div>

          {/* Add Domain */}
          <div className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-all hover:border-primary hover:bg-primary/5">
            <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="mb-1 font-medium">Add Domain</h3>
            <p className="text-xs text-muted-foreground">
              Connect a custom domain to your site
            </p>
          </div>

          {/* Create Blog Post */}
          <div className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-all hover:border-primary hover:bg-primary/5">
            <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mb-1 font-medium">Create Blog Post</h3>
            <p className="text-xs text-muted-foreground">
              Write and publish a new article
            </p>
          </div>

          {/* Add Integration */}
          <div className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-all hover:border-primary hover:bg-primary/5">
            <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <Code className="h-6 w-6" />
            </div>
            <h3 className="mb-1 font-medium">Add Integration</h3>
            <p className="text-xs text-muted-foreground">
              Connect third-party services
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
