"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  addDomainToProject,
  getDomainVerificationInfo,
  verifyDomainSetup,
} from "@/lib/vercel/vercel";

interface DomainInfo {
  name: string;
  verified: boolean;
  isApexDomain?: boolean;
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
  dnsRecords?: {
    required: {
      type: string;
      name: string;
      value: string;
      ttl: number;
    }[];
    instructions: string;
  };
}

interface DomainConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  websiteId: string;
}

export default function DomainConnectionModal({
  isOpen,
  onClose,
  websiteId,
}: DomainConnectionModalProps) {
  const [domainName, setDomainName] = useState("");
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"input" | "deploying" | "dns" | "success">(
    "input"
  );

  const { toast } = useToast();

  const addDomain = async () => {
    if (!websiteId || !domainName) {
      setError("Website ID and domain name are required");
      return;
    }

    setError("");
    setStep("deploying");

    try {
      const data = await addDomainToProject({
        projectId: websiteId,
        domain: domainName.toLowerCase().trim(),
        websiteId,
      });

      if (data.verified) {
        setStep("success");
        setDomainInfo({
          name: data.domain,
          verified: data.verified,
        });
      } else {
        // Get verification instructions and automatically move to DNS step
        await getVerificationInstructions(data.domain);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain");
      setStep("input");
    }
  };

  const getVerificationInstructions = async (domain: string) => {
    try {
      const data = await getDomainVerificationInfo({
        projectId: websiteId,
        domain,
      });

      setDomainInfo({
        name: data.domain,
        verified: data.verified,
        isApexDomain: data.isApexDomain,
        verification: data.verification,
        dnsRecords: data.dnsRecords,
      });
      setStep("dns");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get verification instructions"
      );
    }
  };

  const verifyDomain = async () => {
    if (!websiteId || !domainName) return;

    setLoading(true);

    try {
      const data = await verifyDomainSetup({
        projectId: websiteId,
        domain: domainName,
        websiteId,
      });

      if (data.verified) {
        setStep("success");
        setDomainInfo({
          name: data.domain,
          verified: data.verified,
        });
        toast({
          title: "Domain verified!",
          description: `${domainName} is now connected and verified.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Verification pending",
          description:
            "DNS changes may take up to 24 hours to propagate. Please try again later.",
          variant: "default",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify domain");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "DNS record copied to clipboard",
      variant: "default",
    });
  };

  const resetModal = () => {
    setDomainName("");
    setDomainInfo(null);
    setError("");
    setStep("input");
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Connect Your Custom Domain
          </DialogTitle>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="example.com or www.example.com"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your domain without http:// or https://
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={addDomain}
                disabled={loading || !domainName.trim() || !websiteId}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Domain...
                  </>
                ) : (
                  "Add Domain"
                )}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-medium">What happens next?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• We'll create a Vercel project for your custom domain</li>
                <li>• Your website will be deployed to Vercel</li>
                <li>• Your domain will be configured on the project</li>
                <li>• You'll get DNS setup instructions</li>
                <li>• After DNS configuration, your domain will be live</li>
              </ul>
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Your website will be migrated from
                  Cloudflare to Vercel to support custom domains.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "deploying" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Deploying {domainName}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Setting up your website on Vercel for custom domain support...
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                <div className="flex-shrink-0">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Creating Vercel project
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Setting up hosting infrastructure for {domainName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                <div className="flex-shrink-0">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Deploying website files
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Uploading and building your website on Vercel
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                <div className="flex-shrink-0">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Configuring domain
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Adding {domainName} to your Vercel project
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg border">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Migration in Progress
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Your website is being migrated from Cloudflare to Vercel to
                    support custom domains. This usually takes 30-60 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "dns" && domainInfo && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Almost Ready!</h3>
              <p className="text-sm text-muted-foreground">
                Your Vercel project is set up. Now configure DNS to make{" "}
                {domainName} live.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Configure DNS Records
                </CardTitle>
                <CardDescription>
                  Add these DNS records to your domain provider to complete the
                  setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{domainInfo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {domainInfo.isApexDomain ? "Apex Domain" : "Subdomain"}
                      </p>
                    </div>
                    <Badge variant="secondary">Pending Verification</Badge>
                  </div>

                  {domainInfo.dnsRecords?.required && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Required DNS Records:</h4>
                      {domainInfo.dnsRecords.required.map((record, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Type
                              </Label>
                              <p className="font-mono">{record.type}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">
                                Name
                              </Label>
                              <p className="font-mono">{record.name}</p>
                            </div>
                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground">
                                  Value
                                </Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(record.value)}
                                  className="h-6 px-2"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                                {record.value}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {domainInfo.dnsRecords.instructions}
                          <br />
                          <strong>Note:</strong> DNS changes can take up to 24
                          hours to propagate.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={verifyDomain}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Domain"
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleClose}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "success" && domainInfo && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">
                  🎉 Domain Connected!
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {domainName} is now live and ready to use
                </p>
              </div>
            </div>

            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">
                          https://{domainInfo.name}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your website is now accessible at this domain
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-300">
                        ✅ Live
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() =>
                        window.open(`https://${domainInfo.name}`, "_blank")
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Your Website
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="px-6"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
