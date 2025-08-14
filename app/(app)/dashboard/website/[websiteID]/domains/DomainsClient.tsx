"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
    AlertCircle,
    Clock,
    ExternalLink,
    Trash2,
    Edit,
    Save,
    X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type DNSRecord = {
    id: string;
    type: "A" | "AAAA" | "CNAME" | "MX" | "TXT";
    name: string;
    value: string;
    ttl: number;
};

interface DNSRecordEditFormProps {
    record: DNSRecord;
    onSave: (updatedRecord: Partial<DNSRecord>) => void;
    onCancel: () => void;
}

const DNSRecordEditForm: React.FC<DNSRecordEditFormProps> = ({ record, onSave, onCancel }) => {
    const [editRecord, setEditRecord] = useState<DNSRecord>({ ...record });

    const handleSave = () => {
        onSave(editRecord);
    };

    return (
        <>
            <div>
                <Select
                    value={editRecord.type}
                    onValueChange={(value) => setEditRecord({ ...editRecord, type: value as "A" | "AAAA" | "CNAME" | "MX" | "TXT" })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="AAAA">AAAA</SelectItem>
                        <SelectItem value="CNAME">CNAME</SelectItem>
                        <SelectItem value="MX">MX</SelectItem>
                        <SelectItem value="TXT">TXT</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Input
                    value={editRecord.name}
                    onChange={(e) => setEditRecord({ ...editRecord, name: e.target.value })}
                    placeholder="Name"
                />
            </div>
            <div>
                <Input
                    value={editRecord.value}
                    onChange={(e) => setEditRecord({ ...editRecord, value: e.target.value })}
                    placeholder="Value"
                />
            </div>
            <div>
                <Input
                    type="number"
                    value={editRecord.ttl}
                    onChange={(e) => setEditRecord({ ...editRecord, ttl: parseInt(e.target.value) || 3600 })}
                    placeholder="TTL"
                />
            </div>
            <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </>
    );
};

export default function DomainsClient() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("pro");
    const [showAddDomainDialog, setShowAddDomainDialog] = useState(false);
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
    const [showAddDNSDialog, setShowAddDNSDialog] = useState(false);
    const [domains, setDomains] = useState<any[]>([]);
    const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
    const [newDomain, setNewDomain] = useState("");
    const [editingDNS, setEditingDNS] = useState<string | null>(null);
    const [newDNSRecord, setNewDNSRecord] = useState<Partial<DNSRecord>>({
        type: "A",
        name: "",
        value: "",
        ttl: 3600,
    });
    const [activeTab, setActiveTab] = useState("domains");
    const websiteId = params.websiteID as string;

    useEffect(() => {
        // Mock domains data for current website
        if (plan !== "starter") {
            setDomains([
                {
                    id: "1",
                    name: "example.com",
                    status: "active",
                    websiteId: websiteId,
                    ssl: true,
                    createdAt: new Date(
                        Date.now() - 30 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                },
                {
                    id: "2",
                    name: "bittive.fi",
                    status: "pending",
                    websiteId: websiteId,
                    ssl: false,
                    createdAt: new Date(
                        Date.now() - 15 * 24 * 60 * 60 * 1000
                    ).toISOString(),
                },
            ]);

            // Mock DNS records
            setDnsRecords([
                {
                    id: "dns1",
                    type: "A",
                    name: "@",
                    value: "76.76.21.21",
                    ttl: 3600,
                },
                {
                    id: "dns2",
                    type: "CNAME",
                    name: "www",
                    value: "example.com",
                    ttl: 3600,
                },
            ]);
        }

        setIsLoading(false);
    }, [plan, websiteId]);

    const handleAddDNSRecord = () => {
        if (newDNSRecord.name && newDNSRecord.value) {
            const record: DNSRecord = {
                id: `dns${Date.now()}`,
                type: newDNSRecord.type as "A" | "AAAA" | "CNAME" | "MX" | "TXT",
                name: newDNSRecord.name,
                value: newDNSRecord.value,
                ttl: newDNSRecord.ttl || 3600,
            };
            setDnsRecords([...dnsRecords, record]);
            setNewDNSRecord({
                type: "A",
                name: "",
                value: "",
                ttl: 3600,
            });
            setShowAddDNSDialog(false);
            toast({
                title: "DNS record added",
                description: "Your DNS record has been successfully added.",
            });
        }
    };

    const handleEditDNSRecord = (recordId: string, updatedRecord: Partial<DNSRecord>) => {
        setDnsRecords(dnsRecords.map(record =>
            record.id === recordId ? { ...record, ...updatedRecord } : record
        ));
        setEditingDNS(null);
        toast({
            title: "DNS record updated",
            description: "Your DNS record has been successfully updated.",
        });
    };

    const handleDeleteDNSRecord = (recordId: string) => {
        setDnsRecords(dnsRecords.filter(record => record.id !== recordId));
        toast({
            title: "DNS record deleted",
            description: "Your DNS record has been successfully deleted.",
        });
    };

    const handleAddDomain = () => {
        if (plan === "starter") {
            setShowUpgradeDialog(true);
            return;
        }

        setShowAddDomainDialog(true);
    };

    const handleDeleteDomain = (domainId: string) => {
        setDomains(domains.filter((domain) => domain.id !== domainId));

        toast({
            title: "Domain removed",
            description: "Your domain has been successfully removed.",
        });
    };

    const handleUpgrade = () => {
        setShowUpgradeDialog(false);
        router.push("/dashboard/plan/upgrade");
    };

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                        value="domains"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                        Domains
                    </TabsTrigger>
                    <TabsTrigger
                        value="dns"
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                    >
                        DNS Records
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="domains" className="space-y-4">
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
                                    Upgrade to connect your own domain name to your website.
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
                    ) : domains.length > 0 ? (
                        <div className="grid gap-4">
                            {domains.map((domain) => (
                                <Card key={domain.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl">{domain.name}</CardTitle>
                                            <Badge
                                                variant={
                                                    domain.status === "active" ? "default" : "outline"
                                                }
                                                className={
                                                    domain.status === "active"
                                                        ? "bg-green-500"
                                                        : "bg-amber-500"
                                                }
                                            >
                                                {domain.status === "active" ? "Active" : "Pending"}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            Added on {new Date(domain.createdAt).toLocaleDateString()}
                                        </CardDescription>
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
                                    You haven't added any custom domains yet.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Add a custom domain to make your website accessible at your
                                    own domain name.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleAddDomain}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Domain
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="dns" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>DNS Configuration</CardTitle>
                                <CardDescription>
                                    Configure DNS records for your domains.
                                </CardDescription>
                            </div>
                            {plan !== "starter" && domains.length > 0 && (
                                <Button onClick={() => setShowAddDNSDialog(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Record
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {plan === "starter" ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Globe className="h-10 w-10 text-muted-foreground mb-4" />
                                    <h3 className="font-medium text-lg mb-1">Pro Feature</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        DNS management is available on Pro and Enterprise plans.
                                    </p>
                                    <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
                                </div>
                            ) : domains.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="border rounded-md">
                                        <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                                            <div>Type</div>
                                            <div>Name</div>
                                            <div>Value</div>
                                            <div>TTL</div>
                                            <div>Actions</div>
                                        </div>
                                        {dnsRecords.map((record) => (
                                            <div key={record.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0 items-center">
                                                {editingDNS === record.id ? (
                                                    <DNSRecordEditForm
                                                        record={record}
                                                        onSave={(updatedRecord) => handleEditDNSRecord(record.id, updatedRecord)}
                                                        onCancel={() => setEditingDNS(null)}
                                                    />
                                                ) : (
                                                    <>
                                                        <div>{record.type}</div>
                                                        <div>{record.name}</div>
                                                        <div className="truncate">{record.value}</div>
                                                        <div>{record.ttl}</div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => setEditingDNS(record.id)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleDeleteDNSRecord(record.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-muted p-4 rounded-md">
                                        <p className="text-sm text-muted-foreground">
                                            <AlertCircle className="h-4 w-4 inline-block mr-1" />
                                            DNS changes can take up to 48 hours to propagate globally.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Globe className="h-10 w-10 text-muted-foreground mb-4" />
                                    <h3 className="font-medium text-lg mb-1">No domains yet</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Add a domain first to manage DNS records.
                                    </p>
                                    <Button onClick={handleAddDomain}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Domain
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add DNS Record Dialog */}
            <Dialog open={showAddDNSDialog} onOpenChange={setShowAddDNSDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add DNS Record</DialogTitle>
                        <DialogDescription>
                            Add a new DNS record for your domain.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="dns-type">Record Type</Label>
                            <Select
                                value={newDNSRecord.type}
                                onValueChange={(value) => setNewDNSRecord({ ...newDNSRecord, type: value as "A" | "AAAA" | "CNAME" | "MX" | "TXT" })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="AAAA">AAAA</SelectItem>
                                    <SelectItem value="CNAME">CNAME</SelectItem>
                                    <SelectItem value="MX">MX</SelectItem>
                                    <SelectItem value="TXT">TXT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dns-name">Name</Label>
                            <Input
                                id="dns-name"
                                placeholder="@ or subdomain"
                                value={newDNSRecord.name}
                                onChange={(e) => setNewDNSRecord({ ...newDNSRecord, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dns-value">Value</Label>
                            <Input
                                id="dns-value"
                                placeholder="IP address or domain name"
                                value={newDNSRecord.value}
                                onChange={(e) => setNewDNSRecord({ ...newDNSRecord, value: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dns-ttl">TTL (seconds)</Label>
                            <Input
                                id="dns-ttl"
                                type="number"
                                placeholder="3600"
                                value={newDNSRecord.ttl}
                                onChange={(e) => setNewDNSRecord({ ...newDNSRecord, ttl: parseInt(e.target.value) || 3600 })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowAddDNSDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddDNSRecord}>Add Record</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Domain Dialog */}
            <Dialog open={showAddDomainDialog} onOpenChange={setShowAddDomainDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Custom Domain</DialogTitle>
                        <DialogDescription>
                            Connect your own domain name to your website.
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

                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowAddDomainDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button>Add Domain</Button>
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
