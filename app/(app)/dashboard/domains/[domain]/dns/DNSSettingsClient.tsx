"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Globe,
    Plus,
    AlertCircle,
    Trash2,
    Edit,
    Save,
    X,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    isUpdating?: boolean;
}

const DNSRecordEditForm: React.FC<DNSRecordEditFormProps> = ({
    record,
    onSave,
    onCancel,
    isUpdating = false
}) => {
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
                <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                    {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                </Button>
                <Button size="sm" variant="outline" onClick={onCancel} disabled={isUpdating}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </>
    );
};

interface DNSSettingsClientProps {
    domain: string;
}

export default function DNSSettingsClient({ domain }: DNSSettingsClientProps) {
    const { toast } = useToast();
    const [isLoadingDNS, setIsLoadingDNS] = useState(false);
    const [isAddingRecord, setIsAddingRecord] = useState(false);
    const [isUpdatingRecord, setIsUpdatingRecord] = useState<string | null>(null);
    const [isDeletingRecord, setIsDeletingRecord] = useState<string | null>(null);
    const [showAddDNSDialog, setShowAddDNSDialog] = useState(false);
    const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
    const [editingDNS, setEditingDNS] = useState<string | null>(null);
    const [newDNSRecord, setNewDNSRecord] = useState<Partial<DNSRecord>>({
        type: "A",
        name: "",
        value: "",
        ttl: 3600,
    });

    // API functions for DNS management
    const fetchDNSRecords = async (domain: string) => {
        try {
            const response = await fetch(`/api/manage-dns?domain=${encodeURIComponent(domain)}`);
            if (!response.ok) {
                // Handle 404 or other errors gracefully - domain might not have DNS records yet
                console.warn(`No DNS records found for domain ${domain} or API error:`, response.status);
                return { records: [] };
            }
            return await response.json();
        } catch (error) {
            // Silently handle network errors - this could just mean no DNS records exist
            console.warn('Network error while fetching DNS records for domain:', domain, error);
            return { records: [] };
        }
    };

    const createDNSRecord = async (domain: string, record: Omit<DNSRecord, 'id'>) => {
        try {
            const response = await fetch('/api/manage-dns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, ...record })
            });
            if (!response.ok) throw new Error('Failed to create DNS record');
            return await response.json();
        } catch (error) {
            console.error('Error creating DNS record:', error);
            toast({
                title: "Error",
                description: "Failed to create DNS record",
                variant: "destructive"
            });
            return null;
        }
    };

    const updateDNSRecord = async (recordId: string, record: Partial<DNSRecord>) => {
        try {
            const response = await fetch('/api/manage-dns', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recordId, ...record })
            });
            if (!response.ok) throw new Error('Failed to update DNS record');
            return await response.json();
        } catch (error) {
            console.error('Error updating DNS record:', error);
            toast({
                title: "Error",
                description: "Failed to update DNS record",
                variant: "destructive"
            });
            return null;
        }
    };

    const deleteDNSRecord = async (domain: string, recordId: string) => {
        try {
            const response = await fetch(`/api/manage-dns?domain=${encodeURIComponent(domain)}&recordId=${recordId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete DNS record');
            return await response.json();
        } catch (error) {
            console.error('Error deleting DNS record:', error);
            toast({
                title: "Error",
                description: "Failed to delete DNS record",
                variant: "destructive"
            });
            return false;
        }
    };

    // Load DNS records for the domain when component mounts
    useEffect(() => {
        const loadDNSRecords = async () => {
            setIsLoadingDNS(true);
            const records = await fetchDNSRecords(domain);
            if (records && records.records) {
                // Transform Vercel API response to our format
                const transformedRecords = records.records.map((record: any) => ({
                    id: record.id,
                    type: record.type,
                    name: record.name,
                    value: record.value,
                    ttl: record.ttl || 3600,
                }));
                setDnsRecords(transformedRecords);
            }
            setIsLoadingDNS(false);
        };

        loadDNSRecords();
    }, [domain]);

    const handleAddDNSRecord = async () => {
        if (!newDNSRecord.name || !newDNSRecord.value) return;

        setIsAddingRecord(true);
        const recordData = {
            type: newDNSRecord.type as "A" | "AAAA" | "CNAME" | "MX" | "TXT",
            name: newDNSRecord.name,
            value: newDNSRecord.value,
            ttl: newDNSRecord.ttl || 3600,
        };

        const createdRecord = await createDNSRecord(domain, recordData);

        if (createdRecord) {
            // Add the new record to local state
            const newRecord: DNSRecord = {
                id: createdRecord.id || `dns${Date.now()}`,
                ...recordData
            };
            setDnsRecords([...dnsRecords, newRecord]);
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
        setIsAddingRecord(false);
    };

    const handleEditDNSRecord = async (recordId: string, updatedRecord: Partial<DNSRecord>) => {
        setIsUpdatingRecord(recordId);
        const result = await updateDNSRecord(recordId, updatedRecord);

        if (result) {
            // Update local state
            setDnsRecords(dnsRecords.map(record =>
                record.id === recordId ? { ...record, ...updatedRecord } : record
            ));
            setEditingDNS(null);
            toast({
                title: "DNS record updated",
                description: "Your DNS record has been successfully updated.",
            });
        }
        setIsUpdatingRecord(null);
    };

    const handleDeleteDNSRecord = async (recordId: string) => {
        setIsDeletingRecord(recordId);
        const success = await deleteDNSRecord(domain, recordId);

        if (success) {
            // Remove from local state
            setDnsRecords(dnsRecords.filter(record => record.id !== recordId));
            toast({
                title: "DNS record deleted",
                description: "Your DNS record has been successfully deleted.",
            });
        }
        setIsDeletingRecord(null);
    };

    return (
        <div className="space-y-6">
            {/* Domain Info */}
            <Card>
                <CardHeader>
                    <CardTitle>DNS Records for {domain}</CardTitle>
                    <CardDescription>
                        Manage DNS records for this domain. Changes can take up to 48 hours to propagate globally.
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* DNS Records */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>DNS Configuration</CardTitle>
                        <CardDescription>
                            Configure DNS records for your domain.
                        </CardDescription>
                    </div>
                    <Button onClick={() => setShowAddDNSDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Record
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="border rounded-md">
                            <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                                <div>Type</div>
                                <div>Name</div>
                                <div>Value</div>
                                <div>TTL</div>
                                <div>Actions</div>
                            </div>
                            {isLoadingDNS ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    Loading DNS records...
                                </div>
                            ) : dnsRecords.length > 0 ? (
                                dnsRecords.map((record) => (
                                    <div key={record.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0 items-center">
                                        {editingDNS === record.id ? (
                                            <DNSRecordEditForm
                                                record={record}
                                                onSave={(updatedRecord) => handleEditDNSRecord(record.id, updatedRecord)}
                                                onCancel={() => setEditingDNS(null)}
                                                isUpdating={isUpdatingRecord === record.id}
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
                                                        disabled={isUpdatingRecord === record.id || isDeletingRecord === record.id}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteDNSRecord(record.id)}
                                                        disabled={isUpdatingRecord === record.id || isDeletingRecord === record.id}
                                                    >
                                                        {isDeletingRecord === record.id ? (
                                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Globe className="h-10 w-10 mx-auto mb-4" />
                                    <h3 className="font-medium text-lg mb-1">No DNS records yet</h3>
                                    <p className="text-sm mb-4">
                                        Add DNS records to configure how your domain resolves.
                                    </p>
                                    <Button onClick={() => setShowAddDNSDialog(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Record
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                            <p className="text-sm text-muted-foreground">
                                <AlertCircle className="h-4 w-4 inline-block mr-1" />
                                DNS changes can take up to 48 hours to propagate globally.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add DNS Record Dialog */}
            <Dialog open={showAddDNSDialog} onOpenChange={setShowAddDNSDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add DNS Record</DialogTitle>
                        <DialogDescription>
                            Add a new DNS record for {domain}.
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
                        <Button onClick={handleAddDNSRecord} disabled={isAddingRecord}>
                            {isAddingRecord ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                    Adding...
                                </>
                            ) : (
                                "Add Record"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
