"use client";

import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { ProfileForm } from "@/components/account/profile-form";
import { BillingSection } from "@/components/account/billing-section";
import { CustomInstructionsForm } from "@/components/account/custom-instructions-form";

export function AccountPage() {
  return (
    <Container className="py-14 md:py-16">
      <PageHeader
        title="Account"
        description="Manage your profile, billing, and how Builddrr writes your sites."
      />
      <div className="mt-12 flex flex-col gap-10">
        <ProfileForm />
        <BillingSection />
        <CustomInstructionsForm />
      </div>
    </Container>
  );
}
