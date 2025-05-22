import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricsCards() {
  return (
    <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">+2 from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">880</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Media Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">42</div>
          <p className="text-xs text-muted-foreground">+8 from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1.2 GB</div>
          <p className="text-xs text-muted-foreground">of 5 GB (24%)</p>
        </CardContent>
      </Card>
    </div>
  );
}
