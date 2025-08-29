"use client";

import React, { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SiteHeader } from "@/components/site-header";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

export default function AccountClient({ user }: { user: User }) {
    const { toast } = useToast();
    const [fullName, setFullName] = useState(user.user_metadata.full_name);
    const [email, setEmail] = useState(user.user_metadata.email);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isPasswordResetting, setIsPasswordResetting] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                setShowPasswordReset(true);
            }
        });
        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        try {
            const res = await fetch("/api/account/update-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName }),
            });
            const result = await res.json();
            setIsProfileLoading(false);
            if (!res.ok) {
                toast({
                    title: "Error",
                    description: result.error || "Failed to update profile.",
                    variant: "destructive",
                });
            } else {
                toast({ title: "Success", description: "Profile updated successfully." });
            }
        } catch (err: any) {
            setIsProfileLoading(false);
            toast({
                title: "Error",
                description: err.message || "Failed to update profile.",
                variant: "destructive",
            });
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        try {
            const res = await fetch("/api/account/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const result = await res.json();
            setIsPasswordLoading(false);
            if (!res.ok) {
                toast({
                    title: "Error",
                    description: result.error || "Failed to send password reset email.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Check your email",
                    description: "A password reset link has been sent to your email.",
                });
            }
        } catch (err: any) {
            setIsPasswordLoading(false);
            toast({
                title: "Error",
                description: err.message || "Failed to send password reset email.",
                variant: "destructive",
            });
        }
    };

    const handlePasswordResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPasswordResetting(true);
        const supabase = createClient();
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        setIsPasswordResetting(false);
        if (error) {
            toast({
                title: "Error",
                description: error.message || "There was an error updating your password.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Password updated successfully!",
            });
            setShowPasswordReset(false);
            setNewPassword("");
        }
    };

    // Determine if user is OAuth
    const isOAuthUser = user?.identities?.some(
        (identity: any) => identity.provider !== "email"
    );

    return (
        <div className="md:px-4">
            <SiteHeader title="Account" />
            <div className="space-y-6 pt-4">
                {/* Profile Settings Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleProfileUpdate}>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    disabled
                                />
                                <p className="text-xs text-muted-foreground">
                                    We'll use this email to contact you about your account.
                                </p>
                            </div>
                            {/* Add phone number in DB */}
                            {/* <div className="space-y-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                />
                <p className="text-xs text-muted-foreground">
                  Add a phone number for account recovery and notifications.
                </p>
              </div> */}
                        </CardContent>
                        <CardFooter className="border-t pt-4 flex justify-end">
                            <Button type="submit" disabled={isProfileLoading}>
                                {isProfileLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Save Profile
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* Password Reset Card or OAuth message */}
                {isOAuthUser ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Password</CardTitle>
                            <CardDescription>
                                You signed in with a third-party provider (e.g. Google or GitHub) and do not have a password for this account.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>
                                    Click the button below to send a password reset link to your email address on file.
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handlePasswordReset}>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        A password reset link will be sent to <span className="font-medium">{email}</span>.
                                    </p>
                                </CardContent>
                                <CardFooter className="border-t pt-4 flex justify-start">
                                    <Button type="submit" disabled={isPasswordLoading}>
                                        {isPasswordLoading ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : null}
                                        Send Password Reset Email
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                        {/* Show new password field if PASSWORD_RECOVERY event detected */}
                        {showPasswordReset && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Set New Password</CardTitle>
                                    <CardDescription>
                                        Enter your new password below to complete the password reset process.
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handlePasswordResetSubmit}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="new-password">New Password</Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="border-t pt-4 flex justify-end">
                                        <Button type="submit" disabled={isPasswordResetting || !newPassword}>
                                            {isPasswordResetting ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            Set New Password
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 