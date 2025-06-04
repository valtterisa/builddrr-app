"use client";

import type React from "react";

import { useState } from "react";
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
import { Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const { error } = await supabase!.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      setError(
        error.message || "An error occurred while sending the reset link"
      );
      toast({
        title: "Failed to send reset link",
        description: error.message || "Please check your email and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle className="text-2xl font-bold">
              Forgot password
            </CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a link to reset
              your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Password reset link sent! Check your email inbox.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Sending reset link...
                  </>
                ) : (
                  "Send reset link"
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
