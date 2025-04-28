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
import { toast } from "sonner"; // Add your toast library!
import { login } from "../actions";
import { OAuthButton } from "@/components/auth/oauth-button";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    try {
      setLoading(true);
      await login(formData);
      toast.success("Logged in successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10 px-4 md:px-6 bg-gradient-to-b from-purple-50 to-white">
      <div className="w-full max-w-md">
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
                {loading ? <Loader2 className="animate-spin" /> : "Login"}
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
