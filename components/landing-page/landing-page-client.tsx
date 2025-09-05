"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import PromptTool from "@/components/interactive/prompt-tool";
import Pricing from "@/components/landing-page/pricing-section";
import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";

interface LandingPageClientProps {
    initialUser: User | null;
}

export default function LandingPageClient({ initialUser }: LandingPageClientProps) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Mark as client-side rendered
        setIsClient(true);

        const supabase = createClient();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // Only update on actual auth events, not on initial load
                if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                    setUser(session?.user || null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Use server state until client is hydrated
    const currentUser = isClient ? user : initialUser;

    return (
        <>
            <div className="relative">
                <Navbar user={currentUser?.user_metadata} />
                <PromptTool user={currentUser} />
            </div>
            <Pricing user={currentUser} />
            <Footer />
        </>
    );
}
