"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowRight,
  BarChart4,
  Check,
  ExternalLink,
  Globe,
  Key,
  LayoutGrid,
  Lock,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Terminal,
  ToggleLeft,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DashboardShell } from "@/components/ui/sidebar";

type IntegrationType = {
  id: string;
  name: string;
  description: string;
  category:
    | "analytics"
    | "marketing"
    | "ecommerce"
    | "content"
    | "developers"
    | "communication";
  icon: JSX.Element;
  connected: boolean;
  popular?: boolean;
  planLevel: "starter" | "pro" | "enterprise" | "all";
};

type ApiKeyType = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
};

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("starter");
  const [integrations, setIntegrations] = useState<IntegrationType[]>([]);
  const [activeIntegrations, setActiveIntegrations] = useState<
    IntegrationType[]
  >([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyType[]>([]);
  const [selectedIntegration, setSelectedIntegration] =
    useState<IntegrationType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");

  useEffect(() => {
    // Mock integrations data
    const mockIntegrations: IntegrationType[] = [
      {
        id: "1",
        name: "Google Analytics",
        description: "Track website traffic and user behavior",
        category: "analytics",
        icon: <BarChart4 className="h-6 w-6" />,
        connected: false,
        popular: true,
        planLevel: "all",
      },
      {
        id: "2",
        name: "Mailchimp",
        description: "Email marketing automation",
        category: "marketing",
        icon: <MessageSquare className="h-6 w-6" />,
        connected: false,
        popular: true,
        planLevel: "all",
      },
      {
        id: "3",
        name: "Shopify",
        description: "E-commerce platform integration",
        category: "ecommerce",
        icon: <ShoppingCart className="h-6 w-6" />,
        connected: false,
        planLevel: "pro",
      },
      {
        id: "4",
        name: "Cloudflare",
        description: "CDN and security for your website",
        category: "content",
        icon: <Globe className="h-6 w-6" />,
        connected: false,
        planLevel: "pro",
      },
      {
        id: "5",
        name: "Zapier",
        description: "Connect your site with 3,000+ apps",
        category: "developers",
        icon: <LayoutGrid className="h-6 w-6" />,
        connected: false,
        planLevel: "pro",
      },
      {
        id: "6",
        name: "Stripe",
        description: "Payment processing for online businesses",
        category: "ecommerce",
        icon: <ShoppingCart className="h-6 w-6" />,
        connected: plan !== "starter",
        popular: true,
        planLevel: "pro",
      },
      {
        id: "7",
        name: "Segment",
        description: "Customer data platform",
        category: "analytics",
        icon: <BarChart4 className="h-6 w-6" />,
        connected: false,
        planLevel: "enterprise",
      },
      {
        id: "8",
        name: "Intercom",
        description: "Customer messaging platform",
        category: "communication",
        icon: <MessageSquare className="h-6 w-6" />,
        connected: false,
        planLevel: "pro",
      },
      {
        id: "9",
        name: "Algolia",
        description: "Search functionality for your website",
        category: "content",
        icon: <Search className="h-6 w-6" />,
        connected: false,
        planLevel: "pro",
      },
      {
        id: "10",
        name: "HubSpot",
        description: "CRM, Marketing, Sales & Service",
        category: "marketing",
        icon: <MessageSquare className="h-6 w-6" />,
        connected: false,
        planLevel: "pro",
      },
      {
        id: "11",
        name: "Contentful",
        description: "Headless CMS platform",
        category: "content",
        icon: <LayoutGrid className="h-6 w-6" />,
        connected: false,
        planLevel: "enterprise",
      },
      {
        id: "12",
        name: "Sentry",
        description: "Error tracking and monitoring",
        category: "developers",
        icon: <Terminal className="h-6 w-6" />,
        connected: false,
        planLevel: "pro",
      },
    ];

    // Mock API keys
    const mockApiKeys: ApiKeyType[] =
      plan !== "starter"
        ? [
            {
              id: "1",
              name: "Website Frontend",
              key: "sk_live_XXXXXXXXXXXXXXXXXXXX",
              createdAt: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              lastUsed: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ]
        : [];

    setIntegrations(mockIntegrations);
    setActiveIntegrations(mockIntegrations.filter((i) => i.connected));
    setApiKeys(mockApiKeys);
    setIsLoading(false);
  }, [plan]);

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Only show integrations that are available on the user's plan or all plans
    const isAvailableForPlan =
      integration.planLevel === "all" ||
      (plan === "pro" &&
        (integration.planLevel === "pro" ||
          integration.planLevel === "starter")) ||
      plan === "enterprise";

    return matchesSearch && isAvailableForPlan;
  });

  const handleConnectIntegration = (integration: IntegrationType) => {
    if (integration.planLevel !== "all" && plan === "starter") {
      setShowUpgradeDialog(true);
      return;
    }

    setSelectedIntegration(integration);
    setShowConnectDialog(true);
  };

  const handleDisconnectIntegration = (integrationId: string) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === integrationId
          ? { ...integration, connected: false }
          : integration
      )
    );

    setActiveIntegrations(
      activeIntegrations.filter((i) => i.id !== integrationId)
    );

    toast({
      title: "Integration disconnected",
      description: "The integration has been successfully disconnected.",
    });
  };

  const handleConfirmConnect = () => {
    if (!selectedIntegration) return;

    setIntegrations(
      integrations.map((integration) =>
        integration.id === selectedIntegration.id
          ? { ...integration, connected: true }
          : integration
      )
    );

    setActiveIntegrations([
      ...activeIntegrations,
      { ...selectedIntegration, connected: true },
    ]);

    setShowConnectDialog(false);

    toast({
      title: "Integration connected",
      description: `${selectedIntegration.name} has been successfully connected.`,
    });
  };

  const handleCreateApiKey = () => {
    if (plan === "starter") {
      setShowUpgradeDialog(true);
      return;
    }

    if (newApiKeyName.trim() === "") {
      toast({
        title: "Error",
        description: "Please provide a name for your API key.",
        variant: "destructive",
      });
      return;
    }

    const newKey: ApiKeyType = {
      id: `api-${Date.now()}`,
      name: newApiKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    setApiKeys([...apiKeys, newKey]);
    setNewApiKeyName("");
    setShowApiKeyDialog(false);

    toast({
      title: "API key created",
      description: "Your new API key has been created successfully.",
    });
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== keyId));

    toast({
      title: "API key deleted",
      description: "The API key has been successfully deleted.",
    });
  };

  const handleUpgrade = () => {
    setShowUpgradeDialog(false);
    router.push("/dashboard/plan/upgrade");
  };

  if (isLoading) {
    return <div className="container py-10 px-4 md:px-6">Loading...</div>;
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your website with third-party services and tools.
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button onClick={() => setShowApiKeyDialog(true)} variant="outline">
            <Key className="mr-2 h-4 w-4" />
            Manage API Keys
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Integrations</TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeIntegrations.length})
            </TabsTrigger>
            <TabsTrigger value="api">API & Webhooks</TabsTrigger>
          </TabsList>
          <div className="relative w-[250px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.length > 0 ? (
              filteredIntegrations.map((integration) => (
                <Card
                  key={integration.id}
                  className={integration.popular ? "border-primary/30" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-md bg-muted">
                          {integration.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            {integration.name}
                          </CardTitle>
                          {integration.popular && (
                            <Badge variant="outline" className="mt-1">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                      {integration.planLevel !== "all" &&
                        plan === "starter" && (
                          <Badge className="bg-amber-500">Pro</Badge>
                        )}
                      {integration.planLevel === "enterprise" &&
                        plan !== "enterprise" && (
                          <Badge className="bg-purple-500">Enterprise</Badge>
                        )}
                    </div>
                    <CardDescription className="mt-2">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-1">
                    {integration.connected ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          handleDisconnectIntegration(integration.id)
                        }
                      >
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Connected
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleConnectIntegration(integration)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 py-10 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  No integrations found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We couldn't find any integrations matching your search
                  criteria.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeIntegrations.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activeIntegrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-md bg-muted">
                        {integration.icon}
                      </div>
                      <CardTitle className="text-xl">
                        {integration.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        Status:
                      </span>
                      <Badge className="bg-green-500">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        Connected since:
                      </span>
                      <span className="text-sm font-medium">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://${integration.name.toLowerCase().replace(/\s+/g, "")}.com`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Dashboard
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDisconnectIntegration(integration.id)
                      }
                    >
                      Disconnect
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No active integrations</CardTitle>
                <CardDescription>
                  You haven't connected any integrations yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect third-party services to enhance your website
                  functionality.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() =>
                    (
                      document.querySelector(
                        '[data-value="all"]'
                      ) as HTMLElement
                    )?.click()
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Browse Integrations
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access to your website
                data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plan === "starter" ? (
                <div className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-amber-600 dark:text-amber-400 font-medium">
                      Pro Feature
                    </h3>
                  </div>
                  <p className="text-amber-700 dark:text-amber-300 mb-4">
                    API access is available on Pro and Enterprise plans. Upgrade
                    to create and manage API keys.
                  </p>
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handleUpgrade}
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              ) : apiKeys.length > 0 ? (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md space-y-3 sm:space-y-0"
                    >
                      <div>
                        <div className="font-medium">{apiKey.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <code>{apiKey.key}</code>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Created:{" "}
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                          {apiKey.lastUsed &&
                            ` • Last used: ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No API keys have been created yet.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShowApiKeyDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create API Key
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to connect this integration?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConnectDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmConnect}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
            <DialogDescription>
              This feature is available on Pro and Enterprise plans. Upgrade to
              access it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpgrade}>Upgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Provide a name for your new API key.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="API Key Name"
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApiKeyDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateApiKey}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
