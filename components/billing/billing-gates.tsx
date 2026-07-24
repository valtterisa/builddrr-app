"use client";

import { useCallback, useState } from "react";
import { TopUpModal } from "@/components/billing/top-up-modal";
import { UpgradeProModal } from "@/components/billing/upgrade-pro-modal";
import { useGenerationAccess } from "@/lib/hooks/use-generation-access";

export function useBillingGates() {
  const access = useGenerationAccess();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  const allowOrPrompt = useCallback((): boolean => {
    const reason = access.getDenyReason();
    if (reason === "no_plan") {
      setUpgradeOpen(true);
      return false;
    }
    if (reason === "no_credits") {
      setTopUpOpen(true);
      return false;
    }
    return true;
  }, [access]);

  const handleDenyCode = useCallback((code: string | null | undefined): boolean => {
    if (code === "NO_PLAN") {
      setUpgradeOpen(true);
      return true;
    }
    if (code === "NO_CREDITS") {
      setTopUpOpen(true);
      return true;
    }
    return false;
  }, []);

  const openUpgrade = useCallback(() => setUpgradeOpen(true), []);
  const openTopUp = useCallback(() => setTopUpOpen(true), []);

  return {
    ...access,
    allowOrPrompt,
    handleDenyCode,
    openUpgrade,
    openTopUp,
    upgradeOpen,
    setUpgradeOpen,
    topUpOpen,
    setTopUpOpen,
  };
}

export function BillingGateModals({
  upgradeOpen,
  topUpOpen,
  onUpgradeOpenChange,
  onTopUpOpenChange,
  onPurchased,
}: {
  upgradeOpen: boolean;
  topUpOpen: boolean;
  onUpgradeOpenChange: (open: boolean) => void;
  onTopUpOpenChange: (open: boolean) => void;
  onPurchased?: () => void;
}) {
  return (
    <>
      <UpgradeProModal
        open={upgradeOpen}
        onOpenChange={onUpgradeOpenChange}
        onPurchased={onPurchased}
      />
      <TopUpModal
        open={topUpOpen}
        onOpenChange={onTopUpOpenChange}
        onPurchased={onPurchased}
      />
    </>
  );
}
