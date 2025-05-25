"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Define User type
export type User = {
  id: string;
  [key: string]: any;
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Store session info in localStorage
      localStorage.setItem("user_session", "true");

      if (data.user) {
        onSuccess(data.user as User);
      } else {
        throw new Error("No user data returned");
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      // Store session info in localStorage
      localStorage.setItem("user_session", "true");

      if (data.user) {
        onSuccess(data.user as User);
      } else {
        throw new Error("No user data returned");
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Sign up or log in to continue</DialogTitle>
          <DialogDescription>
            You need an account to generate and publish websites.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800"
            onClick={() => router.push("/login")}
          >
            Log In
          </Button>
          <Button
            variant="outline"
            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
