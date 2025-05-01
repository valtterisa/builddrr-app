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
// TODO: Import or define useAuth hook

export default function SettingsPage() {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProfileLoading(true);
    // TODO: Implement updating user profile data (first name, last name)
    // Example using a hypothetical API call:
    // try {
    //   await updateUserProfile(user.id, { firstName, lastName });
    //   toast({ title: "Success", description: "Profile updated successfully." });
    // } catch (error) {
    //   console.error("Profile update error:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to update profile.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsProfileLoading(false);
    // }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const error = null; // Simulate success

    setIsProfileLoading(false);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Profile updated successfully." });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!user) return;

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (!currentPassword || !newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);
    // TODO: Implement updating user password.
    // IMPORTANT: This should involve verifying the current password securely on the server-side.
    // Example using a hypothetical API call:
    // try {
    //   await updateUserPassword(user.id, currentPassword, newPassword);
    //   toast({ title: "Success", description: "Password updated successfully." });
    //   setCurrentPassword("");
    //   setNewPassword("");
    //   setConfirmNewPassword("");
    // } catch (error) {
    //   console.error("Password update error:", error);
    //   toast({
    //     title: "Error",
    //     description: error.message || "Failed to update password. Check current password.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsPasswordLoading(false);
    // }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const error = null; // Simulate success
    // const error = { message: 'Simulated password update error' }; // Simulate error

    setIsPasswordLoading(false);
    if (error) {
      console.error("Password update error:", error);
      toast({
        title: "Error",
        description:
          (error as any).message ||
          "Failed to update password. Check current password.", // Type assertion for simulated error
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, password, and other account details.
        </p>
      </div>
      <div className="space-y-6">
        {/* Profile Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileUpdate}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your first name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Your last name"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  placeholder="your@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed here.
                </p>
              </div>
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

        {/* Password Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your account password.</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
