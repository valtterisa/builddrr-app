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
import { login } from "../actions";
import { OAuthButton } from "@/components/auth/oauth-button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/logo";
import { ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleLogin(formData: FormData) {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      await login(formData);
      toast({
        title: "Success!",
        description: "You have been successfully logged in.",
        variant: "default",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong!";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container relative flex items-center justify-center min-h-screen py-10 md:px-4">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="h-12 flex items-center text-xl md:text-3xl font-bold text-gray-900 text-center ">
            <span className="flex items-center">
              <Logo className="mx-2 size-7 md:size-12" />
              Builddrr
            </span>
          </div>
        </div>
        <Card className="border-purple-100 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>
              Login with Google or use your email and password
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            <OAuthButton provider="google" variant="default" action="sign-in" />

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-purple-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Form */}
            <form action={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  className="border-purple-100 focus:border-purple-300"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-purple-600 underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  className="border-purple-100 focus:border-purple-300"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : null}
                Login
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col">
            <div className="text-sm text-center text-muted-foreground mt-2">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-purple-600 font-medium underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
