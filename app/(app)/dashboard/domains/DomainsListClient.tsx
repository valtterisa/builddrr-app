"use client";

import { useState, useEffect } from "react";
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
    Globe,
    Plus,
    Check,
    Clock,
    ExternalLink,
    Settings,
    Lock,
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
import { useToast } from "@/hooks/use-toast";

type Domain = {
    id: string;
    name: string;
    status: "active" | "pending" | "error";
    websiteId: string;
    websiteName: string;
    ssl: boolean;
    createdAt: string;
};

type Website = {
    id: string;
    name: string;
    url: string;
    projectId: string;
};

export default function DomainsListClient() {
    const router = useRouter();
    const { toast } = useToast();
    const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("pro");
    const [showAddDomainDialog, setShowAddDomainDialog] = useState(false);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [newDomain, setNewDomain] = useState("");
    const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
    const [websites, setWebsites] = useState<Website[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingDomain, setIsAddingDomain] = useState(false);

    // API functions for domain management
    const fetchProjectDomains = async (projectId: string) => {
        try {
            const response = await fetch(`/api/manage-domains?projectId=${encodeURIComponent(projectId)}`);
            if (!response.ok) {
                // Only log the error, don't show toast for missing domains
                console.warn(`No domains found for project ${projectId} or API error:`, response.status);
                return { domains: [] };
            }
            return await response.json();
        } catch (error) {
            // Silently handle network errors - this could just mean no domains exist
            console.warn('Network error while fetching domains for project:', projectId, error);
            return { domains: [] };
        }
    };

    const addDomainToProject = async (projectId: string, domain: string) => {
        try {
            const response = await fetch('/api/manage-domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, domain })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to add domain');
            }
            return await response.json();
        } catch (error) {
            console.error('Error adding domain:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add domain",
                variant: "destructive"
            });
            return null;
        }
    };

    const removeDomainFromProject = async (projectId: string, domain: string) => {
        try {
            const response = await fetch(`/api/manage-domains?projectId=${encodeURIComponent(projectId)}&domain=${encodeURIComponent(domain)}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to remove domain');
            }
            return await response.json();
        } catch (error) {
            console.error('Error removing domain:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to remove domain",
                variant: "destructive"
            });
            return false;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            // TODO: Replace with real websites data from database
            // You'll need to store the Vercel project IDs when creating websites
            // These should come from your database where each website has an associated projectId
            const mockWebsites = [
                {
                    id: "1",
                    name: "Bittive Oy",
                    url: `https://builddrr.app/bittive-oy`,
                    projectId: "prj_example1", // Replace with real Vercel project ID from database
                },
                {
                    id: "2",
                    name: "Tech Solutions Inc",
                    url: `https://builddrr.app/tech-solutions`,
                    projectId: "prj_example2", // Replace with real Vercel project ID from database
                },
                {
                    id: "3",
                    name: "Coffee Shop",
                    url: `https://builddrr.app/coffee-shop`,
                    projectId: "prj_example3", // Replace with real Vercel project ID from database
                },
            ];

            setWebsites(mockWebsites);

            // Fetch real domains from all projects
            if (plan !== "starter") {
                const allDomains: Domain[] = [];
                let hasApiErrors = false;

                for (const website of mockWebsites) {
                    try {
                        const result = await fetchProjectDomains(website.projectId);
                        if (result && result.domains) {
                            const websiteDomains = result.domains.map((domain: any) => ({
                                id: `${website.id}-${domain.name}`,
                                name: domain.name,
                                status: domain.verified ? "active" : "pending",
                                websiteId: website.id,
                                websiteName: website.name,
                                ssl: domain.verified, // Assume SSL is available for verified domains
                                createdAt: new Date().toISOString(), // Vercel API doesn't provide creation date
                            }));
                            allDomains.push(...websiteDomains);
                        }
                    } catch (error) {
                        // Only set error flag for genuine failures, not missing domains
                        hasApiErrors = true;
                        console.error(`Failed to fetch domains for ${website.name}:`, error);
                    }
                }

                setDomains(allDomains);

                // Only show error if we have no domains AND there were API errors
                if (allDomains.length === 0 && hasApiErrors) {
                    console.warn('No domains found and API errors occurred. This might indicate a connectivity issue.');
                }
            }

            setIsLoading(false);
        };

        loadData();
    }, [plan]);

    const handleAddDomain = () => {
        if (plan === "starter") {
            setShowUpgradeDialog(true);
            return;
        }

        setShowAddDomainDialog(true);
    };

    const handleDeleteDomain = async (domainId: string) => {
        const domain = domains.find(d => d.id === domainId);
        if (!domain) return;

        const website = websites.find(w => w.id === domain.websiteId);
        if (!website) return;

        const success = await removeDomainFromProject(website.projectId, domain.name);

        if (success) {
            setDomains(domains.filter((d) => d.id !== domainId));
            toast({
                title: "Domain removed",
                description: "Your domain has been successfully removed.",
            });
        }
    };

    const handleUpgrade = () => {
        setShowUpgradeDialog(false);
        router.push("/dashboard/plan/upgrade");
    };

    const handleEditDNS = (domainName: string) => {
        router.push(`/dashboard/domains/${encodeURIComponent(domainName)}/dns`);
    };

    const handleAddDomainSubmit = async () => {
        if (!newDomain || !selectedWebsite) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive"
            });
            return;
        }

        setIsAddingDomain(true);
        const website = websites.find(w => w.id === selectedWebsite);

        if (!website) {
            toast({
                title: "Error",
                description: "Selected website not found",
                variant: "destructive"
            });
            setIsAddingDomain(false);
            return;
        }

        const result = await addDomainToProject(website.projectId, newDomain);

        if (result) {
            // Add the new domain to local state
            const newDomainObj: Domain = {
                id: `${selectedWebsite}-${newDomain}`,
                name: newDomain,
                status: result.verified ? "active" : "pending",
                websiteId: selectedWebsite,
                websiteName: website.name,
                ssl: result.verified,
                createdAt: new Date().toISOString(),
            };

            setDomains([...domains, newDomainObj]);
            setNewDomain("");
            setSelectedWebsite(null);
            setShowAddDomainDialog(false);

            toast({
                title: "Domain added",
                description: "Your domain has been successfully added to the project.",
            });
        }

        setIsAddingDomain(false);
    };

    return (
        <div className="space-y-6">
            {/* Header with Add Domain Button */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-muted-foreground">
                        Manage all your custom domains across all websites.
                    </p>
                </div>
                <Button onClick={handleAddDomain}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Domain
                </Button>
            </div>

            {/* Domains List */}
            {plan === "starter" ? (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <CardTitle className="text-amber-600 dark:text-amber-400">
                                Custom Domains
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-amber-700 dark:text-amber-300">
                            Custom domains are available on Pro and Enterprise plans.
                            Upgrade to connect your own domain name to your websites.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={handleUpgrade}
                        >
                            Upgrade to Pro
                        </Button>
                    </CardFooter>
                </Card>
            ) : isLoading ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span className="text-muted-foreground">Loading domains...</span>
                        </div>
                    </CardContent>
                </Card>
            ) : domains.length > 0 ? (
                <div className="grid gap-4">
                    {domains.map((domain) => (
                        <Card key={domain.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">{domain.name}</CardTitle>
                                        <CardDescription>
                                            Connected to {domain.websiteName} • Added on {new Date(domain.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        variant={
                                            domain.status === "active" ? "default" : "outline"
                                        }
                                        className={
                                            domain.status === "active"
                                                ? "bg-green-500"
                                                : domain.status === "pending"
                                                    ? "bg-amber-500"
                                                    : "bg-red-500"
                                        }
                                    >
                                        {domain.status === "active" ? "Active" : domain.status === "pending" ? "Pending" : "Error"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            SSL Certificate:
                                        </span>
                                        <div className="flex items-center">
                                            {domain.ssl ? (
                                                <>
                                                    <Check className="h-4 w-4 text-green-500 mr-1" />
                                                    <span className="text-sm font-medium">
                                                        Active
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="h-4 w-4 text-amber-500 mr-1" />
                                                    <span className="text-sm font-medium">
                                                        Pending
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            window.open(`https://${domain.name}`, "_blank")
                                        }
                                    >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        Visit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditDNS(domain.name)}
                                    >
                                        <Settings className="h-4 w-4 mr-1" />
                                        Edit DNS
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    {domain.status !== "active" && (
                                        <Button size="sm">
                                            <Check className="h-4 w-4 mr-1" />
                                            Verify
                                        </Button>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteDomain(domain.id)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>No domains found</CardTitle>
                        <CardDescription>
                            You haven't added any custom domains to your projects yet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Add a custom domain to make your websites accessible at your
                            own domain names.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleAddDomain}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Domain
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* Add Domain Dialog */}
            <Dialog open={showAddDomainDialog} onOpenChange={setShowAddDomainDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Custom Domain</DialogTitle>
                        <DialogDescription>
                            Connect your own domain name to a website.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain Name</Label>
                            <Input
                                id="domain"
                                placeholder="example.com"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter your domain without www or http/https (e.g., example.com)
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Connect to Website</Label>
                            <select
                                id="website"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedWebsite || ""}
                                onChange={(e) => setSelectedWebsite(e.target.value)}
                            >
                                <option value="" disabled>
                                    Select a website
                                </option>
                                {websites.map((website) => (
                                    <option key={website.id} value={website.id}>
                                        {website.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowAddDomainDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddDomainSubmit} disabled={isAddingDomain}>
                            {isAddingDomain ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                    Adding...
                                </>
                            ) : (
                                "Add Domain"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upgrade Dialog */}
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upgrade Required</DialogTitle>
                        <DialogDescription>
                            Custom domains are available on Pro and Enterprise plans.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="mb-4">
                            Upgrade to Pro to connect your own domain names to your websites
                            and access other premium features.
                        </p>
                        <Card className="mb-4 border-primary">
                            <CardHeader>
                                <CardTitle>Pro Plan</CardTitle>
                                <CardDescription>
                                    Perfect for growing businesses
                                </CardDescription>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold">$19</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    <li className="flex items-center">
                                        <Check className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Custom domains</span>
                                    </li>
                                    <li className="flex items-center">
                                        <Check className="h-4 w-4 text-green-500 mr-2" />
                                        <span>SSL certificates</span>
                                    </li>
                                    <li className="flex items-center">
                                        <Check className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Advanced forms</span>
                                    </li>
                                    <li className="flex items-center">
                                        <Check className="h-4 w-4 text-green-500 mr-2" />
                                        <span>Email integrations</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowUpgradeDialog(false)}
                        >
                            Maybe Later
                        </Button>
                        <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
