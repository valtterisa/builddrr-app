"use client";

import { ProfileForm } from "@/components/account/profile-form";
import { BillingSection } from "@/components/account/billing-section";
import { CustomInstructionsForm } from "@/components/account/custom-instructions-form";

export function AccountPage() {
  return (
    <div>
      <div className="border-b border-border px-6 py-8 md:px-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Account</h1>
        <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
          Manage your profile, billing, and how Floras writes your sites.
        </p>
      </div>
      <ProfileForm />
      <BillingSection />
      <CustomInstructionsForm />
    </div>
  );
}
