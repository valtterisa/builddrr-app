"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check if we have a session when the component mounts
    const checkSession = async () => {
      try {
        const { data } = await supabase!.auth.getSession();
        if (!data.session) {
          toast({
            title: "Invalid or expired link",
            description: "Please request a new password reset link.",
            variant: "destructive",
          });
          router.push("/forgot-password");
        }
        setSessionChecked(true);
      } catch (error) {
        console.error("Error checking session:", error);
        setSessionChecked(true);
      }
    };

    checkSession();
  }, [router, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });

      router.push("/login");
    } catch (error: any) {
      setError(
        error.message || "An error occurred while resetting your password"
      );
      toast({
        title: "Failed to reset password",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!sessionChecked) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-10 px-4 md:px-6 bg-gradient-to-b from-purple-50 to-white">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10 px-4 md:px-6 bg-gradient-to-b from-purple-50 to-white">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1 rounded-md">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-2xl tracking-tight">builddrr</span>
          </div>
        </div>
        <Card className="border-purple-100 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-purple-100 focus:border-purple-300"
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="border-purple-100 focus:border-purple-300"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-center text-muted-foreground mt-2">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-purple-600 font-medium underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
