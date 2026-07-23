"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { TopUpModal } from "@/components/billing/top-up-modal";
import { UpgradeProModal } from "@/components/billing/upgrade-pro-modal";
import { PublishModal } from "@/components/workspace/publish-modal";
import { formatCredits } from "@/lib/billing/constants";
import { AppError } from "@/lib/errors";
import { useGenerationAccess } from "@/lib/hooks/use-generation-access";
import { cn } from "@/lib/utils";
import type { DomainStatus, PublishStatus } from "@/lib/publish/types";

export function WorkspaceHeader({
  projectId,
  name,
  boxId,
  publishStatus,
  publishedUrl,
  publishError,
  cfSubdomain,
  customDomain,
  customDomainStatus,
}: {
  projectId: string;
  name?: string;
  boxId?: string;
  publishStatus?: PublishStatus | null;
  publishedUrl?: string | null;
  publishError?: string | null;
  cfSubdomain?: string | null;
  customDomain?: string | null;
  customDomainStatus?: DomainStatus | null;
}) {
  const { balance, hasPaidPlan, billingReady, refetch } = useGenerationAccess();
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const awaitingResult = useRef(false);

  useEffect(() => {
    if (!awaitingResult.current) {
      if (
        publishStatus === "published" ||
        publishStatus === "error" ||
        publishStatus === "idle"
      ) {
        setPublishing(false);
      }
      return;
    }

    if (publishStatus === "published") {
      awaitingResult.current = false;
      setPublishing(false);
      setPublishOpen(false);
      toast.success("Site published.");
      return;
    }

    if (publishStatus === "error") {
      awaitingResult.current = false;
      setPublishing(false);
      toast.error(
        AppError.from({ error: publishError, code: "publish" }).message
      );
      return;
    }

    if (publishStatus === "idle") {
      awaitingResult.current = false;
      setPublishing(false);
    }
  }, [publishStatus, publishError]);

  const creditLabel = formatCredits(balance);
  const isPublishing = publishing || publishStatus === "publishing";
  const isPublished = publishStatus === "published";
  const canOpenPublish = Boolean(boxId);

  async function handlePublish() {
    if (!boxId || isPublishing) return;
    setPublishing(true);
    awaitingResult.current = true;
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) {
        awaitingResult.current = false;
        setPublishing(false);
        toast.error((await AppError.fromResponse(res)).message);
      }
    } catch (error) {
      awaitingResult.current = false;
      setPublishing(false);
      toast.error(AppError.from(error).message);
    }
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" size="icon-sm" className="shrink-0">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to dashboard</span>
            </Link>
          </Button>
          <Logo />
          <span className="hidden truncate text-sm text-muted-foreground sm:inline">
            / {name ?? "…"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {billingReady ? (
            <button
              type="button"
              onClick={() => {
                if (!hasPaidPlan) setUpgradeOpen(true);
                else setTopUpOpen(true);
              }}
              className="inline-flex h-8 cursor-pointer items-center gap-2 border border-border bg-background px-2.5 transition-colors hover:bg-card"
              aria-label={
                !hasPaidPlan
                  ? "Get Pro plan"
                  : `AI credit ${creditLabel}. Top up`
              }
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Credit
              </span>
              <span className="font-mono text-[11px] tabular-nums text-foreground">
                {!hasPaidPlan ? "—" : creditLabel}
              </span>
            </button>
          ) : null}

          <button
            type="button"
            disabled={!canOpenPublish}
            onClick={() => setPublishOpen(true)}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 bg-brand px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-foreground transition-[filter,transform] hover:brightness-110 active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
            )}
          >
            {isPublishing ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span className="hidden sm:inline">Publishing</span>
              </>
            ) : isPublished ? (
              "Republish"
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </header>

      <PublishModal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        onConfirm={() => void handlePublish()}
        publishing={isPublishing}
        isPublished={isPublished}
        publishedUrl={publishedUrl}
        cfSubdomain={cfSubdomain}
        customDomain={customDomain}
        customDomainStatus={customDomainStatus}
      />
      <UpgradeProModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        onPurchased={() => void refetch()}
      />
      <TopUpModal
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        onPurchased={() => void refetch()}
      />
    </>
  );
}
