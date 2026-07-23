"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FLORAS_SITES_DOMAIN, type DomainStatus } from "@/lib/publish/types";
import { cn } from "@/lib/utils";

export type PublishModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  publishing: boolean;
  isPublished: boolean;
  publishedUrl?: string | null;
  cfSubdomain?: string | null;
  customDomain?: string | null;
  customDomainStatus?: DomainStatus | null;
};

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

export function PublishModal({
  open,
  onOpenChange,
  onConfirm,
  publishing,
  isPublished,
  publishedUrl,
  cfSubdomain,
  customDomain,
  customDomainStatus,
}: PublishModalProps) {
  const [copied, setCopied] = useState(false);

  const florasUrl =
    publishedUrl ?? (cfSubdomain ? `https://${cfSubdomain}` : null);
  const customActive =
    Boolean(customDomain) && customDomainStatus === "active"
      ? `https://${customDomain}`
      : null;
  const liveUrl = customActive ?? florasUrl;
  const pendingCustom =
    customDomain &&
    customDomainStatus &&
    customDomainStatus !== "active" &&
    customDomainStatus !== "deactivated"
      ? customDomain
      : null;

  async function copyUrl() {
    if (!liveUrl) return;
    await navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const facts = isPublished
    ? [
        "Anyone with the link can open this site",
        "Republish to replace the live build with this version",
      ]
    : [
        "Builds the site and puts it on the public web",
        `Includes a unique ${FLORAS_SITES_DOMAIN} address`,
        "Custom domains can be connected after publish",
      ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-none border-border p-0 sm:max-w-md">
        <div className="border-b border-border px-6 py-5 pr-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {isPublished ? "Live site" : "Go live"}
          </p>
          <DialogTitle className="mt-2 text-2xl font-semibold tracking-tight">
            {isPublished ? "Your site is live" : "Publish"}
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
            {isPublished
              ? "Open the public URL, or republish to push the latest version."
              : "Confirm where this site will live, then publish."}
          </DialogDescription>
        </div>

        <div className="border-b border-border px-6 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {liveUrl ? "Live URL" : "Your URL"}
          </p>
          {liveUrl ? (
            <div className="mt-2 flex items-start gap-2">
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 break-all font-mono text-sm text-foreground underline-offset-4 hover:underline"
              >
                {stripProtocol(liveUrl)}
              </a>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => void copyUrl()}
                  className="inline-flex size-8 cursor-pointer items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  aria-label="Copy URL"
                >
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  aria-label="Open live site"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-2 font-mono text-sm text-foreground">
              *.{FLORAS_SITES_DOMAIN}
            </p>
          )}
          {!liveUrl ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A unique address is assigned on first publish. You can connect your
              own domain afterward.
            </p>
          ) : null}
          {pendingCustom ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Custom domain pending:{" "}
              <span className="font-mono text-foreground">{pendingCustom}</span>
            </p>
          ) : null}
          {customActive && florasUrl ? (
            <p className="mt-3 truncate font-mono text-[11px] text-muted-foreground">
              Also at {stripProtocol(florasUrl)}
            </p>
          ) : null}
        </div>

        <ul>
          {facts.map((item) => (
            <li
              key={item}
              className="border-b border-border px-6 py-3 text-sm text-muted-foreground last:border-b-0"
            >
              {item}
            </li>
          ))}
          <li className="border-b border-border px-6 py-3 text-sm text-muted-foreground last:border-b-0">
            Manage domains in{" "}
            <Link
              href="/dashboard/account#domains"
              className="text-foreground underline-offset-4 hover:underline"
              onClick={() => onOpenChange(false)}
            >
              Account → Domains
            </Link>
          </li>
        </ul>

        <div className="border-t border-border p-0">
          {isPublished && liveUrl ? (
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 bg-brand px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-foreground transition-[filter] hover:brightness-110 active:scale-[0.99]"
              >
                <ExternalLink className="size-3.5" />
                Open site
              </a>
              <button
                type="button"
                onClick={onConfirm}
                disabled={publishing}
                className={cn(
                  "inline-flex h-12 cursor-pointer items-center justify-center gap-2 border-t border-border bg-background px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-card active:scale-[0.99] sm:border-t-0 sm:border-l",
                  "disabled:cursor-not-allowed disabled:opacity-40"
                )}
              >
                {publishing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  "Update live"
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={publishing}
              className={cn(
                "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-brand px-5 font-mono text-[11px] uppercase tracking-[0.14em] text-brand-foreground transition-[filter] active:scale-[0.99]",
                "hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
              )}
            >
              {publishing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Publishing…
                </>
              ) : (
                "Publish site"
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
