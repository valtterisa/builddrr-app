"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { asProjectId } from "@/lib/convex/ids";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  BillingGateModals,
  useBillingGates,
} from "@/components/billing/billing-gates";
import { PublishModal } from "@/components/workspace/publish-modal";
import { formatCredits } from "@/lib/billing/constants";
import { AppError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import type { DomainStatus, PublishStatus } from "@/lib/publish/types";
import type { WorkspaceProject } from "@/lib/types/user";

export function WorkspaceHeader({ projectId }: { projectId: string }) {
  const project = useQuery(api.projects.get, {
    projectId: asProjectId(projectId),
  }) as WorkspaceProject | null | undefined;

  const gates = useBillingGates();
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const awaitingResult = useRef(false);

  const name = project?.name;
  const boxId = project?.boxId;
  const publishStatus = (project?.publishStatus as PublishStatus | undefined) ?? "idle";
  const publishedUrl = project?.publishedUrl;
  const publishError = project?.publishError;
  const cfSubdomain = project?.cfSubdomain;
  const customDomain = project?.customDomain;
  const customDomainStatus = project?.customDomainStatus as
    | DomainStatus
    | undefined;

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
      setPublishOpen(true);
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

  const creditLabel = formatCredits(gates.balance);
  const isPublishing = publishing || publishStatus === "publishing";
  const isPublished = publishStatus === "published";
  const busy = isPublishing || unpublishing || exporting;
  const canOpenPublish = Boolean(boxId);

  async function handlePublish() {
    if (!boxId || busy) return;
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

  async function handleUnpublish() {
    if (!isPublished || busy) return;
    setUnpublishing(true);
    try {
      const res = await fetch("/api/publish", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) {
        toast.error((await AppError.fromResponse(res)).message);
        return;
      }
      setPublishOpen(false);
    } catch (error) {
      toast.error(AppError.from(error).message);
    } finally {
      setUnpublishing(false);
    }
  }

  async function handleExport() {
    if (!boxId || busy) return;
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) {
        toast.error((await AppError.fromResponse(res)).message);
        return;
      }

      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `${name ?? "site"}.zip`;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Project exported");
    } catch (error) {
      toast.error(AppError.from(error).message);
    } finally {
      setExporting(false);
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
          {gates.billingReady ? (
            <button
              type="button"
              onClick={() => {
                if (!gates.hasPaidPlan) gates.openUpgrade();
                else gates.openTopUp();
              }}
              className="inline-flex h-8 cursor-pointer items-center gap-2 border border-border bg-background px-2.5 transition-colors hover:bg-card"
              aria-label={
                !gates.hasPaidPlan
                  ? "Get Pro plan"
                  : `AI credit ${creditLabel}. Top up`
              }
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Credit
              </span>
              <span className="font-mono text-[11px] tabular-nums text-foreground">
                {!gates.hasPaidPlan ? "—" : creditLabel}
              </span>
            </button>
          ) : null}

          <button
            type="button"
            disabled={!canOpenPublish || unpublishing || exporting}
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
            ) : unpublishing ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span className="hidden sm:inline">Unpublishing</span>
              </>
            ) : exporting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span className="hidden sm:inline">Exporting</span>
              </>
            ) : isPublished ? (
              "Live"
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
        onUnpublish={() => void handleUnpublish()}
        onExport={() => void handleExport()}
        publishing={isPublishing}
        unpublishing={unpublishing}
        exporting={exporting}
        isPublished={isPublished}
        publishedUrl={publishedUrl}
        cfSubdomain={cfSubdomain}
        customDomain={customDomain}
        customDomainStatus={customDomainStatus}
      />
      <BillingGateModals
        upgradeOpen={gates.upgradeOpen}
        topUpOpen={gates.topUpOpen}
        onUpgradeOpenChange={gates.setUpgradeOpen}
        onTopUpOpenChange={gates.setTopUpOpen}
        onPurchased={() => void gates.refetch()}
      />
    </>
  );
}
