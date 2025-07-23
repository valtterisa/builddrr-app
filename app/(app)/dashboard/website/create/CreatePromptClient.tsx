"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Footer from "@/components/layout/footer";
import { User } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/site-header";

const examples = [
    {
        name: "Cafe website",
        prompt: "Make a simple website for my cafe",
    },
    {
        name: "Landing page for a software startup",
        prompt: "Make a landing page for my software startup",
    },
    {
        name: "Portfolio website for a photographer",
        prompt: "Make a portfolio website for my photography business",
    },
    {
        name: "Blog website",
        prompt: "Make a blog website for my blog",
    },
];

export default function CreatePromptClient({ user }: { user: User }) {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSend = async () => {
        if (isLoading) return;
        setIsLoading(true);
        const supabase = createClient();
        if (!prompt.trim()) {
            setIsLoading(false);
            return;
        }
        if (!user) {
            localStorage.setItem("builddrr_prompt", prompt);
            setIsLoading(false);
            return;
        }
        sessionStorage.setItem("builddrr_generation_prompt", prompt);
        try {
            // Get available preview environment
            const { data: previewData, error: previewError } = await supabase
                .from("preview_environments")
                .select("*")
                .eq("status", "non-active")
                .limit(1);
            if (previewError) throw previewError;
            if (!previewData || previewData.length === 0) {
                throw new Error("No available preview environments");
            }
            const app_name = previewData[0].app_name;
            const preview_id = previewData[0].preview_id;
            // Update both tables in parallel
            const [websiteUpdate, previewUpdate] = await Promise.all([
                supabase
                    .from("websites")
                    .insert({
                        preview_id: preview_id,
                        user_id: user.id,
                        name: app_name,
                        created_at: new Date().toISOString(),
                    })
                    .select()
                    .single(),
                supabase
                    .from("preview_environments")
                    .update({
                        status: "active",
                        assigned_at: new Date().toISOString(),
                        id: user.id,
                    })
                    .eq("app_name", app_name),
            ]);
            if (websiteUpdate.error) throw websiteUpdate.error;
            if (previewUpdate.error) throw previewUpdate.error;
            router.push(`/dashboard/website/${app_name}/editor`);
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <SiteHeader title="Create Website" />
            <div className="h-full w-full flex flex-col items-center justify-center pb-8 pt-12 md:pt-8 px-2 relative">
                <div className="relative z-10 w-full flex flex-col items-center">

                    <p className="py-2 text-base md:text-lg text-gray-500 text-center mb-4 max-w-xl">
                        Chat with AI to create your website.
                    </p>
                    <div className="w-full max-w-xl bg-gray-100 rounded-xl shadow p-4 flex flex-col gap-2">
                        <textarea
                            className="w-full bg-transparent text-gray-900 text-sm md:text-base resize-none outline-none border-none min-h-[5rem] placeholder:text-gray-400"
                            placeholder="Describe your website..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isLoading}
                        />
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2"></div>
                            <div className="flex items-center gap-1">
                                <Button
                                    size="icon"
                                    className="rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow h-7 w-7"
                                    disabled={!prompt.trim() || isLoading}
                                    onClick={handleSend}
                                >
                                    {isLoading ? (
                                        <span className="h-5 w-5 flex items-center justify-center">
                                            <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        </span>
                                    ) : (
                                        <ArrowUpRight className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>

                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                        {examples.map((example, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => setPrompt(example.prompt)}
                            >
                                {example.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
} 