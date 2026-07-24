"use client";

import { ProfileForm } from "@/components/account/profile-form";
import { BillingSection } from "@/components/account/billing-section";
import { CustomInstructionsForm } from "@/components/account/custom-instructions-form";
import { DomainsSection } from "@/components/account/domains-section";
import { SettingsNav } from "@/components/account/settings-nav";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";

export function AccountPage() {
  return (
    <Container className="max-w-5xl pb-16 md:px-8">
      <PageHeader
        className="border-b border-border py-8"
        title="Account"
        description="Manage your profile, billing, domains, and how Floras writes your sites."
      />

      <div className="mt-0 flex flex-col lg:mt-8 lg:flex-row lg:gap-10">
        <SettingsNav />
        <div className="mt-6 flex min-w-0 flex-1 flex-col gap-6 lg:mt-0">
          <ProfileForm />
          <BillingSection />
          <DomainsSection />
          <CustomInstructionsForm />
        </div>
      </div>
    </Container>
  );
}
